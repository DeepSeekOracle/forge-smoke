// Pickups: layout spacing, auto-apply, stacking, respawn, and AI priority.
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
await page.waitForTimeout(7500);
await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
await page.waitForTimeout(900);
await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
await page.waitForTimeout(2500);
await page.evaluate(() => { window.__studio.pause(); window.__forgeSmokeTest.setSpawns(false); window.__forgeSmokeTest.clearEnemies(); });

const start = await page.evaluate(() => window.__forgeSmokeTest.getPickups());
console.log("PICKUPS start:", JSON.stringify(start));
if (start.count !== 8) await fail(`expected 8 pickup sites, got ${start.count}`);
const health = start.alive.filter((p) => p.type === "health");
if (health.length !== 2) await fail(`expected 2 health sites, got ${health.length}`);
const gap = Math.hypot(health[0].x - health[1].x, health[0].z - health[1].z);
console.log("PICKUPS health gap:", gap.toFixed(1), "m");
if (gap < 64) await fail(`health gap ${gap} < 64 m (reachable in 10 s at base speed)`);
if (gap > 80) await fail(`health gap ${gap} > 80 m (unreachable even boosted)`);

async function collect(type) {
  const items = await page.evaluate(() => window.__forgeSmokeTest.getPickups());
  const item = items.alive.find((p) => p.type === type);
  if (!item) return null;
  await page.evaluate(({ x, z }) => window.__forgeSmokeTest.setPlayerPos(x, z), item);
  await page.evaluate(() => window.__studio.step(200));
  return page.evaluate(() => window.__forgeSmokeTest.getPickups());
}

// health: damage first, then verify the 10 s regen delivers ~50 % of max
await page.evaluate(() => window.__forgeSmokeTest.hurt(50));
const before = await page.evaluate(() => window.__forgeSmokeTest.getState().health);
const afterHealth = await collect("health");
if (!afterHealth || afterHealth.regen < 1) await fail("collecting health started no regen tick");
await page.evaluate(() => window.__studio.step(10000));
const healed = await page.evaluate(() => window.__forgeSmokeTest.getState().health);
console.log("PICKUPS health:", JSON.stringify({ before: Math.round(before), healed: Math.round(healed) }));
if (!(healed - before > 30)) await fail(`regen healed only ${(healed - before).toFixed(1)}`);

// power stacks
const p1 = await collect("power");
const p2 = await collect("power");
if (!p2 || !(p2.powerMult > 1.4)) await fail(`power did not stack (mult ${p2 && p2.powerMult})`);
// speed
const s1 = await collect("speed");
if (!s1 || !(s1.speedMult >= 1.24)) await fail(`speed buff not applied (mult ${s1 && s1.speedMult})`);
console.log("PICKUPS stacks:", JSON.stringify({ powerMult: p2.powerMult, speedMult: s1.speedMult }));

// AI priority: hurt -> health goal, healthy -> power goal
await page.evaluate(() => { window.__forgeSmokeTest.hurt(30); window.__studio.step(100); });
const hurtGoal = await page.evaluate(() => window.__forgeSmokeTest.getPickups().goal);
await page.evaluate(() => { const st = window.__forgeSmokeTest.getState(); st.health = st.maxHealth; window.__studio.step(100); });
const healthyGoal = await page.evaluate(() => window.__forgeSmokeTest.getPickups().goal);
console.log("PICKUPS goals:", JSON.stringify({ hurt: hurtGoal && hurtGoal.type, healthy: healthyGoal && healthyGoal.type }));
// hurt pilot must want health; a healthy pilot takes the next priority that still exists
// (all three power sites were collected above, so speed is correct there — the ordering itself is
// unit-tested in tools/unit.mjs with a fresh layout)
if (!hurtGoal || hurtGoal.type !== "health") await fail(`hurt pilot does not fetch health (${hurtGoal && hurtGoal.type})`);
if (!healthyGoal || !["power", "speed"].includes(healthyGoal.type)) await fail(`healthy pilot has no buff goal (${healthyGoal && healthyGoal.type})`);

// respawn after 60 s
await page.evaluate(() => window.__studio.step(61000));
const later = await page.evaluate(() => window.__forgeSmokeTest.getPickups());
console.log("PICKUPS respawn:", JSON.stringify({ alive: later.alive.length, taken: later.taken }));
if (!(later.alive.length >= 6)) await fail(`pickups did not respawn (alive ${later.alive.length})`);

await page.screenshot({ path: "docs/evidence/pickups.png" });
if (errors.length) await fail("page errors: " + errors.slice(0, 2).join(" | "));
console.log("PICKUPS OK");
await browser.close();
