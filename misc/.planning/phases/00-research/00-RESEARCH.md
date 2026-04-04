# GigShield End-to-End Implementation Research

## Current State Assessment

### What Already Exists (Built)
| Component | Status | Quality |
|-----------|--------|---------|
| FastAPI backend scaffold | Done | Good - 6 routers, config, DB client |
| Worker registration endpoint | Done | Working - validates, hashes phone, calculates premium |
| XGBoost premium calculator | Done | Working with rule-based fallback |
| Supabase DB schema | Done | 7 tables, indexes, seed data ready |
| Next.js 14 frontend scaffold | Done | App Router, dark theme, design system |
| Landing page | Done | Polished with animations |
| Registration form | Done | Multi-step with live premium preview |
| Worker dashboard | Done | Policy card, claims timeline, conditions panel |
| Premium breakdown component | Done | Visual factor bars |
| Policy card component | Done | Status, renew/pause/resume actions |
| API client library | Done | Typed namespaced client |
| Design system (Tailwind tokens) | Done | Colors, shadows, animations |
| Guidewire badge component | Done | Branding indicator |

### What's Missing (Must Build)
| Component | Priority | Complexity | Est. Hours |
|-----------|----------|------------|------------|
| Admin dashboard page | P1 | Medium | 3-4h |
| Fraud detection (Isolation Forest) | P0 | Medium | 2-3h |
| Razorpay payout simulation | P1 | Low | 1-2h |
| Compound disruption score trigger | P0 | Medium | 2h |
| Claims forecast API (7-day) | P1 | Medium | 2h |
| Fraud heatmap (Leaflet.js) | P1 | Medium | 3h |
| Reserve recommendations panel | P1 | Low | 1h |
| Seed mock workers (demo data) | P0 | Low | 1h |
| "Fire trigger" admin UI button | P0 | Low | 1h |
| Training the XGBoost model file | P0 | Low | 0.5h |

### What Needs Fixing (Existing Code Issues)
| Issue | Severity | Fix |
|-------|----------|-----|
| Dashboard uses raw `fetch()` instead of `api.ts` client | Low | Refactor to use `policiesApi`, `claimsApi`, etc. |
| Fraud score is `random.uniform(0.05, 0.25)` | High | Replace with Isolation Forest inference |
| Duplicate policy creation code in `policies.py` vs `policy_service.py` | Medium | Remove dead code from `policies.py` |
| Admin page `/admin` directory is empty | High | Build admin dashboard |
| Next.js API routes (6 empty dirs in `app/api/`) | Low | Remove or implement - proxy via `next.config.js` already works |
| CORS set to `allow_origins=["*"]` | Medium | Fine for hackathon, document for production |

---

## Standard Stack

Use these exact libraries. Do not substitute.

### Backend
| Purpose | Library | Why |
|---------|---------|-----|
| API framework | FastAPI 0.109.0 | Already in use, async-first |
| DB client | supabase 2.3.0 | Already configured, singleton pattern |
| ML pricing | xgboost 2.0.3 | Already trained/training pipeline ready |
| Fraud detection | scikit-learn 1.4.0 IsolationForest | Unsupervised, no labeled data needed |
| HTTP client | httpx | Already used for weather/AQI calls |
| Model serialization | joblib 1.3.2 | Already in requirements |
| Payment | razorpay (pip install) | Official Python SDK, test mode |

### Frontend
| Purpose | Library | Why |
|---------|---------|-----|
| Framework | Next.js 14.1.0 | Already configured with App Router |
| Charts | recharts 2.10.3 | Already in dependencies, for forecast chart |
| Maps | leaflet 1.9.4 + react-leaflet 4.2.1 | Already in dependencies, for heatmap |
| Heatmap layer | leaflet.heat (npm install) | Lightweight plugin for Leaflet heatmaps |
| Animation | framer-motion 11.0.3 | Already configured |
| Icons | lucide-react 0.323.0 | Already used throughout |

### New Dependencies to Install
```bash
# Backend - add to requirements.txt
razorpay

# Frontend - add to package.json
leaflet.heat
```

---

## Architecture Patterns

