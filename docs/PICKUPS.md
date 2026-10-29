# PICKUPS — ground items, spacing math, AI priority

Three items spawn on the arena floor, auto-apply on touch, and stack. They respawn 60 s after being
taken, for the whole match.

| item | effect | duration |
|---|---|---|
| health | +50 % max integrity, delivered as a regen tick | 10 s |
| speed | +25 % move speed per stack (cap +90 %) | 12 s |
| power | +25 % weapon damage per stack (cap +100 %) | 12 s |

Everything stacks: two health pickups heal 100 % over their overlapping windows, two speed pickups
are +50 % for the overlap, and the HUD lists each active effect with its remaining time.

## Spacing math (why health needs a speed buff to chain)

- Base move speed is **6.4 m/s**, so a 10 s regen window covers **64 m**.
- The two health sites sit at opposite ends of a **34 m radius** ring: **68 m apart**.
  - at base speed: 68 / 6.4 = **10.6 s** → cannot reach the second one inside the 10 s window
  - with one speed buff (+25 %): 68 / 8.0 = **8.5 s** → reachable
- `validateSites()` rejects any layout whose health gap is below 64 m ("reachable in 10 s") or above
  80 m ("unreachable even boosted"). Both bounds are asserted in `tools/unit.mjs`, and the generated
  layout in `tools/pickups.mjs` measured **67.5 m**.
- Power and speed sites are scattered at radius 18–40 with an 18 m minimum spacing (relaxed to 12
  then 6 only if a slot cannot be found), so a single route cannot vacuum all three.

## AI priority

`choosePickup(sites, healthRatio)` orders goals exactly as requested:

1. **health** when integrity is below **75 %** (nearest health site)
2. otherwise **power** (nearest)
3. otherwise **speed** (nearest)

The pilot exposes the result as `state.pickupGoal` and trades it for a `fetch-health` /
`fetch-power` / `fetch-speed` movement mode. A bolt on a collision course still outranks pickups
(`dodge-shot`), and a boss telegraph outranks everything (`dodge`).

## Shooter ramp

Separate but related: only **12 %** of bodies can fire at t = 0, climbing to **85 %** by ~110 s. The
rest still advance and melee, so the opening is about movement and the late round is about cover,
dodging and buff timing. Gated per enemy in `enemies.js` (`enemy.canShoot`), measured in
`tools/shooterramp.mjs`: **5 % → 39 % → 77 %** across the first, middle and late thirds.

## Measured balance (10 seeded runs, `tools/tune.mjs 10 180`)

median **169.7 s**, **5 cards**, boss reached 100 %, **cleared 17 %**, 0 errors.

Note: `docs/evidence/pickups.png` shows a health pickup (icosahedron + ground ring) beside the
operator; the radar carries matching pips (green health, cyan speed, amber power).
