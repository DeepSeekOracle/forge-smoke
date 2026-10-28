"""Headless Blender 5.2 LTS generator for the Forge Smoke Tactical 3D Asset Pack (.glb).

Generates game-ready, multi-material .glb models in `assets/`:
- operator.glb      (Forge-1 tactical operator rig)
- rifleman.glb      (Hostile infantry soldier)
- sapper.glb        (Demolition breacher with volatile twin tanks)
- shieldbearer.glb  (Heavy juggernaut with ballistic riot shield)
- spotter.glb       (Recon unit with comms whip & tri-optic laser)
- drone.glb         (Quad-rotor tactical attack UAV)
- mortar.glb        (Emplaced heavy mortar & tripod)
- mech.glb          (Armored bipedal walker with rotary cannon & missile pods)
- gunship.glb       (Boss attack helicopter with twin rotors & stub-wing pods)
- turret.glb        (Deployable automated sentry turret)
- barrier.glb       (Reinforced concrete Jersey barrier)
- container.glb     (Corrugated military shipping container)
- watchtower.glb    (Perimeter guard watchtower)
"""
from __future__ import annotations

import math
from pathlib import Path
import bpy

OUT_DIR = Path(r"C:\Users\justi\AI Games\forge-smoke\assets")
OUT_DIR.mkdir(parents=True, exist_ok=True)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_mat(name: str, hex_color: int, metallic: float = 0.2, roughness: float = 0.65,
             emit_hex: int | None = None, emit_strength: float = 0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    r = ((hex_color >> 16) & 0xFF) / 255.0
    g = ((hex_color >> 8) & 0xFF) / 255.0
    b = (hex_color & 0xFF) / 255.0
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (r, g, b, 1.0)
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if emit_hex is not None and "Emission Color" in bsdf.inputs:
            er = ((emit_hex >> 16) & 0xFF) / 255.0
            eg = ((emit_hex >> 8) & 0xFF) / 255.0
            eb = (emit_hex & 0xFF) / 255.0
            bsdf.inputs["Emission Color"].default_value = (er, eg, eb, 1.0)
            bsdf.inputs["Emission Strength"].default_value = emit_strength
    return mat


def add_box(name: str, size: tuple[float, float, float], loc: tuple[float, float, float], mat, rot=(0.0, 0.0, 0.0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    return obj


def add_cyl(name: str, radius: float, depth: float, loc: tuple[float, float, float], mat, rot=(0.0, 0.0, 0.0), vertices: int = 12):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    return obj


def export_glb(filename: str):
    out_path = OUT_DIR / filename
    bpy.ops.export_scene.gltf(
        filepath=str(out_path),
        export_format="GLB",
        export_apply=True,
    )
    print(f"EXPORTED {out_path} ({out_path.stat().st_size} bytes)")


def build_operator():
    clear_scene()
    cloth = make_mat("Cloth", 0x4B5340, 0.08, 0.82)
    steel = make_mat("Steel", 0x424D4D, 0.78, 0.35)
    dark = make_mat("DarkSteel", 0x1E2428, 0.65, 0.45)
    visor = make_mat("Visor", 0xFFB347, 0.9, 0.15, 0xFFB347, 2.2)

    add_box("LegL", (0.34, 0.36, 0.75), (-0.24, 0.0, 0.38), cloth)
    add_box("LegR", (0.34, 0.36, 0.75), (0.24, 0.0, 0.38), cloth)
    add_box("BootL", (0.36, 0.44, 0.24), (-0.24, 0.04, 0.12), dark)
    add_box("BootR", (0.36, 0.44, 0.24), (0.24, 0.04, 0.12), dark)
    add_box("Torso", (0.96, 0.62, 0.95), (0.0, 0.0, 1.15), cloth)
    add_box("ChestRig", (1.02, 0.68, 0.56), (0.0, 0.02, 1.22), steel)
    add_box("Pack", (0.72, 0.38, 0.78), (0.0, -0.46, 1.18), dark)
    add_box("PauldronL", (0.32, 0.46, 0.34), (-0.64, 0.0, 1.42), steel)
    add_box("PauldronR", (0.32, 0.46, 0.34), (0.64, 0.0, 1.42), steel)
    add_box("Helmet", (0.66, 0.68, 0.58), (0.0, 0.0, 1.88), steel)
    add_box("Visor", (0.54, 0.12, 0.18), (0.0, 0.34, 1.88), visor)
    export_glb("operator.glb")


def build_rifleman():
    clear_scene()
    chitin = make_mat("Chitin", 0x6E1418, 0.25, 0.68, 0x3A0406, 0.75)
    armor = make_mat("Armor", 0x2B1E20, 0.65, 0.42)
    optic = make_mat("Optic", 0xFF4D4D, 0.5, 0.2, 0xFF4D4D, 3.0)

    add_box("LegL", (0.3, 0.32, 0.7), (-0.22, 0.0, 0.35), armor)
    add_box("LegR", (0.3, 0.32, 0.7), (0.22, 0.0, 0.35), armor)
    add_box("Torso", (0.88, 0.56, 0.88), (0.0, 0.0, 1.08), chitin)
    add_box("Harness", (0.94, 0.62, 0.46), (0.0, 0.03, 1.16), armor)
    add_box("Helmet", (0.62, 0.64, 0.52), (0.0, 0.0, 1.76), armor)
    add_box("OpticStrip", (0.48, 0.1, 0.15), (0.0, 0.31, 1.76), optic)
    add_box("Carbine", (0.16, 0.95, 0.2), (0.42, 0.38, 1.12), armor)
    export_glb("rifleman.glb")


def build_sapper():
    clear_scene()
    suit = make_mat("Suit", 0x3A2418, 0.2, 0.75)
    tank = make_mat("VolatileTank", 0xFF6A2A, 0.4, 0.35, 0xFF6A2A, 2.4)
    steel = make_mat("Steel", 0x2D3338, 0.7, 0.4)

    add_box("LegL", (0.26, 0.28, 0.66), (-0.2, 0.0, 0.33), steel)
    add_box("LegR", (0.26, 0.28, 0.66), (0.2, 0.0, 0.33), steel)
    add_box("Torso", (0.76, 0.52, 0.78), (0.0, 0.08, 0.98), suit, rot=(0.22, 0.0, 0.0))
    add_cyl("TankL", 0.2, 0.82, (-0.22, -0.32, 1.18), tank)
    add_cyl("TankR", 0.2, 0.82, (0.22, -0.32, 1.18), tank)
    add_box("Head", (0.48, 0.5, 0.44), (0.0, 0.2, 1.56), steel)
    add_box("Goggles", (0.42, 0.12, 0.14), (0.0, 0.44, 1.56), tank)
    export_glb("sapper.glb")


def build_shieldbearer():
    clear_scene()
    armor = make_mat("HeavyArmor", 0x283038, 0.78, 0.38)
    crimson = make_mat("CrimsonTrim", 0x9E1E24, 0.35, 0.55, 0x3A0406, 0.8)
    optic = make_mat("Optic", 0xFF4D4D, 0.5, 0.2, 0xFF4D4D, 3.0)

    add_box("LegL", (0.38, 0.4, 0.74), (-0.26, 0.0, 0.37), armor)
    add_box("LegR", (0.38, 0.4, 0.74), (0.26, 0.0, 0.37), armor)
    add_box("Torso", (1.12, 0.74, 0.98), (0.0, 0.0, 1.15), crimson)
    add_box("PauldronL", (0.4, 0.54, 0.42), (-0.72, 0.0, 1.44), armor)
    add_box("PauldronR", (0.4, 0.54, 0.42), (0.72, 0.0, 1.44), armor)
    add_box("Helmet", (0.68, 0.68, 0.54), (0.0, 0.0, 1.86), armor)
    add_box("RiotShield", (1.48, 0.16, 1.72), (0.0, 0.62, 1.04), armor)
    add_box("ShieldSlit", (0.92, 0.2, 0.16), (0.0, 0.64, 1.52), optic)
    export_glb("shieldbearer.glb")


def build_spotter():
    clear_scene()
    camo = make_mat("ReconCamo", 0x26332B, 0.15, 0.82)
    steel = make_mat("Steel", 0x3A4347, 0.72, 0.38)
    laser = make_mat("LaserOptic", 0xFF6FD6, 0.8, 0.15, 0xFF6FD6, 3.2)

    add_box("Torso", (0.78, 0.48, 0.92), (0.0, 0.0, 1.05), camo)
    add_box("CommsPack", (0.58, 0.36, 0.68), (0.0, -0.38, 1.18), steel)
    add_cyl("WhipAntenna", 0.035, 1.65, (-0.22, -0.44, 2.15), steel)
    add_box("Hood", (0.56, 0.58, 0.52), (0.0, 0.0, 1.76), camo)
    add_cyl("DesignatorLens", 0.16, 0.36, (0.0, 0.34, 1.76), laser, rot=(math.pi / 2, 0.0, 0.0))
    export_glb("spotter.glb")


def build_drone():
    clear_scene()
    hull = make_mat("DroneHull", 0x242C33, 0.78, 0.34)
    rotor = make_mat("RotorBlade", 0x424D4D, 0.65, 0.4)
    eye = make_mat("DroneEye", 0xFF4D4D, 0.9, 0.15, 0xFF4D4D, 3.5)

    add_box("Core", (0.75, 0.95, 0.32), (0.0, 0.0, 0.0), hull)
    add_box("SensorPod", (0.36, 0.42, 0.26), (0.0, 0.32, -0.22), eye)
    for sx in (-0.65, 0.65):
        for sy in (-0.65, 0.65):
            add_box(f"Arm_{sx}_{sy}", (0.7, 0.1, 0.08), (sx * 0.5, sy * 0.5, 0.04), hull,
                    rot=(0.0, 0.0, math.atan2(sy, sx)))
            add_cyl(f"Rotor_{sx}_{sy}", 0.42, 0.04, (sx, sy, 0.12), rotor, vertices=16)
    export_glb("drone.glb")


def build_mortar():
    clear_scene()
    steel = make_mat("MortarSteel", 0x3B444A, 0.76, 0.36)
    olive = make_mat("AmmoCrate", 0x4B5340, 0.2, 0.76)
    beacon = make_mat("Beacon", 0xFFB347, 0.8, 0.2, 0xFFB347, 2.5)

    add_cyl("Baseplate", 0.78, 0.14, (0.0, 0.0, 0.07), steel, vertices=12)
    add_cyl("MortarTube", 0.22, 1.65, (0.0, 0.18, 0.92), steel, rot=(-0.52, 0.0, 0.0), vertices=14)
    add_box("AmmoBox", (0.68, 0.44, 0.42), (0.62, -0.18, 0.21), olive)
    add_cyl("RangeBeacon", 0.1, 0.45, (-0.54, 0.24, 0.28), beacon)
    export_glb("mortar.glb")


def build_mech():
    clear_scene()
    chassis = make_mat("MechChassis", 0x2B333A, 0.82, 0.32)
    crimson = make_mat("MechCrimson", 0x8F1D22, 0.45, 0.48, 0x3A0406, 0.9)
    core = make_mat("ReactorCore", 0xFF4D4D, 0.9, 0.12, 0xFF4D4D, 4.0)

    add_box("FootL", (0.58, 0.76, 0.24), (-0.52, 0.06, 0.12), chassis)
    add_box("FootR", (0.58, 0.76, 0.24), (0.52, 0.06, 0.12), chassis)
    add_box("LegL", (0.46, 0.5, 1.05), (-0.52, 0.0, 0.72), chassis)
    add_box("LegR", (0.46, 0.5, 1.05), (0.52, 0.0, 0.72), chassis)
    add_box("Pelvis", (1.35, 0.78, 0.36), (0.0, 0.0, 1.32), chassis)
    add_box("Hull", (1.68, 1.15, 1.18), (0.0, 0.06, 2.02), crimson)
    add_cyl("Reactor", 0.32, 0.22, (0.0, 0.62, 2.02), core, rot=(math.pi / 2, 0.0, 0.0), vertices=16)
    add_box("MissilePodL", (0.52, 0.68, 0.56), (-0.86, -0.04, 2.76), chassis)
    add_box("MissilePodR", (0.52, 0.68, 0.56), (0.86, -0.04, 2.76), chassis)
    add_cyl("RotaryMinigun", 0.26, 1.45, (1.12, 0.58, 1.88), chassis, rot=(math.pi / 2, 0.0, 0.0), vertices=12)
    export_glb("mech.glb")


def build_gunship():
    clear_scene()
    hull = make_mat("GunshipHull", 0x1F272D, 0.8, 0.34)
    crimson = make_mat("HostileStripe", 0xA82026, 0.4, 0.5, 0x3A0406, 0.85)
    canopy = make_mat("CanopyGlass", 0xFF4D4D, 0.92, 0.12, 0xFF4D4D, 3.2)

    add_box("Fuselage", (1.45, 4.2, 1.15), (0.0, 0.0, 0.0), hull)
    add_box("NoseCanopy", (1.15, 1.45, 0.78), (0.0, 2.25, -0.12), canopy)
    add_box("TailBoom", (0.52, 3.2, 0.55), (0.0, -3.1, 0.18), hull)
    add_box("TailFin", (0.18, 0.85, 1.25), (0.0, -4.45, 0.65), crimson)
    add_box("StubWingL", (3.6, 0.88, 0.22), (0.0, 0.25, 0.12), crimson)
    add_cyl("RocketPodL", 0.28, 1.35, (-1.45, 0.32, -0.18), hull, rot=(math.pi / 2, 0.0, 0.0))
    add_cyl("RocketPodR", 0.28, 1.35, (1.45, 0.32, -0.18), hull, rot=(math.pi / 2, 0.0, 0.0))
    add_cyl("ChinAutocannon", 0.14, 1.25, (0.0, 2.45, -0.62), hull, rot=(math.pi / 2, 0.0, 0.0))
    add_box("MainRotorA", (5.2, 0.28, 0.06), (0.0, 0.0, 0.78), hull)
    add_box("MainRotorB", (0.28, 5.2, 0.06), (0.0, 0.0, 0.78), hull)
    export_glb("gunship.glb")


def build_turret():
    clear_scene()
    steel = make_mat("TurretSteel", 0x3A454A, 0.78, 0.35)
    sensor = make_mat("TurretSensor", 0x6FFF9A, 0.9, 0.15, 0x6FFF9A, 2.8)

    for i in range(3):
        ang = i * (2 * math.pi / 3)
        add_box(f"Leg_{i}", (0.18, 0.85, 0.16), (math.sin(ang) * 0.42, math.cos(ang) * 0.42, 0.28),
                steel, rot=(0.45, 0.0, -ang))
    add_cyl("Pedestal", 0.22, 0.65, (0.0, 0.0, 0.58), steel)
    add_box("TurretHead", (0.64, 0.78, 0.44), (0.0, 0.0, 0.98), steel)
    add_cyl("BarrelL", 0.065, 0.95, (-0.14, 0.62, 0.98), steel, rot=(math.pi / 2, 0.0, 0.0))
    add_cyl("BarrelR", 0.065, 0.95, (0.14, 0.62, 0.98), steel, rot=(math.pi / 2, 0.0, 0.0))
    add_box("Optic", (0.28, 0.16, 0.18), (0.0, 0.36, 1.24), sensor)
    export_glb("turret.glb")


def build_props():
    clear_scene()
    stone = make_mat("Concrete", 0x4A5058, 0.08, 0.88)
    stripe = make_mat("HazardStripe", 0xFFB347, 0.2, 0.6)
    add_box("BarrierBase", (2.6, 0.72, 0.42), (0.0, 0.0, 0.21), stone)
    add_box("BarrierTop", (2.52, 0.38, 0.68), (0.0, 0.0, 0.74), stone)
    add_box("Stripe", (2.54, 0.42, 0.14), (0.0, 0.0, 0.92), stripe)
    export_glb("barrier.glb")

    clear_scene()
    metal = make_mat("ContainerSteel", 0x35424A, 0.68, 0.48)
    trim = make_mat("ContainerTrim", 0x4B5340, 0.45, 0.58)
    add_box("ContainerBody", (2.6, 5.8, 2.55), (0.0, 0.0, 1.275), metal)
    add_box("ContainerFrameF", (2.68, 0.22, 2.62), (0.0, 2.85, 1.31), trim)
    add_box("ContainerFrameB", (2.68, 0.22, 2.62), (0.0, -2.85, 1.31), trim)
    export_glb("container.glb")

    clear_scene()
    frame = make_mat("TowerFrame", 0x2F363D, 0.74, 0.42)
    deck = make_mat("TowerDeck", 0x3A3F47, 0.35, 0.72)
    beacon = make_mat("TowerBeacon", 0xFFE7C2, 0.8, 0.2, 0xFFE7C2, 2.5)
    for sx in (-1.1, 1.1):
        for sy in (-1.1, 1.1):
            add_box(f"Post_{sx}_{sy}", (0.22, 0.22, 4.6), (sx, sy, 2.3), frame)
    add_box("Deck", (2.65, 2.65, 0.28), (0.0, 0.0, 3.85), deck)
    add_box("RailF", (2.65, 0.14, 0.85), (0.0, 1.26, 4.35), frame)
    add_box("RailB", (2.65, 0.14, 0.85), (0.0, -1.26, 4.35), frame)
    add_box("Roof", (2.85, 2.85, 0.22), (0.0, 0.0, 5.65), frame)
    add_box("FloodLamp", (0.68, 0.28, 0.36), (0.0, 1.38, 5.42), beacon)
    export_glb("watchtower.glb")


if __name__ == "__main__":
    build_operator()
    build_rifleman()
    build_sapper()
    build_shieldbearer()
    build_spotter()
    build_drone()
    build_mortar()
    build_mech()
    build_gunship()
    build_turret()
    build_props()
    print("ALL_13_GLB_MODELS_EXPORTED")
