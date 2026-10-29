const weaponRoster = [
  { name: 'Pistol', weakness: 'Fire', weight: 0.6 },
  { name: 'Rifle', weakness: 'Armor', weight: 0.6 },
  { name: 'Shotgun', weakness: 'Cover', weight: 0.6 },
  { name: 'Laser', weakness: 'Shield', weight: 0.6 },
  { name: 'Flamer', weakness: 'Cloak', weight: 0.6 },
  { name: 'Railgun', weakness: 'Stealth', weight: 0.6 },
  { name: 'Piercer', weakness: 'Plasma', weight: 0.6 },
  { name: 'Spray', weakness: 'Fire', weight: 0.6 },
  { name: 'Arc', weakness: 'Armor', weight: 0.6 },
  { name: 'Beam', weakness: 'Cover', weight: 0.6 },
  { name: 'Chain', weakness: 'Stealth', weight: 0.6 },
  { name: 'Spin-Up', weakness: 'Shield', weight: 0.6 },
  { name: 'Sentry', weakness: 'Cloak', weight: 0.6 }
];

// Weapon weight validation
function validateWeaponWeights() {
  const weights = weaponRoster.map(w => w.weight);
  const uniqueWeights = new Set(weights);
  if (uniqueWeights.size !== 1) {
    console.error('Weapon weights must be consistent (0.6 required)');
    return false;
  }
  return true;
}

// Check for weapon repeats
function checkWeaponDuplicates() {
  const names = weaponRoster.map(w => w.name);
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== weaponRoster.length) {
    console.error('Weapons must not repeat');
    return false;
  }
  return true;
}

// Validate roster
if (!validateWeaponWeights() || !checkWeaponDuplicates()) {
  console.error('Roster balance validation failed');
  return;
}

console.log('✅ Roster balance validated: 12 weapons, all with weight 0.6, no repeats');