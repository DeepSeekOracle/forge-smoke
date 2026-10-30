# Forge Smoke — verified state (2026-10-30)

Snapshot of what actually exists, measured, not remembered. If you change something here, you own
updating this file.

## Build identity

| Field | Value |
|---|---|
| Project repo | `C:\Users\justi\AI Games\forge-smoke` |
| Deployed copy | `D:\excavationpro-ca\games\forgesmoke` |
| Live URL | `https://excavationpro.ca/games/forgesmoke/` |
| Module version at snapshot | `?v=202610328b` (all modules bumped together by `tools/bump.py`) |
| Build stamp | `console.info("[forge] BUILD …")`, `window.__forgeBuild`, red error strip reads it |
| Verify one command | `python tools/gate.py` → SYNTAX + ASSETS + UNIT + REGRESS |

## Game shape

Phases: `title → loadout → playing → results` (`src/main.js`). The bay is a 3D turntable with the
operator rig, rain and swaying trees.

| System | File | State |
|---|---|---|
| Weapons + per-style VFX | `src/weapons.js` | **15 styles**, own damage/cycle/crit/pellets, own VFX row and sample |
| Enemies | `src/enemies.js` | rifleman, sapper, shieldbearer, spotter, mortar, drone, mech, gunship; altitude gunship 6.4 / drone 4.6 |
| Maps | `src/maps.js` + level kit in `src/models.js` | three themed arenas built from CC0 Kenney city kits; arena1/2/3 -> DEPOT/TOWN/FOUNDRY |
| Pathing | `src/models.js` | 2.5 m flow-field nav grid, rebuilt per map; walkers route around cover, escape blocked cells |
| Enemy fire | `src/main.js` | **travelling bolts** (12 m/s rifle, 19 m/s minigun) with muzzle flash + recoil; cover blocks; pilot dodges |
| Shooter ramp | `enemies.js spawn()` | rifle-carriers only: 35 % at t=0 → 85 % by ~90 s; mortar/mech/gunship/sapper always armed; unarmed carriers charge and melee |
| Boss | `main.js` + `models.js` | spawns at `runTime > 65 || kills >= 60`; gunship 900 HP (real helicopter model), mech 624 HP (own mech model); salvo every 7 s |
| Autopilot | `src/autopilot.js` | tactical beats (HOLD/REPOSITION/bounding ADVANCE), boss dodge, `dodge-shot`, pickup fetch |
| Pickups | `src/pickups.js` | health 50 % over 10 s, speed +25 %/stack, power +25 %/stack; auto-apply, stack, 60 s respawn |
| Talent tree | `src/talents.js` | constellation disc, 969 nodes / 1,262 edges, 8 keystones, 96 masteries |
| Cards | `src/cardsui.js` | 3-card tray, effect-family art (6 procedural plates + 5 photos), weapon cards 16 % and never back-to-back |
| Run summary | `src/summaryui.js` | RUN REPORT, boss/arena state, earned lines |
| Barks / audio | `src/barks.js`, `src/audio.js` | 12 voice lines; per-style shot samples; impacts; **no ambience bed yet** |
| Save | `src/save.js` v2 | level/xp/talents/talentPoints/attrPoints/attrs/name/legacy/equipped |
| Math surface | `src/math.js` | MATH constants, armourSoak, spread, falloff, xpForRun, shieldGate, bossHp |

## Economy (deliberate, do not loosen)

| Event | Reward |
|---|---|
| Die before 60 s | **0** talent points |
| Die after 60 s | **1** |
| **Kill the arena boss** = arena cleared | **5** |
| Kill the arena boss | **+1** (once per run) |
| Attribute point | +1 per level |

Banking lives in `bankRun()`. No click-to-earn screen exists and there must not be one.

## Maps (2026-10-30)

Rebuilt from **CC0 1.0 Kenney City Kits** (Industrial, Commercial, Roads), vendored with their
licences at `assets/ki`, `assets/kc`, `assets/kr` and recorded in `docs/ASSETS-SOURCES.md`.

| Map | Theme | Content |
|---|---|---|
| DEPOT (`depot`) | container terminal | two 5-container walls framing an avenue, flank stacks, kerbside trucks, gate barriers, watchtowers, warehouse, water tower, 20 m chimney; asphalt + pad + lane paint |
| TOWN (`yard`) | town square | ten shopfronts round a paved plaza, crossing street with crosswalks, eight lamps, parked truck, street clutter, ten-block skyline |
| FOUNDRY (`foundry`) | heavy plant | four sheds, two silos, water tower, 22 m chimney, machinery blocks, turrets, hazard pad on concrete |

