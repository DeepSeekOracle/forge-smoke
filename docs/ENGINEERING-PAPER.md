# ENGINEERING PAPER — building Forge Smoke on LYGO Forge

**Author:** Delta (Δ9Φ963) · **Date:** 2026-10-27 · **Project:** `forge-smoke`
**Claim being tested:** Forge can take a game from a one-page brief to a finished, locally-built,
browser-playable title, using the machine's own models and tools, with evidence at every gate.

---

## 1. Scope and thesis

Forge is a local game studio: a task graph, artifacts, a dispatcher of workers (free API models and
local tools), an asset generator, a playtest harness and a release packager. This paper specifies how
**Forge Smoke** is produced through that pipeline, what each stage costs on this hardware, and where
the pipeline is not yet trustworthy.

The thesis: *the bottleneck is no longer generation — it is verification.* Forge already produces
assets and code; the engineering work is the contract that proves they are right.

---

## 2. System map

```
Forge UI/API        127.0.0.1:8796        projects, tasks, dispatcher, schematic, ship stamps
Engine              127.0.0.1:11441       standalone llama-server, alias `lygo-local`
                                          MiMo 9B @ 48K (quality) or Qwen3-4B @ 64K (speed)
Bridge              127.0.0.1:8081        keyless door; Forge, Portal, DSH all speak this
Playtest            tools/playtest_web.mjs (Playwright)   screenshots, fps, console errors
Image worker        forge-image-worker    Qwen-Image 2.1, 1536×864, ~323 s per render, offload-to-cpu
3D worker           forge-blender-worker  headless Blender → GLB
Audio worker        forge-audio-worker    Piper (voice), generated SFX/music
Release             pipeline/release.py   ZIP + manifest (unsigned by design)
```

**Hardware envelope:** RTX 4060 Ti 8 GB, i5-13600KF, 31.8 GB RAM. One heavy engine at a time — image
generation and the LLM cannot share the card, so `render_swap` parks the brain before a render and
wakes it after. That constraint shapes the whole schedule below.

---

## 3. Artifact contract

| Artifact | Owns | Written by | Gate |
|---|---|---|---|
| `GAME.md` | pitch, pillars, non-goals, platform | Producer | brief survives a one-page review |
| `GDD.md` | mechanics, numbers, progression | Game Director | every mechanic has owner + acceptance |
| `TECH_SPEC.md` | architecture, budgets, entity caps | Gameplay Engineer | 60 fps budget stated per system |
| `ASSET_PLAN.md` | every asset: source, licence, size, owner | Art Director | no row without a licence |
| `TASKS.json` | the only queue | Producer | dependencies enforced by the API |
| `QA.md` | tests, screenshots, measurements | QA Lead | a row per shipped feature |
| `DECISIONS.md` | why, with the alternative rejected | whoever decides | append-only |
| `docs/DESIGN-FULL.md` | the complete design, end to end | Game Director | this document’s sibling |
| `docs/GAME-INDEX.txt` | engineering map (functions, sprites, themes) | `tools/map_game.py` | regenerated after code/art changes |

Rule: **the artifact is the truth, not the chat.** A task closes only by writing the artifact and
appending evidence to `TASKS.json`.

---

## 4. Stage plan (how Forge Smoke gets built)

### S0 — Intake and concept (done)

`GAME.md` written; `INTAKE-01` closed with evidence. Concept: survivors-like endless arc with a heat
twist (see `docs/DESIGN-FULL.md`). Reference direction: Azeroth Survivors’ *shape* — 3-choice level
ups, escalating waves, browser-native — not its content.

### S1 — Design and technical plan

Produce `GDD.md` (systems + numbers from the design doc), `TECH_SPEC.md` (entity caps, pools, spatial
hash, fixed timestep), `DECISIONS.md` (Three.js inside the Genex studio harness; no second framework; generated art at fixed
sizes). Acceptance: every mechanic has an owner, a test and a budget.

### S2 — Vertical slice

One arena, hammer auto-attack, heat/vent, two enemy types, death and restart. Acceptance: 60 s
playable at 60 fps with zero console errors, proven by a Playwright screenshot at a fixed seed.

### S3 — Asset production

| Asset class | Method | Contract |
|---|---|---|
| Floor tiles 64×64 | Qwen-Image → cutout → downscale → register | seamless on all four edges, no baked shadows, 64 px grid |
| Enemy sprites | Qwen-Image silhouette pass → 2-frame idle + 2-frame move | reads at 32 px, 4 colours max, transparent |
| UI plates | code-drawn (CSS/Canvas) | no generated text ever |
| VFX | code particles | ≤ 400 particles on screen, pooled |
| Music | generated loop, 90 s | 92 BPM, layers additive |
| VO barks | Piper | 6 lines, −14 LUFS master |

Every generated asset goes into `ASSET_PLAN.md` with: prompt, model, seed, size, output hash,
licence note (**generated locally = no third-party grant needed; CC0 sources recorded**), and the
task that consumes it.

**Registration contract** (the failure mode we already paid for): a sprite is only accepted if its
pivot and bounding box are recorded and the game’s draw call uses them; a 128×64 image stretched into
a 128×128 box is a defect, not a style.

