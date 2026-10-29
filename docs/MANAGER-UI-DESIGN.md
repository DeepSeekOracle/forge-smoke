# FORGE SMOKE — CYBORG MANAGER
## UI/UX design specification v2.0 — "DRYDOCK"

> The player is a **bay engineer**, not a soldier. The screen is a maintenance terminal for a machine
> they own and send to die. It should feel like industrial equipment with a premium finish: brushed
> steel, amber work-lights, holographic readouts, and the quiet menace of a hangar at 3 a.m.

---

## 0. Design pillars

1. **Machine, not menu.** Panels are bolted plates and instrument clusters. No rounded glass cards, no
   soft gradients, no "app" gloss. Every surface has a reason to exist.
2. **The cyborg is the hero.** The 3D turntable is centre frame, always. UI orbits it; it never covers it.
3. **One decision per screen.** Equip → upgrade → launch. Depth comes from *layers*, not crowding.
4. **Progress must be legible at a glance.** Level, XP, banked legendary count and the next unlock are
   visible from every tab without navigating.
5. **Legibility beats decoration.** Display type is condensed and hard; body type is neutral and plain.
   Contrast is measured, not eyeballed (≥ 4.5:1 body, ≥ 3:1 large).

---

## 1. Visual direction

### 1.1 Palette (extends the in-game `theme.js` tokens)

| Token | Hex | Role |
|---|---|---|
| `--void` | `#07090C` | app background, deepest shadow |
| `--plate` | `#0E1319` | panel body |
| `--plate-2` | `#131A22` | raised panel / slot wells |
| `--hairline` | `#1E2A35` | 1 px panel borders, dividers |
| `--steel` | `#2C3A47` | metal bevels, inactive strokes |
| `--text` | `#E8F1F8` | primary text |
| `--muted` | `#7E93A6` | labels, secondary |
| `--amber` | `#FFB347` | **primary accent** — work lights, active tabs, CTA |
| `--amber-dim` | `#8C5E1F` | amber at rest / disabled |
| `--cyan` | `#6FE3FF` | secondary accent — light mods, holograms |
| `--mint` | `#7CE6A8` | positive: integrity, XP gain, unlocked |
| `--danger` | `#F2545B` | destructive, damage, locked-by-risk |
| `--gold` | `#FFD166` | legendary rarity |

**Rarity ramp** (§1.4) is the only place saturated colour is allowed to dominate.

### 1.2 Typography

| Use | Family | Weight / tracking | Size (px) |
|---|---|---|---|
| Display / screen title | condensed grotesque — *Barlow Condensed*, *Oswald* | 700, tracking +0.06em, uppercase | 34–44 |
| Section header | same | 700, +0.16em, uppercase | 11–12 |
| Body / description | *Inter*, *IBM Plex Sans* | 400/500 | 13–14 |
| Numerals (stats, XP, timers) | tabular mono — *JetBrains Mono*, *IBM Plex Mono* | 700, tabular-nums | 20–30 |
| Micro labels | mono | 500, +0.18em, uppercase | 9–10 |

Rules: display never used for body; mono never used for prose; numbers always tabular so they don't
jitter when they tick.

### 1.3 Materials & surface treatments

| Material | Where | How |
|---|---|---|
| **Brushed steel** | panel headers, slot rails | 1 px top highlight `rgba(255,255,255,.06)`, 1 px bottom shadow, faint horizontal noise (2 % opacity repeating linear-gradient) |
| **Painted armour** | cyborg body, big plates | base colour + chipped-edge trim sheet; wear concentrated on corners and edges only |
| **Emissive strip** | active tab underline, CTA edge, rarity frames | solid colour + `box-shadow: 0 0 12px`, plus a 1 px inner light line |
| **Hologram** | tooltips, legendaries, the "scan" overlay | `background: repeating-linear-gradient` scanlines at 3 % opacity + cyan 8 % tint + soft outer glow; slight vertical drift animation |
| **Wear / damage** | rare+ item art, bay floor decor | edge scratches, oil gradient under the turntable, dust motes in the key light |
| **Glass (sparingly)** | never — use plate instead | only the tab bar uses `backdrop-filter: blur(10px) saturate(1.1)` |

