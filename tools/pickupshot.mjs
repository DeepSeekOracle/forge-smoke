import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const b = await chromium.launch({ args: ["--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto("http://127.0.0.1:8796/preview/forge-smoke/?test=1&cb="+Date.now(), { waitUntil: "domcontentloaded" });
await p.waitForTimeout(7500);
await p.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
await p.waitForTimeout(900);
await p.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
await p.waitForTimeout(2500);
await p.evaluate(() => { window.__studio.pause(); window.__forgeSmokeTest.setSpawns(false); window.__forgeSmokeTest.clearEnemies(); });
const info = await p.evaluate(() => {
  const items = window.__forgeSmokeTest.getPickups().alive;
  const target = items.find(i => i.type === "health") || items[0];
  const st = window.__forgeSmokeTest.getState();
  const dx = target.x - st.pos.x, dz = target.z - st.pos.z;
  // stand 5 m short of the item, facing it so the follow camera has it in frame
  const len = Math.hypot(dx, dz) || 1;
  window.__forgeSmokeTest.setPlayerPos(target.x - dx/len*5, target.z - dz/len*5);
  st.yaw = Math.atan2(dx, dz);
  window.__studio.step(300);
  return { target, pos: { x: st.pos.x, z: st.pos.z } };
});
await p.waitForTimeout(300);
await p.screenshot({ path: "docs/evidence/pickups.png" });
console.log(JSON.stringify(info));
await b.close();
