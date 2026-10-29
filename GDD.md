<!-- BUILD CONTRACT FIRST ------------------------------------------------------------
     This project is built, not documented. `BUILD.md` defines what must physically exist
     before a task counts as done: HUD, visual identity, 6+ used assets, one authored level,
     3 effects, 4+ SFX and a music bed, all visible in the preview.
     A task that only edits markdown is BLOCKED, not done.
----------------------------------------------------------------------------------- -->

# Forge Smoke — Game Design Document

> Working spec the task graph reads. The full end-to-end design is `docs/DESIGN-FULL.md`;
> if they disagree, the full design wins and this file is corrected.
> **Theme: military. The guns are the game.**

## 1. Player fantasy

You are the armory’s last operator, and the armory is winning. Hold a dark perimeter that is being
breached, with two guns in hand, each with its own firing language. You survive by choosing the
right gun and the right ground; positioning is the skill, never pointer precision.

Tone: steel, cordite, radio chatter, floodlights. Not horror — competence under pressure. The
screen is dark and the guns are loud; muzzle flash is the primary light source, and in Blackout
the guns *are* the lighting.

Audience: Justin first, then browser players on chatagent.ca / excavationpro.ca. Desktop browser,
keyboard + mouse. Target: 60 fps at 1080p on RTX 4060 Ti; ≥55 fps at 1280×720 on integrated
graphics. Input: WASD move · auto-fire · right-mouse aim mode · R reload · Q swap · Space
ability · 1/2/3 cards.

Pillars (each with a test):
1. **Every gun feels different in the hand.** Twelve firing styles, no two sharing a rhythm, sound
   or tracer. Test: spray SMG and pierce marksman feel different within one second of firing.
2. **The build is the story.** A run is remembered by its loadout; attachments compose behaviour,
   never raw power. Test: player can name their loadout and why they swapped; swapping mid-wave does
   not reset the other weapon’s reload.
3. **Pressure, not chaos.** Waves have named, telegraphed beats; the player always has a next
   move. Test: waves have named beats; Blackout lasts 8 s with hostile optics visible and muzzle
   flash lighting the room.

Constraints: none by preference. Each capability is built unless a measured technical limit forbids it (frame budget, memory, browser API, static hosting) — and that limit must be named with its number when it is the reason.
ballistics, licensed names/models, paid assets, runtime network calls, mobile-specific layout,
classes, procedural maps, mod support.

## 2. Controls

All input is read from `ctx` in `update()` (see `docs/CONTRACT.md` §Input). One input path, no
private listeners.

| Input | Action | Notes |
|---|---|---|
| `WASD` / arrows | 8-way move | no mouse-look for movement; direction is relative to camera orbit |
| (auto) | fire | weapons auto-target nearest threat in a 120° facing arc |
| Left mouse (`Mouse1`) | fire (manual override where applicable) | slice: auto-fire only |
| Right mouse (`Mouse2`) | **aim mode** | 0.6 s wind-up; spread −50 %; movement −25 %; trades mobility for reach |
| `R` | reload | per weapon, 1.1–2.4 s by family; also restarts after death |
| `Q` | swap primary / secondary | does not reset the other weapon’s reload progress |
| `Space` | ability | one per run, chosen at start: frag / smoke / sentry |
| `1` / `2` / `3` | pick upgrade card | during airdrop/level-up |
| `Esc` | pause | |
| `W`/`Space` (title) | start run | |
| `R`/`Space`/`Enter`/`Mouse1` (dead) | restart | |

Auto-aim contract: the player aims by positioning, never by pointer precision. Aim mode is the skill
expression.

## 3. Camera

Fixed top-down 3/4 perspective camera. No orbit control button; mouse-look rotates the camera
orbit offset around the player.

- Type: `PerspectiveCamera`, FOV 58°, near 0.1, far 240.
- Position: `(player.x + sin(orbit)·9, 6.4, player.z + cos(orbit)·9)`.
- Look-at: `(player.x, 1.25, player.z)` (player torso).
- Follow: exponential lerp `1 - exp(-dt·5.5)` toward the desired position.
- Orbit offset: `state.orbit -= ctx.look.x · 0.0042` per step (mouse-look driven).
- Player body yaw smoothing: `14/s`; gun pivot yaw smoothing: `16/s`.
- Arena clamp: player clamped to radius 54; camera follows, no separate clamp.
- Blackout: light-state switch only — camera position, FOV and follow are unchanged.
- No camera shake on reduced-motion preset; shake otherwise on heavy impacts (rail, boss).

Debug viewpoints (studio): `eye:spawn`, `eye:here`, `eye:down`, `eye:back`.

## 4. Core loop

### 30-second loop (micro)
Verbs, in order, repeating every ~30 s:
1. Move (WASD) to a firing lane.
2. Fire (auto) at the nearest threat inside the 120° facing arc.
3. Kill; enemies die, score and XP accrue.
4. Watch ammo and heat; ammo ticks down per shot, heat rises on sustained styles.
5. Reload (R, 1.1–2.4 s) or vent heat (2.4 s lockout at 100) when empty or hot.
6. Reposition when a sapper charges or a shield turns.
Failure: player HP reaches 0 → perimeter breached → death. Reward: kills (+12 score each) and XP
toward the next part card.

### 5-minute loop (meso)
Verbs, repeating across the run:
1. Read the threat mix (rifleman pairs → sappers → shields → artillery → mechs).
2. Swap (Q) primary/secondary to match the mix.
3. Aim (right mouse, 0.6 s) to trade mobility for reach on a priority target.
4. Take an airdrop (crate every 90 s): pick 1 of 2 weapons/parts (1/2/3).
5. Apply a part (barrel/magazine/optic/underbarrel/receiver/plate) that changes behaviour.
6. Unlock an evolution when two family parts plus a style partner meet.
7. Use the chosen ability (Space: frag/smoke/sentry) to break a pinch.
Failure: heat-locked or empty at the wrong moment, or armour depleted → death. Reward: airdrop pick
+ part + possible evolution; multiplier climbs (+0.08 per evolution, +0.05 per airdrop).

### Session loop (macro)
Verbs, once per run (~12 min + overtime):
1. Boot → title (best score) → choose ability (loadout).
2. Beat 1 Contact (0:00–0:45): sight in.
3. Beat 2 Suppression (0:45–1:30): first airdrop, learn options.
4. Beat 3 Breach (1:30–2:30): sappers open the perimeter, first elite.
5. Beat 4 Blackout (2:30): lights die for 8 s; guns are the only light.
6. Beat 5 Counter-attack (3:30–6:00): shields + artillery, second airdrop.
7. Beat 6 Blackout II (6:00): two floodlights, horde from both flanks.
8. Beat 7 Siege (8:00–11:00): mechs, spawn ×2.2, ground fire.
9. Beat 8 Gunship (11:00–12:00): boss strafes, drops mines, enrages at 30 %.
10. Overtime (12:00+): density scales, score multiplier climbs, “one more crate”.
11. Die (HP 0) or stop → results screen breaks down score
    `(kills × 12 + damage × 0.12 + seconds × 6) × multiplier`.
12. Convert score to local unlocks: best score, best time, 12 unlock tokens granting starting parts
    (never raw power).
Failure: perimeter falls (death) ends the run. Reward: score → local meta unlocks; best score/time
recorded.

### 4.1 Decision loop and proof (CON-01)

The 30-second loop is five decisions (AIM, FIRE, SWAP, UPGRADE, HOLD). Full diagram and
wave-forcing table live in `GAME.md` "Core loop (CON-01)"; this section carries the GDD copy
required by acceptance (loop diagram + three moments + no-cosmetic proof).

#### Loop diagram

```
  AIM (right mouse, 0.6s: spread -50%, move x0.75)
   -> FIRE (auto, 120 deg arc; ammo/heat spend; kill -> score+12, XP+10)
   -> SWAP (Q, 0.15s dip; other weapon keeps reload)
   -> UPGRADE (XP threshold or 90s crate; pick 1/2/3; part changes behaviour)
   -> HOLD (lane, cover, choke; survive the wave)
   -> wave escalates -> loop (>= 2 decisions forced per wave)
```

