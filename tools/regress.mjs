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
// enemies are tankier since the difficulty pass: wait up to 20 s for the first kill
let s = await page.evaluate(() => { const st = window.__forgeSmokeTest.getState(); return { phase: st.phase, kills: st.kills }; });
for (let i = 0; i < 6 && s.phase === "playing" && !(s.kills > 0); i += 1) {
  await page.waitForTimeout(2000);
  s = await page.evaluate(() => { const st = window.__forgeSmokeTest.getState(); return { phase: st.phase, kills: st.kills }; });
}
if (s.phase !== "playing") await fail("not playing after launch");
if (!(s.kills > 0)) await fail("no kills in the first 20 s of autonomous play");

// Q swap: the secondary must actually deal damage (pierce used to exclude its own target)
{
  const d0 = await page.evaluate(() => window.__forgeSmokeTest.getState().scoreSystem.damageDealt);
  await page.keyboard.press("q");
  await page.waitForTimeout(4000);
  const r = await page.evaluate(() => ({
    dmg: window.__forgeSmokeTest.getState().scoreSystem.damageDealt,
    style: window.__forgeSmokeTest.getCruise().style,
    shot: window.__forgeSmokeTest.getState().lastShot || null,
  }));
  if (!(r.dmg > d0)) await fail(`secondary weapon ${r.style} dealt no damage after Q (${d0} -> ${r.dmg})`);
  // the spine pose is applied every frame: it must stay bounded or the head/arms swing out of the
  // torso and the character reads as invisible from the waist up
  const spine = await page.evaluate(() => {
    const bones = (window.__forgeSmokeTest.getSoldier() || {}).userData?.armBones || {};
    return bones.spine2 ? { x: bones.spine2.rotation.x, y: bones.spine2.rotation.y } : null;
  });
  if (spine && !(Number.isFinite(spine.y) && Number.isFinite(spine.x) && Math.abs(spine.y) <= 0.6)) {
    await fail(`operator spine ran away after swap (x=${spine.x} y=${spine.y})`);
  }
  await page.keyboard.press("q");
  await page.waitForTimeout(500);
}
await page.evaluate(async () => {
  const cs = window.__forgeSmokeTest.getCards();
  cs.queuedCards.push([{ type: "weapon", name: "WEAPON: BEAM", style: "beam" }]);
  await new Promise((r) => setTimeout(r, 1200));
});
if (!(await page.evaluate(() => !!document.querySelector("#fs-cards.open")))) await fail("card tray did not open");
// WPN-03: picking a weapon card must not silently grant the explosive mod
if (await page.evaluate(() => Boolean(window.__forgeSmokeTest.getWeapons().hasExplosiveMod))) {
  await fail("weapon card granted the explosive mod");
}

// FX-02 / FX-03: real trigger pulls must throw casings and kick the camera
const feel = await page.evaluate(() => ({
  ...window.__forgeSmokeTest.getCasings(),
  kickShots: window.__forgeSmokeTest.getFeel().kickShots,
  feelStyle: window.__forgeSmokeTest.getFeel().style,
}));
if (!(feel.total > 0)) await fail("no shell casings ejected from real shots");
if (!(feel.kickShots > 0)) await fail("no camera kick recorded from real shots");

// DBG-06: a real XP level-up (not a hand-pushed queue) must open the tray by itself
await page.evaluate(() => {
  // drain whatever the run already queued, or addXp is blocked by maxQueuedCards
  const cs = window.__forgeSmokeTest.getCards();
  cs.queuedCards.length = 0;
  document.querySelector("#fs-cards .card")?.click();
});
await page.waitForTimeout(500);
const before = await page.evaluate(() => {
  const cs = window.__forgeSmokeTest.getCards();
  return { lv: cs.level, xp: Math.round(cs.xp), next: Math.round(cs.nextLevelXp), q: cs.queuedCards.length, max: cs.maxQueued };
});
await page.evaluate(() => {
  const cs = window.__forgeSmokeTest.getCards();
  cs.queuedCards.length = 0;
  cs.addXp(cs.nextLevelXp + 1);
});
await page.waitForTimeout(900);
const after = await page.evaluate(() => {
  const cs = window.__forgeSmokeTest.getCards();
  return { lv: cs.level, xp: Math.round(cs.xp), next: Math.round(cs.nextLevelXp), q: cs.queuedCards.length };
});
if (!(after.lv > before.lv)) await fail(`XP did not level the card system (${JSON.stringify(before)} -> ${JSON.stringify(after)})`);
if (!(await page.evaluate(() => !!document.querySelector("#fs-cards.open")))) await fail("real level-up did not open the card tray");

if (errors.length) await fail("page errors: " + errors.slice(0, 3).join(" | "));
console.log("REGRESS OK  phase=" + s.phase + " kills=" + s.kills + " tray=open errors=0"
  + " casings=" + feel.total + " kick=" + feel.kickShots + " level=" + after.lv);
await browser.close();
