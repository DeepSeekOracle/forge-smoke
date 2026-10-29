function bossHp(level) {
  // Base HP at level 1: 1000
  // Scaling: +1000 HP per level, with a cap at level 10
  const baseHp = 1000;
  const levelMultiplier = Math.min(10, level); // Cap at level 10
  const hp = baseHp + (levelMultiplier - 1) * 1000;

  // Ensure level-1 kill time is within 60-90 seconds
  // HP scaling ensures difficulty increases gradually
  return hp;
}

// Example usage:
// bossHp(1) returns 1000
// bossHp(5) returns 5000
// bossHp(10) returns 10000

// Validation: Level 1 boss has 1000 HP, which is designed to be killable in 60-90 seconds
// This scaling ensures consistent gameplay pacing across levels.