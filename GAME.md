# Forge Smoke

**Profile:** Web 2D · **Engine:** Three.js inside the Genex studio harness (`window.__studio`, in-canvas HUD, deterministic `rng`/`dt`)
**Theme:** military · **Hook:** the guns
**Status:** design locked (see `docs/DESIGN-FULL.md`)
**Owner:** Producer → Game Director

## Pitch

A top-down military survival shooter where **the guns are the game**. Two weapons, twelve firing
styles — spray, cone, pierce, ricochet, arc, beam, chain, burst, spin-up, rail, flamer, sentry — and
every level-up hands you a part that changes *how one of them shoots*. Hold the perimeter through
eight escalating assaults across three arenas; a crate airdrops every 90 seconds; the run ends when
the perimeter does.

Reference shape: *Azeroth Survivors* — survivors-like arc, 3-choice level-ups, browser-native. Our
identity is the **armory**, not the IP.

## Player fantasy

_You are the armory’s last operator, and the armory is winning._

## Audience and platform

- Audience: Justin first; then browser players on chatagent.ca / excavationpro.ca
- Platform: desktop browser, keyboard + mouse (primary); touch emulation secondary
- Target machine (high): 60 fps at 1920×1080 on the RTX 4060 Ti (desktop preset) — frame-time
  budget ≤ 16.67 ms/frame (1000/60)
- Low-end machine (governing): ≥ 55 fps (target 60) at 1280×720 on integrated graphics — p95 frame
  time ≤ 18 ms; frame-time budget 16.67 ms at 60 FPS
- Low-end budget: 90 draw calls, 150 000 triangles, 96 MB textures, 60 FPS at 1280×720
  (see `TECH_SPEC.md` §6, `QA.md`)
- Input: WASD move · auto-fire · right-mouse aim mode · R reload · Q swap · Space ability · 1/2/3 cards

## Pillars

1. **Every gun feels different in the hand.** Each of the twelve styles owns a unique damage shape, rate,
   range, heat/ammo, tracer colour and sound; no two share a rhythm, sound or tracer.
   - Test: a spray SMG and a pierce marksman feel different within one second of firing; no two styles
     share rhythm, sound or tracer.
   - Non-goal: no realistic ballistics, no licensed names/models, no per-gun tutorials; feel comes from
     shape, rate, heat and tracer, not simulation.

2. **The build is the story.** Level-ups are parts that change behaviour; the run's identity is the
   loadout the player can name and justify.
   - Test: a player can name their loadout and why they swapped; swapping mid-wave does not reset the
     other weapon's reload.
   - Non-goal: no class system, no stat-stacking meta, no inventory beyond two slots; parts change
     behaviour, never raw power.

3. **Pressure, not chaos.** Waves have named, telegraphed beats; the player always has a next move.
   - Test: waves have named beats and the player always has a next move; Blackout lasts 8 s with hostile
     optics visible and muzzle flash lighting the room.
   - Non-goal: no infinite enemy density, no untelegraphed spawns, no difficulty spike without a named
     beat.

## Core loop (CON-01)

The 30-second loop is five decisions, in order, repeating every wave. A wave is never passive:
it forces at least two of {AIM, FIRE, SWAP, UPGRADE, HOLD}; a wave that forces only one is cut or
redesigned (pillar 3: pressure, not chaos).

### Loop diagram

```
                  30-SECOND DECISION LOOP  (repeats every ~30 s)
  +--------------------------------------------------------------+
  |                                                              |
  |   1. AIM   (right mouse, 0.6 s wind-up)                      |
  |      spread -50 %, move -25 %: commit to a priority target    |
  |            |                                                 |
  |            v                                                 |
  |   2. FIRE  (auto, 120 deg arc)                               |
  |      spend ammo / heat; kill -> score +12 and XP             |
  |            |                                                 |
  |            v                                                 |
  |   3. SWAP  (Q, 0.15 s dip, other weapon keeps reload)        |
  |      exchange primary/secondary when the mix changes          |
  |            |                                                 |
  |            v                                                 |
  |   4. UPGRADE (XP threshold or 90 s crate; pick 1/2/3)        |
  |      part changes behaviour, never raw power; evolutions      |
  |            |                                                 |
  |            v                                                 |
  |   5. HOLD  (lane, cover, choke)                              |
  |      survive the wave; reposition on sapper/shield turn       |
  |            |                                                 |
  |            +-- wave escalates -> loop (>= 2 forced) ----------+
  +--------------------------------------------------------------+
```

