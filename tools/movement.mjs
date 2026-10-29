// MOV-01 / MOV-03 measurement: 60 s of autonomous play, distance, camera push, spacing, frozen frames.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
mkdirSync("docs/evidence", { recursive: true });
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
await page.waitForTimeout(1500);

const base = await page.evaluate(() => window.__forgeSmokeTest.getPilot());
const samples = [];
for (let i = 0; i < 12; i += 1) {
  await page.waitForTimeout(5000);
  samples.push(await page.evaluate(() => window.__forgeSmokeTest.getPilot()));
}
const last = samples[samples.length - 1];
const metres = last.odometer - base.odometer;
const gameSeconds = last.runTime - base.runTime;
const per60 = +(metres * (60 / Math.max(1, gameSeconds))).toFixed(1);
await page.screenshot({ path: "docs/evidence/mov-01-spread.png" });

console.log("MOV samples:", JSON.stringify(samples.map((s) => ({ t: s.runTime, odo: s.odometer, mode: s.mode, en: s.enemies }))));
console.log("MOV result:", JSON.stringify({ metres, gameSeconds, per60, mode: last.mode, camPushMax: last.camPushMax, zeroMoveFrames: last.zeroMoveFrames, spacing: last.spacing }));

if (!(per60 >= 55 && per60 <= 90)) await fail(`distance ${per60} m per 60 s outside 55-90 m`);
if (last.zeroMoveFrames > 0) await fail(`frozen frames: ${last.zeroMoveFrames}`);
if (last.camPushMax > 1.0) await fail(`camera displaced ${last.camPushMax} m (> 1 m)`);
if (errors.length) await fail("page errors: " + errors.slice(0, 2).join(" | "));
await browser.close();