Lighting logic: **one key light** (amber, top-left), **one rim** (cyan, back-right). Panels are lit from
the same side so the screen reads as one place.

### 1.4 Rarity tiers — the emotional ladder

| Tier | Frame | Fill | Glow | Motion | Sound |
|---|---|---|---|---|---|
| **Common** | 1 px `--steel` | `--plate-2` | none | none | soft click |
| **Uncommon** | 1 px `#4E7A5C` | 4 % mint tint | none | none | click + tick |
| **Rare** | 1 px `#3E7FA8` | 6 % cyan tint | 6 px cyan, 20 % | 1 slow sheen / 6 s | click + chime |
| **Epic** | 2 px gradient cyan→violet | 8 % tint | 12 px violet, 30 % | sheen 4 s + corner ticks | chime + sub thump |
| **Legendary** | 2 px gold gradient + 1 px inner light | 10 % gold | 18 px gold, 40 % + **slow pulse** | sheen 3 s + rising motes | **sting**: reversed cymbal + sub drop |
| **Mythic** | animated conic gold→magenta | 12 % magenta | 24 px, 50 % | sheen 2.5 s + orbit ring | sting + choir pad |

Rarity must be readable **by shape as well as colour** (border thickness + corner marks) for
colour-blind players. Legendary adds a small hexagonal corner badge.

---

## 2. Screen map

```
TITLE ──► BAY (manager) ──► LAUNCH ──► ARENA (autonomous) ──► RESULTS ──► BAY
              │  ▲                                                          │
              │  └──────────────────────────────────────────────────────────┘
              ├─ ARSENAL     (weapons, secondaries, suits)
              ├─ POWER-UPS   (ability cards, light mods, perks)
              ├─ UPGRADES    (attribute point spend, milestone track)
              └─ ARCHIVE     (legendary collection, run history)
```

Tabs are **lateral**, never nested. The turntable and the LAUNCH bar persist across all four tabs —
you are always one click from deploying.

---

## 3. Wireframes

