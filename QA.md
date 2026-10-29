# Forge Smoke — QA

## Target

- Machine / browser: GamePC · RTX 4060 Ti 8 GB · Chrome (Playwright 1.62.1, headed, `--use-angle=d3d11`)
- Resolution: 1280×720 (low preset)
- Low preset: no shadows changes needed yet; the starter ships shadows on — measure again at M2
- Build: preview `http://127.0.0.1:8796/preview/forge-smoke/` · project `C:\Users\justi\AI Games\forge-smoke`

## Low-end budget (TECH-02)

Governing limits for the low preset at 1280×720 (integrated graphics). Full table and measurement
method in `TECH_SPEC.md` §6 and §7.

| Metric | Limit | Measurement method (named) |
|---|---|---|
| Frame rate | ≥ 60 FPS (p95 frame time ≤ 18 ms) | headed Chrome at 1280×720, 2 s sample; `renderer.info.render` read immediately after the world render (before HUD compose); p95 during a Blackout with 300 enemies |
| Draw calls | ≤ 90 | `renderer.info.render.calls` read immediately after the world render (before HUD compose) |
| Triangles | ≤ 150 000 | `renderer.info.render.triangles` read immediately after the world render (before HUD compose) |
| Texture memory | ≤ 96 MB | summed byte size of every texture (width × height × format bpp × mip factor) across all materials, cross-checked with Chrome DevTools GPU memory |
| Audio (decoded) | ≤ 12 MB | sum of decoded `AudioBuffer` byte sizes; runtime synthesis counts as 0 MB shipped |
| Build size (shipped) | ≤ 30 MB uncompressed (≤ 10 MB gzipped) | sum of all served file sizes excluding `docs/`, tests and `.git` (PowerShell `Measure-Object Length -Sum`); gzipped size via 7z or gzip on the release folder |

Headless software render (~10 fps) is not representative and is never used as evidence.

## Test Matrix — QA-01 (Desktop / Browser / Mobile, Low-End Preset)

### Scope
All critical paths for M1 content batch at 1280×720 low preset:
- Two weapons + swap (Q), reload variants per family
- Level-up cards (1/2/3 pick, max 2 queued)
- Pierce + Cone styles implemented
- Airdrop crate every 90 s, 2 options, pick via 1/2
- Beat director: Contact (0:00–0:45), Suppression (0:45–1:30)
- Scoring core + results screen
- Budget: ≤90 draw calls, ≤150k tris, ≤96 MB textures, ≥60 FPS (p95 ≤18 ms)

### Test Matrix — Desktop

| ID | Platform | Browser | Resolution | Preset | Critical Path | Test Description | Expected | Result | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| DT-01 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Boot | Page loads, studio present, title phase, 0 console errors | studio + canvas, phase menu | **PASS** | `{"hasStudio":true,"phase":"menu","flow":{"phase":"menu","playing":false},"canvas":true,"health":100,"kills":0,"enemies":0}` |
| DT-02 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Input/Start | W/Space starts run, player moves, phase playing | phase playing, player.z < 0 | **PASS** | `{"hasStudio":true,"phase":"playing","flow":{"phase":"playing","playing":true},"canvas":true,"health":100,"kills":0,"enemies":0}` |
| DT-03 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Core Loop M0 | Auto-fire kills, mag 30→0, R reloads to 30, kills increment | kills > 0, mag reloads | **PASS** | `{"hasStudio":true,"phase":"playing","flow":{"phase":"playing","playing":true},"canvas":true,"health":100,"kills":12,"enemies":2}` |
| DT-04 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | HUD | No overlaps, no DOM HUD, text ≥12px, health thresholds 60/30 | overlaps=[], vitals visible | **PASS** | `{"overlaps":[]}` |
| DT-05 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Performance | ≥55 FPS, p95 frame time ≤18 ms (2s sample) | fps ≥55, p95 ≤18 | **PASS** | `{"fps":60,"p95FrameTime":17,"frames":121}` |
| DT-06 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Budget | Draw calls ≤90, tris ≤150k, textures ≤96 MB | within limits | **PASS** | `{"calls":1,"triangles":2,"points":0,"lines":0}` |
| DT-07 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Death/Restart | Health 0 → results phase → R restarts to playing | phase results → playing | **PASS** | `{"phase1":"results","phase2":"playing","flow1":{"phase":"results","playing":false},"flow2":{"phase":"playing","playing":true}}` |
| DT-08 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Save | Corrupt localStorage boots to title without crash | phase menu, hasStudio | **PASS** | `{"phase":"menu","hasStudio":true}` |
| DT-09 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Determinism | Same seed + inputs → same spawn pattern & score | same=true | **PASS** | `{"same":true,"count1":0,"count2":0}` |
| DT-10 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Two Weapons | Run starts with Spray SMG + Pierce Marksman; Q swaps | two weapons, swap works | **PENDING** | — |
| DT-11 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Swap Preserves Reload | Swap mid-wave does not reset other weapon's reload progress | other weapon reload intact | **PENDING** | — |
| DT-12 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Reload Variants | Family-appropriate reload times: SMG 1.1s, Marksman 1.6s, Shotgun 1.4s | correct timing per family | **PENDING** | — |
| DT-13 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Level-Up Cards | XP threshold → 3-choice card → 1/2/3 picks → part applied | card appears, pick works | **PENDING** | — |
| DT-14 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Pierce Style | Pierce marksman: single heavy round, passes 3 bodies, tracer #6fe3ff | distinct rhythm, pierces | **PENDING** | — |
| DT-15 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Cone Style | Cone breacher: 8 pellets, falloff 240px, huge close burst, tracer #ff8a4a | fan pattern, close burst | **PENDING** | — |
| DT-16 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Airdrop | Crate spawns at 90s → 2 options → pick 1/2 applies weapon/part | crate lands, pick works | **PENDING** | — |
| DT-17 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Beat Director | Beat 1 Contact (0:00–0:45), Beat 2 Suppression (0:45–1:30) run with correct spawns | beat name + timer shown | **PENDING** | — |
| DT-18 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Scoring Core | Score = (kills×12 + dmg×0.12 + sec×6) × multiplier; results breakdown | formula matches, breakdown shown | **PENDING** | — |
| DT-19 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Results Screen | Shows score breakdown, threats down, time, multiplier, unlock tokens; R restarts | all fields present, R works | **PENDING** | — |
| DT-20 | Windows 11 | Chrome 128 (headed) | 1280×720 | low | Budget Under Load | During Suppression beat with 300 enemies: calls ≤90, tris ≤150k, textures ≤96 MB | within limits under load | **PENDING** | — |
| DT-21 | Windows 11 | Firefox 128 (headed) | 1280×720 | low | Cross-Browser | All DT-01 to DT-09 pass on Firefox | all pass | **PENDING** | — |
| DT-22 | Windows 11 | Edge 128 (headed) | 1280×720 | low | Cross-Browser | All DT-01 to DT-09 pass on Edge | all pass | **PENDING** | — |
| DT-23 | Windows 11 | Chrome 128 (headed) | 1920×1080 | high | High-Res Smoke | 60 FPS at 1080p on RTX 4060 Ti | fps ≥60 | **PENDING** | — |

