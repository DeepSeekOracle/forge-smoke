// Enemy fire is dodgeable: riflemen fire visible bolts, the pilot steps out of the line, and the
// screenshot catches bolts in flight with a firing pose on the shooter.
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
await page.evaluate(() => {
  window.__studio.pause();
  window.__forgeSmokeTest.setSpawns(false);
  window.__forgeSmokeTest.clearEnemies();
  const st = window.__forgeSmokeTest.getState();
  for (let i = 0; i < 3; i += 1) {
    const a = (i / 3) * Math.PI * 2;
    window.__forgeSmokeTest.spawnAt("rifleman", st.pos.x + Math.sin(a) * 10, st.pos.z + Math.cos(a) * 10);
  }
});

let dodgeFrames = 0;
let shotsSeen = 0;
for (let i = 0; i < 48; i += 1) {
  const s = await page.evaluate(() => {
    window.__studio.step(250);
    const c = window.__forgeSmokeTest.getCombat();
    const live = window.__forgeSmokeTest.getEnemies().enemies.length;
    return { ...c, live, t: +window.__forgeSmokeTest.getPilot().runTime.toFixed(1) };
  });
  if (s.mode === "dodge-shot") dodgeFrames += 1;
  shotsSeen = Math.max(shotsSeen, s.fired);
  if (s.fired >= 2 && s.live >= 2 && !globalThis.__shot) {
    globalThis.__shot = true;
    await page.screenshot({ path: "docs/evidence/enemy-fire.png" });
  }
  if (s.health <= 0) break;
}
const final = await page.evaluate(() => window.__forgeSmokeTest.getCombat());
console.log("ENEMY FIRE:", JSON.stringify({ ...final, dodgeFrames, shotsSeen }));
if (!(final.fired >= 5)) await fail(`enemies fired only ${final.fired} shots`);
if (final.hit >= final.fired) await fail(`every bolt hit (${final.hit}/${final.fired}) - not dodgeable`);
if (!(dodgeFrames > 0)) await fail("pilot never entered dodge-shot");
if (errors.length) await fail("page errors: " + errors.slice(0, 2).join(" | "));
console.log("ENEMY FIRE OK", final.fired, "bolts,", final.hit, "hits,", dodgeFrames * 0.25, "s dodging");
await browser.close();
