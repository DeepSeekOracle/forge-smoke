# Forge Smoke — Licence Manifest (ART-03)

Audit date: 2026-10-27 · Task: ART-03 (Licence Audit) · Owner: producer
Status: **complete** · Incompatible items found: **0** · Items removed: **0**

## 1. Scope

- Game assets: original or locally generated only. No paid, downloaded or ripped art/audio.
- Runtime code: vendored Three.js (MIT) + Genex studio harness (platform terms).
- References: comparison only; no art, audio, code, names or mechanics copied.
- Full per-asset provenance: `ASSET_PLAN.md` and `ASSET_INDEX.json`.

## 2. Audit result

| Category | Count | Licence status | Action |
|---|---|---|---|
| Game assets (A010–A200) | 20 | Original / project-owned (procedural or in-house) | None — all compatible |
| Generated provenance rows (G001–G013) | 13 | Locally generated, seeded, recorded | None — all compatible |
| Runtime deps | 3 | MIT / platform terms / Apache-2.0+ (see §4) | None — compatible |
| Comparison references | 5 | N/A — no assets copied | None — no assets present |
| `references/` folder | 1 file (`README.md`) | N/A | None |
| `assets/` folder | 2 files (`README.md`, `src/.gitkeep`) | N/A | None |

No unlicensed, ripped or incompatible asset, reference or dependency was found; nothing was removed.

## 3. Game assets

| ID | Asset | Licence | Status | SHA-256 |
|---|---|---|---|---|
| A010 | Player soldier (primitive/generated model) | Original (project-owned) | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` |
| A020 | Weapon icons / silhouettes (48 px) | Original (project-owned) | Planned (M1) | — (recorded on creation) |
| A030 | Enemy silhouettes (32 px) | Original (project-owned) | Planned (M2) | — (recorded on creation) |
| A040 | Arena props (trees, bushes, logs, puddles) | Original (project-owned) | Shipped (M0) | `81B884C892792463A6523793BC0541ACC0753FD2F1A4817CC6A8553E1596A785` |
| A050 | Airdrop crate | Original (project-owned) | Planned (M2) | — (recorded on creation) |
| A060 | Sentry turret | Original (project-owned) | Planned (M2) | — (recorded on creation) |
| A070 | Floodlight | Original (project-owned) | Planned (M2) | — (recorded on creation) |
| A080 | Gunship (boss) | Original (project-owned) | Planned (M4) | — (recorded on creation) |
| A090 | Baked textures (all kinds) | Original (project-owned) | Shipped (M0) | `AD8369CC45D9F77C475F47A61098493E94D883BA90DDAAFC567F56A4B3B4348E` |
| A100 | Rain streak field | Original (project-owned) | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` |
| A110 | Muzzle flash + tracer geometry | Original (project-owned) | Shipped (M0) | `EA5E378BD25C3EA02C6582C2C0AAF47E45209D212CA9B94C086C747AED0FA9A9` |
| A120 | Particle pool | Original (project-owned) | Planned (M2) | — (recorded on creation) |
| A130 | Ground fire patches (flamer) | Original (project-owned) | Planned (M2) | — (recorded on creation) |
| A140 | Gun reports (audio) | Original (project-owned) | Planned (M2) | — (recorded on creation) |
| A150 | Casings (audio) | Original (project-owned) | Planned (M2) | — (recorded on creation) |
| A160 | Reload sounds (audio) | Original (project-owned) | Planned (M2) | — (recorded on creation) |
| A170 | Radio barks (audio) | Original (project-owned) | Planned (M3) | — (recorded on creation) |
| A180 | Music (audio) | Original (project-owned) | Planned (M3) | — (recorded on creation) |
| A190 | UI typeface (system sans) | N/A — no file shipped (system font) | Shipped (M0) | — (no file) |
| A200 | Enemy roster meshes | Original (project-owned) | Planned (M3) | — (recorded on creation) |

## 4. Runtime dependencies

| Dependency | Version | Licence | Source / path | Game use |
|---|---|---|---|---|
| Three.js (core) | 0.185.1 | MIT | `vendor/three.module.js` (hash `BBF5ED13…`) | Renderer, scene, camera, materials |
| Genex studio harness | platform | Genex platform terms | `vendor/genex/` | `window.__studio`, in-canvas HUD, rng/dt |
| Three.js add-ons (Basis, Draco, etc.) | 0.185.1 | Apache-2.0 / MIT / ISC / W3C / MPL-2.0 / LGPL-2.1 (see notices) | `vendor/three/examples/jsm/libs/` | Not imported directly by the game; retained, unmodified, as platform-provided code |

Compatibility notes:
- MIT + Apache-2.0 are compatible with a closed/proprietary web release.
- MPL-2.0 (wee_alloc) and LGPL-2.1 (UTIF Panasonic RW2 decoder) are file-level copyleft; the game does not import or modify those modules, and they are shipped unmodified under their own terms. No removal required for this audit.
- Genex harness is used under platform terms; the game runs inside the Genex studio, so no redistribution of the harness is performed by the game itself.

## 5. References (comparison only)

| # | Reference | Used for | Assets copied |
|---|---|---|---|
| 1 | Azeroth Survivors | Survivors arc shape, HUD density | None |
| 2 | Vampire Survivors | One-button simplicity, silhouettes | None |
| 3 | Brotato | Weapon-slot identity, wave timer | None |
| 4 | Enter the Gungeon | Gun feel, tracer language | None |
| 5 | Nuclear Throne | Top-down feedback, telegraphs | None |

`references/` contains only `README.md`; no stills, mood boards or assets are shipped.

## 6. Generated assets (provenance)

Seeds recorded in `ASSET_PLAN.md` (G001–G013). All locally generated; no third-party grant needed. CC0/public-domain sources preferred for any future third-party asset; none are currently used.

## 7. Credits

See `CREDITS.md` (started at ART-03; completed at RELEASE-02).

## 8. Audit actions taken

- Verified shipped-asset hashes (A010, A040, A090) against `src/main.js`, `src/foliage.js`, `src/materials.js` — all match.
- Verified `vendor/three.module.js` hash against `ASSET_PLAN.md` — matches.
- Confirmed no external URLs or downloaded assets in `src/` or `index.html`.
- Confirmed `references/` and `assets/` contain no game assets.
- No removals performed (nothing incompatible found).
- Recorded this manifest and started `CREDITS.md`.
filePath">
C:\Users\justi\AI Games\forge-smoke\LICENCE_MANIFEST.md