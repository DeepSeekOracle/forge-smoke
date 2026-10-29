// MOV-04: boss telegraph must move the pilot >= 4 m; the metric is printed.
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
await page.waitForTimeout(5000);
for (let i = 0; i < 4; i += 1) { await page.keyboard.press("1"); await page.waitForTimeout(250); }

const kills = await page.evaluate(() => window.__forgeSmokeTest.forceBoss());
await page.waitForTimeout(16000);
const st = await page.evaluate(() => ({
  ...window.__forgeSmokeTest.getPilot(),
  boss: window.__forgeSmokeTest.getState().bossSpawned,
  warning: window.__forgeSmokeTest.getState().bossWarning,
  bossHp: window.__forgeSmokeTest.getState().bossEnemy?.hp ?? null,
}));
await page.screenshot({ path: "docs/evidence/mov-04-boss-dodge.png" });

console.log("MOV-04:", JSON.stringify({ kills, ...st }));
if (!st.boss) await fail("boss never spawned after the forced threshold");
if (!(st.bossDodgeMax >= 4)) await fail(`telegraph dodge ${st.bossDodgeMax} m < 4 m`);
if (errors.length) await fail("page errors: " + errors.slice(0, 2).join(" | "));
console.log("MOV-04 OK boss dodge", st.bossDodgeMax, "m; boss HP", st.bossHp);
await browser.close();
