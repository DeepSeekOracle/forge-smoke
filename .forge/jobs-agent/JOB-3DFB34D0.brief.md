FORGE WORKER JOB JOB-3DFB34D0
Skill: forge-worker
Project: forge-smoke
Project path: C:\Users\justi\AI Games\forge-smoke
Task id: ART-01
Priority: high | Risk: low
Title: ART-01 - 6 new card art plates
Depends on: DBG-06

READ FIRST in the project: AGENTS.md, then .forge/STATE.md (known-broken list), then .forge/VERIFY.md (the only accepted evidence format). Follow AGENTS.md exactly: work only in this folder, never touch D:/excavationpro-ca, never change the save schema destructively, bump every module ?v= together with index.html, add no runtime network calls, use only CC0/CC-BY/MIT art and record the licence in docs/ASSETS-SOURCES.md.

**Goal:** raise the visual quality of the game with original, licence-clean art. No scraped packs.

## What to produce

| Asset | Spec | Where it goes |
|---|---|---|
| Card art, 6 new plates | 768×512 JPEG, dark military, one per effect family: pierce, chain, spinup, ricochet, drone, armour | `assets/cards/` |
| Zone markers | 512×512 PNG with alpha, a painted ring/stencil (military survey marker) | `assets/zones/` |
| Weapon silhouettes | 512×256 PNG alpha, one per style, side-on, consistent lighting | `assets/icons/` |
| Enemy portrait set | 256×256, 5 archetypes (rifleman, sapper, shield, drone, gunship) | `assets/portraits/enemies/` |
| Boss plate | 1200×630, the BrainStem class threat, usable as an OG image | `assets/og-boss.jpg` |
| Start screen stills | 1536×864, 2 variants for the fallback poster | `assets/start-still-*.jpg` |

## Rules

- 60–200 KB per file. JPEG for no-alpha, PNG only where alpha is needed.
- Consistent palette with the game: gunmetal `#101822`, amber `#FFB347`, cyan `#6FE3FF`, hostile `#F2545B`.
- **No text baked into art** (text is UI, and it will clash with the HUD).
- Record licence + source in `docs/ASSETS-SOURCES.md` for anything downloaded. Generated art: note
  "generated locally with Qwen-Image 2.1" and the prompt.

## Generation tool

`tools\generate_image.ps1` (workspace root) — Qwen-Image 2.1, 20 steps. 768×512 takes ~70–100 s.
Save straight into the target folder, then convert to JPEG with PIL at quality 88.

## Acceptance

1. Every listed file exists at the stated size (report `Get-ChildItem` output with dimensions).
2. `cardsui.js` picks up the new card plates: force a card drop per `.forge/VERIFY.md` §4 and screenshot
   a tray containing at least one new image.
3. Boot test passes, 0 errors (`.forge/VERIFY.md` §1).
4. No file over 250 KB; total added payload under 6 MB.

FILES EXPECTED TO CHANGE:
  - assets/cards/

ACCEPTANCE - paste the command output for each line:
  - 6 new 768x512 JPEGs
  - one visible in a forced card drop
  - licences recorded

REPORT SHAPE (required):
TASK ART-01 - 6 new card art plates
Changed: <files>
Evidence: <command> -> <output>
Screenshot: <path or n/a>
Not verified: <list>
Broke / left open: <list>
