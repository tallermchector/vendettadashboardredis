---
name: vendetta_setiembre
colors:
  surface: "#17130e"
  surface-dim: "#17130e"
  surface-bright: "#3e3833"
  surface-container-lowest: "#110d09"
  surface-container-low: "#1f1b16"
  surface-container: "#231f1a"
  surface-container-high: "#2e2924"
  surface-container-highest: "#39342f"
  on-surface: "#ebe1d9"
  on-surface-variant: "#e1bfbb"
  inverse-surface: "#ebe1d9"
  inverse-on-surface: "#352f2b"
  outline: "#a88a86"
  outline-variant: "#59413e"
  surface-tint: "#ffb3ac"
  primary: "#ffb3ac"
  on-primary: "#680008"
  primary-container: "#a02020"
  on-primary-container: "#ffb4ad"
  inverse-primary: "#b02c2a"
  secondary: "#ecc246"
  on-secondary: "#3d2e00"
  secondary-container: "#b18c09"
  on-secondary-container: "#352800"
  tertiary: "#cdc6b8"
  on-tertiary: "#343027"
  tertiary-container: "#575248"
  on-tertiary-container: "#cdc6b8"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#ffdad6"
  primary-fixed-dim: "#ffb3ac"
  on-primary-fixed: "#410003"
  on-primary-fixed-variant: "#8e1115"
  secondary-fixed: "#ffe08e"
  secondary-fixed-dim: "#ecc246"
  on-secondary-fixed: "#241a00"
  on-secondary-fixed-variant: "#584400"
  tertiary-fixed: "#e9e2d4"
  tertiary-fixed-dim: "#cdc6b8"
  on-tertiary-fixed: "#1e1b13"
  on-tertiary-fixed-variant: "#4b463c"
  background: "#17130e"
  on-background: "#ebe1d9"
  surface-variant: "#39342f"
  ink-base: "#0a0806"
  ink-surface-1: "#120e0a"
  ink-surface-2: "#1f1813"
  ink-surface-3: "#2a211a"
  ink-surface-4: "#362b22"
  wood-border: "#3a2e24"
  wood-highlight: "#4a3b2e"
  parch-paper: "#eee6d8"
  parch-bright: "#f7f3ea"
  parch-muted: "#d5c8b1"
  parch-dim: "#bfae94"
  umber-text: "#3b2d20"
  crimson-bright: "#cc3333"
  crimson-deep: "#4a1010"
  gold-light: "#e3c05a"
  gold-dim: "#9a7a1c"
typography:
  display-xl:
    fontFamily: Bebas Neue
    fontSize: 36px
    fontWeight: "400"
    lineHeight: 36px
    letterSpacing: 0.05em
  display-xl-mobile:
    fontFamily: Bebas Neue
    fontSize: 28px
    fontWeight: "400"
    lineHeight: 30px
    letterSpacing: 0.04em
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 24px
    fontWeight: "400"
    lineHeight: 26px
    letterSpacing: 0.04em
  headline-md:
    fontFamily: Bebas Neue
    fontSize: 20px
    fontWeight: "400"
    lineHeight: 24px
    letterSpacing: 0.04em
  headline-sm:
    fontFamily: Bebas Neue
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 18px
    letterSpacing: 0.03em
  body-lg:
    fontFamily: Roboto Flex
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Roboto Flex
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  body-sm:
    fontFamily: Roboto Flex
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
  label-eyebrow:
    fontFamily: Roboto Flex
    fontSize: 10px
    fontWeight: "700"
    lineHeight: 12px
    letterSpacing: 0.15em
  data-timer:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: "700"
    lineHeight: 18px
    letterSpacing: 0em
  data-coords:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: "500"
    lineHeight: 14px
    letterSpacing: 0.02em
  data-micro:
    fontFamily: JetBrains Mono
    fontSize: 9px
    fontWeight: "700"
    lineHeight: 10px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.25rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

### Brand Personality & Narrative

The design system embodies the clandestine authority, calculated brutality, and vintage prestige of a 1930s Sicilian-American syndicate war room. It merges tactile period skeuomorphism—charred dark walnut, aged parchment field dossiers, wax-and-blood crimson seals, and tarnished brass trim—with the high-density ergonomics of an operational command console.

The interface positions the user not as a detached observer, but as a syndicate Don or Consigliere seated at a dimly lit mahogany desk beneath an overhead banker’s lamp, reviewing battle dispatches, laundering ledgers, and territory reports.

### Aesthetic Movement & Hybrid Style

The visual language operates at the intersection of **Tactile Noir Skeuomorphism** and **Tactical Data-Density**:

- **Atmospheric Warm Noir:** Deep charred wood and carbon ink (`#0a0806`, `#120e0a`, `#1f1813`) establish an immersive canvas with dramatic chiaroscuro contrast.
- **Physical Paperwork & Dossier Insets:** Mission manifests, soldier recruitment files, and extortion ledgers are treated as physical cutouts of aged parchment (`#eee6d8`) placed directly upon the dark desk.
- **Prestige & Lethality Accents:** Dried-blood crimson (`#a02020`, `#cc3333`) marks active operations, hostilities, and time-critical ultimatums; antique brass gold (`#c9a227`, `#e3c05a`) denotes family rank, territorial dividends, and illicit treasury.