### 3.1 BAY — the default screen (three-column instrument bay)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◈ FORGE-1 // OLIVE SPEC-OPS        LV 12   ▓▓▓▓▓▒▒▒▒▒  312/410 XP   ⬢ 3  ⚙  │  top bar
│ ──────────────────────────────────────────────────────────────────────────── │
│ [ BAY ]  ARSENAL   POWER-UPS   UPGRADES   ARCHIVE                            │  tabs
├───────────────┬──────────────────────────────────────────┬───────────────────┤
│ ATTRIBUTES    │                                          │ EQUIPPED          │
│ ┌───────────┐ │            ███  CYBORG  ███              │ ┌───────────────┐ │
│ │ POWER   24│ │         (3D turntable, slow orbit)       │ │ PRIMARY       │ │
│ │ ARMOR   21│ │            key light from upper-left     │ │  NEON LASER   │ │
│ │ AGILITY 18│ │                                          │ │  ◆ epic       │ │
│ │ HANDLING19│ │   ┌────────┐        ┌────────┐           │ └───────────────┘ │
│ │ TECH    22│ │   │ SUIT   │        │ WEAPON │           │ ┌───────────────┐ │
│ │ SIGNAL  16│ │   │ slot   │        │  slot  │           │ │ SECONDARY     │ │
│ └───────────┘ │   └────────┘        └────────┘           │ │  THUMPER      │ │
│               │                                          │ └───────────────┘ │
│ LIGHT MODS    │   ┌──────┐ ┌──────┐ ┌──────┐             │ ┌───────────────┐ │
│  ▣ Floodlight │   │ PERK │ │ PERK │ │ PERK │             │ │ LEGENDARY     │ │
│  ▣ Orb rounds │   └──────┘ └──────┘ └──────┘             │ │  ◈ JETPACK    │ │
│               │                                          │ └───────────────┘ │
├───────────────┴──────────────────────────────────────────┴───────────────────┤
│ ARENA  [ PERIMETER ▸ ] [ BREACH YARD 🔒 ] [ GUNSHIP PAD 🔒 ]   ⬢ BUDGET 3    │
│                   ▶ LAUNCH CYBORG        (hold 0.6 s to confirm)             │
└──────────────────────────────────────────────────────────────────────────────┘
```

Panel hierarchy: **top bar (identity/level/currency) → tab bar → body (3 columns) → launch bar**.
The 3D viewport is the only region with no plate behind it, so the eye lands there first.

### 3.2 ARSENAL — inventory + compare

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [ BAY ]  [ARSENAL] POWER-UPS  UPGRADES  ARCHIVE            FILTER: ▾ weapon  │
├───────────────────────────────┬──────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────┐ │  NEON LASER // BEAM            ◆ EPIC        │
│  │ SMG    │ │ BEAM ◉ │ │RAIL│ │  ─────────────────────────────────────────   │
│  │ common │ │ epic   │ │leg │ │  DAMAGE   18  ▓▓▓▓▓▓▓▒▒▒                     │
│  └────────┘ └────────┘ └────┘ │  RATE     7/s ▓▓▓▓▓▓▓▓▒▒                     │
│  ┌────────┐ ┌────────┐ ┌────┐ │  RELOAD  0.9s ▓▓▓▓▓▓▓▓▓▒                     │
│  │ FLAMER │ │ THUMPER│ │ …  │ │  LIGHT    +40% lit damage                    │
│  └────────┘ └────────┘ └────┘ │                                              │
│  ── owned: 9 / 12 ──          │  COMPARE WITH SECONDARY:  ▲ +6 dmg ▼ −1 rate │
│                               │  [ EQUIP TO PRIMARY ]  [ EQUIP TO SECONDARY] │
└───────────────────────────────┴──────────────────────────────────────────────┘
```

Grid left, *inspector* right. Hover a card = its stats preview in the inspector; click = select;
double-click / `E` = equip. Compare row is always visible, showing deltas vs the other slot.

### 3.3 POWER-UPS — card browser (the live-run job, designed)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [ BAY ]  ARSENAL  [POWER-UPS]  UPGRADES  ARCHIVE   SLOTS 3/3   ▾ category    │
├──────────────────────────────────────────────────────────────────────────────┤
│  EQUIPPED (spent at launch)              DECK (in-run draws)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  ┌────┐┌────┐┌────┐┌────┐            │
│  │ LUMEN-X  │ │ PHOSPHOR │ │ SOLAR    │  │ +35││ +20││ RICO││ ... │           │
│  │ ▓ rare   │ │ ▓ rare   │ │ ▓ epic   │  └────┘└────┘└────┘└────┘            │
│  └──────────┘ └──────────┘ └──────────┘  12 of 20 cards in pool             │
│                                                                              │
│  AVAILABLE  [all] [light] [damage] [defence] [utility]                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                      │
│  │ card   │ │ card   │ │ card   │ │ card   │ │ card   │   ← hover lifts,     │
│  │        │ │        │ │        │ │        │ │        │     rare+ sheens     │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

Two distinct concepts, visually separated: **EQUIPPED** (permanent loadout, costs a slot) vs **DECK**
(what can be drawn during the run). Players must never confuse "I own it" with "I brought it".

