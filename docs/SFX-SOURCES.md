# Forge Smoke — audio provenance

Every sound the game plays, where it came from, and what its licence is. Anything whose licence could
not be established was **removed**, not guessed at.

## The bank

All ten samples come from the **LYGO Soundboard FX bank** in this repository
(`talk-radio/sfx/`), which documents each file on its own credits page
(`talk-radio/sfx/credits.html`, 878 rows). That page states its position plainly:

> "The board does not ask you to take a badge's word for it. Every sound below lists its duration, the licence it carries and, where it was not rendered here, a link to the page it came from. Three sources only: Kenney.nl and …"
>
> "CC0 and public-domain material may be reused commercially without attribution; the attribution is here anyway because a claim nobody can check is not a licence."

Licence distribution across those 878 rows: **740 × CC0 1.0**, **59 × public domain**,
**64 × "Original — rendered for LYGO Soundboard"** (first-party). No row carries an
attribution-required (CC BY / CC BY-SA) or non-commercial term.

## File by file

| Game file | Bank source | What it is used for |
|---|---|---|
| `assets/sfx/fire.mp3` | `talk-radio/sfx/digital/laser1.mp3` | ballistic weapon shot |
| `assets/sfx/laser.mp3` | `talk-radio/sfx/digital/laser2.mp3` | light-gun shot (auto-selected for light weapons) |
| `assets/sfx/hit.mp3` | `talk-radio/sfx/scifi/impactmetal-000.mp3` | projectile hitting an enemy |
| `assets/sfx/kill.mp3` | `talk-radio/sfx/scifi/explosioncrunch-000.mp3` | enemy destroyed |
| `assets/sfx/reload.mp3` | `talk-radio/sfx/game/metalclick.mp3` | reload lever / magazine |
| `assets/sfx/click.mp3` | `talk-radio/sfx/ui/click-001.mp3` | card pick, UI confirm |
| `assets/sfx/hurt.mp3` | `talk-radio/sfx/foley/impactbell-heavy-000.mp3` | cyborg takes damage |
| `assets/sfx/launch.mp3` | `talk-radio/sfx/scifi/doorclose-000.mp3` | bay launch |
| `assets/sfx/levelup.mp3` | `talk-radio/sfx/alarms/correct-ding.mp3` | level gained at run end |
| `assets/sfx/death.mp3` | `talk-radio/sfx/scifi/explosioncrunch-002.mp3` | cyborg destroyed |

Each file is played through `src/audio.js`, which decodes it into an `AudioBuffer` once and then
re-triggers it with pitch and gain variation so repeated shots do not sound mechanical. If a file is
missing or still loading, the module's original **procedural synth** plays that key instead — silence
is never the failure mode.

## What was removed, and why

The first implementation reused nine `.wav` files from
`games/lattice-arena/assets/sfx/`. That folder carries **no per-file licence metadata** — it arrived in
a bulk mirror commit (`bc9c39fd`, "Mirror the LYGO games hub and all eighteen games") and its page has
no credits block. On a page running AdSense, an unverifiable licence is a real liability, so those
files were deleted from `assets/sfx/` and replaced with the CC0 bank above. Nothing else in the game
depends on them.

## If you replace a sound

1. Copy the file to `assets/sfx/` keeping its bank name meaning (fire / laser / hit / kill / …).
2. Check its row on `talk-radio/sfx/credits.html`. If it is not CC0, public domain or first-party,
   do not ship it.
3. Update this table in the same commit. A provenance file that drifts from the payload is worse than
   no provenance file.
4. Keep files short (≤ 1.5 s) and small (≤ 20 KB); the whole bank is 105 KB today.
