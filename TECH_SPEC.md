# Forge Smoke — Technical Spec

**Profile:** Web 2D (Genex studio harness, Three.js WebGL)
**Engine:** Genex studio harness (`window.__studio`, in-canvas HUD, deterministic `rng`/`dt`)
**Owner:** technical-artist (TECH-01)

## 1. Architecture

- **Runtime:** a single `THREE.WebGLRenderer` + one `THREE.Scene` + one `THREE.PerspectiveCamera`, served
  statically from `index.html` with no build step and no bundler. Three.js is vendored under `vendor/`.
- **Entry:** `src/main.js` owns renderer setup, scene graph, `state`, `update(dt, ctx)`, `render()` and the
  `installStudio(...)` call. `src/studio.js` is the provided contract and is not edited.
- **Shared modules (provided, reuse only):** `src/materials.js` (baked textures), `src/foliage.js`
  (alpha-tested leaf cards), `src/hud.js` (studio in-canvas HUD).
- **Planned data modules (GDD-02, no side effects):** `src/tuning.js` exports `TUNING`; `src/balance.js`
  exports pure formula functions (`damageAfterArmour`, `enemyHpAt`, `enemySpeedAt`, `score`,
  `multiplier`, `xpThreshold`, `spawnBudget`, `eliteChance`, `spawnInterval`). All tuning values live
  there; no magic numbers in `update()`.
- **Planned system modules (land with their tasks, one owner each):** `src/save.js` (localStorage
  schema/corruption handling), `src/audio.js` (Web Audio graph), `src/weapons.js`, `src/enemies.js`,
  `src/director.js`. Each new module is wired into `src/main.js` only through its `FACET WIRING`
  block (one import + one init line).
- **Input path:** one path only — `ctx.keys` / `ctx.look` / `ctx.wheel` / `ctx.pointer` inside
  `update()`. No private listeners, no DOM UI.
- **Determinism:** all randomness comes from the seeded `rng` from `makeRng(seed)` in `update()` /
  `reset(seed)`; time comes only from `dt`. No `Math.random`, no wall clock in simulation, no
  adaptive/catch-up scalars.
- **Offline:** zero runtime network calls; all assets and code are local. Preview:
  `http://127.0.0.1:8796/preview/forge-smoke/`.

## 2. Scene / module structure

Scene graph (single scene, single renderer):

- `scene` root
  - lights: `HemisphereLight` (sky/ground), `DirectionalLight` sun (shadows), per-zone `SpotLight`/
    floodlights (full release).
  - `ground` (tag `ground`), puddles (tag `puddle`), props: trees/bushes/logs (tags `tree`, `bush`,
    `log`), rain (tag `rain`, one draw call).
  - `soldier` group (tag `soldier`) with tagged parts (`player-body`, `pack`, `player-head`, `visor`,
    `rifle`, `muzzle-brake`, `magazine`) and `gunPivot`.
  - enemies: individual meshes (tag `enemy`) at M0; instanced meshes (tag `enemy`) in full release.
  - effects pool: tracers (tag `tracer`), muzzle flash (tag `muzzle-flash`), particles, ground-fire
    patches, casings — all pooled, never allocated per frame.
  - full-release objects (their tasks): airdrop crate (tag `crate`), sentry turret (tag `sentry`),
    floodlights (tag `floodlight`), Gunship (tag `boss`).

Tagging rule: every mesh carries `userData.tag`; untagged meshes are invisible to `__studio.inspect()`
and to scene checks. `hud` is reserved for the studio overlay.

Module ownership:

- `src/main.js`: scene construction, `state`, `reset(seed)`, `startRun()`, `update()`, `render()`,
  `installStudio()`.
- `src/studio.js`: provided contract (do not edit).
- `src/materials.js` / `src/foliage.js`: provided asset helpers (reuse only).
- `src/tuning.js` / `src/balance.js`: data + pure formulas (GDD-02).
- `src/save.js` (planned): localStorage read/write + corruption handling.
- `src/audio.js` (planned): Web Audio graph, mute, captions.

## 3. Data and save format

- **Tuning:** plain JS object exported from `src/tuning.js`; formulas in `src/balance.js`. Both
  deterministic and side-effect free. No engine or rendering change is introduced by data edits.
