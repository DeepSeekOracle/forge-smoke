# FORGE SMOKE — audio mix + measured durations

Mix table (relative gain):

| bus | gain |
|---|---|
| fire | 0.18 |
| reload | 0.18 |
| hit | 0.18 |
| pickup | 0.18 |
| hurt | 0.18 |
| impact_light | 0.12 |
| impact_heavy | 0.18 |
| impact_shield | 0.1 |
| master | 0.8 |
| sfx | 0.7 |
| ambience | 0.1 |
| barks | 0.9 |

Ambience: looped rain through a 1.8 kHz lowpass at 0.10, faded in on run start and out on
results (`startAmbience` / `stopAmbience` in `src/audio.js`).

| file | seconds | role |
|---|---|---|
| ambience-rain.mp3 | 19.96 | ambience loop |
| click.mp3 | 0.10 | sfx |
| death.mp3 | 1.26 | sfx |
| fire.mp3 | 1.10 | sfx |
| hit.mp3 | 0.63 | sfx |
| hurt.mp3 | 1.48 | sfx |
| kill.mp3 | 0.78 | sfx |
| laser.mp3 | 1.09 | sfx |
| laser3.mp3 | 0.98 | sfx |
| laser5.mp3 | 1.01 | sfx |
| laser7.mp3 | 0.93 | sfx |
| launch.mp3 | 0.53 | sfx |
| levelup.mp3 | 0.80 | sfx |
| reload.mp3 | 0.45 | sfx |
| shot_beam.wav | 0.22 | weapon report |
| shot_flamer.wav | 0.38 | weapon report |
| shot_grenade.wav | 0.22 | weapon report |
| shot_marksman.wav | 0.18 | weapon report |
| shot_minigun.wav | 0.08 | weapon report |
| shot_rail.wav | 0.40 | weapon report |
| shot_shotgun.wav | 0.28 | weapon report |
| shot_smg.wav | 0.12 | weapon report |

Files: 22. Ambience loop: ambience-rain.mp3 (19.96 s).

Short SFX (< 0.4 s) — one-shot reports/impacts, reported rather than padded:

- click.mp3: 0.10 s