// TUNE-04: gunship TTK with an anti-air weapon must land in 8-15 s, and the boss fires from altitude.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
const fail = async (msg) => { console.log("FAIL " + msg); await browser.close(); process.exit(1); };

await page.goto(URL + "?test=1&cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(7000);
await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
await page.waitForTimeout(1200);
await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
await page.waitForTimeout(2000);
await page.evaluate(() => window.__studio?.pause?.());

const setup = await page.evaluate(() => ({
  weapon: window.__forgeSmokeTest.setWeapon("flak"),
  kind: window.__forgeSmokeTest.forceBossKind("gunship"),
  kills: window.__forgeSmokeTest.forceBoss(),
}));
console.log("TUNE-04 setup:", JSON.stringify(setup));

let spawnAt = null;
let killedAt = null;
let maxY = 0;
let maxHp = 0;
let parked = false;
for (let t = 0; t < 45 && killedAt === null; t += 1) {
  const s = await page.evaluate((shouldPark) => {
    // hold the Gunship at 10 m so the measurement is weapon-vs-boss TTK, not travel time
    let didPark = false;
    if (shouldPark) {
      const st = window.__forgeSmokeTest.getState();
      if (st.bossEnemy) {
        // keep the arena clear so the auto-gun has exactly one target: the boss
        const all = window.__forgeSmokeTest.getEnemies().enemies;
        for (const e of all) { if (e !== st.bossEnemy) e.hp = 0; }
        st.bossEnemy.position.x = st.pos.x + 10;
        st.bossEnemy.position.z = st.pos.z;
        if (st.bossEnemy.mesh) st.bossEnemy.mesh.position.x = st.pos.x + 10;
        didPark = true;
      }
    }
    window.__studio.step(1000);
    const p = window.__forgeSmokeTest.getPilot();
    const b = window.__forgeSmokeTest.getBoss();
    return { t: p.runTime, b, didPark, style: window.__forgeSmokeTest.getCruise().style };
  }, true);
  if (s.didPark) parked = true;
  if (s.b.spawned && spawnAt === null) { spawnAt = s.t; maxHp = s.b.maxHp; }
  if (s.b.spawned) maxY = Math.max(maxY, s.b.y || 0);
  if (s.b.spawned && s.b.hp <= 0) killedAt = s.t;
  if (t % 5 === 0) console.log("t=" + s.t.toFixed(1), JSON.stringify({ ...s.b, style: s.style }));
}
await page.screenshot({ path: "docs/evidence/tune-04-gunship.png" });

const ttk = spawnAt !== null && killedAt !== null ? +(killedAt - spawnAt).toFixed(1) : null;
console.log("TUNE-04 result:", JSON.stringify({ spawnAt, killedAt, ttk, maxHp, maxY, empty: killedAt === null }));
if (spawnAt === null) await fail("gunship never spawned");
if (killedAt === null) await fail(`gunship survived 45 s (TTK null, maxHP ${maxHp})`);
if (!(ttk >= 8 && ttk <= 15)) await fail(`TTK ${ttk} s outside 8-15 s`);
if (!(maxY > 4)) await fail(`gunship never fired from altitude (max y ${maxY})`);
if (errors.length) await fail("page errors: " + errors.slice(0, 2).join(" | "));
console.log(`TUNE-04 OK TTK ${ttk} s (maxHP ${maxHp}), altitude ${maxY} m`);
await browser.close();