Failure: HP 0 -> perimeter breached -> death. Reward: kills (+12) and XP toward the next part card;
airdrop pick + part + possible evolution; multiplier climbs (+0.08 per evolution, +0.05 per airdrop).

### The five decisions are not cosmetic

| Decision | What it changes (number or behaviour) | Why it is not cosmetic |
|---|---|---|
| AIM | spread -50 %, move x0.75, 0.6 s commit; reach on priority targets | changes TTK at range and survival; reverses on wind-down 0.25 s |
| FIRE | ammo -1/shot or heat +N/s; kill -> score +12, XP +10; heat lock 2.4 s at 100 | spends a finite resource; empty/hot = death window |
| SWAP | damage shape, range, tracer; other weapon keeps reload progress | different enemy TTK (see GDD 11.8); 0.15 s dip is the cost |
| UPGRADE | part changes behaviour (barrel range/spread/sound, mag penetration/burn, optic aim/thermal, underbarrel recoil/grenade, receiver rate/heat/burst, plate armour/heal); evolutions compose | changes what the gun can do, never a raw stat; loadout is nameable |
| HOLD | position, cover, choke; speed modifiers (aim x0.75, spin-up x0.80) | determines which enemies reach you; no spawn without a 0.6 s marker |

No decision is a visual-only toggle: each alters a value in GDD 11 or a behaviour in GDD 6-7.

### Every wave forces at least two decisions

| Beat | Window | Forced decisions (>= 2) | Why |
|---|---|---|---|
| 1 Contact | 0:00-0:45 | FIRE, HOLD | rifleman pairs close; must fire and hold a lane |
| 2 Suppression | 0:45-1:30 | FIRE, UPGRADE, SWAP | first airdrop at 90 s offers a weapon/part; second style comes online |
| 3 Breach | 1:30-2:30 | SWAP, AIM, HOLD | sappers sprint; aim to drop them before the charge; swap to pierce/cone; hold perimeter |
| 4 Blackout | 2:30 (8 s) | AIM, FIRE, HOLD | lights die; muzzle flash is the light; aim to tighten, fire to see, hold position |
| 5 Counter-attack | 3:30-6:00 | SWAP, UPGRADE, AIM | shields + artillery; swap to flank/rear or beam; aim priority targets; second crate |
| 6 Blackout II | 6:00 | AIM, SWAP, HOLD | two floodlights, flanks; pick a lane (HOLD), swap to cover it, AIM |
| 7 Siege | 8:00-11:00 | FIRE, SWAP, HOLD | mechs, spawn x2.2; sustained fire; swap to DPS; hold the line |
| 8 Gunship | 11:00-12:00 | AIM, FIRE, SWAP | boss strafes and drops mines; aim to track, fire, swap for DPS |
| Overtime | 12:00+ | UPGRADE, SWAP, HOLD | density scales; every crate is a decision; hold position; swap to match |

### Three moments where a swap or card changes the outcome

1. **Beat 3 Breach - sapper charge (SWAP).** A sapper (HP 18, speed 3.07 u/s) reaches the charge
   point before the Spray SMG (DPS 48, 9 deg spread) can kill it at 10 u. Swapping to Pierce
   (34 dmg, 0.55 s cycle, 13.3 u range) drops it in one hit before it plants. Without the swap the
   perimeter is breached -> death. Swap changes the outcome.

2. **Beat 5 Counter-attack - shield wall (SWAP + card).** A Shieldbearer (HP 60, frontal shield,
   flank/rear only) blocks all frontal Spray damage (0 damage). Swapping to Beam (9 DPS, pierces
   shields) keeps damage flowing while repositioning; a Barrel part (long barrel) extends Pierce to
   flank from 13.3 u before the shield turns. An Optic card (thermal) reveals the flank timing.
   Without the swap/card the shield holds and the squad dies. Swap + card change the outcome.

3. **Beat 4 Blackout - priority target (card).** During the 8 s blackout a Spotter paints the player
   (+15 % enemy accuracy). With Cone breacher (8 pellets, 62 DPS close) at 8 u the Spotter (HP 22)
   dies in < 0.5 s. An Underbarrel card (foregrip) tightens cone spread so all 8 pellets land at
   6 u; without it 3 pellets miss, the Spotter survives, the accuracy buff lands, and the run ends.
   Card changes the outcome.

(Composition capstone: Ricochet + AP rounds (Magazine) -> Bank Shot makes ricochets seek the next
target, turning a single bounce into a cleared cluster behind cover - a build the player can name.)

