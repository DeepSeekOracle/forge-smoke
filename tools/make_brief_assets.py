"""Brief 01 art remainder, drawn locally (no diffusion): enemy portraits + weapon silhouettes.

Qwen-Image cannot allocate on this 8 GB card, so these are vector-style plates rendered with Pillow:
consistent gunmetal/amber/cyan palette, no baked text, alpha where the brief asks for it.

    python tools/make_brief_assets.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SS = 4  # supersample factor

GUNMETAL = (13, 20, 28)
AMBER = (255, 179, 71)
CYAN = (111, 227, 255)
HOSTILE = (242, 84, 91)
STEEL = (36, 48, 60)


def canvas(w: int, h: int, alpha: bool) -> Image.Image:
    return Image.new("RGBA" if alpha else "RGB", (w * SS, h * SS), (0, 0, 0, 0) if alpha else (7, 11, 16))


def frame(d: ImageDraw.ImageDraw, w: int, h: int, accent, alpha: bool) -> None:
    d.rectangle([0, 0, w - 1, h - 1], outline=accent + (140,), width=2 * SS)
    for x, y in ((8, 8), (w - 8, 8), (8, h - 8), (w - 8, h - 8)):
        d.rectangle([x - 3 * SS, y - 3 * SS, x + 3 * SS, y + 3 * SS], fill=accent)


def enemy_portrait(name: str, accent) -> Image.Image:
    w = h = 256
    img = canvas(w, h, alpha=True)
    d = ImageDraw.Draw(img, "RGBA")
    # backplate
    for y in range(h * SS):
        k = y / (h * SS)
        d.line([(0, y), (w * SS, y)], fill=(int(10 + 6 * k), int(15 + 7 * k), int(21 + 6 * k), 255))
    d.ellipse([w * SS * 0.12, h * SS * 0.16, w * SS * 0.88, h * SS * 0.92], fill=(18, 26, 35, 255), outline=accent + (160,), width=2 * SS)
    cx = w * SS / 2
    top = h * SS * 0.28
    body = accent + (235,)
    dark = (9, 13, 18, 255)
    # shoulders / torso
    d.polygon([(cx - 62 * SS, h * SS * 0.95), (cx - 46 * SS, h * SS * 0.6), (cx + 46 * SS, h * SS * 0.6), (cx + 62 * SS, h * SS * 0.95)], fill=dark, outline=accent + (150,))
    # head/helmet
    d.rounded_rectangle([cx - 26 * SS, top, cx + 26 * SS, top + 54 * SS], radius=14 * SS, fill=dark, outline=body, width=2 * SS)
    # visor
    d.rectangle([cx - 18 * SS, top + 22 * SS, cx + 18 * SS, top + 32 * SS], fill=accent + (220,))
    if name == "rifleman":
        d.line([(cx + 20 * SS, top + 62 * SS), (cx + 78 * SS, top + 96 * SS)], fill=accent, width=6 * SS)
        d.rectangle([cx + 56 * SS, top + 78 * SS, cx + 84 * SS, top + 92 * SS], fill=STEEL)
    elif name == "sapper":
        d.ellipse([cx - 70 * SS, top + 86 * SS, cx - 20 * SS, top + 130 * SS], fill=STEEL, outline=HOSTILE, width=2 * SS)
        d.line([(cx - 62 * SS, top + 96 * SS), (cx - 70 * SS, top + 62 * SS)], fill=HOSTILE, width=3 * SS)
    elif name == "shieldbearer":
        d.rounded_rectangle([cx - 88 * SS, top + 40 * SS, cx - 30 * SS, top + 150 * SS], radius=6 * SS, fill=STEEL, outline=CYAN + (200,), width=3 * SS)
        d.ellipse([cx - 68 * SS, top + 78 * SS, cx - 50 * SS, top + 96 * SS], fill=CYAN + (200,))
    elif name == "drone":
        d.ellipse([cx - 30 * SS, top + 40 * SS, cx + 30 * SS, top + 96 * SS], fill=dark, outline=accent, width=2 * SS)
        for sx in (-1, 1):
            for sy in (-1, 1):
                d.ellipse([cx + sx * 66 * SS - 20 * SS, top + 40 * SS + sy * 26 * SS - 8 * SS, cx + sx * 66 * SS + 20 * SS, top + 40 * SS + sy * 26 * SS + 8 * SS], outline=accent + (200,), width=2 * SS)
    elif name == "gunship":
        d.polygon([(cx - 92 * SS, top + 70 * SS), (cx + 92 * SS, top + 70 * SS), (cx + 58 * SS, top + 104 * SS), (cx - 58 * SS, top + 104 * SS)], fill=dark, outline=accent, width=2 * SS)
        d.ellipse([cx - 26 * SS, top + 26 * SS, cx + 26 * SS, top + 74 * SS], fill=dark, outline=accent, width=2 * SS)
        for sx in (-1, 1):
            d.line([(cx + sx * 80 * SS, top + 62 * SS), (cx + sx * 110 * SS, top + 52 * SS)], fill=accent, width=4 * SS)
    frame(d, w * SS, h * SS, accent, True)
    return img.resize((w, h), Image.LANCZOS).convert("RGB")


WEAPONS = {
    "spray": dict(barrel=118, body=104, mag="curved", stock="fold", sight="iron"),
    "pierce": dict(barrel=196, body=120, mag="box", stock="fixed", sight="scope"),
    "cone": dict(barrel=150, body=96, mag=None, stock="fixed", sight="iron", barrels=2),
    "ricochet": dict(barrel=140, body=112, mag="box", stock="fold", sight="iron"),
    "burst": dict(barrel=176, body=116, mag="box", stock="fixed", sight="scope"),
    "beam": dict(barrel=160, body=112, mag="cell", stock="fixed", sight="iron", coils=4),
    "chain": dict(barrel=120, body=118, mag="drum", stock="fixed", sight="iron", prongs=True),
    "spinup": dict(barrel=168, body=120, mag="box", stock="fixed", sight="iron", barrels=6),
    "rail": dict(barrel=220, body=124, mag="cell", stock="fixed", sight="scope", rails=True),
    "flamer": dict(barrel=96, body=110, mag=None, stock="fixed", sight="iron", tank=True),
    "arc": dict(barrel=110, body=120, mag="drum", stock="fixed", sight="iron"),
    "sentry": dict(barrel=140, body=100, mag="box", stock="none", sight="iron", tripod=True),
    "flak": dict(barrel=200, body=112, mag="box", stock="fixed", sight="iron", barrels=2),
    "breach": dict(barrel=86, body=104, mag=None, stock="fixed", sight="iron", barrels=2),
    "rail2": dict(barrel=236, body=128, mag="cell", stock="fixed", sight="scope", rails=True, brake=True),
}


def weapon_silhouette(name: str, cfg: dict) -> Image.Image:
    w, h = 512, 256
    img = canvas(w, h, alpha=True)
    d = ImageDraw.Draw(img, "RGBA")
    base_y = h * SS * 0.56
    x = 70 * SS
    body_w = cfg["body"] * SS
    body_h = 30 * SS
    d.rounded_rectangle([x, base_y - body_h / 2, x + body_w, base_y + body_h / 2], radius=5 * SS, fill=(15, 22, 30, 255), outline=AMBER + (210,), width=2 * SS)
    # stock
    if cfg["stock"] == "fixed":
        d.polygon([(x, base_y - 12 * SS), (x - 46 * SS, base_y - 4 * SS), (x - 46 * SS, base_y + 14 * SS), (x, base_y + 12 * SS)], fill=(13, 19, 26, 255), outline=AMBER + (170,))
    elif cfg["stock"] == "fold":
        d.line([(x, base_y - 10 * SS), (x - 34 * SS, base_y + 16 * SS)], fill=AMBER + (200,), width=4 * SS)
    # barrel(s)
    bx = x + body_w
    count = cfg.get("barrels", 1)
    for i in range(count):
        off = (i - (count - 1) / 2) * 9 * SS
        d.rectangle([bx, base_y + off - 4 * SS, bx + cfg["barrel"] * SS, base_y + off + 4 * SS], fill=(20, 28, 36, 255), outline=AMBER + (190,), width=2 * SS)
    if cfg.get("brake"):
        d.rectangle([bx + cfg["barrel"] * SS - 10 * SS, base_y - 12 * SS, bx + cfg["barrel"] * SS + 6 * SS, base_y + 12 * SS], fill=STEEL, outline=AMBER)
    # magazine
    mag = cfg.get("mag")
    if mag == "curved":
        d.polygon([(x + body_w * 0.45, base_y + body_h / 2), (x + body_w * 0.62, base_y + body_h / 2), (x + body_w * 0.72, base_y + 62 * SS), (x + body_w * 0.56, base_y + 66 * SS)], fill=(17, 24, 32, 255), outline=AMBER + (190,))
    elif mag == "box":
        d.rectangle([x + body_w * 0.5, base_y + body_h / 2, x + body_w * 0.68, base_y + 60 * SS], fill=(17, 24, 32, 255), outline=AMBER + (190,))
    elif mag == "drum":
        d.ellipse([x + body_w * 0.46, base_y + 12 * SS, x + body_w * 0.46 + 44 * SS, base_y + 56 * SS], fill=(17, 24, 32, 255), outline=AMBER + (190,))
    elif mag == "cell":
        d.rectangle([x + body_w * 0.3, base_y - 8 * SS, x + body_w * 0.52, base_y + 8 * SS], fill=CYAN + (90,), outline=CYAN + (220,))
    # sight
    if cfg.get("sight") == "scope":
        d.rounded_rectangle([x + body_w * 0.2, base_y - 26 * SS, x + body_w * 0.62, base_y - 14 * SS], radius=4 * SS, fill=(10, 15, 21, 255), outline=CYAN + (190,), width=2 * SS)
    else:
        d.rectangle([x + body_w * 0.3, base_y - 22 * SS, x + body_w * 0.36, base_y - 12 * SS], fill=(20, 28, 36, 255), outline=AMBER + (160,))
    # flavour bits
    for i in range(cfg.get("coils", 0)):
        cx = bx + (i + 1) * 12 * SS
        d.ellipse([cx, base_y - 12 * SS, cx + 10 * SS, base_y + 12 * SS], outline=CYAN + (220,), width=2 * SS)
    if cfg.get("prongs"):
        for off in (-12, 12):
            d.line([(bx + 20 * SS, base_y + off * SS), (bx + 48 * SS, base_y + off * 1.6 * SS)], fill=CYAN + (220,), width=3 * SS)
    if cfg.get("rails"):
        for off in (-14, 14):
            d.line([(bx, base_y + off * SS), (bx + cfg["barrel"] * SS, base_y + off * SS)], fill=CYAN + (160,), width=2 * SS)
    if cfg.get("tank"):
        d.ellipse([x - 26 * SS, base_y + 16 * SS, x + 18 * SS, base_y + 66 * SS], fill=(17, 24, 32, 255), outline=AMBER + (170,))
    if cfg.get("tripod"):
        d.line([(x + body_w * 0.4, base_y + body_h / 2), (x + body_w * 0.3, base_y + 78 * SS)], fill=AMBER + (200,), width=4 * SS)
        d.line([(x + body_w * 0.6, base_y + body_h / 2), (x + body_w * 0.7, base_y + 78 * SS)], fill=AMBER + (200,), width=4 * SS)
    frame(d, w * SS, h * SS, AMBER, True)
    out = img.resize((w, h), Image.LANCZOS)
    # soft amber rim light
    glow = out.filter(ImageFilter.GaussianBlur(6))
    return Image.alpha_composite(glow, out)


def main() -> int:
    enemies = ROOT / "assets" / "portraits" / "enemies"
    enemies.mkdir(parents=True, exist_ok=True)
    for name, accent in (("rifleman", HOSTILE), ("sapper", AMBER), ("shieldbearer", CYAN),
                         ("drone", CYAN), ("gunship", AMBER)):
        enemy_portrait(name, accent).save(enemies / f"{name}.png")

    icons = ROOT / "assets" / "icons" / "styles"
    icons.mkdir(parents=True, exist_ok=True)
    for name, cfg in WEAPONS.items():
        weapon_silhouette(name, cfg).save(icons / f"{name}.png")

    print(f"wrote {len(WEAPONS)} weapon silhouettes and 5 enemy portraits")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