Failure: HP 0 -> perimeter breached -> death. Reward: kills + XP -> part cards -> evolutions ->
local unlocks; multiplier climbs (+0.08/evolution, +0.05/airdrop).

#### No decision is cosmetic (GDD numbers)

| Decision | GDD reference | Measurable effect |
|---|---|---|
| AIM | 10.3, 11.3 | spread -50 %, move x0.75, 0.6 s commit / 0.25 s wind-down |
| FIRE | 11.2, 11.6 | ammo -1 or heat +N/s; heat lock 2.4 s at 100; +10 XP/kill |
| SWAP | 10.2, 11.2 | damage shape/range/tracer change; reload preserved; 0.15 s dip |
| UPGRADE | 7, 11.4-11.5 | part changes behaviour (barrel/mag/optic/underbarrel/receiver/plate); evolutions compose |
| HOLD | 8, 11.3 | position/cover/choke; speed modifiers; spawn markers 0.6 s |

#### Three moments where a swap or card changes the outcome

1. Beat 3 Breach - sapper charge (SWAP): sapper (HP 18, 3.07 u/s) outsprints Spray (DPS 48).
   Swap to Pierce (34 dmg, 0.55 s, 13.3 u) kills before plant. No swap -> breach -> death.
2. Beat 5 Counter-attack - shield wall (SWAP + card): Shieldbearer (HP 60, frontal shield)
   blocks Spray (0 dmg). Swap to Beam (pierces shield) + Barrel long barrel + Optic thermal
   (flank timing) breaks the wall. No swap/card -> squad dies.
3. Beat 4 Blackout - priority target (card): Spotter (HP 22) paints (+15 % accuracy). Cone (8
   pellets, 62 DPS) at 8 u kills in <0.5 s only if Underbarrel foregrip tightens spread; else 3
   pellets miss, Spotter survives, buff lands, run ends.

#### Wave forcing (>= 2 of AIM/FIRE/SWAP/UPGRADE/HOLD)

| Beat | Forced |
|---|---|
| 1 Contact | FIRE, HOLD |
| 2 Suppression | FIRE, UPGRADE, SWAP |
| 3 Breach | SWAP, AIM, HOLD |
| 4 Blackout | AIM, FIRE, HOLD |
| 5 Counter-attack | SWAP, UPGRADE, AIM |
| 6 Blackout II | AIM, SWAP, HOLD |
| 7 Siege | FIRE, SWAP, HOLD |
| 8 Gunship | AIM, FIRE, SWAP |
| Overtime | UPGRADE, SWAP, HOLD |

## 5. Verbs and systems

Verbs: Move · Fire (auto) · Aim · Reload · Swap · Ability · Pick card.
Systems: per-weapon ammo and heat, two weapon slots, airdrop crates, attachment cards, evolutions,
armour, wave director, Blackout.

## 6. Combat — twelve styles

| # | Style | Behaviour | Signature weapon |
|---|---|---|---|
| 1 | Spray | wide cone, high rate, low damage, bloom | Compact SMG |
| 2 | Cone | 8 pellets, falloff at 240 px, huge close burst | Breacher shotgun |
| 3 | Pierce | single heavy round, passes through 3 bodies | Marksman rifle |
| 4 | Ricochet | bounces off arena walls, 2 bounces, +40 % after first | Carbine |
| 5 | Arc | lobbed grenade, 0.9 s fuse, 120 px splash | Thumper |
| 6 | Beam | continuous 0.4 s tick, no ammo but heat, pierces shields | Laser cutter |
| 7 | Chain | hits jump to 3 targets within 140 px, −25 % per jump | Arc emitter |
| 8 | Burst | 3-round burst, tight grouping, long reload | Battle rifle |
| 9 | Spin-up | 0.8 s ramp to max rate, movement −20 % while firing | Minigun |
| 10 | Rail | 1.2 s charge, a line that hits everything, screen shake | Railgun |
| 11 | Flamer | short cone, damage over time, ignites ground | Flamethrower |
| 12 | Sentry | deploys a turret that fires independently for 12 s | Drone launcher |

Slots: primary + secondary. Each weapon carries style, damage, rate, magazine, reload, heat cap,
falloff, projectile speed, tracer colour, recoil kick and one signature trait.

Heat: sustained styles (beam, minigun, flamer) build heat instead of consuming ammo; at 100 the
weapon locks for 2.4 s. Heat is a barrel glow, not a bar.

Starting numbers live in `docs/DESIGN-FULL.md` §14 and `src/tuning.js` (GDD-02 owns formulas).

## 7. Progression and economy

Level-up deals three parts, bound to a weapon family or a global slot:

| Slot | Examples | Effect shape |
|---|---|---|
| Barrel | long barrel, choke, suppressor, muzzle brake | range / spread / sound (suppressed pulls fewer enemies) |
| Magazine | drum, fast mag, AP rounds, incendiary | capacity / reload / penetration / burn |
| Optic | red dot, 4×, thermal | aim-mode tightening, reveals cloaked enemies |
| Underbarrel | foregrip, bipod, grenade tube | recoil, stationary accuracy, secondary grenade |
| Receiver | binary trigger, overclock, stabiliser | rate, heat, burst count |
| Plate | ceramic, spall liner, medkit rig | armour, bleed-through, heal on kill |

### Card pool (8) — `src/tuning.js` `TUNING.cards`

| # | Card | Slot | Rarity | Effect |
|---|---|---|---|---|
| 1 | Long Barrel | barrel | common | range ×1.25, spread ×0.8 |
| 2 | Suppressor | barrel | rare | suppressed sound, aggro ×0.5, range ×0.95 |
| 3 | Drum Magazine | magazine | common | mag ×2.0, reload ×1.3 |
| 4 | AP Rounds | magazine | rare | +1 pierce, damage ×0.9 |
| 5 | Red Dot | optic | common | aim spread ×0.7, aim speed ×1.1 |
| 6 | Foregrip | underbarrel | common | recoil ×0.7, bloom ×0.8 |
| 7 | Overclock | receiver | rare | cycle ×0.8, heat ×1.5 |
| 8 | Ceramic Plate | plate | common | armour +15 |

Composition rule: a part changes behaviour, never just a number.

Evolutions (two parts in a family + a style partner):
- Ricochet 3 + AP rounds → **Bank Shot** (ricochets seek the next target).
- Beam 3 + Overclock → **Cutting Torch** (the beam sweeps with your movement).
- Flamer 3 + Incendiary → **Firebreak** (burning ground spreads between enemies).

Out of run: best score, best time, 12 unlock tokens granting starting parts (never raw power).

Difficulty scaling: hp `× (1 + 0.18t)`, speed `× (1 + 0.05t)` capped 1.45, spawn budget
`8 + 3.2t`, elite chance `min(0.35, 0.06t)`.

## 8. Content and levels

**Three arenas, eight beats, then overtime. Airdrop every 90 s.**

| Arena | Beats (range) | Time window | Signature moment | Unlock rule |
|---|---|---|---|---|
| **1 · Perimeter** | 1 Contact, 2 Suppression, 3 Breach | 0:00–2:30 | First airdrop + first elite (the sapper charge) | Clear beat 3 (Breach) to open Breach Yard |
| **2 · Breach Yard** | 4 Blackout, 5 Counter-attack, 6 Blackout II | 2:30–8:00 | The lights die twice (Blackout I & II) | Clear beat 6 (Blackout II) to open Gunship Pad |
| **3 · Gunship Pad** | 7 Siege, 8 Gunship, Overtime | 8:00–12:00+ | Mechs, then the Gunship (boss) | Defeat the Gunship (beat 8) to complete the campaign; overtime is optional for score |

