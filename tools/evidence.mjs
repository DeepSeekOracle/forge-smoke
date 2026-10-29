// QA evidence pass: UI-10 (phone card tray), MGR-06/08 (manager), MGR-09 (results summary),
// ART-06 (start-screen stills), MGR-07 (enemy archetypes). Screenshots land in docs/evidence/.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const OUT = "docs/evidence";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const errors = [];
const fail = async (msg) => { console.log("FAIL " + msg); await browser.close(); process.exit(1); };

async function boot(page) {
  await page.goto(URL + "?test=1&cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(7000);
  if (!(await page.evaluate(() => !!document.querySelector("#fs-start.open")))) await fail("start menu not open");
}

// ── phone: 390x844 (UI-10) ────────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
  await boot(page);
  await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
  await page.waitForTimeout(1200);
  const mgr = await page.evaluate(() => {
    const q = (s) => document.querySelectorAll(s).length;
    return {
      attrs: q("#cyborg-manager [data-attrs] button"),
      weapons: q("#cyborg-manager [data-weapons] *"),
      perks: q("#cyborg-manager [data-perks] *"),
      statLines: Array.from(document.querySelectorAll("#cyborg-manager .mg-stats b")).length,
    };
  });
  await page.screenshot({ path: `${OUT}/mgr-06-manager-390x844.png` });
  await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
  await page.waitForTimeout(7000);
  await page.evaluate(() => {
    const cs = window.__forgeSmokeTest.getCards();
    cs.queuedCards.push([
      { type: "part", name: "Lumen-X Weapon Floodlight", part: { id: "tac_flashlight", name: "Lumen-X", rarity: "common", effect: { lightBeamMult: 1.85 } } },
      { type: "weapon", name: "WEAPON: BEAM", style: "beam" },
      { type: "part", name: "Quick-Release Mag", part: { id: "fast_mag", name: "Quick-Release Mag", rarity: "common", effect: { reloadMult: 0.72 } } },
    ]);
  });
  await page.waitForTimeout(1200);
  const tray = await page.evaluate(() => {
    const open = !!document.querySelector("#fs-cards.open");
    const rects = Array.from(document.querySelectorAll("#fs-cards .card")).map((el) => {
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) };
    });
    return { open, rects, viewport: innerWidth, docScroll: document.documentElement.scrollWidth };
  });
  if (!tray.open) await fail("tray did not open at 390x844");
  if (tray.rects.length !== 3) await fail(`expected 3 cards, got ${tray.rects.length}`);
  for (const r of tray.rects) {
    if (r.left < 0 || r.right > tray.viewport) await fail(`card clipped at 390: ${JSON.stringify(r)}`);
  }
  if (tray.docScroll > tray.viewport) await fail(`horizontal overflow at 390: scrollWidth ${tray.docScroll}`);
  await page.screenshot({ path: `${OUT}/ui-10-cards-390x844.png` });
  console.log("UI-10 OK  3 cards inside 390px:", JSON.stringify(tray.rects));
  await page.close();
}

