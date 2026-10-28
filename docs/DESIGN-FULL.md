# FORGE SMOKE — full design (end to end)

**Working title:** FORGE SMOKE · **Theme:** military · **Hook:** the guns
**Profile:** web-2d · Genex studio harness (Three.js, `window.__studio`, in-canvas HUD)
**Reference shape:** *Azeroth Survivors* — survivors-like arc, 3-choice level-ups, endless waves,
browser. We take the **arc**; our identity is the **armory**.

---

## 1. One-page pitch

A top-down military survival shooter where **the guns are the game**. You carry two weapons, each
with its own firing language — spray, cone, pierce, ricochet, arc, beam, chain — and every level-up
hands you a part that changes *how one of them shoots*. Hold the perimeter through eight escalating
assaults; every 90 seconds a crate airdrops with a new weapon or a part; the run ends when the
perimeter does.

**Pillars**

1. **Every gun feels different in the hand.** Twelve firing styles, no two sharing a rhythm, a sound
   or a tracer colour. A weapon that can be swapped for another without changing how you move is not
   finished.
2. **The build is the story.** A run is remembered by its loadout: “ricochet SMG + arc shotgun, pierce
   on the marksman.” Attachments compose behaviour; they do not stack percentages.
3. **Pressure, not chaos.** Waves have shape: contact, suppression, breach, blackout, counter-attack,
   siege, gunship. The player always has a next move — swap, reload, reposition, ability.

**Platform:** desktop browser, keyboard + mouse. 60 fps at 1080p; ≥55 fps at 1280×720 on integrated
graphics. No network at runtime.

---

## 2. Player fantasy and tone

*“You are the armory’s last operator, and the armory is winning.”*

Tone: steel, cordite, radio chatter, floodlights. Not horror; **competence under pressure**. The
screen is dark and the guns are loud — muzzle flash is the primary light source.

---

## 3. Controls

| Input | Action |
|---|---|
| WASD | move (8-way, no mouse-look) |
| Left mouse / auto | fire — weapons auto-target the nearest threat in a 120° facing arc |
| Right mouse | **aim mode** — 0.6 s, tightens spread 50 %, slows movement 25 % |
| R | reload (per weapon, 1.1–2.4 s by family) |
| Q | swap primary / secondary |
| Space | **ability** (frag, smoke or sentry — one per run, chosen at start) |
| 1 / 2 / 3 | pick upgrade card |
| Esc | pause |

Auto-aim is a contract: the player aims *by positioning*, never by pointer precision. Aim mode is the
skill expression — it trades mobility for reach.

---

## 4. The armory — twelve firing styles

Every weapon is a **style**, not a stat block. Styles are the content.

| # | Style | Behaviour | Signature weapon |
|---|---|---|---|
| 1 | **Spray** | wide cone, high rate, low damage, bloom | Compact SMG |
| 2 | **Cone** | 8 pellets, falloff at 240 px, huge close burst | Breacher shotgun |
| 3 | **Pierce** | single heavy round, passes through 3 bodies | Marksman rifle |
| 4 | **Ricochet** | bounces off arena walls, 2 bounces, +40 % after first | Carbine |
| 5 | **Arc** | lobbed grenade, 0.9 s fuse, 120 px splash | Thumper |
| 6 | **Beam** | continuous 0.4 s tick, no ammo but heat, pierces shields | Laser cutter |
| 7 | **Chain** | hits jump to 3 targets within 140 px, −25 % per jump | Arc emitter |
| 8 | **Burst** | 3-round burst, tight grouping, long reload | Battle rifle |
| 9 | **Spin-up** | 0.8 s ramp to max rate, movement −20 % while firing | Minigun |
| 10 | **Rail** | 1.2 s charge, a line that hits everything, screen shake | Railgun |
| 11 | **Flamer** | short cone, damage over time, ignites ground | Flamethrower |
| 12 | **Sentry** | deploys a turret that fires independently for 12 s | Drone launcher |

**Slots:** primary + secondary. Each weapon has style, damage, rate, magazine, reload, heat cap,
falloff, projectile speed, tracer colour, recoil kick and one **signature trait** (e.g. the ricochet
carbine gains +1 bounce at rank 3).