### 3.4 UPGRADES — attribute spend + milestone track

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [ BAY ]  ARSENAL  POWER-UPS  [UPGRADES]  ARCHIVE        UNSPENT POINTS: 3    │
├────────────────────────────────┬─────────────────────────────────────────────┤
│  POWER      24   [ + ]          │  MILESTONE TRACK                            │
│  ARMOR      21   [ + ]          │  ●────●────●────●────○────○────○────○        │
│  AGILITY    18   [ + ]          │  L1   L3   L5   L7   L10  L14  L20  L30     │
│  HANDLING   19   [ + ]          │  ✓     ✓    ✓    ✓    next: JETPACK FRAME   │
│  TECH       22   [ + ]          │                                             │
│  SIGNAL     16   [ + ]          │  NEXT MILESTONE: LV 10 — unlock JETPACK     │
│                                 │  reward preview ▸ [ ◈ JETPACK ]             │
└────────────────────────────────┴─────────────────────────────────────────────┘
```

`+` is disabled at 0 points with a tooltip ("earn points at levels 13, 16, 20"). Milestone track is a
rail, not a bar — it shows *what* is coming, not just how far.

### 3.5 RESULTS → LEGENDARY REVEAL (post-run, before returning to the bay)

```
1. RESULTS (2 columns)                     2. LEGENDARY REVEAL (full-bleed)
┌───────────────────────────┐              ┌──────────────────────────────────┐
│ RUN ENDED — DESTROYED     │              │        ◈ ARENA CLEARED ◈         │
│ TIME 08:42   KILLS 64     │              │                                  │
│ XP GAINED      +1,240     │   ────────►  │        ██  JETPACK  ██           │
│ ▓▓▓▓▓▓▓▓▓░░  LV 12 → 14   │              │      (holo card, gold pulse)     │
│ BANKED        ⬢ 3 → ⬢ 4   │              │   "movement tier: vertical"      │
│ [ RETURN TO BAY ]         │              │   [ ADD TO ARSENAL ]             │
└───────────────────────────┘              └──────────────────────────────────┘
```

The reveal is the only full-bleed moment in the product. Respect it: dim the bay, silence the loop,
one card, one sound. Reduced-motion users get the card without the pulse.

---

## 4. Component specification

| Component | Spec |
|---|---|
| **Panel** | `background: var(--plate)`; border 1 px `--hairline`; radius 3 px (near-square, machined); header strip 26 px with 1 px bottom border and 9 px uppercase label; optional 1 px amber left rule when active |
| **Slot well** | 88 × 88 (weapon), 64 × 64 (perk), 1 px dashed `--steel` when empty, solid rarity frame when filled; centred icon; name below in 10 px mono |
| **Item card** | 152 × 196; rarity frame; 64 px icon area with radial glow; name 12 px; type line 9 px mono; top-right rarity glyph; bottom 2 px progress/durability strip if applicable |
| **Attribute row** | label 11 px uppercase muted · value 30 px mono · `+` button 22 × 22 ghost; delta preview in mint while hovering `+` |
| **XP bar** | 9 px tall, 3 px radius, track `--hairline`; fill gradient mint→cyan for XP, amber→gold for level; tabular label right-aligned |
| **CTA (LAUNCH)** | 240 × 56; fill `--amber` at 92 % opacity with inner 1 px light; text `--void` 800; hover lifts 1 px and adds 18 px amber glow; **hold 0.6 s** to fire, with a progress arc around the button |
| **Tooltip** | 220–280 px; holographic treatment; 12 px body; rarity-tinted top rule; appears after 180 ms, offset 12 px, flips to stay on screen |
| **Locked affordance** | not greyed-out mush: 40 % opacity **plus** a lock glyph and the exact requirement ("needs LV 10") |
| **Focus ring** | 2 px `--cyan` outline, 2 px offset — visible on every interactive element, keyboard-first |

---

## 5. Interaction & flow

**Equip**: click to select → inspector → `[EQUIP]`; drag-and-drop also works (slot glows amber on
hover, snaps with a 120 ms ease-out). Double-click = equip to the *default* slot for that type.
`E` equips the selected item. Equipping replaces, never stacks silently — the outgoing item animates
back to the grid so the trade is visible.

**Filters**: one row, max five chips; filters never hide equipped items (they pin to the top with a
separator). Search appears only in ARSENAL and ARCHIVE (> 12 items).

**Compare**: hovering any card while a slot is selected shows inline deltas (`▲ +6 dmg`, `▼ −1 rate`)
against that slot. Delta numbers are mint for gain, danger for loss, muted for equal.

**Upgrade spend**: `+` is instantaneous, with the value ticking up 120 ms and the XP/level readout
flashing once. Points are spent immediately (no separate "apply") — but there is a 3 s undo in the
bottom-left toast.

**Launch**: hold 0.6 s (arc fills around the button). Release early = cancel. This prevents accidental
runs and gives the moment weight. Keyboard: `Enter` held.

**Results → reveal → bay**: one button per screen; `Escape` always returns to the bay. Never more than
two clicks from the bay.

**Keyboard map**: `1–5` tabs · `↑↓←→` navigate cards · `Enter` select · `E` equip · `U` upgrade ·
`L` launch (hold) · `Esc` back. Gamepad mirrors it (bumpers = tabs, `A` select, `X` equip).

---

## 6. Motion system

| Event | Duration | Easing |
|---|---|---|
| Tab switch | 160 ms | `cubic-bezier(.2,.8,.2,1)` — content slides 8 px + fades |
| Panel enter | 180 ms | fade + 6 px rise, 20 ms stagger per column |
| Card hover | 120 ms | lift 2 px, glow in |
| Equip snap | 180 ms | scale 1.04 → 1 with 1 frame of 1.06 overshoot |
| Legendary reveal | 900 ms | card scales 0.92 → 1, glow blooms, motes rise |
| Launch arc | 600 ms | linear fill (it is a timer, not decoration) |

Hard rules: nothing animates longer than 900 ms; no parallax on text; `prefers-reduced-motion` disables
sheen, motes, pulse and drift (all remains legible).

---

## 7. Audio cues (short, industrial)

| Cue | Character |
|---|---|
| hover | soft tick, 1.5 kHz, −18 dB |
| select | latch click, metallic |
| equip | heavy clunk + servo whine tail (180 ms) |
| rarity reveal | tier sting (§1.4) |
| upgrade spent | rising two-note blip |
| launch hold | low rumble bed that resolves into a whoosh |
| ambient bay | distant ventilation + occasional metal settle, looped at −30 dB |

---

## 8. Implementation guidance

### 8.1 This project (web, three.js + DOM) — recommended

The game already renders the cyborg in three.js and the manager is a DOM overlay. **Keep that split:**
the 3D canvas is the hero, the UI is DOM + CSS. It is faster to build, easier to make accessible, and
crisper than drawing UI into WebGL.

```
index.html
  <canvas id="stage">           three.js: arena + manager turntable
  <div id="cyborg-manager">     DOM overlay (already in src/manager.js)
