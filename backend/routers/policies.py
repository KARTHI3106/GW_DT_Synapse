import random
import string
from datetime import date, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.supabase import get_supabase

router = APIRouter()

CITY_CODES = {"Mumbai": "MUM", "Delhi": "DEL", "Bengaluru": "BLR"}


def generate_policy_number(city: str) -> str:
    year = date.today().year
    city_code = CITY_CODES.get(city, "IND")
    suffix = "".join(random.choices(string.digits, k=6))
    return f"GS-{year}-{city_code}-{suffix}"


async def create_policy_for_worker(
    worker_id: str, worker_city: str, weekly_premium: int, coverage_amount: int, supabase
) -> dict:
    """
    Auto-create policy on worker registration.
    [MOCK/SIMULATED] Simulates Guidewire PolicyCenter policy lifecycle.
    Production: POST https://guidewire-instance.com/pc/rest/v1/policies
    """
    today = date.today()
    policy_data = {
        "policy_number": generate_policy_number(worker_city),
        "worker_id": worker_id,
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(days=7)).isoformat(),
        "status": "active",
        "weekly_premium": weekly_premium,
        "coverage_amount": coverage_amount,
    }
    result = supabase.table("policies").insert(policy_data).execute()
    if not result.data:
        raise RuntimeError("Failed to create policy")
    return result.data[0]


router_policies = APIRouter()


@router_policies.get("/{worker_id}")
async def get_policy(worker_id: str):
    supabase = get_supabase()
    # First resolve UUID from worker_id string
    worker_result = supabase.table("workers").select("id, name, city, zone").eq("worker_id", worker_id).execute()
    if not worker_result.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    worker = worker_result.data[0]

    policy_result = (
        supabase.table("policies")
        .select("*")
        .eq("worker_id", worker["id"])
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not policy_result.data:
        raise HTTPException(status_code=404, detail="No policy found")

    policy = policy_result.data[0]

    # Count claims
    claims_result = (
        supabase.table("claims")
        .select("id, payout_amount, status", count="exact")
        .eq("policy_id", policy["id"])
        .execute()
    )
    policy["claims_count"] = claims_result.count or 0
    policy["total_payout"] = sum(c["payout_amount"] for c in (claims_result.data or []) if c["status"] == "paid")
    policy["worker_name"] = worker["name"]
    policy["worker_city"] = worker["city"]
    policy["worker_zone"] = worker["zone"]
    return policy


@router_policies.post("/{policy_id}/renew")
async def renew_policy(policy_id: str):
    """[MOCK/SIMULATED] Simulates Guidewire BillingCenter renewal."""
    supabase = get_supabase()
    today = date.today()
    result = (
        supabase.table("policies")
        .update({"end_date": (today + timedelta(days=7)).isoformat(), "status": "active"})
        .eq("id", policy_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"message": "Policy renewed for another week", "policy": result.data[0]}


@router_policies.post("/{policy_id}/pause")
async def pause_policy(policy_id: str):
    supabase = get_supabase()
    result = supabase.table("policies").update({"status": "paused"}).eq("id", policy_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"message": "Policy paused", "policy": result.data[0]}


@router_policies.post("/{policy_id}/resume")
async def resume_policy(policy_id: str):
    supabase = get_supabase()
    result = supabase.table("policies").update({"status": "active"}).eq("id", policy_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"message": "Policy resumed", "policy": result.data[0]}


# Export the policies router
router = router_policies
