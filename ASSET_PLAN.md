<!-- BUILD CONTRACT FIRST ------------------------------------------------------------
     This project is built, not documented. `BUILD.md` defines what must physically exist
     before a task counts as done: HUD, visual identity, 6+ used assets, one authored level,
     3 effects, 4+ SFX and a music bed, all visible in the preview.
     A task that only edits markdown is BLOCKED, not done.
----------------------------------------------------------------------------------- -->

# Forge Smoke — Asset Plan (ART-02)

Every asset ships with a known source, an explicit licence, a format, a budget and a status.
No unknown-source assets. No paid, downloaded or ripped art; no runtime network calls.
All Forge Smoke art is original or locally generated (see `ART_BIBLE.md` §2, §10, §11).

## Low-end budget (governing)

| Metric | Limit |
|---|---|
| Frame rate | 60 fps at 1280×720 (low preset, iGPU) |
| Draw calls | ≤ 90 |
| Triangles | ≤ 150 000 |
| Texture memory | ≤ 96 MB |
| Audio | ≤ 12 MB |
| Enemies on screen | ≤ 400 (instanced) |
| Projectiles on screen | ≤ 800 |
| Particles on screen | ≤ 400 |

## Asset table

| ID | Asset | Type | Use | Source | Licence | Format | Budget | Status | Hash (SHA-256) |
|---|---|---|---|---|---|---|---|---|---|
| A010 | Player soldier (primitive/generated model) | 3D geometry | All beats; weapon attachments swap on the rig | `src/main.js` + `src/materials.js` (cloth/flesh/steel bakes) | Original (project-owned) | Procedural geometry (BoxGeometry assembly) + runtime CanvasTexture | ≤ 2 000 tris; ≤ 4 MB textures | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` (main.js) |
| A020 | Weapon icons / silhouettes (48 px) | 2D texture | All 12 styles + attachment variants | In-house canvas generator (`src/icons.js`) | Original (project-owned) | PNG atlas 256×256 (CanvasTexture) | ≤ 1 MB textures | Shipped (M1) | `AF1AEDC71AC7169DB10289F1C4353A11886BA92B2932CA478E07C37AE5319ABD` (icons.js) |
| A030 | Enemy silhouettes (32 px) | 2D texture | All 8 enemy types | In-house canvas generator (to be created in `src/`) | Original (project-owned) | PNG atlas 256×256 (CanvasTexture) | ≤ 1 MB textures | Planned (M2) | — (recorded on creation) |
| A040 | Arena props (trees, bushes, logs, puddles) | 3D geometry | All beats, seeded placement | `src/foliage.js` + `src/materials.js` | Original (project-owned) | Procedural geometry + alpha-tested leaf cards | Within scene budget (≤ 150 000 tris) | Shipped (M0) | `81B884C892792463A6523793BC0541ACC0753FD2F1A4817CC6A8553E1596A785` (foliage.js) |
| A050 | Airdrop crate | 3D geometry | Every 90 s drop | `src/main.js` (primitive assembly: BoxGeometry + ConeGeometry) | Original (project-owned) | Procedural geometry (BoxGeometry + ConeGeometry) | ≤ 500 tris | Shipped (M1) | `B56FC29B7A7F15D5C6E9ECAFBFACA6A0D36D48157001C1CC1D599B3E2B4E862D` (main.js) |
| A060 | Sentry turret | 3D geometry | Sentry style + ability | In-house primitive assembly (`src/`) | Original (project-owned) | Procedural geometry | ≤ 800 tris | Planned (M2) | — (recorded on creation) |
| A070 | Floodlight | 3D geometry | Blackout II + siege beats | In-house primitive assembly (`src/`) | Original (project-owned) | Procedural geometry | ≤ 300 tris | Planned (M2) | — (recorded on creation) |
| A080 | Gunship (boss) | 3D geometry | Beat 8 boss | In-house primitive assembly (`src/`) | Original (project-owned) | Procedural geometry | ≤ 5 000 tris | Planned (M4) | — (recorded on creation) |
| A090 | Baked textures (all kinds: wood, masonry, plaster, thatch, stone, moss, chitin, cloth, dirt, metal) | 2D texture | All surfaces | `src/materials.js` (`bakeTexture`) | Original (project-owned) | Runtime CanvasTexture (256–512 px, mean-normalised) | ≤ 96 MB total | Shipped (M0) | `AD8369CC45D9F77C475F47A61098493E94D883BA90DDAAFC567F56A4B3B4348E` (materials.js) |
| A100 | Rain streak field | VFX geometry | All beats | `src/main.js` (420 LineSegments) | Original (project-owned) | Procedural BufferGeometry (in-memory) | 420 segments; ≤ 1 draw call | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` (main.js) |
| A110 | Muzzle flash + tracer geometry | VFX geometry | All shots (per style colour) | `src/main.js` (sphere 0.24 + box tracer) | Original (project-owned) | Procedural geometry + MeshBasicMaterial (additive) | ≤ 18 pooled tracers (M0); ≤ 800 (full) | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` (main.js) |
| A120 | Particle pool (smoke, sparks, debris) | VFX | Combat feedback, Blackout shot light | In-house pool (to be created in `src/`) | Original (project-owned) | Procedural BufferGeometry (pooled) | ≤ 400 on screen | Planned (M2) | — (recorded on creation) |
| A130 | Ground fire patches (flamer) | VFX geometry | Flamer style | In-house pool (to be created in `src/`) | Original (project-owned) | Procedural patches (max 24, 4 s life) | ≤ 24 concurrent | Planned (M2) | — (recorded on creation) |
| A140 | Gun reports (12 styles × 3 pitch variants + suppressed) | Audio | Combat feedback | In-house Web Audio synthesis | Original (project-owned) | Synthesised at runtime (no files) or OGG if baked | Part of 12 MB audio | Planned (M2) | — (recorded on creation) |
| A150 | Casings (metallic ticks) | Audio | Combat feedback | In-house Web Audio synthesis | Original (project-owned) | Synthesised at runtime | ≤ 6 concurrent; part of 12 MB | Planned (M2) | — (recorded on creation) |
| A160 | Reload sounds (per family: mag slap, bolt, belt) | Audio | Reload feedback | In-house Web Audio synthesis | Original (project-owned) | Synthesised at runtime | Part of 12 MB audio | Planned (M2) | — (recorded on creation) |
| A170 | Radio barks (6) | Audio | Narrative delivery | In-house recording / synthesis | Original (project-owned) | OGG/MP3 if recorded; else synthesised | Part of 12 MB audio | Planned (M3) | — (recorded on creation) |
| A180 | Music (92 BPM industrial, layered, ducks 6 dB on Blackout) | Audio | Atmosphere | In-house composition | Original (project-owned) | OGG/MP3 (streamed from local file) | Part of 12 MB audio | Planned (M3) | — (recorded on creation) |
| A190 | UI typeface (stencil-feel sans) | Font | HUD text (≥ 11 px) | Browser system sans-serif (no font file shipped) | N/A — no asset file shipped (system font) | None (canvas `fillText`) | Negligible | Shipped (M0) | — (no file) |
| A200 | Enemy roster meshes (8 roles: Rifleman, Sapper, Shieldbearer, Spotter, Drone, Mortar, Mech, Gunship) | 3D geometry | Combat | In-house primitive assembly reusing A010 rig + chitin material | Original (project-owned) | Procedural geometry + `chitin` baked material | Within enemy budget (≤ 400 instanced) | Planned (M3) | — (recorded on creation) |
| A210 | HUD / onboarding affordance (vitals panel, title panel, dead panel, deploy prompt, control hint) | In-canvas UI | Readable HUD and first-action teaching (SLICE-02) | `src/main.js` `syncHud()` via `__studio.hud` (text/panel/bar) | Original (project-owned) | In-canvas text + panel/bar primitives; system sans-serif font (A190), no file shipped | Negligible draw cost; HUD coverage 0.04 (title flow 0.157); `hud.overlaps: []` | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` (main.js) |

