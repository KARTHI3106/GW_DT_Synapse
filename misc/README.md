# GottaGO

India's first weekly parametric income protection platform for Swiggy and Zomato delivery partners.

Built for **Guidewire DevTrails 2026** — Phase 2: Protect Your Worker.

---

## What It Does

When heavy rain, extreme heat, severe AQI, or a government bandh prevents delivery partners from working, GottaGO automatically detects the disruption and pays them Rs.240-480 within 2 hours with no paperwork and no claim forms.

**4 Mandatory Deliverables:**

- Registration (worker onboarding + auto-policy creation)
- Insurance Policy Management (PolicyCenter simulation)
- Dynamic Premium Calculation (XGBoost ML model)
- Zero-Touch Claims Management (ClaimCenter simulation + Razorpay payouts)

---

## Tech Stack

| Layer    | Technology                                                |
| -------- | --------------------------------------------------------- |
| Frontend | Next.js 14 (App Router), Tailwind CSS, Framer Motion      |
| Backend  | Python FastAPI, Uvicorn                                   |
| Database | Supabase (PostgreSQL)                                     |
| ML       | XGBoost premium pricing, Isolation Forest fraud detection |
| APIs     | OpenWeatherMap One Call 3.0, WAQI AQI, Razorpay Sandbox   |
| Maps     | Leaflet.js (fraud heatmap)                                |

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase account (free tier)
- API keys: OpenWeatherMap, WAQI, Razorpay (test mode)

---

## Setup

### 1. Database

1. Create a Supabase project at https://supabase.com
2. Open SQL Editor → New Query
3. Paste and run the full setup script located in `SETUP_GUIDE.md`. This will create all tables, configure RLS, and seed the initial disruption zones and APIs.

### 2. Backend

```bash
cd backend

# Create virtual env
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and fill environment variables
copy .env.example .env
# Edit .env with your keys

# Seed Mock Workers (Important for dashboard data)
python -m seeds.mock_workers

# Train the XGBoost premium model (first time only)
python ml/train_ premium_model.py

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment
copy .env.local.example .env.local

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## Key Endpoints

| Method | Path                          | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| POST   | /api/v1/workers/register      | Register worker + auto-create policy |
| GET    | /api/v1/workers/{worker_id}   | Get worker profile                   |
| GET    | /api/v1/policies/{worker_id}  | Get active policy                    |
| POST   | /api/v1/premiums/calculate    | XGBoost premium calculation          |
| GET    | /api/v1/triggers/check        | Check live weather/AQI triggers      |
| POST   | /api/v1/triggers/fire         | Fire a trigger (admin/test)          |
| GET    | /api/v1/claims/{worker_id}    | Get worker's claims                  |
| GET    | /api/v1/admin/claims-forecast | 7-day claims forecast                |
| GET    | /api/v1/admin/fraud-heatmap   | Zone fraud risk heatmap              |
| GET    | /api/v1/admin/reserves        | Reserve fund status                  |

---

## 5 Parametric Triggers

| #   | Trigger             | Threshold                   | Payout |
| --- | ------------------- | --------------------------- | ------ |
| 1   | Heavy Rainfall      | >15mm in 1 hour             | Rs.300 |
| 2   | Extreme Heat        | >40°C                       | Rs.360 |
| 3   | Severe AQI          | AQI > 200                   | Rs.240 |
| 4   | Government Bandh    | Admin fired                 | Rs.480 |
| 5   | Compound Disruption | Score > 1.5 (multi-trigger) | Rs.300 |

---

## Guidewire Mapping

| Module        | GottaGO Simulation                 |
| ------------- | ------------------------------------ |
| PolicyCenter  | `policies` table + policy service    |
| ClaimCenter   | `claims` table + auto-claim pipeline |
| BillingCenter | Policy renewal API                   |

_Note: All Guidewire interactions are simulated via local database. Production deployment would call Guidewire REST APIs via the documented endpoints in routers._

---

## Fraud Detection Signals

Before every payout, 4 signals are evaluated:

1. Velocity check (>2 claims in 7 days)
2. Location mismatch (worker zone vs trigger zone)
3. Claim timing anomaly (claim created suspiciously quickly)
4. Isolation Forest anomaly score on claim features

---

_Built for Guidewire DevTrails 2026 Hackathon — April 2026_
