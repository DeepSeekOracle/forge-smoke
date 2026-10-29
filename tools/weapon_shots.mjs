// Screenshots of the three WPN-01..03 weapons actually firing (brief 05 acceptance).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });

for (const [style, target] of [["flak", "air"], ["breach", "ground"], ["rail2", "ground"]]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
  await page.goto(URL + "?test=1&cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(7200);
  await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
  await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
  await page.waitForTimeout(2200);
  const res = await page.evaluate(({ st, tgt }) => {
    window.__studio.pause();
    window.__forgeSmokeTest.setSpawns(false);
    window.__forgeSmokeTest.clearEnemies();
    window.__forgeSmokeTest.setWeapon(st);
    if (tgt === "air") {
      window.__forgeSmokeTest.spawnAir("gunship");
    } else {
      const p = window.__forgeSmokeTest.getState().pos;
      window.__forgeSmokeTest.spawnAt("rifleman", p.x + 5, p.z + 2);
    }
    for (let i = 0; i < 8; i++) window.__studio.step(120);
    return { style: window.__forgeSmokeTest.getCruise().style, shot: window.__forgeSmokeTest.getState().lastShot || null };
  }, { st: style, tgt: target });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `docs/evidence/wpn-${style}.png` });
  console.log(style, JSON.stringify(res), errors.length ? "ERRORS " + errors[0] : "clean");
  await page.close();
}
await browser.close();
