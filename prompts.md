# Kiro Prompts for GigShield Phase 2

Feed these prompts to Kiro in order. Each one builds on the previous output.

---

## Prompt 1: Generate `requirements.md`

```
You are a Senior Product Manager specifying requirements for a hackathon project.

PROJECT: GigShield - India's first weekly income shield for food delivery partners (Swiggy/Zomato). It pays workers automatically when verified external disruptions (heavy rain, extreme heat, severe AQI, government bandh) destroy their earning day. Zero paperwork, zero claim forms.

HACKATHON: Guidewire DEVTrails 2026
DEADLINE: April 4, 2026
PHASE 2 THEME: "Protect Your Worker"

PHASE 2 MANDATORY DELIVERABLES (all four must be working):
1. Registration Process
2. Insurance Policy Management
3. Dynamic Premium Calculation (with AI/ML)
4. Claims Management

PHASE 2 TIPS FROM JUDGES:
- Use ML to adjust weekly premium based on hyper-local risk factors (city, zone flood risk, season, AQI history, worker rating, hours logged, claims history)
- Build 3-5 automated triggers using public/mock APIs to detect disruptions causing income loss
- Build a seamless, zero-touch claim process (best UX for gig workers)

TECH STACK:
- Frontend: Next.js 14 (App Router) + Tailwind CSS + Shadcn UI
- Backend: Python FastAPI
- Database: PostgreSQL via Supabase (free tier)
- ML: XGBoost (premium pricing), scikit-learn Isolation Forest (fraud detection)
- Maps: Leaflet.js + OpenStreetMap (free, no API key)
- Hosting: Vercel (free tier)

WHAT USES REAL APIs (actual external calls):
- OpenWeatherMap One Call 3.0 (rain, temperature, feels_like) - free tier 1000 calls/day
- WAQI API from aqicn.org (AQI data) - free tier
- Razorpay Sandbox (payment simulation) - free test mode
- Supabase (database) - free tier

WHAT IS MOCKED/SIMULATED (no real access possible):
- Guidewire InsuranceSuite (PolicyCenter, ClaimCenter, BillingCenter) - we simulate these concepts with our own database tables. Document that in production these map to Guidewire APIs.
- Swiggy/Zomato partner API (worker GPS, order count, earnings) - we generate realistic fake worker data and store it. No public API exists.
- NDMA/Government bandh alerts - we seed disruption events in our database and provide an admin button to trigger simulated bandh events.
- Worker GPS location - workers pick their city+zone from a dropdown at registration. We use that zone's lat/lon for trigger matching.
- UPI payout - Razorpay Sandbox handles this in test mode. No real money moves.

USERS OF THE SYSTEM:
1. Delivery Worker (primary user) - registers, views policy, sees premium breakdown, receives auto-payouts, gets SmartShift advisories
2. Insurance Admin (secondary user) - views claims dashboard, fraud heatmap, predictive claims forecast, reserve recommendations

THE 5 PARAMETRIC TRIGGERS:
1. Heavy Rainfall: >30mm cumulative in 3 hours in worker's zone. Source: OpenWeatherMap. Payout: Rs.300
2. Extreme Heat: feels_like >43C for 3+ consecutive hours 11am-4pm. Source: OpenWeatherMap. Payout: Rs.360
3. Severe AQI: AQI >400 for 4+ consecutive hours, 2+ stations. Source: WAQI API. Payout: Rs.240
4. Government Bandh: State/district curfew covering worker's city 3+ hours. Source: Mocked/seeded data. Payout: Rs.480
5. Compound Disruption Score: Combined score >7.0 for 2+ hours when no single trigger fires alone. Source: Composite of all above. Payout: Rs.300

PREMIUM CALCULATION (XGBoost model):
- Base premium: Rs.159/week
- 7 input features: city (one-hot), month (1-12), worker_weekly_baseline_inr, zone_flood_risk_score (0-1), zone_aqi_risk_score (0-1), platform_rating (1-5), avg_weekly_hours_logged
- Output: multiplier (0.5 to 2.0) applied to base premium
- Result range: Rs.80 to Rs.318/week
- Must stay below 3% of worker's weekly earnings (affordability ceiling)

FRAUD DETECTION (4 signals, all run before payout):
1. GPS Zone Validation - worker's zone must overlap with trigger zone (4km tolerance)
2. Multi-Worker Zone Correlation - if only 1 of N workers in a zone claims but others show normal orders, flag it
3. Timing Anomaly - claims >3 hours after trigger window closes are flagged
4. Duplicate Event Prevention - SHA256 hash of (trigger_type + zone_id + timestamp_window), one payout per hash per worker

CAP RULES:
- Max 2 trigger payouts per worker per week
- Weekly payout ceiling: 55% of worker's 4-week rolling earnings baseline
- Overlapping triggers: only higher-value trigger fires
- Payout timing: within 2 hours of trigger confirmation
- Activity requirement: worker must have been active in 2 hours before trigger

Generate a detailed requirements.md with:
- Functional requirements grouped by the 4 deliverables (Registration, Policy Management, Premium Calculation, Claims Management)
- Non-functional requirements (performance, security, accessibility)
- User stories in "As a [role], I want [action], so that [benefit]" format
- Acceptance criteria for each user story
- Clear labels: [REAL API] or [MOCK/SIMULATED] next to every external integration
- Data model requirements (tables, fields, relationships)
- API endpoint requirements (method, path, request/response)
```

