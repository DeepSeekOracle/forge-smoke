# BUILD — the build contract (read this FIRST)

This is the **definition of done for a build task**. The GDD says what the game *is*; this file says
what must physically exist in the folder before a task counts as built.

A task is **not** done because a document was updated. It is done when a player loading
`/preview/<slug>/` sees or hears the difference. "Documentation only" is a **blocked** result.

---

## 1. M2 done-list (definition of done)

**Scope (matches GAME.md):** a three-arena campaign (Perimeter / Breach Yard / Gunship Pad) with the
eight-beat ladder and overtime, seven enemy types (+ Gunship boss), three weapon families (twelve
styles), eight cards, full menus and audio. In this release also: twelve styles, swap + reload,
airdrops, eight beats with Blackout, Gunship boss, overtime, local meta unlocks, local leaderboards,
progression. This list is the definition of done; it may grow during production — growth is not a
scope violation.

Every row below is a check a person can see or hear in the preview
(`http://127.0.0.1:8796/preview/forge-smoke/`). Anything a player cannot see or hear in the preview
does not satisfy this contract unless listed in `TECH_SPEC.md` as deliberately headless.

| # | Item (M2 scope) | Preview check (seen or heard) |
|---|---|---|
| 1 | Entry page loads current modules | `REFRESH` reads `0 files newer than the page`; canvas renders, no console errors |
| 2 | Title screen | Logo/wordmark, DEPLOY, OPTIONS, QUIT, version string, seed/level hint visible; Enter starts a run |
| 3 | Options screen | Master volume, SFX volume, mouse sensitivity, quality (dots/particles on/off) visible and adjustable; values persist after reload |
| 4 | Pause screen | RESUME, RESTART, OPTIONS, current score/wave visible; ESC toggles; simulation frozen, not reset |
| 5 | Game-over screen | Final score, wave reached, best score, RETRY, TITLE visible; RETRY starts a fresh run in < 1 s |
| 6 | In-canvas HUD | Segmented health/armor bar, ammo + reserve with low-ammo colour/pulse, weapon name + silhouette per slot (2 slots, Q swaps), objective/wave line, cards 1/2/3 with cooldown/charge, damage vignette — all live |
| 7 | Visual identity | Palette, fog, lighting per ART_BIBLE; no default-grey material; ground/horizon/sky read as one scene; every enemy and weapon readable at 64 px |
| 8 | Assets (≥ 6 installed, used) | 3 weapon silhouettes, 2 enemy silhouettes, 1 ground/wall texture + icon sheet present in `assets/`, each registered in `assets/manifests/assets.json` with source + licence and imported by the module that draws it |
| 9 | Authored level (data-driven) | One arena loads from `assets/levels/arena1.json`: 160×160, perimeter wall with two chokepoints, player spawn at a defensible corner facing open ground, 5 enemy spawn points staggered by wave, 2 pickup nodes, 1 objective marker; win = survive wave 5, lose = health 0; playable start→finish without code edits |
| 10 | Effects (≥ 3 in normal play) | Muzzle flash on fire, impact spark on hit, ambient weather (rain), screen shake on player damage — each fires in normal play, not only a debug path |
| 11 | Audio (≥ 4 SFX + bed) | `fire`, `reload`, `hit`, `pickup`, `hurt` audible plus a music bed; audible on first input; master mute + volume persistence works |
| 12 | Feel (tuned from GDD) | Input latency, fire cadence, camera response match GDD §11 numbers (visible in play: reload times, aim wind-up 0.6 s, swap 0.15 s) |
| 13 | Full run flow | Title → arena select → play → results → retry, every transition by keyboard or mouse, no dead end |
| 14 | Arena progression | Clearing beat 3 unlocks Breach Yard; clearing beat 6 unlocks Gunship Pad; campaign complete after beat 8 (visible in arena select / results) |
| 15 | Eight-beat ladder + overtime | Beat name + timer visible top-centre for beats 1–8 and overtime; spawns and timings match GDD §8 (Contact 0:00–0:45 … Gunship 11:00–12:00, Overtime 12:00+) |
| 16 | Blackout (beats 4 and 6) | Lights die for 8 s; hostile red optics stay visible; every shot lights the room for 0.2 s; guns are the only light |
| 17 | Enemy roster (7 + boss) | Rifleman, Sapper, Shieldbearer, Spotter, Drone, Mortar team, Mech and Gunship boss each spawn in the right beats with distinct, observable behaviour (shield blocks frontal hits, sapper 2 s fuse, mortar marked circle, mech minigun + stomp, gunship strafe + mines + enrage at 30 %) |
| 18 | Weapons (12 styles, 3 families) | Each style has a distinct tracer colour/shape and rhythm; swap (Q) preserves the other weapon's reload; reload variants per family; heat styles vent instead of reload |
| 19 | Level-up cards (8) | XP threshold shows a 3-choice card; 1/2/3 picks apply a part to the correct slot; part changes behaviour, not raw power |
| 20 | Airdrops | Crate lands every 90 s (B03 bark at 88 s, parachute, dust, lid pop); offers 2 options; pick applies weapon/part |
| 21 | Scoring | Results screen shows `(kills×12 + damage×0.12 + seconds×6) × multiplier` breakdown, threats down, time survived, multiplier, unlock tokens |
| 22 | Save and progression | Best score + best time per arena and unlock flags persist in `localStorage` (`forge-smoke/v1`); reload keeps them; corrupt storage boots to title without crash; 12 unlock tokens grant starting parts (never raw power) |
| 23 | Performance (low preset, 1280×720) | ≥ 60 FPS, p95 frame time ≤ 18 ms during a Blackout with 300 enemies; ≤ 90 draw calls, ≤ 150 000 triangles, ≤ 96 MB textures, ≤ 12 MB audio, ≤ 30 MB shipped (≤ 10 MB gzipped) |
| 24 | Determinism | Same seed + same inputs → same spawn pattern and score |

