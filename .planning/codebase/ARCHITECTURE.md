# Architecture

## System Overview

GigShield is a **parametric micro-insurance platform** for gig delivery workers (Swiggy/Zomato) in Indian cities. It monitors weather/AQI conditions, fires claims automatically when thresholds are breached, and uses ML-based dynamic premium pricing.

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│  Landing → Register → Dashboard → Admin             │
│  Port 3000 (proxies /api/v1/* to backend)           │
└────────────────────┬────────────────────────────────┘
                     │ HTTP REST
┌────────────────────▼────────────────────────────────┐
│                   Backend (FastAPI)                  │
│  6 routers: workers, policies, premiums,            │
│             claims, triggers, admin                 │
│  Port 8000                                          │
├─────────────┬───────────────┬───────────────────────┤
│  ML Engine  │  Services     │  External APIs        │
│  XGBoost    │  PolicySvc    │  OpenWeatherMap       │
│  (premium   │  (policy      │  WAQI                 │
│   pricing)  │   lifecycle)  │  Razorpay (planned)   │
└──────┬──────┴───────┬───────┴───────────────────────┘
       │              │
┌──────▼──────────────▼───────────────────────────────┐
│                 Supabase (PostgreSQL)                │
│  workers, policies, claims, premium_history,        │
│  disruption_zones, trigger_events, fraud_flags      │
└─────────────────────────────────────────────────────┘
```

## Architecture Pattern

**Layered monolith** with clear separation:

1. **Routers** (`backend/routers/`) — HTTP request handling, validation via Pydantic models
2. **Services** (`backend/services/`) — Business logic (currently only `policy_service.py`)
3. **ML** (`backend/ml/`) — XGBoost model training, inference, synthetic data generation
4. **DB** (`backend/db/`) — Supabase client singleton, SQL schema
5. **Config** (`backend/config.py`) — Centralized env-based settings

The frontend is a standard Next.js App Router application with:
1. **Pages** (`frontend/app/`) — Server and client components
2. **Components** (`frontend/components/`) — Reusable UI components
3. **Lib** (`frontend/lib/`) — API client, utilities, data constants

## Data Flow: Worker Registration

```
User fills form → POST /api/v1/workers/register
  → Validate input (Pydantic)
  → Hash phone (SHA256)
  → Lookup zone risk scores (disruption_zones table)
  → Calculate premium (XGBoost or rule-based fallback)
  → Insert worker record
  → Auto-create policy (PolicyService)
  → Record premium history
  → Return worker ID + policy number + premium
```

## Data Flow: Parametric Trigger → Auto-Claim

```
GET /api/v1/triggers/check (or POST /triggers/fire for manual)
  → Fetch live weather (OpenWeatherMap) + AQI (WAQI)
  → Evaluate 5 trigger types against thresholds
  → If triggered:
    → Create trigger_event (with dedup hash)
    → Find all workers in affected city/zone
    → For each worker with active policy:
      → Auto-create claim (max 2/week cap)
      → Simplified fraud score (random, real Isolation Forest planned)
      → Status: approved if fraud_score < 0.7, else flagged
```

## Key Design Decisions

1. **XGBoost with rule-based fallback**: `backend/ml/premium_calculator.py` loads the trained model at startup; if the model file is missing, it falls back to a deterministic rule-based multiplier. Both produce the same output shape.

2. **Affordability cap**: Premium is capped at 3% of weekly earnings, with a floor of Rs.80 and ceiling of Rs.318 (2x base).

3. **Weekly policy cycle**: Policies auto-expire after 7 days. Renewal extends by another 7 days.

4. **Event deduplication**: Trigger events use SHA256 hash of `type + city + date` to prevent duplicate triggers on the same day.

5. **Phone hashing**: Worker phone numbers are stored as SHA256 hashes for privacy.

## Entry Points

| Entry Point | File |
|------------|------|
| Backend API | `backend/main.py` |
| Frontend app | `frontend/app/layout.tsx` → `frontend/app/page.tsx` |
| ML training | `backend/ml/train_premium_model.py` (CLI: `python ml/train_premium_model.py`) |
| Data generation | `backend/ml/generate_synthetic_data.py` (CLI: `python generate_synthetic_data.py`) |
