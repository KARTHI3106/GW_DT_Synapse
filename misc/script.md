# GottaGO Demo Voiceover Script

Use this voiceover while following `DEMO_SCRIPT.md`.

---

## 0:00 - 0:20 Landing Page

> "This is GottaGO, a weekly income protection platform for delivery partners."
>
> "When heavy rain, extreme heat, severe AQI, or a government bandh wipes out a worker's earning day, GottaGO detects the disruption and starts the claim flow automatically."
>
> "The key promise is simple: zero paperwork, fast payout, and protection built around real-world triggers."

---

## 0:20 - 1:05 Registration

> "Let's register a worker. The flow is split into three steps: personal details, work profile, and weekly earnings."
>
> "Here we enter Rajesh Kumar, a Swiggy rider in Dharavi, Mumbai, one of the higher-risk operating zones in the system."
>
> "As we choose the city, zone, rating, hours, and weekly earnings, the quote panel updates in real time."
>
> "This premium is not static. It is recalculated from zone risk, AQI history, weekly hours, seasonality, and worker rating."
>
> "Once we submit, GottaGO instantly creates a live policy and gives us a policy number in the GTG format."

---

## 1:05 - 1:35 Worker Dashboard

> "This is the worker dashboard."
>
> "At the top, the worker can see that monitoring is active. Below that is the policy card, the premium breakdown, and today's operating conditions."
>
> "The premium breakdown makes the pricing logic transparent instead of hiding it behind a black box."
>
> "Right now the claim timeline is empty, because no disruption has been triggered yet."

---

## 1:35 - 2:20 Admin Dashboard

> "Now we switch to the administrative terminal."
>
> "This view brings together claims forecasting, reserve health, a fraud risk heatmap, and a manual protocol trigger for demo and operations use."
>
> "The heatmap shows zone-level risk across the seeded cities. Clicking a zone reveals the flood risk, AQI risk, and combined score."
>
> "To simulate a real event, we trigger a government bandh in Mumbai."
>
> "The backend records the trigger event, finds matching workers with active policies, and auto-creates claims for those workers."

---

## 2:20 - 2:45 Claim Timeline

> "Back on the worker dashboard, the claim appears without the worker filing anything."
>
> "The timeline shows the trigger detection step, claim creation, fraud review, and the payout stage."
>
> "That is the core idea behind GottaGO: the trigger itself becomes the proof, so the worker does not need to upload documents or call support."

---

## 2:45 - 3:00 Close

> "GottaGO is built with a Next.js frontend, a FastAPI backend, and Supabase for persistence."
>
> "It can pull live signals from OpenWeatherMap and WAQI, and it supports Razorpay and Guidewire integration paths when those credentials are configured."
>
> "GottaGO turns verified disruption signals into a fast, visible, low-friction protection workflow for delivery workers."