Unlock rule: an arena's final beat must be cleared to unlock the next arena — clear beat 3 to open
Breach Yard, clear beat 6 to open Gunship Pad; defeating the Gunship (beat 8) completes the
campaign, and overtime is optional scoring. A run always starts in Perimeter.

Each arena is a data file (`assets/levels/arena1.json` … `arena3.json`): bounds, cover, player spawn,
enemy spawn points, chokepoints and the beat timing hooks. A fourth arena must be a data file, not a
code change.

| Beat | Time | Director | Player feeling |
|---|---|---|---|
| 1 Contact | 0:00–0:45 | rifleman pairs, slow approach | “sight in” |
| 2 Suppression | 0:45–1:30 | first airdrop, spray enemies | “I have options” |
| 3 Breach | 1:30–2:30 | sappers open the perimeter, first elite | “they’re inside” |
| 4 Blackout | 2:30 | lights die, muzzle flash is the only light, 8 s | “I can’t see — but neither can they” |
| 5 Counter-attack | 3:30–6:00 | shields + artillery, second airdrop | “I need the right gun” |
| 6 Blackout II | 6:00 | two floodlights, horde from both flanks | “pick a lane” |
| 7 Siege | 8:00–11:00 | mechs, spawn ×2.2, ground fire | “hold the line” |
| 8 Gunship | 11:00–12:00 | boss: strafing gunship | “this is the run” |
| Overtime | 12:00+ | density scales, score multiplier climbs | “one more crate” |

Blackout is the signature beat: the arena goes dark, enemies show red optics, every shot lights the
room for 0.2 s.

Enemy roster:

| Enemy | Role | HP@1 | Speed | Behaviour |
|---|---|---|---|---|
| Rifleman | fodder | 14 | 58 | advances, fires bursts at 200 px |
| Sapper | breacher | 18 | 92 | sprints, plants a charge, 2 s fuse |
| Shieldbearer | wall | 60 | 34 | frontal shield — flank or rear only |
| Spotter | support | 22 | 46 | paints you; enemies gain +15 % accuracy |
| Drone | harasser | 16 | 120 | orbits, dives, explodes |
| Mortar team | artillery | 34 | 20 | lobs shells at a marked circle |
| Mech | elite | 260 | 40 | walks through cover, minigun + stomp |
| Gunship | boss | 2,600 | — | strafes, drops mines, enrages at 30 % |

Fairness: every lethal attack has a ≥0.35 s telegraph; no spawn without a 0.6 s marker; a shield
always shows its flank.

Scoring: `score = (kills × 12 + damage × 0.12 + seconds × 6) × multiplier`, where
`multiplier = 1 + 0.1 × blackouts_survived + 0.08 × evolutions + 0.05 × airdrops_taken`.
Results break it down.

### 8.1 Arena layout sketches (data: `assets/levels/arena1.json` ... `arena3.json`)

All arenas are 160 x 160 u squares, origin at centre, player clamped inside. Cover legend:
`#` wall, `C` crate stack, `B` concrete barrier, `P` pillar, `T` tree, `L` log, `X` container,
`S` enemy spawn point, `@` player spawn, `O` objective, `A` airdrop node, `|`/`-` chokepoint gap.

**Arena 1 - Perimeter** (beats 1-3; data `arena1.json`)

```
+----------------------------------------+
|  S . . . . . . . . . . . . . . . . S  |
|  .  T . . . . . . . . . . . . . T .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . .  B . . . . O . . . . C . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . .  L . . . . . . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  @ . . . . . . . . . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . C . . . . B . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . . . . . . . L . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . T . . . . . . . . . . T . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  S . . . . . . . . . . . . . . . . S  |
+----------------------------------------+
```

Chokepoints: west gap (left) and east gap (right). Player spawn bottom-left corner (`@`) facing
NE. 5 enemy spawns (S) on the outer ring. Objective `O` centre (survive). 2 airdrop nodes `A`
(not shown) at (+20,-10) and (-18,+22). Cover: 2 crate stacks, 2 concrete barriers, 2 logs,
2 trees.

**Arena 2 - Breach Yard** (beats 4-6; data `arena2.json`)

```
+----------------------------------------+
|  . . . . S . . . . . . . . . S . . .  |
|  . . . . . . . . X . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . S . . . . B . . O . . B . . . . S  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . C . . . C . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . P . . . . . . . . . . . . P . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . X . . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . S . . . . . . . . . . . . . . . S  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . S . . . . . . . . . S . . .  |
+----------------------------------------+
```

Chokepoints: north gap and south gap (top/bottom). Two floodlights on the east/west flanks.
Blackout beats (4, 6) switch lighting to hostile optics + muzzle flash. Player spawn bottom-left.
6 enemy spawns. Cover: 2 containers, 2 barriers, 2 pillars, 2 destructible crates.

**Arena 3 - Gunship Pad** (beats 7-8 + overtime; data `arena3.json`)

```
+----------------------------------------+
|  . . . . . . . . S . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . P . . . . . P . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  S . . . . . . .  O  . . . . . . . S  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . B . . . . B . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
|  . . . . . . . . S . . . . . . . . .  |
|  . . . . . . . . . . . . . . . . . .  |
+----------------------------------------+
```

Chokepoints: north gap and south gap. Open pad with sparse cover (mechs walk through cover).
Boss (`G` not shown) spawns at centre overhead. Player spawn bottom-left. 5 enemy spawns +
1 gunship spawn. Objective: defeat the Gunship.

## 9. UI / HUD / onboarding

HUD (in-canvas, no DOM): ammo per weapon, heat as barrel glow, armour, beat name + timer, score,
airdrop countdown. Panels: vitals, title, dead. Stencil type, amber on charcoal. Minimum 11 px
text; health colour thresholds 60/30.

Onboarding: Beat 1 teaches by prompting “hold”, “reload”, “swap”. Results screen shows the score
breakdown and a one-key restart.

Flow: Boot → title (best score) → loadout (choose ability) → run → level-up cards → death →
results → restart.

### 9.5 UX state machine (GDD-04)

Top-level flow: **Title → Arena Select → Play → Results → Retry**, with **Pause** and **Options**
reachable at any time and a keyboard path back to Title from every state. No state is a dead end.

#### State diagram

```
        BOOT (auto, < 1 s; Space skips)
          |
          v
   +---> TITLE  (best score, DEPLOY / OPTIONS / QUIT)
   |      |  Enter / Space / W  (DEPLOY)
   |      |  O  (OPTIONS)
   |      v
   |   ARENA_SELECT  (unlocked arenas, unlock state shown)
   |      |  Enter / Space  on an unlocked arena  (confirm)
   |      |  Up/Down or Left/Right  (move selection)
   |      |  Esc / Backspace  -> TITLE
   |      v
   |   LOADOUT  (choose ability: 1 frag / 2 smoke / 3 sentry)
   |      |  1 / 2 / 3  or Enter  (confirm)
   |      |  Esc / Backspace  -> ARENA_SELECT
   |      v
   |   PLAYING  (run; card window is an overlay, not a new state)
   |      |  Esc  -> PAUSED
   |      |  HP 0  -> RESULTS  (0.5 s slow-mo first, GDD 10.3)
   |      |  1 / 2 / 3  during card window  -> apply part, back to PLAYING
   |      v
   |   RESULTS  (score breakdown, threats, time, multiplier, tokens)
   |      |  R / Space / Enter  -> PLAYING  (retry, fresh run, starts in Perimeter)
   |      |  T / Backspace / Esc  -> TITLE
   |      +-------------------------------------> (retry path above)
   |
   |   PAUSED  (sim frozen, not reset; reached only from PLAYING)
   |      |  Esc / Enter  -> PLAYING  (resume)
   |      |  R  -> PLAYING  (restart run)
   |      |  O  -> OPTIONS
   |      |  Q / Backspace  -> TITLE  (abandon run)
   |
   |   OPTIONS  (volume, sensitivity, quality; persists to localStorage)
   |      |  opened by O from TITLE or PAUSED
   |      |  Esc / Backspace  -> caller (TITLE or PAUSED); if no caller -> TITLE
   |      |  Enter  -> confirm and return to caller
   +------+
```