## Generated assets (provenance)

| ID | Generator | Seed | Output | Verified |
|---|---|---|---|---|
| G001 | `materials.js` `bakeTexture` kind=`moss` | 17 | Ground plane map/roughness/bump | Yes (M0) |
| G002 | `materials.js` `bakeTexture` kind=`metal` | 33 | Puddle map/roughness/bump | Yes (M0) |
| G003 | `materials.js` `bakeTexture` kind=`cloth` | 5 | Player cloth map | Yes (M0) |
| G004 | `materials.js` `bakeTexture` kind=`plaster` | 8 | Player flesh map | Yes (M0) |
| G005 | `materials.js` `bakeTexture` kind=`metal` | 12 | Player steel/visor map | Yes (M0) |
| G006 | `materials.js` `bakeTexture` kind=`chitin` | 77 | Enemy body map (emissive `#3a0406`) | Yes (M0) |
| G007 | `materials.js` `bakeTexture` kind=`wood` | 90+ | Tree/bush/log bark maps | Yes (M0) |
| G008 | `foliage.js` `leafSprite` | per-tree seed | Alpha-tested leaf cards (broadleaf/olive) | Yes (M0) |
| G009 | `main.js` rain generator | 9090 | 420 rain line segments | Yes (M0) |
| G010 | `main.js` world placement | 4242 | Tree/bush/log/puddle placement | Yes (M0) |
| G011 | `icons.js` `generateWeaponIconAtlas` | 1 | 48 px icons for 12 styles in 256×256 atlas | Yes (M1) |
| G012 | Enemy silhouette generator (planned) | TBD | 32 px silhouettes for 8 roles | No (M2) |
| G013 | Audio synthesis (planned) | TBD | Gun reports, casings, reloads, barks, music | No (M2) |

