# Where the tokens went, and the ten cheapest wins

Looked at 7 days of `spend.json` + `task.jsonl` across 375 tasks (2026-09-25 to today). Total logged spend: **$1,521**.

## 1. Where it went (top sinks)

| Rank | Sink | $ | Why |
|---|---|---|---|
| 1 | **Opus running tasks alone, no minions** | $322 (73 tasks) | Opus is the top-level model AND does every step itself — no delegation to Sonnet/Haiku. [2026-09-29/audio](/framework/ai/sessions/2026/09/29/audio/audio/) ($100), [process-monitor](/framework/ai/sessions/2026/09/30/2976c23c-62af-4aa8-b898-5e56e1c025f8/process-monitor/) ($37), [selection](/framework/ai/sessions/2026/09/30/selection/) ($28) are the worst. This is the single biggest pattern: Opus doing Sonnet-sized (or smaller) work end to end. |
| 2 | **Opus overall** | $1,058 of $1,521 (70%) | Opus is set as the default model for most "build a thing" tasks, even plain CRUD/UI work Sonnet handles fine. Sonnet-labeled tasks only total $317. |
| 3 | **servex-mastermind on Fable, long turns** | $116 (one 2026-09-30 run, 271 log lines) | The architect runs on Fable continuously; a single day's session racked up more than most whole tasks. Three separate `servex-mastermind` runs across the week (09-25, 09-28, 09-29) add another $58 on top. |
| 4 | **Fan-outs with many sub-agents on Opus** | [page-system](/framework/ai/sessions/2026/09/29/f5150091-9c1e-4500-90b0-7313b19a36a9/page-system/) ($48, 33 agents), [organization](/framework/ai/sessions/2026/09/28/e269b131-e2d2-4712-a88d-b243d631bd04/organization/) ($37, 17 agents), [file-system](/framework/ai/sessions/2026/09/29/file-system/file-system/) ($44, 8 agents), [audio-consolidate](/framework/ai/sessions/2026/09/30/108a1b36-ed02-4728-bf82-20d7d7053d85/audio-consolidate/) ($31, 9 agents), [figma-sept-frame](/framework/ai/sessions/2026/09/28/figma-sept-frame/figma-sept-frame/) ($46, 7 agents) | Each spawns a double-digit number of agents, several on Opus, for work that reads like Sonnet-tier (settings tabs, file data model, cards). |
| 5 | **Dictation → brief pipeline** | group `dictate`+`dictation` = $209 | [prompt-refine](/framework/ai/sessions/2026/09/29/a918d03d-6afe-4958-b425-20e9eba998ef/prompt-refine/) ($48, Opus) and [audio](/framework/ai/sessions/2026/09/29/audio/audio/) ($100, Opus) turn one spoken ask into a full build; both ran solo-Opus. |
| 6 | **[mobile-nav](/framework/ai/sessions/2026/09/29/mobile-nav/mobile-nav/) on Sonnet but 194 log lines, 0 agents** | $55 | One session did the whole thing itself in many small turns instead of splitting into a few agent calls — more read/think/write round-trips than needed for the result. |
| 7 | **[openrouter-harness](/framework/ai/sessions/2026/10/01/openrouter-harness/openrouter-harness/)** | $68 (Opus, 138 lines, 1 agent) | A single investigation task priced like a mid-size build. |
| 8 | **[dev-shell](/framework/ai/sessions/2026/09/30/950de3ca-bb94-45bc-81c1-32992048b804/dev-shell/)** | $38 (Opus, solo) | Shell/header/footer layout — a UI composition task, Opus-priced. |
| 9 | **Re-reading big files across many small spend points** | visible as 10-40 sub-$1 charges per task in several `spend.json` files (e.g. `page-system`, `organization`) | Pattern matches "re-reading the same big files": many small charges a few seconds apart, consistent with repeated full-file reads rather than cached diffs. |
| 10 | **No model floor below Opus for "mastermind"-named tasks** | all 4 `servex-mastermind` runs this week ($58 total just for those) + [ai2-lead](/framework/ai/sessions/2026/09/25/ea1cc34a-7cb3-420e-b6dd-383b3006dead/ai2-lead/) ($11, Opus) | Masterminds default to the most expensive model even for routine sweeps (skill updates, triage), not just judgment calls. |