#### Transition and key table

| State | Reached from | Key that drives the transition in | Key that drives the transition out | Escapes to TITLE via |
|---|---|---|---|---|
| BOOT | (start) | (auto; Space skips) | (auto, < 1 s) | (transient) |
| TITLE | BOOT, RESULTS, PAUSED (abandon), ARENA_SELECT/LOADOUT (back) | — | Enter/Space/W → ARENA_SELECT; O → OPTIONS | root state |
| ARENA_SELECT | TITLE | Enter/Space/W from TITLE | Enter/Space (unlocked) → LOADOUT; Esc/Backspace → TITLE | Esc / Backspace |
| LOADOUT | ARENA_SELECT | Enter/Space from ARENA_SELECT | 1/2/3 or Enter → PLAYING; Esc/Backspace → ARENA_SELECT | Esc twice (LOADOUT → ARENA_SELECT → TITLE) |
| PLAYING | LOADOUT, RESULTS (retry) | confirm in LOADOUT / R in RESULTS | Esc → PAUSED; HP 0 → RESULTS; 1/2/3 → PLAYING (card) | Esc → PAUSED → Q/Backspace → TITLE |
| PAUSED | PLAYING (Esc) | Esc from PLAYING | Esc/Enter → PLAYING; R → PLAYING; O → OPTIONS; Q/Backspace → TITLE | Q / Backspace |
| OPTIONS | TITLE (O), PAUSED (O) | O from TITLE or PAUSED | Esc/Backspace → caller; Enter → confirm + return | Esc → caller → (TITLE or PAUSED → … → TITLE) |
| RESULTS | PLAYING (HP 0) | HP 0 (auto) | R/Space/Enter → PLAYING (retry); T/Backspace/Esc → TITLE | T / Backspace / Esc |
| Card window (overlay) | PLAYING (XP threshold or airdrop) | (auto) | 1/2/3 → PLAYING; Esc → PAUSED | via PAUSED |

#### Reachability and escape guarantees

- **Every state is reachable by keyboard:** BOOT (auto) → TITLE → (Enter) ARENA_SELECT → (Enter) LOADOUT
  → (1/2/3) PLAYING → (Esc) PAUSED → (O) OPTIONS; PLAYING → (HP 0) RESULTS → (R) retry.
  OPTIONS is also reachable from TITLE (O). No state requires a mouse.
- **Every state is escapable by keyboard:** each row above names a key that leaves it; the last column
  names a key (or a two-key chain) that reaches TITLE.
- **No dead end:** TITLE is the root and is reachable from every other state by a chain of at most two
  keys (e.g. PLAYING → Esc → PAUSED → Q → TITLE; LOADOUT → Esc → ARENA_SELECT → Esc → TITLE).
  There is no state with no outgoing keyboard edge, and no transition that strands the player.
- **Card window and pause:** the card window pauses spawns but not the sim clock; Esc during a card
  window opens PAUSED, which freezes the sim and keeps the pending card, so the player can always
  abandon to TITLE without losing the ability to retry.
- **Pause freezes, never resets:** PAUSED leaves `state`, score, beat timer and reload progress intact;
  only an explicit R (restart) or Q/Backspace (abandon) changes the run.

Accessibility: reduced motion (no camera shake), colour-blind tracers (shape-coded), remappable
keys, ≥44 px touch targets, no flashing above 3 Hz.

## 10. Audio and feedback

### 10.1 Audio specification (M1 scope)

| Layer | M1 Detail |
|---|---|
| Gun report | Spray: sharp metallic *crack* (3 variants: −2st, 0, +2st). Pierce: heavy *thwip* with sub-bass tail (3 variants). Cone: blunt *boom* with pellet scatter tail (3 variants). Suppressed variants: −10 dB, high-pass at 2 kHz, same rhythm. |
| Casings | Metallic ticks, pooled max 6 concurrent. Spray: light brass *tink* (0.03 s). Pierce: heavier *clack* (0.05 s). Cone: hull *thud* (0.06 s). |
| Reload | Per family, mechanical, non-looped: SMG mag slap 1.1 s (insert + slap + bolt); Marksman bolt 1.6 s (lift + pull + push + lock); Shotgun break-open 1.4 s (break + eject + load + close). |
| Radio barks (M1) | B01 "Contact." at Beat 1 start (0:00). B03 "Airdrop inbound." at 88 s (2 s before crate lands). Auto-dismiss 2.0 s, radio filter, caption bottom-left. |
| Music bed | 92 BPM industrial, 4-bar loop. Layer 1: sub pulse (always). Layer 2: hi-hat grid (Beat 1+). Layer 3: distorted rhythm (Beat 2+). Ducks −6 dB on Blackout (M2). Master −14 LUFS. SFX peak −6 dBFS. |
| AudioContext | Created on first key press (W/Space/Mouse1) in `config.begin`. Mute key remappable; captions auto-on when muted. |

### 10.2 Feedback specification (M1 scope)

| Feedback | Spray SMG | Pierce Marksman | Cone Breacher |
|---|---|---|---|
| **Tracer** | Short dashes `#ffd57a`, life 0.075 s, additive | Single bright rod `#6fe3ff`, life 0.12 s, additive | Fan of 8 pellets `#ff8a4a`, life 0.06 s each, additive |
| **Muzzle flash** | Sphere 0.24, `#ffedb0`, life 0.06 s | Sphere 0.28, `#ffedb0`, life 0.08 s | Cone 0.35 wide, `#ffedb0`, life 0.07 s |
| **Recoil kick** | Camera offset: yaw ±0.008, pitch −0.004 per shot | Camera offset: yaw ±0.015, pitch −0.01 per shot | Camera offset: yaw ±0.025, pitch −0.015 per shot |
| **Hit confirmation** | Enemy flash 0.05 s (white additive), hit pause 0.01 s | Enemy flash 0.08 s, hit pause 0.02 s, pierce line lingers 0.15 s | Per-pellet flash 0.04 s, close-range multi-hit = single 0.12 s flash |
| **Reload feel** | Mag eject (0.15 s) → insert (0.4 s) → slap (0.2 s) → bolt (0.35 s). Gun dips −15° during, returns with overshoot. | Bolt lift (0.3 s) → pull (0.4 s) → push (0.4 s) → lock (0.5 s). Gun rotates +20° during, sharp return. | Break (0.3 s) → eject (0.3 s) → load 2 shells (0.5 s) → close (0.3 s). Gun opens 90°, snaps shut. |
| **Swap feel (Q)** | 0.15 s: gun dips −30°, fades, other rises +30°, settles with 0.08 s overshoot. No reload reset on other weapon. | Same timing. Pierce has heavier "weight" — slower settle (0.12 s vs 0.08 s). | Same timing. Cone has widest dip (−35°). |
| **Card pick (1/2/3)** | 0.2 s scale-up (1.0→1.12→1.0), amber flash, part name types out 0.4 s. Chosen card scales to 1.2, others fade 0.3 s. | | |
| **Airdrop crate** | Lands at 90 s: parachute 2.5 s descent, impact dust puff, lid pops 0.3 s delay. Options appear 0.5 s after lid. Pick: crate folds 0.4 s, chosen item flies to weapon slot 0.6 s. | | |
| **Beat transition** | Beat name + timer slides in top-center 0.4 s, holds, fades 0.3 s. Beat 1→2 at 0:45. | | |

### 10.3 Timing refinement (M1 scope)

