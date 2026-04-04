# GigShield

## What This Is

GigShield is India's first weekly parametric income shield for food delivery partners (Swiggy/Zomato). It automatically pays workers when verified external disruptions — heavy rain, extreme heat, severe AQI, government bandh — destroy their earning day. Zero paperwork, zero claim forms, zero-touch payouts within 2 hours of a trigger event.

Built for Guidewire DEVTrails 2026 Hackathon, Phase 2: "Protect Your Worker". Deadline: April 4, 2026.

## Core Value

A Swiggy/Zomato delivery worker in a disruption zone receives Rs.240-480 automatically within 2 hours — without filing anything.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] REG-01: Worker registration with name, phone, platform, city, zone, rating, hours, earnings
- [ ] REG-02: Auto-create insurance policy on registration
- [ ] POL-01: Policy dashboard showing policy number, coverage, premium, status
- [ ] POL-02: Policy renew/pause/resume actions
- [ ] POL-03: Guidewire integration badges on policy sections
- [ ] PRM-01: XGBoost premium calculator with 7 input features
- [ ] PRM-02: Visual premium breakdown (factor-by-factor bars)
- [ ] PRM-03: Affordability ceiling enforcement (3% of weekly earnings)
- [ ] CLM-01: 5 parametric triggers (rain, heat, AQI, bandh, compound score)
- [ ] CLM-02: Auto-claim creation pipeline (trigger → fraud checks → payout)
- [ ] CLM-03: 4 fraud detection signals before every payout
- [ ] CLM-04: WhatsApp-style claims timeline UI
- [ ] CLM-05: Razorpay sandbox payout simulation
- [ ] ADM-01: Admin dashboard — 7-day claims forecast
- [ ] ADM-02: Fraud risk heatmap (Leaflet.js)
- [ ] ADM-03: Reserve recommendations with traffic-light indicator

### Out of Scope

- Real Guidewire API calls — simulated with our own database tables mapping to PolicyCenter/ClaimCenter/BillingCenter
- Real Swiggy/Zomato partner API — no public API exists, mocked with realistic seed data
- Real NDMA/government bandh alerts — seeded in database with admin trigger
- Real UPI payouts — Razorpay Sandbox test mode only, no real money
- Complex auth system — simple worker_id based lookup for hackathon scope

## Context

- Hackathon: Guidewire DevTrails 2026, Phase 2
- Deadline: April 4, 2026 (48 hours from project start)
- Solo/2-person team using AI coding assistants
- Primary user: mobile-first delivery workers (dark theme, large touch targets)
- Real APIs available: OpenWeatherMap One Call 3.0, WAQI AQI, Razorpay Sandbox
- 5 parametric triggers mapped to payout amounts: Rain Rs.300, Heat Rs.360, AQI Rs.240, Bandh Rs.480, Compound Rs.300

## Constraints

- **Timeline**: April 4, 2026 deadline — 3 days total
- **Tech Stack**: Next.js 14 App Router + Tailwind + Shadcn UI (frontend), Python FastAPI (backend), Supabase PostgreSQL (database), XGBoost + scikit-learn (ML)
- **Cost**: Free tiers only — OpenWeatherMap 1000 calls/day, Supabase free, Vercel free, WAQI free
- **Demo**: Must produce a 2-minute demo video covering all 4 mandatory deliverables

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 App Router | Server components + API routes in one project | — Pending |
| XGBoost for premium ML | Industry-standard gradient boosting, trains on synthetic data fast | — Pending |
| Razorpay Sandbox for payouts | Real API in test mode, demonstrates integration without real money | — Pending |
| Leaflet.js over Google Maps | Zero API key, free, OSM-backed | — Pending |
| Isolation Forest for fraud | Unsupervised — works with no labeled fraud data | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

---
*Last updated: 2026-04-02 after initialization*
