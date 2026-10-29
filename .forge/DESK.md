# Forge Smoke — build desk

This folder is the job board for free agents. Read in this order:

1. **`../AGENTS.md`** — the rules. No deploys, no schema breaks, bump versions.
2. **`STATE.md`** — what exists, what is known-broken. Canonical over older docs.
3. **`VERIFY.md`** — how to prove your work. Copy the recipes; paste the output.
4. **`../.forge-briefs/`** — one brief per job. Take one, finish it, report, take another.

## How the steward runs this

- Free agents work **only** in `C:\Users\justi\AI Games\forge-smoke`, on branches `agent/<task-id>`.
- Nothing is deployed from here. The steward reviews diffs, runs `VERIFY.md` §1 himself, and ships to
  `D:\excavationpro-ca` + GitHub Pages.
- Saved copies and git history are the safety net: agents may break things, but they may not lose work.

## Job board

| Brief | Scope | Touch these files | Risk |
|---|---|---|---|
| `01-assets.md` | card art, zone markers, icons, portraits, boss plate | `assets/**` | low |
| `02-maps.md` | 3 arena layouts, cover placement, colliders | `src/maps.js` (new), `models.js` | med |
| `03-engine-math.md` | armour/shield/falloff/XP math, pure module + TTK table | `src/math.js` (new), `enemies.js` | med |
| `04-weapon-fx.md` | muzzle sprites, impacts, casings, shake | `src/fx.js`, `weapons.js`, `main.js` | med |
| `05-weapons.md` | flak, breacher, rail variant, balance table | `src/weapons.js`, `models.js` | med |
| `06-movement.md` | steering, separation, flanking, camera spring | `autopilot.js`, `enemies.js`, `main.js` | **high** |
| `07-tuning.md` | 20-run curve, difficulty and card pacing | `tuning.js`, `main.js` | **high** |
| `08-debug.md` | patch helper, error surface, regression suite | `tools/**`, `main.js` | low |
| `09-audio-ui.md` | ambience bed, impact mix, zone markers, mobile UI | `audio.js`, `main.js`, `css` | low |

**Start with 08 (debug)** — it gives everyone else a patch helper and a regression gate. Then 01 and 09
(low risk, visible). Movement and tuning last, because they can regress each other.

## Non-negotiable invariants (get these wrong and the work is rejected)

- Talent economy: 0 before 60 s, 1 after, 5 on clear, +1 boss. No new faucets.
- Shieldbearers: invincible from the front; explosives punch 55 %; grenades bypass.
- Talent tree keeps its disc shape, 8 keystones, mastery gating on notables.
- The start screen keeps the operator-supplied backdrop (GIF) and the build tag.
- Save schema is additive only.
- Every module import carries the same `?v=` as `index.html`'s `main.js`.

## Definition of done (all six)

1. Brief's acceptance test passes on the preview server, output pasted.
2. Boot test: `errorCount: 0`, 15 s of play.
3. Screenshot of anything visual, looked at.
4. No invariant above violated.
5. Report states what was **not** verified.
6. Branch committed locally with a message naming the task id.
