"""Revert split-grip pose and hand-locked gun to the last known-good rifle hold."""
from pathlib import Path

p = Path("src/models.js")
t = p.read_text(encoding="utf-8")

t = t.replace('bones.lArm.rotation.set(-1.619 - clampedTilt * 0.6 + kick * 0.7, -0.774 - clampedYaw * 0.35, 1.31);',
              'bones.lArm.rotation.set(-0.842 - clampedTilt * 0.6 + kick * 0.7, -0.822 - clampedYaw * 0.35, 1.333);')
t = t.replace('bones.lFore.rotation.set(-0.421, -1.245, -0.391);',
              'bones.lFore.rotation.set(-0.921, -0.618, -0.755);')
t = t.replace('gunPivot.position.set(-0.2, 1.42, 0.3);', 'gunPivot.position.set(-0.08, 1.46, 0.16);')

start = t.index("    // The rifle rides the hands: grip locked to the right hand")
end = t.index("  }\n  if (soldier.userData.armBones) {", start)
t = t[:start] + t[end:]

p.write_text(t, encoding="utf-8")
print("reverted gun/hands")