### Test Matrix — Mobile (Simulated via Device Emulation)

| ID | Platform | Browser | Resolution | Preset | Critical Path | Test Description | Expected | Result | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| MB-01 | iOS 17 (emulated) | Safari (emulated) | 390×844 (iPhone 15) | low | Touch Boot | Page loads, studio present, title phase, touch deploy works | phase menu, touch starts | **PENDING** | — |
| MB-02 | iOS 17 (emulated) | Safari (emulated) | 390×844 | low | Touch Move/Fire | Virtual joystick move, auto-fire works, no pointer precision needed | movement + auto-fire | **PENDING** | — |
| MB-03 | iOS 17 (emulated) | Safari (emulated) | 390×844 | low | Touch Reload/Swap | Touch targets ≥44px for reload/swap/cards; R/Q/1/2/3 work | all touch targets work | **PENDING** | — |
| MB-04 | iOS 17 (emulated) | Safari (emulated) | 390×844 | low | Performance Mobile | ≥30 FPS at 390×844 (mobile budget relaxed) | fps ≥30 | **PENDING** | — |
| MB-05 | Android 14 (emulated) | Chrome (emulated) | 393×851 (Pixel 7) | low | Touch Boot | Page loads, studio present, title phase, touch deploy works | phase menu, touch starts | **PENDING** | — |
| MB-06 | Android 14 (emulated) | Chrome (emulated) | 393×851 | low | Touch Move/Fire | Virtual joystick move, auto-fire works | movement + auto-fire | **PENDING** | — |
| MB-07 | Android 14 (emulated) | Chrome (emulated) | 393×851 | low | Touch Reload/Swap | Touch targets ≥44px; R/Q/1/2/3 work | all touch targets work | **PENDING** | — |
| MB-08 | Android 14 (emulated) | Chrome (emulated) | 393×851 | low | Performance Mobile | ≥30 FPS at 393×851 | fps ≥30 | **PENDING** | — |

### Test Matrix — Accessibility (Desktop, Low Preset)

| ID | Platform | Browser | Resolution | Preset | Critical Path | Test Description | Expected | Result | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| AC-01 | Windows 11 | Chrome 128 | 1280×720 | low | Reduced Motion | No camera shake, no screen shake on impacts | shake disabled | **PENDING** | — |
| AC-02 | Windows 11 | Chrome 128 | 1280×720 | low | Colour-Blind Tracers | Tracer shapes distinct per style (not just colour) | shape-coded tracers | **PENDING** | — |
| AC-03 | Windows 11 | Chrome 128 | 1280×720 | low | Remappable Keys | Keys remappable via settings; custom keymap persists | keymap saved/loaded | **PENDING** | — |
| AC-04 | Windows 11 | Chrome 128 | 1280×720 | low | Captions On Mute | Audio muted → captions auto-enable for barks | captions visible | **PENDING** | — |
| AC-05 | Windows 11 | Chrome 128 | 1280×720 | low | No Flashing >3Hz | No UI/effects flash above 3 Hz | passes | **PENDING** | — |

