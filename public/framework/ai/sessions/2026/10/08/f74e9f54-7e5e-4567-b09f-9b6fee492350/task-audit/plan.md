# Plan of action: what to do about the loose ends

**Newest:** [work-items.md](work-items.md) (ranked, owned vs unowned, with one brief per unowned cluster), [verified.md](verified.md) (73 loose ends re-checked with receipts), [diagnosis.md](diagnosis.md) (why the first pass was unreliable).

The audit found 354 loose ends (full list: `loose-ends.jsonl`, browse at `/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/`). **Caveat: the "half-done" labels are only about 58% right**, so every item below is a lead to check first, not a fact (see `spend.md`).

Order: quick and cheap first, grouped by system. Nothing here is started; no coder has been spawned (budget: this task is already over its $6 plan, see `spend.md`, and `mastermind-ai-system-docs` and `minion-session-class` own the sessions and AI docs files).

## 1. Sessions (quick win, but not mine to edit)
- Send `minion-session-class` the gaps in `doc/session-shapes.md`: no name, tags, effort, parent link or closed state in old sessions; cost must be summed by script. **Doc only, no coder.**
- Use `sessions-core.json` (script output: 2-3 core `/path` links per session) as the first tag data once `record-spec.md` exists. Re-run with `node core-links.mjs <date> <out.json>`.
- Open: `2026-10-08/session-class`, `2026-10-02/session-costs`, `2026-10-02/panel2-sessions`. Verify against the new Sessions page before anyone rebuilds them.

## 2. Streaming / JSONL (cheap docs, then one small coder task)
- Docs: link the 39 JSONL docs that have no backlink to a single overview, `core/Page/doc/jsonl.md` (list in `doc/jsonl-map.md`). **Haiku can do this** (additive links only).
- Code, small: the Sessions page still polls every 20 s instead of tailing a stream. **Sonnet coder, worktree, one file.** Wait until `minion-session-class` lands, to avoid overlap.
- Queued tool: a log tool that appends `{tag}`, `{note}`, `{alert}`, `{weight}` lines to a session (`doc/method.md`). **Sonnet coder**, after the line shapes in `record-spec.md` are fixed.

## 3. Transcription and prompt refinement (largest pile, 32 items)
- Quick: write the one conglomerate page "all the pieces" (Dictate, Whisper, Chat, Refine; `doc/directory-audits.md` already lists the scripts) and cross-link it from the Servex docs. **Haiku proposes, mastermind commits.**
- Medium: `ext/Refine` stages 3 and 5 are half-done (interactive request cards in chat, handoff of a refined prompt to a mastermind); refined prompts as Inbox cards and request filing into a page's `page.jsonl` never started. **Sonnet coder per stage, each in its own worktree.**
- Cost problem seen in the 2026-10-08 raw prompts: clean-up and outline steps ran by hand over and over. Automating live segment cleaning is the biggest saving (`topics/2026-10-08-full-day.md`).

## 4. Core page system (29 items, mostly old and stale)
- Quick: decide whether `page.js` or `page.jsonl` is the norm and say so once in `core/Page/readme.md` (`doc/directory-audits.md` has the facts).
- Quick: a Haiku pass on the stale ones (`models-page`, `minion-pageai`, mention paths like `@Servex/Heartbeat`) to mark each built / dead / still wanted. **Judgement only; do not rebuild.**
- Create the missing `/framework/ai/models` page (no such page exists): small, **one Sonnet coder**, rows for `claude-sonnet-5-5` and `claude-haiku-5-5`. Check `mastermind-ai-system-docs` is not already doing it.

## 5. AI system / Servex (134 items, the long tail)
- Do first: shorten the 24 readmes over 100 lines, starting with `core/new/1` (590), `Servex/readme.md` (388) and `ai2` (387) (`doc/addendum3.md`). **Haiku proposes a short index; a person approves moving the detail into `doc/`.** Never delete.
- Ask the owner nothing; decide: of the 83 never-started items, a Haiku pass should mark each "still wanted / superseded / dead" with options A/B/C/D. Real code candidates seen: `merge-commits` (a landing must be committed), `node-reap-run` (free RAM from idle dev servers), `perf-audit`. Each is a **Sonnet coder** job, one at a time.
- Verified: Servex spawns do read CLAUDE.md and the readme chain (`doc/addendum3.md`).

## Tuning rule
Where one system has many open items (transcription, AI), do **not** work them one by one: do the docs index first, then pick the three most valuable items, and drop the rest to "superseded" with a reason.

## Spawn list
`spawns.jsonl` is empty on purpose: no coder was started, because of the budget and file-ownership checks above. First candidates when budget allows: the `/framework/ai/models` page, then the Sessions-page stream tail.
