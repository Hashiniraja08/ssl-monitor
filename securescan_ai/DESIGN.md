---
name: SecureScan AI
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#39393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1b1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#909097'
  outline-variant: '#45464c'
  surface-tint: '#c1c6db'
  primary: '#c1c6db'
  on-primary: '#2a3040'
  primary-container: '#0b1120'
  on-primary-container: '#777c90'
  inverse-primary: '#585e70'
  secondary: '#5de6ff'
  on-secondary: '#00363e'
  secondary-container: '#00cbe6'
  on-secondary-container: '#00515d'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00150b'
  on-tertiary-container: '#008f62'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dde2f8'
  primary-fixed-dim: '#c1c6db'
  on-primary-fixed: '#151b2b'
  on-primary-fixed-variant: '#414658'
  secondary-fixed: '#a2eeff'
  secondary-fixed-dim: '#2fd9f4'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The design system is engineered for a high-fidelity security-tech environment where trust, precision, and rapid data synthesis are paramount. The brand personality is authoritative yet cutting-edge, catering to security analysts and DevOps engineers who require immediate visual confirmation of system health.

The visual style is **Corporate Modern with a Glassmorphic edge**. It utilizes a deep dark navy foundation to reduce eye strain during long monitoring sessions, punctuated by vibrant neon signals that denote status and action. The aesthetic balances the density of technical data with a clean, systematic layout, ensuring that critical security alerts are never lost in the noise.

Visual motifs include:
- **Radar Scanning:** Subtle animated gradients and circular patterns to indicate active monitoring.
- **Geometric Precision:** A strict adherence to grid lines and structured information blocks.
- **Luminosity:** Using light as a functional tool—glows indicate "active" or "alert" states rather than mere decoration.

## Colors

The color palette is anchored in a "Deep Space" navy (`#0B1120`), providing a high-contrast backdrop for functional accents. 

- **Primary Canvas:** The background and deep surfaces utilize the seed navy, creating a focused, low-distraction environment.
- **Neon Cyan (`#22D3EE`):** Used for primary actions, active states, and scanning indicators. It represents "intelligence" and "data flow."
- **Emerald Green (`#10B981`):** Reserved strictly for "Secure," "Passed," or "Encrypted" status messages.
- **Functional Accents:** Amber and Red are utilized for warning and critical alert tiers, following industry-standard safety protocols.
- **Surface Neutrals:** Slate grays are used for secondary text and borders to maintain a clear hierarchy without competing with active data points.

## Typography

This design system relies on **Inter** for its exceptional legibility and neutral, systematic character. It is paired with **JetBrains Mono** for technical data strings, certificate hashes, and log outputs to provide immediate visual differentiation between "narrative" content and "system" content.

### Hierarchy Rules
- **Headlines:** Use tight letter spacing and heavier weights to anchor sections.
- **Labels:** Use uppercase for section headers and table headers to create a "dashboard" feel.
- **Data Display:** All machine-generated content, such as IP addresses or SHA-256 hashes, must use the `code-sm` token.
- **Mobile Scaling:** For mobile viewports, `headline-xl` should scale down to 24px/32px to ensure readability without excessive wrapping.

## Layout & Spacing

The design system employs a **12-column fluid grid** for internal dashboards and a **fixed-center grid** for authentication and report pages. 

- **Grid Strategy:** Columns use a 24px gutter to maintain high data density without feeling claustrophobic.
- **Rhythm:** An 8px linear scale is used for all spatial relationships. 4px (xs) is reserved for tight component internal spacing (e.g., icon to text).
- **Density:** To accommodate large datasets, vertical padding in tables and lists is kept to `sm` (8px) or `md` (16px).
- **Responsive Behavior:** 
  - **Desktop:** 12 columns, 24px margins.
  - **Tablet:** 6 columns, 16px margins.
  - **Mobile:** 2 columns, 16px margins; complex data tables should transition to card-based layouts.

## Elevation & Depth

Depth in the design system is communicated through **Tonal Layering** and **Glassmorphism**, avoiding traditional heavy shadows.

- **Surface Levels:** 
  - **Level 0 (Background):** Deepest navy (`#0B1120`).
  - **Level 1 (Cards/Panels):** Slightly lighter navy (`#151C2C`) with a 1px border of `#1E293B`.
  - **Level 2 (Modals/Popovers):** Semi-transparent glass effect (Backdrop Blur: 12px) with a subtle Cyan-tinted inner glow.
- **Outlines:** Instead of shadows, use 1px solid borders for definition. For "Active" or "Focused" states, the border color shifts to the Secondary Cyan.
- **Glows:** Status indicators (LED style) use a soft `0 0 8px` outer glow in their respective state color (Cyan, Green, or Red) to simulate hardware lighting.

## Shapes

The design system uses **Soft (Level 1)** rounding to maintain a professional, precision-oriented feel. Excessive rounding is avoided to keep the interface looking "technical" rather than "consumer-friendly."

- **Standard Elements:** Buttons, inputs, and cards use a 0.25rem (4px) corner radius.
- **Feature Elements:** Larger containers or hero sections may use a `rounded-lg` (8px) radius to provide a slight visual softening.
- **Strict Geometry:** Elements like status tags or "pill" indicators should never be fully circular unless they are notification badges. Standard tags use the 4px radius for consistency.

## Components

### Buttons
- **Primary:** Solid Cyan (`#22D3EE`) with dark navy text. No shadow; high-contrast interaction.
- **Secondary:** Transparent background with a 1px Slate border. Text is white.
- **Ghost:** No border or background. Used for low-priority actions like "Cancel" or utility functions.

### Input Fields
- Dark backgrounds (`#0F172A`) with a subtle 1px border.
- On focus, the border glows Cyan with a 1px solid stroke.
- Labels sit above the field in `label-caps` typography.

### Cards
- Utilizes the "Level 1" surface. 
- Headers within cards are separated by a subtle horizontal rule (`#1E293B`).
- Use backdrop-blur for cards that overlay the main dashboard content.

### Status Indicators
- **Shield Icons:** Used for security scores.
- **Scanning Bar:** A thin 2px Cyan line that moves vertically across a data panel to indicate active background processes.
- **Pills:** Small, high-contrast labels for "Critical," "Low," or "Patch Available."

### Lists & Data Tables
- Use Zebra striping with a very low-opacity white (2%) or avoid striping and use 1px dividers.
- Hover states on rows should highlight the entire row with a faint Cyan tint.
- Monospace font is mandatory for ID and Hash columns.