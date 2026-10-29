// Pure-logic assertions used by tools/gate.py before the browser regression.
// Exits non-zero on the first failed claim; prints one line per checked group.
import { TUNING } from "../src/tuning.js";
import { xpThreshold, bossHp } from "../src/balance.js";
import { STYLE_FEEL, feelFor, tracerTaper } from "../src/stylefeel.js";
import { MAPS, validateMap, selectMap } from "../src/maps.js";
import { STYLE_VFX } from "../src/weapons.js";
import { readFileSync, statSync, existsSync } from "node:fs";

let checks = 0;
function ok(cond, msg) {
  checks += 1;
  if (!cond) {
    console.log("UNIT FAIL " + msg);
    process.exit(1);
  }
}

// MATH-04 — one pacing block, triangular thresholds 300 / 900 / 1800 / 4500
const p = TUNING.progression.cardPacing;
ok(p && p.levelXpBase === 300 && p.levelXpShape === "triangular", "cardPacing constants missing");
ok(xpThreshold(1) === 300 && xpThreshold(2) === 900 && xpThreshold(3) === 1800 && xpThreshold(5) === 4500,
  "xpThreshold is not 300/900/1800/4500");
ok(TUNING.progression.levelBaseXp === p.levelXpBase, "levelBaseXp drifted from cardPacing");
ok(TUNING.progression.cardChoices === p.cardChoices && TUNING.progression.maxQueuedCards === p.maxQueuedCards,
  "cardChoices/maxQueuedCards drifted from cardPacing");
ok(TUNING.progression.xpPerKill > 0 && TUNING.progression.xpPerDamage > 0 && TUNING.progression.xpPerSecond > 0,
  "XP gain rates are not all wired");

// MATH-03 — boss HP parity at level 1 (7800 / 10400), growth above it
ok(bossHp(2600, 1) === 7800, "bossHp(2600,1) is not 7800");
ok(bossHp(3900, 1) === 10400, "bossHp(3900,1) is not 10400");
ok(bossHp(2600, 3) > bossHp(2600, 1), "bossHp does not grow with level");

// FX-03 — every style kicks <= 2 screen px and tapers visibly
for (const [name, feel] of Object.entries(STYLE_FEEL)) {
  ok(feel.kickX <= 2 && feel.kickY <= 2, `${name} kick exceeds 2 px (${feel.kickX}/${feel.kickY})`);
  ok(feel.taper < 0.7, `${name} taper is not visible (${feel.taper})`);
  const t0 = tracerTaper(name, 0);
  const t5 = tracerTaper(name, 0.5);
  const t1 = tracerTaper(name, 1);
  ok(Math.abs(t0 - 1) < 1e-6, `${name} tracer does not start at full width`);
  ok(t1 < t5 && t5 < t0, `${name} tracer taper is not monotonic`);
}
ok(feelFor("does-not-exist") === STYLE_FEEL.default, "unknown style has no fallback feel");

// FX-02 — the case pool is a fixed size and exists in tuning
ok(TUNING.feel.casingCap >= 1, "casingCap missing from tuning");

// Enemy roster — at least three archetypes with distinct behaviour strings
const behaviours = new Set(
  Object.values(TUNING.enemies).map((e) => e && e.behaviour).filter(Boolean)
);
ok(behaviours.size >= 3, `only ${behaviours.size} distinct enemy behaviours`);

// MAP-01..04 — three layouts, cover only at 17-34 m, clear centre, the brief's prop counts
ok(MAPS.length === 3, `expected 3 maps, got ${MAPS.length}`);
for (const m of MAPS) {
  const v = validateMap(m);
  ok(v.ok, `${m.id} placement: ${v.problems.join("; ")}`);
  ok(v.minRadius >= 16, `${m.id} cover inside 16 m (${v.minRadius})`);
  ok(v.maxRadius <= 34, `${m.id} cover outside 34 m (${v.maxRadius})`);
  ok(m.centerClear >= 10, `${m.id} centre pad smaller than 10 m`);
}
const depot = MAPS.find((m) => m.id === "depot");
ok(depot.props.filter((p) => p.kind === "container").length === 6, "DEPOT needs 6 containers");
ok(depot.props.filter((p) => p.kind === "barrier").length === 4, "DEPOT needs 4 barriers");
ok(depot.ruins.length === 3, "DEPOT needs 3 ruin clusters");
const yard = MAPS.find((m) => m.id === "yard");
ok(yard.props.length === 5, `YARD needs 5 props, has ${yard.props.length}`);
ok(yard.fogScale > 1, "YARD should have thicker fog");
const foundry = MAPS.find((m) => m.id === "foundry");
ok(foundry.props.length === 10, `FOUNDRY needs 10 props, has ${foundry.props.length}`);
ok(foundry.hazardRing > foundry.centerClear, "FOUNDRY hazard ring must sit outside the centre pad");

// MAP-04 — selection is deterministic by seed, rotates per run, and honours a forced map
ok(selectMap({ seed: 7, run: 3 }).id === selectMap({ seed: 7, run: 3 }).id, "selectMap is not deterministic");
ok(new Set([0, 1, 2].map((r) => selectMap({ seed: 4, run: r }).id)).size === 3, "map rotation does not cover all three");
ok(selectMap({ forced: "foundry" }).id === "foundry", "forced map is ignored");

// MGR-06 — every style has its own numbers (no more nine styles sharing spray stats)
const styleKeys = Object.keys(TUNING.weapons);
ok(styleKeys.length >= 15, `only ${styleKeys.length} weapon configs`);
for (const key of styleKeys) {
  const w = TUNING.weapons[key];
  ok(w.damage > 0 && w.cycle > 0 && w.magazine > 0, `${key} has no usable damage/cycle/magazine`);
}

// AUD-03 — at least six styles carry distinct sample files, every sample is mapped and on disk,
// and the added audio stays under 4 MB
const sounds = new Set(Object.values(STYLE_VFX).map((v) => v.sound));
ok(sounds.size >= 6, `only ${sounds.size} distinct weapon samples`);
const audioSrc = readFileSync(new URL("../src/audio.js", import.meta.url), "utf8");
for (const s of sounds) {
  ok(audioSrc.includes(`${s}:`), `SAMPLE_MAP has no entry for ${s}`);
}
const samplePaths = [...audioSrc.matchAll(/"\.\/assets\/sfx\/([^"]+)"/g)].map((m) => m[1]);
let audioBytes = 0;
for (const f of samplePaths) {
  const u = new URL(`../assets/sfx/${f}`, import.meta.url);
  ok(existsSync(u), `missing audio file ${f}`);
  audioBytes += statSync(u).size;
}
ok(audioBytes < 4 * 1024 * 1024, `sample bank is ${(audioBytes / 1048576).toFixed(2)} MB (cap 4 MB)`);

console.log(`UNIT OK  ${checks} checks  (audio bank ${(audioBytes / 1024).toFixed(0)} KB)`);
