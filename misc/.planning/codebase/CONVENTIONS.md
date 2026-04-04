# Conventions

## Python (Backend)

### Code Style
- Standard Python conventions: snake_case functions/variables, PascalCase classes
- Type hints used on function signatures and Pydantic models
- No linter/formatter config files present (no black, ruff, or flake8 config)
- No docstring convention enforced; docstrings present on some functions (especially mock/simulated ones)

### Pydantic Models
- Request models defined inline at the top of router files (not in a shared `models/` directory)
- `backend/models/__init__.py` exists but is empty
- Pydantic `BaseModel` used for request validation; `Field` used for constraints (`ge`, `le`, `pattern`)
- `Literal` types used for enum-like fields (platform, city)

### Router Pattern
```python
router = APIRouter()

class RequestModel(BaseModel):
    field: str

@router.post("/endpoint", response_model=ResponseModel, status_code=201)
async def handler(body: RequestModel):
    supabase = get_supabase()
    # ... business logic inline in handler
```

### Error Handling
- `HTTPException` raised directly in routers for HTTP errors (400, 404, 409, 500)
- `RuntimeError` raised in services for internal failures
- No centralized error handler middleware
- External API calls wrapped in try/except with safe defaults (e.g., AQI returns 50.0 on failure)

### Imports
- Relative imports within packages: `from db.supabase import get_supabase`
- No `__init__.py` re-exports; each module imported directly

## TypeScript (Frontend)

### Code Style
- TypeScript strict mode enabled
- Functional components with explicit props interfaces
- `'use client'` directive on interactive pages/components
- Path alias `@/*` for imports (e.g., `@/components/ui/button`)

### Component Pattern
```tsx
// UI primitives use CVA (class-variance-authority)
const buttonVariants = cva("base-classes", {
  variants: { variant: { default: "...", outline: "..." }, size: { ... } },
  defaultVariants: { ... },
})

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(/* ... */)
```

### State Management
- React `useState` + `useEffect` for local data fetching
- No global state management library
- `useSearchParams()` for URL-driven state (dashboard worker_id)
- `useCallback` for memoized fetch functions

### Styling
- Tailwind CSS utility classes with custom design tokens
- `cn()` utility (`clsx` + `tailwind-merge`) for conditional classes
- Component-level CSS utilities defined in `globals.css` via `@layer components`
- Dark mode only (hardcoded `className="dark"` on `<html>`)

### Animation
- `framer-motion` for page animations (fade-up, scale-in)
- CSS `@keyframes` for loading states (pulse, slide-up, bar-fill)

### Data Formatting
- `formatCurrency()` — formats as `Rs.X,XXX` (Indian locale)
- `formatDate()` — `en-IN` locale, `day month year` format
- Currency always in Rs. (Indian Rupees), no internationalization

## Cross-Cutting Patterns

### API Versioning
- All backend routes prefixed with `/api/v1/`
- Frontend proxy rewrites at the same path

### Singleton Pattern
- `@lru_cache(maxsize=1)` used for Supabase client and XGBoost model loading
- Ensures single instance per process lifetime

### Mock/Simulated Annotations
- Functions simulating Guidewire integration include `[MOCK/SIMULATED]` in docstrings
- Production API endpoints documented as comments for future replacement

### Data Duplication
- Zone risk scores duplicated between `backend/db/zones_seed.sql` and `frontend/lib/zones.ts`
- Premium calculation logic duplicated between `backend/ml/premium_calculator.py` and `frontend/lib/premium-estimate.ts`
- Policy number generation duplicated between `backend/routers/policies.py` and `backend/services/policy_service.py`
