# GottaGO Phase 2 - Task Breakdown & Build Plan

## Project Timeline

**Start Date:** April 2, 2026 (Today)  
**Deadline:** April 4, 2026 (3 days)  
**Team Size:** 1-2 developers  
**Tools:** Cursor/Antigravity AI coding assistants

## Day 1 (April 2): Foundation + Registration + Premium Engine

### Morning Session (4 hours)

#### Task 1.1: Project Setup
**Estimated Time:** 1 hour  
**Priority:** P0  
**Dependencies:** None

**Subtasks:**
- [ ] Create Next.js 14 project with App Router
- [ ] Install dependencies: Tailwind CSS, Shadcn UI, Leaflet.js
- [ ] Configure Tailwind with custom color palette (Indigo-500, Slate-900, etc.)
- [ ] Set up dark theme as default
- [ ] Create FastAPI project structure
- [ ] Install Python dependencies: fastapi, supabase, xgboost, scikit-learn, httpx, pandas
- [ ] Create `.env.example` with all required environment variables
- [ ] Set up Supabase project (free tier)

**Files Involved:**
- `/frontend/package.json`
- `/frontend/tailwind.config.js`
- `/frontend/app/globals.css`
- `/backend/requirements.txt`
- `/backend/main.py`
- `.env.example`

**Acceptance Criteria:**
- Next.js dev server runs without errors
- FastAPI server runs on localhost:8000
- Tailwind dark theme renders correctly
- Supabase connection successful

---

#### Task 1.2: Database Schema Creation
**Estimated Time:** 1.5 hours  
**Priority:** P0  
**Dependencies:** Task 1.1

**Subtasks:**
- [ ] Create all 7 tables in Supabase SQL editor
- [ ] Add indexes on foreign keys and frequently queried fields
- [ ] Seed `disruption_zones` table with Mumbai, Delhi, Bengaluru zones (5 zones per city)
- [ ] Verify table relationships and constraints

**Files Involved:**
- `/backend/db/schema.sql`
- `/backend/seeds/zones_seed.sql`

**Data:** **[MOCK/SIMULATED]** Zone risk scores

**Acceptance Criteria:**
- All 7 tables created successfully
- 15 zones seeded with lat/lon, flood_risk_score, aqi_risk_score
- Foreign key constraints working
- Indexes created on all specified fields

---

#### Task 1.3: Worker Registration Form (Frontend)
**Estimated Time:** 1.5 hours  
**Priority:** P0  
**Dependencies:** Task 1.1

**Subtasks:**
- [ ] Create `/app/register/page.tsx`
- [ ] Build registration form with Shadcn UI components (Input, Select, Button)
- [ ] Add form validation (phone, worker_id, rating, hours, earnings)
- [ ] Implement city/zone dropdown with cascading selection
- [ ] Add mobile-responsive styling with large touch targets
- [ ] Show calculated premium preview on form change

**Files Involved:**
- `/frontend/app/register/page.tsx`
- `/frontend/components/registration-form.tsx`
- `/frontend/components/ui/input.tsx`
- `/frontend/components/ui/select.tsx`
- `/frontend/components/ui/button.tsx`

**Data:** **[MOCK/SIMULATED]** City/zone dropdown options

**Acceptance Criteria:**
- Form renders on mobile and desktop
- All validations work correctly
- City selection updates zone dropdown
- Form submits to API endpoint
- Success message displays with policy details

### Afternoon Session (4 hours)

#### Task 1.4: Worker Registration API (Backend)
**Estimated Time:** 1 hour  
**Priority:** P0  
**Dependencies:** Task 1.2

**Subtasks:**
- [ ] Create `/backend/routers/workers.py`
- [ ] Implement `POST /api/v1/workers/register` endpoint
- [ ] Add Pydantic models for request/response validation
- [ ] Hash phone number before storage (SHA256)
- [ ] Insert worker record into `workers` table
- [ ] Return worker_id and success status

**Files Involved:**
- `/backend/routers/workers.py`
- `/backend/models/worker.py`
- `/backend/db/supabase.py`

**Acceptance Criteria:**
- Endpoint accepts valid worker data
- Phone number hashed before storage
- Worker record created in database
- Returns 201 status with worker_id
- Validation errors return 400 status