// ── desktop: manager counts, results summary, start art, enemy roster ─────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
  await boot(page);

  const art = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("#fs-start img, #fs-start video")).map((el) => ({
      tag: el.tagName, src: el.currentSrc || el.src || "", w: el.naturalWidth || el.videoWidth || 0,
    }));
    return imgs;
  });
  const poster = await page.evaluate(() => {
    const v = document.querySelector("#fs-start video");
    return v ? { poster: v.poster, ready: v.readyState } : null;
  });
  await page.screenshot({ path: `${OUT}/art-06-start-screen.png` });
  console.log("ART-06 start media:", JSON.stringify({ art, poster }));

  await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
  await page.waitForTimeout(1200);
  const mgr = await page.evaluate(() => {
    const q = (s) => document.querySelectorAll(s).length;
    const weaponCards = Array.from(document.querySelectorAll("#cyborg-manager [data-weapons] .mg-item"))
      .map((el) => el.innerText.replace(/\s+/g, " ").trim());
    return {
      attrs: q("#cyborg-manager [data-attrs] button"),
      weapons: q("#cyborg-manager [data-weapons] *"),
      weaponCards,
      perks: q("#cyborg-manager [data-perks] *"),
      attrPoints: document.querySelector("#cyborg-manager [data-attrpts]")?.textContent?.trim(),
      statsText: (document.querySelector("#cyborg-manager .mg-stats")?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 240),
      name: window.__forgeSmokeTest.getManager?.() ? "manager mounted" : "no manager",
    };
  });
  if (mgr.weaponCards.length < 15) await fail(`only ${mgr.weaponCards.length} weapon cards`);
  const withNumbers = mgr.weaponCards.filter((t) => /DMG .* RPM .* MAG/.test(t));
  if (withNumbers.length < 15) await fail(`weapon numbers missing on ${15 - withNumbers.length} cards`);
  console.log("MGR-06 manager:", JSON.stringify({ ...mgr, weaponCards: mgr.weaponCards.slice(0, 3) }));

  const types = await page.evaluate(() => window.__forgeSmokeTest.getEnemyTypes());
  const roster = await page.evaluate((list) => list.map((t) => window.__forgeSmokeTest.spawnType(t)), types);
  console.log("MGR-07 enemy types:", JSON.stringify(types));
  for (const r of roster) {
    if (!r || !(r.hp > 0)) await fail(`archetype ${r?.type || "?"} did not spawn with HP`);
    if (!r.behaviour) await fail(`archetype ${r.type} has no behaviour spec`);
  }
  console.log("MGR-07 spawns:", JSON.stringify(roster.map((r) => `${r.type}:${r.hp}hp/${r.speed}mps`)));

  const legend = await page.evaluate(() => window.__forgeSmokeTest.getLegendaryPool());
  if (!(legend.lightMods.length >= 4 && legend.perks.length >= 4)) await fail("legendary pool is missing entries");
  console.log("MGR-08 legendary pool:", JSON.stringify({ lightMods: legend.lightMods.length, perks: legend.perks.length, legacy: legend.legacy.length }));

  await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.__forgeSmokeTest.hurt(9999));
  await page.waitForTimeout(1500);
  const res = await page.evaluate(() => {
    const st = window.__forgeSmokeTest.getState();
    return {
      phase: st.phase,
      sumOpen: !!document.querySelector("#fs-sum.open"),
      sumText: (document.querySelector("#fs-sum")?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 300),
      bank: st.lastBank || null,
    };
  });
  if (res.phase !== "results") await fail(`expected results phase, got ${res.phase}`);
  if (!res.sumOpen) await fail("between-run summary did not open on results");
  await page.screenshot({ path: `${OUT}/mgr-09-results-summary.png` });
  console.log("MGR-09 results:", JSON.stringify(res));

  // MGR-09 acceptance: results returns to the manager
  await page.keyboard.press("r");
  await page.waitForTimeout(800);
  const back = await page.evaluate(() => window.__forgeSmokeTest.getState().phase);
  if (back !== "loadout") await fail(`results did not return to the manager (phase ${back})`);
  console.log("MGR-09 redeploy ->", back);

  // FX-02/FX-03 acceptance: measured per-frame cost and authored pixel kick
  const fx = await page.evaluate(() => ({ msPerFrame: window.__forgeSmokeTest.benchFx(2000), feel: window.__forgeSmokeTest.getFeel().feel }));
  if (!(fx.msPerFrame < 2)) await fail(`FX cost ${fx.msPerFrame.toFixed(4)} ms/frame exceeds 2 ms`);
  if (!(fx.feel.kickX <= 2 && fx.feel.kickY <= 2)) await fail("authored kick exceeds 2 px");
  console.log("FX-03 cost:", JSON.stringify({ msPerFrame: +fx.msPerFrame.toFixed(4), kickPx: [fx.feel.kickX, fx.feel.kickY], taper: fx.feel.taper }));
  await page.close();
}

if (errors.length) await fail("page errors: " + errors.slice(0, 3).join(" | "));
console.log("EVIDENCE OK");
await browser.close();