- **Economy (GDD-03):** airdrop cadence (90 s fixed, `floor(run_time/90)`), card weighting (slot
  weights Barrel 20/Magazine 20/Optic 15/Underbarrel 15/Receiver 15/Plate 15; rarity Common 70/Rare
  25/Evolution 5; type roll Weapon 35/Part 65), overtime difficulty curve (§GDD 11.9: HP
  `1+0.18t` uncapped, speed capped 1.45, spawn budget `min(400, floor(8+3.2t))`, elite
  `min(0.35, 0.06t)`, interval `max(0.5, 1.2-0.012*t_s)`), and score formula
  `(kills*12 + damage*0.12 + seconds*6) * m` with `m = 1 + 0.1b + 0.08e + 0.05a` clamped
  `[1,3]` are documented in `GDD.md` §11.9 and implemented in `src/balance.js`
  (`score`, `multiplier`, `spawnBudget`, `eliteChance`, `spawnInterval`, `enemyHpAt`,
  `enemySpeedAt`, `xpThreshold`). Expected player power by minute 2/5/10 is tabulated in
  `GDD.md` §11.9 (loadout depth: parts owned, armour, evolutions, multiplier).
- **Runtime state:** one `state` object in `src/main.js`; `reset(seed)` clears enemies, effects and
  restores title state; `startRun()` transitions to `playing`.
- **Save:** `localStorage["forge-smoke/v1"] = { version: 1, best, bestTime, unlocks[], settings }`.
  - `best`: number (score). `bestTime`: number (seconds). `unlocks`: string[] with
    `unlocks.length ≤ 12`. `settings`: `{ mute, reducedMotion, colourBlind, keymap }`.
  - Corrupt, missing or unknown-version storage boots to defaults (title, no crash) and is logged
    once. No cloud saves, accounts or leaderboards.
  - Writes occur on run end and on settings change; reads occur on boot.
- **Determinism hooks:** `reset(seed)` reseeds `state.rng`; `begin()` (config.begin) starts a run
  synchronously and deterministically; `flow()` reports `{ phase, playing }`.

## 4. Input

All input is read from `ctx` in `update()` (see `docs/CONTRACT.md` §Input). One input path, no private
listeners.