---

#### Task 1.5: XGBoost Premium Model Training
**Estimated Time:** 2 hours  
**Priority:** P0  
**Dependencies:** None (can run in parallel)

**Subtasks:**
- [ ] Generate synthetic training data (1000 samples)
- [ ] Create `/backend/ml/train_premium_model.py`
- [ ] Implement feature engineering (one-hot encoding for city, normalization)
- [ ] Train XGBoost model with 7 input features
- [ ] Validate model output (multiplier 0.5-2.0)
- [ ] Save model to `/backend/ml/models/premium_xgboost.pkl`
- [ ] Test model with sample inputs

**Files Involved:**
- `/backend/ml/train_premium_model.py`
- `/backend/ml/generate_synthetic_data.py`
- `/backend/ml/models/premium_xgboost.pkl`

**Acceptance Criteria:**
- Model trains without errors
- Multiplier output in valid range (0.5-2.0)
- Model file saved and loadable
- Test predictions match expected range

---

#### Task 1.6: Premium Calculation API
**Estimated Time:** 1 hour  
**Priority:** P0  
**Dependencies:** Task 1.5

**Subtasks:**
- [ ] Create `/backend/routers/premiums.py`
- [ ] Implement `POST /api/v1/premiums/calculate` endpoint
- [ ] Load XGBoost model from file
- [ ] Apply 7 input features and get multiplier
- [ ] Calculate final premium (base * multiplier)
- [ ] Enforce affordability ceiling (3% of earnings)
- [ ] Return premium with breakdown

**Files Involved:**
- `/backend/routers/premiums.py`
- `/backend/models/premium.py`
- `/backend/ml/premium_calculator.py`

**Acceptance Criteria:**
- Endpoint loads model successfully
- Premium calculated correctly
- Affordability ceiling enforced
- Breakdown shows each factor's contribution
- Returns 200 status with premium data

### Evening Session (2 hours)

#### Task 1.7: Auto-Policy Creation
**Estimated Time:** 1 hour  
**Priority:** P0  
**Dependencies:** Task 1.4, Task 1.6

**Subtasks:**
- [ ] Create `/backend/routers/policies.py`
- [ ] Implement `POST /api/v1/policies/create` endpoint
- [ ] Generate unique policy number (GS-{YEAR}-{CITY_CODE}-{RANDOM})
- [ ] Calculate coverage amount (55% of 4-week baseline)
- [ ] Insert policy record into `policies` table
- [ ] Link policy creation to worker registration flow

**Files Involved:**
- `/backend/routers/policies.py`
- `/backend/models/policy.py`

**Data:** **[MOCK/SIMULATED]** Simulates Guidewire PolicyCenter

**Acceptance Criteria:**
- Policy auto-created after worker registration
- Unique policy number generated
- Coverage amount calculated correctly
- Policy record in database
- Returns policy_id and policy_number

---

#### Task 1.8: Premium Breakdown UI
**Estimated Time:** 1 hour  
**Priority:** P0  
**Dependencies:** Task 1.6

**Subtasks:**
- [ ] Create `/frontend/components/premium-breakdown.tsx`
- [ ] Implement visual breakdown with horizontal bars
- [ ] Color-code factors (green/yellow/red)
- [ ] Show base premium and final premium
- [ ] Add tooltips explaining each factor
- [ ] Make mobile-responsive

**Files Involved:**
- `/frontend/components/premium-breakdown.tsx`
- `/frontend/lib/api.ts` (API client function)

**Acceptance Criteria:**
- Breakdown displays all 7 factors
- Colors match factor impact
- Mobile-friendly layout
- Tooltips work on hover/tap
- Data fetched from API

---

### Day 1 Testing & Validation
- [ ] Test complete registration flow: form → API → database → policy creation
- [ ] Verify premium calculation with different inputs
- [ ] Check mobile responsiveness on phone simulator
- [ ] Validate database records created correctly

---

## Day 2 (April 3): Policy Management + Triggers + Claims

### Morning Session (4 hours)

#### Task 2.1: Policy Dashboard UI
**Estimated Time:** 1.5 hours  
**Priority:** P0  
**Dependencies:** Task 1.7

