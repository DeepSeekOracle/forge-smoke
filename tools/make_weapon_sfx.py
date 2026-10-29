"""Generate distinct weapon-report WAVs for AUD-03 (stdlib only, no samples downloaded).

Each style family gets its own file so at least six styles map to distinct samples. Kept short
(0.08-0.40 s) and normalised to 0.35 peak: eight files total well under the 4 MB budget.
"""
from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

RATE = 44100
OUT = Path(__file__).resolve().parent.parent / "assets" / "sfx"
random.seed(963)


def env(i: int, n: int, attack: float, decay: float) -> float:
    a = max(1, int(n * attack))
    if i < a:
        return i / a
    x = (i - a) / max(1, n - a)
    return math.exp(-x / max(0.02, decay))


def noise() -> float:
    return random.uniform(-1.0, 1.0)


def lowpass(samples: list[float], alpha: float) -> list[float]:
    out = []
    prev = 0.0
    for s in samples:
        prev = prev + alpha * (s - prev)
        out.append(prev)
    return out


def write(name: str, samples: list[float]) -> None:
    peak = max(1e-6, max(abs(s) for s in samples))
    g = 0.35 / peak
    data = b"".join(struct.pack("<h", int(max(-1, min(1, s * g)) * 32767)) for s in samples)
    path = OUT / name
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(data)
    print(f"{name}: {len(samples) / RATE:.2f}s {path.stat().st_size} bytes")


def shot(name: str, dur: float, thump: float, bright: float, tail: float = 0.5) -> None:
    n = int(RATE * dur)
    raw = []
    for i in range(n):
        e = env(i, n, 0.01, tail)
        body = math.sin(2 * math.pi * thump * (1 - 0.4 * i / n) * i / RATE) * 0.8
        raw.append((noise() * bright + body) * e)
    write(name, lowpass(raw, 0.55))


def sweep(name: str, dur: float, f0: float, f1: float, crack: float = 0.0) -> None:
    n = int(RATE * dur)
    phase = 0.0
    raw = []
    for i in range(n):
        f = f0 + (f1 - f0) * (i / n)
        phase += 2 * math.pi * f / RATE
        e = env(i, n, 0.02, 0.65)
        raw.append((math.sin(phase) * 0.7 + noise() * crack) * e)
    write(name, raw)


OUT.mkdir(parents=True, exist_ok=True)
shot("shot_smg.wav", 0.12, 130, 0.55, 0.35)
shot("shot_shotgun.wav", 0.28, 85, 0.75, 0.7)
shot("shot_marksman.wav", 0.18, 190, 0.45, 0.45)
shot("shot_minigun.wav", 0.08, 150, 0.5, 0.25)
shot("shot_grenade.wav", 0.22, 70, 0.35, 0.8)
sweep("shot_beam.wav", 0.22, 1200, 320, 0.10)
sweep("shot_rail.wav", 0.40, 300, 2400, 0.16)
# flamethrower: filtered noise with a slow decay, no tone
n = int(RATE * 0.38)
raw = [noise() * env(i, n, 0.06, 1.1) for i in range(n)]
write("shot_flamer.wav", lowpass(raw, 0.18))
