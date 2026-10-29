"""Bump every module version together (D3).

`main.js` imports each sibling with `?v=<version>` and `index.html` pins the entry; a half-bump makes
the browser mix old and new modules. This rewrites all of them in one pass and then parses every file.

    python tools/bump.py 202610321a
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VERSION_RE = re.compile(r"\?v=[0-9A-Za-z._-]+")


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: python tools/bump.py <version>")
        return 1
    version = sys.argv[1]
    if not re.fullmatch(r"[0-9A-Za-z][0-9A-Za-z._-]*", version):
        print("version must be alphanumeric (no ? or quotes)")
        return 1

    changed = 0
    for f in sorted((ROOT / "src").rglob("*.js")):
        s = f.read_text(encoding="utf-8")
        out = VERSION_RE.sub("?v=" + version, s)
        if out != s:
            f.write_text(out, encoding="utf-8")
            changed += 1
    index = ROOT / "index.html"
    s = index.read_text(encoding="utf-8")
    out = VERSION_RE.sub("?v=" + version, s)
    if out != s:
        index.write_text(out, encoding="utf-8")
        changed += 1

    r = subprocess.run([sys.executable, str(ROOT / "tools" / "verify_syntax.py")],
                       capture_output=True, text=True)
    print(f"bumped {changed} files to ?v={version}")
    print(r.stdout.strip() or r.stderr.strip()[:400])
    return r.returncode


if __name__ == "__main__":
    sys.exit(main())
