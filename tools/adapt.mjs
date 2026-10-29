// MGR-07 evidence: the pilot changes its movement per archetype.
//   shieldbearer -> closes then circles to flank (shield stops being shielded)
//   mortar       -> rushes (its whole design is to keep range)
//   drone        -> opens the gap (its dive is the threat)
//   mech         -> keeps the stomp radius
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
await page.waitForTimeout(7000);
await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
await page.waitForTimeout(1200);
await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
await page.waitForTimeout(2500);
await page.evaluate(() => { window.__studio?.pause?.(); window.__forgeSmokeTest.setSpawns(false); });

async function reset(type, dist) {
  return page.evaluate(({ t, d }) => {
    window.__forgeSmokeTest.clearEnemies();
    const st = window.__forgeSmokeTest.getState();
    const x = st.pos.x + Math.sin(st.yaw) * d;
    const z = st.pos.z + Math.cos(st.yaw) * d;
    window.__forgeSmokeTest.spawnAt(t, x, z);
    return window.__forgeSmokeTest.getNearest();
  }, { t: type, d: dist });
}

async function advance(seconds, chunk = 0.25) {
  const out = { modes: [], min: Infinity, max: -Infinity, end: null };
  for (let t = 0; t < seconds; t += chunk) {
    const s = await page.evaluate((ms) => {
      window.__studio.step(ms);
      return { n: window.__forgeSmokeTest.getNearest(), p: window.__forgeSmokeTest.getPilot() };
    }, chunk * 1000);
    if (!s.n) break;
    out.modes.push(s.p.mode);
    out.min = Math.min(out.min, s.n.d);
    out.max = Math.max(out.max, s.n.d);
    out.end = s.n;
    if (s.n.type === "shieldbearer" && s.n.isShielded === false) out.flankedAt = t;
  }
  return out;
}

// shieldbearer: must end up flanked
{
  const start = await reset("shieldbearer", 7);
  const run = await advance(18);
  if (!run.flankedAt && !(run.end && run.end.isShielded === false)) {
    await fail(`shield never flanked (modes ${[...new Set(run.modes)].join(",")})`);
  }
  console.log("MGR-07 shield: flanked after", run.flankedAt ?? "?", "s", JSON.stringify(run.end));
}

// mortar: distance must fall sharply
{
  await reset("mortar", 22);
  const run = await advance(8);
  if (!(run.end.d < 16)) await fail(`pilot did not rush the mortar (end ${run.end.d} m)`);
  console.log("MGR-07 mortar: 22 ->", run.end.d, "m, modes", [...new Set(run.modes)].join(","));
}

// drone: the pilot should back off (a fragile drone may die before the gap opens, which also passes)
{
  await reset("drone", 4);
  const run = await advance(6);
  const modes = [...new Set(run.modes)];
  const alive = await page.evaluate(() => {
    const n = window.__forgeSmokeTest.getNearest();
    return n ? n.type === "drone" : false;
  });
  if (alive && !(run.end.d > 6) && !modes.includes("backoff")) {
    await fail(`pilot did not back off from a live drone (end ${run.end.d} m, modes ${modes.join(",")})`);
  }
  console.log("MGR-07 drone: 4 ->", run.end.d, "m, alive", alive, "modes", modes.join(","));
}

// mech: the pilot should back out of the stomp radius (a mech can also die under sustained fire)
{
  await reset("mech", 6);
  const run = await advance(8);
  const modes = [...new Set(run.modes)];
  if (!(run.end.d > 8) && !modes.includes("backoff")) {
    await fail(`pilot stayed inside the stomp (end ${run.end.d} m, modes ${modes.join(",")})`);
  }
  console.log("MGR-07 mech: 6 ->", run.end.d, "m, modes", modes.join(","));
}

if (errors.length) await fail("page errors: " + errors.slice(0, 2).join(" | "));
console.log("MGR-07 OK: shield flank, mortar rush, drone/mech spacing");
await browser.close();
