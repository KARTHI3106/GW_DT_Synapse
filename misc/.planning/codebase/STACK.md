# Stack

## Languages & Runtimes

| Layer    | Language   | Version / Notes          |
|----------|-----------|--------------------------|
| Backend  | Python    | 3.x (venv in `backend/venv/`) |
| Frontend | TypeScript | 5.3.3 (strict mode)     |
| Database | SQL (PostgreSQL) | Via Supabase hosted Postgres |

## Backend Framework

- **FastAPI** 0.109.0 — async Python API framework
- **Uvicorn** 0.27.0 — ASGI server (`uvicorn main:app --reload`)
- Entry point: `backend/main.py`

## Frontend Framework

- **Next.js** 14.1.0 — App Router (directory-based routing under `frontend/app/`)
- **React** 18.2.x
- **Tailwind CSS** 3.4.1 with custom design system tokens in `frontend/tailwind.config.js`
- Dark mode enabled via `class` strategy

## Key Dependencies

### Backend (`backend/requirements.txt`)

| Package           | Version    | Purpose                          |
|-------------------|-----------|----------------------------------|
| fastapi           | 0.109.0   | REST API framework               |
| uvicorn[standard] | 0.27.0    | ASGI server                      |
| supabase          | 2.3.0     | Supabase Python client (DB + auth) |
| xgboost           | 2.0.3     | ML model for premium pricing     |
| scikit-learn      | 1.4.0     | Model training utilities         |
| pandas            | 2.1.4     | Data manipulation for ML         |
| numpy             | 1.26.3    | Numerical computation            |
| httpx             | >=0.24,<0.28 | Async HTTP client (weather/AQI APIs) |
| pydantic          | 2.5.3     | Request/response validation      |
| pydantic-settings | 2.1.0     | Env-based configuration          |
| joblib            | 1.3.2     | ML model serialization           |
| python-dotenv     | 1.0.0     | .env file loading                |

### Frontend (`frontend/package.json`)

| Package               | Version   | Purpose                        |
|-----------------------|----------|--------------------------------|
| next                  | 14.1.0   | React meta-framework           |
| react / react-dom     | ^18.2.0  | UI library                     |
| @radix-ui/* (6 pkgs)  | various  | Headless UI primitives (dialog, select, slider, tooltip, label, separator) |
| framer-motion         | ^11.0.3  | Animation library              |
| lucide-react          | ^0.323.0 | Icon library                   |
| recharts              | ^2.10.3  | Charting (not yet used in views) |
| leaflet + react-leaflet | ^1.9.4 / ^4.2.1 | Map rendering (admin heatmap, not yet wired) |
| clsx + tailwind-merge | ^2.1.0 / ^2.2.0 | Conditional class merging (`cn()`) |
| class-variance-authority | ^0.7.0 | Component variant system       |

## Configuration

### Backend
- `backend/config.py` — Pydantic `BaseSettings` loading from `.env`
- Required env vars: `SUPABASE_URL`, `SUPABASE_KEY`, `OPENWEATHERMAP_API_KEY`, `WAQI_TOKEN`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- All have empty string defaults (app starts but external calls fail)

### Frontend
- `frontend/.env.local` — `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)
- `frontend/next.config.js` — API proxy rewrites `/api/v1/*` to backend
- `frontend/tsconfig.json` — strict mode, path alias `@/*` maps to project root
- `frontend/tailwind.config.js` — custom design tokens (brand, surface, text, status colors)

## Build & Run

```bash
# Backend
cd backend && .\venv\Scripts\activate && uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm run dev    # port 3000
```

## Package Manager

- Backend: pip (venv-based, `requirements.txt`)
- Frontend: npm (`package-lock.json` present)
