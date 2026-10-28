# FORGE SMOKE — CYBORG MANAGER (v2 direction)

**Status: v2.0 milestone 1 built and verified in the preview, not yet pushed live.**

## The concept

The player is no longer the fighter. They are the **manager and support specialist** for an
autonomous cyborg:

1. **Manager terminal (between runs).** Attributes (D&D style), primary weapon, light mods, perks,
   arena, and LAUNCH. The 3D operator turntable is the character preview.
2. **Launch.** The cyborg drops into one arena and fights **on its own** (`src/autopilot.js`): holds an
   engagement range, strafes to keep angles changing, disengages at low integrity.
3. **During the match the player plays power-up cards** — the only live input that matters.
4. **Survival drives progression.** Kills and time bank XP; levels raise the attribute block, which maps
   to real gameplay (integrity, speed, reload, damage, crit).
5. **Death returns to the manager** with everything banked. Surviving past the final beat (the overtime
   line) banks an **arena clear** and rolls a **legendary** — a light mod or perk the profile did not own.
6. **Dual enemy ramp:** enemy HP scales with the profile's base level (`1 + 0.07/level`) *and* climbs
   inside the arena (`1 + runTime/240`, capped at 2.2×). The player's build must outpace both.

## What is implemented

| Piece | File | Verified |
|---|---|---|
| Manager terminal (DOM overlay, D&D sheet, loadout, arenas, launch) | `src/manager.js` | renders at 1400×900, 0 console errors; stats reflect level |
| Manager ↔ phase wiring, legacy canvas HUD cleared under it | `src/main.js` | `hudItems: 0` while open |
| Autonomous pilot | `src/autopilot.js` | run reached 8 kills / 120 XP unattended; modes `hold`/`open`/`close`/`disengage` |
| Stat block → gameplay multipliers | `src/manager.js` (`applyStatsToRun`) | level 1 → maxHealth 102; level 2 → 14/13/12… |
| Persistent profile (v2 save, migrates v1) | `src/save.js` | levelled 1→2 on death, `25 / 141 XP`, `1 runs` after reload |
| Run banking + legendary roll | `src/main.js` (`bankRun`, `rollLegendary`) | `lastBank: {gained: 135, levelled: 1, cleared: false}` |
| Enemy dual scaling | `src/main.js` (`spawnEnemy`) | `enemy.hp` multiplied by base × ramp |
| Player card play tracked | `src/main.js` (`pickCard`) | `cardsPlayed` counter |

## Next (in priority order)

1. **Manager depth**: attribute point spend per level, weapon stats visible per weapon, compare tooltips.
2. **Loadout that matters**: equipped light mods currently pre-apply via `weaponManager.applyPart`; the
   secondary slot and perks need real effects.
3. **Enemy archetypes that force loadout choices**: ranged squads that keep distance, shield walls that
   punish frontal DPS, artillery that denies ground — plus the AI's response (flank, break line of sight).
4. **Legendary depth**: jetpack, vehicle, drone swarm — each changes movement or defence, not just numbers.
5. **Between-run screen** (results → manager) showing XP gained, level-ups, and the legendary rolled.
6. **Ship v2.0**: push to `excavationpro.ca/games/forgesmoke/` with the catalog bumped, after Justin plays it.

## Non-negotiables

- The cyborg fights itself; the player never moves it. That is the design.
- One arena per run. Death is the loop, not a failure state.
- Lights stay card-gated (verified both ways in v1.1.0).
- Every change is verified in the preview (0 console errors + a screenshot) before it is committed.
