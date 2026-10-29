<!-- BUILD CONTRACT FIRST ------------------------------------------------------------
     This project is built, not documented. `BUILD.md` defines what must physically exist
     before a task counts as done: HUD, visual identity, 6+ used assets, one authored level,
     3 effects, 4+ SFX and a music bed, all visible in the preview.
     A task that only edits markdown is BLOCKED, not done.
----------------------------------------------------------------------------------- -->

# Forge Smoke — Art Bible (ART-01)

> Extends the slice-level contract in the previous revision; this is the full-release art
> direction. All Forge Smoke art is original or locally generated — no licensed or downloaded
> assets ship in the build. Slice values remain in force unless a later milestone records a
> measured change in `QA.md` / `DECISIONS.md`.

## 0. Scope and authority

- Covers M0 (slice) through M5 (polish). Milestone notes in `GDD.md` §13 and `docs/DESIGN-FULL.md` §13.
- Design authority: `GDD.md` (working spec) and `docs/DESIGN-FULL.md` (build contract); on conflict
  the full design wins and this file is corrected with a `DECISIONS.md` entry.
- No external art at M0; generated art lands at M3 and is recorded in `ASSET_PLAN.md` with provenance.
- Every asset has a reuse path (§10). No unlicensed reference enters the build (§11).

## 1. Look in one sentence

Dark gunmetal treeline at night, rain on concrete and puddles, olive cloth, red hostile optics,
amber HUD — muzzle flash is the brightest thing on screen; the guns are the light.

## 2. Visual identity

- Silhouette before detail; every gameplay-critical object reads at its stated distance.
- Military but not photoreal: stylised, generated primitives/models; no licensed names or models.
- Darkness is a mechanic: Blackout makes the guns the only light source.
- Every asset is reusable (§10); nothing is single-use hero art.
- No paid, downloaded or ripped art; no runtime network calls.

## 3. Silhouette and shape language

### Read distances

| Element | Minimum read size | Notes |
|---|---|---|
| Weapon | 48 px | stock, barrel, magazine must be distinct |
| Enemy | 32 px | role cue: helmet, shield, rotor |
| HUD text | 11 px | GDD.md §9 |
| Touch target | 44 px | accessibility |

### Player (Operator, "Forge-1")

- Torso box `1.2 × 1.5 × 1.2` cloth, pack `0.8 × 0.95 × 0.4`, head `0.72` sphere/box, visor `0.54 × 0.16 × 0.08`.
- Rifle block `0.2 × 0.22 × 1.35` with muzzle brake `0.28` cube and magazine `0.16 × 0.3 × 0.34`.
- Olive cloth (`#4b5340` family), gunmetal steel (`#424d4d` family), flesh head; no face detail.
- Body yaw smoothing `14/s`; gun pivot yaw smoothing `16/s`.

### Weapons (twelve styles)

Each style owns a distinct silhouette cue, tracer shape and tracer colour. No two styles share a
tracer colour.

| # | Style | Silhouette cue | Tracer shape | Tracer colour |
|---|---|---|---|---|
| 1 | Spray | short barrel, box mag, no stock | short dashes | `#ffd57a` |
| 2 | Cone | wide muzzle, short pump | fan of pellets | `#ff8a4a` |
| 3 | Pierce | long barrel, boxy receiver | single bright rod | `#6fe3ff` |
| 4 | Ricochet | carbine length, angled stock | rebounding sparks | `#a6ff7a` |
| 5 | Arc | thumper tube, top break | lobbed streak | `#ff6fd6` |
| 6 | Beam | cutter housing, no muzzle | held line | `#4deeea` |
| 7 | Chain | emitter coils, no barrel | forked arcs | `#c6a6ff` |
| 8 | Burst | battle-rifle profile, long mag | 3-round group | `#ffe36f` |
| 9 | Spin-up | minigun cluster, no stock | dense stream | `#ff5a5a` |
| 10 | Rail | rail housing, charge coils | white-out line | `#ffffff` |
| 11 | Flamer | tank + hose + nozzle | cone of fire | `#ff6a2a` |
| 12 | Sentry | launcher tube, deploy rail | drone trail | `#6fff9a` |

### Enemies (eight roles)

Each reads at 32 px by its role cue.

