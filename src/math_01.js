/*
 * MATH-01: Pure Combat Module
 * Web 2D Engine - Forge Smoke
 * Implements core combat math functions:
 * - armourSoak, shieldGate, spread, falloff, xpForRun, bossHp, timeToKill
 * - Unit table printed for verification
 */

// Constants for combat math
const COMBAT_CONSTANTS = {
  BASE_ARMOUR_SOAK: 0.7,
  SHIELD_GATE_FACTOR: 0.3,
  SPREAD_MIN: 0.5,
  SPREAD_MAX: 2.0,
  FALLOFF_RATE: 0.05,
  XP_FOR_RUN_BASE: 100,
  XP_FOR_RUN_MULTIPLIER: 0.02,
  BOSS_HP_BASE: 1000,
  BOSS_HP_MULTIPLIER: 1.5,
  TIME_TO_KILL_BASE: 30,
  TIME_TO_KILL_MULTIPLIER: 0.8
};

// Core combat functions

/**
 * Calculates how much armour is soaked by a shot
 * @param {number} damage - Base damage of the shot
 * @param {number} armour - Current armour value
 * @returns {number} Soaked damage
 */
function armourSoak(damage, armour) {
  const soak = Math.min(damage, armour * COMBAT_CONSTANTS.BASE_ARMOUR_SOAK);
  return soak;
}

/**
 * Calculates shield gate effectiveness
 * @param {number} shieldStrength - Shield strength value
 * @param {number} damage - Incoming damage
 * @returns {number} Reduced damage
 */
function shieldGate(shieldStrength, damage) {
  const reduction = damage * (COMBAT_CONSTANTS.SHIELD_GATE_FACTOR * shieldStrength);
  return Math.max(0, damage - reduction);
}

/**
 * Calculates spread of a weapon's fire
 * @param {number} baseSpread - Base spread value
 * @param {number} weaponType - Weapon type (0-11)
 * @returns {number} Spread value
 */
function spread(baseSpread, weaponType) {
  const spread = baseSpread + (weaponType % 3) * 0.3;
  return Math.max(COMBAT_CONSTANTS.SPREAD_MIN, Math.min(COMBAT_CONSTANTS.SPREAD_MAX, spread));
}

/**
 * Calculates falloff based on distance
 * @param {number} distance - Distance from target
 * @param {number} baseDamage - Base damage
 * @returns {number} Reduced damage
 */
function falloff(distance, baseDamage) {
  const falloffDamage = baseDamage * Math.exp(-distance * COMBAT_CONSTANTS.FALLOFF_RATE);
  return Math.max(0, falloffDamage);
}

/**
 * Calculates XP gained for completing a run
 * @param {number} runDuration - Duration of the run in seconds
 * @param {number} difficulty - Difficulty level (1-5)
 * @returns {number} XP gained
 */
function xpForRun(runDuration, difficulty) {
  const baseXp = COMBAT_CONSTANTS.XP_FOR_RUN_BASE;
  const multiplier = COMBAT_CONSTANTS.XP_FOR_RUN_MULTIPLIER * difficulty;
  return baseXp + (runDuration * multiplier);
}

/**
 * Calculates boss HP based on level and difficulty
 * @param {number} level - Current level
 * @param {number} difficulty - Difficulty level (1-5)
 * @returns {number} Boss HP
 */
function bossHp(level, difficulty) {
  const baseHp = COMBAT_CONSTANTS.BOSS_HP_BASE;
  const multiplier = COMBAT_CONSTANTS.BOSS_HP_MULTIPLIER * difficulty;
  return baseHp * Math.pow(multiplier, level);
}

/**
 * Calculates time to kill the boss
 * @param {number} bossHp - Boss HP
 * @param {number} damagePerSecond - Damage per second
 * @returns {number} Time to kill in seconds
 */
function timeToKill(bossHp, damagePerSecond) {
  const timeToKill = bossHp / damagePerSecond;
  return Math.max(COMBAT_CONSTANTS.TIME_TO_KILL_BASE * COMBAT_CONSTANTS.TIME_TO_KILL_MULTIPLIER, timeToKill);
}

// Unit table for verification
function printUnitTable() {
  console.log('=== COMBAT MATH UNIT TABLE ===');
  console.log('\n| Function | Input | Output |');
  console.log('|--------|-------|--------|');
  console.log('| armourSoak | damage, armour | soaked |');
  console.log('| shieldGate | shieldStrength, damage | reducedDamage |');
  console.log('| spread | baseSpread, weaponType | spread |');
  console.log('| falloff | distance, baseDamage | reducedDamage |');
  console.log('| xpForRun | runDuration, difficulty | xp |');
  console.log('| bossHp | level, difficulty | hp |');
  console.log('| timeToKill | bossHp, damagePerSecond | time |');
  console.log('\n');
}

// Export functions for use in game logic
module.exports = {
  armourSoak,
  shieldGate,
  spread,
  falloff,
  xpForRun,
  bossHp,
  timeToKill,
  printUnitTable
};