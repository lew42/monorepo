# Session accounting: what was decided, and where each ask stands (2026-10-17)

**Decision (2026-10-16 18:53, voice-app, owner delegated):** the one-folder `shape.md` is not built as its own project. The task system (`Task extends Item`) is now the progress mechanism and `Session` is an Item that piggybacks on it, so [shape.md](/framework/ai/sessions/2026/10/16/voice-20261016/accounting/shape.md) and requirements [R1–R17](/framework/ai/sessions/2026/10/16/voice-20261016/accounting/requirements.md) are input to the task-system plan (`core/Task/doc/owner-2026-10-16-task-system.md`). The accounting task is closed. The cost half already shipped: [cost-accounting.md](cost-accounting.md).

## Each ask, one verdict

| Ask | Verdict |
|---|---|
| R1 exact tokens | **Done.** `AISessionCost.mjs`, tested on a real replayed log, cross-checked by `AISessionAudit.mjs`. |
| R2 Claude and OpenRouter dollars apart | **Done.** `provider_of`, `usd_source` (`claude`/`openrouter`/`unrecorded`) on every index row. |
| R3 children roll up, can be split | **Done for the grid** (`tree_usd`, `children` per row). Splitting back is the row itself. |
| R4 the harness counts, not the AI | **Done for past and finished sessions** (Digest and Index read the raw transcript). **Still wanted:** a derived running `cost` line after each live turn → task-system plan. |
| R5 one session database | **Mostly.** Sessions live under `sessions/YYYY/MM/DD/`. `spend-tree.json` is stale since Oct 4 and superseded by `AISessionIndex`; **dropped** (retire `Server/spend-tree.mjs` by script, never deleted). |
| R6 past work found by module | Owned by the past-work module (digest `tags()` already write `mod/…` lines). |
| R7 honesty | **Done** (the ring bug was found and fixed; numbers in cost-accounting.md). |
| R8 one page tool | Owned by the task system (the `item` tool). |
| R9 cloud voice session logs itself | **Partly:** `append_prompt_event` exists (`Servex/agents/Assistant.js`); the day-long `voice-<date>` session id is the open part → past-work/refine checkup. |
| R10 one running total, audited on detail | **Done:** `usd`/`tree_usd` on each index row, `AISessionAudit` re-counts. |
| R11, R15 the session log renamed from `task.jsonl` to `session.jsonl` | **Not done, and blocked by a fact:** 588 session folders already hold a `session.jsonl` (digest tags written by the digest pipeline), 636 hold `task.jsonl`. A blind rename would collide. → task-system plan: either give the tags their own name or merge by line type. |
| R12 folder slug = agent id | **Still wanted** → task-system plan (spawn code names the folder). |
| R13 Session extends Item with a page | **Still wanted** → task-system plan (agreed with mastermind-page). |
| R14 raw transcript is the only record; scrap Servex's `agent-<id>.jsonl` | **Cost side done.** Scrapping the Servex copy waits for the live dashboard to read the transcript tail instead. |
| R16 what the session log holds | **Tags exist.** Requirements, running cost and children: task-system plan. |
| R17 sessions readme current | **Done today** (`ai/sessions/readme.md`). |