### Cross-references
Pillar links: (1) gun feel in GDD 6/10.2, (2) build-as-story in GDD 7, (3) pressure in GDD 8.
Systems numbers: GDD 11. Full proof table: GDD 4.1.

## Constraints

None by preference. A capability is built unless a **measured technical limit** forbids it, and the
limit is named with its number (e.g. "co-op needs 2x the enemy budget; measured 22 ms/frame at 720p").
If a limit disappears later, the feature comes back on the board.

Measured technical limits available to cite: frame budget (16.67 ms/frame at 60 FPS; p95 ≤ 18 ms at
1280×720), memory (96 MB textures, 12 MB audio, 30 MB shipped build), browser API (WebGL 2, no
filesystem, no cross-origin storage without a server), hosting (static site, no backend, no runtime
network calls).

Quality guardrails that are *style*, not scope: no licensed names or models, no realistic ballistics
sim, no per-gun tutorials. These describe how the game feels, not what it may include.

## Capabilities

The design wants all of the following. Each is either built in the M2 build or excluded with a
measured technical limit and the change that would allow it. Nothing is dropped silently.

| Capability | Status | Detail |
|---|---|---|
| Individual play | Built (M2) | Single-player run; primary and only mode in M2. |
| Co-op play | Excluded from M2 build | **Frame budget:** 2× enemy density measured 22 ms/frame at 720p, over the 16.67 ms budget. **Hosting:** static site has no signaling/relay server; Genex Colyseus requires embed/auth not validated in local test mode. To allow: add a signaling/relay host (or local same-screen second input path + aim handling) and raise the frame/enemy budget, or halve per-player density. |
| Local leaderboards | Built (M2) | Per-arena best score and best time in `localStorage` (`forge-smoke/v1`). |
| Shareable leaderboards | Excluded from M2 build | **Hosting:** static site has no backend to store or share scores across players. **Browser API:** no cross-origin shared storage without a server; Genex `submitScore`/`getLeaderboard` require embed/auth + network, not validated in local test mode. To allow: integrate the Genex leaderboard in embedded mode or deploy a backend, and drop the offline-only constraint. |
| Progression | Built (M2) | Local unlocks: best score/time, 12 unlock tokens granting starting parts (never raw power). |
| Mods | Excluded from M2 build | **Browser API:** no sandboxed module loading or filesystem write in a static site without a user file pick. **Hosting:** no mod distribution endpoint. **Memory/budget:** unbounded mod content beyond 96 MB textures / 150 000 tris / 400-enemy cap. To allow: a mod manifest + sandboxed loader (worker/iframe), a hosting endpoint for mod packs, and raised memory/asset budgets. |

## Scope

- Slice (M0): movement, one gun (spray), one enemy, death and restart.
- M2 build: 3-arena campaign, 8-beat ladder + overtime, 7 enemy types (+ Gunship boss),
  3 weapon families (12 styles), 8 cards, full menus and audio. See `BUILD.md` §1.
- In this release: 12 styles, swap + reload, airdrops, 8 beats with Blackout, 7 enemy types,
  Gunship boss, overtime, local meta unlocks, local leaderboards, progression.
- Not in this release (by design, not capabilities): classes, procedural maps, realistic ballistics
  sim, licensed names/models, paid/downloaded art, runtime network calls, mobile-specific layout,
  bundler or framework.
- Excluded by measured technical limit (see Capabilities): co-op play, shareable leaderboards, mods.
  If a limit disappears, the feature returns to the board.

## Campaign — 3 arenas, 8 beats, then overtime

Three arenas, eight beats, then overtime. Airdrop every 90 s.

| Arena | Beats (range) | Time window | Signature moment | Unlock rule |
|---|---|---|---|---|
| **1 · Perimeter** | 1 Contact, 2 Suppression, 3 Breach | 0:00–2:30 | First airdrop + first elite (the sapper charge) | Clear beat 3 (Breach) to open Breach Yard |
| **2 · Breach Yard** | 4 Blackout, 5 Counter-attack, 6 Blackout II | 2:30–8:00 | The lights die twice (Blackout I & II) | Clear beat 6 (Blackout II) to open Gunship Pad |
| **3 · Gunship Pad** | 7 Siege, 8 Gunship, Overtime | 8:00–12:00+ | Mechs, then the Gunship (boss) | Defeat the Gunship (beat 8) to complete the campaign; overtime optional |

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

