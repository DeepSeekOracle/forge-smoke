export const calculateDamage = (baseDamage, armor, criticalChance, criticalMultiplier, damageType) => {
  // Base damage calculation
  let damage = baseDamage;

  // Apply critical hit multiplier
  if (Math.random() < criticalChance) {
    damage *= criticalMultiplier;
  }

  // Apply armor reduction based on damage type
  if (damageType === 'pierce') {
    damage -= armor * 0.3;
  } else if (damageType === 'blunt') {
    damage -= armor * 0.5;
  } else {
    damage -= armor * 0.2;
  }

  // Ensure damage is non-negative
  return Math.max(0, damage);
};

// Shield gate logic (only shield logic in shieldGate)
export const shieldGate = (damage, shieldValue) => {
  // Shield absorbs only if damage is above threshold
  if (damage > shieldValue) {
    return damage - shieldValue;
  }
  return 0;
};

// Total damage after all effects
export const finalDamage = (damage, armor, criticalChance, criticalMultiplier, damageType, shieldValue) => {
  const rawDamage = calculateDamage(damage, armor, criticalChance, criticalMultiplier, damageType);
  return shieldGate(rawDamage, shieldValue);
};

// Test case: TTK (Time to Kill) calculation
export const calculateTTK = (health, damagePerSecond, damageType) => {
  const effectiveDamage = damagePerSecond * (1 - (damageType === 'pierce' ? 0.3 : 0.2));
  return health / effectiveDamage;
}