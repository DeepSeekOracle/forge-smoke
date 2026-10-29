// TUNE-01: seeded runs through the real game loop, stepped without waiting wall-clock.
// Usage: node tools/tune.mjs [runs] [capSeconds]
// Prints a markdown table row per run and writes docs/TUNE.md + docs/evidence/tune-runs.json.
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const RUNS = Math.max(1, Number(process.argv[2]) || 20);
const CAP = Math.max(30, Number(process.argv[3]) || 180);
const BATCH = Math.max(1, Number(process.env.TUNE_BATCH) || 12); // simulated seconds per step() call
mkdirSync("docs/evidence", { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const rows = [];

for (let seed = 1; seed <= RUNS; seed += 1) {
  const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
  await page.goto(`${BASE}?test=1&cb=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(6500);
  await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
  await page.waitForTimeout(900);
  // a fresh seed per run; startRun reads state.seed
  await page.evaluate((s) => { window.__forgeSmokeTest.getState().seed = s; }, seed);
  await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.__studio?.pause?.());

  let t = 0;
  let last = null;
  while (t < CAP) {
    const res = await page.evaluate((batch) => {
      window.__studio.step(batch * 1000);
      const st = window.__forgeSmokeTest.getState();
      // take a card whenever the tray is up, like a player would
      if (document.querySelector("#fs-cards.open")) document.querySelector("#fs-cards .card")?.click();
      const cs = window.__forgeSmokeTest.getCards();
      return {
        phase: st.phase,
        runTime: +window.__forgeSmokeTest.getPilot().runTime.toFixed(1),
        kills: st.kills,
        level: cs.level,
        xp: Math.round(cs.xp),
        nextLevelXp: Math.round(cs.nextLevelXp),
        bossSpawned: Boolean(st.bossSpawned),
        bossHp: st.bossEnemy ? Math.round(st.bossEnemy.hp) : null,
        cleared: Boolean(st.arenaCleared),
        health: Math.round(st.health),
        map: window.__forgeSmokeTest.getLighting().map,
      };
    }, BATCH);
    t += BATCH;
    last = res;
    if (res.phase !== "playing") break;
  }
  const cardsOffered = Math.max(0, last.level - 1);
  const row = {
    seed,
    map: last.map,
    kills: last.kills,
    seconds: last.runTime,
    level: last.level,
    xp: last.xp,
    next: last.nextLevelXp,
    cards: cardsOffered,
    boss: last.bossSpawned ? "yes" : "no",
    cleared: last.cleared ? "yes" : "no",
    outcome: last.phase === "playing" ? "alive@cap" : last.health <= 0 ? "dead" : last.phase,
    errors: errors.length,
  };
  rows.push(row);
  console.log(`${seed}\t${row.map}\t${row.kills}\t${row.seconds}\tL${row.level}\t${row.xp}/${row.next}xp\t${row.cards} cards\t${row.boss}\t${row.cleared}\t${row.outcome}`);
  await page.close();
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};
const summary = {
  runs: rows.length,
  medianSeconds: median(rows.map((r) => r.seconds)),
  medianCards: median(rows.map((r) => r.cards)),
  bossReachedPct: Math.round((rows.filter((r) => r.boss === "yes").length / rows.length) * 100),
  clearedPct: Math.round((rows.filter((r) => r.cleared === "yes").length / rows.length) * 100),
  errors: rows.reduce((n, r) => n + r.errors, 0),
};
console.log("TUNE SUMMARY " + JSON.stringify(summary));

const header = "| run | seed | map | kills | time | level | cards | boss? | cleared? | outcome |\n|---|---|---|---|---|---|---|---|---|---|\n";
const body = rows.map((r, i) => `| ${i + 1} | ${r.seed} | ${r.map} | ${r.kills} | ${r.seconds}s | ${r.level} | ${r.cards} | ${r.boss} | ${r.cleared} | ${r.outcome} |`).join("\n");
const md = `# FORGE SMOKE — TUNE-01 seeded run table\n\n${header}${body}\n\n**Summary:** ${JSON.stringify(summary)}\n`;
writeFileSync("docs/TUNE.md", md);
writeFileSync("docs/evidence/tune-runs.json", JSON.stringify({ summary, rows }, null, 2));
await browser.close();
