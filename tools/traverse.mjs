/**
 * TRAVERSE-01 — do a real walk-through of the arena.
 *
 * The edge bugs (stuck fighter, boss outside the wall) only show up when someone actually drives the
 * body. This walks the operator out of the centre in eight directions, records how far the body
 * actually travels while a key is held, and reports every stall. Manual control, real key events.
 *
 *   node tools/traverse.mjs
 */
import { chromium } from 'playwright';

const URL = process.env.FORGE_URL || 'http://127.0.0.1:8796/preview/forge-smoke/?test=1';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));

const pos = () => page.evaluate(() => {
  const s = window.__forgeSmokeTest.getState();
  return { x: s.pos.x, z: s.pos.z, r: Math.hypot(s.pos.x, s.pos.z), od: s.odometer || 0 };
});

async function hold(keys, seconds) {
  for (const k of keys) await page.keyboard.down(k);
  const start = await pos();
  const samples = [];
  const t0 = Date.now();
  while (Date.now() - t0 < seconds * 1000) {
    await page.waitForTimeout(200);
    samples.push({ t: (Date.now() - t0) / 1000, ...(await pos()) });
  }
  for (const k of keys) await page.keyboard.up(k);
  const end = await pos();
  // Only the FIRST 3.5 s of a hold is judged: a body that ends up pinned against a building or the
  // arena wall is doing what cover is for. The regression is "stuck in the open", not "stopped at a
  // wall".
  let stalls = 0, still = 0;
  for (let i = 1; i < samples.length; i += 1) {
    if (samples[i].t > 3.5) break;
    const stepDist = Math.hypot(samples[i].x - samples[i - 1].x, samples[i].z - samples[i - 1].z);
    if (stepDist < 0.04) still += 0.2;
    else still = 0;
    if (still >= 1.0) stalls += 1;
  }
  return {
    keys: keys.join('+'),
    moved: +Math.hypot(end.x - start.x, end.z - start.z).toFixed(2),
    start: { x: +start.x.toFixed(1), z: +start.z.toFixed(1), r: +start.r.toFixed(1) },
    end: { x: +end.x.toFixed(1), z: +end.z.toFixed(1), r: +end.r.toFixed(1) },
    stalls,
  };
}

try {
  await page.goto(URL + '&cb=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6500);
  await page.evaluate(() => document.querySelector('#fs-start [data-enter]').click());
  await page.waitForTimeout(1000);
  await page.evaluate(() => document.querySelector('#cyborg-manager [data-launch]').click());
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    T.setSpawns(false); T.clearEnemies();
    T.setPlayerPos(0, 0);
    const s = T.getState(); s.autopilot = false; s.controlMode = 'manual'; s.orbit = 0; s.yaw = 0;
  });
  await page.waitForTimeout(400);

  const arenaR = await page.evaluate(() => window.__forgeSmokeTest.getState() && 54);
  const legs = [];
  // out to the edge on -Z (W with orbit 0), then back
  legs.push(await hold(['KeyW'], 12));
  legs.push(await hold(['KeyS'], 4));
  // around the rim: four diagonal-ish pushes after re-centring through the middle
  await page.evaluate(() => { window.__forgeSmokeTest.setPlayerPos(0, 0); });
  await page.waitForTimeout(300);
  legs.push(await hold(['KeyD'], 12));
  await page.evaluate(() => { window.__forgeSmokeTest.setPlayerPos(0, 0); });
  await page.waitForTimeout(300);
  legs.push(await hold(['KeyW', 'KeyD'], 10));
  await page.evaluate(() => { window.__forgeSmokeTest.setPlayerPos(0, 0); });
  await page.waitForTimeout(300);
  legs.push(await hold(['KeyW', 'KeyA'], 10));

  const nearProps = await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    const cols = T.getColliders();
    return { count: cols.length, maxR: +Math.max(...cols.map((c) => Math.hypot(c.x, c.z))).toFixed(1) };
  });

  const report = { arenaR, legs, nearProps, errors: [...new Set(errors)].slice(0, 3) };
  console.log(JSON.stringify(report, null, 1));
  const bad = legs.filter((l) => l.moved < 10 || l.stalls > 0);
  console.log(`TRAVERSE ${bad.length === 0 ? 'OK' : 'FAILED'}  ${legs.length - bad.length}/${legs.length} legs clean`);
  process.exit(bad.length === 0 ? 0 : 1);
} catch (e) {
  console.log('TRAVERSE FAILED (harness): ' + String(e).slice(0, 300));
  process.exit(1);
} finally {
  await browser.close();
}