| Parameter | Value | Rationale |
|---|---|---|
| Aim mode wind-up | 0.6 s (spread −50 %, move ×0.75) | Skill expression: commit early or stay mobile |
| Aim mode wind-down | 0.25 s (ease-out) | Responsive exit, no feeling stuck |
| Swap (Q) | 0.15 s animation, 0.08 s settle | Fast enough for combat, readable |
| Reload (SMG) | 1.1 s | Fast, aggressive rhythm |
| Reload (Marksman) | 1.6 s | Deliberate, rewards positioning |
| Reload (Shotgun) | 1.4 s | Shell-by-shell feel without per-shell input |
| Heat vent (M2 styles) | 2.4 s lock at 100, vent 40/s after 1.0 s idle | Not in M1 but specified for consistency |
| Card queue max | 2 queued | Prevents invisible catch-up |
| Card pick window | Unlimited (pauses spawns) | No pressure on read; spawns resume on pick |
| Airdrop interval | 90 s fixed, no catch-up | Predictable, plan around it |
| Airdrop warning | B03 bark at 88 s, crate lands at 90 s | 2 s telegraph |
| Death → results | 0.5 s slow-mo (timescale 0.2) → results | Emphasize the moment |
| Results → title | Immediate on R/Space/Enter/Mouse1 | No friction to retry |

### 10.4 Camera refinement (M1 scope)

| Parameter | Value | Note |
|---|---|---|
| FOV | 58° | Fixed, no zoom on aim mode (spread tightens instead) |
| Follow lerp | `1 - exp(-dt·5.5)` | Smooth but responsive |
| Orbit sensitivity | `ctx.look.x · 0.0042` per step | Subtle, not disorienting |
| Body yaw smoothing | 14/s | Heavy, grounded |
| Gun pivot yaw smoothing | 16/s | Snappy, leads body |
| Recoil camera kick | Per style (see feedback table) | Additive on top of follow |
| Screen shake | Rail/boss only (M2+); reduced-motion = none | M1: no shake sources yet |
| Blackout (M2) | Light-state switch only; camera unchanged | No FOV/position change |
| Arena clamp | Player radius 54; camera follows | No separate camera clamp |
| Debug viewpoints | `eye:spawn`, `eye:here`, `eye:down`, `eye:back` | Studio only |

### 10.5 Before/After evidence targets (PRODUCTION-02)

| Metric | Before (M0/M1 baseline) | After (Feel Pass target) | Test method |
|---|---|---|---|
| Weapon distinction (Pillar 1) | Spray vs Pierce felt similar in rhythm | Spray vs Pierce vs Cone distinguishable in <1 s firing | Playtest: blind style ID in 1 s |
| Reload clarity | Reload was a timer bar only | Family-distinct animation + sound + gun movement | Visual/audio review at 1280×720 |
| Swap responsiveness | Instant, no visual weight | 0.15 s weighted swap, other weapon preserves reload | Frame-count swap animation |
| Hit confirmation | Enemy flash only | Flash + hit pause + style-specific linger | Frame-count hit pause |
| Card pick feel | Instant apply | 0.2 s scale, 0.4 s type-out, 0.3 s reject fade | Record interaction video |
| Airdrop telegraph | Crate appears at 90 s | B03 at 88 s, parachute 2.5 s, dust, lid pop, options 0.5 s | Timeline verification |
| Beat transition | None | Name + timer slide 0.4 s in/0.3 s out | Visual review |
| Audio sync | None (M0 silent) | Reports, casings, reloads, B01/B03, music layers 1–3 | Waveform + spectrogram check |
| Camera feel | Functional lerp only | Recoil kick per style, weighted swap, stable orbit | Frame analysis + playtest |

## 11. Numbers and formulas (GDD-02)

Canonical unit: world unit (u). `1 u ≈ 30 px` (M0 player `6.4 u/s ≈ 192 px/s` matches the
`190 px/s` tuning target). Time in seconds, damage in HP. All values live as data in
`src/tuning.js`; the transforms below are the only allowed number logic. No invisible catch-up:
every modifier below is explicit and capped.

### 11.1 HP and armour
- Player: `HP_p = 100` (fixed; no meta HP increases — parts change behaviour, never raw power).
  Death at 0.
- Armour `A ∈ [0, 60]`, from Plate parts (`+15` each, cap 4). Reduction
  `r = A / (A + 100)` (cap `37.5 %` at `A = 60`). Effective damage
  `D_eff = max(1, round(D_raw * (1 - r)))`. Armour never regenerates; a medkit-rig plate
  heals `8 HP` on kill (cap 100).
- Enemy HP at time `t` (minutes): `HP_E(t) = HP_E0 * (1 + 0.18 t)`. No cap.
  Range at `t = 12`: `3.16×` base.
- Gunship: `HP = 2600` base; enrages at `≤ 30 % HP` (`×1.4` fire rate, `+20 %` speed).

### 11.2 Damage (base, `t = 0`, no parts)

| Style | Dmg/hit | Cycle (s) | DPS | Range (u) | Notes |
|---|---|---|---|---|---|
| Spray | 6 | 0.125 | 48 | 10.7 | 9° spread, bloom |
| Cone | 7 × 8 pellets | 0.90 | 62 (close, all hit) | 8.0 falloff | huge close burst |
| Pierce | 34 | 0.55 | 61.8 | 13.3 | passes 3 bodies |
| Ricochet | 16 | 0.25 | 64 | 11.0 | 2 bounces, +40 % after 1st |
| Arc | 28 splash | 0.90 | 31.1 | 12.0 (fuse 0.9 s) | 4.0 u splash |
| Beam | 9 DPS tick | continuous | 9 | 12.0 | heat 18/s, pierces shields |
| Chain | 12 | 0.35 | 34.3 (single) | 4.7 jump | 3 jumps, −25 %/jump |
| Burst | 3 × 11 = 33 | 1.00 | 33 | 12.0 | 0.12 s spacing |
| Spin-up | 6 | ramps 0.8 s to 10/s | 60 at max | 10.0 | movement −20 % while firing |
| Rail | 120 | 1.20 charge | 100 | line (all) | pierces all, screen shake |
| Flamer | 7 DPS + burn 3/s × 3 s | continuous | 10 | 5.0 cone | ignites ground |
| Sentry | 8 DPS (turret) | deploys 12 s | 8 (turret) | 7.3 | independent fire |

Heat (sustained styles only): builds at the listed `/s` (`beam 18`, `spin-up 12` at max, `flamer 15`);
locks the weapon at `100` for `2.4 s`; vents at `40/s` after `1.0 s` of no fire. Heat is `0–100`.

### 11.3 Speed and movement
- Player base `v_p = 6.4 u/s`. Modifiers (multiplicative, no positives):
  aim mode `×0.75 = 4.8`; spin-up while firing `×0.80 = 5.12`; both `×0.60 = 3.84`.
  Turn rates: body `14/s`, gun pivot `16/s`.
- Enemy speeds (u/s = legacy px / 30): Rifleman 1.93, Sapper 3.07, Shieldbearer 1.13,
  Spotter 1.53, Drone 4.00, Mortar 0.67, Mech 1.33. Gunship strafes at 4.0 (no chase).
- Speed scaling: `v_E(t) = v_E0 * min(1.45, 1 + 0.05 t)`. Cap `1.45` (reached at `t = 9`).

### 11.4 Economy and scoring
- `score = (kills × 12 + damage × 0.12 + seconds × 6) × m`.
- `m = 1 + 0.1·b + 0.08·e + 0.05·a`, clamped `[1.0, 3.0]`
  (`b` = blackouts survived `0–2`, `e` = evolutions `0–3`, `a` = airdrops taken).
- Meta: `1` unlock token per `25 000` score, max `3` per run, `12` total. Starting parts cost
  `1` token each. No raw-stat unlocks.

### 11.5 Drop rates
- Airdrop interval: `90 s` fixed (no catch-up). Count `floor(run_time / 90)`.
- Each crate offers exactly `2` options.
- Type roll: Weapon `35 %`, Part `65 %` (Weapon becomes Part if both slots are full).
- Part slot weights: Barrel 20, Magazine 20, Optic 15, Underbarrel 15, Receiver 15, Plate 15 (sum 100).
- Rarity: Common `70 %`, Rare `25 %`, Evolution `5 %` (only if prerequisites are met; otherwise
  reroll Common). No pity, no adaptive rates.