**Subtasks:**
- [ ] Create `/app/dashboard/page.tsx`
- [ ] Build policy card component showing policy details
- [ ] Add "Guidewire Integration" badge
- [ ] Display coverage period, premium, coverage amount
- [ ] Show active claims count and total payout
- [ ] Add renew/pause buttons (UI only for now)

**Files Involved:**
- `/frontend/app/dashboard/page.tsx`
- `/frontend/components/policy-card.tsx`
- `/frontend/components/guidewire-badge.tsx`

**Data:** **[MOCK/SIMULATED]** Guidewire PolicyCenter mapping

**Acceptance Criteria:**
- Dashboard displays policy information
- Guidewire badge visible
- Mobile-responsive layout
- Data fetched from API
- Loading and error states handled

---

#### Task 2.2: OpenWeatherMap Integration
**Estimated Time:** 1 hour  
**Priority:** P0  
**Dependencies:** Task 1.2

**Subtasks:**
- [ ] Sign up for OpenWeatherMap API (free tier)
- [ ] Create `/backend/integrations/openweathermap.py`
- [ ] Implement weather data fetching for zone lat/lon
- [ ] Parse rain, temperature, feels_like data
- [ ] Add error handling and retry logic
- [ ] Test with real API calls

**Files Involved:**
- `/backend/integrations/openweathermap.py`
- `/backend/config.py` (API key storage)

**Data:** **[REAL API]** OpenWeatherMap One Call 3.0

**Acceptance Criteria:**
- API key configured in environment
- Weather data fetched successfully
- Rain and temperature parsed correctly
- Error handling for API failures
- Rate limit respected (1000 calls/day)

---

#### Task 2.3: WAQI AQI Integration
**Estimated Time:** 0.5 hours  
**Priority:** P0  
**Dependencies:** Task 1.2

**Subtasks:**
- [ ] Sign up for WAQI API token (free tier)
- [ ] Create `/backend/integrations/waqi.py`
- [ ] Implement AQI data fetching for cities
- [ ] Parse AQI value and timestamp
- [ ] Add error handling

**Files Involved:**
- `/backend/integrations/waqi.py`

**Data:** **[REAL API]** WAQI API

**Acceptance Criteria:**
- API token configured
- AQI data fetched for Mumbai, Delhi, Bengaluru
- AQI value parsed correctly
- Error handling implemented

---

#### Task 2.4: Trigger Detection Engine
**Estimated Time:** 2 hours  
**Priority:** P0  
**Dependencies:** Task 2.2, Task 2.3

**Subtasks:**
- [ ] Create `/backend/routers/triggers.py`
- [ ] Implement `GET /api/v1/triggers/check` endpoint
- [ ] Check 5 trigger conditions:
  - Heavy Rainfall (>30mm in 3 hours)
  - Extreme Heat (feels_like >43°C for 3+ hours)
  - Severe AQI (>400 for 4+ hours)
  - Government Bandh (seeded events)
  - Compound Disruption Score (>7.0)
- [ ] Calculate compound score formula
- [ ] Return zones with active triggers

**Files Involved:**
- `/backend/routers/triggers.py`
- `/backend/ml/disruption_score.py`
- `/backend/models/trigger.py`

**Data:** **[REAL API]** Weather + AQI, **[MOCK/SIMULATED]** Bandh events

**Acceptance Criteria:**
- All 5 triggers detected correctly
- Compound score calculated accurately
- Trigger events stored in `trigger_events` table
- SHA256 hash prevents duplicates
- Returns affected zones

### Afternoon Session (4 hours)

#### Task 2.5: Seed Mock Bandh Events
**Estimated Time:** 0.5 hours  
**Priority:** P0  
**Dependencies:** Task 1.2

**Subtasks:**
- [ ] Create `/backend/seeds/mock_bandh_events.json`
- [ ] Seed 3-5 bandh events in `trigger_events` table
- [ ] Add admin button to manually trigger bandh (simple API endpoint)

**Files Involved:**
- `/backend/seeds/mock_bandh_events.json`
- `/backend/seeds/seed_bandh.py`

**Data:** **[MOCK/SIMULATED]** Government bandh alerts

**Acceptance Criteria:**
- Bandh events seeded in database
- Admin endpoint triggers bandh manually
- Events have realistic timestamps and durations

