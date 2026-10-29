"""ART-02: put an explicit Path column on the main asset table and refresh stale statuses.

The acceptance for ART-02 wants every row to carry size, path, source and licence. The main table
already had size/format/budget, source and licence; this adds Path and corrects the rows whose status
was written before the feature shipped.
"""
from __future__ import annotations

import re
from pathlib import Path

DOC = Path(__file__).resolve().parent.parent / "ASSET_PLAN.md"

PATHS = {
    "A010": "src/main.js",
    "A020": "src/icons.js",
    "A030": "src/art/enemy-silhouettes.js (planned)",
    "A040": "src/foliage.js",
    "A050": "src/main.js",
    "A060": "src/main.js (sentry style)",
    "A070": "src/main.js (floodlight rig)",
    "A080": "src/models.js",
    "A090": "src/materials.js",
    "A100": "src/main.js",
    "A110": "src/main.js",
    "A120": "src/fx.js",
    "A130": "src/main.js",
    "A140": "src/audio.js",
    "A150": "src/casings.js",
    "A160": "src/audio.js",
    "A170": "src/audio.js",
    "A180": "src/audio.js",
    "A190": "src/theme.js",
    "A200": "src/enemies.js + src/models.js",
    "A210": "src/hud.js",
}

STATUS = {
    "A070": "Shipped (M0)",
    "A080": "Shipped (M4)",
    "A140": "Shipped (AUD-03)",
    "A150": "Shipped (FX-02)",
    "A160": "Shipped (synth)",
    "A170": "Shipped (synth)",   # impact timbres AUD-04
    "A180": "Shipped (AUD-02)",
}

lines = DOC.read_text(encoding="utf-8").splitlines()
out: list[str] = []
changed = 0
for line in lines:
    if line.startswith("| ID | Asset | Type | Use | Source | Licence | Format | Budget | Status | Hash"):
        out.append("| ID | Asset | Type | Use | Source | Licence | Format | Budget | Status | Path | Hash (SHA-256) |")
        changed += 1
        continue
    if line.startswith("|---|---|---|---|---|---|---|---|---|---|") and not out[-1:] == ["x"]:
        # the main table separator directly follows the main header
        if any(o.startswith("| ID | Asset | Type | Use") for o in out[-2:]):
            out.append("|---|---|---|---|---|---|---|---|---|---|---|")
            changed += 1
            continue
    m = re.match(r"^\| (A\d{3}) \|", line)
    if m and line.count("|") == 11:  # 10 columns
        cells = line.split("|")
        aid = m.group(1)
        path = PATHS.get(aid, "—")
        cells.insert(10, f" `{path}` ")
        line = "|".join(cells)
        if aid in STATUS:
            # status is cell index 9
            cells = line.split("|")
            cells[9] = f" {STATUS[aid]} "
            line = "|".join(cells)
        changed += 1
    out.append(line)

DOC.write_text("\n".join(out) + "\n", encoding="utf-8")
print(f"asset plan updated: {changed} lines")