| Enemy | Silhouette cue | Read |
|---|---|---|
| Rifleman | helmet + chest rig | fodder |
| Sapper | slim body + charge pack | breacher |
| Shieldbearer | frontal shield plate | wall |
| Spotter | antenna / optic | support |
| Drone | rotor + compact body | harasser |
| Mortar team | tripod / base | artillery |
| Mech | heavy chassis + minigun arm | elite |
| Gunship | machine strafe silhouette | boss |

### Props and arena

- Treeline clearing, radius 54 u: ground plane, puddles, 16 trees, 20 bushes, 4 logs, rain.
- Airdrop crate, deployable sentry turret, floodlights, Gunship.
- All props use `materials.js` kinds with baked textures and weathering (§9).

## 4. Palette

### Core

| Role | Hex | Use |
|---|---|---|
| Background | `#0b0d11` | scene background, fog |
| Midground / concrete | `#3a3f47` | ground, puddles, structures |
| Focal / olive | `#4b5340` | cloth, foliage |
| UI / amber | `#ffb347` | HUD text, MAG count, weapon plate |
| Warning / hostile | `#ff4d4d` | enemy emissive, hostile optics |
| Tracer (default) | `#ffd57a` | muzzle tracer (additive) |
| Muzzle flash | `#ffedb0` | muzzle flash (additive, brightest) |
| Rain | `#a9dcd2` | rain streaks |

### Surfaces and materials

| Role | Hex family | Use |
|---|---|---|
| Steel | `#121718` – `#424d4d` | weapons, visor, metal props |
| Flesh | `#57432f` – `#a88763` | player head |
| Enemy chitin | `#3d080b` – `#c02a2a` | enemy bodies |
| Enemy emissive | `#3a0406` | enemy glow (intensity 0.75) |
| Foliage | `#242a22` – `#4b5340` | trees, bushes |
| Ground moss | `#1a1d22` – `#3a3f47` | ground plane |

### HUD states

| Role | Hex | Use |
|---|---|---|
| Health OK | `#7ce6a8` | health > 60 |
| Health warn | `#e8c25a` | health 31–60 |
| Health crit | `#f2545b` | health ≤ 30 |
| HUD label | `#9fd9c0` | status-panel heading |
| HUD secondary text | `#c4d9c9` | threats, control hint |
| HUD subtitle | `#a9cdbb` | title subtitle |
| Title text | `#dcffe9` | title heading |
| Dead title | `#ff9ca2` | death heading |
| Dead sub | `#e4b9bb` | death threat count |
| Dead prompt | `#ff8d95` | death screen |
| Hemisphere sky | `#8fa6c0` | ambient fill |
| Sun | `#cfe0f5` | directional light |

Panel fills: status `rgba(3,12,9,0.62)`, hint `rgba(2,10,8,0.62)`, title
`rgba(2,10,8,0.78)`, dead `rgba(18,3,5,0.8)`; strokes use the amber/green HUD accents at
0.22–0.5 alpha.

### Rules

- All gameplay colours derive from this table; a new colour requires a `DECISIONS.md` entry and an
  update to this table.
- Per-style tracer colours are fixed by the table in §3 and are never reused between styles.
- Muzzle flash (`#ffedb0`) is the brightest thing on screen in every light state.

## 5. Lighting and atmosphere

### Renderer (M0 starter, measured)

- `WebGLRenderer`, antialias on, `pixelRatio = min(devicePixelRatio, 2)`.
- Tone mapping: `ACESFilmicToneMapping`, exposure `1.28`.
- Shadows: on (`PCFSoftShadowMap`, 1024×1024 map, bias `-0.0006`) at M0 starter setting.
  Low-end measured pass lands at M2; if shadows are disabled, record in `QA.md`.
- No realtime post chain on the low preset.

### Scene lighting

- Background / fog: `FogExp2` `#0b0d11`, density `0.028`.
- `HemisphereLight`: sky `#8fa6c0`, ground `#141821`, intensity `0.85`.
- `DirectionalLight` (sun): colour `#cfe0f5`, intensity `1.7`, position `(16, 30, 12)`,
  casts shadow; shadow camera `left/right/top/bottom = ±32`, `near 1`, `far 90`.
- Rain: 420 line segments, colour `#a9dcd2`, opacity `0.32`, depth write off.

### Full-release lighting

- One floodlight per zone: target colour `#ffe7c2`, intensity `1.2`, radius `18 u` (target values;
  measured at M2).