---

#### Task 2.6: Auto-Claims Pipeline
**Estimated Time:** 2 hours  
**Priority:** P0  
**Dependencies:** Task 2.4

**Subtasks:**
- [ ] Create `/backend/routers/claims.py`
- [ ] Implement `POST /api/v1/claims/auto-create` endpoint
- [ ] Find affected workers in trigger zone
- [ ] Check cap rules (max 2 payouts/week, 55% ceiling, activity requirement)
- [ ] Create claim records in `claims` table
- [ ] Generate unique claim number (CL-{YEAR}-{TRIGGER_CODE}-{RANDOM})
- [ ] Set payout amount based on trigger type

**Files Involved:**
- `/backend/routers/claims.py`
- `/backend/models/claim.py`
- `/backend/services/claim_service.py`

**Data:** **[MOCK/SIMULATED]** Guidewire ClaimCenter mapping

**Acceptance Criteria:**
- Claims auto-created when trigger fires
- Cap rules enforced correctly
- Claim number unique
- Payout amount matches trigger type
- Claims stored in database

---

#### Task 2.7: Fraud Detection System
**Estimated Time:** 1.5 hours  
**Priority:** P0  
**Dependencies:** Task 2.6

**Subtasks:**
- [ ] Implement 4 fraud detection signals:
  1. GPS Zone Validation (4km tolerance)
  2. Multi-Worker Zone Correlation
  3. Timing Anomaly Detection
  4. Duplicate Event Prevention (SHA256 hash)
- [ ] Create fraud scoring logic
- [ ] Store fraud flags in `fraud_flags` table
- [ ] Auto-approve or flag claims based on fraud score

**Files Involved:**
- `/backend/services/fraud_detection.py`
- `/backend/models/fraud_flag.py`

**Data:** **[MOCK/SIMULATED]** Worker order activity

**Acceptance Criteria:**
- All 4 fraud signals implemented
- Fraud score calculated (0-1)
- High-risk claims flagged for review
- Low-risk claims auto-approved
- Fraud flags stored in database

### Evening Session (2 hours)

#### Task 2.8: Razorpay Payout Simulation
**Estimated Time:** 1 hour  
**Priority:** P0  
**Dependencies:** Task 2.7

**Subtasks:**
- [ ] Sign up for Razorpay test account
- [ ] Create `/backend/integrations/razorpay.py`
- [ ] Implement payout API call (test mode)
- [ ] Update claim status to 'paid' after payout
- [ ] Store transaction ID in claims table
- [ ] Add retry logic for failed payouts

**Files Involved:**
- `/backend/integrations/razorpay.py`
- `/backend/routers/claims.py` (payout endpoint)

**Data:** **[REAL API]** Razorpay Sandbox (test mode)

**Acceptance Criteria:**
- Razorpay test keys configured
- Payout simulated successfully
- Transaction ID stored
- Claim status updated to 'paid'
- Failed payouts retry 3 times

---

#### Task 2.9: Claims Timeline UI
**Estimated Time:** 1 hour  
**Priority:** P0  
**Dependencies:** Task 2.6

**Subtasks:**
- [ ] Create `/frontend/components/claims-timeline.tsx`
- [ ] Build WhatsApp-style notification cards
- [ ] Show claim stages: detected → created → checked → approved → paid
- [ ] Display trigger reason with weather/AQI snapshot
- [ ] Show payout amount prominently
- [ ] Add smooth transitions and animations

**Files Involved:**
- `/frontend/components/claims-timeline.tsx`
- `/frontend/components/trigger-card.tsx`

**Acceptance Criteria:**
- Timeline displays all claims
- Each stage has timestamp and icon
- Trigger details shown clearly
- Mobile-responsive layout
- Smooth animations

---

### Day 2 Testing & Validation
- [ ] Test trigger detection with real weather API
- [ ] Manually fire a trigger and verify claim auto-creation
- [ ] Check fraud detection flags claims correctly
- [ ] Verify payout simulation works
- [ ] Test claims timeline UI with multiple claims

---

## Day 3 (April 4): Admin Dashboard + Polish + Demo Video

### Morning Session (3 hours)

