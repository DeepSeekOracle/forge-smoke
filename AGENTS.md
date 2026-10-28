# AGENTS.md — Forge Smoke (free-agent rules)

You are working in **`C:\Users\justi\AI Games\forge-smoke`**, a browser game (three.js, ESM, DOM overlays).
A live copy exists at `D:\excavationpro-ca\games\forgesmoke` and deploys to
`https://excavationpro.ca/games/forgesmoke/`. **Do not deploy.** You work; the steward ships.

## The one rule that matters

**Never push, never deploy, never touch `D:\excavationpro-ca`.** Work only in this repo. Commit locally
if you must, on a branch named `agent/<your-task-id>`. The steward reviews and ships.

## Hard constraints

1. **Do not change the save schema destructively.** `src/save.js` v2 fields
   (`level, xp, talents[], talentPoints, attrPoints, attrs{}, trials` removed, `name, legacy, equipped`)
   are live player data. Add fields with defaults; never rename or drop one without a migration.
2. **Bump versions when you touch a module.** `main.js` imports carry `?v=YYYYMMDDx`. If you edit a
   module, bump that query in `main.js` **and** `index.html`'s `main.js?v=` to the same new value, or
   browsers serve a stale mix and the game dies mid-run. This has broken the live game repeatedly.
3. **No new network calls at runtime** from the game unless the brief asks. No analytics, no fonts, no
   CDN. Vendored three.js only.
4. **No paid assets, no scraped art.** Anything you add must be CC0 / CC-BY / MIT with the licence
   recorded in `docs/ASSETS-SOURCES.md`. If you cannot establish a licence, do not use it.
5. **Do not delete features** to make a test pass. If something must go, say so in your report and
   leave the code intact but disabled behind a flag.
6. **Images/audio you generate:** put them in `assets/<theme>/`, keep files under ~200 KB each where
   possible (the start backdrop GIF is the known exception at 8.46 MB).

## How to work

- Read `.forge/STATE.md` for what exists and what is known-broken.
- Read your brief in `.forge-briefs/`. It contains the goal, the files, and the acceptance test.
- Verify with `.forge/VERIFY.md`. **A passing assertion is the only evidence that counts.**
- Report in this shape: **what changed → the command you ran and its output → what you did NOT verify →
  anything you broke or left half-done.**

## Environment facts

| Thing | Value |
|---|---|
| Preview server | `http://127.0.0.1:8796/preview/forge-smoke/` (serves this folder, `no-store`) |
| Node modules for tests | `$env:NODE_PATH='C:\Users\justi\source\LYGOapps\node_modules'` |
| Python | `C:\Python313\python.exe` (not `python3`) |
| Shell | PowerShell 7 (`pwsh`), quote paths with spaces |
| Test hooks | `window.__forgeSmokeTest` — see `.forge/STATE.md` §Hooks |
| Model/voice/video tools | `D:\LYGO_MEDIA\` (piper at `tools\piper\piper.exe`, voices in `models\voices`) |

## What "done" means

A task is done when: the acceptance test in its brief passes **on the preview server**, the game still
boots to the start menu, a 60-second autonomous run completes without a page error, and your report
states what you did not verify. Not before.
