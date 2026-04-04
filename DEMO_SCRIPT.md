# GottaGO Demo Recording Script

This is the step-by-step script for the person recording the demo. Follow it exactly and the flow will match the current app.

---

## Before Recording

- Frontend is deployed and reachable at your Vercel URL.
- Backend is deployed and reachable at your Render URL.
- Supabase tables are created and seeded.
- Record in a desktop browser at 1920x1080 if possible.
- Close extra tabs and turn off notifications.

If you want the full flow to work, register the worker first, then fire the admin trigger. The trigger endpoint deduplicates by city + trigger type + day, so do not reuse the same trigger twice on the same day unless you delete that trigger event from the database.

---

## Scene 1: Landing Page (0:00 - 0:20)

Open your Vercel URL.

What should be on screen:
- Brand name `GottaGO` in the top-left.
- Badge text `Guidewire DevTrails 2026 - Phase 2: Protect Your Worker`.
- Headline `India's first weekly income protection for delivery partners`.
- Buttons `Get Covered Now` and `View Demo Dashboard`.
- Trigger cards, feature cards, and the 3 stat blocks farther down.

What to do:
1. Let the landing animations settle.
2. Scroll down slowly to show the trigger cards, feature cards, and stats.
3. Scroll back to the top.
4. Click `Get Covered Now`.

---

## Scene 2: Registration Flow (0:20 - 1:05)

You will land on `/register`.

Header:
- Brand `GottaGO`
- Title `Create your cover`
- Subtitle `Takes 2 minutes. Covered for the entire week.`

### Step 1: Personal

Enter:

| Field | Value |
| --- | --- |
| Full Name | `Rajesh Kumar` |
| Mobile Number | `9876543210` |
| Primary Platform | `Swiggy` |

Click `Next Step`.

### Step 2: Work

Enter:

| Field | Value |
| --- | --- |
| City | `Mumbai` |
| Zone / Area | `Dharavi` |
| Worker ID | `SWGMUM12345` |

Move the sliders to:

| Slider | Value |
| --- | --- |
| Platform Rating | `4.5` |
| Average Hours per Week | `45` |

Pause briefly so the quote panel on the right is visible.

Click `Next Step`.

### Step 3: Earnings

Enter:

| Field | Value |
| --- | --- |
| Average Weekly Earnings (Rs.) | `6000` |

What to point out:
- The quote panel updates live.
- The premium and coverage estimate change without leaving the page.
- The final button label is `Finalize & Activate`.

Click `Finalize & Activate`.

Expected result:
- Success card with `Coverage Active`
- Policy number in `GTG-YYYY-MUM-XXXXXX` format
- Weekly premium
- Max coverage
- Button `Enter Dashboard`

Click `Enter Dashboard`.

---

## Scene 3: Worker Dashboard (1:05 - 1:35)

You will land on `/dashboard?worker_id=SWGMUM12345`.

What should be visible:
- Greeting `Welcome back, Rajesh Kumar`
- Monitoring banner near the top
- Policy card with the generated policy number
- `Premium breakdown`
- `Today's conditions`
- `Active claim timeline`

What to do:
1. Pause on the policy card.
2. Scroll enough to show the premium breakdown.
3. Pause on `Today's conditions`.
4. Scroll to `Active claim timeline` and show that there are no active claims yet.
5. Open a new tab for the admin view.

---

## Scene 4: Admin Dashboard (1:35 - 2:20)

Open `/admin`.

What should be visible:
- Header `Administrative terminal`
- Four top stat cards
- `Weekly claims forecast`
- `Liquidity reserve`
- `Fraud risk heatmap`
- `Manual protocol trigger`
- `System activity log`

What to do:
1. Pause on the top metrics.
2. Scroll to the heatmap and click a Mumbai marker. Dharavi is a good choice if visible.
3. In the popup, show the flood risk, AQI risk, and combined risk.
4. Scroll to `Manual protocol trigger`.
5. Select:

| Field | Value |
| --- | --- |
| Select city region | `Mumbai` |
| Trigger type | `Government Bandh` |

6. Click `Execute Trigger Protocol`.
7. Wait for the result box.

Expected result box:
- `Workers affected: ...`
- `Claims created: ...`
- Possibly `Claims skipped: ...` if the worker already has a duplicate or has hit a cap

For the clean demo path, you want at least `Claims created: 1`.

---

## Scene 5: Claim Appears on Worker Dashboard (2:20 - 2:45)

Go back to the worker dashboard tab and refresh.

What to show:
- The `Active claim timeline` is no longer empty.
- A new claim entry appears with staged steps such as:
  - trigger detected
  - claim submitted
  - fraud checks
  - awaiting approval or approved
  - payout scheduled or payout executed

Do not promise an exact final status. The backend can create `approved`, `pending`, or `rejected` claims depending on fraud checks. For a good demo you are looking for `approved` or `pending`.

Pause here for a few seconds. This is the zero-paperwork moment.

---

## Scene 6: Close on Admin View (2:45 - 3:00)

Go back to the admin tab and refresh.

Show:
- Updated top cards
- The reserve panel
- The system activity layout

End the video here.

---

## Troubleshooting

- Registration fails:
  Check `SUPABASE_URL` and `SUPABASE_KEY` first. The backend cannot create workers without Supabase.

- Heatmap says `No zone data available`:
  Seed the `disruption_zones` table.

- Trigger result says `Trigger already fired today`:
  Use another city/trigger combination or delete the existing `trigger_events` row for that city + trigger + date.

- Trigger creates `0` claims:
  Make sure the worker was registered in the same city and has an active policy.

- Claim does not show after refresh:
  Refresh once more after a few seconds and confirm the trigger created at least one claim.