Enemy roster (seven types + boss):

| Enemy | Role | HP@1 | Speed | Behaviour |
|---|---|---|---|---|
| Rifleman | fodder | 14 | 58 | advances, fires bursts at 200 px |
| Sapper | breacher | 18 | 92 | sprints, plants a charge, 2 s fuse |
| Shieldbearer | wall | 60 | 34 | frontal shield — flank or rear only |
| Spotter | support | 22 | 46 | paints you; enemies gain +15 % accuracy |
| Drone | harasser | 16 | 120 | orbits, dives, explodes |
| Mortar team | artillery | 34 | 20 | lobs shells at a marked circle |
| Mech | elite | 260 | 40 | walks through cover, minigun + stomp |
| Gunship | boss | 2 600 | — | strafes, drops mines, enrages at 30 % |

Each arena is a data file (`assets/levels/arena1.json` … `arena3.json`): bounds, cover, player spawn,
enemy spawn points, chokepoints and the beat timing hooks. A fourth arena must be a data file, not a
code change.

## References (comparison only — no assets copied)

| # | Reference | Link | What to learn | What not to copy |
|---|---|---|---|---|
| 1 | Azeroth Survivors (browser) | https://azerothsurvivors.io/ | Survivors arc shape: 3-choice cards, escalating waves, browser-native run, HUD density (pillars 2, 3) | WoW IP/art, class fantasies, WebGPU engine; our identity is the military armory |
| 2 | Vampire Survivors | https://store.steampowered.com/app/1794680/Vampire_Survivors/ | One-button simplicity, power-fantasy ramp, enemy density, readable silhouettes (pillars 1, 3) | Gothic art, exact weapon roster, UI layout |
| 3 | Brotato | https://store.steampowered.com/app/1942280/Brotato/ | Weapon-slot identity, wave timer, multi-slot loadout, build expression (pillar 2) | Cute art style, stat-stacking meta, economy |
| 4 | Enter the Gungeon | https://store.steampowered.com/app/311690/Enter_the_Gungeon/ | Gun feel, tracer language, weapon identity, reload cadence (pillar 1) | Roguelike dungeon structure, licensed-style guns |
| 5 | Nuclear Throne | https://store.steampowered.com/app/242680/Nuclear_Throne/ | Top-down shooter feedback, build-choice mutations, enemy telegraphs (pillars 1, 3) | Pixel art, mutation system, exact enemies |

Rule: references are for comparison and feel only. No art, audio, code, names or mechanics are copied; all Forge Smoke assets are original or locally generated.

## Documents

- `docs/DESIGN-FULL.md` — the complete design, end to end (build contract)
- `docs/ENGINEERING-PAPER.md` — how Forge produces it, with evidence and budgets
- `GDD.md` — the working systems spec the task graph reads

## Success test

A stranger plays three runs without instruction, improves by run three, names the two guns they used
and why they swapped — and holds ≥55 fps at 1280×720 through a Blackout.

## Playtest — QA-03 (2026-10-27)

**Scope:** First-time-player test on M0 slice only (M1 content not implemented). Player: simulated
new player, no prior exposure. Platform: Chrome 128 headed, 1280×720, low preset.

### Session log

| Run | Time | Outcome | Notes |
|---|---|---|---|
| 1 | 42 s | Death | Learned WASD move, auto-fire, R reload. No swap, no aim mode, no cards. |
| 2 | 58 s | Death | Improved positioning, managed mag better. Still only one gun, one enemy type. |
| 3 | 71 s | Death | Comfortable with loop; asked "when do I get the other gun?" "is there more?" |

**Performance:** 59–60 fps sustained, p95 17 ms, 1 draw call, 2 triangles, 42 MB textures — all budgets PASS.

### Pillar drift log

| Pillar | Test (from GAME.md) | M0 Slice Reality | Drift severity | Evidence |
|---|---|---|---|---|
| 1. Every gun feels different | Spray SMG vs Pierce marksman feel different within 1 s | Only Spray SMG exists. Pierce + 10 other styles not implemented. | **Critical** — pillar untestable | DT-14, DT-15 PENDING (QA.md) |
| 2. The build is the story | Player names loadout and why they swapped; swap mid-wave preserves other reload | No second weapon, no swap (Q), no level-up cards (1/2/3), no parts, no airdrops, no evolutions. | **Critical** — pillar absent | DT-10, DT-11, DT-13, DT-16 PENDING |
| 3. Pressure, not chaos | Waves have named beats; Blackout 8 s with hostile optics + muzzle flash lighting | No beat director, no named beats, no Blackout, no wave variety (single enemy, continuous spawn). | **Critical** — pillar absent | DT-17 PENDING; Blackout M2+ |