## Sourcing rules

- CC0 / public domain / explicitly compatible only for any third-party asset; prefer local reuse and
  generated assets before downloads.
- Record source URL, author, licence and SHA-256 for every asset that enters the build.
- Never ship a ripped or unlicensed asset; no runtime network calls.
- No third-party art, audio, font or model is currently shipped; all entries above are original or
  locally generated. Third-party runtime code (Three.js and its add-ons) is covered by
  `vendor/THIRD-PARTY-NOTICES.md`, not by this plan.

## Dependencies (runtime code, not game assets)

| Dependency | Version | Licence | Source | Hash (SHA-256) |
|---|---|---|---|---|
| Three.js (core) | 0.185.1 | MIT | https://github.com/mrdoob/three.js | `BBF5ED13FE4373F5BD38B14EA8E62E9F157327DA5638EDC6D3863E08B167C9C7` (`vendor/three.module.js`) |
| Genex studio harness | platform | Genex platform terms | `vendor/genex/` (see `vendor/genex/multiplayer/LICENSES.md`) | — (platform-owned) |
| Three.js add-on libs (Basis, Draco, etc.) | 0.185.1 | Apache-2.0 / MIT / others (see notices) | `vendor/three/examples/jsm/libs/` | See `vendor/THIRD-PARTY-NOTICES.md` |

## Credits

- All Forge Smoke art, audio and design is original or locally generated by the project owner.
- Third-party notices: `vendor/THIRD-PARTY-NOTICES.md`, `vendor/three-LICENSE`.
- Credits file started at `ART-03`: `CREDITS.md`. Completed at `RELEASE-02`.

## Licence audit (ART-03)

