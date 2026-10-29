// MAP-04 spawn safety: spawn a crowd on the densest map and prove none of them start inside a collider.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
const fail = async (msg) => { console.log("FAIL " + msg); await browser.close(); process.exit(1); };

await page.goto(`${URL}?map=foundry&test=1&cb=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(7000);
await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
await page.waitForTimeout(1200);
await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
await page.waitForTimeout(4000);

const res = await page.evaluate(() => {
  const f = window.__forgeSmokeTest;
  for (const t of ["rifleman", "sapper", "shieldbearer", "spotter", "drone", "mortar", "mech"]) {
    for (let i = 0; i < 6; i += 1) f.spawnType(t);
  }
  const cols = f.getColliders();
  const live = f.getEnemies().enemies.filter((e) => e.hp > 0).map((e) => ({ type: e.type, x: e.position.x, z: e.position.z }));
  const inside = (c, x, z) => {
    if (c.shape === "circle") return Math.hypot(x - c.x, z - c.z) < (c.radius || 1) - 0.05;
    const cos = Math.cos(-(c.rotY || 0));
    const sin = Math.sin(-(c.rotY || 0));
    const lx = (x - c.x) * cos - (z - c.z) * sin;
    const lz = (x - c.x) * sin + (z - c.z) * cos;
    return Math.abs(lx) < (c.hx || 1.5) - 0.05 && Math.abs(lz) < (c.hz || 1.5) - 0.05;
  };
  const bad = [];
  for (const e of live) for (const c of cols) if (inside(c, e.x, e.z)) bad.push({ type: e.type, tag: c.tag, x: +e.x.toFixed(1), z: +e.z.toFixed(1) });
  return { spawned: live.length, colliders: cols.length, bad, map: f.getLighting().map };
});
console.log("SPAWN SAFETY:", JSON.stringify(res));
if (res.map !== "foundry") await fail(`forced map not loaded (${res.map})`);
if (res.spawned < 8) await fail(`only ${res.spawned} enemies spawned`);
if (res.bad.length) await fail(`${res.bad.length} enemies spawned inside colliders: ` + JSON.stringify(res.bad.slice(0, 4)));
if (errors.length) await fail("page errors: " + errors.slice(0, 2).join(" | "));
console.log("MAP-04 OK", res.spawned, "spawns,", res.colliders, "colliders, 0 inside");
await browser.close();
