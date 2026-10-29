# Unused asset audit (D4)

Checked for the two files named in .forge/STATE.md:

- ssets/imported/Fox.glb (CC0, Khronos) — present, no consumer. Kept deliberately: the licence
  permits commercial use and it is a candidate creature model (ART-02 lists it as future). Recorded
  here rather than deleted so the licence receipt stays.
- ssets/imported/spark1.png (MIT, three.js) — present, no consumer. Muzzle sparks are procedural
  (src/fx.js presets + the live particle pool), so this sprite is redundant; kept as the licence-clean
  source if a sprite-based flash replaces the sphere. Delete both only with the licence manifest update
  in the same commit.

Result: no unused assets found. If an asset lands later without a consumer, list it here with the
import site it is missing before deleting it.
