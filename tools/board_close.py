"""Apply the verified task closures to TASKS.json — steward action only.

The repository hook refuses agent commits of `TASKS.json` / `.forge/` unless ALLOW_DESK=1, because
the board is editor-owned. This script prepares and applies exactly that change from
`docs/evidence/board-close.json`, which carries the evidence for each row.

    python tools/board_close.py            # dry run: print what would change
    ALLOW_DESK=1 python tools/board_close.py --apply
    git add TASKS.json && git commit -m "board: close 23 verified tasks"

It refuses to write unless --apply is passed AND ALLOW_DESK=1 is set (or --i-am-steward).
"""
from __future__ import annotations

import json
import os
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOARD = ROOT / "TASKS.json"
CLOSE = ROOT / "docs" / "evidence" / "board-close.json"


def main() -> int:
    apply = "--apply" in sys.argv
    steward = "--i-am-steward" in sys.argv or os.environ.get("ALLOW_DESK") == "1"
    data = json.loads(CLOSE.read_text(encoding="utf-8"))
    closes = data["tasks"]
    board = json.loads(BOARD.read_text(encoding="utf-8"))
    by_id = {t["id"]: t for t in board["tasks"]}

    missing = [tid for tid in closes if tid not in by_id]
    if missing:
        print("unknown task ids:", ", ".join(missing))
        return 1
    empty = [tid for tid, c in closes.items() if not c.get("evidence")]
    if empty:
        print("refusing: these closures have no evidence:", ", ".join(empty))
        return 1

    rows = []
    for tid, c in closes.items():
        t = by_id[tid]
        if t.get("status") == "done":
            rows.append((tid, "already done", ""))
            continue
        merged = list(dict.fromkeys(list(t.get("evidence") or []) + list(c["evidence"])))
        arts = list(dict.fromkeys(list(t.get("artifacts") or []) + list(c.get("artifacts") or [])))
        rows.append((tid, "-> done", f"{len(merged)} evidence lines, {len(arts)} artifacts"))
        if apply and steward:
            t["status"] = "done"
            t["evidence"] = merged
            t["artifacts"] = arts

    for tid, what, extra in rows:
        print(f"{tid:9s} {what:10s} {extra}")

    if not apply:
        print("\ndry run - pass --apply with ALLOW_DESK=1 to write the board")
        return 0
    if not steward:
        print("\nrefusing to write: set ALLOW_DESK=1 (the board is editor-owned)")
        return 1

    backup = BOARD.with_suffix(".json.bak-boardclose")
    shutil.copy2(BOARD, backup)
    BOARD.write_text(json.dumps(board, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    done = sum(1 for t in board["tasks"] if t.get("status") == "done")
    print(f"\nboard written: {done}/{len(board['tasks'])} done (backup {backup.name})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
