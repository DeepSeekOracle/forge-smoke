# BRIEF: Better maps

**Goal:** three distinct arena layouts with real cover, readable silhouettes, and no camera burial.

Read `.forge/STATE.md` §Known-broken 4 first: an earlier expansion placed containers at radius 8–13
and it broke both the camera and the AI. That mistake is the whole lesson of this brief.

## Deliverable

`src/maps.js` exporting `MAPS = [{ id, name, fog, rain, props[], spawnRing, light }]`, and `main.js`
picking one per run (rotating, or by `TUNING.mapSelection`). Each map:

### 1. DEPOT (existing look, densified)
- Cover at radius **18–30** only. Nothing inside 16 m of origin.
- 6 containers, 4 barriers, 3 ruin clusters, all via `spawnGlbProp(..., { fitCollider: true })`.
- Two "lanes" 6 m wide between cover so the fighter can cross without scraping.

### 2. YARD (open, long sightlines)
- Fewer props (5), but at radius 22–34, plus 2 watchtowers (`container` stacked via scale/rot).
- Stronger key light, higher fog. Good for aerial enemies.

### 3. FOUNDRY (tight, industrial)
- 10 props in a ring at radius 17–26, with a clear 10 m centre pad.
- Emissive hazard strips (use `hazardMat`), heavier rain.

## Placement rules (non-negotiable)

1. `resolveObstacleCollision(probe, 1.6, arenaColliders)` on the **camera** each frame must never move
   the camera more than 1 m in normal play — verify by sampling camera displacement.
2. Props must never overlap the spawn ring (±2 m of radius 18) or the zone centres (`objZones`, radius
   22 at 4 cardinal-ish angles).
3. Every prop gets a collider; no invisible walls wider than the prop.
4. A 60 s autonomous run on each map must end with `errorCount: 0` and **the player having travelled
   > 40 m** (frozen-AI detector, see `VERIFY.md`).

## Acceptance

- Boot test on all three maps (force `TUNING.mapSelection` or a query param).
- Screenshot each map from the bay and from a run.
- Report: collider count per map, player distance travelled in 60 s, camera max displacement.
