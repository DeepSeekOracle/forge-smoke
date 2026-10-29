# Forge Smoke — verification recipes

Every task is finished by running one of these and pasting the output. No output, no credit.

## 0. Patch safely, then bump every module together

Never hand-edit with a string replace that can silently miss. Use the exact-anchor patcher:

`powershell
python tools/patch.py src/main.js old.txt new.txt   # fails loudly if the anchor is absent
python tools/patch.py --self-test
`

Then bump all module versions in one pass (this rewrites every ?v= in src/**.js and index.html
and runs the module-strict syntax check):

`powershell
python tools/bump.py 202610320m
`

A half-bump mixes old and new modules. main.js logs [forge] BUILD <version> and sets
window.__forgeBuild; runtime errors (including unhandled promise rejections) render in a red strip at
the top of the page with that build tag instead of black-screening the game.

## 1. Boot test (run this after ANY change)

```powershell
cd $env:TEMP
@'
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0,160)));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0,160)); });
  await p.goto('http://127.0.0.1:8796/preview/forge-smoke/?test=1&cb=' + Date.now(),
               { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(7000);
  const start = await p.evaluate(() => !!document.querySelector('#fs-start.open'));
  await p.evaluate(() => document.querySelector('#fs-start [data-enter]').click());
  await p.waitForTimeout(1000);
  const bay = await p.evaluate(() => window.__forgeSmokeTest.getState().phase);
  await p.evaluate(() => document.querySelector('#cyborg-manager [data-launch]').click());
  await p.waitForTimeout(15000);
  const end = await p.evaluate(() => {
    const s = window.__forgeSmokeTest.getState();
    return { phase: s.phase, kills: s.kills, health: s.health, mode: s.pilotMode };
  });
  console.log(JSON.stringify({ start, bay, end, errorCount: errs.length, errors: errs.slice(0,4) }, null, 1));
  await b.close();
})();
'@ | Set-Content -Encoding utf8 boot.js
$env:NODE_PATH='C:\Users\justi\source\LYGOapps\node_modules'
node boot.js
```

**Pass = `errorCount: 0`, `start: true`, `bay: "loadout"`, `end.phase: "playing"`, 15 s of play with kills > 0.**

## 2. Visual check (required for anything that draws)

Screenshot at the moment that matters, then actually look at it — `read_image`, not "it should be fine".

```js
await p.screenshot({ path: 'C:/Users/justi/AppData/Local/Temp/<task-id>.png' });
```

## 3. Pixel-change check (required for "it animates")

Two screenshots 1.2 s apart, compare mean absolute difference; < 1.5/255 means effectively static.

## 4. Card / UI checks

```js
// force a real card drop through the game's own path
await p.evaluate(async () => {
  const cs = window.__forgeSmokeTest.getCards();
  cs.queuedCards.push([{ type: 'weapon', name: 'WEAPON: BEAM', style: 'beam' },
                       { type: 'part', name: 'Frag Rounds',
                         part: { id: 'frag_rounds', rarity: 'rare', effect: { explosive: true } } }]);
  await new Promise(r => setTimeout(r, 1200));
});
const tray = await p.evaluate(() => ({
  open: !!document.querySelector('#fs-cards.open'),
  cards: document.querySelectorAll('#fs-cards .card').length,
}));
```

## 5. Air / boss checks

```js
await p.evaluate(() => window.__forgeSmokeTest.spawnAir('gunship'));
const air = await p.evaluate(() => window.__forgeSmokeTest.airState());   // expect y ≈ 6.6
await p.evaluate(() => { window.__forgeSmokeTest.getState().kills = 19; }); // spawns boss
```

## 6. Economy check (never loosen without the steward)

```js
await p.evaluate(() => { window.__forgeSmokeTest.getState().health = 0; });
// expect lastTalentGain === 0 before 60 s of run time, 1 after, 5 on a clear
```

## 7. Performance sniff

Record `performance.now()` around 300 frames of play and report mean frame time. If you make it worse
than ~22 ms mean on swiftshader, say so.

## Reporting template

```
TASK <id> — <title>
Changed: <files>
Evidence: <command> → <output>
Screenshot: <path>
Not verified: <list>
Broke / left open: <list>
```
