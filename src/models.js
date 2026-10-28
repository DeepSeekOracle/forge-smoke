/**
 * Tactical Gunmetal & Amber Armory — 3D Visual Rigs, Skins, Weapons & Arena Props.
 *
 * Provides:
 * - 4 selectable Operator Skins (FORGE-1 OLIVE, NIGHTFALL RECON, HAZMAT BREACH, CRIMSON EXO)
 * - 12 distinct 3D Weapon Attachment Silhouettes (matching ART_BIBLE.md §3)
 * - 8 distinct 3D Enemy Role Models & Skins (Rifleman, Sapper, Shieldbearer, Spotter, Drone, Mortar, Mech, Gunship)
 * - Per-Arena Tactical Map Props (Perimeter Watchtower/Barriers, Breach Yard Containers, Gunship Helipad)
 * - Background preloading of the 13 Blender .glb assets in `assets/*.glb` via `src/assets.js`
 */

import * as THREE from "three";
import { standardMaterial } from "./materials.js";
import { preloadAssets } from "./assets.js";
import { PALETTE, hexInt } from "./theme.js";

export const PLAYER_SKINS = [
  {
    id: "olive",
    name: "FORGE-1 // OLIVE SPEC-OPS",
    shortName: "OLIVE SPEC-OPS",
    badge: "SPEC-OPS",
    clothPalette: [0x2a3123, 0x4b5340, 0x6b755b],
    armorPalette: [0x1c2224, 0x394345, 0x566366],
    visorHex: 0xffb347,
    accentHex: "#ffb347",
    desc: "Standard perimeter infantry rig · olive drab weave & amber optics",
  },
  {
    id: "nightfall",
    name: "NIGHTFALL // STEALTH RECON",
    shortName: "NIGHTFALL RECON",
    badge: "RECON",
    clothPalette: [0x0f1419, 0x1c252e, 0x2c3947],
    armorPalette: [0x141a1f, 0x263038, 0x3d4c59],
    visorHex: 0x4deeea,
    accentHex: "#4deeea",
    desc: "Low-signature night-ops chassis · carbon weave & cyan tri-optic NVG",
  },
  {
    id: "hazmat",
    name: "HAZMAT // BREACH ENGINEER",
    shortName: "HAZMAT BREACH",
    badge: "BREACHER",
    clothPalette: [0x5e3410, 0xb86b1e, 0xe09038],
    armorPalette: [0x1f2226, 0x3a3f47, 0x575e69],
    visorHex: 0x7ce6a8,
    accentHex: "#7ce6a8",
    desc: "Heavy demolition suit · hazard ochre plating & emerald respirator",
  },
  {
    id: "crimson",
    name: "CRIMSON // VANGUARD EXO",
    shortName: "CRIMSON EXO",
    badge: "VANGUARD",
    clothPalette: [0x380b0f, 0x6e1820, 0x9e2832],
    armorPalette: [0x2b3236, 0x525d63, 0x7c8b94],
    visorHex: 0xffffff,
    accentHex: "#ff8d95",
    desc: "Experimental alloy exo-frame · chitin-weave & white-hot targeting visor",
  },
];

