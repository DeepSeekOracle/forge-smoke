# TTX — card pacing, measured (MATH-04)

Build: tactical pilot + `hpMult 3.0`, flat kill XP 30, triangular thresholds, deduped trays.
Method: `tools/tune.mjs` — the real game loop stepped at fixed 1/60 s steps, cards auto-picked,
seeded runs.

Three consecutive seeds (`node tools/tune.mjs 10 180`, rows 1-3):

| run | seed | map | kills | run time | level | cards offered |
|---|---|---|---|---|---|---|
| 1 | 1 | yard | 76 | 86.7 s | 4 | 3 |
| 2 | 2 | foundry | 118 | 121.3 s | 5 | 4 |
| 3 | 3 | depot | 95 | 101.2 s | 5 | 4 |

**Result: 3, 4, 4 cards offered per run — inside the 3-5 target.** Across the full 10-run sample the
median is **4 cards**.

Thresholds come from one block in `src/tuning.js` (`progression.cardPacing`) through
`balance.xpThreshold(L) = 300 * L * (L+1) / 2`:

| level | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| XP to advance | 300 | 900 | 1800 | 3000 | 4500 | 6300 |

Two earlier measurements are kept for context: linear thresholds with time-scaled enemy XP produced
**13 cards** in a 180 s run (`docs/TUNE-before.md`); flat 10 XP on the easy build produced 3-4 but
the runs never ended. Kill XP is the flat `xpPerKill` (30), damage pays `xpPerDamage`, survival pays
`xpPerSecond`.

Economy untouched: `bankRun` still pays 0 before 60 s, 1 after, 5 for a clear, +1 for a boss
(`MIN_PAY_SECONDS = 60` in `src/main.js`).
