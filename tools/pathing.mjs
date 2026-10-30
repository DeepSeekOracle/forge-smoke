/**
 * PATHING — can the AI actually walk around the new buildings?
 *
 * For each map: drop ten bodies on the perimeter (several spawn behind buildings), give them 22 s,
 * then count how many reached the operator and how many are wedged. Fails if fewer than half arrive.
 *
 *   node tools/pathing.mjs
 */
import { chromium } from 'playwright';

const URL = process.env.FORGE_URL || 'http://127.0.0.1:8796/preview/forge-smoke/?test=1';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const results = [];
let failed = false;

for (const map of ['depot', 'yard', 'foundry']) {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 140)));
  try {
    await page.goto(`${URL}&map=${map}&cb=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    await page.evaluate(() => document.querySelector('#fs-start [data-enter]').click());
    await page.waitForTimeout(800);
    await page.evaluate(() => document.querySelector('#cyborg-manager [data-launch]').click());
    await page.waitForTimeout(2500);
    const start = await page.evaluate(([m]) => {
      const T = window.__forgeSmokeTest;
      T.setSpawns(false); T.clearEnemies(); T.setPlayerPos(0, 0);
      const s = T.getState(); s.autopilot = false; s.fire = 999;
      // ten points on the perimeter, alternating sides so several are behind cover
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2;
        T.spawnAt('rifleman', Math.cos(a) * 38, Math.sin(a) * 38);
      }
      return { nav: T.getNavInfo(), n: T.getSlots().length };
    }, [map]);
    // sample motion: backpedalling is the "walking backwards" bug
    let moving = 0, back = 0;
    for (let i = 0; i < 8; i += 1) {
      await page.waitForTimeout(350);
      const m = await page.evaluate(() => window.__forgeSmokeTest.getEnemyMotion());
      for (const e of m) {
        if (e.speed > 0.6) { moving += 1; if (e.dot < -0.35) back += 1; }
      }
    }
    const backFrac = moving ? +(back / moving).toFixed(2) : 0;
    await page.waitForTimeout(14000);
    const end = await page.evaluate(() => {
      const T = window.__forgeSmokeTest;
      const slots = T.getSlots();
      const hp = Math.round(T.getState().health);
      return {
        n: slots.length,
        // riflemen hold a 10-14 m firing line by design, so "arrived" means inside that envelope
        near: slots.filter((e) => e.d <= 14).length,
        dists: slots.map((e) => +e.d.toFixed(1)).sort((a, b) => a - b),
        hp,
      };
    });
    const arrived = end.near;
    const ok = arrived >= 5 && backFrac < 0.15;
    if (!ok) failed = true;
    results.push({ map, arrived, backpedal: backFrac, movingSamples: moving, end, ok, errors: [...new Set(errors)].slice(0, 2) });
  } catch (e) {
    failed = true;
    results.push({ map, error: String(e).slice(0, 200) });
  } finally {
    await page.close();
  }
}

console.log(JSON.stringify(results, null, 1));
console.log(`PATHING ${failed ? 'FAILED' : 'OK'}  ${results.filter((r) => r.ok).length}/${results.length} maps`);
process.exit(failed ? 1 : 0);