### Excluded from the M2 build — technical limits only (each cites a measured number)

| Capability | Exclusion (measured technical limit) | To allow |
|---|---|---|
| Co-op play | Frame budget: 2× enemy density measured 22 ms/frame at 720p, over the 16.67 ms budget. Hosting: static site has no signaling/relay server; Genex Colyseus needs embed/auth not validated in local test mode. | Add a signaling/relay host (or local same-screen second input path + aim handling) and raise the frame/enemy budget, or halve per-player density. |
| Shareable leaderboards | Hosting: static site has no backend to store or share scores. Browser API: no cross-origin shared storage without a server; Genex `submitScore`/`getLeaderboard` need embed/auth + network, not validated in local test mode. | Integrate the Genex leaderboard in embedded mode or deploy a backend, and drop the offline-only constraint. |
| Mods | Browser API: no sandboxed module loading or filesystem write in a static site without a user file pick. Hosting: no mod distribution endpoint. Memory/budget: unbounded mod content beyond 96 MB textures / 150 000 tris / 400-enemy cap. | A mod manifest + sandboxed loader (worker/iframe), a hosting endpoint for mod packs, and raised memory/asset budgets. |

### Not in this release (by design, not capabilities)

Classes, procedural maps, realistic ballistics sim, licensed names/models, paid/downloaded art, runtime
network calls, mobile-specific layout, bundler or framework. These describe how the game feels, not
what it may include; they are not capability cuts and carry no technical-limit citation.

### Growth clause

This list may grow during production as new observable checks are added; growth is not a scope
violation. No capability is removed for preference — a capability is built unless a measured
technical limit forbids it, named with its number above.

## 2. How to build (the loop, per asset type)

1. **Read** `GDD.md`, `ART_BIBLE.md`, `ASSET_PLAN.md` — they define the look and the asset list.
2. **Produce the asset** (in this order of preference):
   - local generation (ComfyUI / Qwen-Image / Blender / PD Howler) → `assets/_inbox/`
   - a registered free source (see `free-media-sources`) → record licence in `assets/manifests/assets.json`
   - procedural code geometry **only** as a placeholder, and say so out loud
3. **Validate** the asset (dimensions, alpha, tiles seamlessly, palette matches ART_BIBLE).
4. **Install** it: import in the module that uses it, add the manifest entry, wire the material/sprite.
5. **Prove** it: screenshot the preview and compare against the ART_BIBLE. If you cannot screenshot,
   state that the visual result is unverified — do not claim it looks good.
6. **Record**: append to `TASKS.json` evidence + `DECISIONS.md` what changed and why.

## 3. What counts as evidence

- file paths created or modified, with sizes
- the `REFRESH` readout: `index.html · served <age> · sha <hash> · <n> files newer`
- a screenshot of the running preview at the new state
- for audio: the file, its duration, and where it is triggered

## 4. What does not count

- "Updated GDD.md with the plan" — that is planning, not building
- adding a module nobody imports
- a placeholder cube described as "final art"
- changing tuning numbers with no visible or audible consequence
- claiming a screenshot was checked when none was taken

## 5. Escalation

If an asset cannot be produced locally (missing model, no licence, tool unavailable), that is a
**BLOCKER** with the exact command and error — not a silent downgrade to a grey box.

## 7. Path discipline (learned 2026-10-27)

The preview serves this project under `/preview/<slug>/`. A reference like `/games/hub.css` or
`/games/arcade-ledger.js` 404s there (measured). Reference assets relatively (`./assets/...`) only —
an absolute site path works on excavationpro.ca and breaks every local preview.

### Where to get assets (Forge library)

`C:\Users\justi\lygo\forge\docs\ASSET-SOURCES.md` — verified sources with licence notes:
**Polyfork** (2,600+ parametric glTF models, https://polyfork.dev), **NVIDIA SimReady** (physics-labelled
models on Hugging Face), **Sketchfab** (per-model licence), **Mesh2Motion** (rig + walk cycles, $0),
and **img2threejs** which is already vendored at `forge/tools/img2threejs`.
Download once into `assets/`, record `{path, kind, source, licence}` in
`assets/manifests/assets.json`. Never reference a live URL from a build.

For spec quality, `C:\Users\justi\lygo\forge\docs\SPEC-REVIEW.md` (Elephant/Goldfish): a cold
reviewer that has seen no chat history must be able to understand the spec from the files alone.
