# Testing

## Current State

**No tests exist in the codebase.** There are no test files, test configuration, or testing dependencies in either the backend or frontend.

## Backend

- No `pytest` or `unittest` in `requirements.txt`
- No `tests/` directory
- No `conftest.py` or `pytest.ini`
- No test fixtures for Supabase mocking

### Recommended Setup
```
backend/
├── tests/
│   ├── conftest.py            # Supabase mock fixture, test client
│   ├── test_workers.py        # Registration, duplicate detection
│   ├── test_premiums.py       # Premium calculation (XGBoost + rule-based)
│   ├── test_triggers.py       # Trigger evaluation, deduplication
│   ├── test_claims.py         # Auto-claim creation, weekly cap
│   └── test_ml/
│       └── test_calculator.py # Unit tests for premium_calculator.py
```

### Testing Priority (by risk)
1. `premium_calculator.py` — Pure function, easy to unit test, business-critical
2. `triggers.py` → `evaluate_triggers()` — Pure function, threshold logic
3. `workers.py` → Registration flow — Integration test with Supabase mock
4. `claims.py` → Auto-claim with weekly cap — Edge cases around cap limits

## Frontend

- No `jest`, `vitest`, or `@testing-library/react` in `package.json`
- No `__tests__/` directories or `*.test.tsx` files
- No E2E test framework (no Playwright, Cypress)

### Recommended Setup
```
frontend/
├── __tests__/
│   ├── registration-form.test.tsx   # Form validation, premium preview
│   ├── premium-estimate.test.ts     # Client-side estimation logic
│   └── api.test.ts                  # API client error handling
```

## Testable Pure Functions (Quick Wins)

These functions have no external dependencies and can be unit tested immediately:

| Function | File | What to Test |
|----------|------|-------------|
| `_rule_based_multiplier()` | `backend/ml/premium_calculator.py` | City bonuses, monsoon, rating discount |
| `calculate_premium()` | `backend/ml/premium_calculator.py` | Affordability cap, min/max bounds |
| `evaluate_triggers()` | `backend/routers/triggers.py` | Threshold evaluation, compound score |
| `generate_training_data()` | `backend/ml/generate_synthetic_data.py` | Shape, value ranges, distributions |
| `estimatePremium()` | `frontend/lib/premium-estimate.ts` | Mirrors backend logic |
| `estimateCoverage()` | `frontend/lib/premium-estimate.ts` | Coverage cap at Rs.4800 |
| `formatCurrency()` | `frontend/lib/utils.ts` | Indian locale formatting |

## CI/CD

No CI/CD pipeline is configured. No GitHub Actions, no pre-commit hooks.
