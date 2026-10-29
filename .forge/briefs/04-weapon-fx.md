# BRIEF: Weapon effects

**Goal:** every weapon should be identifiable by its *silhouette and impact*, not just its tracer colour.
The per-style table already exists (`src/weapons.js` → `STYLE_VFX`, 12 styles); this brief deepens it.

## What exists

`STYLE_VFX[style] = { color, tracer, flash, sound, pitch, kind }` and `kind` drives a special case
(`tracer | lance | beam | arc | flame | grenade`). Grenades throw a real lobbed charge with a blast ring.

## What to add

1. **Muzzle flash sprite** — `assets/imported/spark1.png` is downloaded and unused. Use it as an additive
   sprite at the muzzle, scaled/rotated per style, lifetime 60–90 ms. Keep the existing flash sphere for
   light, add the sprite for detail.
2. **Impact effects** — currently a hit only costs HP. Add, per `kind`:
   - `lance`: bright pin-point spark + 3 short rays
   - `beam`: molten splash, 2–4 droplets
   - `flame`: lingering ember cluster
   - `arc`: spark burst + small ring
   - `grenade`: existing ring **plus** dirt/smoke plume
3. **Shell casings** — one shared tiny mesh pool, ejected right-down for ballistic styles only.
4. **Screen kick** — per style `shake` value in `STYLE_VFX`; keep under 2 px at 1080p.
5. **Tracer taper** — long-lived tracer should fade in width along its length (vertex colours or opacity
   gradient) rather than a uniform bar.

## Constraints

- All FX pooled; no allocation per shot in the hot loop. Cap pools (e.g. 48 sprites, 24 casings).
- No new textures beyond the already-licensed `spark1.png` and generated plates.
- Must hold 60 fps at 1440×900 on swiftshader (report mean frame time).

## Acceptance

1. Screenshot per style firing (at least 6 styles) showing visibly different muzzle/impact.
2. The 12-style table printed with each style's distinct colour + kind (so it is auditable).
3. Boot test passes; mean frame time not worse than +2 ms versus your baseline measurement.