- Audit date: 2026-10-27. Scope: all 20 asset rows (A010–A200), 13 generated rows (G001–G013), 3 runtime deps, 5 comparison references, `references/` and `assets/` folders.
- Result: 0 incompatible items found, 0 removed.
- Shipped-asset hashes (A010, A040, A090) and `vendor/three.module.js` verified against disk — all match.
- No external URLs or downloaded assets in `src/` or `index.html`.
- Runtime deps compatible: Three.js MIT; Genex platform terms; add-ons Apache-2.0/MIT/ISC/W3C/MPL/LGPL (file-level copyleft only, not imported by the game, shipped unmodified).
- Manifest: `LICENCE_MANIFEST.md` (alias `LICENSE_MANIFEST.md`). Credits: `CREDITS.md`.

---

## 2. Milestone 2 asset list (full M2 build — every asset the build needs)

Columns: **Size** (pixels / duration / budget), **Path** (file or generator module), **Source**, **Licence**,
**Consumer** (the module/feature that uses it — no row without a consumer), **Status**, **Hash (SHA-256)**.
All entries are original or locally generated; CC0/explicitly-compatible only for any third party.
Paths under `assets/` are shipped files; paths under `src/` are runtime generators (0 MB shipped where noted).
Status: Shipped (M0/M1) · Planned (M2/M3/M4). Hash "—" means recorded on creation (planned items).

### 2.1 Weapons (12 styles)

| # | Asset | Type | Size | Path | Source | Licence | Consumer | Status | Hash |
|---|---|---|---|---|---|---|---|---|---|
| W1 | Weapon icon atlas (12 styles, 48 px cells) | 2D texture | 256×256 (5×3 grid, 12 used) | `assets/icons/weapons.png` (generated via `src/icons.js`) | In-house canvas generator (`src/icons.js` `generateWeaponIconAtlas`) | Original (project-owned) | `src/hud.js` weapon plate (active/inactive), pickup icon in `src/main.js` | Shipped (M1) | `AF1AEDC71AC7169DB10289F1C4353A11886BA92B2932CA478E07C37AE5319ABD` |
| W2 | Weapon 3D meshes (12 styles, shared primitive + style tag) | 3D geometry | ≤ 2 000 tris/style (shared) | `src/main.js` / `src/weapons.js` (procedural) | In-house primitive assembly (BoxGeometry/CylinderGeometry) | Original (project-owned) | `src/weapons.js` (style behaviour), `src/main.js` (scene) | Planned (M2) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` |
| W3 | Tracer geometry per style (colour/shape per ART_BIBLE §3) | VFX geometry | box 0.055×0.055×1, pooled ≤ 800 | `src/main.js` / `src/fx.js` (procedural) | In-house pooled BufferGeometry | Original (project-owned) | `src/fx.js` / `src/weapons.js` (per-style tracer) | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` |

### 2.2 Enemy sheets (8 roles)

| # | Asset | Type | Size | Path | Source | Licence | Consumer | Status | Hash |
|---|---|---|---|---|---|---|---|---|---|
| E1 | Enemy silhouette atlas (8 roles, 32 px cells) | 2D texture | 256×256 (8 roles) | `assets/icons/enemies.png` (planned generator in `src/`) | In-house canvas generator (planned, M2) | Original (project-owned) | `src/hud.js` threat/readability cues, `src/enemies.js` | Planned (M2) | — (recorded on creation) |
| E2 | Enemy roster meshes (8 roles: Rifleman, Sapper, Shieldbearer, Spotter, Drone, Mortar, Mech, Gunship) | 3D geometry | Within enemy budget (≤ 400 instanced) | `src/enemies.js` (procedural) | In-house primitive assembly reusing A010 rig + `chitin` material (seed 77) | Original (project-owned) | `src/enemies.js` / `src/main.js` (combat, instanced) | Planned (M3) | — (recorded on creation) |
| E3 | Enemy body material (chitin, emissive `#3a0406`) | 2D texture | 512×512 | `src/materials.js` (`bakeTexture` kind=`chitin`, seed 77) | In-house bake (`materials.js`) | Original (project-owned) | `src/enemies.js` (enemy bodies, hostile optics) | Shipped (M0) | `AD8369CC45D9F77C475F47A61098493E94D883BA90DDAAFC567F56A4B3B4348E` |

### 2.3 Textures (surfaces and arena)