## Colors

### Surface Hierarchy & Foundation

The dark architecture uses warm, charred timber and carbon ink undertones to eliminate sterile digital blacks:

- **`ink-base` (`#0a0806`):** Viewport floor, vignette backdrop, and recessed scroll tracks.
- **`ink-surface-1` (`#120e0a`):** Persistent frames, collapsed drawer panels, and outer shell boundaries.
- **`ink-surface-2` (`#1f1813`):** Primary interactive cards, tactical operation modules, and dialog bodies.
- **`ink-surface-3` (`#2a211a`):** Popovers, dropdown menus, and elevated interactive wells.
- **`wood-border` (`#3a2e24`) & `wood-highlight` (`#4a3b2e`):** Structural borders, card perimeter moldings, and scrollbar thumbs.

### Skeuomorphic Parchment Mechanism

Operational documents (action queues, troop rosters, and intelligence memos) employ inverted parchment surfaces (`parch-paper` `#eee6d8` and `parch-bright` `#f7f3ea`). When components adopt this treatment, all internal typography switches from light tones to `umber-text` (`#3b2d20`) and `crimson-deep` (`#4a1010`), simulating typewritten ink and physical stamp seals resting on the desk.

### Functional Accents

- **Crimson (`#a02020` / `#cc3333`):** Primary tactical driver. Dictates countdown alarms, hostile state triggers, active navigation indicator bars, unread telegram counter badges, and destructive action controls.
- **Antique Gold (`#c9a227` / `#e3c05a`):** Secondary authority driver. Signifies family prestige rank, territory coordinates, illicit vault holdings, and resource gauge fills.

## Typography

### Hierarchy & Style Roles

- **Headlines (`Bebas Neue`):** Condensed, authoritative, and cinematic. Rendered in all-caps across display and section titles with slight positive tracking (`0.03em` to `0.05em`) to evoke vintage mafia dossier headings and newspaper wire reports.
- **Reading & Interface Body (`Roboto Flex`):** Clean and unobtrusive, providing rapid scannability within complex data panels. Eyebrow headers ("JUGADOR", "FAMILIA", "OPERACIONES") are capitalized with heavy tracking (`0.15em`).
- **Tactical Data & Clocks (`JetBrains Mono`):** Dedicated to tabular numbers, countdown timers, resource balances, and territory coordinates. Ensures dynamic numeric counts decrement and increment without triggering layout reflows or horizontal jitter.

### Contrast Application

On dark surfaces (`ink-surface-1`, `ink-surface-2`), primary titles use `parch-bright` (`#f7f3ea`), while secondary descriptions use `parch-muted` (`#d5c8b1`). Inside parchment sheets, titles and copy invert to `umber-text` (`#3b2d20`) or `crimson-deep` (`#4a1010`).

## Layout & Spacing

### Layout Architecture

- **Persistent Command Sidebar (Desktop):** A fixed 256px (`w-64`) left-side navigational spine anchoring syndicate identity, active safehouses, and strategic dispatch links.
- **Top Ledger Header:** Fixed 56px (mobile) to 64px (desktop) utility bar containing real-time server time, coordinate locators, and adaptive resource gauges.
- **Main War Room Canvas:** Fluid multi-column operational grid centered within a maximum width boundary of 1280px (`max-w-7xl`).

### Responsive Adaptation

- **Mobile (< 768px):** Navigation transitions into an off-canvas drawer slide-out overlaid atop a blurred scrim (`bg-ink/80 backdrop-blur-sm`). The resource bar condenses full titles and icons into compact monospace acronyms (ARM, MUN, ALC, DOL). Content stacks into a single column with `margin: 1rem`.
- **Tablet (768px – 1024px):** Layout reflows into a 2-column grid with `gutter-md: 1.25rem`. Resource labels expand to compact icons plus values.
- **Desktop (> 1024px):** 3-column asymmetric layout: Family & Queues (4 columns), Territorial Map & Operations (5 columns), Financial Ledger & Comms (3 columns). Outer page padding scales to `margin-lg: 2rem`.

### Density & Rhythms

Spacing is grounded on a tight 4px increment scale. Intra-component gaps use `space-xs` (4px) and `space-sm` (8px) to maximize visible intel above the fold, while macro modules maintain breathing room via `space-lg` (24px) gaps.

## Elevation & Depth

### Atmospheric Overhead Lighting

Depth is established through physical environmental lighting rather than abstract drop shadows:

- **Desk Lamp Vignette:** Viewport floors employ a subtle elliptical overhead lighting gradient (`radial-gradient(ellipse at 50% 0%, rgba(201, 162, 39, 0.05), transparent 60%)`), simulating a lone banker's lamp casting warm amber onto dark wood.
- **Tactical Cartography Grid:** Empty canvas spaces utilize a faint background dot matrix (`radial-gradient(circle, rgba(201, 162, 39, 0.10) 1px, transparent 1px)`) sized at 22px intervals.

