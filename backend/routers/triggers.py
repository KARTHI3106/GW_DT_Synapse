import hashlib
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import httpx
from config import settings
from db.supabase import get_supabase
from routers.claims import auto_create_claim

router = APIRouter()

# Trigger thresholds
RAIN_MM_THRESHOLD = 15        # mm in 3 hours
HEAT_CELSIUS_THRESHOLD = 40   # degrees C
AQI_THRESHOLD = 200           # AQI index
COMPOUND_SCORE_THRESHOLD = 1.5  # combined score

# City coordinates for weather API
CITY_COORDS = {
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.6139, 77.2090),
    "Bengaluru": (12.9716, 77.5946),
}


async def fetch_weather(city: str) -> dict:
    """Fetch real weather from OpenWeatherMap One Call 3.0."""
    lat, lon = CITY_COORDS[city]
    url = (
        f"https://api.openweathermap.org/data/3.0/onecall"
        f"?lat={lat}&lon={lon}&appid={settings.openweathermap_api_key}"
        f"&units=metric&exclude=minutely,hourly,daily,alerts"
    )
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()


async def fetch_aqi(city: str) -> float:
    """Fetch real AQI from WAQI API."""
    city_slug = {"Mumbai": "mumbai", "Delhi": "delhi", "Bengaluru": "bengaluru"}[city]
    url = f"https://api.waqi.info/feed/{city_slug}/?token={settings.waqi_token}"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        data = r.json()
        if data.get("status") == "ok":
            return float(data["data"]["aqi"])
    return 50.0  # safe default if API fails


def evaluate_triggers(weather: dict, aqi: float) -> list[dict]:
    """Evaluate all parametric triggers against live data."""
    triggered = []
    current = weather.get("current", {})

    rain_1h = current.get("rain", {}).get("1h", 0)
    temp = current.get("temp", 25)

    # Trigger 1: Heavy Rain (>15mm in 1h)
    if rain_1h >= RAIN_MM_THRESHOLD:
        triggered.append({
            "trigger_type": "heavy_rainfall",
            "intensity_value": rain_1h,
            "source_api": "OpenWeatherMap",
            "payout_amount": 300,
        })

    # Trigger 2: Extreme Heat (>40°C)
    if temp >= HEAT_CELSIUS_THRESHOLD:
        triggered.append({
            "trigger_type": "extreme_heat",
            "intensity_value": temp,
            "source_api": "OpenWeatherMap",
            "payout_amount": 360,
        })

    # Trigger 3: Severe AQI (>200)
    if aqi >= AQI_THRESHOLD:
        triggered.append({
            "trigger_type": "severe_aqi",
            "intensity_value": aqi,
            "source_api": "WAQI",
            "payout_amount": 240,
        })

    # Trigger 5: Compound Disruption Score
    compound_score = (rain_1h / RAIN_MM_THRESHOLD) + ((aqi - 150) / 200)
    if compound_score >= COMPOUND_SCORE_THRESHOLD and len(triggered) >= 2:
        triggered.append({
            "trigger_type": "compound_disruption",
            "intensity_value": round(compound_score, 2),
            "source_api": "GigShield ML",
            "payout_amount": 300,
        })

    return triggered


@router.get("/check")
async def check_triggers():
    """Check all live triggers across all monitored cities."""
    supabase = get_supabase()
    results = {}

    for city in CITY_COORDS:
        try:
            weather = await fetch_weather(city)
            aqi = await fetch_aqi(city)
            triggers = evaluate_triggers(weather, aqi)
            results[city] = {
                "triggers": triggers,
                "current_temp_c": weather.get("current", {}).get("temp"),
                "rain_1h_mm": weather.get("current", {}).get("rain", {}).get("1h", 0),
                "aqi": aqi,
            }
        except Exception as e:
            results[city] = {"error": str(e), "triggers": []}

    return results


class FireTriggerRequest(BaseModel):
    trigger_type: str
    city: str
    zone: Optional[str] = None
    intensity_value: float
    source_api: str = "Manual/Admin"


@router.post("/fire")
async def fire_trigger(body: FireTriggerRequest):
    """
    Fire a trigger manually (admin or test).
    Creates trigger_event and auto-creates claims for all affected workers.
    [MOCK/SIMULATED] Trigger 4 (Bandh) always uses this endpoint with mock data.
    """
    supabase = get_supabase()

    # Deduplicate: hash of type + city + date
    event_hash = hashlib.sha256(
        f"{body.trigger_type}:{body.city}:{datetime.now(timezone.utc).date().isoformat()}".encode()
    ).hexdigest()[:16]

    # Check if already triggered today
    existing = supabase.table("trigger_events").select("id").eq("event_hash", event_hash).execute()
    if existing.data:
        return {"message": "Trigger already fired today", "event_hash": event_hash}

    # Store trigger event
    event_data = {
        "trigger_type": body.trigger_type,
        "city": body.city,
        "zone_id": None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "duration_hours": 3,
        "intensity_value": body.intensity_value,
        "source_api": body.source_api,
        "event_hash": event_hash,
    }
    event_result = supabase.table("trigger_events").insert(event_data).execute()
    trigger_event = event_result.data[0] if event_result.data else {}

    # Get all active workers in the city
    workers_result = (
        supabase.table("workers")
        .select("id, worker_id, city, zone")
        .eq("city", body.city)
        .execute()
    )
    workers = workers_result.data or []
    if body.zone:
        workers = [w for w in workers if w["zone"] == body.zone]

    # Auto-create claims for each worker
    claims_created = 0
    claims_skipped = 0
    for worker in workers:
        r = await auto_create_claim({
            "worker_id": worker["id"],
            "trigger_type": body.trigger_type,
            "trigger_event_id": trigger_event.get("id"),
            "trigger_timestamp": datetime.now(timezone.utc).isoformat(),
        })
        if r.get("skipped"):
            claims_skipped += 1
        else:
            claims_created += 1

    return {
        "trigger_event": trigger_event,
        "workers_affected": len(workers),
        "claims_created": claims_created,
        "claims_skipped": claims_skipped,
        "event_hash": event_hash,
    }


@router.get("/history")
async def get_trigger_history(zone_id: Optional[str] = None, city: Optional[str] = None):
    supabase = get_supabase()
    query = supabase.table("trigger_events").select("*").order("timestamp", desc=True).limit(50)
    if city:
        query = query.eq("city", city)
    result = query.execute()
    return result.data or []
