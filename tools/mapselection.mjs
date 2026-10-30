/**
 * MAP SELECTION — does picking an arena in the manager actually load that map?
 *
 * Clicks each arena tile in the manager, launches, and reads back state.mapName + the lighting's
 * map id + the collider count from the live map build. Fails if two choices produce the same map.
 *
 *   node tools/mapselection.mjs
 */
import { chromium } from 'playwright';

const URL = process.env.FORGE_URL || 'http://127.0.0.1:8796/preview/forge-smoke/?test=1';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));

const picked = [];
try {
  await page.goto(URL + '&cb=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6500);
  await page.evaluate(() => document.querySelector('#fs-start [data-enter]').click());
  await page.waitForTimeout(1200);

  for (let i = 0; i < 3; i += 1) {
    // make sure the manager is up
    await page.evaluate(() => { const s = window.__forgeSmokeTest.getState(); s.phase = 'loadout'; });
    await page.waitForTimeout(900);
    const tiles = await page.evaluate(() => Array.from(document.querySelectorAll('#cyborg-manager .mg-arena .mg-item')).map((e) => e.innerText.replace(/\s+/g, ' ').trim()));
    await page.evaluate((idx) => {
      const items = document.querySelectorAll('#cyborg-manager .mg-arena .mg-item');
      if (items[idx]) items[idx].click();
    }, i);
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector('#cyborg-manager [data-launch]').click());
    await page.waitForTimeout(2200);
    const got = await page.evaluate(() => {
      const T = window.__forgeSmokeTest;
      const s = T.getState();
      const l = T.getLighting();
      return { mapName: s.mapName, mapId: s.mapId, lightingMap: l.map, colliders: T.getColliders().length, phase: s.phase };
    });
    picked.push({ tile: tiles[i] || null, ...got });
  }
  const distinct = new Set(picked.map((p) => p.mapId)).size;
  const ok = distinct === 3 && picked.every((p) => p.phase === 'playing');
  console.log(JSON.stringify({ picked, distinct, errors: [...new Set(errors)].slice(0, 3) }, null, 1));
  console.log(`MAPSELECTION ${ok ? 'OK' : 'FAILED'}  ${distinct}/3 distinct maps`);
  process.exit(ok ? 0 : 1);
} catch (e) {
  console.log('MAPSELECTION FAILED (harness): ' + String(e).slice(0, 300));
  process.exit(1);
} finally {
  await browser.close();
}