### Backend: Router-Service-ML Layered Pattern
```
Request → Router (validation, HTTP) → Service (business logic) → ML/DB (data)
```

Each router should:
1. Define Pydantic models at the top of the file
2. Validate input via Pydantic
3. Call service functions for business logic
4. Return structured responses

### Frontend: Page-Component-Lib Pattern
```
Page (data fetching, layout) → Components (UI, state) → Lib (API calls, utils)
```

Each page should:
1. Use `'use client'` only when needed (interactivity)
2. Fetch data via `lib/api.ts` (not raw fetch)
3. Handle loading/error states with skeleton components

### Admin Dashboard: Dynamic Import Pattern
```tsx
// Leaflet must be dynamically imported in Next.js (no SSR)
const FraudHeatmap = dynamic(() => import('@/components/fraud-heatmap'), { ssr: false })
```

### Fraud Detection: Fit-Once, Score-Per-Claim Pattern
```python
# At server startup (or first claim)
model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
model.fit(historical_claims_features)

# Per claim
score = model.decision_function(claim_features)  # Lower = more anomalous
```

---

## Don't Hand-Roll

| Problem | Use Instead |
|---------|-------------|
| Fraud anomaly scoring | `sklearn.ensemble.IsolationForest.decision_function()` |
| Premium ML model | XGBoost `.predict()` on trained model (already done) |
| Heatmap rendering | `leaflet.heat` plugin with `react-leaflet` wrapper |
| Chart rendering | `recharts` BarChart/LineChart components |
| UPI payout simulation | Razorpay Python SDK `client.payout.create()` |
| Class merging | `cn()` utility (already done via `clsx` + `tailwind-merge`) |
| Component variants | `cva()` from `class-variance-authority` (already done) |
| API proxy | Next.js `rewrites` in `next.config.js` (already done) |

---

## Common Pitfalls

### 1. Leaflet + Next.js SSR Crash
Leaflet accesses `window` on import, which crashes during server-side rendering.
**Fix:** Always use `dynamic(() => import(...), { ssr: false })` for any Leaflet component.

### 2. OpenWeatherMap One Call 3.0 Requires Subscription
Even for the free tier, you must explicitly subscribe to "One Call 3.0" on the OpenWeatherMap pricing page. The default free account does NOT include One Call.
**Fix:** Subscribe at https://openweathermap.org/price → One Call 3.0 → tap "Get API key". Add billing info (won't charge under 1000 calls/day).

### 3. Razorpay RazorpayX vs Razorpay Payment Gateway
Standard Razorpay SDK handles *receiving* payments. *Sending* payouts (UPI disbursement) requires **RazorpayX** API.
**Fix:** For hackathon, simulate the payout flow by creating a mock payout response. Razorpay test mode works but requires RazorpayX account activation which may take time.
**Alternative:** Generate realistic-looking payout responses without actual API calls. Store `transaction_id` as `SIM-{uuid}` in the claims table.

### 4. IsolationForest Needs at Least ~50 Samples
With zero claims, the model cannot fit.
**Fix:** Seed 50+ synthetic claim records before the demo. Alternatively, skip Isolation Forest until sufficient data exists and use rule-based scoring (which already works).

### 5. WAQI API City Name Format
WAQI expects city names in a specific format (e.g., "mumbai", "delhi", "bangalore" - note lowercase and "bangalore" not "bengaluru").
**Fix:** Map display city names to WAQI slugs: `{"Mumbai": "mumbai", "Delhi": "delhi", "Bengaluru": "bangalore"}`.

### 6. Supabase Free Tier Connection Limits
Supabase free tier allows 2 direct connections but up to 200 pooled connections via Supavisor.
**Fix:** Use the pooled connection string (port 6543) in production. For hackathon, the current singleton pattern with the Supabase JS/Python SDK is sufficient.

### 7. XGBoost Model File Not Committed
The trained model (`.json` or `.pkl`) may not be in the repository. The rule-based fallback works, but judges will ask about the ML.
**Fix:** Run `python ml/train_premium_model.py` to generate `backend/ml/models/premium_xgboost.json` and commit it.

---

## Code Examples

