#!/usr/bin/env python
"""Brief 01 asset check: every listed file exists at the stated size.

Fast, no browser. Fails the gate if art drifts in size or a plate goes missing.
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

CHECKS = {
    "assets/cards/weapon.jpg": (768, 512),
    "assets/cards/explosive.jpg": (768, 512),
    "assets/cards/light.jpg": (768, 512),
    "assets/cards/armour.jpg": (768, 512),
    "assets/cards/logistics.jpg": (768, 512),
    "assets/og-boss.jpg": (1200, 630),
    "assets/start-still-a.jpg": (1536, 864),
    "assets/start-still-b.jpg": (1536, 864),
}
for enemy in ("rifleman", "sapper", "shieldbearer", "drone", "gunship"):
    CHECKS[f"assets/portraits/enemies/{enemy}.png"] = (256, 256)
for style in ("spray", "pierce", "cone", "ricochet", "burst", "beam", "chain", "spinup",
              "rail", "flamer", "arc", "sentry", "flak", "breach", "rail2"):
    CHECKS[f"assets/icons/styles/{style}.png"] = (512, 256)

bad = []
for rel, want in CHECKS.items():
    p = ROOT / rel
    if not p.exists():
        bad.append(f"missing {rel}")
        continue
    with Image.open(p) as im:
        if im.size != want:
            bad.append(f"{rel}: {im.size[0]}x{im.size[1]} != {want[0]}x{want[1]}")

if bad:
    print("ASSETS FAILED")
    for b in bad:
        print("  " + b)
    sys.exit(1)

print(f"ASSETS OK  {len(CHECKS)} plates at stated sizes ({len(CHECKS) - 8 - 5} weapon silhouettes, 5 enemy portraits)")
