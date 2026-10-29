# Engine math (brief 03) — `src/math.js`

One pure, THREE-free surface for the combat and curve formulas. The live implementations still live in
`balance.js` (already pure and tested); `math.js` is the documented entry point plus the three helpers
that were ad hoc before.

| symbol | formula | notes |
|---|---|---|
| `armourSoak(d, a, k=260)` | `d * (1 - min(0.95, a/(a+k)))` | 20 armour ≈ 7 % soak |
| `shieldGate(d, {shielded, flanked, pierce})` | 0 from the front, `d*pierce` through | single source of truth (`balance.js`) |
| `spread(halfAngle, accuracy, rng)` | gaussian, clamped to ±1.5 half-angle | accuracy scales sigma |
| `falloff(dist, base, min=0.35, range=30)` | linear 1 → 0.35 across `range` | monotonic |
| `xpForRun({seconds, kills, cleared, level})` | `seconds*2.5 + kills*10 + clear*(120+20*level)` | reference for the tables |
| `bossHp(base, level)` | `base*(2+0.15*(level-1)) + 2600` | MATH-03 parity preserved |
| `xpThreshold(level)` | `300*L*(L+1)/2` | triangular card curve (MATH-04) |
| `timeToKill(weapon, hp, armour)` | shots × cycle | roster table (`docs/ROSTER-TTK.md`) |

`MATH` freezes the constants so nothing mutates them at runtime. `tools/unit.mjs` asserts the armour
fraction, falloff endpoints and monotonicity, the XP formula, and that 200 sampled spreads stay inside
the clamp.

Not done from the brief: there is no grand "before/after TTK at levels 1/5/10" table — the roster table
is the first per-style numbers this build has had (nine styles previously shared spray stats), so
"before" would just be the spray row repeated.
