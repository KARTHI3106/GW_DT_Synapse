# Structure

## Directory Layout

```
guidewire_devtrails/
├── backend/
│   ├── main.py                          # FastAPI app, router registration, CORS
│   ├── config.py                        # Pydantic BaseSettings (env loading)
│   ├── requirements.txt                 # Python dependencies
│   ├── .env.example                     # Template for required env vars
│   ├── venv/                            # Python virtual environment
│   ├── db/
│   │   ├── __init__.py
│   │   ├── supabase.py                  # Supabase client singleton
│   │   ├── schema.sql                   # Full database schema (7 tables)
│   │   └── zones_seed.sql              # Disruption zones seed data (15 zones)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── workers.py                   # POST /register, GET /{worker_id}
│   │   ├── policies.py                  # GET /{worker_id}, POST /renew|pause|resume
│   │   ├── premiums.py                  # POST /calculate, GET /{worker_id}/breakdown
│   │   ├── claims.py                    # GET /{worker_id}, POST /auto-create, GET /{id}/detail
│   │   ├── triggers.py                  # GET /check, POST /fire, GET /history
│   │   └── admin.py                     # GET /claims-forecast, /fraud-heatmap, /reserves
│   ├── services/
│   │   ├── __init__.py
│   │   └── policy_service.py            # Policy creation + number generation
│   ├── models/
│   │   └── __init__.py                  # Empty (Pydantic models inline in routers)
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── premium_calculator.py        # XGBoost inference + rule-based fallback
│   │   ├── train_premium_model.py       # XGBoost training script
│   │   ├── generate_synthetic_data.py   # Training data generator
│   │   └── models/                      # Trained model artifacts (.json)
│   ├── integrations/                    # Empty (planned for Razorpay, Guidewire)
│   └── seeds/                           # Empty (planned for demo data)
├── frontend/
│   ├── package.json                     # Dependencies + scripts
│   ├── next.config.js                   # API proxy rewrite rules
│   ├── tsconfig.json                    # TypeScript strict config
│   ├── tailwind.config.js               # Design system tokens
│   ├── postcss.config.js                # PostCSS (Tailwind + autoprefixer)
│   ├── .env.local.example               # NEXT_PUBLIC_API_URL template
│   ├── app/
│   │   ├── layout.tsx                   # Root layout (Inter font, dark mode)
│   │   ├── globals.css                  # Global styles, component classes
│   │   ├── page.tsx                     # Landing page (hero, triggers, features)
│   │   ├── register/
│   │   │   └── page.tsx                 # Registration page (wraps RegistrationForm)
│   │   ├── dashboard/
│   │   │   └── page.tsx                 # Worker dashboard (policy, claims, conditions)
│   │   ├── admin/                       # Empty (admin dashboard planned)
│   │   └── api/                         # Next.js API route dirs (6 subdirs, no files)
│   │       ├── admin/
│   │       ├── claims/
│   │       ├── policies/
│   │       ├── premiums/
│   │       ├── triggers/
│   │       └── workers/
│   ├── components/
│   │   ├── registration-form.tsx        # Multi-step registration with live premium preview
│   │   ├── policy-card.tsx              # Policy status card with actions
│   │   ├── premium-breakdown.tsx        # Visual premium factor breakdown
│   │   ├── guidewire-badge.tsx          # Guidewire branding badge
│   │   └── ui/
│   │       ├── button.tsx               # Button variants (CVA-based)
│   │       ├── card.tsx                 # Card + CardHeader + CardContent + CardTitle
│   │       ├── input.tsx                # Styled input with label support
│   │       ├── select.tsx               # Radix-based select dropdown
│   │       └── badge.tsx                # Status badge variants
│   └── lib/
│       ├── api.ts                       # Typed API client (workersApi, policiesApi, etc.)
│       ├── premium-estimate.ts          # Client-side premium estimation (mirrors backend logic)
│       ├── zones.ts                     # Zone data + risk scores (mirrors DB)
│       └── utils.ts                     # cn(), formatCurrency(), formatDate()
├── .planning/                           # GSD planning artifacts
├── README.md
├── design.md                            # Detailed design document
├── requirements.md                      # Full requirements specification
├── prompts.md                           # AI prompts used during development
└── task.md                              # Development task tracking
```

## Naming Conventions

| Convention | Example | Notes |
|-----------|---------|-------|
| Router files | `workers.py`, `claims.py` | Plural nouns, one per resource |
| API routes | `/api/v1/workers/register` | RESTful, versioned |
| Component files | `registration-form.tsx`, `policy-card.tsx` | kebab-case |
| UI primitives | `ui/button.tsx`, `ui/card.tsx` | Shadcn/ui style |
| Lib files | `api.ts`, `zones.ts` | lowercase, descriptive |
| SQL files | `schema.sql`, `zones_seed.sql` | snake_case |
| DB tables | `premium_history`, `trigger_events` | snake_case, plural |
| Policy numbers | `GS-2026-MUM-123456` | Generated format |
| Claim numbers | `CL-2026-HEA-A1B2C3D4E5F6` | Includes trigger type abbreviation |

## Key Locations

- **Add a new API endpoint**: Create or edit a file in `backend/routers/`, register in `backend/main.py`
- **Add a new page**: Create `frontend/app/{route}/page.tsx`
- **Add a UI component**: `frontend/components/` (domain) or `frontend/components/ui/` (primitive)
- **Modify design tokens**: `frontend/tailwind.config.js` and `frontend/app/globals.css`
- **Change DB schema**: Edit `backend/db/schema.sql`, run in Supabase SQL Editor
- **Retrain ML model**: Run `python ml/train_premium_model.py` from `backend/`