- Floodlights are the only non-muzzle light in normal play.

### Blackout light-state (signature beat)

- Light-state switch only: sun, hemisphere and floodlights are disabled; camera, FOV and follow are
  unchanged.
- Hostile optics stay visible (enemy emissive `#ff4d4d` / `#3a0406`).
- Every shot lights the room for `0.2 s`: muzzle-flash sphere (`0.24`, additive, `#ffedb0`,
  life `0.06 s`) plus a short global flash.
- Guns are the only light source; no shader rewrite.

### 5.1 Lighting per arena (locked)

Base scene (every arena): background/fog `FogExp2` `#0b0d11` density `0.028`; `HemisphereLight`
sky `#8fa6c0` / ground `#141821` intensity `0.85`; `DirectionalLight` sun `#cfe0f5` intensity `1.7`
at `(16, 30, 12)` with `PCFSoftShadowMap` 1024x1024 bias `-0.0006`; `ACESFilmicToneMapping`
exposure `1.28`; rain 420 segments `#a9dcd2` opacity `0.32`. Floodlights are colour `#ffe7c2`,
radius `18 u` with per-arena intensity/position below. No realtime post chain on the low preset.

| Arena | Beats | Floodlights (world x,z / intensity) | Blackout | Notes |
|---|---|---|---|---|
| Perimeter (arena1) | 1-3 | 1 @ (0, 0) / 1.2 | none | treeline perimeter; sun + hemi on |
| Breach Yard (arena2) | 4-6 | 2 @ (-40, 0) / 1.4, (40, 0) / 1.4 | Beat 4 "Blackout" 150-158 s (8.0 s); Beat 6 "Blackout II" 360-368 s (8.0 s) | during blackout sun, hemi and floodlights disabled; hostile optics remain; muzzle flash lights the room for 0.2 s |
| Gunship Pad (arena3) | 7-8 + overtime | 3 @ (0, 0) / 1.6, (-60, 0) / 1.0, (60, 0) / 1.0 | none | open pad; boss strafes and drops mines |

Blackout light-state (locked values):
- Duration: `8.0 s` (beats 4 and 6).
- Disabled: `DirectionalLight` (sun), `HemisphereLight`, every floodlight (`visible = false`).
- Unchanged: camera position, FOV `58`, follow lerp `1 - exp(-dt*5.5)`, orbit, arena clamp.
- Hostile optics remain visible: enemy emissive `#ff4d4d` on `#3a0406`, intensity `0.75`.
- Shot light: muzzle-flash sphere `0.24` (radius 0.12) additive `#ffedb0`, life `0.06 s`, plus a
  short global flash; room illumination lasts `0.2 s`.
- Guns are the only light source; no shader rewrite; no post chain.
- Audio: music bed ducks 6 dB; captions stay on.
- Fail-safe: if p95 frame time exceeds 18 ms during Blackout, shorten to 6 s and add a dim
  emergency floodlight (R02/R13), recorded in `QA.md` / `DECISIONS.md`.

## 6. Camera and composition

- `PerspectiveCamera`, FOV `58°`, near `0.1`, far `240`.
- Position: `(player.x + sin(orbit)·9, 6.4, player.z + cos(orbit)·9)`.
- Look-at: `(player.x, 1.25, player.z)` (player torso).
- Follow: exponential lerp `1 - exp(-dt·5.5)`.
- Orbit offset: `state.orbit -= ctx.look.x · 0.0042` per step.
- Body yaw smoothing `14/s`; gun pivot yaw smoothing `16/s`.
- Arena clamp: player clamped to radius `54`; camera follows, no separate clamp.
- Blackout: light-state switch only — camera position, FOV and follow unchanged.
- No camera shake on reduced-motion preset; shake otherwise on heavy impacts (rail, boss).
- Debug viewpoints: `eye:spawn`, `eye:here`, `eye:down`, `eye:back`.

## 7. VFX language

- Tracers: pooled (`18` at M0; up to `800` projectiles in full release), box `0.055 × 0.055 × 1`,
  additive blending, life `0.075 s`, colour per style (§3). Shape language: spray = short dashes,
  pierce = single bright rod, ricochet = rebounding sparks, beam = held line, chain = forked arcs,
  rail = white-out.