---

## Prompt 2: Generate `design.md`

```
Based on the requirements you just generated, create a design.md covering:

SYSTEM ARCHITECTURE:
- Frontend: Next.js 14 App Router with these routes:
  / (landing page)
  /register (worker registration form)
  /dashboard (worker dashboard - policy, claims, premium breakdown, SmartShift)
  /admin (insurer admin - claims forecast, fraud heatmap, reserve recommendations)
  /api/* (Next.js API routes that proxy to FastAPI backend)

- Backend: FastAPI with these router modules:
  /api/v1/workers (registration, profile, earnings)
  /api/v1/policies (create, renew, pause, resume, get)
  /api/v1/premiums (calculate, history, breakdown)
  /api/v1/claims (list, detail, auto-create from trigger)
  /api/v1/triggers (check current conditions, fire trigger, manual test trigger)
  /api/v1/admin (claims forecast, fraud heatmap data, reserve calc)

- Database: Supabase PostgreSQL with these tables:
  workers, policies, claims, premium_history, trigger_events, disruption_zones, fraud_flags

- ML Pipeline:
  XGBoost premium model - trained on synthetic data initially, retrained weekly
  Isolation Forest fraud model - unsupervised, retrained as claims accumulate
  Disruption Score calculator - weighted composite of weather + AQI + traffic factors

MOCK vs REAL INTEGRATIONS:
Label every integration point. For mocked integrations, describe:
- What data we generate/seed
- How the mock behaves identically to the real system
- What the production integration would look like (the Guidewire mapping)

GUIDEWIRE MAPPING (document clearly):
- Our `policies` table = Guidewire PolicyCenter policy lifecycle
- Our `claims` table = Guidewire ClaimCenter claim adjudication
- Our `premium_history` table = Guidewire BillingCenter premium collection
- In the UI, show a "Guidewire Integration" badge on these sections

UI/UX DESIGN PRINCIPLES:
- Mobile-first (delivery workers use phones, not laptops)
- Hindi + English support (toggle)
- Dark theme by default (workers use phones at night while delivering)
- Large touch targets (workers wear gloves, have wet hands in rain)
- WhatsApp-style notification cards for claim status
- Traffic-light color coding for SmartShift (green/yellow/red shifts)
- Premium breakdown must be visually clear (show each factor as a slider/bar)

DESIGN SYSTEM:
- Font: Inter (Google Fonts)
- Primary color: Indigo-500 (#6366f1)
- Surface: Slate-900 (#0f172a) / Slate-800 (#1e293b)
- Success: Emerald-500
- Warning: Amber-500
- Danger: Rose-500
- Border radius: 12px (cards), 8px (buttons), 6px (inputs)
- Component library: Shadcn UI (customized to above tokens)

Generate a complete design.md with architecture diagrams (mermaid), component hierarchy, API contracts, database schema with SQL, and the UI layout wireframe descriptions.
```

---

## Prompt 3: Generate file structure

```
Based on the requirements.md and design.md, generate the complete file structure for the GigShield project.

Rules:
- Frontend is a Next.js 14 App Router project inside /frontend
- Backend is a FastAPI project inside /backend
- ML models and training scripts go in /backend/ml/
- Seed data and fixtures go in /backend/seeds/
- Shadcn UI components go in /frontend/components/ui/
- Custom components go in /frontend/components/ (flat, no nesting beyond ui/)
- API client functions go in /frontend/lib/api.ts
- Supabase client goes in /frontend/lib/supabase.ts and /backend/db/supabase.py
- Environment variables listed in .env.example (never .env)
- Include a docker-compose.yml for local development (optional but nice for judges)
- Include a README.md with setup instructions

Output the full tree with a one-line description of each file's purpose.
Mark files that deal with mocked data with [MOCK] and files that call real APIs with [REAL].
```

