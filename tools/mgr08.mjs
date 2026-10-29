// MGR-08 evidence: every legendary item changes the stat block, and a clear drops one into the profile.
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
await page.waitForTimeout(7000);

const res = await page.evaluate(() => {
  const f = window.__forgeSmokeTest;
  const base = f.getStatsFor({});
  const diffs = {};
  for (const perk of ["perk_armor", "perk_reload", "perk_speed", "perk_luck"]) {
    const s = f.getStatsFor({ perks: [perk] });
    diffs[perk] = Object.keys(base).filter((k) => s[k] !== base[k]).map((k) => `${k}+${s[k] - base[k]}`);
  }
  for (const mod of ["tac_flashlight", "light_orb_rounds", "flare_rig", "light_drone", "light_beacon"]) {
    const s = f.getStatsFor({ lightMods: [mod] });
    diffs[mod] = Object.keys(base).filter((k) => s[k] !== base[k]).map((k) => `${k}+${s[k] - base[k]}`);
  }
  const before = (f.getState().cyborgProfile.legacy || []).length;
  const drop = f.grantClear();
  const after = (f.getState().cyborgProfile.legacy || []).length;
  return { base, diffs, before, after, legendary: drop && drop.legendary, cleared: drop && drop.cleared };
});

console.log("MGR-08:", JSON.stringify(res, null, 1));
for (const [item, d] of Object.entries(res.diffs)) {
  if (!d.length) await fail(`${item} changes no stat (it would be cosmetic)`);
}
if (!(res.after > res.before)) await fail("an arena clear did not grant a legendary item");
if (!res.legendary) await fail("bankRun(true) returned no legendary");
if (errors.length) await fail("page errors: " + errors.slice(0, 2).join(" | "));
console.log("MGR-08 OK: 9 items each move a stat; clear granted", res.legendary);
await browser.close();
