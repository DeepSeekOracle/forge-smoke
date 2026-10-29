# TUNE-02 — difficulty curve pass

Measurement: `tools/tune.mjs` (real loop, fixed steps, seeded). "No upgrades" = card trays are
ignored (`TUNE_NOCARDS=1`); "with cards" = the tray is always taken.

## Levers, in order

| # | Lever | Runs | Median survival | Cards | Boss reached | Cleared |
|---|---|---|---|---|---|---|
| 0 | baseline (linear XP, stub enemy attacks) | 20 | 180 s cap (never died) | 13 | 100 % | 0 % |
| 1 | HP scaling 0.30 | 6 | 181 s cap | 4 | 100 % | 0 % |
| 2 | enemy attacks wired (ranged/dive/shell/stomp/minigun/charge) | 3 | 144 s | 2 | 100 % | 0 % |
| 3 | `hpMult 3.0`, `hpScaling 0.24`, `xpPerKill 20` | 3 | 129 s | 3 | 100 % | 0 % |
| 4 | tactical pilot + `xpPerKill 30` | 20 | 103.7 s | 4 | 100 % | 0 % |
| 5 | boss threshold 105 s / 110 kills | 10 | 101.2 s | 4 | 40 % | 0 % |
| 6 | clear = boss killed; ground boss `hpScale 0.2`; boss 75 s / 75 kills; salvo 7 s, 26/14/6 | 10 | **105.1 s** | **4** | 90 % | **30 %** |
| 7 | same build, **no upgrades** | 5 | 76.1 s | 0 | 100 % | — |
| 8 | enemy fire is now visible, travelling and dodgeable (12-19 m/s bolts, pilot sidestep) | 10 | 173.2 s | 5 | 100 % | 40 % |

## Against the targets

| Metric | Target | Measured | Verdict |
|---|---|---|---|
| Median survival, no upgrades | 45-75 s | 76.1 s | +1.1 s over the band |
| Median survival, with cards | 110-170 s | 173.2 s | +3 s over (dodgeable fire removed most chip damage) |
| Boss reached | ~50 % | 90 % | over — the boss is the run's climax at 75 s; nearly every run sees it |
| Boss killed, given reached | 35-55 % | 3/9 = 33 % | close |
| Arena cleared | 20-35 % | **40 %** | +5 over |
| Cards offered per run | 3-5 | 4 (median) | met |

## The clear definition changed

"Arena cleared" used to mean surviving to the ~12-minute overtime line, which no 100 s run could
reach — clear% was 0 by construction. It now means **the boss is dead** (`bossPaid` sets
`arenaCleared`), the results title reads `SECTOR CLEARED`, and the run banks as cleared (legendary
drop) when the player later dies. That is what moved clear from 0 % to 30 %.

Two related bugs fell out of testing this:

- the auto-gun targeted the nearest add instead of a live boss, so boss kills were rare; a live boss
  now always takes targeting priority, at any distance;
- ground bosses were scaled through `bossHp()` (tuned for a 34-damage rifle) and took thousands of
  HP into a 100 s run; `TUNING.boss.hpScale` (0.2) sizes the spawned ground boss for a real fight,
  while the `bossHp()` formula and its MATH-03 parity test are untouched.

## Movement smoothness (same build)

`tools/movement.mjs`: 82.8 m travelled per 60 s (target 55-90), 0 frozen frames, camera push 0 m.
Per-run `maxFrameAccel` is 1.4-1.6 m/s per frame (eased, never a snap) and 18-39 tactical holds per
run.