export const STARTER_LOADOUTS = [
  { id: "spray", name: "SMG // SPRAY", role: "HIGH ROF SUPPRESSION", color: "#ffd57a" },
  { id: "cone", name: "SHOTGUN // CONE", role: "CLOSE BREACH BUCKSHOT", color: "#ff8a4a" },
  { id: "pierce", name: "MARKSMAN // PIERCE", role: "ARMOR-PIERCING RODS", color: "#6fe3ff" },
  { id: "ricochet", name: "CARBINE // RICOCHET", role: "REBOUNDING BANK SHOTS", color: "#a6ff7a" },
  { id: "burst", name: "BATTLE RIFLE // BURST", role: "3-ROUND PRECISION", color: "#ffe36f" },
  { id: "beam", name: "CUTTER // BEAM", role: "THERMAL CONTINUOUS LASER", color: "#4deeea" },
  { id: "chain", name: "TESLA // CHAIN", role: "FORKED ARC DISCHARGE", color: "#c6a6ff" },
  { id: "spinup", name: "MINIGUN // SPIN-UP", role: "ROTARY GATLING BARRAGE", color: "#ff5a5a" },
  { id: "rail", name: "RAILGUN // RAIL", role: "HYPER-VELOCITY SLUG", color: "#ffffff" },
  { id: "flamer", name: "IGNITER // FLAMER", role: "NAPALM GROUND DENIAL", color: "#ff6a2a" },
  { id: "arc", name: "THUMPER // ARC", role: "LOBBED BLAST GRENADES", color: "#ff6fd6" },
  { id: "sentry", name: "DEPLOYER // SENTRY", role: "AUTONOMOUS TURRET LINK", color: "#6fff9a" },
];

const STYLE_COLORS = {
  spray: 0xffd57a,
  cone: 0xff8a4a,
  pierce: 0x6fe3ff,
  ricochet: 0xa6ff7a,
  arc: 0xff6fd6,
  beam: 0x4deeea,
  chain: 0xc6a6ff,
  burst: 0xffe36f,
  spinup: 0xff5a5a,
  rail: 0xffffff,
  flamer: 0xff6a2a,
  sentry: 0x6fff9a,
};

/** Preload the 13 Blender .glb models in the background so `src/assets.js` caches them. */
export function warmGlbAssets() {
  preloadAssets([
    "operator",
    "rifleman",
    "sapper",
    "shieldbearer",
    "spotter",
    "drone",
    "mortar",
    "mech",
    "gunship",
    "turret",
    "barrier",
    "container",
    "watchtower",
  ]).catch(() => {});
}

function makePart(geo, mat, tag, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (rx || ry || rz) m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData.tag = tag;
  return m;
}

/** Upgrade the Operator group with articulated limbs, armor plates, and skinnable materials. */
export function buildOperatorRig(soldier, gunPivot, texSize = 256, skinIndex = 0) {
  const skin = PLAYER_SKINS[skinIndex % PLAYER_SKINS.length] || PLAYER_SKINS[0];
  const clothMat = standardMaterial({
    kind: "cloth",
    seed: 105 + skinIndex * 17,
    size: texSize,
    palette: skin.clothPalette,
    roughness: 0.82,
    metalness: 0.08,
    bump: 0.08,
  });
  const armorMat = standardMaterial({
    kind: "metal",
    seed: 212 + skinIndex * 19,
    size: texSize,
    palette: skin.armorPalette,
    roughness: 0.36,
    metalness: 0.78,
    bump: 0.05,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: skin.visorHex,
    emissive: new THREE.Color(skin.visorHex),
    emissiveIntensity: 1.35,
    roughness: 0.18,
    metalness: 0.9,
  });

  // Update existing parts and add tactical detail parts if not yet added
  soldier.traverse((child) => {
    if (!child.isMesh) return;
    if (child.userData.tag === "player-body" || child.userData.tag === "pack" || child.userData.tag === "leg") {
      child.material = clothMat;
    } else if (child.userData.tag === "visor") {
      child.material = visorMat;
    } else if (child.userData.tag === "player-head" || child.userData.tag === "armor") {
      child.material = armorMat;
    }
  });

  if (!soldier.userData.upgradedRig) {
    soldier.userData.upgradedRig = true;
    const body = makePart(new THREE.BoxGeometry(1.12, 1.32, 0.86), clothMat, "player-body", 0, 1.02, 0);
    const pack = makePart(new THREE.BoxGeometry(0.78, 0.92, 0.42), clothMat, "pack", 0, 1.06, -0.62);
    const head = makePart(new THREE.BoxGeometry(0.68, 0.64, 0.68), armorMat, "player-head", 0, 1.92, 0);
    const visor = makePart(new THREE.BoxGeometry(0.56, 0.18, 0.10), visorMat, "visor", 0, 1.94, 0.35);
    const legL = makePart(new THREE.BoxGeometry(0.36, 0.72, 0.38), clothMat, "leg", -0.28, 0.42, 0);
    const legR = makePart(new THREE.BoxGeometry(0.36, 0.72, 0.38), clothMat, "leg", 0.28, 0.42, 0);
    const bootL = makePart(new THREE.BoxGeometry(0.38, 0.22, 0.48), armorMat, "armor", -0.28, 0.11, 0.05);
    const bootR = makePart(new THREE.BoxGeometry(0.38, 0.22, 0.48), armorMat, "armor", 0.28, 0.11, 0.05);
    const chestPlate = makePart(new THREE.BoxGeometry(1.18, 0.74, 0.94), armorMat, "armor", 0, 1.12, 0.02);
    const pauldronL = makePart(new THREE.BoxGeometry(0.34, 0.38, 0.52), armorMat, "armor", -0.72, 1.38, 0);
    const pauldronR = makePart(new THREE.BoxGeometry(0.34, 0.38, 0.52), armorMat, "armor", 0.72, 1.38, 0);
    const helmetRim = makePart(new THREE.BoxGeometry(0.76, 0.22, 0.76), armorMat, "armor", 0, 2.14, 0);
    const antenna = makePart(new THREE.CylinderGeometry(0.025, 0.035, 0.85, 6), armorMat, "armor", -0.32, 1.78, -0.64);
    soldier.add(body, pack, head, visor, legL, legR, bootL, bootR, chestPlate, pauldronL, pauldronR, helmetRim, antenna);
    if (gunPivot && gunPivot.parent !== soldier) {
      soldier.add(gunPivot);
    }
    soldier.userData.legL = legL;
    soldier.userData.legR = legR;
  }

  soldier.userData.skinId = skin.id;
  soldier.userData.armorMat = armorMat;
  return { clothMat, armorMat, visorMat, skin };
}

