#!/usr/bin/env python
"""Exit 0 only if every src/*.js parses **as an ES module**, has no duplicate top-level declarations.

`node --check file.js` parses a bare .js as CommonJS and can miss module-only syntax errors (that is
exactly how a broken template literal passed the gate while the browser refused to load the game).
So each file is also copied to a .mjs and checked as a module.
"""
import re, subprocess, sys, collections, shutil, tempfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
bad = []
files = sorted((root / "src").glob("*.js"))
tmpdir = Path(tempfile.mkdtemp(prefix="forge-syntax-"))

for f in files:
    r = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True)
    if r.returncode != 0:
        detail = (r.stderr or "").strip().splitlines()
        bad.append(f"{f.name}: {detail[1].strip() if len(detail) > 1 else 'syntax error'}")
        continue
    probe = tmpdir / (f.stem + ".mjs")
    shutil.copyfile(f, probe)
    m = subprocess.run(["node", "--check", str(probe)], capture_output=True, text=True)
    if m.returncode != 0:
        lines = (m.stderr or "").strip().splitlines()
        where = next((ln.strip() for ln in lines if probe.name in ln), "")
        detail = next((ln.strip() for ln in lines if "SyntaxError" in ln), "module syntax error")
        bad.append(f"{f.name}: {detail} {where}")
        continue
    text = f.read_text(encoding="utf-8", errors="replace")
    decls = re.findall(r"^(?:export\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)", text, re.M)
    dupes = [n for n, k in collections.Counter(decls).items() if k > 1]
    if dupes:
        bad.append(f"{f.name}: duplicate top-level declaration {sorted(dupes)}")

shutil.rmtree(tmpdir, ignore_errors=True)

if bad:
    print("VERIFY FAILED")
    for b in bad:
        print("  " + b)
    sys.exit(1)
print(f"VERIFY OK  {len(files)} files parse as ES modules, no duplicate declarations")