### Isolation Forest Fraud Detection
```python
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import numpy as np

class FraudDetector:
    def __init__(self):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            random_state=42
        )
        self.scaler = StandardScaler()
        self._fitted = False

    def fit(self, claims_data: list[dict]):
        features = self._extract_features(claims_data)
        if len(features) < 10:
            return  # Not enough data
        scaled = self.scaler.fit_transform(features)
        self.model.fit(scaled)
        self._fitted = True

    def score_claim(self, claim: dict, zone_claims: list[dict]) -> float:
        if not self._fitted:
            return 0.15  # Default low-risk score

        features = self._extract_single_features(claim, zone_claims)
        scaled = self.scaler.transform([features])
        raw_score = self.model.decision_function(scaled)[0]
        # Normalize to 0-1 range (lower decision_function = more anomalous)
        fraud_score = max(0, min(1, 0.5 - raw_score))
        return round(fraud_score, 2)

    def _extract_features(self, claims: list[dict]) -> np.ndarray:
        return np.array([
            [c['payout_amount'], c['claim_frequency'], c['hours_since_trigger'],
             c['zone_peer_ratio'], c['time_between_claims']]
            for c in claims
        ])

    def _extract_single_features(self, claim: dict, zone_claims: list[dict]) -> list:
        zone_avg_payout = np.mean([c['payout_amount'] for c in zone_claims]) if zone_claims else 300
        return [
            claim['payout_amount'],
            claim.get('claim_frequency', 0),
            claim.get('hours_since_trigger', 0),
            claim['payout_amount'] / zone_avg_payout if zone_avg_payout else 1.0,
            claim.get('time_between_claims', 168)  # default 1 week
        ]
```

### Compound Disruption Score
```python
def calculate_disruption_score(rain_mm: float, temp_c: float, aqi: float, traffic_delay: float = 1.0) -> float:
    rain_norm = min(rain_mm / 30.0, 1.0) * 10  # 30mm = max
    temp_norm = max(0, (temp_c - 35) / 10) * 10  # 35C baseline, 45C = max
    aqi_norm = min(aqi / 400.0, 1.0) * 10  # 400 = max
    traffic_norm = min(traffic_delay / 3.0, 1.0) * 10  # 3x delay = max

    score = (rain_norm * 2.5 + temp_norm * 1.8 + aqi_norm * 2.0 + traffic_norm * 1.5) / 10
    # Add interaction terms
    if rain_norm > 3 and traffic_norm > 3:
        score *= 1.2  # Rain + traffic compound effect
    if temp_norm > 5 and aqi_norm > 5:
        score *= 1.15  # Heat + AQI compound effect

    return round(min(score, 10.0), 2)
```

### Leaflet.js Fraud Heatmap Component
```tsx
'use client'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface ZoneRisk {
  zone_name: string
  city: string
  lat: number
  lon: number
  fraud_score: number
  flagged_claims: number
}

function FraudHeatmap({ zones }: { zones: ZoneRisk[] }) {
  const getColor = (score: number) =>
    score >= 0.7 ? '#f43f5e' : score >= 0.4 ? '#f59e0b' : '#10b981'

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-[400px] rounded-card">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OSM'
      />
      {zones.map((z) => (
        <CircleMarker
          key={`${z.city}-${z.zone_name}`}
          center={[z.lat, z.lon]}
          radius={12 + z.fraud_score * 20}
          color={getColor(z.fraud_score)}
          fillOpacity={0.6}
        >
          <Popup>
            <strong>{z.zone_name}</strong> ({z.city})<br />
            Fraud Score: {(z.fraud_score * 100).toFixed(0)}%<br />
            Flagged: {z.flagged_claims} claims
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
export default FraudHeatmap
```

### Recharts Claims Forecast Chart
```tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function ClaimsForecastChart({ data }: { data: ForecastDay[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
        <Legend />
        <Bar dataKey="rain_claims" name="Rain" fill="#3b82f6" radius={[4,4,0,0]} />
        <Bar dataKey="heat_claims" name="Heat" fill="#f97316" radius={[4,4,0,0]} />
        <Bar dataKey="aqi_claims" name="AQI" fill="#a855f7" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

### Razorpay Payout Simulation
```python
import uuid
from datetime import datetime

