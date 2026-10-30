/**
 * FIGHTLAB — measure the fight instead of describing it.
 *
 * For every weapon style and every enemy archetype this drives the real game loop and reports:
 *   - TTK (time to kill) for the player's gun against a fixed target
 *   - incoming fire volume and hit rate against a stationary operator
 *   - whether every enemy rig is actually animating (bone motion) or sliding in a bind pose
 *   - whether enemies converge on the player (movement works)
 *
 *   node tools/fightlab.mjs
 */
import { chromium } from 'playwright';

const URL = process.env.FORGE_URL || 'http://127.0.0.1:8796/preview/forge-smoke/?test=1';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));

const ev = (fn, arg) => page.evaluate(fn, arg);

try {
  await page.goto(URL + '&cb=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6500);
  await ev(() => document.querySelector('#fs-start [data-enter]').click());
  await page.waitForTimeout(1000);
  await ev(() => document.querySelector('#cyborg-manager [data-launch]').click());
  await page.waitForTimeout(2500);
  // park the fight: no spawns, no autopilot, no dodging
  await ev(() => {
    const T = window.__forgeSmokeTest; const s = T.getState();
    T.setSpawns(false); T.clearEnemies(); T.setPlayerPos(0, 0);
    s.autopilot = false; s.controlMode = 'manual'; s.orbit = 0; s.yaw = 0;
  });
  await page.waitForTimeout(300);

  // ── TTK per weapon ────────────────────────────────────────────────────────
  const styles = ['spray', 'pierce', 'cone', 'burst', 'beam', 'spinup', 'rail', 'arc'];
  const ttk = [];
  for (const style of styles) {
    const t0 = Date.now();
    await ev(([st]) => {
      const T = window.__forgeSmokeTest;
      T.clearEnemies();
      T.setWeapon(st);
      T.spawnAt('rifleman', 0, 9);
    }, [style]);
    // wait until the spawned body is gone (killed) or 12 s
    let killed = false;
    while (Date.now() - t0 < 12000) {
      await page.waitForTimeout(100);
      const n = await ev(() => window.__forgeSmokeTest.getSlots().length);
      if (n === 0) { killed = true; break; }
    }
    ttk.push({ style, seconds: killed ? +((Date.now() - t0) / 1000).toFixed(2) : null, killed });
  }

  // ── incoming fire against a stationary operator ───────────────────────────
  await ev(() => {
    const T = window.__forgeSmokeTest;
    T.clearEnemies();
    const s = T.getState(); s.health = s.maxHealth;
    s.fire = 999;             // stop the operator shooting back, isolate incoming fire
    ['rifleman', 'rifleman', 'rifleman', 'rifleman'].forEach((t, i) => T.spawnAt(t, -6 + i * 4, 11));
  });
  const hp0 = await ev(() => Math.round(window.__forgeSmokeTest.getState().health));
  const f0 = await ev(() => ({ fired: window.__forgeSmokeTest.getState().enemyShotsFired || 0, hit: window.__forgeSmokeTest.getState().enemyShotsHit || 0 }));
  await page.waitForTimeout(8000);
  const hp1 = await ev(() => Math.round(window.__forgeSmokeTest.getState().health));
  const f1 = await ev(() => ({ fired: window.__forgeSmokeTest.getState().enemyShotsFired || 0, hit: window.__forgeSmokeTest.getState().enemyShotsHit || 0 }));
  const incoming = { hpLost: hp0 - hp1, fired: f1.fired - f0.fired, hit: f1.hit - f0.hit };

  // ── animation liveness + convergence per archetype ────────────────────────
  const types = ['rifleman', 'sapper', 'shieldbearer', 'spotter', 'drone', 'mortar', 'mech'];
  const anim = [];
  for (const type of types) {
    await ev(([t]) => {
      const T = window.__forgeSmokeTest;
      T.clearEnemies(); T.setPlayerPos(0, 0);
      T.getState().fire = 999;   // hold fire: the sample body must survive long enough to animate
      T.spawnAt(t, 0, 14);
    }, [type]);
    await page.waitForTimeout(900);
    const sample = () => {
      const T = window.__forgeSmokeTest;
      const e = T.getEnemies().getEnemies()[0];
      if (!e || !e.mesh) return null;
      const rig = e.mesh.userData.glbRig;
      const bones = [];
      if (rig) rig.traverse((o) => { if (o.isBone) bones.push(o); });
      const bone = bones.length ? bones[Math.min(bones.length - 1, Math.floor(bones.length * 0.6))] : null;
      const V = e.mesh.position.constructor;
      const wp = bone ? bone.getWorldPosition(new V()) : null;
      return {
        type: e.type,
        hasRig: !!rig,
        bones: bones.length,
        hasMixer: !!(e.mesh.userData.mixer),
        hand: wp ? wp.toArray().map((v) => +v.toFixed(3)) : null,
        pos: [e.position.x, e.position.z],
        dist: Math.hypot(e.position.x, e.position.z),
      };
    };
    const a = await ev(sample);
    await page.waitForTimeout(700);
    const b = await ev(sample);
    if (!a || !b) { anim.push({ type, missing: true }); continue; }
    const dq = a.hand && b.hand ? Math.hypot(...a.hand.map((v, i) => v - b.hand[i])) : null;
    anim.push({ type, hasRig: a.hasRig, bones: a.bones, hasMixer: a.hasMixer, boneMotion: dq === null ? null : +dq.toFixed(3), approach: +(a.dist - b.dist).toFixed(2) });
  }

  // ── effects: muzzle / tracer geometry against the gun ─────────────────────
  await ev(() => { const T = window.__forgeSmokeTest; T.clearEnemies(); T.setWeapon('spray'); T.getState().fire = 0; T.spawnAt('rifleman', 0, 10); });
  await page.waitForTimeout(400);
  let effects = null;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(40);
    const e = await ev(() => {
      const T = window.__forgeSmokeTest;
      const gun = T.getGunPivot();
      const V = gun.position.constructor;
      gun.updateMatrixWorld(true);
      const muzzle = new V(0, 0, 1.05).applyMatrix4(gun.matrixWorld);
      const tip = new V(0, 0, 0.92).applyMatrix4(gun.matrixWorld);
      const scene = T.getScene();
      let flashPos = null, flashScale = null, tracer = null;
      scene.traverse((o) => {
        if (o.userData.tag === 'muzzle-flash' && o.visible) { flashPos = o.position.toArray().map((v) => +v.toFixed(2)); flashScale = +o.scale.x.toFixed(2); }
        if (o.userData.tag === 'tracer' && o.visible && !tracer) tracer = { len: +o.scale.z.toFixed(2), w: +o.scale.x.toFixed(3), pos: o.position.toArray().map((v) => +v.toFixed(2)) };
      });
      return {
        muzzle: muzzle.toArray().map((v) => +v.toFixed(2)),
        barrelTip: tip.toArray().map((v) => +v.toFixed(2)),
        muzzleToTip: +muzzle.distanceTo(tip).toFixed(2),
        flashPos, flashScale, tracer, casings: T.getCasings(),
      };
    });
    if (e.flashPos || e.tracer) effects = e;
    if (effects) break;
  }

  console.log(JSON.stringify({ ttk, incoming, anim, effects, errors: [...new Set(errors)].slice(0, 3) }, null, 1));
} catch (e) {
  console.log('FIGHTLAB FAILED: ' + String(e).slice(0, 300));
  process.exitCode = 1;
} finally {
  await browser.close();
}
