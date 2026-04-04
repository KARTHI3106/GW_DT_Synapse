# Concerns

## Critical Issues

### No Authentication or Authorization
- No auth middleware on any backend route
- No user authentication (Supabase Auth not used)
- Admin endpoints (`/api/v1/admin/*`) are publicly accessible
- `POST /api/v1/triggers/fire` can be called by anyone to create claims for all workers in a city
- Registration accepts any input without identity verification

### No Input Sanitization Beyond Pydantic
- Pydantic handles type validation, but no protection against injection in freeform text fields (`name`, `zone`)
- Worker `name` field allows 2-100 characters of any text

### CORS Wide Open
```python
allow_origins=["*"]   # backend/main.py
```
Production must restrict this to the actual frontend domain.

## Security Concerns

### Phone Number Hashing
- SHA256 without salt. Trivially reversible for 10-digit Indian phone numbers (10^10 rainbow table)
- Should use bcrypt or argon2 with salt

### Fraud Detection is a Placeholder
- `fraud_score = random.uniform(0.05, 0.25)` in `backend/routers/claims.py`
- The comment references an Isolation Forest in `fraud_detection.py` that does not exist
- Every claim gets auto-approved since `fraud_score < 0.7` is always true with scores in [0.05, 0.25]

### API Keys in Environment
- All external API keys stored in `.env` (standard practice but no secrets manager)
- `.gitignore` should exclude `.env` (verify)

## Code Duplication

| Duplicated Logic | Location A | Location B |
|-----------------|-----------|-----------|
| Policy creation + number generation | `backend/routers/policies.py` (lines 14-42) | `backend/services/policy_service.py` (entire file) |
| Zone risk scores | `backend/db/zones_seed.sql` | `frontend/lib/zones.ts` |
| Premium calculation | `backend/ml/premium_calculator.py` | `frontend/lib/premium-estimate.ts` |
| Trigger payout amounts | `backend/routers/claims.py` | `frontend/app/dashboard/page.tsx` |

The `policies.py` router contains a full duplicate of `policy_service.py`, including its own `create_policy_for_worker()` function and `generate_policy_number()`. The router imports from `services.policy_service`, so the duplicate code in `policies.py` (lines 14-42) appears to be dead code.

## Technical Debt

### Empty Directories
- `backend/integrations/` — planned for Razorpay and Guidewire SDK, currently empty
- `backend/seeds/` — planned for demo data seeding, currently empty
- `backend/models/__init__.py` — placeholder, no shared Pydantic models
- `frontend/app/admin/` — empty directory, admin dashboard not built
- `frontend/app/api/` — 6 subdirectories with no route handlers (Next.js API routes not implemented)

### Inconsistent API Client Usage
- `frontend/lib/api.ts` provides a typed API client but `frontend/app/dashboard/page.tsx` uses raw `fetch()` calls instead, duplicating the base URL construction

### No Error Boundaries
- Frontend has no React Error Boundaries except the Suspense wrapper on the dashboard
- API errors in the dashboard are caught but show a generic "Worker not found" state

### ML Model Not Committed
- `backend/ml/models/` directory exists but the trained model (`premium_xgboost.json`) may not be committed
- Rule-based fallback works, but the XGBoost model needs to be trained via `python ml/train_premium_model.py` after cloning

## Performance Concerns

### N+1 Queries in Trigger Fire
- `POST /api/v1/triggers/fire` loops through all workers in a city and calls `auto_create_claim()` sequentially for each one
- No batch insert or async parallelism

### No Database Indexes on Some Queries
- `disruption_zones` queried by `city + zone_name` (indexed via unique constraint)
- `claims` cap check filters by `worker_id + policy_id + status` but only `worker_id` and `status` are individually indexed

### Frontend Bundle Size
- `leaflet` and `react-leaflet` are in dependencies but the map component is not yet built
- `recharts` is in dependencies but no charts exist yet
- These add unnecessary bundle weight

## Missing Features (Referenced but Not Built)

| Feature | Referenced In | Status |
|---------|-------------|--------|
| Admin dashboard UI | `frontend/app/admin/` dir, nav links | Empty directory |
| Razorpay payout | Schema `transaction_id` field, config vars | Not integrated |
| Fraud detection (Isolation Forest) | Comment in `claims.py` | Not implemented |
| Bandh trigger (manual) | Trigger type in schema | Works via `/fire` but no automated source |
| Next.js API routes | 6 subdirs in `frontend/app/api/` | Empty, frontend proxies to backend instead |
