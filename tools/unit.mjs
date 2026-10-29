// Pure-logic assertions used by tools/gate.py before the browser regression.
// Exits non-zero on the first failed claim; prints one line per checked group.
import { TUNING } from "../src/tuning.js";
import { xpThreshold, bossHp } from "../src/balance.js";
import { STYLE_FEEL, feelFor, tracerTaper } from "../src/stylefeel.js";

let checks = 0;
function ok(cond, msg) {
  checks += 1;
  if (!cond) {
    console.log("UNIT FAIL " + msg);
    process.exit(1);
  }
}

// MATH-04 — one pacing block, thresholds 300 / 600 / 900, aliases equal to it
const p = TUNING.progression.cardPacing;
ok(p && p.levelXpBase === 300 && p.levelXpPerLevel === 300, "cardPacing constants missing");
ok(xpThreshold(1) === 300 && xpThreshold(2) === 600 && xpThreshold(3) === 900 && xpThreshold(5) === 1500,
  "xpThreshold is not 300/600/900/1500");
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

console.log(`UNIT OK  ${checks} checks`);