- No ammo/health drops; reload and vent are the only recovery.

### 11.6 Progression and difficulty
- XP: `+10` per kill, `+1` per 25 damage dealt, `+2` per second survived.
- Level threshold: `XP_L = 100 * L` (`L = 1, 2, …`). On reach, queue one 3-choice card;
  max `2` queued (no invisible catch-up beyond that).
- Airdrops (`90 s`) grant a card independent of XP.
- Difficulty (`t` in minutes, continuous `t = elapsed_s / 60`):
  - Enemy HP `× (1 + 0.18 t)` (no cap).
  - Enemy speed `× min(1.45, 1 + 0.05 t)`.
  - Spawn budget (concurrent) `B = min(400, floor(8 + 3.2 t))`.
  - Elite chance `p_elite = min(0.35, 0.06 t)`.
  - M0 spawn interval (seconds) `I = max(0.5, 1.2 - 0.012 * t_s)` where `t_s` is elapsed seconds.

### 11.7 Ranges and caps (summary)

| Quantity | Range |
|---|---|
| Player HP | 100 (fixed) |
| Armour | 0–60 |
| Player speed | 3.84–6.40 u/s |
| Enemy speed (scaled) | 0.67–4.00 u/s (×1.45 cap) |
| Enemy HP mult (at 12 min) | 1.00–3.16 |
| Spawn budget (at 12 min) | 8–46 (cap 400) |
| Elite chance | 0.00–0.35 |
| Score multiplier | 1.00–3.00 |
| Heat | 0–100 (lock 2.4 s) |
| Airdrop interval | 90 s |

### 11.8 Balance test (BT-01) — TTK bounds

For each style `S` and non-boss enemy `E` at `t = 0`, with no parts:

`TTK(S, E) = ceil(HP_E0 / DPS_S) * cycle_S` (use per-shot damage where DPS is not constant;
beam/flamer use continuous DPS). Required bounds:

| Enemy class | HP (base) | TTK bound |
|---|---|---|
| Fodder (Rifleman 14, Sapper 18, Drone 16, Spotter 22) | 14–22 | 0.1 s – 1.0 s |
| Mid (Shieldbearer flank 60, Mortar 34) | 34–60 | 0.5 s – 2.5 s |
| Elite (Mech) | 260 | 3.0 s – 8.0 s |
| Boss (Gunship) | 2600 | railgun 60–180 s; every other style ≥ 90 s |

Shieldbearer takes damage only from flank/rear; frontal hits deal 0. If any TTK falls outside a
bound, adjust damage or HP — never fire rate alone (pillar 1: rhythm is identity). Record the
resulting table in `QA.md` under "Balance".

### 11.9 Economy and pacing (GDD-03)

#### Airdrop cadence
- Interval: `90 s` fixed, no catch-up, no pity. Count `floor(run_time / 90)`.
- Warning bark B03 at `t = 90n - 2 s` (2 s telegraph); crate lands at `90n s`; lid pops `0.3 s`
  after landing; options appear `0.5 s` after lid pop.
- Each crate offers exactly `2` options. Type roll: Weapon `35 %`, Part `65 %` (Weapon becomes Part
  if both weapon slots are full). Part slot weights: Barrel 20, Magazine 20, Optic 15, Underbarrel
  15, Receiver 15, Plate 15 (sum 100). Rarity: Common `70 %`, Rare `25 %`, Evolution `5 %`
  (only if prerequisites are met; otherwise reroll Common). No ammo/health drops.

| Crate # | Lands at (s) | Time | Beat context |
|---|---|---|---|
| 1 | 90 | 1:30 | Beat 2 Suppression (first airdrop) |
| 2 | 180 | 3:00 | between Blackout and Counter-attack |
| 3 | 270 | 4:30 | Beat 5 Counter-attack (airdropAt 270) |
| 4 | 360 | 6:00 | Beat 6 Blackout II |
| 5 | 450 | 7:30 | Beat 7 Siege |
| 6 | 540 | 9:00 | Beat 7 Siege |
| 7 | 630 | 10:30 | Beat 7/8 transition |
| 8 | 720 | 12:00 | Beat 8 Gunship / overtime boundary |
| 9+ | +90 each | overtime | "one more crate"; multiplier climbs +0.05 per crate taken |

#### Card weighting (level-up)
- Trigger: XP threshold `XP_L = 100 * L`; XP sources `+10` per kill, `+1` per 25 damage, `+2` per
  second survived. On reach, queue one 3-choice card; max `2` queued (no invisible catch-up).
- Airdrops (`90 s`) grant a card independent of XP.
- Rarity weights at draw: Common `70 %`, Rare `25 %`, Evolution `5 %` (reroll Common if prereqs
  unmet). No pity, no adaptive rates.

#### Overtime difficulty curve (t ≥ 12 min)
Base scaling from §11.6 continues; overtime keeps the caps already in force (speed 1.45, elite 0.35,
spawn budget ceiling 400) and lets HP scale without cap. Values below are the resulting numbers.

| Time (min) | t | HP mult (1+0.18t) | Speed mult (cap 1.45) | Spawn budget (concurrent) | Spawn interval (s) | Elite chance |
|---|---|---|---|---|---|---|
| 12:00 | 12.0 | 3.16 | 1.45 | 46 | 0.50 (floor) | 0.35 |
| 13:00 | 13.0 | 3.34 | 1.45 | 50 | 0.50 | 0.35 |
| 14:00 | 14.0 | 3.52 | 1.45 | 53 | 0.50 | 0.35 |
| 15:00 | 15.0 | 3.70 | 1.45 | 56 | 0.50 | 0.35 |
| 18:00 | 18.0 | 4.24 | 1.45 | 66 | 0.50 | 0.35 |
| 20:00 | 20.0 | 4.60 | 1.45 | 72 | 0.50 | 0.35 |

Formulas (same as §11.6, no overtime exception): `HP_mult = 1 + 0.18 t`; `speed_mult = min(1.45,
1 + 0.05 t)`; `B = min(400, floor(8 + 3.2 t))`; `p_elite = min(0.35, 0.06 t)`; `I = max(0.5,
1.2 - 0.012 * t_s)`. Spawn budget grows `+3.2` per minute; HP grows `+0.18` per minute without
cap, so survival past 15 min depends on damage output, not reflexes. Score multiplier climbs via
airdrops (`+0.05` each) and evolutions (`+0.08` each), clamped to 3.0.

#### Score formula
`score = (kills × 12 + damage × 0.12 + seconds × 6) × m`, with
`m = 1 + 0.1·b + 0.08·e + 0.05·a`, clamped `[1.0, 3.0]`
(`b` = blackouts survived 0–2, `e` = evolutions 0–3, `a` = airdrops taken). Implemented in
`src/balance.js` as `score(kills, damage, seconds, multiplier)` and `multiplier(blackoutsSurvived,
evolutions, airdropsTaken)`. Meta: 1 unlock token per 25 000 score, max 3 per run, 12 total;
starting parts cost 1 token each; no raw-stat unlocks.

#### Expected player power (by minute)
"Power" is loadout depth, not a raw stat: HP stays 100 and no part raises damage outright, so
progress is measured by parts owned, armour, evolutions and score multiplier. Estimates assume a
competent run (~25 kills/min, ~600 damage/min, full survival, one card picked per level/airdrop).

XP per minute ≈ 25×10 + 600/25 + 2×60 = 394. Cumulative XP for level L = 50·L·(L+1).

| Minute | Airdrops taken | Level reached | Parts/cards owned | Armour (est.) | Evolutions (est.) | Score multiplier (est.) | Enemy HP mult |
|---|---|---|---|---|---|---|
| 2 | 1 | 3 | 4 | 0–15 | 0 | 1.05 | 1.36 |
| 5 | 3 | 5 | 8 | 15–30 | 0–1 | 1.33 | 1.90 |
| 10 | 6 | 8 | 14 | 30–45 | 1–2 | 1.66 | 2.80 |

