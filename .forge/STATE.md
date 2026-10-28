# Forge Smoke — verified state (2026-10-28)

Snapshot of what actually exists, measured, not remembered. If you change something here, you own
updating this file.

## Build identity

| Field | Value |
|---|---|
| Project repo | `C:\Users\justi\AI Games\forge-smoke` |
| Deployed copy | `D:\excavationpro-ca\games\forgesmoke` |
| Live URL | `https://excavationpro.ca/games/forgesmoke/` |
| Live module version at snapshot | `main.js?v=20261030m` |
| Version scheme | `?v=YYYYMMDD?` single letter, bumped on every deploy |
| Start-screen build tag | bottom-right, reads `BUILD <letter> · VIDEO` |

## Game shape

Phases in `src/main.js`: `title → loadout → playing → results`.
The bay (`loadout`) is a 3D scene: operator idles on the original intro camera (5.6 m orbit, turning),
rain falls, trees sway via `updateEnvironment(dt)` called in **both** phases.

| System | File | State |
|---|---|---|
| Weapons + per-style VFX | `src/weapons.js` (`STYLE_VFX`, `GRENADE_STYLES`) | working, 12 styles |
| Enemies | `src/enemies.js` | working; altitude `AIR_ALT` gunship 6.4 / drone 4.6 |
| Boss | `src/main.js` + `models.js buildBossMesh()` | animated BrainStem rig, HP ≈ 7,700, telegraph+salvo every 6 s |
| Autopilot | `src/autopilot.js` | zone objectives (4 zones, 3 s hold) + boss hunting + telegraph dodge |
| Talent tree | `src/talents.js` + `talentui.js` | constellation disc, **969 nodes / 1,262 edges**, 8 keystones, 96 masteries |
| Cards | `src/cardsui.js` | DOM tray, 3 cards, photo art by effect category |
| Run summary | `src/summaryui.js` | RUN REPORT on results |
| Barks | `src/barks.js` + `assets/voice/*.wav` | 12 lines, UK male (Piper), bubble above head |
| Save | `src/save.js` v2 | level/xp/talents/talentPoints/attrPoints/attrs/name/legacy/equipped |
| Manager UI | `src/manager.js` | portraits, naming, loadout, control mode, attributes, talents button |

## Economy (deliberate, do not loosen)

| Event | Reward |
|---|---|
| Die before 60 s | **0** talent points |
| Die after 60 s | **1** |
| Clear the arena | **5** |
| Kill the arena boss | **+1** (once per run) |
| Attribute point | +1 per level |

Banking lives in `bankRun()` in `main.js`. Trials were removed on purpose — there is no click-to-earn
screen and there must not be one.

## Verified numbers at snapshot

- Boss spawns at `runTime > 75 || kills >= 18`, HP `base*2 + 2600` (measured 7,700–7,860).
- Autopilot closes on boss from 26.8 m → 20.3 m in 3 s; `mode: "boss"`; dodge on telegraph.
- Gunship altitude 6.64 m; autonomous fire took it 2600 → 2492 HP in 4 s.
- Colliders: ~24 fitted OBBs (ruins, containers, barriers) in perimeter.
- Start backdrop: `assets/start-bg.gif` 8.46 MB (video path abandoned: autoplay/codec unreliable).

## Hooks available for tests (`window.__forgeSmokeTest`)

`getState()`, `getColliders()`, `getEnemies()`, `getWeapons()`, `getCards()`, `getManager()`,
`getGrenades()`, `getTracerColors()`, `getRainY()`, `getTreeSway()`, `spawnAir(type)`, `airState()`,
`getSoldierTint()`, `testPush()`.

## Known broken / unfinished (do not assume these work)

1. `assets/imported/Fox.glb` (CC0) and `spark1.png` are downloaded and licensed but **not wired** to
   anything. `BrainStem.glb` is wired as the boss rig.
2. **Audio is thin.** No ambience, no footsteps, one reload sample, weapon reports are the same file
   pitched. The 48–64 Hz drone was removed because it hummed.
3. **Gunship fight is slow** (108 dmg / 4 s vs 2,600 HP) and its attack range was never retuned for
   altitude — check whether it actually fires from `y=6.4`.
4. **Map expansion was pulled.** Containers placed at radius 8–13 buried the camera and wedged the AI.
   Any new cover must be placed with `fitCollider` at radius ≥ 18.
5. **Zone objectives are cosmetic** — holding a zone grants nothing and shows no ground marker.
6. **Enemies have no objective AI** — they walk at the player. Bosses too.
7. AdSense **Vignette** can cover the game on mobile; that is console-side, not code.
8. `docs/MANAGER.md` and `TASKS.json` predate several systems; treat `STATE.md` as canonical.