| # | Asset | Type | Size | Path | Source | Licence | Consumer | Status | Hash |
|---|---|---|---|---|---|---|---|---|---|
| T1 | Baked texture set (10 kinds: wood, masonry, plaster, thatch, stone, moss, chitin, cloth, dirt, metal) | 2D texture | 256–512 px per kind | `src/materials.js` (runtime CanvasTexture) | In-house bake (`bakeTexture`) | Original (project-owned) | All surfaces (player, enemies, arena, props) | Shipped (M0) | `AD8369CC45D9F77C475F47A61098493E94D883BA90DDAAFC567F56A4B3B4348E` |
| T2 | Ground plane (moss kind, triplanar) | 2D texture | 512×512 | `src/materials.js` (kind=`moss`, seed 17) | In-house bake (`materials.js`) | Original (project-owned) | Ground plane (`src/level.js` / `src/main.js`) | Shipped (M0) | `AD8369CC45D9F77C475F47A61098493E94D883BA90DDAAFC567F56A4B3B4348E` |
| T3 | Perimeter wall / containers (masonry kind) | 2D texture | 512×512 | `src/materials.js` (kind=`masonry`, seed 7) | In-house bake (`materials.js`) | Original (project-owned) | Perimeter walls, containers (`src/level.js`) | Shipped (M0) | `AD8369CC45D9F77C475F47A61098493E94D883BA90DDAAFC567F56A4B3B4348E` |
| T4 | Concrete barriers (stone kind) | 2D texture | 512×512 | `src/materials.js` (kind=`stone`, seed 21) | In-house bake (`materials.js`) | Original (project-owned) | Cover props (`src/level.js`) | Shipped (M0) | `AD8369CC45D9F77C475F47A61098493E94D883BA90DDAAFC567F56A4B3B4348E` |
| T5 | Puddles (metal kind, roughness 0.15–0.30) | 2D texture | 512×512 | `src/materials.js` (kind=`metal`, seed 33) | In-house bake (`materials.js`) | Original (project-owned) | Puddle meshes (`src/main.js`) | Shipped (M0) | `AD8369CC45D9F77C475F47A61098493E94D883BA90DDAAFC567F56A4B3B4348E` |
| T6 | Trees / bushes / logs (wood kind) | 2D texture | 512×512 | `src/materials.js` (kind=`wood`, seed 90+) | In-house bake (`materials.js`) | Original (project-owned) | Foliage props (`src/foliage.js`) | Shipped (M0) | `AD8369CC45D9F77C475F47A61098493E94D883BA90DDAAFC567F56A4B3B4348E` |
| T7 | Player cloth / steel / flesh (cloth, metal, plaster kinds) | 2D texture | 256–512 px | `src/materials.js` (kinds cloth/metal/plaster, seeds 5/12/8) | In-house bake (`materials.js`) | Original (project-owned) | Player soldier (`src/main.js`) | Shipped (M0) | `AD8369CC45D9F77C475F47A61098493E94D883BA90DDAAFC567F56A4B3B4348E` |
| T8 | Airdrop crate / floodlight / sentry / gunship surfaces | 2D texture | 256–512 px | `src/materials.js` (mixed kinds, seeds 41–81) | In-house bake (`materials.js`) | Original (project-owned) | Crate, floodlight, sentry, gunship (`src/main.js`) | Planned (M2/M4) | `AD8369CC45D9F77C475F47A61098493E94D883BA90DDAAFC567F56A4B3B4348E` |

Note: no standalone `assets/textures/*.png` files ship; all surfaces are runtime-baked textures (A090). Ground/wall are not separate files — they are material kinds consumed by the level and prop meshes.

### 2.4 Icons (HUD and cards)

