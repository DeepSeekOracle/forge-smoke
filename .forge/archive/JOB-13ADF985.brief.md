FORGE WORKER JOB JOB-13ADF985
Skill: forge-worker
Project: forge-smoke
Project path: C:\Users\justi\AI Games\forge-smoke
Title: FREE BUILD: Rebuild src/main.js. It was destroyed and is now a 2.9 KB stub; …
Brief: FREE BUILD — no phase task. Operator instruction:
Rebuild src/main.js. It was destroyed and is now a 2.9 KB stub; the original was 39.5 KB.

READ FIRST (in the project): src/studio.d.ts (engine type definitions), then the export lists of
src/studio.js, src/materials.js, src/weapons.js, src/enemies.js, src/director.js, src/hud.js,
src/save.js, src/tuning.js, src/foliage.js, src/icons.js.

THEN WRITE src/main.js so the game boots and plays:
- import THREE and installStudio from ./studio.js
- create renderer, scene, camera, lights; build the arena ground using materials.js
- player: WASD movement, mouse aim, fire, reload, weapon swap
- instantiate WeaponManager, CardSystem, EnemyManager, BeatDirector, ScoreSystem from their modules
- drive the HUD with createHud(deps) and update it each frame
- save/load through save.js
IMPORTANT: src/menu.js, src/fx.js and src/level.js are STUBS that throw "not implemented" - do NOT
import them.
Output: overwrite src/main.js with complete working code. Then report which exports you used.

Project: C:\Users\justi\AI Games\forge-smoke
This is a BUILD request, not a planning request. Produce real files and prove them.
A markdown-only answer is a BLOCKED result.

Evidence to return: FILES CHANGED (paths + sizes), what a player now sees/hears, and the REFRESH readout (served <age> · sha <hash> · <n> files newer than the page).

Read BUILD.md in the project root first - it is the build contract. Read nothing else unless the task truly needs it.


ROLE / STAGE:


You are a specialist Forge worker. Follow the assigned skill exactly.
Only work on this job. Do not add features or change unrelated files.
Do not publish, push, deploy, or buy anything.
Return a concise RESULT, the files changed, and the evidence you ran.

SKILL:
# FORGE WORKER

You are a specialist worker under the LYGO Forge Dispatcher.

## Contract

- Work only on the assigned `JOB` and its `brief`.
- Read the project artifacts before touching files.
- Keep changes inside the stated scope.
- Do not publish, deploy, buy, delete or add credentials.
- Return: RESULT, FILES CHANGED, EVIDENCE, BLOCKERS.
- If the job cannot be done safely, stop and write the blocker.

## Evidence

A result is not "looks good". Include at least one of:

- command + exit code
- file path + line count/hash
- screenshot/test result path
- measured performance number

## Rework

A Master rework note is part of the job. Fix only what the note requests; do not expand.

## Asset and licence rules

- Unknown source = not shippable.
- Record source/licence for every asset.
- No paid asset or service without a decision record.