### S4 — Systems and content

Wave director, 8 beats, Backdraft event, 8 upgrades × 5 ranks, 2 evolutions, 8 enemies, 1 boss,
overtime scaling. Each item is one task with an acceptance test in `QA.md`.

### S5 — QA

- **Seeded screenshots** at three seeds per milestone; `read_image` before claiming a look.
- **Control test**: a scripted input sequence proves A turns left, Space vents, 1/2/3 pick cards.
- **Performance**: measured frame time under the worst beat (Collapse) at 1280×720; pass = p95
  ≤ 18 ms.
- **Determinism**: same seed + same inputs = same score, twice.
- **Save**: corrupt `localStorage` must boot to a clean title, not crash.

### S6 — Release (deferred)

`release.py` builds a ZIP + manifest. **Unsigned** by design; publishing to chatagent.ca /
excavationpro.ca is a human gate. Ship stamps record what was signed, not that it is good.

---

## 5. Who does the work — the fallback ladder

Forge’s dispatcher exposes planning/reasoning workers and tool workers. The build uses this order:

1. **Free API worker** for heavy reasoning/planning (`opencode-* Free`, `NVIDIA GLM Free`) via
   `POST /api/build` or a dispatcher job.
2. **Local engine** (MiMo 9B, 48K) when no free worker fits or a free worker fails twice. Local is
   the default for small edits, tool calls and anything private.
3. **Tool workers** by task type: `blender-local` (3D), `playtest-web` (QA), `audio-piper` (VO/SFX),
   `foundry-local` (asset manifests).
4. **Do it yourself** if the worker is not ready — and say so in the report.

Rule: never block on a paid API. Never wait silently — if the ladder is exhausted, the task reports
what it could not do.

---

## 6. Compute budget and scheduling

| Job | VRAM | Wall clock (measured) |
|---|---|---|
| LLM (MiMo 9B, 48K) | ~6.8 GB | 43 tok/s generation, 4.2k tok/s prefill |
| LLM (Qwen3-4B, 64K) | ~6.7 GB | 65–87 tok/s generation |
| Qwen-Image 2.1 render 1536×864 | ~8.9 GB RAM + card | **323 s**, offload-to-cpu required |
| Blender headless GLB | < 1 GB | seconds |
| Playwright playtest | ~0.3 GB | 3–8 s per run |

Because the image engine and the LLM cannot co-reside on 8 GB, the schedule batches: **design and
code with the LLM → park it → render a batch of art → wake it → integrate.** A render is 5 minutes;
a batch of ten is not ten times that if prompts are queued, but it is still an hour. Plan art in
batches, never one asset at a time mid-conversation.

---

## 7. Evidence and verification

| Claim | How it is proven | Status |
|---|---|---|
| Engine serves a real model to DSH | `dsh --profile headless --patch …` → `MIMO_SMART_OK`, tool loop in 8 s | **verified** |
| Forge dispatcher has free workers | `GET /api/dispatcher/agents` lists `opencode-* Free`, `NVIDIA GLM Free` | **verified** |
| Harness generates a real task graph | `POST /api/projects/forge-smoke/harness` → 27 tasks, `INTAKE-01` closed | **verified** |
| Preview serves the project | `http://127.0.0.1:8796/preview/forge-smoke/` | **verified** |
| Image worker produces usable tiles | pending — first batch is S3 | **not verified** |
| Playtest harness measures fps | pending — S5 | **not verified** |

The last two are the honest gaps: this paper specifies them, it does not claim them.

---

## 8. Risks

| Risk | Why it bites | Mitigation |
|---|---|---|
| Generated art registration | the railroad-tile class of defect: right image, wrong box | registration contract + seeded screenshot before merge |
| Local model context limits | 48K window, 14.6K base prompt | one section per task; never one mega-prompt |
| Free workers drift or 429 | rate limits mid-build | fallback ladder, bounded retries, report the gap |
| VRAM contention | renders kill the LLM | `render_swap`, batched art, one heavy job at a time |
| Asset licensing | generated ≠ unencumbered if derived from licensed refs | record model + prompt + provenance; never trace third-party art |
| Silent degradation | “it works” without a look | QA gate: screenshot inspected, fps measured, controls tested |

---

## 9. What “done” means here

A build is done when: the task graph is closed with evidence, `GAME-INDEX.txt` is regenerated, the
playtest passes its seeded screenshots and frame budget, every asset has a provenance row, and a
release ZIP exists with a manifest hash. Quality is a human look at the preview; the stamp proves
what was signed, not that it is good.

---

## Appendix A — numbers this paper relies on

```
engine prefill            4,250 tok/s (measured, 9,017-token prompt in 2.1 s)
engine generation         43 tok/s (MiMo 9B) · 65–87 tok/s (Qwen3-4B)
DSH base prompt           ~14,600 tokens (after the skill-catalog trim from 32,686)
image render              1536×864 in 323 s, Qwen-Image 2.1, 20 steps, offload-to-cpu
playtest                  Playwright 1.62.1; wait networkidle + 2.5 s before shooting
GPU                       8,188 MiB total; ~1.1 GB free with the LLM resident
```
