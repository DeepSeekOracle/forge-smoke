"""Bump every module version together (D3), including previously-unversioned relative imports.

main.js imports siblings with ?v=<version>; GitHub Pages caches modules by URL, so an unversioned
relative import can serve a stale module next to a fresh entry (measured live: a cached balance.js
without the shieldGate export). This rewrites all of them and parses every file.
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VERSION_RE = re.compile(r"\?v=[0-9A-Za-z._-]+")
REL_IMPORT_RE = re.compile(r'(from\s+"\./[^"?]+\.js)"')

def main() -> int:
    if len(sys.argv) != 2:
        print("usage: python tools/bump.py <version>")
        return 1
    version = sys.argv[1]
    if not re.fullmatch(r"[0-9A-Za-z][0-9A-Za-z._-]*", version):
        print("version must start alphanumeric (no ? or quotes)")
        return 1
    changed = 0
    for f in sorted((ROOT / "src").rglob("*.js")):
        s = f.read_text(encoding="utf-8")
        out = VERSION_RE.sub("?v=" + version, s)
        out = REL_IMPORT_RE.sub(lambda m: m.group(1) + "?v=" + version + '"', out)
        if out != s:
            f.write_text(out, encoding="utf-8")
            changed += 1
    index = ROOT / "index.html"
    s = index.read_text(encoding="utf-8")
    out = VERSION_RE.sub("?v=" + version, s)
    if out != s:
        index.write_text(out, encoding="utf-8")
        changed += 1
    r = subprocess.run([sys.executable, str(ROOT / "tools" / "verify_syntax.py")], capture_output=True, text=True)
    print(f"bumped {changed} files to ?v={version}")
    print(r.stdout.strip() or r.stderr.strip()[:400])
    return r.returncode

if __name__ == "__main__":
    raise SystemExit(main())
