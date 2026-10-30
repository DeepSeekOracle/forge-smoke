"""Enemy movement polish: free spawn spots, per-step blocked detection, smooth facing."""
from pathlib import Path

p = Path("src/enemies.js")
t = p.read_text(encoding="utf-8")

# ── spawn on a genuinely free spot (no resolve-pop on the first frame) ──
old = '''    const angle = this.rng() * Math.PI * 2;
    const radius = 18 + this.rng() * 30;
    const position = {
      x: playerPos.x + Math.cos(angle) * radius,
      z: playerPos.z + Math.sin(angle) * radius,
      clone() { return { x: this.x, z: this.z }; },
    };
    resolveObstacleCollision(position, 0.85, arenaColliders);'''
new = '''    let position = null;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const angle = this.rng() * Math.PI * 2;
      const radius = 18 + this.rng() * 30;
      const candidate = {
        x: playerPos.x + Math.cos(angle) * radius,
        z: playerPos.z + Math.sin(angle) * radius,
        clone() { return { x: this.x, z: this.z }; },
      };
      const ox = candidate.x;
      const oz = candidate.z;
      resolveObstacleCollision(candidate, 0.85, arenaColliders);
      // a spawn inside a container pops the body out on frame one, which reads as a teleport
      if (Math.hypot(candidate.x - ox, candidate.z - oz) < 0.35) { position = candidate; break; }
      if (!position) position = candidate;
    }'''
assert old in t
t = t.replace(old, new, 1)

# ── blocked detection per step + no teleport nudge ──
old_mov = '''        const colRadius = enemy.type === "mech" ? 1.05 : enemy.type === "shieldbearer" ? 0.75 : 0.55;
        enemy._move = { x: vx, z: vz, spd };
        if (spd > 0.01) {
          const steered = steerAroundObstacles(enemy.position, vx / spd, vz / spd, colRadius, arenaColliders);
          const sl = Math.hypot(steered.x, steered.z) || 1;
          const cap = Math.min(1, sl);
          enemy.position.x += (steered.x / sl) * cap * spd * dt;
          enemy.position.z += (steered.z / sl) * cap * spd * dt;
        }
        resolveObstacleCollision(enemy.position, colRadius, arenaColliders);'''
new_mov = '''        const colRadius = enemy.type === "mech" ? 1.05 : enemy.type === "shieldbearer" ? 0.75 : 0.55;
        enemy._move = { x: vx, z: vz, spd };
        const stepX0 = enemy.position.x;
        const stepZ0 = enemy.position.z;
        if (spd > 0.01) {
          const steered = steerAroundObstacles(enemy.position, vx / spd, vz / spd, colRadius, arenaColliders);
          const sl = Math.hypot(steered.x, steered.z) || 1;
          const cap = Math.min(1, sl);
          enemy.position.x += (steered.x / sl) * cap * spd * dt;
          enemy.position.z += (steered.z / sl) * cap * spd * dt;
        }
        resolveObstacleCollision(enemy.position, colRadius, arenaColliders);
        // If a body wanted to move but the world ate the step, remember it; 0.7 s of that is a wedge.
        const actualStep = Math.hypot(enemy.position.x - stepX0, enemy.position.z - stepZ0);
        const wantedStep = spd * dt;
        if (wantedStep > 1e-4 && actualStep < wantedStep * 0.35) enemy._blocked = (enemy._blocked || 0) + dt;
        else enemy._blocked = Math.max(0, (enemy._blocked || 0) - dt * 2);
        if (enemy._blocked > 0.7 && (!enemy._detour || enemy._detour.t <= 0)) {
          const tdx = playerPos.x - enemy.position.x;
          const tdz = playerPos.z - enemy.position.z;
          const tl = Math.hypot(tdx, tdz) || 1;
          const side = ((enemy.slot || 0) % 2 === 0) ? 1 : -1;
          enemy._detour = { x: (-tdz / tl) * side, z: (tdx / tl) * side, t: 1.2 };
          enemy._blocked = 0;
        }'''
assert old_mov in t
t = t.replace(old_mov, new_mov, 1)

# drop the abrupt 1.2 m nudge from the older windowed check
old_nudge = '''          // after three failed windows, step it 1.2 m along the detour so it clears the corner
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
          }'''
assert old_nudge in t
t = t.replace(old_nudge, "", 1)

# ── smooth facing instead of an instant snap ──
old_face = '''      const mesh = this.enemyMeshes.get(enemy);
      if (mesh) {
        mesh.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
        mesh.rotation.y = Math.atan2(playerPos.x - enemy.position.x, playerPos.z - enemy.position.z);
        animateEnemyMesh(enemy, mesh, dt);
      }'''
new_face = '''      const mesh = this.enemyMeshes.get(enemy);
      if (mesh) {
        mesh.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
        const wantYaw = Math.atan2(playerPos.x - enemy.position.x, playerPos.z - enemy.position.z);
        let dYaw = wantYaw - mesh.rotation.y;
        dYaw = Math.atan2(Math.sin(dYaw), Math.cos(dYaw));
        mesh.rotation.y += dYaw * Math.min(1, dt * 9);
        animateEnemyMesh(enemy, mesh, dt);
      }'''
assert old_face in t
t = t.replace(old_face, new_face, 1)

p.write_text(t, encoding="utf-8")
print("enemy movement polish")
