// Regression gate: start menu -> bay -> playing -> card tray. Exits non-zero on any failure.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });

const fail = async (msg) => { console.log("FAIL " + msg); await browser.close(); process.exit(1); };

await page.goto(URL + "?test=1&cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(7000);
if (!(await page.evaluate(() => !!document.querySelector("#fs-start.open")))) await fail("start menu not open");
await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
await page.waitForTimeout(1200);
if ((await page.evaluate(() => window.__forgeSmokeTest.getState().phase)) !== "loadout") await fail("bay not reached");
await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
await page.waitForTimeout(8000);
const s = await page.evaluate(() => { const st = window.__forgeSmokeTest.getState(); return { phase: st.phase, kills: st.kills }; });
if (s.phase !== "playing") await fail("not playing after launch");
if (!(s.kills > 0)) await fail("no kills in 8s of autonomous play");
await page.evaluate(async () => {
  const cs = window.__forgeSmokeTest.getCards();
  cs.queuedCards.push([{ type: "weapon", name: "WEAPON: BEAM", style: "beam" }]);
  await new Promise((r) => setTimeout(r, 1200));
});
if (!(await page.evaluate(() => !!document.querySelector("#fs-cards.open")))) await fail("card tray did not open");
if (errors.length) await fail("page errors: " + errors.slice(0, 3).join(" | "));
console.log("REGRESS OK  phase=" + s.phase + " kills=" + s.kills + " tray=open errors=0");
await browser.close();
