"""Enemy anti-jitter movement: windowed stuck detection + tangential detour."""
from pathlib import Path

p = Path("src/enemies.js")
t = p.read_text(encoding="utf-8")

# detour steering takes over before the collision step
anchor = '''        const colRadius = enemy.type === "mech" ? 1.05 : enemy.type === "shieldbearer" ? 0.75 : 0.55;'''
assert anchor in t
t = t.replace(anchor, '''        // Active detour: slide tangentially around whatever has been blocking this body.
        if (enemy._detour && enemy._detour.t > 0) {
          enemy._detour.t -= dt;
          vx = enemy._detour.x * spd;
          vz = enemy._detour.z * spd;
        }

''' + anchor, 1)

# replace the per-frame stuck breaker with a 0.6 s windowed check
old_start = t.index("      // stuck-breaker: cover can wedge an enemy against a wall")
old_end = t.index("      } else {\n        enemy.position.x += enemy.velocity.x * dt;", old_start)
new_block = '''      // stuck-breaker: cover wedges bodies into a steer/push loop that reads as vibrating in place.
      // A per-frame check cannot see that (the jitter moves > 2 cm every frame), so compare against a
      // 0.6 s reference point: if the net gain is tiny while it wanted to move, detour tangentially.
      const distNow = Math.hypot(playerPos.x - enemy.position.x, playerPos.z - enemy.position.z);
      enemy._movCheck = (enemy._movCheck || 0) + dt;
      if (enemy._movCheck >= 0.6) {
        enemy._movCheck = 0;
        const rx = enemy._movRefX ?? enemy.position.x;
        const rz = enemy._movRefZ ?? enemy.position.z;
        const net = Math.hypot(enemy.position.x - rx, enemy.position.z - rz);
        const wantsMove = spd > 0.6 && distNow > 2.4;
        if (wantsMove && net < 0.30) {
          const tdx = playerPos.x - enemy.position.x;
          const tdz = playerPos.z - enemy.position.z;
          const tl = Math.hypot(tdx, tdz) || 1;
          const side = ((enemy.slot || 0) % 2 === 0) ? 1 : -1;
          enemy._detour = { x: (-tdz / tl) * side, z: (tdx / tl) * side, t: 0.9 };
          enemy._stuckCount = (enemy._stuckCount || 0) + 1;
          // after three failed windows, step it 1.2 m along the detour so it clears the corner
          if (enemy._stuckCount >= 3) {
            const nx = enemy.position.x + enemy._detour.x * 1.2;
            const nz = enemy.position.z + enemy._detour.z * 1.2;
            const probe = { x: nx, z: nz };
            resolveObstacleCollision(probe, colRadius, arenaColliders);
            if (Math.hypot(probe.x - nx, probe.z - nz) < 0.25) {
              enemy.position.x = probe.x;
              enemy.position.z = probe.z;
            }
            enemy._stuckCount = 0;
          }
        } else {
          enemy._stuckCount = 0;
        }
        enemy._movRefX = enemy.position.x;
        enemy._movRefZ = enemy.position.z;
      }
''' 
t = t[:old_start] + new_block + t[old_end:]

# hard clamp the steer vector and speed so a bad steering result cannot rocket a body across the map
t = t.replace('''          const steered = steerAroundObstacles(enemy.position, vx / spd, vz / spd, colRadius, arenaColliders);
          enemy.position.x += steered.x * spd * dt;
          enemy.position.z += steered.z * spd * dt;''','''          const steered = steerAroundObstacles(enemy.position, vx / spd, vz / spd, colRadius, arenaColliders);
          const sl = Math.hypot(steered.x, steered.z) || 1;
          const cap = Math.min(1, sl);
          enemy.position.x += (steered.x / sl) * cap * spd * dt;
          enemy.position.z += (steered.z / sl) * cap * spd * dt;''')

p.write_text(t, encoding="utf-8")
print("enemy movement fix")
