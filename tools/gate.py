#!/usr/bin/env python
"""One command gate: syntax/duplicate check, then the browser regression if the desk is up."""
import socket, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
def port_open(port=8796):
    with socket.socket() as s:
        s.settimeout(1.0)
        return s.connect_ex(("127.0.0.1", port)) == 0

r = subprocess.run([sys.executable, str(ROOT / "tools" / "verify_syntax.py")])
if r.returncode != 0:
    sys.exit(r.returncode)
print("SYNTAX OK")
if not port_open():
    print("REGRESS SKIPPED (desk 8796 not listening)")
    sys.exit(0)
env = dict(__import__("os").environ, NODE_PATH=r"C:\Users\justi\source\LYGOapps\node_modules")
r = subprocess.run(["node", str(ROOT / "tools" / "regress.mjs")], cwd=str(ROOT), env=env)
print("REGRESS", "OK" if r.returncode == 0 else "FAILED")
sys.exit(r.returncode)
