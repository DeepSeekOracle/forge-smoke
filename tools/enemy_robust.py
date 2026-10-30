"""Enemy robustness: animation fallback + minimum approach for walkers."""
from pathlib import Path

# 1) animation fallback so a rig never slides in T-pose
p = Path("src/models.js")
t = p.read_text(encoding="utf-8")
old = '''      const clip = findClip(gltf.animations, clipNames);
      if (clip) {'''
new = '''      let clip = findClip(gltf.animations, clipNames);
      // A rig whose clip names do not match would otherwise stand in its bind pose while the body
      // slides around — the "enemy glides / does not move" look. Fall back to its first clip.
      if (!clip && gltf.animations.length) clip = gltf.animations[0];
      if (clip) {'''
assert old in t
t = t.replace(old, new, 1)
p.write_text(t, encoding="utf-8")

# 2) walkers that stall at range get a floor approach speed
p = Path("src/enemies.js")
t = p.read_text(encoding="utf-8")
old = '''        const dToPlayer = Math.hypot(enemy.position.x - playerPos.x, enemy.position.z - playerPos.z) || 1;'''
new = '''        const dToPlayer = Math.hypot(enemy.position.x - playerPos.x, enemy.position.z - playerPos.z) || 1;
        // A walker that has stalled far away (wedged branch of its behaviour, blocked by cover) gets
        // a floor approach speed so it never reads as a frozen prop.
        const WALKERS = enemy.type === "rifleman" || enemy.type === "sapper" || enemy.type === "shieldbearer" || enemy.type === "spotter";
        if (WALKERS && spd < 0.35 && dToPlayer > 3.2) {
          const ax = playerPos.x - enemy.position.x;
          const az = playerPos.z - enemy.position.z;
          const al = Math.hypot(ax, az) || 1;
          spd = Math.max(0.75, (Number(enemy.speed) || 1.2) * 0.8);
          vx = (ax / al) * spd;
          vz = (az / al) * spd;
        }'''
assert old in t
t = t.replace(old, new, 1)
p.write_text(t, encoding="utf-8")
print("enemy robustness")