**Heat:** sustained styles (beam, minigun, flamer) build heat instead of consuming ammo; at 100 the
weapon locks for 2.4 s. Heat is a barrel glow, not a bar.

---

## 5. Attachments — the 3-choice card pool

Level-ups deal three **parts**, bound to a weapon family or a global slot:

| Slot | Examples | Effect shape |
|---|---|---|
| Barrel | long barrel, choke, suppressor, muzzle brake | range / spread / sound (suppressed pulls fewer enemies) |
| Magazine | drum, fast mag, AP rounds, incendiary | capacity / reload / penetration / burn |
| Optic | red dot, 4×, thermal | aim-mode tightening, reveals cloaked enemies |
| Underbarrel | foregrip, bipod, grenade tube | recoil, stationary accuracy, secondary grenade |
| Receiver | binary trigger, overclock, stabiliser | rate, heat, burst count |
| Plate | ceramic, spall liner, medkit rig | armour, bleed-through, heal on kill |

**Composition rule:** a part changes **behaviour**, never just a number. “AP rounds” lets pierce
weapons pass through one more body; “binary trigger” turns a burst weapon into a 6-round burst at
double heat.

**Evolutions** (two parts in a family + a style partner):
`Ricochet 3 + AP rounds` → **“Bank Shot”** — ricochets seek the next target.
`Beam 3 + Overclock` → **“Cutting Torch”** — the beam sweeps with your movement.
`Flamer 3 + Incendiary` → **“Firebreak”** — burning ground spreads between enemies.

---

## 6. The assault — endless arc

12 minutes, eight beats, then overtime.

| Beat | Time | Director | Player feeling |
|---|---|---|---|
| 1 Contact | 0:00–0:45 | rifleman pairs, slow approach | “sight in” |
| 2 Suppression | 0:45–1:30 | first airdrop, spray enemies | “I have options” |
| 3 Breach | 1:30–2:30 | sappers open the perimeter, first elite | “they’re inside” |
| 4 **Blackout** | 2:30 | lights die, muzzle flash is the only light, 8 s | “I can’t see — but neither can they” |
| 5 Counter-attack | 3:30–6:00 | shields + artillery, second airdrop | “I need the right gun” |
| 6 **Blackout II** | 6:00 | two floodlights, horde from both flanks | “pick a lane” |
| 7 Siege | 8:00–11:00 | mechs, spawn ×2.2, ground fire | “hold the line” |
| 8 **Gunship** | 11:00–12:00 | boss: strafing gunship | “this is the run” |
| Overtime | 12:00+ | density scales, score multiplier climbs | “one more crate” |

**Blackout** is the signature beat: the arena goes dark, enemies show red optics, and every shot
lights the room for 0.2 s. The guns *are* the lighting.

**Airdrops:** every 90 s a crate lands; the player picks one of two weapons/parts. This is how the
loadout evolves inside twelve minutes.

**Difficulty:** hp `× (1 + 0.18t)`, speed `× (1 + 0.05t)` capped 1.45, spawn budget `8 + 3.2t`,
elite chance `min(0.35, 0.06t)`.

---

## 7. Enemy roster (military)

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

---

## 8. Scoring

```
score = (kills × 12 + damage × 0.12 + seconds × 6) × multiplier
multiplier = 1 + 0.1 × blackouts_survived + 0.08 × evolutions + 0.05 × airdrops_taken
```

Results break it down — the player must see why the number moved.

---

## 9. Art direction

- **Palette:** gunmetal `#20242b`, concrete `#3a3f47`, olive `#4b5340`, hazard amber `#ffb347`,
  tracer cyan `#6fe3ff`, hostile red `#ff4d4d`. Muzzle flash is the brightest thing on screen.
- **Silhouettes:** every weapon reads at 48 px (stock, barrel, magazine); every enemy at 32 px
  (helmet, shield, rotor).
- **Tracer language:** spray = short dashes, pierce = single bright rod, ricochet = rebounding sparks,
  beam = held line, chain = forked arcs, rail = white-out.
- **Lighting:** dark arena, one floodlight per zone; in Blackout only muzzle flashes and hostile optics.
- **UI:** stencil type, amber on charcoal, magazine count, weapon name plate, heat as barrel glow.

---

## 10. Audio