### Player quotes (simulated)

- "The shooting feels good but it's the same thing over and over."
- "I keep waiting for a crate or an upgrade. When does the game open up?"
- "Is this it? Just the one gun?"

### Verdict

**M0 slice is a competent movement/shooting prototype but fails all three pillar tests.** The game's
identity (12 styles, build-as-story, beat-structured pressure) lives entirely in M1–M5 content that
is not yet implemented. A first-time player cannot experience the core fantasy.

**Blocker for QA-03 acceptance:** M1 content batch (PRODUCTION-01 scope) must be implemented before
a meaningful playtest can occur. Current slice validates tech/performance only, not design.

### Decisions required

1. **M1 implementation priority:** PRODUCTION-01 scope (two weapons + swap, reload variants, level-up cards, Pierce + Cone, airdrop, beats 1-2, scoring, results) is the minimum viable playtest build. No further QA tasks (QA-01 M1 rows, QA-03 meaningful playtest) can pass without it.
2. **Scope cut if M1 slips:** If M1 cannot land, ship a 4-beat version (Contact, Suppression, Breach, Blackout) as v1 per R15 fallback - but this requires a DECISIONS.md entry and plan rewrite.
3. **Playtest reschedule:** QA-03 cannot be marked complete until M1 content is playable. This task records the finding; the actual playtest gate moves to post-M1.

### Visual review — M0 slice vs commercial browser game baseline (2026-10-27)

**Reference baseline:** *Azeroth Survivors* (browser-native, WebGL, 1280×720 low preset) — clean in-canvas HUD, readable silhouettes, additive muzzle flash, pooled tracers, no DOM overlays.

| Area | M0 Slice State | Commercial Baseline | Gap | Priority |
|---|---|---|---|---|
| **Lighting** | Hemisphere + directional sun only; shadows on (starter), no floodlights; Blackout not implemented | Zone floodlights as primary light; muzzle flash brightest; Blackout = lights out, hostile optics + muzzle flash only | No floodlights, no Blackout light-state, muzzle flash not dominant | **High** — Blackout is pillar 3 signature |
| **Particles/VFX** | 420 rain lines (1 draw call), 18 pooled tracers (dashes), sphere muzzle flash, tree sway | Layered VFX: casings, impact sparks, heat shimmer, ground scorch, screen shake (rail/boss), all pooled ≤400 | No casings, no hit sparks, no heat visual, no screen shake, no ground decals | **Medium** — feel pass (PRODUCTION-02) specifies these for M1 styles |
| **UI Hierarchy** | In-canvas HUD only (studio), vitals panel top-left, hint bottom-left, title/dead centred; `hud.overlaps: []`; text ≥12 px; green deploy prompt only affordance | Same: in-canvas, stencil sans, amber on charcoal, health thresholds 60/30, beat name + timer top-center, airdrop countdown, weapon plate | Missing: beat name/timer, airdrop countdown, weapon name plate, score display, multiplier | **High** — M1 scope adds beat director + airdrop + scoring |
| **Game Feel** | Spray SMG only: auto-fire, 0.125 s cycle, tracer dashes `#ffd57a`, muzzle flash sphere 0.24, recoil none, reload 1.2 s timer bar | Distinct per-style: tracer shape/colour/sound, muzzle flash size/colour, recoil kick per family, hit pause + flash + linger, reload animation phases, weighted swap (0.15 s dip), card pick juiciness, airdrop telegraph (parachute 2.5 s + lid pop) | Only 1 of 12 styles; no recoil, no hit pause, no reload animation, no swap, no cards, no airdrop telegraph | **Critical** — pillar 1 untestable without 3+ styles + feel spec |

**Verdict:** M0 slice is a clean technical prototype (60 fps, 1 draw call, no overlaps) but visually and kinesthetically it is a grey-box. The commercial baseline has *atmosphere* (floodlights, rain interaction, muzzle dominance) and *identity per action* (every shot feels authored). M1 feel pass (PRODUCTION-02) closes the feel gap for Spray/Pierce/Cone; lighting/Blackout gap closes at M2+ with floodlights and light-state switch.

**No implementation changes made** — review only. Visual/feel improvements are scoped to PRODUCTION-02 (feel) and M2+ (lighting/Blackout) per existing plan.
