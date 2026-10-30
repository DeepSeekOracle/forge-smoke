# Imported assets and their licences

Downloaded from open repositories, not scraped from asset-store pages. Every file below has a licence
that permits commercial use; attribution is recorded here because it is owed.

| File | Source | Licence | Used for |
|---|---|---|---|
| `assets/imported/Fox.glb` | [KhronosGroup/glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) — `Models/Fox` | **CC0 1.0** | animated creature model (available for a future enemy/boss) |
| `assets/imported/BrainStem.glb` | same repo — `Models/BrainStem` | **CC BY 4.0** | animated robot; `assets/brain-stem.glb` (already shipped) derives from this asset — **attribution required** |
| `assets/imported/spark1.png` | [mrdoob/three.js](https://github.com/mrdoob/three.js) — `examples/textures/sprites` | MIT (repo) | impact / muzzle spark sprite |
| `assets/start-bg.mp4` / `.gif` / `-poster.jpg` | supplied by the operator | operator-owned | start screen backdrop |

## Attribution text to carry if BrainStem is used

> "BrainStem" by the Khronos Group glTF Sample Assets, licensed CC BY 4.0.


## Kenney city kits — level geometry (2026-10-30)

Downloaded from kenney.nl through the site's own download flow ("Continue without donating"). Kenney
releases these kits as **CC0 1.0** (public domain); attribution is not required but is recorded here.

| Kit | Files vendored | Licence | Used for |
|---|---|---|---|
| [City Kit (Industrial) 2.0](https://kenney.nl/assets/city-kit-industrial) | `assets/ki/` — 10 building models, water tower, chimney, tank, 2 shipping containers + `Textures/colormap.png` | **CC0 1.0** (`assets/ki/LICENSE.txt`) | DEPOT warehouses/landmarks, FOUNDRY sheds |
| [City Kit (Commercial) 2.1](https://kenney.nl/assets/city-kit-commercial) | `assets/kc/` — 10 building models, 4 low-detail buildings + colormap | **CC0 1.0** (`assets/kc/LICENSE.txt`) | TOWN street frontage + distant skyline |
| [City Kit (Roads)](https://kenney.nl/assets/city-kit-roads) | `assets/kr/` — dumpster, construction light, barrier, fence, power poles + colormap | **CC0 1.0** (`assets/kr/LICENSE.txt`) | street clutter |

Native kit scale is ~0.5 m per unit; `KENNEY_SIZE` in `src/models.js` records each model's measured
footprint and every placement is scaled to a target height, so colliders and the nav grid are built
from the same numbers the renderer uses.

The note above ("Kenney could not be downloaded") was true when it was written: the files are behind
a JavaScript download modal. A browser session with downloads enabled gets through it.

## Notes

- Kenney.nl and several asset-store pages were tried first and could not be downloaded (hashed paths,
  no direct file URLs), which is why this list is GitHub-sourced.
- Poly Haven's API is the next stop for CC0 environment textures/HDRI if the maps need them.

## Card plates (brief 01) — generated locally, no download

cardsui.js draws six effect-family plates at runtime on a 768x512 canvas: pierce, chain, spinup,
ricochet, drone, armour. Original work, project-owned, no text baked in, ~40 KB as JPEG data URLs at
load (not shipped as files).

Qwen-Image 2.1 was attempted first via 	ools/generate_image.ps1 at 768x512, but on this 8 GB card the
diffusion model fails to allocate its backend buffer (ggml_backend_cpu_buffer_type_alloc_buffer:
failed to allocate 4003 MB), so the pipeline is procedural until a larger card or smaller quant is
available.

## Enemy portraits + weapon silhouettes (brief 01) — generated locally

	ools/make_brief_assets.py renders five 256x256 enemy portraits (ssets/portraits/enemies/) and
fifteen 512x256 weapon silhouettes (ssets/icons/styles/) with Pillow, from one palette (gunmetal,
amber, cyan, hostile red), no baked text, alpha only where the brief asks. Original work, project-owned.
	ools/asset_check.py fails the gate if any of them drift from the stated size.

Qwen-Image remains unusable for these on the 8 GB card (same allocation failure as the card plates).
