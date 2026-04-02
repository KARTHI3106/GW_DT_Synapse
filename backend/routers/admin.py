from collections import defaultdict
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter

from db.supabase import get_supabase

router = APIRouter()


@router.get("/claims-forecast")
async def get_claims_forecast():
    """7-day rolling claims forecast based on historical trigger patterns."""
    supabase = get_supabase()
    now = datetime.now(timezone.utc)
    seven_days_ago = (now - timedelta(days=7)).isoformat()

    claims_result = (
        supabase.table("claims")
        .select("created_at, payout_amount, status, trigger_type")
        .gte("created_at", seven_days_ago)
        .execute()
    )
    claims = claims_result.data or []

    by_day: dict[str, dict] = defaultdict(lambda: {"count": 0, "payout": 0, "approved": 0})
    for claim in claims:
        day = claim["created_at"][:10]
        by_day[day]["count"] += 1
        by_day[day]["payout"] += claim["payout_amount"]
        if claim["status"] in ("approved", "paid"):
            by_day[day]["approved"] += 1

    return {
        "period_days": 7,
        "total_claims": len(claims),
        "total_payout": sum(c["payout_amount"] for c in claims if c["status"] in ("approved", "paid")),
        "by_trigger": _group_by_trigger(claims),
        "daily": [{"date": k, **v} for k, v in sorted(by_day.items())],
    }


@router.get("/fraud-heatmap")
async def get_fraud_heatmap():
    """Return fraud risk scores per zone for Leaflet.js map."""
    supabase = get_supabase()
    zones_result = supabase.table("disruption_zones").select("*").execute()
    zones = zones_result.data or []

    # Augment with recent claim fraud scores
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    claims_result = (
        supabase.table("claims")
        .select("fraud_score, worker_id")
        .gte("created_at", week_ago)
        .execute()
    )

    heatmap = []
    for zone in zones:
        heatmap.append({
            "zone_id": zone["id"],
            "zone_name": zone["zone_name"],
            "city": zone["city"],
            "lat": zone["lat"],
            "lon": zone["lon"],
            "flood_risk": zone["flood_risk_score"],
            "aqi_risk": zone["aqi_risk_score"],
            "combined_risk": round((zone["flood_risk_score"] + zone["aqi_risk_score"]) / 2, 2),
        })

    return heatmap


@router.get("/reserves")
async def get_reserve_status():
    """Reserve fund status with traffic-light recommendation."""
    supabase = get_supabase()

    # Count active policies
    policies_result = supabase.table("policies").select("weekly_premium", count="exact").eq("status", "active").execute()
    active_count = policies_result.count or 0
    premium_pool = sum(p["weekly_premium"] for p in (policies_result.data or []))

    # Total pending/approved payouts
    payouts_result = (
        supabase.table("claims")
        .select("payout_amount")
        .in_("status", ["approved", "pending"])
        .execute()
    )
    pending_payout = sum(c["payout_amount"] for c in (payouts_result.data or []))

    # Reserve ratio: >2x = green, 1-2x = amber, <1x = red
    ratio = premium_pool / max(pending_payout, 1)
    if ratio >= 2.0:
        signal = "green"
        recommendation = f"Reserves healthy. Rs.{premium_pool:,} collected vs Rs.{pending_payout:,} pending."
    elif ratio >= 1.0:
        signal = "amber"
        recommendation = f"Reserves adequate but watch closely. Ratio: {ratio:.1f}x"
    else:
        signal = "red"
        recommendation = f"ALERT: Pending payouts exceed reserves! Add Rs.{pending_payout - premium_pool:,} to maintain solvency."

    return {
        "active_policies": active_count,
        "weekly_premium_pool": premium_pool,
        "pending_payout_liability": pending_payout,
        "reserve_ratio": round(ratio, 2),
        "signal": signal,
        "recommendation": recommendation,
    }


def _group_by_trigger(claims: list[dict]) -> dict:
    groups: dict[str, dict] = defaultdict(lambda: {"count": 0, "total_payout": 0})
    for c in claims:
        t = c["trigger_type"]
        groups[t]["count"] += 1
        if c["status"] in ("approved", "paid"):
            groups[t]["total_payout"] += c["payout_amount"]
    return dict(groups)