#### Task 3.1: Claims Forecast (Admin)
**Estimated Time:** 1.5 hours  
**Priority:** P1  
**Dependencies:** Task 2.2

**Subtasks:**
- [ ] Create `/backend/routers/admin.py`
- [ ] Implement `GET /api/v1/admin/claims-forecast` endpoint
- [ ] Fetch 7-day weather forecast from OpenWeatherMap
- [ ] Predict trigger probabilities for each day
- [ ] Estimate claims count and payout amount
- [ ] Create forecast chart component (frontend)

**Files Involved:**
- `/backend/routers/admin.py`
- `/frontend/app/admin/page.tsx`
- `/frontend/components/claims-forecast.tsx`

**Data:** **[REAL API]** OpenWeatherMap 7-day forecast

**Acceptance Criteria:**
- 7-day forecast fetched successfully
- Trigger probabilities calculated
- Estimated claims and payouts shown
- Chart displays forecast visually
- Updates every 6 hours

---

#### Task 3.2: Fraud Risk Heatmap (Admin)
**Estimated Time:** 1.5 hours  
**Priority:** P1  
**Dependencies:** Task 2.7

**Subtasks:**
- [ ] Train Isolation Forest model on zone-level fraud data
- [ ] Implement `GET /api/v1/admin/fraud-heatmap` endpoint
- [ ] Return zones with fraud scores
- [ ] Create Leaflet.js heatmap component
- [ ] Color-code zones (green/yellow/red)
- [ ] Add click interaction to show zone details

**Files Involved:**
- `/backend/ml/train_fraud_model.py`
- `/backend/routers/admin.py`
- `/frontend/components/fraud-heatmap.tsx`

**Acceptance Criteria:**
- Isolation Forest model trained
- Fraud scores calculated per zone
- Leaflet.js map renders correctly
- Zones color-coded by risk
- Click shows fraud details

### Afternoon Session (3 hours)

#### Task 3.3: Reserve Recommendations (Admin)
**Estimated Time:** 0.5 hours  
**Priority:** P1  
**Dependencies:** Task 3.1

**Subtasks:**
- [ ] Implement `GET /api/v1/admin/reserves` endpoint
- [ ] Calculate required reserves: (predicted_claims * avg_payout * 1.2)
- [ ] Compare to current balance (mock value)
- [ ] Return status (sufficient/borderline/insufficient)
- [ ] Create reserve panel component with traffic-light indicator

**Files Involved:**
- `/backend/routers/admin.py`
- `/frontend/components/reserve-panel.tsx`

**Acceptance Criteria:**
- Required reserves calculated correctly
- Status indicator shows green/yellow/red
- Recommendations displayed clearly
- Updates daily

---

#### Task 3.4: UI Polish & Refinement
**Estimated Time:** 2 hours  
**Priority:** P0  
**Dependencies:** All previous tasks

**Subtasks:**
- [ ] Add loading states to all async operations
- [ ] Add error states with retry buttons
- [ ] Add empty states (no claims yet, no policy)
- [ ] Implement smooth page transitions
- [ ] Add micro-interactions (button hover, card expand)
- [ ] Test mobile responsiveness on all pages
- [ ] Add Hindi language toggle (basic translation)
- [ ] Verify dark theme consistency
- [ ] Add Guidewire badges to policy and claims sections

**Files Involved:**
- All frontend components
- `/frontend/lib/i18n.ts` (language support)

**Acceptance Criteria:**
- All loading states work
- Error handling graceful
- Empty states informative
- Smooth animations
- Mobile-responsive on all pages
- Hindi toggle functional
- Guidewire badges visible

---

#### Task 3.5: Seed Mock Worker Data
**Estimated Time:** 0.5 hours  
**Priority:** P0  
**Dependencies:** Task 1.4

**Subtasks:**
- [ ] Create `/backend/seeds/mock_workers.json`
- [ ] Generate 10-15 realistic worker profiles
- [ ] Distribute across Mumbai, Delhi, Bengaluru
- [ ] Seed workers into database
- [ ] Create policies for each worker
- [ ] Generate some historical claims for demo

**Files Involved:**
- `/backend/seeds/mock_workers.json`
- `/backend/seeds/seed_workers.py`

**Data:** **[MOCK/SIMULATED]** Worker profiles

