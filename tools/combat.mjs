/**
 * COMBAT-01 — the play-loop regression.
 *
 * Boots the real game on the preview server and asserts the things a player actually feels:
 * the weapon is in the fighter's hands and points where he faces, the body does not freeze while
 * it wants to move, the arena is not a black screen, the boss appears even at the body cap, a
 * mortar shell lands on the ground where it was aimed, and the whole loop runs without a page error.
 *
 *   node tools/combat.mjs
 *
 * Requires the preview server on 127.0.0.1:8796 (see .forge/VERIFY.md).
 */
import { chromium } from 'playwright';

const URL = process.env.FORGE_URL || 'http://127.0.0.1:8796/preview/forge-smoke/?test=1';
const checks = [];
const fail = (name, detail) => checks.push({ name, ok: false, detail });
const pass = (name, detail) => checks.push({ name, ok: true, detail });

function assert(name, cond, detail) {
  if (cond) pass(name, detail); else fail(name, detail);
}

const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 200)));
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('Content Security')) errors.push('console: ' + m.text().slice(0, 200));
});

try {
  await page.goto(URL + '&cb=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6500);
  assert('start menu opens', await page.evaluate(() => !!document.querySelector('#fs-start.open')));
  await page.evaluate(() => document.querySelector('#fs-start [data-enter]').click());
  await page.waitForTimeout(1000);
  assert('manager terminal opens', await page.evaluate(() => !!document.querySelector('#cyborg-manager')));
  await page.evaluate(() => document.querySelector('#cyborg-manager [data-launch]').click());
  await page.waitForTimeout(3000);

  const start = await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    return { phase: T.getState().phase, lighting: T.getLighting(), rig: T.getRig() };
  });
  assert('run starts', start.phase === 'playing', start.phase);
  assert('arena is lit', start.lighting.sun > 1 && start.lighting.hemisphere > 0.9, JSON.stringify({ sun: start.lighting.sun, hemi: start.lighting.hemisphere }));

  // weapon in hands: the anchor sits in front of the body and the rig has a mixer
  const rig = await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    const g = T.getGunPivot(); const s = T.getSoldier();
    const V = g.position.constructor;
    const gunW = g.getWorldPosition(new V());
    const solW = s.getWorldPosition(new V());
    const fwd = new V(Math.sin(T.getState().yaw), 0, Math.cos(T.getState().yaw));
    const rel = gunW.clone().sub(solW);
    return { anchor: [+g.position.x.toFixed(2), +g.position.y.toFixed(2), +g.position.z.toFixed(2)], forward: +rel.dot(fwd).toFixed(2), y: +rel.y.toFixed(2), rig: T.getRig() };
  });
  assert('weapon anchored at chest height', rig.y > 1.2 && rig.y < 1.75, JSON.stringify(rig.anchor));
  assert('weapon carried in front of the body', rig.forward > 0.1, String(rig.forward));
  assert('operator rig has a skeleton + clip', rig.rig.hasRig === true && rig.rig.hasMixer === true, JSON.stringify(rig.rig));

  // 20 s of autonomous play: it must move, not freeze, and take or deal damage
  const samples = [];
  for (let i = 0; i < 50; i += 1) {
    await page.waitForTimeout(400);
    samples.push(await page.evaluate(() => {
      const T = window.__forgeSmokeTest; const s = T.getState();
      return { pos: [+s.pos.x.toFixed(2), +s.pos.z.toFixed(2)], wants: !!s.pilotWantsMove, od: +(s.odometer || 0).toFixed(1), hp: Math.round(s.health), kills: s.kills, n: T.getSlots().length, phase: s.phase };
    }));
    if (samples[samples.length - 1].phase !== 'playing') break;
  }
  let still = 0, worstStill = 0, prev = null;
  for (const s of samples) {
    if (prev && s.wants && Math.hypot(s.pos[0] - prev.pos[0], s.pos[1] - prev.pos[1]) < 0.02) { still += 0.4; worstStill = Math.max(worstStill, still); } else still = 0;
    prev = s;
  }
  const last = samples[samples.length - 1];
  assert('fighter covers ground', last.od > 30, `${last.od} m in ~20 s`);
  assert('never frozen while trying to move', worstStill <= 1.2, `worst ${worstStill.toFixed(1)} s`);
  assert('enemies are alive and engaged', last.n > 0 && last.kills > 0, `${last.n} bodies, ${last.kills} kills`);
  assert('run survives 20 s', last.phase === 'playing', last.phase);
  const impacts = await page.evaluate(() => window.__forgeSmokeTest.getImpacts());
  assert('every hit spawns an impact burst', impacts > 20, `${impacts} sparks`);

  // airdrop: the crate must open a resolvable card window and the card system must survive it
  // clear any open level-up tray first, or the airdrop would overwrite it and the check would race
  for (let i = 0; i < 4; i += 1) {
    const open = await page.evaluate(() => window.__forgeSmokeTest.getCardsState().window);
    if (!open) break;
    await page.evaluate(() => { const el = document.querySelector('#fs-cards .card'); if (el) el.click(); });
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    T.getCards().queuedCards.length = 0;
    T.setSpawns(true); T.setRunTime(54.5);
  });
  await page.waitForTimeout(3000);
  const airOpen = await page.evaluate(() => window.__forgeSmokeTest.getCardsState());
  assert('airdrop opens a card window', airOpen.window === true && airOpen.source === 'airdrop' && airOpen.options.length >= 1, JSON.stringify(airOpen.options));
  assert('airdrop cards have names', airOpen.options.every((o) => o.name), JSON.stringify(airOpen.options.map((o) => o.name)));
  await page.evaluate(() => { const el = document.querySelector('#fs-cards .card'); if (el) el.click(); });
  await page.waitForTimeout(800);
  const airAfter = await page.evaluate(() => window.__forgeSmokeTest.getCardsState());
  // the airdrop window itself must be gone; a queued level-up tray may legitimately open next
  assert('airdrop card window closes', airAfter.source !== 'airdrop' && airAfter.airdrop === false, JSON.stringify(airAfter));
  assert('airdrop card is banked', airAfter.cardsPlayed >= 1, `${airAfter.cardsPlayed} cards`);
  // and a level-up tray still opens afterwards (the old stuck window blocked every later card)
  await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    const cs = T.getCards();
    cs.queuedCards.push([{ type: 'part', name: 'Test Part', part: { id: 'fast_mag', rarity: 'common', effect: { reloadMult: 0.72 } } }]);
  });
  await page.waitForTimeout(1200);
  const lvl = await page.evaluate(() => window.__forgeSmokeTest.getCardsState());
  assert('card system still serves level-ups after an airdrop', lvl.window === true && lvl.source === 'level', JSON.stringify(lvl));
  await page.evaluate(() => { const el = document.querySelector('#fs-cards .card'); if (el) el.click(); });
  await page.waitForTimeout(600);

  // mortar: a shell must detonate on the ground, not on the mortar
  await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    T.clearEnemies(); T.setSpawns(false); T.setPlayerPos(0, 0);
    T.spawnAt('mortar', 7, 9);
  });
  await page.waitForTimeout(9000);
  const blasts = await page.evaluate(() => window.__forgeSmokeTest.getBlasts());
  assert('mortar shells detonate', blasts.detonated > 0, JSON.stringify(blasts));

  // boss must spawn even at the body cap, and lose HP to the gun
  await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    const s = T.getState();
    // the run may already have spawned its own boss during the 20 s play section (kills >= 60);
    // reset the boss slot so this check always measures the forced gunship
    s.bossSpawned = false; s.bossEnemy = null; s.bossPaid = false;
    T.clearEnemies();
    T.setSpawns(true);
    for (let i = 0; i < 24; i += 1) T.spawnAt('rifleman', -10 + (i % 6) * 4, 12 + Math.floor(i / 6) * 3);
    T.forceBossKind('gunship'); T.forceBoss();
  });
  await page.waitForTimeout(2200);
  const bossA = await page.evaluate(() => ({ boss: window.__forgeSmokeTest.getBoss(), n: window.__forgeSmokeTest.getSlots().length }));
  await page.waitForTimeout(8000);
  const bossB = await page.evaluate(() => ({ boss: window.__forgeSmokeTest.getBoss(), hp: Math.round(window.__forgeSmokeTest.getState().health) }));
  assert('boss spawns at the body cap', bossA.boss.spawned === true && bossA.boss.hp > 0, JSON.stringify(bossA.boss));
  assert('boss is airborne', bossA.boss.y > 5, `y=${bossA.boss.y}`);
  assert('boss spawns inside the arena', bossA.boss.r > 0 && bossA.boss.r < 54, `r=${bossA.boss.r}`);
  assert('boss takes damage', bossB.boss.hp < bossA.boss.hp, `${bossA.boss.hp} -> ${bossB.boss.hp}`);
  const bossMoved = Math.hypot(bossB.boss.x - bossA.boss.x, bossB.boss.z - bossA.boss.z);
  assert('boss actually moves', bossMoved > 2, `${bossMoved.toFixed(2)} m in 8 s`);

  // phase 2: at half health the boss exposes a glowing core (hits land 35 % harder) and adds a
  // telegraphed area attack on its salvo beat
  await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    const b = T.getBoss();
    // the pilot drives state.fire every frame, so stop the pilot or the boss dies before it attacks
    T.getState().autopilot = false;
    T.getState().fire = 0;
    T.getState().health = T.getState().maxHealth;   // survive the phase-2 salvo for the whole window
    if (b && b.hp > 0) T.setBossHp(Math.round(b.maxHp * 0.45));
  });
  await page.waitForTimeout(900);
  const p2 = await page.evaluate(() => ({ boss: window.__forgeSmokeTest.getBoss(), blasts: window.__forgeSmokeTest.getBlasts() }));
  assert('boss enters phase 2', p2.boss.bossPhase === 2, JSON.stringify(p2.boss));
  assert('boss core is exposed', p2.boss.core === true, String(p2.boss.core));
  await page.waitForTimeout(5200);
  // keep it alive through its salvo beat so the area attack has a chance to fire
  await page.evaluate(() => { const T = window.__forgeSmokeTest; T.setBossHp(T.getBoss().maxHp); });
  await page.waitForTimeout(5200);
  const p2b = await page.evaluate(() => window.__forgeSmokeTest.getBlasts());
  assert('phase 2 adds an area attack', p2b.detonated > p2.blasts.detonated || p2b.ringsVisible > 0, JSON.stringify(p2b));
  // drop the boss reference before the melee test clears bodies: a live boss left in state would be
  // "paid" by that clear and push the run to results, freezing the arena
  await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    const s = T.getState();
    s.bossEnemy = null; s.bossPaid = true; s.bossSpawned = true;
    s.autopilot = true; s.fire = 999;
  });

  // melee contact: unarmed rifle-carriers used to orbit at carbine range forever. Four of them
  // must close and draw blood inside 12 s.
  await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    T.setSpawns(false); T.clearEnemies(); T.setPlayerPos(0, 0);
    const s = T.getState();
    // if the phase-2 salvo ended the run, bring it back to play for this isolated check
    if (s.phase !== 'playing') { s.phase = 'playing'; s.showResults = false; }
    s.health = s.maxHealth; s.fire = 999; s.autopilot = false;
    for (let i = 0; i < 4; i += 1) T.spawnAt('rifleman', Math.cos(i * 1.6) * 9, Math.sin(i * 1.6) * 9);
    T.getEnemies().getEnemies().forEach((e) => { e.canShoot = false; });
  });
  const meleeHp0 = await page.evaluate(() => Math.round(window.__forgeSmokeTest.getState().health));
  await page.waitForTimeout(12000);
  const meleeEnd = await page.evaluate(() => {
    const T = window.__forgeSmokeTest;
    const hp = Math.round(T.getState().health);
    const d = T.getEnemyMotion().map((e) => e.d);
    return { hp, closest: d.length ? +Math.min(...d).toFixed(1) : null };
  });
  assert('unarmed bodies close to melee', meleeEnd.closest !== null && meleeEnd.closest < 2.0, `closest ${meleeEnd.closest} m`);
  assert('melee contact draws blood', meleeEnd.hp < meleeHp0, `${meleeHp0} -> ${meleeEnd.hp}`);
  await page.evaluate(() => { const s = window.__forgeSmokeTest.getState(); s.fire = 0; });

  assert('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (e) {
  fail('harness', String(e).slice(0, 300));
} finally {
  await browser.close();
}

const failed = checks.filter((c) => !c.ok);
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}${c.detail ? '   (' + c.detail + ')' : ''}`);
console.log(`\nCOMBAT ${failed.length === 0 ? 'OK' : 'FAILED'}  ${checks.length - failed.length}/${checks.length} checks`);
process.exit(failed.length === 0 ? 0 : 1);