/** Rebuild the 3D weapon mesh inside `gunPivot` to match any of the 12 firing styles. */
export function rebuildWeaponMesh(gunPivot, styleKey, steelMat) {
  if (gunPivot.userData.currentStyle === styleKey) return;
  gunPivot.userData.currentStyle = styleKey;
  while (gunPivot.children.length > 0) {
    gunPivot.remove(gunPivot.children[0]);
  }
  const accentHex = STYLE_COLORS[styleKey] || 0xffb347;
  const coilMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: new THREE.Color(accentHex),
    emissiveIntensity: 1.2,
    roughness: 0.2,
    metalness: 0.85,
  });

  if (styleKey === "cone") {
    // Wide-bore tactical breach shotgun
    gunPivot.add(makePart(new THREE.BoxGeometry(0.24, 0.24, 1.15), steelMat, "rifle", 0, 0, 0.45));
    gunPivot.add(makePart(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 8), steelMat, "muzzle-brake", 0, 0.02, 0.95, Math.PI / 2, 0, 0));
    gunPivot.add(makePart(new THREE.BoxGeometry(0.26, 0.16, 0.48), coilMat, "pump", 0, -0.14, 0.55));
  } else if (styleKey === "pierce" || styleKey === "rail") {
    // Long-barrel anti-materiel / rail rifle with glowing charge coils
    gunPivot.add(makePart(new THREE.BoxGeometry(0.22, 0.24, 1.85), steelMat, "rifle", 0, 0, 0.78));
    gunPivot.add(makePart(new THREE.BoxGeometry(0.32, 0.12, 1.1), coilMat, "rail-coil", 0, 0.04, 0.95));
    gunPivot.add(makePart(new THREE.BoxGeometry(0.34, 0.3, 0.26), steelMat, "muzzle-brake", 0, 0, 1.72));
  } else if (styleKey === "spinup") {
    // Multi-barrel rotary minigun cluster
    gunPivot.add(makePart(new THREE.BoxGeometry(0.36, 0.36, 0.65), steelMat, "rifle", 0, -0.06, 0.28));
    gunPivot.add(makePart(new THREE.CylinderGeometry(0.22, 0.22, 1.25, 10), steelMat, "rotary-cluster", 0, -0.04, 0.98, Math.PI / 2, 0, 0));
    gunPivot.add(makePart(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 10), coilMat, "muzzle-clamp", 0, -0.04, 1.48, Math.PI / 2, 0, 0));
  } else if (styleKey === "flamer" || styleKey === "beam" || styleKey === "chain") {
    // Emitter / tank housing weapon
    gunPivot.add(makePart(new THREE.BoxGeometry(0.28, 0.28, 1.2), steelMat, "rifle", 0, 0, 0.48));
    gunPivot.add(makePart(new THREE.CylinderGeometry(0.16, 0.16, 0.62, 10), coilMat, "emitter-tank", -0.18, -0.16, 0.38, Math.PI / 2, 0, 0));
    gunPivot.add(makePart(new THREE.CylinderGeometry(0.18, 0.12, 0.38, 10), coilMat, "emitter-nozzle", 0, 0, 1.18, Math.PI / 2, 0, 0));
  } else if (styleKey === "arc" || styleKey === "sentry") {
    // Heavy grenade thumper / launcher tube
    gunPivot.add(makePart(new THREE.CylinderGeometry(0.18, 0.18, 1.28, 12), steelMat, "rifle", 0, 0.02, 0.56, Math.PI / 2, 0, 0));
    gunPivot.add(makePart(new THREE.CylinderGeometry(0.22, 0.22, 0.42, 12), coilMat, "drum-mag", 0, -0.14, 0.34));
  } else {
    // Spray / Burst / Ricochet tactical carbine with glowing optic rail
    gunPivot.add(makePart(new THREE.BoxGeometry(0.2, 0.22, 1.35), steelMat, "rifle", 0, 0, 0.52));
    gunPivot.add(makePart(new THREE.BoxGeometry(0.28, 0.28, 0.22), steelMat, "muzzle-brake", 0, 0, 1.22));
    gunPivot.add(makePart(new THREE.BoxGeometry(0.16, 0.3, 0.34), steelMat, "magazine", 0, -0.26, 0.18));
    gunPivot.add(makePart(new THREE.BoxGeometry(0.14, 0.08, 0.42), coilMat, "optic-sight", 0, 0.15, 0.38));
  }
}

