// Weapon roster: DPS and TTK against the three reference cases (brief 05).
// Writes docs/ROSTER-TTK.md and prints the table.
import { writeFileSync } from "node:fs";
import { TUNING } from "../src/tuning.js";
import { damageAfterArmour, shieldGate, bossHp } from "../src/balance.js";

const RIFLE_HP = TUNING.enemies.rifleman.hp * (TUNING.difficulty.hpMult ?? 1) * (1 + 0.15);
const AIR_HP = TUNING.boss.gunship.hp;
const rows = [];

for (const [id, w] of Object.entries(TUNING.weapons)) {
  const shots = w.pellets || 1;
  const dps = (w.damage * shots) / Math.max(0.01, w.cycle);
  const perShot = damageAfterArmour(w.damage, 0);
  const ttkRifle = ((RIFLE_HP / Math.max(1, perShot * shots)) * w.cycle).toFixed(2);
  // shield front: 0 unless the weapon has pierce/explosive; report the fraction that gets through
  const pierce = Math.max(0, Number(w.shieldPierce) || 0);
  const shieldDmg = shieldGate(w.damage, { shielded: true, flanked: false, pierce });
  const ttkShield = shieldDmg <= 0 ? "blocked" : ((RIFLE_HP / Math.max(1, shieldDmg * shots)) * w.cycle).toFixed(2);
  const airMult = Number(w.airDamageMult) || 1;
  const ttkAir = ((AIR_HP / Math.max(1, perShot * shots * airMult)) * w.cycle).toFixed(1);
  rows.push({ id, dps: Math.round(dps), rifle: ttkRifle, shield: ttkShield, air: ttkAir, weakness: w.shieldPierce ? "short range" : w.airDamageMult ? "ground targets" : "shield front" });
}

rows.sort((a, b) => b.dps - a.dps);
const header = "| style | DPS | TTK rifleman (s) | TTK shield front (s) | TTK gunship (s) | weakness |\n|---|---|---|---|---|---|\n";
const body = rows.map((r) => `| ${r.id} | ${r.dps} | ${r.rifle} | ${r.shield} | ${r.air} | ${r.weakness} |`).join("\n");
const md = `# FORGE SMOKE — weapon roster TTK (brief 05)

Rifleman HP ${RIFLE_HP.toFixed(0)} (base ${TUNING.enemies.rifleman.hp} x hpMult ${TUNING.difficulty.hpMult}), gunship HP ${AIR_HP}.
Damage uses the live armour model; shield column is damage through the front arc.

${header}${body}

Note: before MGR-06, nine of these styles fell back to spray stats, so this table is the first time
each style has its own numbers. DPS is paper DPS (no reload, travel or misses).
`;
writeFileSync("docs/ROSTER-TTK.md", md);
console.log(header + body);
