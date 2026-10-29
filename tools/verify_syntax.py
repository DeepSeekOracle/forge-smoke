#!/usr/bin/env python
"""Exit 0 only if every src/*.js parses and has no duplicate top-level declarations."""
import re, subprocess, sys, collections
from pathlib import Path

root = Path(__file__).resolve().parent.parent
bad = []
for f in sorted((root / "src").glob("*.js")):
    r = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True)
    if r.returncode != 0:
        bad.append(f"{f.name}: {(r.stderr or '').strip().splitlines()[0] if r.stderr else 'syntax error'}")
        continue
    text = f.read_text(encoding="utf-8", errors="replace")
    decls = re.findall(r"^(?:export\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)", text, re.M)
    dupes = [n for n, k in collections.Counter(decls).items() if k > 1]
    if dupes:
        bad.append(f"{f.name}: duplicate top-level declaration {sorted(dupes)}")

if bad:
    print("VERIFY FAILED")
    for b in bad:
        print("  " + b)
    sys.exit(1)
print(f"VERIFY OK  {len(list((root / 'src').glob('*.js')))} files parse, no duplicate declarations")