Notes: armour assumes Ceramic Plate (+15) picked roughly every 3rd–4th card; evolutions need two
family parts plus a style partner and are not guaranteed. Score multiplier assumes blackouts
survived (0 at min 2, 1 at min 5, 2 at min 10). Player DPS baseline stays the style's base
(Spray 48) — parts change behaviour (range, spread, pierce, heat), never a flat damage stat, so
TTK against the scaled HP above is the real power check (BT-01).

## 12. Test cases

1. A spray SMG and a pierce marksman feel different within one second of firing.
2. Swapping weapons mid-wave does not reset reload progress on the other weapon.
3. A ricochet carbine bounces twice and gains 40 % after the first bounce.
4. A suppressed build draws measurably fewer enemies than an unsuppressed one over 60 s.
5. Blackout lasts 8 s, hostile optics stay visible, and muzzle flash lights the room.
6. Shields only take damage from flank or rear; the flank is always visible.
7. Corrupt `localStorage` boots to the title without a crash.
8. p95 frame time ≤ 18 ms at 1280×720 during a Blackout with 300 enemies.
9. BT-01 TTK bounds pass for all 12 styles vs all 8 enemies at `t = 0` with no parts (see §11.8).

## 13. Vertical slice scope (M0)

**Slice = one playable scene/level:** the single bounded arena (treeline clearing, radius 54)
shipped as M0. It proves the core loop end to end with placeholder art and one weapon, before any
second system is added.

### In (M0)
- Scene: one arena — ground plane, puddles, trees/bushes/logs, rain, fog; bounded play radius 54.
- Player: 8-way WASD move at 6.4 u/s, yaw smoothing, clamped to arena radius.
- Weapon: spray SMG only — mag 30, cycle 0.125 s, reload 1.2 s, tracer + muzzle flash.
- Enemy: one type (Rifleman-equivalent cube) — HP 100, speed 2.2–4.0, melee 9 dmg on 1 s cooldown.
- Spawn: 1.2 s → 0.5 s cap, max 20 concurrent, seeded RNG.
- Vitals: health 100, death at 0 → `dead` phase; restart via R/Space/Enter/Mouse.
- Camera: fixed top-down 3/4 follow with orbit offset; no orbit control.
- HUD (in-canvas): vitals panel, health bar + number, threats-down count, MAG/reloading, hint line,
  title panel, dead panel.
- VFX: tracers (pooled 18), muzzle flash sphere, rain (420 drops), tree sway.
- Flow: `title` → `playing` → `dead` → `playing`; `window.__studio` present,
  `config.begin`/`config.flow`.

### Out (deferred — not in this slice)
- Second weapon slot, swap (Q), aim mode (right mouse), reload variants.
- Airdrops, level-up cards (1/2/3), parts, evolutions.
- The other 7 enemy types, shields/flanks, artillery telegraphs, Blackout light switch.
- Beat director, Gunship boss, overtime, scoring formula/multiplier, results breakdown.
- Meta unlocks, save/load beyond corrupt-`localStorage` boot.
- Audio (none at M0). Accessibility pass (reduced motion, colour-blind tracers, remap).
- Shadows/post pass (measured at M2).

### How it is tested (observable acceptance)
1. Boot: page loads, `window.__studio` present, phase `title`, 0 console errors.
2. Start: W or Space → phase `playing`, player moves (probe: held W 600 ms → `playing`,
   `player.z −2.03`).
3. Core loop: auto-fire kills; mag 30→0; R reloads to 30; kills increment.
4. Death: health 0 → phase `dead`, “PERIMETER LOST” panel; R → `playing`.
5. HUD: `hud.overlaps: []`, no DOM HUD.
6. Performance: ≥55 fps at 1280×720 (measured 61 fps headed; headless software render ~10, not
   representative).
7. Determinism: same seed + same inputs → same spawn pattern and score.
8. Save: corrupt `localStorage` boots to title without crash.
9. Budget: draw calls ≤ 90, tris ≤ 150 000, textures ≤ 96 MB at 1280×720 (shadows on; re-measure
   at M2).

### Slice budget notes
- Single renderer, one scene, no realtime post chain on the low preset. Shadows currently on
  (starter setting); low-end preset pass lands at M2 with measured numbers recorded in QA.md.

### SLICE-01 verification (Core Build)
Verified on the running slice (headed Chromium, 1280×720, `http://127.0.0.1:8796/preview/forge-smoke/`):
- Boot: `window.__studio` present, phase `title` (flow `menu`), 0 console errors.
- Start: `begin()` → flow `playing`; holding W 600 ms moves the player (`player.z −3.84`), yaw tracks heading.
- Core loop: auto-fire depletes MAG 30→0; R reloads to 30; kills increment (9 in 12 s, 39 in 40 s); enemies spawn 1.2 s→0.5 s cap, max 20 concurrent.
- Death/restart path: `hurt()` sets phase `dead` → `PERIMETER LOST` panel; R/Space/Enter/Mouse1 → `startRun()` (code path present).
- HUD: `hud.overlaps: []`, no DOM HUD; 7 items; vitals/health/threats/MAG/hint/title/dead panels.
- Save: corrupt `localStorage` (`forge-smoke/v1`) boots to title (`phase title`, flow `menu`) without crash.
- Performance: 59 fps measured (headed, 2 s sample); no console errors across 40 s run.
Numbers above are M0 slice values; full-release tuning remains §11.

## 13.5. Production content batch 1 (M1) — PRODUCTION-01

**Scope:** two weapons + swap, reload variants, level-up cards. This batch makes a run describable by its loadout.

### In (M1)
- Second weapon slot (primary + secondary) with independent ammo, heat and reload timers.
- Swap (Q): exchanges primary/secondary; does not reset the other weapon's reload progress.
- Reload variants per family: mag slap (SMG/rifle 1.1 s), bolt (marksman 1.6 s), belt (minigun 2.4 s), break-open (shotgun 1.4 s), cell swap (beam 1.2 s), drum (flamer 1.8 s), breach (rail 2.1 s), rack (sentry 1.5 s).
- Level-up card system: on XP threshold, queue a 3-choice card (max 2 queued); keys 1/2/3 pick.
- Card pool: 8 cards (see §7 Card pool); drawn from the weighted pool at airdrops and level-ups.
- Two additional styles implemented: **Pierce** (marksman rifle) and **Cone** (breacher shotgun) — distinct tracer, rhythm, sound, heat/ammo model.
- Rifleman enemy HP scaled to 14 (from M0 100); spawn interval 1.2 s → 0.5 s cap, max concurrent 20.
- Beat director skeleton: time-gated phases (Contact 0:00–0:45, Suppression 0:45–1:30) with airdrop at 90 s.
- Airdrop crate: lands every 90 s, offers 2 options (weapon or part), pick via 1/2.
- Scoring core: `score = (kills × 12 + damage × 0.12 + seconds × 6) × multiplier`; multiplier = 1 + 0.1×blackouts + 0.08×evolutions + 0.05×airdrops.
- Results screen: shows score breakdown, threats down, time survived, multiplier, unlock tokens earned.

### Out (deferred to M2+)
- Remaining 10 styles (Ricochet, Arc, Beam, Chain, Burst, Spin-up, Rail, Flamer, Sentry).
- Remaining 6 enemy types (Sapper, Shieldbearer, Spotter, Drone, Mortar, Mech, Gunship).
- Blackout light-state switch (Beat 4, 6).
- Evolutions (Bank Shot, Cutting Torch, Firebreak).
- Ability (Space: frag/smoke/sentry chosen at loadout).
- Full 8-beat director with named beats, elite scaling, overtime.
- Gunship boss, meta unlocks (12 tokens), localStorage persistence beyond corrupt-boot.
- Audio (gun reports, casings, reloads, barks, music bed).
- Accessibility pass (reduced motion, colour-blind tracers, remappable keys).

