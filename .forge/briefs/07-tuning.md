# BRIEF: Tuning the whole thing

**Goal:** a difficulty and reward curve that holds for 20 runs, measured — not vibes.

## Levers (all in `src/tuning.js`, plus `main.js` boss block and `bankRun`)

- spawn interval, max concurrent, type weights over time
- enemy HP/speed scaling (`enemyHpAt`, `enemySpeedAt`)
- boss threshold (`runTime > 75 || kills >= 18`) and HP formula
- card level XP (`levelBaseXp: 300`) and choices (`cardChoices: 3`)
- economy: 1 point/60 s death, 5 clear, +1 boss — **locked**, do not change
- weapon/skill card weights

## Method

Write a headless harness (`tools/sim.mjs`) that runs the real modules with a seeded RNG and no renderer if
possible; otherwise drive the preview page with Playwright and read `__forgeSmokeTest` over a fixed 180 s
per run for 20 seeded runs. Report a table:

| run | seed | kills | time | level | boss? | cleared? | deaths |
|---|---|---|---|---|---|---|---|

Then tune to these targets:

| Metric | Target |
|---|---|
| Median survival, no upgrades | 45–75 s |
| Median survival, 6 cards | 110–170 s |
| Boss reached | ~50 % of runs |
| Boss killed, given reached | 35–55 % |
| Arena cleared | 20–35 % of runs |
| Cards offered per run | 3–5 |

## Rules

- One lever at a time, one table per change, keep the previous table in the report.
- Never fix "too hard" by handing out talent points. The economy is deliberate.
- Never fix "too easy" by nerfing the player's damage below the TTK table in `03-engine-math.md`.

## Acceptance

1. The 20-run table, before and after.
2. Boot test passes.
3. A one-page summary: which lever moved which metric, and the three you would try next.
