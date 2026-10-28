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

## v2.1.0 — the fixes that came out of playing it

- **Bay is a stance, not a demo.** The attract-mode firefight behind the manager panels is gone: the
  cyborg stands still facing the bay, breathing, holding the weapon two-handed. Enemies are cleared on
  entry. A fight behind panels read as glitchy, and shield units that could not die read as broken.
- **Explosives answer shields.** `shieldbearer` takes **0** damage from the front while shielded. Two
  cards now exist to beat that: **Frag Rounds** (rare) and **Breach Grenade Rig** (epic). Both set
  `hasExplosiveMod`, which (a) adds +15 % damage and (b) passes damage as *flank*, which the shield
  check exempts. Measured: 60 hp shieldbearer took 0 frontal, 50 from an explosive hit.
- **Character switching changes the character.** Picking a suit in the bay rebuilds the rig immediately
  (`onSkinChange` → `buildOperatorRig`) instead of waiting for the next launch.
- **Large props are solid.** `fitCollider` measures each spawned asset's own geometry and registers a
  collider per visible piece, skipping flat ground pieces and anything over 26 units. Colliders reset
  when an arena is rebuilt, so they stop stacking. Measured: the ruins wall pushes a probe from
  (0, −32) to x 10.67, while open ground at (0, 0) is untouched.
- **Public leaderboard.** Cyborg designation (18 chars) + highest level posted to the arcade ledger
  Space; the bay shows the top 8, and `/games/` gained a Forge Smoke hall card.

## v2.2.0 — Special Operations tree + Trials

Researched the PoE 2 passive tree (poe2ref.com, fextralife) and rebuilt the *structure*, not the lore:

- **81 nodes across 8 spokes** (Spec Ops, Assault, Demolition, Armour, Recon, Drone Ops, Logistics,
  Command), following the eight conduits etched into the command board render. 16 notables,
  8 keystones (each with a real tradeoff), a central COMMAND CORE.
- **Cheapest-chain allocation**: clicking a distant node buys the path to it (Dijkstra over the graph),
  exactly like the reference. Right-click refunds a node and anything only reachable through it.
- **Generous points**: 6 to start, then 2 per run, +6 per arena clear, +level/2, plus tree bonuses.
- **Modifiers are wired**, not decorative: damage, fire rate, integrity, speed, plus tree-only effects
  (crit, blast, shield pierce, drones, XP, bonus points).
- **Trials** (`src/battles.js`): deterministic auto-battler, three bosses with different answers —
  FOUNDRY WARDEN (armour → crit/pierce), SCRAP COLOSSUS (frontal shield → explosives),
  DRONE HIVE (adds → sustained DPS). Measured at level 1 with 4 points: WARDEN cleared in 18 rounds,
  COLOSSUS and HIVE lost, which is the intended gate.

## v2.3.0 — the tree at scale, plus the arena boss

Read the Maxroll beginner guide as well; the piece I had missed was the **cluster model**:

- A cluster is a ring of small passives capped by **one notable**, with a **mastery** at its centre
  that only opens once that cluster's notable is taken (Maxroll: "allocating any Notable also allows
  you to take the corresponding mastery").
- No jewel sockets (by request).

Rebuilt on that model: **8 regions × 16 clusters × (8 small + 1 notable + 1 mastery) + 8 keystones +
hub = 1,289 nodes, 1,560 edges.** 1,024 smalls, 128 notables, 128 masteries, 8 keystones.
Mastery gating verified: clicking a mastery before its notable allocates nothing (0 nodes), after the
chain + notable it allocates (3 → 4). Search box filters 1,289 nodes live; layout compacted so clusters
read at the default zoom.

**Arena boss** (the loose end): after 75 seconds or 18 kills a named boss enters — FOUNDRY WARDEN or
GUNSHIP OVERSEER at roughly 7× normal HP plus 900. HUD callout, launch sound, and killing it pays
**+4 talent points** exactly once. Measured: spawned at 2,738 HP, kill moved points 6 → 10.
