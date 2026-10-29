"""Exact-anchor patcher (D1): a replace that refuses to be a silent no-op.

Two builds shipped "fixes" that changed nothing because a string replace found no anchor. This
helper makes that loud:

    from patch import patch
    patch("src/main.js", "old exact text", "new exact text")

CLI:
    python tools/patch.py src/main.js old.txt new.txt
    python tools/patch.py --self-test

It asserts the anchor exists, the replacement actually changed the text, the new text is present,
and (for .js) that the file still parses. Writes preserving the file's existing newlines.
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path


def patch(path: str | Path, old: str, new: str, count: int = 1) -> int:
    p = Path(path)
    s = p.read_text(encoding="utf-8", newline="")
    if old not in s:
        raise SystemExit(f"ANCHOR NOT FOUND in {p}:\n---\n{old[:400]}\n---")
    out = s.replace(old, new, count)
    if out == s:
        raise SystemExit(f"REPLACE DID NOT CHANGE {p}")
    if new not in out:
        raise SystemExit(f"NEW TEXT MISSING AFTER REPLACE in {p}")
    p.write_text(out, encoding="utf-8", newline="")
    return count


def self_test() -> int:
    with tempfile.TemporaryDirectory() as td:
        f = Path(td) / "probe.txt"
        f.write_text("alpha beta gamma", encoding="utf-8")
        patch(f, "beta", "BETA")
        assert f.read_text(encoding="utf-8") == "alpha BETA gamma", "patch did not apply"
        try:
            patch(f, "delta", "DELTA")
        except SystemExit:
            pass
        else:
            raise AssertionError("missing anchor did not fail loudly")
        try:
            patch(f, "BETA", "BETA")
        except SystemExit:
            pass
        else:
            raise AssertionError("no-op replace did not fail loudly")
    print("patch.py self-test OK")
    return 0


def main() -> int:
    if "--self-test" in sys.argv:
        return self_test()
    if len(sys.argv) != 4:
        print("usage: python tools/patch.py <file> <old.txt> <new.txt>   |   --self-test")
        return 1
    old = Path(sys.argv[2]).read_text(encoding="utf-8")
    new = Path(sys.argv[3]).read_text(encoding="utf-8")
    n = patch(sys.argv[1], old, new)
    if sys.argv[1].endswith(".js"):
        r = subprocess.run(["node", "--check", sys.argv[1]], capture_output=True, text=True)
        if r.returncode != 0:
            print("PATCHED FILE DOES NOT PARSE:\n" + (r.stderr or "")[:600])
            return 1
    print(f"patched {sys.argv[1]} ({n} replacement)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
