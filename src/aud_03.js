const weaponFamilies = [
  'spray', 'cone', 'pierce',
  'ricochet', 'arc', 'beam',
  'chain', 'burst', 'spin-up',
  'rail', 'flamer', 'sentry'
];

const weaponVariants = [
  { style: 'spray', pitch: 0.94, color: '#ff6b6b' },
  { style: 'cone', pitch: 1.06, color: '#4ecdc4' },
  { style: 'pierce', pitch: 0.98, color: '#45b7d1' }
];

export function generateWeaponReport(family, variant) {
  const familyIndex = weaponFamilies.indexOf(family);
  if (familyIndex === -1) return null;

  const variantData = weaponVariants[variant];
  if (!variantData) return null;

  const pitch = variantData.pitch;
  const color = variantData.color;

  return {
    family,
    variant,
    pitch: pitch,
    color,
    description: `Weapon ${family} variant ${variant} with ${pitch.toFixed(2)} pitch and ${color} color`,
    drawCalls: 1,
    triangles: 1000,
    textureSize: 1024,
    frameRate: 60
  };
}

// Example usage:
// generateWeaponReport('spray', 0);
// generateWeaponReport('cone', 1);
// generateWeaponReport('pierce', 2);