## 2. Ten cheapest wins (ranked by tokens saved per change)

| # | Change | File/skill to change | Why it's cheap |
|---|---|---|---|
| 1 | **Default new tasks to Sonnet; require a stated reason to use Opus** | the `minion`/`mastermind` skill's model guidance, or wherever `spawn_agent` picks a default | Single biggest lever — 70% of spend is Opus; most of it (73 solo tasks, $322) shows no sign of needing Opus-level judgment. |
| 2 | **Masterminds spawn minions instead of building solo** | `mastermind`/`servex-mastermind` skill | The 73 "Opus, zero sub-agents" tasks are exactly the anti-pattern the `mastermind-relays-not-executes` memory note already named — enforce it as a skill rule with a cost consequence named. |
| 3 | **Cap `servex-mastermind`'s continuous Fable runs** (checkpoint + recycle before ~150k context, per brief's own suggestion) | `servex-mastermind` skill / its spawn loop | One day's run was $116; a context cap with recycle would turn long Fable sessions into several cheaper fresh ones. |
| 4 | **Route "mastermind" sweeps (skill updates, triage, routine checks) to Sonnet, reserve Fable/Opus for judgment calls only** | `servex-mastermind` skill | $58 across 4 runs this week on pure sweep work. |
| 5 | **Spawn fan-outs with `task: {dir, brief}` + a one-line prompt instead of pasting the brief into the prompt** | `spawn_agent` call sites (page-system, organization, file-system show 7-33 agents each) | Brief already recommends this; cuts duplicated brief text from every sub-agent's first turn across the highest-agent-count tasks. |
| 6 | **Put a context cap on every agent (not just masterminds)** — stop and recycle from a checkpoint file before ~150k tokens | Servex spawn/heartbeat logic | [page-system](/framework/ai/sessions/2026/09/29/f5150091-9c1e-4500-90b0-7313b19a36a9/page-system/) (317 log lines) and [one-dictation](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/) (229 lines) both look like one session running very long instead of relaying. |
| 7 | **Prompt caching on repeated readme-chain reads** | wherever agents call `load_module`/read readmes at session start | Every fresh mastermind/minion re-reads the same root-to-leaf readme chain; caching those (same content, high reuse) is pure savings with no behavior change. |
| 8 | **Smaller readme chains for narrow tasks** | module readmes under `public/framework/` | A minion fixing one page.js doesn't need the full root chain; let `load_module` take a narrower starting point when the brief names one directory. |
| 9 | **Batch heartbeats / sweep checks instead of one Servex call per tick** | Servex heartbeat config | Cheap, mechanical; reduces fixed per-tick overhead system-wide, compounds over a week. |
| 10 | **One review round for small changes, not the full review+smoke-test+merge sequence every time** | `merge.mjs` / `review.mjs` gate | Doesn't show clearly in this week's data (no dedicated review-round spend.json), but the brief names it and the build order already does a smoke-test *and* a fresh-eyes review for every merge; a size threshold (quick-fix path already exists) extends it further. |

## 3. A weekly pace rule Servex can enforce

**Daily token budget per role, spawns queued when a day is over pace**, building on the existing working cap of 5 and the dormant system:
- Give each role a daily $ budget = weekly target ÷ 7, split roughly by role (e.g. masterminds get a smaller slice than builders, since law 5 already says builders shouldn't be blocked).
- Track spend live from the same `spend.json` files this report reads — Servex already has real-time cost data, so the rule can check "today's spend for this role" before approving a new spawn.
- When a role is over its daily share: **don't refuse the work** (law 5) — downgrade the next spawn's model one rung (Opus→Sonnet, Sonnet→Haiku) instead of blocking, and log the downgrade so the pattern is visible.
- Carry unused daily budget forward by one day only, so a quiet day doesn't licence a blowout later — this is what "weekly used% ≤ elapsed%" actually requires day to day, not just checked at week's end.

Data and script behind this report: `agg.mjs` (scratchpad), re-runnable anytime for a fresh week.

