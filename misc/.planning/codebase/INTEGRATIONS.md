# Integrations

## Database — Supabase (PostgreSQL)

- **Client**: `backend/db/supabase.py` — singleton via `lru_cache`, creates `supabase.Client`
- **Schema**: `backend/db/schema.sql` — 7 tables (workers, policies, claims, premium_history, disruption_zones, trigger_events, fraud_flags)
- **Seed data**: `backend/db/zones_seed.sql` — 15 disruption zones across Mumbai, Delhi, Bengaluru
- **Access pattern**: All routers call `get_supabase()` and use the Supabase Python SDK's `.table().select().eq()` chainable API
- **Auth**: Not used. No Supabase Auth, no RLS policies defined in schema.

## Weather API — OpenWeatherMap

- **Endpoint**: `https://api.openweathermap.org/data/3.0/onecall` (One Call 3.0)
- **Used in**: `backend/routers/triggers.py` → `fetch_weather(city)`
- **Data consumed**: `current.rain.1h` (mm), `current.temp` (Celsius)
- **Auth**: API key via `settings.openweathermap_api_key`
- **Trigger thresholds**: Rain >= 15mm/hr, Temperature >= 40C

## Air Quality — WAQI (World AQI)

- **Endpoint**: `https://api.waqi.info/feed/{city}/?token={token}`
- **Used in**: `backend/routers/triggers.py` → `fetch_aqi(city)`
- **Data consumed**: `data.aqi` (numeric AQI index)
- **Auth**: Token via `settings.waqi_token`
- **Trigger threshold**: AQI >= 200
- **Fallback**: Returns 50.0 if API fails

## Payment — Razorpay (Planned, Not Implemented)

- **Env vars defined**: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` in `config.py`
- **Current state**: Not integrated. Claims are created and approved but payout is simulated.
- `claims.transaction_id` field exists in schema for Razorpay payout IDs but is never populated.

## Frontend API Proxy

- `frontend/next.config.js` rewrites `/api/v1/*` to backend at `NEXT_PUBLIC_API_URL`
- `frontend/lib/api.ts` — typed API client with namespace exports: `workersApi`, `policiesApi`, `premiumsApi`, `claimsApi`, `triggersApi`, `adminApi`
- Dashboard page (`frontend/app/dashboard/page.tsx`) uses direct `fetch()` calls instead of the API client (inconsistency)

## Guidewire Integration Points (Simulated)

The codebase simulates Guidewire InsuranceSuite integration with mock annotations:

| Guidewire Component | Simulated In | Mock Annotation |
|---------------------|-------------|-----------------|
| PolicyCenter        | `backend/services/policy_service.py`, `backend/routers/policies.py` | `[MOCK/SIMULATED]` — policy creation, renewal |
| ClaimCenter         | `backend/routers/claims.py` | `[MOCK/SIMULATED]` — FNOL (First Notice of Loss) |
| BillingCenter       | `backend/routers/policies.py` | `[MOCK/SIMULATED]` — renewal billing |

Production endpoints are documented in docstrings (e.g., `POST https://guidewire-instance.com/pc/rest/v1/policies`).
