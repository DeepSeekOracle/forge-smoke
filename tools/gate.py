#!/usr/bin/env python
"""One command gate: syntax/duplicates -> pure-logic units -> browser regression (if desk is up)."""
import socket, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
def port_open(port=8796):
    with socket.socket() as s:
        s.settimeout(1.0)
        return s.connect_ex(("127.0.0.1", port)) == 0

def run(label, cmd, **kw):
    r = subprocess.run(cmd, cwd=str(ROOT), **kw)
    print(label, "OK" if r.returncode == 0 else "FAILED")
    if r.returncode != 0:
        sys.exit(r.returncode)

run("SYNTAX", [sys.executable, str(ROOT / "tools" / "verify_syntax.py")])
run("UNIT", ["node", str(ROOT / "tools" / "unit.mjs")])
if not port_open():
    print("REGRESS SKIPPED (desk 8796 not listening)")
    sys.exit(0)
env = dict(__import__("os").environ, NODE_PATH=r"C:\Users\justi\source\LYGOapps\node_modules")
run("REGRESS", ["node", str(ROOT / "tools" / "regress.mjs")], env=env)
