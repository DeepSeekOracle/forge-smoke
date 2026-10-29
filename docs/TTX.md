# TTX — card pacing, measured (MATH-04)

Build: `main.js?v=20261030zm` (triangular XP curve, flat kill XP, deduped card trays).
Method: `tools/tune.mjs 3 180` — the real game loop stepped at fixed 1/60 s steps (no wall-clock
waiting), cards auto-picked whenever the tray opened, seeded runs 1-3.

| run | seed | map | kills | run time | level | card XP / next | cards offered |
|---|---|---|---|---|---|---|---|
| 1 | 1 | yard | 337 | 180.9 s | 5 | 4034 / 4500 | 4 |
| 2 | 2 | foundry | 314 | 180.9 s | 5 | 3773 / 4500 | 4 |
| 3 | 3 | depot | 281 | 181.3 s | 4 | 3441 / 3000 | 3 |

**Result: 3, 4, 4 cards offered per run — inside the 3-5 target.**

Thresholds now come from one block in `src/tuning.js` (`progression.cardPacing`) through
`balance.xpThreshold(L) = 300 * L * (L+1) / 2`:

| level | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| XP to advance | 300 | 900 | 1800 | 3000 | 4500 | 6300 |

Before this change the curve was linear (300/600/900…) and the same harness measured **13 cards**
in a 180 s run (`docs/TUNE-before.md`). The kill XP is now the flat `xpPerKill` (10) rather than
`enemy.getXpValue()`, which scales with run time and was the reason late runs flooded with cards.

Economy is untouched: `bankRun` still pays 0 before 60 s, 1 after, 5 for a clear, +1 for a boss —
`MIN_PAY_SECONDS = 60` in `src/main.js`.

Not yet verified: median survival. All three runs reach the 180 s cap alive (100 % boss reached, no
clears), so TUNE-02's survival targets still need a difficulty pass.
