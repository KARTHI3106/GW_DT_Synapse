import random
import hashlib
from datetime import date
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.supabase import get_supabase

router = APIRouter()

# Trigger payout amounts (Rs.)
TRIGGER_PAYOUTS = {
    "heavy_rainfall": 300,
    "extreme_heat": 360,
    "severe_aqi": 240,
    "government_bandh": 480,
    "compound_disruption": 300,
}


@router.get("/{worker_id}")
async def get_claims(worker_id: str):
    supabase = get_supabase()
    worker_result = supabase.table("workers").select("id").eq("worker_id", worker_id).execute()
    if not worker_result.data:
        raise HTTPException(status_code=404, detail="Worker not found")

    claims_result = (
        supabase.table("claims")
        .select("*")
        .eq("worker_id", worker_result.data[0]["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return claims_result.data or []


@router.post("/auto-create")
async def auto_create_claim(body: dict):
    """
    Auto-create claim from trigger event.
    [MOCK/SIMULATED] Simulates Guidewire ClaimCenter FNOL.
    Production: POST https://guidewire-instance.com/cc/rest/v1/claims
    """
    supabase = get_supabase()
    worker_id = body.get("worker_id")
    trigger_type = body.get("trigger_type")
    trigger_event_id = body.get("trigger_event_id")

    if not all([worker_id, trigger_type]):
        raise HTTPException(status_code=400, detail="worker_id and trigger_type required")

    # Get worker
    worker_result = supabase.table("workers").select("*").eq("id", worker_id).execute()
    if not worker_result.data:
        raise HTTPException(status_code=404, detail="Worker not found")

    # Get active policy
    policy_result = (
        supabase.table("policies")
        .select("*")
        .eq("worker_id", worker_id)
        .eq("status", "active")
        .execute()
    )
    if not policy_result.data:
        return {"skipped": True, "reason": "No active policy"}

    policy = policy_result.data[0]

    # Cap check: max 2 payouts per week
    week_claims = (
        supabase.table("claims")
        .select("id", count="exact")
        .eq("worker_id", worker_id)
        .eq("policy_id", policy["id"])
        .in_("status", ["approved", "paid"])
        .execute()
    )
    if (week_claims.count or 0) >= 2:
        return {"skipped": True, "reason": "Weekly payout cap reached (max 2)"}

    payout_amount = TRIGGER_PAYOUTS.get(trigger_type, 300)

    # Duplicate prevention: hash of trigger_type + worker_id + policy_id
    claim_hash = hashlib.sha256(
        f"{trigger_type}:{worker_id}:{policy['id']}:{date.today().isoformat()}".encode()
    ).hexdigest()[:12]
    claim_number = f"CL-{date.today().year}-{trigger_type[:3].upper()}-{claim_hash.upper()}"

    # Fraud score (simplified — real Isolation Forest runs in fraud_detection.py)
    fraud_score = round(random.uniform(0.05, 0.25), 2)
    status = "approved" if fraud_score < 0.7 else "flagged"

    claim_data = {
        "claim_number": claim_number,
        "worker_id": worker_id,
        "policy_id": policy["id"],
        "trigger_type": trigger_type,
        "trigger_timestamp": body.get("trigger_timestamp", date.today().isoformat()),
        "payout_amount": payout_amount,
        "status": status,
        "fraud_score": fraud_score,
    }

    result = supabase.table("claims").insert(claim_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create claim")

    return {
        "claim": result.data[0],
        "approved": status == "approved",
        "payout_amount": payout_amount,
        "fraud_score": fraud_score,
    }


@router.get("/{claim_id}/detail")
async def get_claim_detail(claim_id: str):
    supabase = get_supabase()
    result = supabase.table("claims").select("*").eq("id", claim_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim = result.data[0]

    # Get fraud flags
    flags_result = supabase.table("fraud_flags").select("*").eq("claim_id", claim_id).execute()
    claim["fraud_flags"] = flags_result.data or []
    return claim
