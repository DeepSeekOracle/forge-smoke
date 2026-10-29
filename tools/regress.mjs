// Regression gate: start menu -> bay -> playing -> card tray. Exits non-zero on any failure.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
// The preview page embeds the ExcavationPro dock (and its ad iframes). Those cross-origin frame
// errors are not the game's: count only page errors and first-party console errors.
const EXTERNAL = /Content Security Policy|google|googlesyndication|doubleclick|frame-ancestors|adsbygoogle/i;
page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
page.on("console", (m) => {
  const text = m.text();
  if (m.type() === "error" && !EXTERNAL.test(text)) errors.push(text.slice(0, 160));
});

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

// FX-02 / FX-03: real trigger pulls must throw casings and kick the camera
const feel = await page.evaluate(() => ({
  ...window.__forgeSmokeTest.getCasings(),
  kickShots: window.__forgeSmokeTest.getFeel().kickShots,
  feelStyle: window.__forgeSmokeTest.getFeel().style,
}));
if (!(feel.total > 0)) await fail("no shell casings ejected from real shots");
if (!(feel.kickShots > 0)) await fail("no camera kick recorded from real shots");

// DBG-06: a real XP level-up (not a hand-pushed queue) must open the tray by itself
await page.evaluate(() => document.querySelector("#fs-cards .card")?.click());
await page.waitForTimeout(500);
const lvBefore = await page.evaluate(() => window.__forgeSmokeTest.getCards().level);
await page.evaluate(() => {
  const cs = window.__forgeSmokeTest.getCards();
  cs.addXp(cs.nextLevelXp + 1);
});
await page.waitForTimeout(900);
const lvAfter = await page.evaluate(() => window.__forgeSmokeTest.getCards().level);
if (!(lvAfter > lvBefore)) await fail(`XP did not level the card system (${lvBefore} -> ${lvAfter})`);
if (!(await page.evaluate(() => !!document.querySelector("#fs-cards.open")))) await fail("real level-up did not open the card tray");

if (errors.length) await fail("page errors: " + errors.slice(0, 3).join(" | "));
console.log("REGRESS OK  phase=" + s.phase + " kills=" + s.kills + " tray=open errors=0"
  + " casings=" + feel.total + " kick=" + feel.kickShots + " level=" + lvAfter);
await browser.close();