- Muzzle flash: sphere `0.24`, additive, `#ffedb0`, life `0.06 s`, at the muzzle.
- Heat: barrel glow scales with heat (`0–100`); lock at `100` for `2.4 s`; never a bar.
- Casings: pooled, max `6` concurrent.
- Rain: 420 line segments, recycled when below ground.
- Particles: cap `≤ 400` on screen, pooled; no per-frame allocations in the hot path.
- Ground fire (flamer): pooled patches, max `24`, lifetime `4 s`.
- Screen shake: rail and boss impacts only; disabled on reduced-motion preset.
- Blackout shot light: flash sphere + `0.2 s` room illumination (§5).
- Enemy death: simple fade/scale, no particle explosion beyond pooled budget.

## 8. UI language

- In-canvas HUD only (`__studio.hud`), no DOM; no second canvas.
- Stencil-feel sans, amber `#ffb347` on charcoal panels; panels: vitals, title, dead, plus beat
  name + timer, score, airdrop countdown, weapon name plate in full release.
- Minimum `11 px` text; health colour thresholds `60 / 30` (§4).
- HUD coverage measured; `hud.overlaps` must be empty; playfield stays clear in the centre.
- Barks: radio-filtered voice + short in-canvas caption, stencil sans, amber on charcoal panel,
  bottom-left, max 40 characters, `2.0 s` fade; never overlaps vitals or beat name.
- Title blurb: one line, skippable with Space / Enter / Mouse.
- Accessibility: reduced motion (no shake), colour-blind tracers (shape-coded), remappable keys,
  `≥ 44 px` touch targets, no flashing above `3 Hz`, captions on when audio is muted.

### HUD layout and legibility (SLICE-02)

Slice HUD is verified on the running build at 1280×720 (headed Chromium, device scale 1) with
`hud.overlaps: []`, coverage `0.055` in play and `0.172` on the title, 0 console errors and
60 fps. All text is drawn in-canvas through `__studio.hud` at the drawing-buffer resolution;
sizes below are CSS px at 1280×720. No DOM HUD.

- Safe margins: left 2.2 %, top 3 %, bottom 5 %; the playfield centre stays clear in play.
- Status panel (id `vitals`): `x 0.022, y 0.03, w 0.55, h 0.155` (charcoal fill
  `rgba(3,12,9,0.62)`, stroke `rgba(110,220,175,0.35)`). It groups every readout:
  - title line "FORGE SMOKE // ARMORY" 13 px `#9fd9c0` weight 700;
  - health bar `w 0.18, h 0.023` at `y 0.069` with colour thresholds 60/30
    (`#7ce6a8` / `#e8c25a` / `#f2545b`);
  - health number 20 px weight 800 beside the bar;
  - "THREATS DOWN  n" 12 px `#c4d9c9` at `y 0.125`;
  - "MAG  n / 30" or "RELOADING..." 13 px `#ffb347` weight 700 at `y 0.151`.
- Control hint (bottom-left): backing panel `x 0.012, y 0.902, w 0.40, h 0.045`
  (fill `rgba(2,10,8,0.62)`, stroke `rgba(120,230,185,0.22)`) and text 12 px
  `#c4d9c9` weight 600 at `x 0.022, y 0.928`. Play/title text:
  "WASD MOVE  ·  AUTO-FIRE  ·  R RELOAD"; dead text: "R / SPACE / ENTER  ·  REDEPLOY".
  This is the only control teaching in play; no modal, no tutorial screen, no manual.
- Title screen (centred): panel `w 0.72, h 0.30`; "FORGE SMOKE" 40 px `#dcffe9` weight 800;
  subtitle 14 px `#a9cdbb`; deploy prompt "PRESS  W  OR  SPACE  TO DEPLOY" 15 px
  `#7ce6a8` weight 700. This prompt is the single first action and is the only green
  affordance on the title.
- Death screen (centred): "PERIMETER LOST" 36 px `#ff9ca2`; threats count 14 px;
  "PRESS  R  TO REDEPLOY" 15 px `#ff8d95`; the bottom hint repeats the restart keys.
  No restart ambiguity.
- Contrast: amber `#ffb347`, secondary `#c4d9c9` and health colours sit on charcoal
  panels; title text `#dcffe9`; minimum text is 12 px (exceeds the 11 px floor in
  GDD.md §9), so the HUD passes the legibility gate at 1280×720.