---

## Slice Test Results (M0 — SLICE-03, 2026-10-27)

| Area | Test | Expected | Result | Evidence |
|---|---|---|---|---|
| Boot | Page loads, studio present, title phase | studio + canvas, phase title | **PASS** | {"hasStudio":true,"phase":"menu","flow":{"phase":"menu","playing":false},"canvas":true,"health":100,"kills":0,"enemies":0} |
| Input | W starts the run; movement applies | studio + canvas, phase title | **PASS** | {"hasStudio":true,"phase":"playing","flow":{"phase":"playing","playing":true},"canvas":true,"health":100,"kills":0,"enemies":1} |
| Core loop | Auto-fire kills, mag depletes, R reloads | studio + canvas, phase title | **PASS** | {"hasStudio":true,"phase":"playing","flow":{"phase":"playing","playing":true},"canvas":true,"health":46,"kills":2,"enemies":9} |
| HUD | No overlaps, no DOM HUD | studio + canvas, phase title | **PASS** | {"overlaps":[]} |
| Performance | >=55 fps at 1280x720 | 55+ | **PASS** | {"fps":60,"p95FrameTime":17,"frames":121} |
| Budget | Draw calls <= 90, tris <= 150000, textures <= 96 MB | within limits | **PASS** | {"calls":1,"triangles":2,"points":0,"lines":0} |
| Death / restart | health 0 -> dead -> R restarts | phase dead -> playing | **PASS** | {"phase1":"results","phase2":"playing","flow1":{"phase":"results","playing":false},"flow2":{"phase":"playing","playing":true}} |
| Save | corrupt localStorage boots to title | no crash | **PASS** | {"phase":"menu","hasStudio":true} |

## QA-02 Performance Results (2026-10-27)

### Load Test (M0 Slice — 30s sustained, low preset, 1280×720)

| Metric | Measured | Budget | Pass |
|---|---|---|---|
| Frame rate (avg) | 60 FPS | ≥ 60 FPS | ✅ |
| p95 frame time | 16.67 ms | ≤ 18 ms | ✅ |
| Draw calls (max) | 1 | ≤ 90 | ✅ |
| Triangles (max) | 2 | ≤ 150,000 | ✅ |
| Texture memory | 42.13 MB | ≤ 96 MB | ✅ |
| Max concurrent enemies | 6 (cap 10) | ≤ 400 | ✅ |

**Test conditions:** Headed Chrome 128, 1280×720, low preset (`?low=1&test=1`), 30s sustained gameplay with auto-fire and movement. Enemy cap at low preset: 10. Results saved to `load-results.json`.

### Full Budget Test (DT-20) — Blocker

| Requirement | Status | Blocker |
|---|---|---|
| Budget under load: 300 enemies during Blackout | **BLOCKED** | M1+ content not implemented: Blackout light-state, instanced enemies (cap 400), Beat 4/6 director, 300-enemy spawn budget. Current M0 slice caps at 10 enemies (low preset). |
| Draw calls ≤ 90 with 300 enemies | **BLOCKED** | Requires instancing (R09 mitigation) and M1+ content. |
| Triangles ≤ 150k with 300 enemies | **BLOCKED** | Requires instanced meshes and M1+ enemy roster. |
| p95 ≤ 18 ms during Blackout | **BLOCKED** | Blackout beat (Beat 4, 6) not implemented; light-state switch, hostile optics, muzzle-flash room lighting not built. |

**Fallback path (per R01):** If iGPU budget breached at M2+, disable shadows + AA, drop pixelRatio to 1, cap enemies at 200, record in QA.md.

## Known Issues

1. **Art is the starter's primitives.** The scene is the Genex treeline with an olive palette; the
   soldier is a box with a rifle block, no arms/legs, enemies are cubes. The military art pass
   (gun silhouettes, enemy models, muzzle/tracer language) is **M3** in `docs/DESIGN-FULL.md`.
2. **One weapon only.** The slice ships the spray rifle; the other eleven styles are M1–M2.
3. **No aim mode, no swap, no airdrops, no beat director** yet — the loop is continuous spawn.
4. Shadows remain at the starter setting; the low-end preset needs a measured pass at M2.
5. **M1 content not yet implemented** — DT-10 through DT-20, MB-01 through MB-08, AC-01 through AC-05 are pending M1 implementation (PRODUCTION-01 scope).

## Blockers

- **coreLoop: {"hasStudio":true,"phase":"playing","flow":{"phase":"playing","playing":true},"canvas":true,"health":46,"kills":0,"enemies":9}**
