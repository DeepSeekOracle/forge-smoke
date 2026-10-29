// Shooter ramp: early spawns are mostly non-shooters, the share climbs across the round.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
const fail = async (msg) => { console.log("FAIL " + msg); await browser.close(); process.exit(1); };

await page.goto(URL + "?test=1&cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(7500);
await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
await page.waitForTimeout(900);
await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
await page.waitForTimeout(1500);
await page.evaluate(() => window.__studio.pause());

const at = async (seconds) => {
  await page.evaluate((ms) => window.__studio.step(ms), seconds * 1000);
  return page.evaluate(() => window.__forgeSmokeTest.getRamp());
};
const t0 = await at(1);
const t1 = await at(14);
const t2 = await at(35);
const t3 = await at(50);
const share = (a, b) => (b.bodies > a.bodies ? (b.shooters - a.shooters) / (b.bodies - a.bodies) : 0);
const early = +share(t0, t1).toFixed(2);
const mid = +share(t1, t2).toFixed(2);
const late = +share(t2, t3).toFixed(2);
console.log("RAMP:", JSON.stringify({ early, mid, late, spawns: [t1.bodies, t2.bodies, t3.bodies] }));
if (!(t1.bodies >= 4)) await fail(`only ${t1.bodies} spawns in the first 15 s`);
if (early > 0.4) await fail(`too many shooters at the start: ${early}`);
if (!(late > mid && mid > early)) await fail(`shooter share does not climb (${early} -> ${mid} -> ${late})`);
if (!(late >= 0.5)) await fail(`late shooter share only ${late}`);
if (errors.length) await fail("page errors: " + errors.slice(0, 2).join(" | "));
console.log("RAMP OK", JSON.stringify({ early, mid, late }));
await browser.close();