- First action: the title prompt, the bottom hint and the W/Space/Enter start keys all
  agree; pressing W deploys and moves in the same input, so the first action is obvious
  without a manual.
- Onboarding (Beat 1, slice): the title prompt plus the bottom hint line are the only
  instruction; later beats add "hold", "reload", "swap" prompts per GDD.md §9. No modal,
  no separate tutorial screen, no manual.
- Evidence: `docs/evidence/SLICE-02-title-1280x720.png`,
  `docs/evidence/SLICE-02-playing-1280x720.png`,
  `docs/evidence/SLICE-02-dead-1280x720.png`; measured values in `TASKS.json` (SLICE-02).

### 8.1 Type scale (locked)

Font: system sans-serif (stencil feel), no font file shipped (`A190`). Sizes are CSS px at
1280x720; minimum text size `11 px` (GDD section 9), actual floor in the build is `12 px`.

| Token | Size (px) | Weight | Colour | Use |
|---|---|---|---|---|
| display | 40 | 800 | `#dcffe9` | Title wordmark "FORGE SMOKE" |
| death-title | 36 | 800 | `#ff9ca2` | Death heading "PERIMETER LOST" |
| health-number | 20 | 800 | health state colour | Vitals health value |
| prompt | 15 | 700 | `#7ce6a8` (deploy) / `#ff8d95` (restart) | Title deploy prompt, death restart prompt |
| subtitle | 14 | 400 | `#a9cdbb` | Title subtitle |
| dead-sub | 14 | 400 | `#e4b9bb` | Death threat count |
| vitals-title | 13 | 700 | `#9fd9c0` | "FORGE SMOKE // ARMORY" |
| mag | 13 | 700 | `#ffb347` | "MAG n / 30" / "RELOADING..." |
| beat-name | 13 | 700 | `#c4d9c9` | Beat name + timer (top-centre, M2) |
| body | 12 | 600 | `#c4d9c9` | Threats down, control hint, barks |
| floor | 11 | 400 | any HUD colour | Absolute minimum (GDD section 9) |

Line height: 1.15 for HUD readouts, 1.25 for barks (max 40 characters). No text below 11 px.

### 8.2 HUD iconography (locked)

| Icon | Size | Source | Placement / state |
|---|---|---|---|
| Weapon style icon | 48x48 px (atlas cell) | `src/icons.js` `generateWeaponIconAtlas()` / `generateWeaponIconDataUrls()` (256x256 atlas, 5x3 grid, 12 used, nearest filter) | Vitals panel: active at `x 0.29, y 0.035, h 0.035`; inactive at `x 0.29, y 0.053, h 0.03`; swaps on Q |
| Enemy role silhouette | 32x32 px | In-house generator (planned, M2) for 8 roles | Threat/readability cues; shape + colour coded |
| Card icon | 128x128 px (3 states) | `assets/icons/cards.png` (planned, M2) | HUD cards 1/2/3 at level-up |
| Health bar | w 0.18, h 0.023 at y 0.069 | In-canvas bar primitive | Colour thresholds: `#7ce6a8` (>60), `#e8c25a` (31-60), `#f2545b` (<=30) |
| Status panel | x 0.022, y 0.03, w 0.55, h 0.155 | In-canvas panel primitive | Charcoal fill `rgba(3,12,9,0.62)`, stroke `rgba(110,220,175,0.35)` |
| Control hint panel | x 0.012, y 0.902, w 0.40, h 0.045 | In-canvas panel primitive | Fill `rgba(2,10,8,0.62)`, stroke `rgba(120,230,185,0.22)` |

Iconography rules: icons are redundant cues, never the only affordance; every action keeps a text
label; minimum touch target `44 px`; tracers are shape-coded for colour-blind play (section 3 and
7); no flashing above `3 Hz`. `hud.overlaps` must stay empty.

## 9. Materials and surface rules

- All surfaces use `src/materials.js` kinds (`wood`, `masonry`, `plaster`, `thatch`, `stone`,
  `moss`, `chitin`, `cloth`, `dirt`, `metal`) with baked, tileable, mean-normalised maps.
- No plain `MeshStandardMaterial` without a map in the final build (CLAUDE.md).
- Weathering (`dirt`, `moss`, `edgeWear`) applied to props; triplanar sampling for terrain/rocks.
- Material families: cloth olive for player, metal gunmetal for weapons, chitin red for enemies,
  moss/concrete for arena, metal for puddles.