---

## Prompt 4: Generate `task.md`

```
Based on the requirements, design, and file structure, generate a task.md with a day-by-day build plan.

CONSTRAINTS:
- Deadline: April 4, 2026 (3 days from now)
- Solo developer or 2-person team
- Using AI coding assistants (Cursor/Antigravity) for implementation
- Must have a 2-minute demo video ready by deadline

DAY-BY-DAY PLAN:

Day 1 (April 2): Foundation + Registration + Premium Engine
- [ ] Set up Next.js project with Tailwind + Shadcn
- [ ] Set up FastAPI project with Supabase connection
- [ ] Create database schema (all tables) in Supabase
- [ ] Build worker registration form (frontend)
- [ ] Build registration API endpoint (backend)
- [ ] Implement XGBoost premium calculator with synthetic training data
- [ ] Build premium breakdown UI (show each factor's contribution visually)
- [ ] Seed mock worker data (10-15 workers across Mumbai, Delhi, Bengaluru)
- [ ] Test: register a worker, see their calculated premium

Day 2 (April 3): Policy Management + Triggers + Claims
- [ ] Build policy creation flow (auto-create on registration)
- [ ] Build policy dashboard (current policy card, coverage details, renew/pause)
- [ ] Integrate OpenWeatherMap API for real weather data [REAL]
- [ ] Integrate WAQI API for real AQI data [REAL]
- [ ] Build trigger detection engine (poll APIs, check thresholds)
- [ ] Build compound disruption score calculator
- [ ] Seed mock bandh/curfew events [MOCK]
- [ ] Build auto-claims pipeline: trigger fires -> claim created -> fraud checks -> payout
- [ ] Build claims timeline UI (worker sees claim status, payout amount, trigger reason)
- [ ] Build Razorpay sandbox payout simulation [MOCK with real sandbox]
- [ ] Test: trigger a rain event, watch the claim auto-create and payout simulate

Day 3 (April 4): Admin Dashboard + Polish + Demo Video
- [ ] Build admin dashboard: predictive claims forecast
- [ ] Build fraud risk heatmap with Leaflet.js
- [ ] Build reserve recommendation panel
- [ ] Add Guidewire integration badges and documentation
- [ ] Polish UI: loading states, error states, empty states, transitions
- [ ] Mobile responsive check on all pages
- [ ] Record 2-minute demo video
- [ ] Deploy to Vercel
- [ ] Submit

Each task should include:
- Acceptance criteria (what "done" looks like)
- Which files are involved
- Whether it uses [REAL] or [MOCK] data
- Estimated time (in hours)
- Dependencies (which tasks must finish first)
```

---

## Prompt 5 (Optional): Generate demo video script

```
Generate a 2-minute demo video script for GigShield Phase 2.

Structure:
0:00-0:15 - Problem statement (Rajan loses Rs.320 on a rainy day, no insurance covers this)
0:15-0:30 - Solution overview (GigShield: weekly income shield, parametric triggers, zero-touch claims)
0:30-0:50 - Demo: Worker Registration (show form, submit, see policy created with dynamic premium)
0:50-1:10 - Demo: Dynamic Premium Calculator (show how changing zone/city/season adjusts premium, show XGBoost breakdown)
1:10-1:35 - Demo: Auto-Claim Flow (trigger a rain event via real OpenWeatherMap data or simulated trigger, show claim auto-created, fraud checks passing, payout simulated)
1:35-1:50 - Demo: Admin Dashboard (fraud heatmap, claims forecast, reserve recommendation)
1:50-2:00 - Closing (Guidewire integration mapping, what's real vs simulated, future vision)

Include exact narration text and which screen to show at each timestamp.
```

---

## How to Use These Prompts

1. Open Kiro
2. Paste Prompt 1. Wait for `requirements.md` output. Save it.
3. Paste Prompt 2 (Kiro will have context from prompt 1). Save `design.md`.
4. Paste Prompt 3. Save the file structure.
5. Paste Prompt 4. Save `task.md`.
6. Copy all four outputs into the `c:\Users\itska\Desktop\guidewire_devtrails\` directory.
7. Open the project in Antigravity. Run `/gsd-plan-phase` or `/gsd-execute-phase` using the task.md as your guide.
