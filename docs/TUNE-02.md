# TUNE-02 — difficulty curve pass

Measurement: `tools/tune.mjs` (real loop, fixed steps, seeded). "No upgrades" = card trays are
ignored (`TUNE_NOCARDS=1`); "with cards" = the tray is always taken.

## Levers, one at a time

| # | Lever | Runs | Median survival | Cards | Boss reached |
|---|---|---|---|---|---|
| 0 | baseline (linear XP, stub enemy attacks) | 20 | 180 s cap (never died) | 13 | 100 % |
| 1 | HP scaling 0.30 | 6 | 181 s cap | 4 | 100 % |
| 2 | enemy attacks wired (ranged/dive/shell/stomp/minigun/charge) | 3 | 144 s | 2 | 100 % |
| 3 | `hpMult 3.0`, `hpScaling 0.24`, `xpPerKill 20` | 3 | 129 s | 3 | 100 % |
| 4 | tactical pilot + `xpPerKill 30` | 20 | **103.7 s** | **4** | 100 % |
| 5 | boss threshold 105 s / 110 kills | 10 | 101.2 s | 4 | **40 %** |
| 6 | same build, **no upgrades** | 5 | **76.1 s** | 0 | 100 % |

## Against the targets

| Metric | Target | Measured | Verdict |
|---|---|---|---|
| Median survival, no upgrades | 45-75 s | 76.1 s | +1.1 s over — within noise of the band |
| Median survival, 6 cards | 110-170 s | 101-104 s (runs bank 4 cards, not 6) | just under; the sample only reaches 4 cards |
| Boss reached | ~50 % | 40 % | close |
| Boss killed, given reached | 35-55 % | not measured separately | open |
| Arena cleared | 20-35 % | 0 % | **conflict** — see below |
| Cards offered per run | 3-5 | 4 (median) | met |

## The clear-rate conflict (needs a design decision)

"Arena cleared" is defined in `main.js` as surviving the final beat **plus 60 s of overtime** —
roughly the 12-minute mark. A run that meets the 45-75 s / 110-170 s survival targets can never
reach it, so 0 % is the definition, not a balance failure. Options:

1. redefine "clear" as **boss killed** (the run already pays `bossPaid`), which makes the metric
   meaningful at 100 s runs;
2. keep the overtime rule and drop the 20-35 % target for M4.

Recommend (1); it needs Justin's call because it changes what "cleared" means on the board and the
results screen.

## Movement smoothness (same build)

`tools/movement.mjs`: 82.8 m travelled per 60 s (target 55-90), 0 frozen frames, camera push 0 m.
Per-run `maxFrameAccel` is 1.4-1.6 m/s per frame (eased, never a snap) and 18-39 tactical holds per
run — the pilot plants and fires between dashes instead of strafing non-stop.