- Generated textures recorded in `ASSET_PLAN.md` with seed and palette.

### 9.1 Material recipes (locked)

Base bake (all kinds): `bakeTexture({ kind, seed, size, palette, repeat, roughness })` from
`src/materials.js`, then optional `weather(mat, { dirt, moss, edgeWear, seed })`; terrain and rocks
also get `triplanar(mat, { scale: 0.25 })`. Maps are mean-normalised (attaching a map does not
change average surface brightness), `RepeatWrapping`, anisotropy 4, default `bumpScale 0.5`.
No `MeshStandardMaterial` ships without a map in the final build.

Base kind recipes:

| Kind | Seed (ref) | Size | Default palette (hex) | Roughness | Structure |
|---|---|---|---|---|---|
| wood | 90+ (G007) | 512 | `#4a3621` / `#7a5a3a` / `#9c7a52` | 0.55-0.95 | grain planks |
| masonry | 7 | 512 | `#5c5248` / `#8a7d6c` / `#a89a86` | 0.55-0.95 | 8x4 courses |
| plaster | 8 (G004) | 512 | `#b8a98e` / `#d6c8ad` / `#e6dbc4` | 0.55-0.95 | smooth stucco |
| thatch | 14 | 512 | `#6e5a2e` / `#a58a45` / `#c7ab63` | 0.55-0.95 | fibre bundles |
| stone | 21 | 512 | `#4b4a47` / `#6f6c66` / `#8e8a82` | 0.55-0.95 | 5x3 courses |
| moss | 17 (G001) | 512 | `#2f4a22` / `#4f6f30` / `#7a9448` | 0.55-0.95 | moss/lichen |
| chitin | 77 (G006) | 512 | `#2a2620` / `#4d4236` / `#776750` | 0.55-0.95 | plates |
| cloth | 5 (G003) | 256 | `#5a3f3a` / `#8c6259` / `#b08a7d` | 0.60-0.90 | weave |
| dirt | 31 | 512 | `#3d3125` / `#5f4d3a` / `#7d6a52` | 0.70-0.95 | grime |
| metal | 12/33 (G002/G005) | 512 | `#3a3d42` / `#6a6f76` / `#9aa0a8` | 0.30-0.70 | brush grain |

Surface assignment (palette overrides locked to the ART_BIBLE section 4 families):

| Surface / prop | Kind | Palette (hex) | Seed | Weathering (dirt / moss / edgeWear) | Notes |
|---|---|---|---|---|---|
| Player cloth (torso, pack) | cloth | `#3f4736` / `#4b5340` / `#5a634d` | 5 | 0.15 / 0.05 / 0.10 | olive family |
| Player steel (rifle, visor, muzzle brake, magazine) | metal | `#121718` / `#3a3f47` / `#424d4d` | 12 | 0.20 / 0 / 0.25 | gunmetal family |
| Player flesh (head) | plaster | `#57432f` / `#8a6b47` / `#a88763` | 8 | 0.10 / 0 / 0 | flesh family |
| Enemy bodies | chitin | `#3d080b` / `#7a1518` / `#c02a2a` | 77 | 0.20 / 0 / 0.10 | emissive `#3a0406` intensity 0.75 |
| Ground plane | moss | `#1a1d22` / `#2a2f36` / `#3a3f47` | 17 | 0.35 / 0.25 / 0.10 | triplanar scale 0.25 |
| Puddles | metal | `#121718` / `#3a3f47` / `#424d4d` | 33 | 0.10 / 0 / 0 | roughness 0.15-0.30 |
| Trees / bushes (bark) | wood | `#242a22` / `#3a3f47` / `#4b5340` | 90+ | 0.25 / 0.20 / 0.10 | foliage.js leaves alpha-tested |
| Arena masonry (perimeter wall, containers) | masonry | `#3a3f47` / `#5c5248` / `#8a7d6c` | 7 | 0.30 / 0 / 0.20 | wall height 3 u |
| Concrete barriers | stone | `#3a3f47` / `#4b4a47` / `#6f6c66` | 21 | 0.35 / 0 / 0.25 | cover |
| Airdrop crate | metal + wood | metal `#3a3d42`/`#6a6f76`/`#9aa0a8`; wood `#4a3621`/`#7a5a3a`/`#9c7a52` | 41 / 42 | 0.20 / 0 / 0.20 | mixed prop |
| Floodlight housing | metal | `#3a3d42` / `#6a6f76` / `#9aa0a8` | 55 | 0.15 / 0 / 0.10 | emissive lens `#ffe7c2` |
| Sentry turret | metal + cloth | metal `#3a3d42`/`#6a6f76`/`#9aa0a8`; cloth `#3f4736`/`#4b5340`/`#5a634d` | 61 / 62 | 0.20 / 0 / 0.15 | sentry style + ability |
| Gunship | metal + chitin | metal `#3a3d42`/`#6a6f76`/`#9aa0a8`; chitin `#3d080b`/`#7a1518`/`#c02a2a` | 80 / 81 | 0.15 / 0 / 0.10 | boss, <= 5000 tris |