| Layer | Notes |
|---|---|
| Gun report | one per style, 3 pitch variants each; suppressed variants for stealth builds |
| Casings | metallic ticks, pooled, 6 concurrent max |
| Reload | mechanical, distinct per family (mag slap, bolt, belt) |
| Radio | 6 barks: “Contact.” “Sapper on the wire.” “Airdrop inbound.” “Gunship!” |
| Music | 92 BPM industrial, layers per beat, ducks 6 dB on Blackout |
| Master | −14 LUFS, SFX never above −6 dBFS |

---

## 11. UX flows

Boot → title (best score) → loadout (choose ability) → run → level-up cards → death → results →
restart. HUD: ammo per weapon, heat glow, armour, beat name, score, airdrop timer.

Accessibility: reduced motion (no camera shake), colour-blind tracers (shape-coded), remappable keys,
no flashing above 3 Hz.

---

## 12. Technical shape (Genex studio contract)

- The starter is a Genex studio project: Three.js, `window.__studio`, HUD in the canvas, one input
  path, deterministic `rng`/`dt`, `config.begin`/`config.flow`. Build **inside** it.
- Top-down 3/4 camera, fixed; no orbit. Blackout is a light-state switch, not a shader rewrite.
- Fixed 60 Hz sim from `dt`; delta clamp 100 ms; interpolation for render.
- Budget: 400 enemies (instanced), 800 projectiles, 400 particles, pooled; spatial hash 3 m cells.
- One shared material per enemy class; weapons are simple primitives with a style tag.
- Generated art: floor plate, weapon icons (48 px), enemy silhouettes, muzzle-flash atlas.
- Save: `localStorage["forge-smoke/v1"]` = `{best, bestTime, unlocks[], settings}`.

---

## 13. Milestones

| M | Deliverable | Acceptance |
|---|---|---|
| M0 | movement, one gun (spray), one enemy, death | 60 s playable, 60 fps, zero console errors |
| M1 | two weapons + swap, reload, level-up cards | a run can be described by its loadout |
| M2 | 12 styles, airdrops, 8 beats, Blackout | 12-minute run with named beats |
| M3 | enemy roster, shields/flanks, artillery telegraphs | no unfair death in 20 runs |
| M4 | Gunship boss + overtime | boss reachable by a good player |
| M5 | polish, accessibility, results, meta unlocks | 3 strangers improve by run 3 |

---

## 14. Tuning starting table

```
player hp 100 · armour 0 · speed 190 px/s · reload 1.1–2.4 s
spray    6 dmg × 8/s, spread 9°, range 320
cone     7 × 8 pellets, 240 px falloff
pierce   34 dmg, 3 bodies, 0.55 s cycle
ricochet 16 dmg, 2 bounces, +40 % after first
arc      28 splash, 120 px, 0.9 s fuse
beam     9 dps tick, heat 18/s, locks at 100
chain    12 dmg, 3 jumps, −25 %/jump
burst    3 × 11 dmg, 0.12 s spacing
spin-up  ramp 0.8 s to 10/s, movement −20 %
rail     120 dmg, charge 1.2 s, pierces all
flamer   7 dps + burn 3/s for 3 s
sentry   12 s, 8 dmg/s, 220 px range
spawn budget 8 + 3.2t · elite 0.06t (cap .35) · airdrop every 90 s
```

All values live in `src/tuning.js`.

---

## 15. Non-goals and risks

**Non-goals:** multiplayer, accounts, monetisation, realistic ballistics simulation, licensed weapon
names or models, mobile layout, mod support.

**Risks**

| Risk | Mitigation |
|---|---|
| Twelve styles feel samey | each owns a tracer, a sound and a rhythm; a style that does not change movement is rejected |
| Auto-aim removes skill | aim mode trades mobility for reach; positioning is the skill |
| Blackout frustrates | 8 s only, hostile optics always visible, muzzle flash lights the room |
| Gun art is expensive | primitives + generated icons; no photoreal weapons, no licensed models |
| Performance with 12 styles | shared materials, pooled projectiles, one draw-call family per style |

---

## 16. Success test

A stranger plays three runs without instruction, improves by run three, can name the two guns they
used and why they swapped — and the page holds ≥55 fps at 1280×720 through a Blackout.