/** Create shared role material bank so all 8 enemy types have distinct skins without extra draw/texture bloat. */
export function createEnemyMaterialBank(baseEnemyMat, texSize = 256) {
  const darkArmor = standardMaterial({
    kind: "metal",
    seed: 301,
    size: texSize,
    palette: [0x14181c, 0x283038, 0x424d54],
    roughness: 0.38,
    metalness: 0.78,
    bump: 0.05,
  });
  const sapperSuit = standardMaterial({
    kind: "cloth",
    seed: 302,
    size: texSize,
    palette: [0x261710, 0x4a2c1d, 0x70422b],
    roughness: 0.78,
    metalness: 0.12,
    bump: 0.07,
  });
  const spotterCamo = standardMaterial({
    kind: "cloth",
    seed: 303,
    size: texSize,
    palette: [0x14201a, 0x26382e, 0x3b5446],
    roughness: 0.82,
    metalness: 0.1,
    bump: 0.07,
  });
  const redOptic = new THREE.MeshStandardMaterial({
    color: 0xff4d4d,
    emissive: new THREE.Color(0xff4d4d),
    emissiveIntensity: 1.8,
    roughness: 0.15,
    metalness: 0.8,
  });
  const orangeTank = new THREE.MeshStandardMaterial({
    color: 0xff6a2a,
    emissive: new THREE.Color(0xff6a2a),
    emissiveIntensity: 1.5,
    roughness: 0.25,
    metalness: 0.5,
  });
  const magentaOptic = new THREE.MeshStandardMaterial({
    color: 0xff6fd6,
    emissive: new THREE.Color(0xff6fd6),
    emissiveIntensity: 1.9,
    roughness: 0.15,
    metalness: 0.85,
  });
  return {
    enemyMat: baseEnemyMat,
    chitin: baseEnemyMat,
    darkArmor,
    sapperSuit,
    spotterCamo,
    redOptic,
    orangeTank,
    magentaOptic,
  };
}

