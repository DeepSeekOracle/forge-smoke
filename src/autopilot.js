/**
 * FORGE SMOKE — AUTOPILOT (MOV-01)
 *
 * The cyborg fights itself. Firing already auto-targets the nearest threat (main.js `nearest()` +
 * `shoot()`), so the pilot only owns MOVEMENT: hold a preferred engagement range, circle to keep
 * angles changing, keep clear of other bodies, and break off when integrity is low.
 *
 * Steering is arrive + seek + separation, with a critically damped velocity so the body reads as
 * deliberate rather than frantic. There are no capture zones and no defend-the-location objective:
 * the fighter's job is the fight.
 *
 *   desired = seek(target, idealRange) + separation(nearby enemies) * w_s
 *   velocity = damp(velocity, desired * speed, k)
 *   one frame never has zero velocity while a live target is more than 2 m away
 */

export const PILOT_PROFILE = {
  idealRange: 9.5,
  bossRange: 13.5,      // bosses are fought from further out
  bossStrafe: 1.05,     // how hard it orbits a boss
  strafeBias: 0.8,      // how much of the motion is tangential (orbit) vs radial (close/open)
  retreatHealth: 0.35,  // below this fraction of integrity it disengages
  wanderBias: 0.25,
  separationRadius: 2.5,
  separationWeight: 1.15,
  damping: 6,           // critically damped k from the movement brief
  minSpeed: 0.35,       // floor that prevents "standing still with a target alive"
};