- Pick in the manager = `arena1/2/3` -> `MAPS[0..2]` (`TUNING.mapSelection = "select"`); all three
  unlocked. `?map=depot|yard|foundry` still forces one for tests.
- One brand board per map at `map.sign`; buildings scaled from `KENNEY_SIZE` footprints with lit
  window bands; colliders + nav built from the same numbers before the GLB resolves.
- `tools/mapselection.mjs` drives the real manager: **3/3 distinct** (depot 30 / yard 21 / foundry 23 colliders).

## Verified numbers at this snapshot

- 10 seeded runs (`node tools/tune.mjs 10 180`): median **169.7 s**, **5 cards**, boss reached **100 %**,
  **cleared 17 %**, 0 errors — pickups + dodgeable fire + shooter ramp included.
- Enemy fire (`tools/enemyshots.mjs`): 3 riflemen at 10 m → 6 bolts, **0 hits**, 1.25 s dodging.
- Shooter ramp (`tools/shooterramp.mjs`): **5 % → 39 % → 77 %** incremental share.
- Pickups (`tools/pickups.mjs`): 8 sites, health gap **67.5 m** (10.6 s base / 8.5 s boosted), regen
  52 → 102, power stacks to 1.75×, speed 1.25×, respawn confirmed.
- Movement (`tools/movement.mjs`): ~82 m per 60 s, 0 frozen frames, 0 m camera push.
- Boss TTK with spray: mech ~20 s while focused; gunship flak TTK 11 s (TUNE-04).
- Assets (`tools/asset_check.py`): 28 plates at stated sizes (5 photos 768×512, 2 stills 1536×864,
  OG 1200×630, 5 enemy portraits 256×256, 15 weapon silhouettes 512×256).
- Unit gate: **348 checks**.
- Pathing (`node tools/pathing.mjs`): **3/3 maps**, 7-8 of 8 bodies arrive, **0 % backpedal** (live too).
- Combat (`node tools/combat.mjs`): **26/26** including unarmed bodies close to melee (0.5 m) and melee draws blood.
- Map selection (`node tools/mapselection.mjs`): **3/3 distinct** maps.
- Results screen: combat numbers and barks render only while playing; verified clean on a live FOUNDRY run (`results-clean.png`).
- Ranged combat: planted 0.5 s aim with a red laser sight + muzzle charge, then fire/reposition; spotters 0.75 s; melee 0.3 s wind-up. `getTelegraphs()` measures t 0.4-1.0, speed 0.00.
- Boss phase 2 at 50 % hp: glowing core (+35 % damage taken), salvo 6 -> 4.2 s, telegraphed area attack per type; asserted in `combat.mjs` (29/29).
- Ambience bed: procedural rain/wind (pink noise, lowpass + wind LFO) at 0.10, fades with phase; `getAudio()` reports it.
- Level art: Kenney atlases regraded + grime skirt/parapet caps per building.

## Hooks available for tests (`window.__forgeSmokeTest`)

`getState()`, `getPilot()`, `getCombat()`, `getPickups()`, `getRamp()`, `getEnemies()`, `getBoss()`,
`getWeapons()`, `getCards()`, `getManager()`, `getGrenades()`, `getTracerColors()`, `getRainY()`,
`getTreeSway()`, `spawnAir(type)`, `spawnAt(type,x,z)`, `airState()`, `setWeapon(style)`,
`forceBoss()`, `forceBossKind(kind)`, `clearEnemies()`, `setSpawns(bool)`, `setPlayerPos(x,z)`,
`grantClear()`, `getSoldierTint()`, `benchFx()`.

## Known broken / unfinished (do not assume these work)

1. **No ambience bed.** Brief 09 A1 is still open: rain/wind loop at 0.10 through a lowpass, fading on
   run start/unload. Everything else in the audio brief (reports, impacts, mix) is wired.
2. **Enemy portraits / weapon silhouettes are procedural** (Pillow plates), not painted art. Qwen-Image
   fails to allocate on this 8 GB card; see `docs/ASSETS-SOURCES.md`.
3. **Gunship fire from altitude** was fixed (its minigun now spawns bolts from `y≈6.4`), but a dedicated
   altitude regression is not in the gate; `tools/gunship.mjs` covers TTK only.
4. **Zone objectives were removed** (author: Justin). Any doc still mentioning zones is stale.
5. **`docs/MANAGER.md`** predates the pickup/boss-clear changes; its top note points here.
6. **AdSense Vignette** can cover the game on mobile; console-side, not code.
7. `assets/imported/Fox.glb` / `spark1.png` are licensed but unwired — documented in
   `docs/UNUSED-ASSETS.md`, not deleted.