### Acceptance (observable, matches DESIGN-FULL.md M1)
1. Run starts with two weapons (Spray SMG + Pierce Marksman); Q swaps, other weapon keeps reload progress.
2. Reload shows family-appropriate time and animation; heat styles (Beam/Flamer/Spin-up) vent instead of reload.
3. XP bar fills → 3-choice card appears → 1/2/3 picks → part applied to correct weapon slot.
4. Airdrop crate spawns at 90 s → 2 options → pick applies weapon/part.
5. Beat 1 Contact (0:00–0:45) and Beat 2 Suppression (0:45–1:30) run with correct spawns.
6. Results screen shows score breakdown and unlock tokens; R restarts.
7. Budget: draw calls ≤ 90, tris ≤ 150k, textures ≤ 96 MB at 1280×720 during Suppression beat.
8. Performance: ≥55 fps at 1280×720 (p95 frame time ≤ 18 ms).
9. Determinism: same seed + inputs → same spawns, cards, score.

## 14. Narrative (GDD-03)

### 14.1 Premise
You are the last operator of the Forge Smoke armory, holding a treeline perimeter through eight
escalating assaults. The guns are the story: a run is remembered by its loadout, not by a plot.
There are no cutscenes and no lore gates — the assault itself is the narrative, and every system
above is the text. Story is optional flavour; mechanics carry the meaning.

### 14.2 Cast
| Role | Call sign / name | Voice | Notes |
|---|---|---|---|
| Operator (player) | Forge-1 | silent | last armory operator; no backstory dump, no dialogue |
| Control | — | off-screen radio | gives barks only; never seen, never a model |
| Enemies | roles only (Rifleman, Sapper, …) | none | unnamed; no named antagonists |
| Gunship | — | none | a machine; no personality, no taunts |

No other characters, factions or relationships are in scope. No licensed names or models.

### 14.3 Barks (canonical six)
| ID | Trigger | Text (≤ 6 words) | Display |
|---|---|---|---|
| B01 | first contact (Beat 1) | "Contact." | 2.0 s, radio filter |
| B02 | Sapper spawns | "Sapper on the wire." | 2.0 s |
| B03 | crate drops | "Airdrop inbound." | 2.0 s |
| B04 | Blackout starts | "Lights out." | 2.0 s |
| B05 | Gunship spawns | "Gunship!" | 2.0 s |
| B06 | surviving Blackout | "Perimeter holding." | 2.0 s |

Barks are audio + a short in-canvas caption. They auto-dismiss after 2.0 s and are cancelled by
any input. They never pause the sim or block a shot.

### 14.4 Story delivery rules
- **Skippable.** Title blurb is skipped with Space/Enter/Mouse. Barks auto-dismiss and can be muted
  (remappable). No modal, full-screen or unskippable text. No lore ever gates progress, scoring or
  a restart.
- **No lore dumps.** No codex, no long dialogue, no pause-menu lore. Max 8 words per bark. Story
  never interrupts the 30-second loop.
- **Channels.** Title one-line blurb; radio barks (§14.3); beat name + timer on the HUD; one-line
  epitaph on the results screen ("Held the line for 11:42.").
- **Accessibility.** Captions on by default when audio is muted; no flashing text above 3 Hz;
  remappable mute and skip keys.
- **Canon authority.** §14.5 is the source of truth; any contradiction is resolved in its favour and
  a change requires a DECISIONS.md entry.

### 14.5 Canon sheet
- Setting: Forge Smoke armory perimeter, a treeline clearing at night, rain. No specific year or nation.
- Player: Forge-1, the last operator, silent. No given name, no backstory beyond the premise.
- Control is an off-screen radio voice; never seen and never modelled.
- Enemies are unnamed roles; no named villains or personalities.
- The Gunship is a machine: no AI personality, no taunts.
- No licensed names or models; all names, art and audio are original.
- Story is optional flavour; the mechanics (§5–§8) are the canon of play.
- The six barks in §14.3 are the only dialogue in the game.
- Canon changes require an appended DECISIONS.md row; retcons are not allowed silently.

---

# MILESTONE 2 — FULL GAME (this is what "done" means now)

The M1 pass produced systems (tuning, balance, weapons, enemies, director, save) and a shell of a
HUD. It did **not** produce a game that looks or sounds finished. M2 is the content pass. Every item
below has an owner task in `TASKS.json` (M2-*) and an acceptance line that can be checked in the
preview.

## 9.1 Menus (M2-UI-02)

| Screen | Must contain | Behaviour |
|---|---|---|
| Title | logo/wordmark, `DEPLOY`, `OPTIONS`, `QUIT`, version string, seed/level hint | keyboard + mouse; Enter starts |
| Options | master volume, SFX volume, mouse sensitivity, quality (dots/particles on-off) | persists to `localStorage`, survives reload |
| Pause | `RESUME`, `RESTART`, `OPTIONS`, current score/wave | `ESC` toggles; game state frozen, not reset |
| Game over | final score, wave reached, best score, `RETRY`, `TITLE` | RETRY starts a fresh run in < 1 s |

No screen may be a bare text dump: each uses the ART_BIBLE palette, the type scale, and the same
button component.

## 9.2 HUD (M2-UI-01)

Required elements, all driven by live state:

- **health / armor** bar (segmented, not a plain rectangle)
- **ammo** in magazine + reserve, with a low-ammo state (colour + pulse)
- **weapon** name + silhouette icon for the equipped slot (2 slots, `Q` swaps)
- **objective / wave** line: wave number, enemies remaining
- **cards** 1/2/3 slots showing cooldown or charge
- **hit feedback**: damage vignette, brief red edge pulse, screen shake

## 9.3 Look (M2-ART-01)

- Palette, fog and lighting exactly per `ART_BIBLE.md`; no default-grey material anywhere on screen.
- Ground, horizon and sky read as one scene, not three unrelated planes.
- Silhouettes: every enemy and weapon reads at 64 px.

## 9.4 Assets (M2-ASSET-01) — see `ASSET_PLAN.md` §2 for the exact list

Minimum six installed: 3 weapon silhouettes, 2 enemy silhouettes, 1 ground/wall texture, plus the
icon sheet the HUD uses. Every one registered in `assets/manifests/assets.json` with source and
licence, and imported by the module that draws it.

## 9.5 Level (M2-MAP-01)

One authored arena, data-driven:

- 160×160 units, perimeter wall with two chokepoints
- player spawn at a defensible corner, facing the open ground
- 5 enemy spawn points, staggered by wave
- 2 pickup nodes and 1 objective marker
- win condition: survive wave 5; lose condition: health 0

A second level must be a data file, not a code change.

## 9.6 Effects (M2-FX-01)

Muzzle flash on fire, impact spark on hit, ambient weather (the existing rain is a start), and
screen shake on player damage. Each must be visible in normal play, not just in a debug path.

## 9.7 Sound (M2-AUDIO-01)

| Cue | When | Notes |
|---|---|---|
| `fire` | every shot | short, punchy, varies pitch slightly |
| `reload` | R / empty mag | mechanical tail |
| `hit` | enemy damaged | distinct from `hurt` |
| `pickup` | card collected | bright |
| `hurt` | player damaged | low thud + filter |
| `music` | loop | low-intensity bed, ducks on game over |

Master mute + volume persistence live in the audio module.

## 9.8 Wiring (M2-WIRE-01)

- `index.html` is regenerated/updated: it currently predates every module it loads.
- Every module in `src/` is imported by something; delete the dead ones.
- One loop: title → play → die → retry, with save/load of best score and settings.
- `REFRESH` must read `0 files newer than the page` when the build is coherent.

## 9.9 Acceptance (M2-QA-01)

Screenshots of title, gameplay, pause and game over, plus the `REFRESH` readout, attached to
`TASKS.json`. Any BUILD.md §1 row without evidence keeps the task open.