/** Build a distinct, role-readable 3D Group for each of the 8 enemy types (ART_BIBLE.md §3). */
export function buildEnemyMesh(type, bank) {
  const root = new THREE.Group();
  root.userData.tag = "enemy";
  root.userData.enemyType = type;

  const chitin = bank.chitin || bank.enemyMat;
  const armor = bank.darkArmor || chitin;
  const redOptic = bank.redOptic || chitin;
  const orangeTank = bank.orangeTank || redOptic;
  const magentaOptic = bank.magentaOptic || redOptic;
  const sapperSuit = bank.sapperSuit || chitin;
  const spotterCamo = bank.spotterCamo || chitin;

  if (type === "sapper") {
    // Hunched demolition breacher with twin glowing volatile canisters on back
    root.add(makePart(new THREE.BoxGeometry(0.78, 0.92, 0.62), sapperSuit, "enemy-torso", 0, 0.1, 0, 0.22, 0, 0));
    root.add(makePart(new THREE.BoxGeometry(0.5, 0.46, 0.5), armor, "enemy-head", 0, 0.72, 0.16));
    root.add(makePart(new THREE.BoxGeometry(0.44, 0.14, 0.12), orangeTank, "enemy-optic", 0, 0.74, 0.42));
    const tankL = makePart(new THREE.CylinderGeometry(0.2, 0.2, 0.86, 10), orangeTank, "sapper-tank", -0.24, 0.36, -0.36);
    const tankR = makePart(new THREE.CylinderGeometry(0.2, 0.2, 0.86, 10), orangeTank, "sapper-tank", 0.24, 0.36, -0.36);
    root.add(tankL, tankR);
    root.userData.pulseParts = [tankL, tankR];
  } else if (type === "shieldbearer") {
    // Heavy juggernaut carrying a massive frontal ballistic slab shield
    root.add(makePart(new THREE.BoxGeometry(1.14, 1.24, 0.88), chitin, "enemy-torso", 0, 0.22, 0));
    root.add(makePart(new THREE.BoxGeometry(0.42, 0.48, 0.56), armor, "enemy-pauldron", -0.72, 0.56, 0));
    root.add(makePart(new THREE.BoxGeometry(0.42, 0.48, 0.56), armor, "enemy-pauldron", 0.72, 0.56, 0));
    root.add(makePart(new THREE.BoxGeometry(0.68, 0.56, 0.68), armor, "enemy-head", 0, 1.05, 0));
    const shield = makePart(new THREE.BoxGeometry(1.56, 1.68, 0.18), armor, "enemy-shield", 0, 0.28, 0.68);
    const slit = makePart(new THREE.BoxGeometry(0.96, 0.16, 0.22), redOptic, "shield-slit", 0, 0.72, 0.69);
    root.add(shield, slit);
  } else if (type === "spotter") {
    // Recon specialist with tall whip antenna and sweeping magenta laser optic
    root.add(makePart(new THREE.BoxGeometry(0.8, 1.08, 0.58), spotterCamo, "enemy-torso", 0, 0.16, 0));
    root.add(makePart(new THREE.BoxGeometry(0.58, 0.68, 0.38), armor, "comms-pack", 0, 0.28, -0.42));
    root.add(makePart(new THREE.CylinderGeometry(0.03, 0.04, 1.65, 6), armor, "whip-antenna", -0.22, 1.25, -0.48));
    root.add(makePart(new THREE.BoxGeometry(0.56, 0.52, 0.56), spotterCamo, "enemy-head", 0, 0.92, 0));
    const lens = makePart(new THREE.CylinderGeometry(0.16, 0.16, 0.38, 10), magentaOptic, "spotter-lens", 0, 0.92, 0.34, Math.PI / 2, 0, 0);
    root.add(lens);
  } else if (type === "drone") {
    // Hovering quad-rotor tactical attack UAV
    const chassis = new THREE.Group();
    chassis.position.y = 1.15;
    chassis.add(makePart(new THREE.BoxGeometry(0.78, 0.32, 0.96), armor, "drone-core", 0, 0, 0));
    chassis.add(makePart(new THREE.SphereGeometry(0.22, 10, 10), redOptic, "drone-eye", 0, -0.14, 0.36));
    const rotors = [];
    for (const sx of [-0.62, 0.62]) {
      for (const sz of [-0.62, 0.62]) {
        chassis.add(makePart(new THREE.BoxGeometry(0.68, 0.08, 0.1), armor, "drone-arm", sx * 0.5, 0.04, sz * 0.5, 0, Math.atan2(sx, sz), 0));
        const blade = makePart(new THREE.BoxGeometry(0.76, 0.03, 0.12), chitin, "drone-rotor", sx, 0.12, sz);
        chassis.add(blade);
        rotors.push(blade);
      }
    }
    root.add(chassis);
    root.userData.rotors = rotors;
    root.userData.hoverGroup = chassis;
  } else if (type === "mortar") {
    // Emplaced heavy artillery mortar & tripod
    root.add(makePart(new THREE.CylinderGeometry(0.82, 0.9, 0.16, 10), armor, "mortar-base", 0, -0.52, 0));
    root.add(makePart(new THREE.CylinderGeometry(0.22, 0.26, 1.65, 12), armor, "mortar-tube", 0, 0.28, 0.18, -0.48, 0, 0));
    root.add(makePart(new THREE.BoxGeometry(0.64, 0.44, 0.48), chitin, "mortar-Operator", -0.52, -0.18, -0.28));
    root.add(makePart(new THREE.CylinderGeometry(0.1, 0.1, 0.48, 8), orangeTank, "mortar-beacon", 0.54, -0.2, 0.28));
  } else if (type === "mech") {
    // Elite 2.3m armored walker with twin shoulder missile pods & spinning rotary minigun
    root.add(makePart(new THREE.BoxGeometry(0.48, 0.95, 0.52), armor, "mech-leg", -0.52, -0.12, 0));
    root.add(makePart(new THREE.BoxGeometry(0.48, 0.95, 0.52), armor, "mech-leg", 0.52, -0.12, 0));
    root.add(makePart(new THREE.BoxGeometry(1.62, 1.18, 1.15), chitin, "mech-hull", 0, 0.88, 0));
    root.add(makePart(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 12), redOptic, "mech-core", 0, 0.88, 0.58, Math.PI / 2, 0, 0));
    root.add(makePart(new THREE.BoxGeometry(0.52, 0.56, 0.68), armor, "mech-pod-l", -0.84, 1.62, -0.06));
    root.add(makePart(new THREE.BoxGeometry(0.52, 0.56, 0.68), armor, "mech-pod-r", 0.84, 1.62, -0.06));
    const minigun = makePart(new THREE.CylinderGeometry(0.24, 0.24, 1.42, 10), armor, "mech-minigun", 1.06, 0.76, 0.56, Math.PI / 2, 0, 0);
    root.add(minigun);
    root.userData.rotors = [minigun];
  } else if (type === "gunship") {
    // Boss attack helicopter hovering above the arena
    const airframe = new THREE.Group();
    airframe.position.y = 2.6;
    airframe.add(makePart(new THREE.BoxGeometry(1.42, 1.12, 3.95), armor, "gunship-hull", 0, 0, 0));
    airframe.add(makePart(new THREE.BoxGeometry(1.12, 0.74, 1.38), redOptic, "gunship-canopy", 0, -0.1, 2.1));
    airframe.add(makePart(new THREE.BoxGeometry(3.45, 0.2, 0.86), chitin, "gunship-wings", 0, 0.08, 0.24));
    airframe.add(makePart(new THREE.CylinderGeometry(0.26, 0.26, 1.28, 10), armor, "gunship-pod-l", -1.38, -0.18, 0.3, Math.PI / 2, 0, 0));
    airframe.add(makePart(new THREE.CylinderGeometry(0.26, 0.26, 1.28, 10), armor, "gunship-pod-r", 1.38, -0.18, 0.3, Math.PI / 2, 0, 0));
    airframe.add(makePart(new THREE.BoxGeometry(0.48, 0.52, 2.85), armor, "gunship-tail", 0, 0.16, -2.95));
    const mainRotor = makePart(new THREE.BoxGeometry(4.8, 0.06, 0.32), chitin, "gunship-rotor", 0, 0.72, 0);
    airframe.add(mainRotor);
    root.add(airframe);
    root.userData.rotors = [mainRotor];
    root.userData.hoverGroup = airframe;
  } else {
    // Rifleman (default): helmeted hostile soldier with crimson optic visor & carbine
    root.add(makePart(new THREE.BoxGeometry(0.32, 0.66, 0.34), armor, "enemy-leg-l", -0.22, -0.36, 0));
    root.add(makePart(new THREE.BoxGeometry(0.32, 0.66, 0.34), armor, "enemy-leg-r", 0.22, -0.36, 0));
    root.add(makePart(new THREE.BoxGeometry(0.88, 0.92, 0.58), chitin, "enemy-torso", 0, 0.22, 0));
    root.add(makePart(new THREE.BoxGeometry(0.94, 0.48, 0.64), armor, "enemy-rig", 0, 0.28, 0.02));
    root.add(makePart(new THREE.BoxGeometry(0.62, 0.54, 0.62), armor, "enemy-helmet", 0, 0.94, 0));
    root.add(makePart(new THREE.BoxGeometry(0.5, 0.14, 0.12), redOptic, "enemy-visor", 0, 0.94, 0.3));
    root.add(makePart(new THREE.BoxGeometry(0.16, 0.2, 0.92), armor, "enemy-carbine", 0.44, 0.24, 0.36));
  }

  return root;
}

