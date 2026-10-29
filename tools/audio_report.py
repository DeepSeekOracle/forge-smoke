"""Brief 09 A acceptance: mix table + every audio file with its measured duration.

Uses ffprobe (winget ffmpeg) for mp3/wav durations. Short one-shot weapon reports are called out
separately instead of being rounded up into a false claim.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FFPROBE = shutil.which("ffprobe") or r"C:\Users\justi\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffprobe.exe"

MIX = {
    "fire": 0.18, "reload": 0.18, "hit": 0.18, "pickup": 0.18, "hurt": 0.18,
    "impact_light": 0.12, "impact_heavy": 0.18, "impact_shield": 0.10,
    "master": 0.80, "sfx": 0.70, "ambience": 0.10, "barks": 0.90,
}


def duration(path: Path) -> float | None:
    r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                        "-of", "json", str(path)], capture_output=True, text=True)
    if r.returncode != 0:
        return None
    try:
        return float(json.loads(r.stdout)["format"]["duration"])
    except Exception:
        return None


def main() -> int:
    files = sorted((ROOT / "assets" / "sfx").glob("*"))
    files = [f for f in files if f.suffix.lower() in (".mp3", ".wav", ".ogg")]
    rows = []
    short = []
    for f in files:
        d = duration(f)
        if d is None:
            rows.append((f.name, "?", "unreadable"))
            continue
        kind = "ambience loop" if "ambience" in f.name else ("weapon report" if f.name.startswith("shot_") else "sfx")
        rows.append((f.name, f"{d:.2f}", kind))
        if kind == "sfx" and not (0.4 <= d <= 3.0):
            short.append((f.name, d))
    amb = [r for r in rows if r[2] == "ambience loop"]

    lines = ["# FORGE SMOKE — audio mix + measured durations", "",
             "Mix table (relative gain):", "",
             "| bus | gain |", "|---|---|",
             *[f"| {k} | {v} |" for k, v in MIX.items()], "",
             "Ambience: looped rain through a 1.8 kHz lowpass at 0.10, faded in on run start and out on",
             "results (`startAmbience` / `stopAmbience` in `src/audio.js`).", "",
             "| file | seconds | role |", "|---|---|---|"]
    lines += [f"| {n} | {d} | {k} |" for n, d, k in rows]
    lines += ["", f"Files: {len(rows)}. Ambience loop: {amb[0][0] if amb else 'MISSING'} ({amb[0][1] if amb else '?'} s).", ""]
    if short:
        lines += ["Short SFX (< 0.4 s) — one-shot reports/impacts, reported rather than padded:", ""]
        lines += [f"- {n}: {d:.2f} s" for n, d in short]
    (ROOT / "docs" / "AUDIO-MIX.md").write_text("\n".join(lines), encoding="utf-8")

    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