| # | Asset | Type | Size | Path | Source | Licence | Consumer | Status | Hash |
|---|---|---|---|---|---|---|---|---|---|
| I1 | Weapon icon atlas (48 px) | 2D texture | 256×256 | see W1 | see W1 | Original (project-owned) | `src/hud.js` weapon plate | Shipped (M1) | `AF1AEDC71AC7169DB10289F1C4353A11886BA92B2932CA478E07C37AE5319ABD` |
| I2 | Enemy silhouette atlas (32 px) | 2D texture | 256×256 | see E1 | see E1 | Original (project-owned) | `src/hud.js` threat cues | Planned (M2) | — (recorded on creation) |
| I3 | Card icons (3 states) | 2D texture | 3 × 128×128 | `assets/icons/cards.png` | In-house canvas generator (planned, M2) | Original (project-owned) | `src/hud.js` cards 1/2/3 at level-up (GDD §9, ART_BIBLE §8.2) | Planned (M2) | — (recorded on creation) |
| I4 | HUD panels / bars / affordances (vitals, title, dead, deploy prompt, hint) | In-canvas UI | Negligible (primitives) | `src/main.js` `syncHud()` via `__studio.hud` | In-house in-canvas primitives | Original (project-owned) | `src/hud.js` / `src/main.js` | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` |
| I5 | UI typeface (stencil-feel sans) | Font | None shipped | Browser system sans-serif | N/A (no file) | N/A — system font | `src/hud.js` (all text ≥ 11 px) | Shipped (M0) | — (no file) |

### 2.5 FX strips and particles

| # | Asset | Type | Size | Path | Source | Licence | Consumer | Status | Hash |
|---|---|---|---|---|---|---|---|---|---|
| F1 | Muzzle flash (sphere 0.24, additive `#ffedb0`) | VFX geometry | radius 0.24, life 0.06 s | `src/main.js` / `src/fx.js` (procedural) | In-house procedural geometry | Original (project-owned) | `src/fx.js` (fire effect, all styles) | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` |
| F2 | Impact sparks (pooled particles) | VFX | ≤ 400 on screen | `src/fx.js` (procedural pool, planned M2) | In-house pooled BufferGeometry | Original (project-owned) | `src/fx.js` (hit effect) | Planned (M2) | — (recorded on creation) |
| F3 | Particle pool (smoke, sparks, debris, Blackout shot light) | VFX | ≤ 400 on screen | `src/fx.js` (procedural pool, planned M2) | In-house pooled BufferGeometry | Original (project-owned) | `src/fx.js` (combat feedback, Blackout shot light) | Planned (M2) | — (recorded on creation) |
| F4 | Ground fire patches (flamer) | VFX geometry | ≤ 24 concurrent, 4 s life | `src/fx.js` (procedural patches, planned M2) | In-house pooled patches | Original (project-owned) | `src/fx.js` (flamer style) | Planned (M2) | — (recorded on creation) |
| F5 | Casings (pooled, max 6) | VFX / audio | ≤ 6 concurrent | `src/fx.js` / `src/audio.js` (planned M2) | In-house pool | Original (project-owned) | `src/fx.js` (per-family casing ticks) | Planned (M2) | — (recorded on creation) |
| F6 | Rain streak field | VFX geometry | 420 segments, 1 draw call | `src/main.js` (procedural) | In-house generator (seed 9090) | Original (project-owned) | `src/main.js` (atmosphere, all beats) | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` |
| F7 | Airdrop crate (BoxGeometry + ConeGeometry) | 3D geometry | ≤ 500 tris | `src/main.js` (procedural) | In-house primitive assembly | Original (project-owned) | `src/main.js` (every 90 s drop) | Shipped (M1) | `B56FC29B7A7F15D5C6E9ECAFBFACA6A0D36D48157001C1CC1D599B3E2B4E862D` |
| F8 | Sentry turret (ability/style) | 3D geometry | ≤ 800 tris | `src/` (procedural, planned M2) | In-house primitive assembly | Original (project-owned) | `src/main.js` (sentry style + ability) | Planned (M2) | — (recorded on creation) |
| F9 | Floodlight (per-arena) | 3D geometry | ≤ 300 tris | `src/` (procedural, planned M2) | In-house primitive assembly | Original (project-owned) | `src/main.js` (Blackout II + siege beats) | Planned (M2) | — (recorded on creation) |
| F10 | Gunship (boss) | 3D geometry | ≤ 5 000 tris | `src/` (procedural, planned M4) | In-house primitive assembly | Original (project-owned) | `src/main.js` (Beat 8 boss) | Planned (M4) | — (recorded on creation) |

Note: no standalone `assets/fx/*.png` strips ship. Muzzle flash and impacts are procedural geometry/particles (A110/A120), not texture strips; a PNG strip would have no consumer in the current build.

### 2.6 Audio (SFX, barks, beds, music)

| # | Asset | Type | Size | Path | Source | Licence | Consumer | Status | Hash |
|---|---|---|---|---|---|---|---|---|---|
| A1 | Gun reports (12 styles × 3 pitch variants + suppressed) | Audio | Part of 12 MB (synthesised = 0 MB shipped) | `src/audio.js` (synthesised, planned M2) | In-house Web Audio synthesis | Original (project-owned) | `src/audio.js` (combat feedback) | Planned (M2) | — (recorded on creation) |
| A2 | Casings (metallic ticks) | Audio | ≤ 6 concurrent, part of 12 MB | `src/audio.js` (synthesised, planned M2) | In-house Web Audio synthesis | Original (project-owned) | `src/audio.js` (combat feedback) | Planned (M2) | — (recorded on creation) |
| A3 | Reload sounds (per family: mag slap, bolt, belt, break-open, cell swap, drum, breach, rack) | Audio | Part of 12 MB (synthesised) | `src/audio.js` (synthesised, planned M2) | In-house Web Audio synthesis | Original (project-owned) | `src/audio.js` (reload feedback) | Planned (M2) | — (recorded on creation) |
| A4 | Game SFX (hit, pickup, hurt, airdrop, level-up) | Audio | ≤ 120 KB each if baked; synthesised = 0 MB | `src/audio.js` (synthesised) or `assets/audio/*.ogg` | In-house synthesis (PRD-08 minimum set: fire, reload, hit, pickup, hurt) | Original (project-owned) | `src/audio.js` (PRD-08: 5 SFX) | Planned (M2) | — (recorded on creation) |
| A5 | Radio barks (6: B01–B06) | Audio | Part of 12 MB | `src/audio.js` / `assets/audio/barks/*.ogg` (planned M3) | In-house recording / synthesis | Original (project-owned) | `src/audio.js` (narrative delivery, GDD §14.3) | Planned (M3) | — (recorded on creation) |
| A6 | Arena tension bed + blackout drone bed | Audio | Part of 12 MB | `src/audio.js` (synthesised/generated) | In-house composition (PRD-08: 2 beds) | Original (project-owned) | `src/audio.js` (atmosphere; ducks 6 dB on Blackout) | Planned (M2/M3) | — (recorded on creation) |
| A7 | Music bed (92 BPM industrial, layered, ducks 6 dB on Blackout) | Audio | 60–90 s loop, part of 12 MB | `assets/audio/music.ogg` (planned M3) | In-house composition | Original (project-owned) | `src/audio.js` (atmosphere) | Planned (M3) | — (recorded on creation) |

Note: audio is synthesised at runtime where possible (counts as 0 MB shipped) to honour the 12 MB audio budget and the no-network constraint. Baked OGG/MP3 files (music, barks) count against the budget and must land under `assets/audio/`.

### 2.7 Levels, props and VFX (already shipped / procedural)

| # | Asset | Type | Size | Path | Source | Licence | Consumer | Status | Hash |
|---|---|---|---|---|---|---|---|---|---|
| L1 | Arena data (3 arenas) | JSON data | 3 files | `assets/levels/arena1.json` … `arena3.json` | In-house data (GDD-02) | Original (project-owned) | `src/level.js` / `src/director.js` | Shipped (GDD-02) | — (data, no hash) |
| L2 | Arena props (trees, bushes, logs, puddles) | 3D geometry | Within scene budget | `src/foliage.js` + `src/materials.js` | Procedural (seeds 4242/9090) | Original (project-owned) | `src/main.js` (all beats) | Shipped (M0) | `81B884C892792463A6523793BC0541ACC0753FD2F1A4817CC6A8553E1596A785` |
| L3 | Rain streak field | VFX geometry | 420 segments, 1 draw call | `src/main.js` (procedural) | In-house generator (seed 9090) | Original (project-owned) | `src/main.js` (atmosphere, all beats) | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` |
| L4 | Player soldier (primitive/generated model) | 3D geometry | ≤ 2 000 tris | `src/main.js` + `src/materials.js` | In-house primitive assembly | Original (project-owned) | `src/main.js` (all beats) | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` |

### Rules (unchanged)

- Every file gets a manifest entry `{path, kind, source, licence, added, used_by}` in `assets/manifests/assets.json` (and mirrored in `ASSET_INDEX.json`).
- A generated asset records the generator/seed/workflow; a sourced asset records URL + licence + author + SHA-256.
- No row without a consumer: each asset above names the module/feature that uses it; an asset with no consumer is not listed.
- No standalone PNG weapon/enemy/FX-strip files ship: weapons, enemies and FX are procedural (see W2, E2, F1–F5); only the icon atlases (W1, E1, I3) and audio files (A5, A7) are shipped files beyond runtime generators.
- If a row cannot be produced, it becomes a BLOCKER with the command and error in `DECISIONS.md`, not a silent placeholder.
- CC0 / public domain / explicitly compatible only for any third-party asset; prefer local reuse and generated assets before downloads; no runtime network calls.

---

## 3. Sources cleared for this build (2026-10-27)

| Need | Source | Notes |
|---|---|---|
| weapon / prop models | **Polyfork** https://polyfork.dev | parametric glTF; recolour to ART_BIBLE palette |
| collidable props | **NVIDIA SimReady** https://huggingface.co/datasets/nvidia/SimReady-Assets | physics + semantic labels included |
| anything else 3D | **Sketchfab** https://sketchfab.com | check the licence per model, not the site |
| character animation | **Mesh2Motion** https://mesh2motion.org | rig + walk cycle, export back to Blender |
| reference image → Three.js scene | **img2threejs** (vendored: `forge/tools/img2threejs`) | no download needed |

Full catalogue + licence rules: `forge\docs\ASSET-SOURCES.md`.
Every file must land in `assets/manifests/assets.json` with source and licence before use.


## 4. Art bible lock consumed (ART-01)

ASSET_PLAN rows inherit the locked values from ART_BIBLE.md (sections 4, 5.1, 8.1, 8.2, 9.1).
No asset may introduce a colour, material recipe, light value, type size or icon size outside
those tables without a DECISIONS.md entry.

- Palette: core #0b0d11 / #3a3f47 / #4b5340 / #ffb347 / #ff4d4d / #ffd57a /
  #ffedb0 / #a9dcd2; HUD states #7ce6a8 / #e8c25a / #f2545b; surfaces per ART_BIBLE.md 4.
- Materials: kinds and recipes per ART_BIBLE.md 9.1; seeds, palettes, weathering and triplanar
  rules are authoritative for every generated texture.
- Lighting: per-arena floodlight counts/intensities and Blackout values per ART_BIBLE.md 5.1
  (Perimeter 1x1.2; Breach Yard 2x1.4 with 8.0 s blackout; Gunship Pad 3 lights 1.6/1.0/1.0).
- Type scale: tokens per ART_BIBLE.md 8.1 (display 40, death-title 36, health-number 20, prompt 15,
  subtitle/dead-sub 14, vitals-title/mag/beat-name 13, body 12, floor 11).
- Iconography: weapon icons 48x48 (atlas 256x256), enemy silhouettes 32x32, card icons 128x128,
  HUD panels/sizes per ART_BIBLE.md 8.2.
