// MAP-01/02/03 boot + run evidence: collider count, distance travelled in 60 s, camera push,
// screenshots from a run on each layout.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
mkdirSync("docs/evidence", { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const results = [];
let failures = 0;

for (const id of ["depot", "yard", "foundry"]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
  await page.goto(`${BASE}?map=${id}&test=1&cb=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(7000);
  await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
  await page.waitForTimeout(1500);
  const base = await page.evaluate(() => window.__forgeSmokeTest.getPilot());
  for (let i = 0; i < 12; i += 1) {
    await page.waitForTimeout(5000);
    // keep the view clear of the card tray so the screenshot shows the layout
    await page.keyboard.press("1");
  }
  const end = await page.evaluate(() => ({
    ...window.__forgeSmokeTest.getPilot(),
    light: window.__forgeSmokeTest.getLighting(),
    colliders: window.__forgeSmokeTest.getColliders(),
    state: { phase: window.__forgeSmokeTest.getState().phase },
  }));
  await page.screenshot({ path: `docs/evidence/map-${id}.png` });
  const metres = end.odometer - base.odometer;
  const secs = end.runTime - base.runTime;
  const per60 = +(metres * (60 / Math.max(1, secs))).toFixed(1);
  const row = {
    map: id,
    built: end.light.map,
    arena: end.light.arena,
    colliders: end.colliders.length,
    metres: +metres.toFixed(1),
    gameSeconds: +secs.toFixed(1),
    per60,
    camPushMax: end.camPushMax,
    zeroMoveFrames: end.zeroMoveFrames,
    phase: end.state.phase,
    errors: errors.slice(0, 2),
  };
  console.log(JSON.stringify(row));
  if (end.light.map !== id) { failures += 1; console.log(`FAIL map ${id} built ${end.light.map}`); }
  if (end.state.phase !== "playing") { failures += 1; console.log(`FAIL map ${id} phase ${end.state.phase}`); }
  if (!(end.colliders.length >= 6)) { failures += 1; console.log(`FAIL map ${id} only ${end.colliders.length} colliders`); }
  if (!(per60 >= 55 && per60 <= 90)) { failures += 1; console.log(`FAIL map ${id} distance ${per60}`); }
  if (end.camPushMax > 1) { failures += 1; console.log(`FAIL map ${id} camera ${end.camPushMax}`); }
  if (errors.length) { failures += 1; console.log(`FAIL map ${id} page errors`); }
  results.push(row);
  await page.close();
}

// Baseline run with rotation (no ?map): the MOV-03 camera number for comparison, same metric.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
  await page.goto(`${BASE}?test=1&cb=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(7000);
  await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
  await page.waitForTimeout(1500);
  const base = await page.evaluate(() => window.__forgeSmokeTest.getPilot());
  for (let i = 0; i < 12; i += 1) { await page.waitForTimeout(5000); await page.keyboard.press("1"); }
  const end = await page.evaluate(() => ({ ...window.__forgeSmokeTest.getPilot(), light: window.__forgeSmokeTest.getLighting() }));
  const metres = end.odometer - base.odometer;
  const secs = end.runTime - base.runTime;
  const row = { map: "rotate", built: end.light.map, metres: +metres.toFixed(1), per60: +(metres * (60 / Math.max(1, secs))).toFixed(1), camPushMax: end.camPushMax, errors: errors.length };
  console.log(JSON.stringify(row));
  results.push(row);
  await page.screenshot({ path: "docs/evidence/map-rotate.png" });
  await page.close();
}

const md = [
  "# FORGE SMOKE — map + camera metrics (MAP-01..04, MOV-03)",
  "",
  "| map | built | colliders | 60 s distance | camera push max | page errors |",
  "|---|---|---|---|---|---|",
  ...results.map((r) => `| ${r.map} | ${r.built} | ${r.colliders ?? "-"} | ${r.per60} m | ${r.camPushMax} m | ${r.errors} |`),
  "",
  "Screenshots: docs/evidence/map-depot.png, map-yard.png, map-foundry.png, map-rotate.png",
  "",
].join("\n");
writeFileSync("docs/evidence/metrics.md", md);
console.log("MAPS SUMMARY " + JSON.stringify(results));
await browser.close();
process.exit(failures ? 1 : 0);