/** Update per-role procedural enemy animations (spinning UAV/gunship rotors, pulsing sapper tanks). */
export function animateEnemyMesh(enemy, mesh, dt) {
  if (!mesh) return;
  if (mesh.userData.rotors) {
    for (const r of mesh.userData.rotors) {
      if (enemy.type === "mech") {
        r.rotation.z += dt * 14;
      } else {
        r.rotation.y += dt * 22;
      }
    }
  }
  if (enemy.type === "shieldbearer" && typeof enemy.shieldAngle === "number") {
    mesh.rotation.y = enemy.shieldAngle;
  }
}

/** Populate per-arena 3D cover, shipping containers, watchtowers, and helipad markings. */
export function populateArenaProps(arenaKey, propGroup, texSize = 256) {
  while (propGroup.children.length > 0) {
    propGroup.remove(propGroup.children[0]);
  }
  const stoneMat = standardMaterial({
    kind: "stone",
    seed: 401,
    size: texSize,
    palette: [0x23272e, 0x3a3f47, 0x565d68],
    roughness: 0.88,
    metalness: 0.08,
    bump: 0.09,
  });
  const containerMat = standardMaterial({
    kind: "metal",
    seed: 402,
    size: texSize,
    palette: [0x1c262b, 0x33434d, 0x4c616e],
    roughness: 0.46,
    metalness: 0.72,
    bump: 0.06,
  });
  const hazardMat = new THREE.MeshStandardMaterial({
    color: hexInt(PALETTE.ui),
    emissive: new THREE.Color(hexInt(PALETTE.ui)),
    emissiveIntensity: 0.65,
    roughness: 0.35,
    metalness: 0.4,
  });

  if (arenaKey === "perimeter") {
    // Arena 1: Perimeter Jersey barriers + Guard Watchtower
    const barrierCoords = [
      [-11, -9, 0.4],
      [12, -10, -0.5],
      [-14, 11, 1.1],
      [13, 12, -1.2],
      [0, -16, 0],
      [0, 17, 0],
    ];
    for (const [x, z, rot] of barrierCoords) {
      const b = makePart(new THREE.BoxGeometry(3.2, 1.1, 0.75), stoneMat, "arena-barrier", x, 0.55, z, 0, rot, 0);
      const stripe = makePart(new THREE.BoxGeometry(3.24, 0.14, 0.78), hazardMat, "barrier-stripe", x, 0.92, z, 0, rot, 0);
      propGroup.add(b, stripe);
    }
    // Perimeter Watchtower at (-22, -20)
    const tower = new THREE.Group();
    tower.position.set(-22, 0, -20);
    for (const sx of [-1.2, 1.2]) {
      for (const sz of [-1.2, 1.2]) {
        tower.add(makePart(new THREE.BoxGeometry(0.26, 4.8, 0.26), containerMat, "tower-post", sx, 2.4, sz));
      }
    }
    tower.add(makePart(new THREE.BoxGeometry(3.0, 0.3, 3.0), stoneMat, "tower-deck", 0, 4.2, 0));
    tower.add(makePart(new THREE.BoxGeometry(3.2, 0.24, 3.2), containerMat, "tower-roof", 0, 5.8, 0));
    tower.add(makePart(new THREE.BoxGeometry(0.8, 0.28, 0.3), hazardMat, "tower-beacon", 0, 5.55, 1.45));
    propGroup.add(tower);
  } else if (arenaKey === "breach") {
    // Arena 2: Breach Yard shipping containers + blast walls
    const containers = [
      [-15, -8, 0.15],
      [15, -9, -0.2],
      [-16, 12, -0.35],
      [16, 11, 0.25],
    ];
    for (const [x, z, rot] of containers) {
      const c = makePart(new THREE.BoxGeometry(2.8, 2.6, 5.8), containerMat, "shipping-container", x, 1.3, z, 0, rot, 0);
      const trim = makePart(new THREE.BoxGeometry(2.86, 0.18, 5.84), hazardMat, "container-stripe", x, 2.45, z, 0, rot, 0);
      propGroup.add(c, trim);
    }
    for (const [x, z] of [[-7, 0], [7, 0], [0, -13], [0, 13]]) {
      propGroup.add(makePart(new THREE.BoxGeometry(2.8, 1.15, 0.8), stoneMat, "breach-barrier", x, 0.58, z));
    }
  } else {
    // Arena 3: Gunship Pad helipad markings + radar stanchions + blast barriers
    const padRing = makePart(new THREE.RingGeometry(8.5, 9.1, 32), hazardMat, "helipad-ring", 0, 0.03, 0, -Math.PI / 2, 0, 0);
    const hLeft = makePart(new THREE.BoxGeometry(0.55, 0.04, 5.2), hazardMat, "helipad-h", -1.8, 0.03, 0);
    const hRight = makePart(new THREE.BoxGeometry(0.55, 0.04, 5.2), hazardMat, "helipad-h", 1.8, 0.03, 0);
    const hCross = makePart(new THREE.BoxGeometry(3.6, 0.04, 0.55), hazardMat, "helipad-h", 0, 0.03, 0);
    propGroup.add(padRing, hLeft, hRight, hCross);
    for (const [x, z, rot] of [[-14, -14, 0.78], [14, -14, -0.78], [-14, 14, -0.78], [14, 14, 0.78]]) {
      propGroup.add(makePart(new THREE.BoxGeometry(3.6, 1.25, 0.85), stoneMat, "pad-bunker", x, 0.62, z, 0, rot, 0));
    }
  }
}
