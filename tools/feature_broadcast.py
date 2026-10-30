"""Broadcast camera director + 10 s auto card pick."""
from pathlib import Path

p = Path("src/main.js")
t = p.read_text(encoding="utf-8")

# ── broadcast director state ──
anchor = "const vMuzzle = new THREE.Vector3(), vTarget = new THREE.Vector3(), vDesired = new THREE.Vector3(), vShotDir = new THREE.Vector3();"
assert anchor in t
t = t.replace(anchor, anchor + '''

// Arcade broadcast director: the camera cuts between sports-style shots that keep the operator and
// the nearest hostile in frame instead of sitting behind the player's shoulder.
const broadcast = {
  shot: "chase",
  shotName: "CAM 2",
  timer: 0,
  cut: false,
  look: new THREE.Vector3(),
  lastKills: -1,
  number: 2,
};
const SHOT_NAMES = { chase: "CAM 1 // CHASE", orbit: "CAM 2 // ORBIT", sideline: "CAM 3 // SIDELINE", wide: "CAM 4 // WIDE", hero: "CAM 5 // HERO" };

function nearestHostileTo(x, z) {
  let best = null;
  let bestD = 1e9;
  for (const e of enemyManager.getEnemies()) {
    if (!e || e.dead) continue;
    const d = Math.hypot(e.position.x - x, e.position.z - z);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}

function pickBroadcastShot() {
  const boss = state.bossEnemy && state.bossEnemy.hp > 0;
  const hurt = state.health / Math.max(1, state.maxHealth) < 0.35;
  const pool = boss || hurt
    ? ["hero", "sideline", "wide", "chase"]
    : ["chase", "orbit", "sideline", "sideline", "wide", "chase"];
  broadcast.shot = pool[Math.floor(state.rng() * pool.length)];
  broadcast.shotName = SHOT_NAMES[broadcast.shot] || "CAM 1";
  broadcast.timer = 6.0 + state.rng() * 3.0;
  return broadcast.shot;
}
''')

# ── replace the camera block ──
start = t.index("    // Camera\n    vDesired.set(state.pos.x + Math.sin(state.orbit) * 8.0, 5.9, state.pos.z + Math.cos(state.orbit) * 8.0);")
end = t.index("    // FX-03: camera kick", start)
new_cam = '''    // Camera — arcade broadcast director (cuts + slow pushes, always framing the action)
    {
      const hostile = nearestHostileTo(state.pos.x, state.pos.z);
      const kills = state.kills;
      if (broadcast.lastKills !== -1 && kills > broadcast.lastKills) {
        // a kill is a highlight: hard cut to a fresh angle on the body
        broadcast.cut = true;
        pickBroadcastShot();
      }
      broadcast.lastKills = kills;
      broadcast.timer -= dt;
      if (broadcast.timer <= 0) {
        broadcast.cut = true;
        pickBroadcastShot();
      }
      const fwdX = Math.sin(state.yaw || 0);
      const fwdZ = Math.cos(state.yaw || 0);
      // action point: between the operator and the nearest hostile (or the boss)
      let ax = state.pos.x;
      let az = state.pos.z;
      let ay = 1.2;
      if (hostile) {
        ax = state.pos.x * 0.62 + hostile.position.x * 0.38;
        az = state.pos.z * 0.62 + hostile.position.z * 0.38;
        ay = 1.05;
      }
      if (broadcast.shot === "chase") {
        const a = (state.orbit || 0) + 0.6;
        vDesired.set(state.pos.x + Math.sin(a) * 7.4, 4.9, state.pos.z + Math.cos(a) * 7.4);
        broadcast.look.set(ax, 1.25, az);
      } else if (broadcast.shot === "orbit") {
        const a = (state.orbit || 0) + 1.9;
        vDesired.set(state.pos.x + Math.sin(a) * 8.4, 3.4, state.pos.z + Math.cos(a) * 8.4);
        broadcast.look.set(ax, 1.15, az);
      } else if (broadcast.shot === "sideline") {
        // stand off perpendicular to the player→hostile axis, like a touchline camera
        let px = -fwdZ;
        let pz = fwdX;
        if (hostile) {
          const dx = hostile.position.x - state.pos.x;
          const dz = hostile.position.z - state.pos.z;
          const len = Math.hypot(dx, dz) || 1;
          px = -dz / len;
          pz = dx / len;
        }
        vDesired.set(ax + px * 9.4, 2.9, az + pz * 9.4);
        broadcast.look.set(ax, 1.1, az);
      } else if (broadcast.shot === "wide") {
        vDesired.set(ax + Math.sin(state.orbit || 0) * 12.5, 9.6, az + Math.cos(state.orbit || 0) * 12.5);
        broadcast.look.set(ax, 1.0, az);
      } else {
        // hero: low, in front of the operator, looking back at him
        vDesired.set(state.pos.x + fwdX * 5.2, 1.75, state.pos.z + fwdZ * 5.2);
        broadcast.look.set(state.pos.x, 1.45, state.pos.z);
      }
      const follow = broadcast.cut ? 1 : 1 - Math.exp(-dt * 3.2);
      broadcast.cut = false;
      camera.position.lerp(vDesired, follow);
      camera.lookAt(broadcast.look);
    }

'''
t = t[:start] + new_cam + t[end:]

# remove the old lookAt after the collision block (the director sets it)
t = t.replace("    camera.lookAt(state.pos.x, 1.25, state.pos.z);\n", "", 1)

# ── HUD broadcast bug ──
t = t.replace('''    T("timer-cap", timeLeft <= 10 ? "CONTACT // CLOSING" : "CONTACT"''','''    T("cam-bug", `LIVE  ●  ${broadcast.shotName}`, { x: 0.985, y: 0.030, size: TYPE_SCALE.micro, color: "#ff8a8a", weight: 800, align: "right" });
    T("timer-cap", timeLeft <= 10 ? "CONTACT // CLOSING" : "CONTACT"''')

# ── 10 s auto card pick ──
t = t.replace('''      state.currentCardOptions = cardSystem.queuedCards[0];
      state.cardPickWindow = true;
      state.showCards = true;
      cardTray.show(state.currentCardOptions);''','''      state.currentCardOptions = cardSystem.queuedCards[0];
      state.cardPickWindow = true;
      state.showCards = true;
      state.cardPickTimer = 10;
      cardTray.show(state.currentCardOptions);
      cardTray.setCountdown(10);''')
t = t.replace('''    // Camera — arcade broadcast director''','''    // Card timer: 10 s to choose, then auto-pick
    if (state.cardPickWindow && state.currentCardOptions) {
      state.cardPickTimer = Math.max(0, (state.cardPickTimer ?? 10) - dt);
      cardTray.setCountdown(state.cardPickTimer);
      if (state.cardPickTimer <= 0) {
        pickCard(0);
        globalThis.__studio?.hud?.flash("#ffb347", 0.12);
      }
    }

    // Camera — arcade broadcast director''')
t = t.replace('''  state.cardPickWindow = false;
  state.showCards = false;''','''  state.cardPickWindow = false;
  state.cardPickTimer = 0;
  state.showCards = false;''')

p.write_text(t, encoding="utf-8")
print("broadcast camera + auto card pick")
