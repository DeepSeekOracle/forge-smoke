"""Fix HUD panel units: panels/images use height units for w, so scale widths by width/height."""
from pathlib import Path

p = Path("src/main.js")
t = p.read_text(encoding="utf-8")

t = t.replace(
    "      const cx = 0.014, cy = 0.024, cw = 0.30, ch = 0.142;",
    "      const W2H = (globalThis.innerWidth || 1400) / (globalThis.innerHeight || 850);\n"
    "      const pw = (f) => f * W2H; // panel/image widths are height units in the HUD\n"
    "      const cx = 0.014, cy = 0.024, cw = pw(0.30), ch = 0.142;",
)
t = t.replace("x: cx + cw - 0.026, y: cy + ch - 0.0022, w: 0.026, h: 0.0022, fill: br",
              "x: cx + 0.30 - 0.026, y: cy + ch - 0.0022, w: pw(0.026), h: 0.0022, fill: br")
t = t.replace("x: cx + cw - 0.0022, y: cy + ch - 0.014, w: 0.0022, h: 0.014, fill: br",
              "x: cx + 0.30 - 0.0022, y: cy + ch - 0.014, w: pw(0.0022), h: 0.014, fill: br")
t = t.replace("x: cx, y: cy, w: 0.026, h: 0.0022, fill: br", "x: cx, y: cy, w: pw(0.026), h: 0.0022, fill: br")
t = t.replace("x: cx, y: cy, w: 0.0022, h: 0.014, fill: br", "x: cx, y: cy, w: pw(0.0022), h: 0.014, fill: br")
t = t.replace("x: cx + cw - 0.012, y: 0.058, size: TYPE_SCALE.subhead", "x: cx + 0.288, y: 0.058, size: TYPE_SCALE.subhead")

t = t.replace("      const wx = 0.722, wy = 0.812, ww = 0.264, wh = 0.152;",
              "      const wx = 0.722, wy = 0.812, ww = pw(0.264), wh = 0.152;")
t = t.replace("x: wx + ww - 0.026, y: wy + wh - 0.0022, w: 0.026, h: 0.0022, fill: br",
              "x: wx + 0.264 - 0.026, y: wy + wh - 0.0022, w: pw(0.026), h: 0.0022, fill: br")
t = t.replace("x: wx + ww - 0.0022, y: wy + wh - 0.014, w: 0.0022, h: 0.014, fill: br",
              "x: wx + 0.264 - 0.0022, y: wy + wh - 0.014, w: pw(0.0022), h: 0.014, fill: br")
t = t.replace("x: wx, y: wy, w: 0.026, h: 0.0022, fill: br", "x: wx, y: wy, w: pw(0.026), h: 0.0022, fill: br")
t = t.replace("x: wx, y: wy, w: 0.0022, h: 0.014, fill: br", "x: wx, y: wy, w: pw(0.0022), h: 0.014, fill: br")
p.write_text(t, encoding="utf-8")
print("panel units fixed")
