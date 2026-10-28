# BRIEF: Better weapons

**Goal:** a weapon roster with real trade-offs, including a proper answer to shields and to aircraft.

## Current roster

12 styles in `src/weapons.js`: spray, cone, pierce, ricochet, burst, beam, chain, spinup, rail, flamer,
arc (grenade), sentry. Cards grant weapons mid-run.

## Additions required

| New weapon | Style key | Role | Must feel like |
|---|---|---|---|
| **AA FLAK** | `flak` | anti-air only: high damage vs airborne, weak vs ground | burst of airburst puffs at altitude |
| **BREACHER** | `breach` | close-range shotgun, +pierce vs shields | heavy, slow, screen-heavy |
| **RAILGUN** variant | `rail2` | slow, huge single shot, punches through 3 enemies | charge whine + white lance |

Balance rules:
- Every weapon needs one clear weakness. Write it in `models.js` description.
- The shield counter must stay: ordinary fire does nothing to a shieldbearer from the front.
- Nothing may out-damage the boss math in `03-engine-math.md` targets; report TTK per weapon.

## Card wiring

Each new weapon needs a card entry so it can be offered, with a distinct `STYLE_VFX` row (colour, tracer
width, flash scale, sound, pitch, kind). Weapon cards must be rarest (`weight: 0.6`) and never offered
twice in a row.

## Acceptance

1. Print the roster: `id, name, style, dps, ttk_rifleman, ttk_shield, ttk_air`, before and after.
2. Screenshot each new weapon firing.
3. Confirm via hook `getWeapons().hasExplosiveMod` behaviour is unchanged when picking a weapon card
   (weapons must not silently grant explosive).
4. Boot test passes.
