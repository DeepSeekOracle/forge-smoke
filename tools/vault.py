#!/usr/bin/env python
"""LYGO MIRROR VAULT — read-only release mirror + append-only submissions.

Two copies, by design:

  WORKING COPY  the project folder the Forge/agents edit freely. Disposable.
  VAULT         I:\\E Drive\\LYGO GAMES AND WEBPAGES\\<project>\\
                  RELEASE-READONLY/<commit>/   exact export of a pushed release. Never edited.
                  SUBMISSIONS/<ts>_<task>_<agent>/  append-only copies of what an agent handed in.
                  LEDGER.jsonl                 append-only record of every action.

Git is the third copy: every pushed release keeps its own history.

Commands
  snapshot  <project>              export git HEAD into RELEASE-READONLY/<commit> and lock it read-only
  submit    <project> --task ID --agent NAME --paths a b c
  backup    <project> --task ID --agent NAME --paths a b   (same as submit; used before an overwrite)
  verify    <project>              diff the working copy against the newest release: added/changed/deleted
  zip       <project>              zip a release copy for cold storage
  ledger    <project>              print the ledger

Every command appends one JSON line to LEDGER.jsonl. Nothing in RELEASE-READONLY is ever modified.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

VAULT_ROOT = Path(os.environ.get("LYGO_VAULT_ROOT", r"I:\E Drive\LYGO GAMES AND WEBPAGES"))
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", ".venv-bark", ".venv-kokoro", "dist", "build"}


def now() -> str:
    return dt.datetime.now().strftime("%Y%m%d-%H%M%S")


def project_vault(project: Path) -> Path:
    d = VAULT_ROOT / project.name
    (d / "RELEASE-READONLY").mkdir(parents=True, exist_ok=True)
    (d / "SUBMISSIONS").mkdir(parents=True, exist_ok=True)
    return d


def ledger(project: Path, entry: dict) -> None:
    entry["at"] = dt.datetime.now().isoformat(timespec="seconds")
    with open(project_vault(project) / "LEDGER.jsonl", "a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")


def git(project: Path, *args: str) -> str:
    return subprocess.run(["git", "-C", str(project), *args], capture_output=True, text=True,
                          encoding="utf-8", errors="replace").stdout.strip()


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def lock_readonly(root: Path) -> int:
    """Windows: deny WRITE for the current user on every file and folder (read stays open)."""
    n = 0
    if os.name != "nt":
        return n
    for p in [root, *root.rglob("*")]:
        flag = " (OI)(CI)(W)" if p.is_dir() else " (W)"
        subprocess.run(["icacls", str(p), "/deny", f"{os.environ.get('USERNAME')}:{flag}"],
                       capture_output=True)
        n += 1
    return n


def snapshot(project: Path, label: str | None) -> None:
    commit = git(project, "rev-parse", "--short", "HEAD") or "nogit"
    dirty = bool(git(project, "status", "--porcelain"))
    dest = project_vault(project) / "RELEASE-READONLY" / commit
    if dest.exists():
        print(f"  release {commit} already vaulted at {dest}")
        return
    dest.mkdir(parents=True, exist_ok=True)
    if (project / ".git").exists():
        subprocess.run(["git", "-C", str(project), "archive", "HEAD"], stdout=open(dest / "_archive.tar", "wb"))
        subprocess.run(["tar", "-xf", "_archive.tar", "-C", str(dest)], cwd=str(dest), capture_output=True)
        (dest / "_archive.tar").unlink(missing_ok=True)
    else:
        shutil.copytree(project, dest, dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns(*SKIP_DIRS))
    files = [p for p in dest.rglob("*") if p.is_file()]
    locked = lock_readonly(dest)
    ledger(project, {"action": "snapshot", "release": commit, "label": label or commit,
                     "files": len(files), "locked": locked, "working_tree_dirty": dirty})
    print(f"  release {commit} vaulted: {len(files)} files, {locked} ACLs locked")
    print(f"  -> {dest}")


def submit(project: Path, task: str, agent: str, paths: list[str]) -> None:
    stamp = now()
    dest = project_vault(project) / "SUBMISSIONS" / f"{stamp}_{task or 'adhoc'}_{(agent or 'agent')[:24]}"
    dest.mkdir(parents=True, exist_ok=True)
    saved = []
    for raw in paths:
        src = Path(raw)
        if not src.is_absolute():
            src = project / src
        if not src.exists():
            print(f"  MISS {src}")
            continue
        rel = src.relative_to(project) if str(src).startswith(str(project)) else Path(src.name)
        out = dest / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, out)
        saved.append({"path": str(rel), "bytes": out.stat().st_size, "sha256": sha256(out)})
    ledger(project, {"action": "submit", "task": task, "agent": agent,
                     "dir": str(dest.relative_to(project_vault(project))), "files": saved})
    print(f"  {len(saved)} file(s) appended to {dest.name}")


def newest_release(project: Path) -> Path | None:
    base = project_vault(project) / "RELEASE-READONLY"
    rels = [p for p in base.iterdir() if p.is_dir()] if base.exists() else []
    return sorted(rels, key=lambda p: p.stat().st_mtime)[-1] if rels else None


def verify(project: Path) -> None:
    rel = newest_release(project)
    if rel and (project / ".git").exists():
        # git is authoritative and immune to CRLF/LF churn from the archive
        st = git(project, "status", "--porcelain")
        added = sum(1 for l in st.splitlines() if l[:2].strip() in ("??", "A"))
        changed = sum(1 for l in st.splitlines() if l[:2].strip() in ("M", "MM", "AM"))
        deleted = sum(1 for l in st.splitlines() if l[:2].strip() in ("D", "DD"))
        for l in st.splitlines()[:10]:
            print("  " + l)
        print(f"  drift vs {rel.name}: +{added} ~{changed} -{deleted} (git)")
        ledger(project, {"action": "verify", "release": rel.name, "added": added,
                         "changed": changed, "deleted": deleted, "source": "git"})
        return
    if not rel:
        print("  no release vaulted yet - run snapshot first")
        return
    added = changed = deleted = 0
    rel_files = {p.relative_to(rel) for p in rel.rglob("*") if p.is_file()}
    work_files = set()
    for p in project.rglob("*"):
        if not p.is_file():
            continue
        parts = set(p.relative_to(project).parts)
        if parts & SKIP_DIRS:
            continue
        work_files.add(p.relative_to(project))
    for r in sorted(rel_files):
        w = project / r
        if not w.exists():
            deleted += 1
            if deleted <= 8:
                print(f"  DELETED  {r}")
        elif sha256(w) != sha256(rel / r):
            changed += 1
            if changed <= 8:
                print(f"  CHANGED  {r}")
    for r in sorted(work_files - rel_files):
        if str(r).split(os.sep)[0] in SKIP_DIRS:
            continue
        added += 1
        if added <= 8:
            print(f"  ADDED    {r}")
    print(f"  drift vs {rel.name}: {added} added, {changed} changed, {deleted} deleted")
    ledger(project, {"action": "verify", "release": rel.name,
                     "added": added, "changed": changed, "deleted": deleted})


def zip_release(project: Path) -> None:
    rel = newest_release(project)
    if not rel:
        print("  nothing to zip")
        return
    out = project_vault(project) / f"{project.name}_{rel.name}.zip"
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in rel.rglob("*"):
            if p.is_file():
                zf.write(p, p.relative_to(rel))
    ledger(project, {"action": "zip", "release": rel.name, "zip": out.name,
                     "bytes": out.stat().st_size})
    print(f"  {out.name}: {out.stat().st_size/1024/1024:.1f} MB")


def main() -> int:
    ap = argparse.ArgumentParser(description="LYGO mirror vault")
    ap.add_argument("command", choices=["snapshot", "submit", "backup", "verify", "zip", "ledger"])
    ap.add_argument("project")
    ap.add_argument("--label")
    ap.add_argument("--task", default="")
    ap.add_argument("--agent", default="")
    ap.add_argument("--paths", nargs="*", default=[])
    a = ap.parse_args()
    project = Path(a.project).resolve()
    if not project.exists():
        print(f"  no such project: {project}")
        return 2
    project_vault(project)
    if a.command == "snapshot":
        snapshot(project, a.label)
    elif a.command in ("submit", "backup"):
        submit(project, a.task, a.agent, a.paths)
    elif a.command == "verify":
        verify(project)
    elif a.command == "zip":
        zip_release(project)
    elif a.command == "ledger":
        f = project_vault(project) / "LEDGER.jsonl"
        print(f.read_text(encoding="utf-8") if f.exists() else "  empty ledger")
    return 0


if __name__ == "__main__":
    sys.exit(main())