**Acceptance Criteria:**
- 10-15 workers seeded
- Realistic profiles (names, ratings, earnings)
- Policies created for all workers
- Some workers have historical claims

### Evening Session (4 hours)

#### Task 3.6: Demo Video Recording
**Estimated Time:** 2 hours  
**Priority:** P0  
**Dependencies:** All previous tasks

**Subtasks:**
- [ ] Write demo script (2-minute narration)
- [ ] Set up screen recording (1080p, 60fps)
- [ ] Record demo following script:
  - 0:00-0:15 Problem statement
  - 0:15-0:30 Solution overview
  - 0:30-0:50 Worker registration demo
  - 0:50-1:10 Premium calculator demo
  - 1:10-1:35 Auto-claim flow demo
  - 1:35-1:50 Admin dashboard demo
  - 1:50-2:00 Guidewire mapping + closing
- [ ] Edit video (trim, add captions)
- [ ] Export final video (MP4, <50MB)

**Files Involved:**
- `/demo/script.md`
- `/demo/gottago_demo.mp4`

**Acceptance Criteria:**
- Video exactly 2 minutes
- All 4 deliverables demonstrated
- Clear narration and visuals
- Guidewire integration explained
- Real vs mock APIs clarified

---

#### Task 3.7: Deployment to Vercel
**Estimated Time:** 1 hour  
**Priority:** P0  
**Dependencies:** All previous tasks

**Subtasks:**
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Configure environment variables in Vercel dashboard
- [ ] Deploy frontend (Next.js)
- [ ] Deploy backend (FastAPI as serverless functions)
- [ ] Test deployed app on mobile device
- [ ] Fix any deployment issues

**Files Involved:**
- `vercel.json` (deployment config)
- `.env.example` (reference for env vars)

**Acceptance Criteria:**
- App deployed successfully
- All environment variables configured
- Frontend and backend working
- Mobile-responsive on real device
- No console errors

---

#### Task 3.8: Final Testing & Documentation
**Estimated Time:** 1 hour  
**Priority:** P0  
**Dependencies:** Task 3.7

**Subtasks:**
- [ ] Test complete user flow on deployed app
- [ ] Verify all 4 deliverables working
- [ ] Check all real APIs functioning
- [ ] Update README.md with setup instructions
- [ ] Document Guidewire integration mapping
- [ ] Create submission checklist
- [ ] Submit to hackathon portal

**Files Involved:**
- `README.md`
- `GUIDEWIRE_MAPPING.md`
- `SUBMISSION.md`

**Acceptance Criteria:**
- All 4 deliverables functional
- README complete with setup steps
- Guidewire mapping documented
- Submission checklist complete
- Submitted before deadline

---

## Task Summary by Priority

### P0 (Must Have) - 18 tasks
All tasks marked P0 must be completed for minimum viable demo.

### P1 (Should Have) - 3 tasks
Admin dashboard features (forecast, heatmap, reserves) - nice to have but not critical.

## Estimated Total Time

- Day 1: 10 hours
- Day 2: 10 hours
- Day 3: 10 hours
- **Total: 30 hours over 3 days**

## Risk Mitigation

**High-Risk Items:**
1. External API rate limits (OpenWeatherMap, WAQI)
   - Mitigation: Cache responses, use mock data as fallback
2. XGBoost model training time
   - Mitigation: Use small synthetic dataset, pre-train if possible
3. Vercel deployment issues
   - Mitigation: Test locally first, have backup hosting (Netlify)

**Contingency Plan:**
- If Day 2 runs over, skip admin dashboard (P1 tasks)
- If Day 3 runs over, use pre-recorded demo video template
- If deployment fails, demo from localhost with ngrok

## Success Criteria

- [ ] All 4 mandatory deliverables working
- [ ] 2-minute demo video completed
- [ ] Deployed to Vercel and accessible via URL
- [ ] Guidewire integration mapping documented
- [ ] Real APIs (OpenWeatherMap, WAQI, Razorpay) functional
- [ ] Mobile-responsive on actual phone
- [ ] Submitted before April 4, 2026 deadline

---

**Document Version:** 1.0  
**Last Updated:** April 2, 2026  
**Status:** Ready for Execution