Controls (from GDD.md §2): WASD/arrows 8-way move (direction relative to camera orbit); auto-fire at
the nearest threat in a 120° facing arc; left mouse manual override where applicable; right mouse aim
mode (0.6 s wind-up, spread −50 %, movement −25 %); `R` reload (1.1–2.4 s) and restart after death;
`Q` swap primary/secondary (does not reset the other weapon's reload); `Space` ability
(frag/smoke/sentry, one per run); `1`/`2`/`3` pick upgrade card; `Esc` pause; `W`/`Space` start on
title; `R`/`Space`/`Enter`/`Mouse1` restart on death. Mouse buttons arrive as `Mouse1`/`Mouse2`/
`Mouse3` in `ctx.keys`; look delta in `ctx.look`.

## 5. Audio

- **Engine:** Web Audio API. `AudioContext` is created on first key press or in `config.begin` (never
  at load, to satisfy autoplay policy). An `AnalyserNode` is passed as `config.audio` so
  `__studio.audio()` reports RMS + spectral centroid.
- **Content (full release):** one gun report per style × 3 pitch variants + suppressed variants;
  casings pooled at 6; distinct reload per family; 6 radio barks; 92 BPM industrial bed that ducks
  6 dB on Blackout; master −14 LUFS; SFX never above −6 dBFS.
- **M0:** no audio (slice ships silent); accessibility captions are on by default when muted.
- **Budget:** ≤ 12 MB decoded audio. Synthesis at runtime counts as 0 MB shipped; baked OGG/MP3 files
  count against the budget.
- **Mute:** remappable mute key; captions auto-enable when muted.

## 6. Rendering and performance budget

- **Renderer settings (M0 starter, measured):** `WebGLRenderer`, antialias on,
  `pixelRatio = min(devicePixelRatio, 2)`, `ACESFilmicToneMapping`, exposure `1.28`, shadows on
  (`PCFSoftShadowMap`, 1024×1024, bias `-0.0006`), `FogExp2` `#0b0d11` density `0.028`,
  hemisphere + directional sun. Low-end pass lands at M2; if shadows are disabled, record in `QA.md`.
- **Low preset:** one renderer, one scene, no realtime post chain.
- **Target (governing):** 60 FPS at 1280×720 (low preset, integrated graphics).
- **Budget (low preset, 1280×720):**

  | Metric | Limit | Measurement method |
  |---|---|---|
  | Frame rate | ≥ 60 FPS (p95 frame time ≤ 18 ms) | headed Chrome at 1280×720, 2 s sample; `renderer.info.render` read immediately after the world render (before HUD compose); p95 over the sample during a Blackout with 300 enemies |
  | Draw calls | ≤ 90 | `renderer.info.render.calls` read immediately after the world render (before HUD compose) |
  | Triangles | ≤ 150 000 | `renderer.info.render.triangles` read immediately after the world render (before HUD compose) |
  | Texture memory | ≤ 96 MB | summed byte size of every texture (width × height × format bpp × mip factor) across all materials, cross-checked with Chrome DevTools GPU memory |
  | Audio (decoded) | ≤ 12 MB | sum of decoded `AudioBuffer` byte sizes; runtime synthesis counts as 0 MB shipped |
  | Build size (shipped) | ≤ 30 MB uncompressed (≤ 10 MB gzipped) | sum of all served file sizes excluding `docs/`, tests and `.git` (PowerShell `Measure-Object Length -Sum` / `du`); gzipped size via 7z or gzip on the release folder |

- **Caps:** enemies ≤ 400 (instanced), projectiles ≤ 800, particles ≤ 400, ground-fire patches ≤ 24,
  casings ≤ 6, tracers 18 (M0) / ≤ 800 (full). Spatial hash with 3 m cells for queries/collision.
- **Pooling:** all transient objects pooled; one shared material per enemy class; weapons are
  primitives with a style tag; no per-frame allocations in the hot path.
- **Measurement method (named):** headed Chrome at 1280×720, 2 s sample; read
  `renderer.info.render.calls` and `renderer.info.render.triangles` immediately after the world
  render (before HUD compose). Texture memory via the texture byte-sum method above (cross-checked
  with Chrome DevTools GPU memory). Audio via decoded buffer size. Build size via served-file sum
  (gzipped via 7z/gzip). Performance pass/fail: p95 frame time ≤ 18 ms during a Blackout with
  300 enemies. Headless software render (~10 fps) is not representative and is never used as
  evidence.

## 7. Build / packaging

- **Build command:** none (`forge.json` has no `build`). The project is a static site: copy the folder
  and serve it; entry `index.html`; main `src/main.js`.
- **Offline:** no runtime network calls; all code/assets vendored locally.
- **Build size budget (low preset):** ≤ 30 MB uncompressed (≤ 10 MB gzipped) shipped payload, measured
  as the sum of all served file sizes excluding `docs/`, tests and `.git` (PowerShell
  `Measure-Object Length -Sum` / `du`); gzipped size via 7z or gzip on the release folder. Recorded in
  `QA.md` at release (`RELEASE-01`).
- **Versioning:** recorded in `TASKS.json` / `DECISIONS.md`; release packaging (ZIP + manifest) is
  `RELEASE-01` and is not part of this task.
- **Regeneration:** `docs/GAME-INDEX.txt` (if used) is regenerated after code/art changes via
  `tools/map_game.py`.

## 8. Test hooks

Named hooks the harness and tests rely on:

- `window.__studio` (from `src/studio.js`): `seed(n)`, `start()`, `pause()`, `step(dtMs)`,
  `begin()`, `state()`, `probes()`, `cameras()`, `demos()`, `demo(name)`, `capture()`, `hud`,
  `inspect()`, `audio()`, `injectInput(...)`, `debugCamera(name)`, `eye(name)`.
- `config.begin` / `config.flow` declared in `installStudio(...)` so judges can drive from play;
  `state().flow = { phase, playing }`.
- `probes()` reports `{ health, kills, enemies, phase }` at M0 and expands to
  `{ health, kills, enemies, phase, score, multiplier }` once scoring lands.
- `player()` reports `{ x, y, z, yaw }`; `cameras()` includes `default` and the M0 `placeCamera`
  viewpoint; debug viewpoints `eye:spawn`, `eye:here`, `eye:down`, `eye:back`.
- Tag-based scene checks via `__studio.inspect()`: `meshes(tag)`, `count(tag)`, `bbox(tag)`,
  `untagged()`, `domUi()`, `hud()`.
- HUD checks: `state().hud` reports ids, count, coverage, overlaps; `hud.overlaps` must be empty.
- **BT-01 (balance):** `node tests/balance.test.mjs` computes the TTK table from `src/tuning.js` +
  `src/balance.js` and asserts the bounds in GDD.md §11.8 (12 styles vs 7 enemies + Gunship boss); must pass before any tuning change ships.
- **BT-02 (economy):** verify the overtime curve values in GDD.md §11.9 reproduce from
  `enemyHpAt`, `enemySpeedAt`, `spawnBudget`, `eliteChance`, `spawnInterval` in `src/balance.js`,
  and that `score`/`multiplier` match the documented formula and clamp `[1,3]`. Power curve table
  (minute 2/5/10) is a design reference checked by review, not a runtime assertion.
- **Performance test:** p95 frame time ≤ 18 ms at 1280×720 during a Blackout with 300 enemies.
- **Determinism test:** same seed + same inputs ⇒ same spawn pattern and score.
- **Save test:** corrupt `localStorage` boots to title without a crash.
- **Slice acceptance (QA.md):** boot/title phase/0 console errors; W starts run and moves player;
  auto-fire kills, mag 30→0, R reloads to 30; `hud.overlaps: []`; ≥ 55 fps at 1280×720; death →
  restart; corrupt save boots to title.

## 9. Risks (technical and content)

Risk register for TECH-03. Each row has an owner, a measurable trigger and a fallback. Mitigations are in force now; fallbacks activate only on failure and are recorded in `QA.md` / `DECISIONS.md`. Non-goals remain listed in `## 10`.

| ID | Risk | Type | Owner | Trigger | Mitigation | Fallback |
|---|---|---|---|---|---|---|
| R01 | iGPU frame budget breach (60 FPS, 90 draw calls, 150k tris, 96 MB textures at 1280x720) | Tech | performance-engineer | p95 frame time > 18 ms or draw calls > 90 / tris > 150k / textures > 96 MB during a Blackout with 300 enemies | 400-enemy cap (instanced), 800 projectile / 400 particle caps, pooling, no post chain, measured pass at M2 | Disable shadows + AA on low preset, drop pixel ratio to 1, cap enemies at 200, record in QA.md |
| R02 | Blackout readability / frame drop | Tech/Content | technical-artist | Players cannot parse enemies or p95 > 18 ms during the 8 s Blackout | Light-state switch only (no shader rewrite), hostile optics emissive, 0.2 s muzzle-flash room light | Shorten Blackout to 6 s, add dim emergency floodlight, reduce muzzle-flash frequency |
| R03 | Audio autoplay / latency | Tech | technical-artist | AudioContext fails to start on first input or latency > 50 ms | Create AudioContext on first key, captions on mute, runtime synthesis | Ship muted by default with captions; drop music bed if budget exceeded |
| R04 | Save corruption / bad boot | Tech | technical-artist | Corrupt or unknown-version localStorage throws or boots to wrong state | Validate schema + version in src/save.js, reset to defaults, log once | Ignore storage, boot in-memory defaults, show "save disabled" on title |
| R05 | Determinism drift | Tech | technical-artist | Same seed + inputs yields different spawns or score | Single seeded rng, dt-only time, no wall clock, no adaptive scalars | Remove non-deterministic effects (particle jitter) and re-run determinism test |
| R06 | HUD overlap / illegibility | Tech/UI | art-director | hud.overlaps non-empty or text < 11 px at 1280x720 | Coverage measurement, in-canvas layout, min 11 px text | Reposition panels, collapse non-critical HUD (airdrop countdown) behind toggle |
| R07 | Build size overrun (30 MB / 10 MB gz) | Tech | producer | Shipped payload > 30 MB uncompressed or > 10 MB gzipped | Static site, local assets, runtime synthesis, no bundler | Compress textures/audio, drop optional music, remove unused assets |
| R08 | Browser / input incompatibility | Tech | technical-artist | Controls fail or aim mode unusable in a target browser | One input path via ctx, standard keys, remappable keys | Keyboard-only mode, document supported browsers, disable mouse-dependent aim |
| R09 | Enemy cap / instancing regression | Tech | performance-engineer | > 400 enemies or non-instanced meshes push draw calls > 90 | Instanced meshes, one shared material per class, spatial hash | Cap at 200, merge meshes, reduce spawn budget |
| R10 | Generated-art registration defect | Tech/Content | art-director | Sprite pivot/bbox mismatch or wrong draw box in seeded screenshot | Registration contract, seeded screenshots before merge | Use procedural primitives for that asset, defer generated art |
| R11 | Twelve styles feel samey | Content | game-designer | Players cannot distinguish styles within 1 s or BT-01 TTK out of bounds | Unique tracer colour/shape/sound/rhythm per style, BT-01 bounds, tracer table | Reduce drop rarity for offending style and re-tune; if unresolved ship 10 styles (DECISIONS.md) |
| R12 | Style balance (TTK out of bounds) | Content | systems-designer | BT-01 fails for any style vs any enemy | Adjust damage or HP, never fire rate alone (pillar 1) | Widen bounds with DECISIONS.md entry or remove style from drop pool |
| R13 | Blackout frustration | Content | game-designer | Players report unfair deaths or cannot parse during Blackout | 8 s only, hostile optics visible, muzzle flash lights room | Shorten to 6 s, add dim floodlight, brighten hostile optics |
| R14 | Enemy readability at 32 px | Content | art-director | Players misidentify enemy roles in playtest | Silhouette cues and role colours per ART_BIBLE.md section 3 | Add outline/colour ring, delay complex enemies to later beats |
| R15 | Scope creep (12-min run) | Content/Sched | producer | Milestone slips or content not ready by QA | One task at a time, slice first, explicit non-goals | Ship 4-beat version as v1, defer Gunship/overtime to patch |
| R16 | Airdrop frustration (no pity) | Content | game-designer | Playtest shows frustration from unlucky drop sequences | Explicit rates, no hidden scaling (GDD.md section 11.5) | Add pity counter for Evolution rarity only (requires DECISIONS.md) |
| R17 | Gun art cost / readability at 48 px | Content | art-director | Style silhouettes not readable at 48 px or tri budget exceeded | Primitives + generated icons, no photoreal or licensed models | Reuse base mesh with style-tag colour, reduce icon detail |
| R18 | Licence / provenance failure | Content/Legal | producer | Asset licence unclear or incompatible, or hash mismatch | Audit, CC0/public-domain only, provenance rows (ASSET_PLAN.md) | Remove asset, replace with procedural primitive, log in DECISIONS.md |
| R19 | Difficulty spikes / unfair scaling | Content | systems-designer | Players die to untelegraphed spikes or HP scaling too steep | Explicit caps (speed 1.45, spawn 400), telegraphs >= 0.35 s, no spawn without 0.6 s marker | Reduce scaling constants, delay elite chance, lengthen telegraphs |
| R20 | Narrative / bark overload | Content | narrative-designer | Barks interrupt the 30 s loop or exceed 8 words | Auto-dismiss 2.0 s, skippable, max 8 words, no lore gates | Reduce to 4 barks, mute by default, captions on |

## 10. Non-goals (technical)

No multiplayer, accounts, leaderboards, cloud saves, monetisation, realistic ballistics, licensed
names/models, paid/downloaded art, runtime network calls, mobile-specific layout, classes,
procedural maps, mod support, bundler or framework.

## 11. Performance Budget
- Frame budget: 16.6 ms at 720p resolution (1280x720)
- Draw-call cap: 90 per frame
- Triangle cap: 150,000 triangles per frame
- Texture memory ceiling: 96 MB
- Baseline measurement: TBD (to be measured on low-end reference device)
- Fail condition: Any frame exceeding 16.6 ms frame time, draw-call count exceeding 90, triangle count exceeding 150,000, or texture memory exceeding 96 MB triggers a performance failure. Baseline must be measured on low-end hardware (e.g., Intel UHD 620 or equivalent) at 1280x720.