/** Pick the target the pilot cares about: a live boss outranks everything, then nearest threat. */
export function pickTarget(state, enemyManager) {
  if (!enemyManager || !enemyManager.enemies) return null;
  const boss = state.bossEnemy;
  if (boss && boss.hp > 0 && enemyManager.enemies.includes(boss)) return boss;
  if (typeof enemyManager.findNearest === "function") {
    return enemyManager.findNearest(state.pos, state.yaw, 42, Math.PI * 2) || null;
  }
  let best = null;
  let bestD = Infinity;
  for (const e of enemyManager.enemies) {
    if (!e || !e.mesh || e.dead) continue;
    const d = Math.hypot(e.mesh.position.x - state.pos.x, e.mesh.position.z - state.pos.z);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}

/** Push away from every body inside `radius`; returns a weight-1 vector (or zero). */
export function separation(state, enemyManager, radius = PILOT_PROFILE.separationRadius) {
  const out = { x: 0, z: 0, n: 0 };
  const list = enemyManager?.enemies || [];
  for (const e of list) {
    if (!e || !e.mesh || e.hp <= 0) continue;
    const dx = state.pos.x - e.mesh.position.x;
    const dz = state.pos.z - e.mesh.position.z;
    const d = Math.hypot(dx, dz);
    if (d > 0.001 && d < radius) {
      const w = (radius - d) / radius;
      out.x += (dx / d) * w;
      out.z += (dz / d) * w;
      out.n += 1;
    }
  }
  const len = Math.hypot(out.x, out.z) || 1;
  return { x: out.x / len, z: out.z / len, n: out.n };
}

function lowIntegrityFor(state, profile) {
  return state.health <= (state.maxHealth || 100) * (profile.retreatHealth || 0.35);
}

/**
 * Compute this frame's movement intent. Returns a normalised {mx, mz} world direction plus
 * diagnostics the HUD/tests can read ("RANGE", "STRAFE", "DISENGAGE", "BOSS").
 */
export function pilot(state, enemyManager, dt, profile = PILOT_PROFILE) {
  const out = { mx: 0, mz: 0, mode: "hold", target: null, distance: Infinity };
  const target = pickTarget(state, enemyManager);

  if (!target || !target.mesh) {
    // no threat: drift back toward the arena centre so it never parks against a wall
    const r = Math.hypot(state.pos.x, state.pos.z) || 1;
    out.mx = (-state.pos.x / r) * (profile.wanderBias || 0.25);
    out.mz = (-state.pos.z / r) * (profile.wanderBias || 0.25);
    out.mode = "patrol";
    out.hasTarget = false;
    out.throttle = 0.4;
    state.pilotVel = { x: 0, z: 0 };
    return out;
  }
  out.target = target;
  out.targetX = target.mesh.position.x;
  out.targetZ = target.mesh.position.z;

  const dx = target.mesh.position.x - state.pos.x;
  const dz = target.mesh.position.z - state.pos.z;
  const dist = Math.hypot(dx, dz) || 0.0001;
  out.distance = dist;
  const nx = dx / dist;
  const nz = dz / dist;
  const tx = -nz;                 // tangent (perpendicular) for orbiting
  const tz = nx;

  const isBoss = target === state.bossEnemy;
  const idealRange = isBoss ? (profile.bossRange || 13.5) : (profile.idealRange || 9.5);
  const strafe = isBoss ? (profile.bossStrafe || 1.05) : (profile.strafeBias || 0.8);

  // arrive: radial error normalised by the preferred range (positive closes, negative opens)
  const radial = Math.max(-1, Math.min(1, (dist - idealRange) / idealRange));

  // flip strafe direction on a slow sine so it arcs rather than circling one way forever
  const t = (state.pilotClock || 0) + dt;
  state.pilotClock = t;
  const strafeDir = Math.sin(t * 0.55) >= 0 ? 1 : -1;

  const sep = separation(state, enemyManager, profile.separationRadius || 2.5);
  const wS = profile.separationWeight || 1.15;

  let dxOut;
  let dzOut;
  let mode;
  let throttle;
  if (state.bossWarning > 0 && isBoss) {
    // telegraph: break to range, that is what survives the salvo
    dxOut = -nx;
    dzOut = -nz;
    mode = "dodge";
    throttle = 1;
  } else if (lowIntegrityFor(state, profile)) {
    dxOut = -nx;
    dzOut = -nz;
    mode = "disengage";
    throttle = 1;
  } else if (dist > (state.awarenessRange || 30)) {
    dxOut = nx;
    dzOut = nz;
    mode = "close";
    throttle = 0.7;
  } else {
    dxOut = nx * radial + tx * strafeDir * strafe + sep.x * wS;
    dzOut = nz * radial + tz * strafeDir * strafe + sep.z * wS;
    mode = dist < idealRange * 0.55 ? "open" : (isBoss ? "boss" : "hold");
    // Arrive throttle: at the preferred range the body holds and circles slowly (that is what the
    // 55-90 m per 60 s target describes), and opens up when it actually has to close or open.
    if (dist < idealRange * 0.55) {
      throttle = 0.5;
    } else {
      throttle = Math.max(0.12, Math.min(0.45, 0.13 + 0.09 * Math.abs(radial) + 0.045 * Math.min(1, sep.n / 2)));
    }
  }

  let len = Math.hypot(dxOut, dzOut);
  if (len < 1e-6) {
    // never emit a zero vector with a target alive
    dxOut = nx;
    dzOut = nz;
    len = 1;
  }

  // critically damped direction change; the body eases into a new heading instead of snapping
  const k = Math.min(1, Math.max(0, (profile.damping || 6) * dt));
  const vel = state.pilotVel || { x: 0, z: 0 };
  vel.x += ((dxOut / len) - vel.x) * k;
  vel.z += ((dzOut / len) - vel.z) * k;
  state.pilotVel = vel;

  let mag = Math.hypot(vel.x, vel.z);
  if (mag < (profile.minSpeed || 0.35)) {
    // floor the speed so the movement metrics never see a frozen body
    const sx = vel.x || dxOut;
    const sz = vel.z || dzOut;
    const sl = Math.hypot(sx, sz) || 1;
    vel.x = (sx / sl) * (profile.minSpeed || 0.35);
    vel.z = (sz / sl) * (profile.minSpeed || 0.35);
    mag = Math.hypot(vel.x, vel.z);
  }

  out.mx = vel.x / mag;
  out.mz = vel.z / mag;
  out.mode = mode;
  out.throttle = throttle;
  out.hasTarget = true;
  return out;
}
