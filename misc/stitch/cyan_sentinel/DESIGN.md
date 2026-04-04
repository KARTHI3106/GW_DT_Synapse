# Design System Document: Tactical Depth & Technical Precision

## 1. Overview & Creative North Star
**The Creative North Star: The Sovereign Vault**
This design system is built on the philosophy of "The Sovereign Vault." It moves away from the generic "SaaS Dashboard" aesthetic toward an editorial, high-security financial experience. We evoke trust not through decorative flair, but through hyper-clean execution, intentional negative space, and a rigid adherence to technical precision. 

The layout strategy favors **Intentional Asymmetry**. Rather than a perfectly centered grid, we use weighted sidebars and offset content blocks to guide the eye. This breaks the "template" feel, signaling to the user that this experience was bespoke-crafted for their financial security.

---

## 2. Colors & Surface Architecture
The palette is a monochrome deep-sea environment punctuated by "electric" data points. We use a strictly defined hierarchy of dark tones to create depth without the use of traditional lines.

### The "No-Line" Rule
**Borders are a design failure.** To separate sections, designers must use background color shifts. A `surface-container-low` section sitting on a `background` provides all the separation needed. High-contrast 1px lines clutter the interface; we define boundaries through tonal transitions.

### Surface Hierarchy
We treat the UI as a series of physical layers. Nesting is the primary tool for information architecture:
*   **Background (`#090e19`):** The base canvas.
*   **Surface-Container-Low (`#0c1323`):** Large structural groupings (e.g., sidebar background).
*   **Surface-Container (`#0f192e`):** The standard card or content area.
*   **Surface-Container-High (`#121f39`):** Interactive states or nested inner-cards.

### Key Tokens
*   **Primary:** `#7bd0ff` (Actionable elements, high-importance accents)
*   **Primary Container:** `#004c69` (Subtle highlights, active menu states)
*   **On-Surface:** `#dde5ff` (Primary text)
*   **On-Surface-Variant:** `#9babd2` (Secondary/Instructional text)

---

## 3. Typography: The Editorial Scale
We pair the utilitarian **Inter** with the technical **JetBrains Mono** to balance human readability with machine precision.

*   **Display (Inter, 2.25rem - 3.5rem):** Reserved for high-level "Hero" data points. Use a tight letter-spacing (-0.02em) to create a sophisticated, compact feel.
*   **Headline & Title (Inter, 1.125rem - 2rem):** Used for section headers. Always use `on-surface` (`#dde5ff`) to ensure authority.
*   **Body (Inter, 0.875rem - 1rem):** The workhorse. Maintain a line-height of 1.5 for readability against the dark background.
*   **Technical Labels (JetBrains Mono, 0.75rem):** Use for IDs, transaction hashes, and timestamps. This font switch signals to the user that they are looking at "Raw Data," reinforcing the Shield's technical prowess.

---

## 4. Elevation & Depth
Depth in this system is achieved through **Tonal Layering**, not shadows. Shadows are reserved specifically for floating modal elements or primary action triggers.

### The Layering Principle
To lift a card, move it from `surface-container` to `surface-container-high`. To recess an input, use `surface-container-low`.

### Ambient Glows (The "Shadow-Glow-Sky")
When a floating effect is required (e.g., a hover state on a primary action), do not use a black shadow. Use a diffused sky-blue glow:
*   **Shadow-Glow-Sky:** `0px 10px 40px -10px rgba(56, 189, 248, 0.15)`
*   This mimics the light emitted from high-end display hardware, reinforcing the "Tech" aspect of the brand.

### The Ghost Border Fallback
If contrast testing requires a boundary, use a **Ghost Border**: `outline-variant` (`#384869`) at 15% opacity. This provides a "hint" of a container without breaking the seamless tonal flow.

---

## 5. Components

### Buttons
*   **Primary:** `primary` background, `on-primary` text. Radius: `8px`. Use a subtle `shadow-glow-sky` on hover.
*   **Secondary:** No background. `outline` border at 20% opacity. Text in `primary`.
*   **Ghost:** No background or border. Text in `on-surface-variant`. On hover, shift background to `surface-container-high`.

### Input Fields
*   **Base State:** Background `surface-container-low`, no border.
*   **Focus State:** 1px solid `primary`. Label shifts to `primary` color.
*   **Error State:** Background `error_container` at 10% opacity, 1px solid `error`.

### Cards & Data Lists
*   **Rule:** Forbid divider lines. 
*   **Implementation:** Use a 16px or 24px vertical gap (Spacing Scale). For complex lists, use alternating row tints using `surface-container-lowest` and `surface-container-low`.
*   **Radius:** Cards must use a strict `12px` (lg) radius for a modern, approachable yet professional silhouette.

### Additional Component: The "Shield Badge"
A custom status indicator.
*   **Construction:** A small `JetBrains Mono` label encased in a pill-shaped container.
*   **Visual:** Low-opacity background of the status color (e.g., `success` at 10%) with solid text of the same color. No border.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Mono for Numbers:** Always use `JetBrains Mono` for currency and ID values to ensure tabular alignment and a "data-first" feel.
*   **Embrace Negative Space:** If a screen feels "empty," do not fill it with decorative elements. Let the typography breathe.
*   **Layer Surfaces:** Use at least three levels of nesting to create a sense of physical architecture in the dashboard.

### Don’t:
*   **Don't Use Gradients:** The brand is built on "Solid Trust." Avoid all gradients, including subtle ones in buttons.
*   **Don't Use Pure Black:** `#000000` is reserved only for `surface-container-lowest` in extreme high-contrast moments. The background is a deep navy-charcoal (`#090e19`).
*   **Don't Use Purple:** Any hint of violet or purple is a violation of the system's technical identity. Stay within the Sky-Blue and Navy-Slate spectrum.
*   **Don't Default to 100% Opacity Borders:** If you feel the urge to draw a line, try changing the background color of the section instead.