"""Smooth drone camera, readable back faces on the brand boards, grounded enemy rigs."""
from pathlib import Path

# ── 1. camera: slow drone, rare switches, no kill cuts ──
p = Path("src/main.js")
t = p.read_text(encoding="utf-8")

old = '''      const hostile = nearestHostileTo(state.pos.x, state.pos.z);
      const kills = state.kills;
      if (!broadcast.lock && broadcast.lastKills !== -1 && kills > broadcast.lastKills) {
        // a kill is a highlight: hard cut to a fresh angle on the body
        broadcast.cut = true;
        pickBroadcastShot();
      }
      broadcast.lastKills = kills;
      broadcast.timer -= dt;
      if (!broadcast.lock && broadcast.timer <= 0) {
        broadcast.cut = true;
        pickBroadcastShot();
      }'''
new = '''      const hostile = nearestHostileTo(state.pos.x, state.pos.z);
      broadcast.lastKills = state.kills;
      broadcast.timer -= dt;
      // Drone cam: hold a shot for a long time and glide to the next one; never cut on kills.
      if (!broadcast.lock && broadcast.timer <= 0) {
        pickBroadcastShot();
      }'''
assert old in t
t = t.replace(old, new, 1)

t = t.replace('  broadcast.timer = 6.0 + state.rng() * 3.0;', '  broadcast.timer = 13.0 + state.rng() * 6.0;')

old_move = '''      const follow = broadcast.cut ? 1 : 1 - Math.exp(-dt * 3.2);
      broadcast.cut = false;
      camera.position.lerp(vDesired, follow);
      camera.lookAt(broadcast.look);'''
new_move = '''      // drone pacing: slow position glide, slower look drift, and a gentle float
      const follow = 1 - Math.exp(-dt * 1.7);
      camera.position.lerp(vDesired, follow);
      camera.position.y += Math.sin((state.t || 0) * 0.7) * 0.05;
      if (!broadcast.lookSmooth) broadcast.lookSmooth = broadcast.look.clone();
      broadcast.lookSmooth.lerp(broadcast.look, 1 - Math.exp(-dt * 2.6));
      camera.lookAt(broadcast.lookSmooth);'''
assert old_move in t
t = t.replace(old_move, new_move, 1)

# broadcast.cut is no longer used; keep the hook flags harmless
t = t.replace('''      broadcast.timer = 9;
      broadcast.lock = true;
      broadcast.cut = true;''','''      broadcast.timer = 9;
      broadcast.lock = true;''')
p.write_text(t, encoding="utf-8")

# ── 2. brand boards: readable face on both sides ──
p = Path("src/branding.js")
t = p.read_text(encoding="utf-8")
old_sign = '''  const frame = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.12), frameMat);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.96, height * 0.9), faceMat);
  face.position.z = 0.07;
  sign.add(frame, face);'''
new_sign = '''  const frame = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.12), frameMat);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.96, height * 0.9), faceMat);
  face.position.z = 0.07;
  // back face: mirrored map + rotated plane so the type reads correctly from behind
  const backTex = texture.clone();
  backTex.needsUpdate = true;
  backTex.wrapS = THREE.RepeatWrapping;
  backTex.repeat.x = -1;
  backTex.offset.x = 1;
  const backMat = new THREE.MeshBasicMaterial({ map: backTex, toneMapped: false });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.96, height * 0.9), backMat);
  back.position.z = -0.07;
  back.rotation.y = Math.PI;
  sign.add(frame, face, back);'''
assert old_sign in t
t = t.replace(old_sign, new_sign, 1)
p.write_text(t, encoding="utf-8")

# ── 3. enemy rigs: ground the feet from the actual model bounds ──
p = Path("src/models.js")
t = p.read_text(encoding="utf-8")
old_rig = '''    rig.scale.setScalar(scale);
    rig.position.set(0, offsetY, 0);
    rig.rotation.set(0, rotY, 0);'''
new_rig = '''    rig.scale.setScalar(scale);
    rig.position.set(0, 0, 0);
    rig.rotation.set(0, rotY, 0);
    rig.updateMatrixWorld(true);
    // Measure the model and put its lowest point on the deck. Different Mixamo rigs have different
    // bind-pose origins, which is why some bodies stood sunk into the ground.
    const rigBox = new THREE.Box3().setFromObject(rig);
    const feet = Number.isFinite(rigBox.min.y) ? rigBox.min.y : 0;
    rig.position.set(0, offsetY - feet, 0);'''
assert old_rig in t
t = t.replace(old_rig, new_rig, 1)
p.write_text(t, encoding="utf-8")
print("camera + signs + grounding")
