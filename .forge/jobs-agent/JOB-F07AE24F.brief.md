FORGE WORKER JOB JOB-F07AE24F
Skill: forge-worker
Project: forge-smoke
Project path: C:\Users\justi\AI Games\forge-smoke
Task id: DBG-01
Priority: high | Risk: low
Title: DBG-01 - tools/patch.py assertive replace helper
Depends on: none

READ FIRST in the project: AGENTS.md, then .forge/STATE.md (known-broken list), then .forge/VERIFY.md (the only accepted evidence format). Follow AGENTS.md exactly: work only in this folder, never touch D:/excavationpro-ca, never change the save schema destructively, bump every module ?v= together with index.html, add no runtime network calls, use only CC0/CC-BY/MIT art and record the licence in docs/ASSETS-SOURCES.md.

**Goal:** close the defects listed in `.forge/STATE.md` §Known-broken, and make new ones loud instead of
silent. Work items in priority order.

## D1 — Silent no-op patches (process defect, highest priority)
Twice this project shipped a "fix" that changed nothing because a string replace found no anchor.
**Deliverable:** `tools/patch.py` — a replace helper that requires an exact anchor, asserts the result
differs, and fails loudly:
```python
def patch(path, old, new, count=1):
    s = open(path, encoding="utf-8").read()
    assert old in s, f"ANCHOR NOT FOUND in {path}"
    out = s.replace(old, new, count)
    assert out != s and new in out, "REPLACE DID NOT APPLY"
    open(path, "w", encoding="utf-8", newline="").write(out)
```
Then convert the last dozen risky edits to use it. Documents its use in `.forge/VERIFY.md` §0.

## D2 — Error surface
Add a global `window.onerror` / `unhandledrejection` handler that renders a small red strip with the
message + module version and keeps the game loop alive where possible. Today one undefined variable
black-screens the whole page.

## D3 — Stale module mismatch
`main.js` imports every module with `?v=`. Add `tools/bump.py` that bumps **all** imports and
`index.html` together, and a boot assertion that logs `BUILD <letter>` and warns in the console if the
loaded `main.js` version differs from `document.currentScript`.

## D4 — Known defects to close
1. `Fox.glb` / `spark1.png` unused → wire or delete with a note.
2. Gunship never fires from altitude (check attack range/gating).
3. Zone holds are cosmetic → either give them meaning or label them "movement only".
4. `docs/MANAGER.md` / `TASKS.json` stale → regenerate from `STATE.md`.
5. Card tray: confirm it opens for a *real* XP level-up (not just a forced push).
6. Canvas card banner is deleted — assert no `TACTICAL FIELD UPGRADE` string exists anywhere.

## D5 — Regression test suite
`tools/regress.mjs`: start menu → bay → launch → 60 s play → card drop → boss spawn → death → summary →
points. Exit non-zero on any pageerror. This is the gate every other agent runs.

## Acceptance

- Each D-item has a one-line before/after and a command that proves it.
- `tools/regress.mjs` exits 0 and prints a pass/fail table.
- No behaviour change to the economy.

FILES EXPECTED TO CHANGE:
  - tools/patch.py

ACCEPTANCE - paste the command output for each line:
  - patch() raises on a missing anchor
  - asserts the output differs
  - demoed on a real edit

REPORT SHAPE (required):
TASK DBG-01 - tools/patch.py assertive replace helper
Changed: <files>
Evidence: <command> -> <output>
Screenshot: <path or n/a>
Not verified: <list>
Broke / left open: <list>
