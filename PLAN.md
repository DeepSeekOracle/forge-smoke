# Forge Smoke — Plan

## Phase

qa

## Current task
- INT-01 (done) — Brief and scope lock: GAME.md rewritten to match the M2 build (3-arena campaign, 8-beat ladder, 7 enemy types, Blackout, overtime, full capability list with measured technical limits for excluded items). Evidence in TASKS.json.
- INT-02 (done) — Definition of done: BUILD.md §1 rewritten as the M2 done-list (24 preview-verifiable rows + 3 technical exclusions with measured limits + growth clause), mirroring GAME.md scope. Evidence in TASKS.json, DECISIONS.md.
- TECH-01 (done) — Tech Spec: TECH_SPEC.md written (engine, scene structure, data, input, save, audio, build, tests; architecture and test hooks explicit).
- TECH-02 (done) — Budget: low-end budgets (FPS, draw calls, triangles, texture memory, audio, build size) and measurement method recorded in TECH_SPEC.md and QA.md.
- TECH-03 (done) — Risk List: risk register R01-R20 (tech + content) with owner, trigger, mitigation and fallback in TECH_SPEC.md §9; PLAN.md and DECISIONS.md updated.
- SLICE-01 (done) — Core Build: slice verified end to end, input works, loop playable, 0 console errors, 59 fps at 1280×720. Evidence in TASKS.json.
- SLICE-02 (done) — HUD/Onboarding: readable HUD with vitals, hint, title/dead panels; first action obvious (green deploy prompt); HUD legible at 1280×720 (hud.overlaps: [], text ≥12 px, 60 fps). Evidence in TASKS.json.
- SLICE-03 (done) — Slice Test: all 9 acceptance checks pass (boot, start, core loop, death/restart, HUD, performance 59 fps, budget, save, determinism). Low-end mode verified. Evidence in QA.md, TASKS.json, docs/evidence/.
- PRODUCTION-01 (done) — Content Batch: M1 scope defined in GDD.md §13.5 (two weapons + swap, reload variants, level-up cards, Pierce + Cone styles, airdrop, beats 1–2, scoring core, results); 9 acceptance checks; evidence in TASKS.json, DECISIONS.md.
- PRODUCTION-02 (done) — Feel Pass: feedback, timing, camera and audio refined for M1 scope. Evidence in GDD.md §10, DECISIONS.md.
- PRODUCTION-03 (done) — Asset Pass: placeholders replaced with licensed, budget-compliant assets. Evidence in ASSET_PLAN.md, ASSET_INDEX.json.
- CON-01 (done) - Core loop proof: 30-second decision loop (AIM/FIRE/SWAP/UPGRADE/HOLD) documented in GAME.md and GDD.md 4.1; wave-forcing table (>=2 per wave), non-cosmetic proof, three concrete moments. Evidence in TASKS.json, DECISIONS.md.
- CON-02 (done) - Campaign ladder: eight beats + overtime mapped onto three arenas with time windows (Perimeter 0:00-2:30, Breach Yard 2:30-8:00, Gunship Pad 8:00-12:00+); unlock rule (clear beat 3 -> Breach Yard, clear beat 6 -> Gunship Pad, defeat Gunship -> campaign complete); each arena names its signature moment. Evidence in GDD.md 8, GAME.md, TASKS.json, DECISIONS.md.
- GDD-03 (done) - Economy and pacing: airdrop cadence (90 s, no catch-up), card weighting (slot/rarity/type rolls), overtime difficulty curve with numbers, score formula (documented + implemented in balance.js), and expected player power table by minute 2/5/10. Evidence in GDD.md §11.9, TECH_SPEC.md §3/§8, TASKS.json.
- GDD-04 (done) - UX flow: state diagram Title -> Arena Select -> Play -> Results -> Retry plus Pause and Options, with the key driving each transition; every state reachable and escapable by keyboard; no dead end. Evidence in GDD.md §9.5, DECISIONS.md, TASKS.json.
- QA-01 (done) — Test Matrix: desktop/browser/mobile test matrix for low-end preset written and run. M0 slice tests pass; M1 content tests pending implementation. Evidence in QA.md, TASKS.json.
- QA-02 (done) — Performance: load test (M0 slice, 30s sustained) passes all budgets (60 FPS, p95 16.67ms, 1 draw call, 2 tris, 42 MB textures). Full 300-enemy Blackout test blocked on M1+ content not implemented. Evidence in load-results.json, QA.md, TASKS.json.


- ART-01 (done) - Art bible lock: palette hexes, material recipes, per-arena lighting incl. Blackout, type scale and HUD iconography locked in ART_BIBLE.md; ASSET_PLAN.md section 4 records consumed values. Evidence in TASKS.json, DECISIONS.md.
- ART-02 (done) - Asset plan with sizes: ASSET_PLAN.md expanded to full M2 list (weapons, enemy sheets, textures, icons, FX strips, audio); each row has size, path, source, licence, consumer. ASSET_INDEX.json updated. Evidence in TASKS.json.

## Milestones

| Phase | Gate | State |
|---|---|---|
| Intake | brief | locked (INT-01, INT-02 done) |
| Concept | loop/pillars | locked (CON-01, CON-02 done) |
| Design | GDD | locked (GDD-01..GDD-04 done) |
| Art | bible/assets | open |
| Tech | spec/budget | open |
| Slice | playable | open |
| Production | content | open |
| QA | verified | open |
| Release | shipped | open |

## Rules

1. One task at a time.
2. Every task has acceptance and evidence.
3. No feature without a task.
4. Update DECISIONS.md when the plan changes.