```

- **Tokens**: put the palette in CSS custom properties on `:root` (mirror `theme.js`), so the canvas HUD
  and the DOM read the same numbers.
- **Rarity frames**: `border: 2px solid transparent; background: linear-gradient(var(--plate),var(--plate)) padding-box, conic-gradient(...) border-box;` — one element, no images.
- **Sheen**: a `::after` with `background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,.14) 50%, transparent 60%)` translated across on a keyframe; 3–6 s per cycle depending on rarity.
- **Holograms**: `repeating-linear-gradient` scanlines + `box-shadow: 0 0 24px` + a 1 px inset cyan line; add a 6 s vertical drift for legendaries only.
- **Glass**: one `backdrop-filter: blur(10px)` on the tab bar only — it is a GPU cost and loses its meaning if used everywhere.
- **Emissive bloom on panels**: CSS `box-shadow` cannot bloom. For a cheap approximation layer two shadows (tight 4 px + wide 18 px). If you want true bloom, render the UI into the three.js scene with an EffectComposer — only worth it if the UI becomes diegetic later.
- **Animated icons**: sprite sheets (see §8.3) via `background-position` steps or a canvas element per icon only when > 24 px.
- **Performance budget**: ≤ 2 blur layers, ≤ 40 box-shadows on screen, no filters on scrolling containers; aim 60 fps with the three.js arena paused behind the bay (pause the render loop, render one still frame per turntable increment at 30 fps).
- **Accessibility**: real `<button>`/`<input>` semantics, `aria-selected` on tabs, focus trap in modals, `aria-live="polite"` for XP/level changes, 4.5:1 text contrast, colour-blind-safe rarity via border thickness + glyph.

### 8.2 If ported to an engine

| Engine | Approach for this look |
|---|---|
| **Unity** | UI Toolkit (USS) for panel/text (fast iteration, real layout) + one UGUI layer for the 3D turntable bake. Panel skin as a 9-slice atlas; emissive via a custom `Shader Graph` UI material (emission + fresnel rim); rarity glow via additive quad behind the card. Post: one Volume with bloom + subtle vignette on the UI camera only. |
| **Unreal** | UMG + one `UMG Material` with emissive and a `Fresnel` rim for holo panels; rarity frames as material instances with a scalar `Glow`; Niagara for motes; `Retainer Box` for the static bay backdrop to save cost. |
| **Figma first** | Build the two hero screens (BAY, ARSENAL) as Figma components with variants per rarity; export tokens to CSS/JSON, then implement once. |

### 8.3 Asset pipeline (this is what separates premium from generic)

1. **Trim sheets over unique textures.** One 1024×1024 metal trim sheet + one painted-armour sheet
   gives every panel, frame and slot its detail with a single draw call in the 3D parts.
2. **Material set per surface type**, not per asset: `M_Plate` (albedo, roughness, AO, emissive mask),
   `M_Paint` (albedo, chipped-edge mask), `M_Holo` (emissive + scanline). Reuse across UI and world.
3. **Icons**: render each weapon/ability from its 3D asset with an orthographic camera on a fixed
   3-point rig, transparent background, at **512 px**, downscale to 128 / 64 / 32 with Lanczos. Never
   mix hand-drawn and rendered icons in the same grid — it is the fastest way to look cheap.
4. **Rarity frames**: build 5 frames as 9-slice PNGs at 2× the largest used size, or as CSS gradients
   (preferred — resolution independent).
5. **Naming + manifest**: `ui_<type>_<id>_<variant>@2x.png`, plus `assets/manifests/ui.json` with
   `{id, type, rarity, size, source, licence}` so the Forge can audit and the art director can swap.
6. **Wear without mud**: damage is a mask that multiplies roughness and darkens albedo **only at
   edges**; centre-of-plate stays clean. Hand-paint the first three and reuse.
7. **Consistency pass**: after assets exist, render one contact sheet of every icon on the actual panel
   background and reject anything that disappears at 64 px.

---

## 9. Premium polish checklist

1. Hold-to-launch with an arc — commitment, not a click.
2. Panel enter stagger (20 ms per column) — the screen assembles.
3. Rarity sheen slow enough to notice on the second look, not the first.
4. Legendary reveal: dim, silence, one card, one sting.
5. Attribute `+` shows the delta before you spend it.
6. Equipped items pin to the top of the grid with a divider — never scroll away.
7. Compare deltas inline, always, with no modal.
8. Locked states explain the exact requirement; they are not dead grey boxes.
9. Numbers are tabular and tick with a 120 ms tween — no jitter.
10. One ambient loop at −30 dB so the bay is a place, not a screen.
11. Turntable keeps a slow orbit; it stops only when the player focuses a panel.
12. After a legendary drop, the ARCHIVE tab shows a small unread dot until visited.

---

## 10. What to build first (order that preserves quality)

1. Tokens + Panel + Tab bar + CTA (the whole identity lives in these four components).
2. BAY layout with the turntable and the six attribute rows.
3. ARSENAL grid + inspector + inline compare.
4. Rarity system as CSS gradients (5 tiers), applied everywhere.
5. POWER-UPS browser with the EQUIPPED vs DECK split.
6. RESULTS + legendary reveal.
7. UPGRADES + milestone rail.
8. Audio cues, then motion polish, then the accessibility pass.

A live mock of step 1–2 (Bay screen, this palette, rarity frames) is at `docs/mock/bay.html`.
