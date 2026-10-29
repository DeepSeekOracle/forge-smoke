# BRIEF: Engine math

**Goal:** replace the ad-hoc combat numbers with explicit, tunable, testable math. This is the brief
that changes how the game *feels*, so every claim needs a measured before/after.

## Current model (in `src/enemies.js` / `src/battles.js` history)

- Armour: `damageAfterArmour(dmg, armour)` → fraction soak `1 - armour/(armour+260)`.
- Shields: `takeDamage(amount, isFlank, armour, pierce)` → 0 if shielded and not flanked, else
  `amount * pierce` through the wall.
- XP: `bankRun` computes `2 + cleared*6 + level` historically, now replaced by 1/5/0 economy.

## Deliverable — `src/math.js` (pure, no THREE dependencies, unit-testable)

```js
export function armourSoak(damage, armour, k = 260)     // fraction model, returns damage dealt
export function shieldGate(damage, { shielded, flanked, pierce })  // single source of truth
export function spread(angle, accuracy, rng)            // radians, gaussian-ish
export function falloff(distance, base, minFactor = 0.35, range = 30)
export function xpForRun({ seconds, kills, cleared })   // one formula, documented
export function bossHp(base, runTime, level)            // explicit scaling, not 2x+2600
export function timeToKill(dps, hp, armour)             // for balance tables
```

Rules:
- Every constant in one `MATH` object at the top with a one-line comment justifying it.
- `shieldGate` must be the **only** place shield logic lives; `enemies.js` calls it.
- No behaviour change without a table showing before/after TTK at levels 1, 5, 10.

## Balance targets (tune toward these, report deltas)

| Situation | Target |
|---|---|
| Rifleman at level 1 | dies in 3–5 shots |
| Shieldbearer, no explosives | **unkillable from the front** (by design) |
| Shieldbearer, explosive rounds | dies in ~2× rifleman shots |
| Boss, level 1, starter weapon | 60–90 s to kill or you lose |
| Gunship | 8–15 s of sustained fire |

## Acceptance

1. `node -e` or a Playwright `import()` unit pass that prints a TTK table for the five cases above.
2. Boot test passes.
3. Report the table **before and after** in the task report. If you cannot measure before, say so.
