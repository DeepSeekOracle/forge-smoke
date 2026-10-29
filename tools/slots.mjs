// MOV-02 evidence: enemies fan into slots around the player; shield takes the front slot.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
const fail = async (msg) => { console.log("FAIL " + msg); await browser.close(); process.exit(1); };

await page.goto(URL + "?test=1&cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(7000);
await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
await page.waitForTimeout(1200);
await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
await page.waitForTimeout(8000);
// clear any card tray so the screenshot shows the fight
for (let i = 0; i < 3; i += 1) {
  await page.keyboard.press("1");
  await page.waitForTimeout(300);
}

const placed = await page.evaluate(() => {
  // clear the arena and freeze spawns so the placed ring is the only thing alive
  window.__forgeSmokeTest.clearEnemies();
  window.__forgeSmokeTest.setSpawns(false);
  const st = window.__forgeSmokeTest.getState();
  const yaw = st.yaw || 0;
  const px = st.pos.x;
  const pz = st.pos.z;
  const at = (ang, r) => [px + Math.sin(yaw + ang) * r, pz + Math.cos(yaw + ang) * r];
  const out = [];
  out.push(window.__forgeSmokeTest.spawnAt("shieldbearer", ...at(0, 2.6)));
  out.push(window.__forgeSmokeTest.spawnAt("rifleman", ...at(2.1, 2.6)));
  out.push(window.__forgeSmokeTest.spawnAt("rifleman", ...at(-2.1, 2.6)));
  out.push(window.__forgeSmokeTest.spawnAt("sapper", ...at(Math.PI, 2.6)));
  return out;
});
await page.waitForTimeout(600);
const ring = await page.evaluate(() => window.__forgeSmokeTest.getSlots());
await page.waitForTimeout(2000);
const later = await page.evaluate(() => window.__forgeSmokeTest.getSlots());
await page.screenshot({ path: "docs/evidence/mov-02-slots.png" });

const shield = later.find((s) => s.type === "shieldbearer");
console.log("MOV-02 placed:", JSON.stringify(placed));
console.log("MOV-02 ring @2.6m:", JSON.stringify(ring));
if (!shield) await fail("shieldbearer disappeared");
// front slot = smallest |angle| around the player's facing
const front = later.slice().sort((a, b) => Math.abs(a.angle) - Math.abs(b.angle))[0];
if (front.type !== "shieldbearer") await fail(`front slot went to ${front.type} (${front.angle}) not the shield`);
if (errors.length) await fail("page errors: " + errors.slice(0, 2).join(" | "));
console.log("MOV-02 OK shield front angle", shield.angle, "| slots", JSON.stringify(later.map((s) => [s.type, s.angle])));
await browser.close();