async def simulate_payout(claim_id: str, amount: int, worker_phone: str) -> dict:
    """
    Simulates Razorpay UPI payout.
    In production, replace with:
      client = razorpay.Client(auth=(key_id, key_secret))
      payout = client.payout.create({...})
    """
    transaction_id = f"SIM-{uuid.uuid4().hex[:12].upper()}"
    return {
        "transaction_id": transaction_id,
        "amount": amount,
        "currency": "INR",
        "mode": "UPI",
        "status": "processed",
        "upi_id": f"{worker_phone[-4:]}@upi",
        "processed_at": datetime.utcnow().isoformat(),
        "razorpay_note": "[SIMULATED] Production uses RazorpayX Payout API"
    }
```

### Admin Claims Forecast API (using OpenWeatherMap 7-day forecast)
```python
@router.get("/claims-forecast")
async def get_claims_forecast():
    cities = {"Mumbai": (19.076, 72.877), "Delhi": (28.6139, 77.209), "Bengaluru": (12.9716, 77.5946)}
    forecast = []

    for city, (lat, lon) in cities.items():
        weather = await fetch_forecast(lat, lon)  # 7-day from OpenWeatherMap
        for day in weather.get("daily", [])[:7]:
            rain_prob = min(day.get("rain", 0) / 30.0, 1.0)
            heat_prob = 1.0 if day.get("feels_like", {}).get("day", 0) > 43 else 0.0
            workers_in_city = await count_active_workers(city)
            estimated_claims = int(workers_in_city * rain_prob * 0.6)
            estimated_payout = estimated_claims * 300

            forecast.append({
                "date": datetime.fromtimestamp(day["dt"]).strftime("%Y-%m-%d"),
                "city": city,
                "rain_trigger_prob": round(rain_prob, 2),
                "heat_trigger_prob": round(heat_prob, 2),
                "estimated_claims": estimated_claims,
                "estimated_payout": estimated_payout
            })
    return forecast
```

---

## Deployment Strategy

### Hackathon Demo (Recommended)
1. **Frontend**: Deploy to Vercel (connect GitHub repo, auto-deploy)
2. **Backend**: Deploy to Render free tier (Python FastAPI, auto-deploy from GitHub)
   - Render is better than Vercel serverless for FastAPI because it supports persistent processes and avoids cold starts
3. **Database**: Supabase free tier (already configured)
4. Update `NEXT_PUBLIC_API_URL` on Vercel to point to Render backend URL

### Alternative: Everything on Vercel
- Frontend: standard Vercel deployment
- Backend: Vercel Python serverless functions via `api/index.py` + `vercel.json`
- Caveat: serverless cold starts add 2-5s latency on first request, and XGBoost model loading is slow in serverless

---

## Implementation Priority Order

Given the April 4 deadline, execute in this order:

### Wave 1 (Immediate - Critical Path)
1. Train XGBoost model and commit artifact
2. Seed 10-15 demo workers per city
3. Implement Isolation Forest fraud detection (replace random score)
4. Add compound disruption score calculation

### Wave 2 (Core Features)
5. Build admin dashboard page with 3 panels
6. Implement claims forecast API endpoint
7. Implement fraud heatmap API endpoint
8. Implement reserve recommendations API endpoint

### Wave 3 (UI Polish)
9. Wire Leaflet.js heatmap into admin page
10. Wire recharts forecast chart into admin page
11. Add Razorpay payout simulation
12. Add "Fire Trigger" button in admin UI

### Wave 4 (Demo Prep)
13. Full demo flow test (register -> policy -> trigger -> claim -> payout)
14. Deploy to Vercel + Render
15. Record 2-minute demo video

---

## RESEARCH COMPLETE

**Confidence:** High. The codebase is ~70% built. The remaining 30% is well-defined with clear APIs, existing patterns to follow, and all required libraries already in `package.json`/`requirements.txt`.

**Biggest risk:** Getting real API keys configured and tested (OpenWeatherMap, WAQI, Supabase) before the demo. The app structure and code patterns are solid.