Weathering rule: apply `weather()` once per material after baking; never bake weathering into the base
map (so a re-skin keeps the structure). Triplanar sampling is mandatory for ground and rocks;
standard UV repeat is used for props and characters.

## 10. Asset list and reuse paths

Every asset below is original or locally generated and has a reuse path. No unknown-source assets.

| ID | Asset | Source / licence | Reuse path | Budget |
|---|---|---|---|---|
| A010 | Player soldier (primitive/generated model) | Original | All beats; weapon attachments swap on the rig | ≤ 2 000 tris |
| A020 | Weapon icons / silhouettes (48 px) | Original / generated | All 12 styles and attachment variants | ≤ 1 MB textures |
| A030 | Enemy silhouettes (32 px) | Original / generated | All 8 enemy types | ≤ 1 MB textures |
| A040 | Arena props (trees, bushes, logs, puddles) | Procedural (`foliage.js`, `materials.js`) | All beats, seeded placement | within scene budget |
| A050 | Airdrop crate | Original | Every 90 s drop | ≤ 500 tris |
| A060 | Sentry turret | Original | Sentry style + ability | ≤ 800 tris |
| A070 | Floodlight | Original | Blackout II + siege beats | ≤ 300 tris |
| A080 | Gunship | Original | Beat 8 boss | ≤ 5 000 tris |
| A090 | Baked textures (all kinds) | Procedural (`materials.js`) | All surfaces | ≤ 96 MB total |
| A100 | Rain streak field | Procedural | All beats | 420 segments |

- Reuse rule: a new asset is added only when no existing asset can be re-skinned or re-composed.
- Generated originals are preserved; optimised derivatives only when measured needed.

## 11. References and licences

- Five comparison references are recorded in `GAME.md` (Azeroth Survivors, Vampire Survivors,
  Brotato, Enter the Gungeon, Nuclear Throne) with learn / don't-copy notes.
- References are for comparison and feel only. No art, audio, code, names or mechanics are copied.
- All Forge Smoke assets are original or locally generated.
- Future third-party assets: CC0 / public domain / explicitly compatible only. Record source URL,
  author, licence and SHA-256 in `ASSET_PLAN.md`; credit in `RELEASE-02`.
- No ripped or unlicensed asset ships. No runtime network calls.
- Licence audit `ART-03` complete (2026-10-27): 0 incompatible items, 0 removed. Manifest
  `LICENCE_MANIFEST.md`; credits started `CREDITS.md`.

## 12. Low-end budget and fallback

- Target: 60 fps at 1280×720; budget 90 draw calls, 150 000 triangles, 96 MB textures, 12 MB audio.
- Single renderer, one scene, no realtime post chain on the low preset.
- Shadows on at M0 (starter); measured pass at M2 (`QA.md`).
- Caps: 400 enemies (instanced), 800 projectiles, 400 particles on screen; spatial hash 3 m cells.
- Pool everything; one shared material per enemy class; weapons are primitives with a style tag.

## 13. Accessibility

- Reduced motion: no camera shake.
- Colour-blind tracers: shape-coded (§3, §7).
- Remappable keys; `≥ 44 px` touch targets.
- No flashing above `3 Hz`.
- Captions on by default when audio is muted; mute / skip keys remappable.

## 14. Change control

- Palette, lighting, camera or VFX changes require a `DECISIONS.md` entry.
- New colours require an update to §4.
- New assets require an `ASSET_PLAN.md` row with source, licence, format, budget and status.
- If a task is impossible under these constraints, stop and write the blocker in `DECISIONS.md`.