### Layered Dossier Shadows & Borders

- **Dossier Shadow:** High-density contact separation combining an inset cream rim-light with an ambient shadow: `0 1px 0 0 rgba(238, 230, 216, 0.06), 0 8px 24px -8px rgba(0, 0, 0, 0.8)`. Applied to cards, dropdown menus, modal frames, and toast notifications.
- **Low-Contrast Structural Framing:** All major modules are bound by 2px solid `#3a2e24` (`wood-border`), preventing floating flat surfaces and creating physical border bevels.
- **Active Inset Ribbons:** Selected navigation items receive a solid crimson left-edge keyline using an inset shadow: `inset 3px 0 0 0 #a02020`.

### Layer Index Hierarchy

- `z-40`: Mobile drawer backdrop scrim.
- `z-50`: Sliding mobile command drawer.
- `z-70`: Operational modal containers and interrogation overlays.
- `z-80`: Syndicate wire toasts and flash notifications.
- `z-90`: Zero-JS pure CSS hover tooltips.

## Shapes

### Shape Language & Geometry

The geometry is rigid, sharp, and disciplined (`roundedness: 1`), evoking cut cardstock, steel weapon serial plates, and leather-wrapped binders:

- **Sharp & Micro Edges (0.125rem - 0.25rem / `rounded-sm` - `rounded`):** Coordinate chips, countdown badge pills, resource meter bars, and queue status blocks.
- **Soft Component Edges (0.375rem - 0.5rem / `rounded-md` - `rounded-lg`):** Interactive trigger buttons, tactical dossier cards, dropdown sheets, and modal frames.
- **Full Circles (`rounded-full`):** Strictly restricted to circular family wax crests, syndicate portrait avatars, and status indicator LEDs.

### Framing Accents

Cards feature a top accent ribbon (4px / `h-1`) flush to the upper perimeter:

- Combat & Hitman Modules: Crimson gradient (`from-crimson via-crimson/40 to-transparent`).
- Family & Treasury Modules: Antique gold gradient (`from-gold via-gold/30 to-transparent`).
- Utility Dividers: Tapered hairline rules fading to transparent at both ends (`linear-gradient(90deg, transparent, #3a2e24 18%, #3a2e24 82%, transparent)`).

## Components

### Buttons & Action Controls

- **Primary Syndicate Action (Attack / Deploy):**
  Constructed on `#a02020` with a 1px border in `#cc3333`. Label set in uppercase Bebas Neue in `#f7f3ea`. Hover shifts background to `#cc3333` with an outer crimson glow.
- **Secondary Action (Inspect / Manage):**
  Dark wood surface `#1f1813` framed in 1px `#3a2e24`. Label in `#eee6d8`. Hover shifts background to `#2a211a` with `#4a3b2e` highlight borders.
- **Destructive / Abort Action:**
  Dark transparent fill with 1px `#a02020` border, shifting to solid crimson fill on hover with `#f7f3ea` typography.

### Modular Dossier Cards

- **Dark Dossier (Standard Container):**
  Built on `#1f1813` with `shadow-dossier` and 2px `#3a2e24` borders. Top edge features the gradient accent ribbon. Headers employ Bebas Neue with tracking and a bottom hairline divider.
- **Parchment Inset Ledger:**
  High-contrast `#eee6d8` paper panel set within dark cards. Features fibrous paper texture overlays, dark umber headings (`#3b2d20`), and monospace metrics.

### Resource Gauges & Meters

- **Track Well:** 6px to 8px height with `#120e0a` fill, surrounded by a 1px `#2a211a` border.
- **Fill Logic:**
  - Standard Yield: Antique gold (`#c9a227`).
  - High Storage Warning (>80%): Amber (`#f59e0b`).
  - Critical Capacity Alert (>95%): Crimson (`#cc3333`).
- **Data Indicator:** Monospace label (`JetBrains Mono`, 11px) indicating current stock vs. ceiling.

### Queue Rows & Timers

- Packaged inside parchment sheets with 3px left status indicator bars (emerald for rackets, sky-blue for troop training, crimson for mob war).
- Titles use 13px bold Roboto in dark umber.
- Active countdowns render via 14px bold `JetBrains Mono` in `#a02020` or `#3b2d20`, synchronized to server timestamps without text jumping.

### Form Fields & Inputs

- **Text & Numeric Inputs:**
  Carved-wood well aesthetic: background in `#0a0806`, inset shadow, and 1px `#3a2e24` border. Focus state activates a sharp 1px `#c9a227` brass outline. Text renders in cream monospace.
- **Checkboxes & Radios:**
  16px squared dark wood boxes. Selected state displays `#a02020` fill with an antique gold check icon.

### Tactical Badges & Chips

- **Coordinate Chip:** Deep wood pill (`#120e0a`) with 1px `#3a2e24` border, gold crosshair icon, and monospace coordinate string `[XX:YY:ZZ]`.
- **Status Pills:** Pill badges with `#4a1010` fill, `#a02020` outline, and bold monospace uppercase text.
