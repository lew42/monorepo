# Prompt audit: can Haiku turn each owner prompt into questions, tasks and statements without losing anything?

Budget: $6 total (your own turns plus every model call). Sonnet, medium effort. Parent: `vscode-mastermind`: log with the `log` tool. **Review only: nothing you or any Haiku call produces creates a task, edits a page, or acts on a prompt.** No real-time wiring.

## The owner (2026-10-21; words in the tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl`, the long one about tokens)

Asks get lost: "I'm asking for 100 things and only 2 get built." Wanted: a cheap, reliable, programmatic pass (Haiku, each call well under 100k tokens) that breaks each raw prompt into **questions, statements and tasks** (a task is anything clearly asked to happen; its details or suggestions belong to that task; architectural decisions belong in a module doc; questions belong in that module's FAQ with a short answer or a link to it), in the prompt's own order, as close to one-to-one with its sentences as possible, with precise references (mentions: `/path`, `#Class`; see `ext/Mention`). First prove it on a few prompts against a thorough benchmark (Opus, maybe Sonnet); if Haiku catches 90–100% of the real asks, it can later run on every prompt. Do not nitpick wording: the test is whether the **main tasks, questions and decisions** are all there.

## It already exists: start from it (law 6)

`Server/RefineQueue.mjs` (doc [ext/Refine/doc/refine-queue.md](/framework/ext/Refine/doc/refine-queue.md)) already runs one Haiku call per owner prompt from the VS Code transcripts, node-driven (no agent copies prompts), writes a refined card to the session's Coverage tab, logs cost, and finds repeats; `Server/AskIndex.mjs` turns refined asks into records. Brief v2 lives in `ext/Refine/RefinedCard.js`; the call is `Servex/ext/refine/RefineCall.js`. Today: 84 prompts refined at $0.11 each (max 30.8k tokens per call); 90 of this week's 104 prompts are not refined; the `--dry` estimate says ~$0.51 for all 90, which disagrees with the real $0.11 per prompt (fix the estimate).

## Do

1. **Pick 8 prompts** from session `e00f55c9-bad4-4ee2-899e-d629ea1eede6` (this tab, 2026-10-20/21): 4 long dictations, 4 short. Use the queue's own prompt finder; list them by `<uuid>:<line>`.
2. **Benchmark:** the same brief through `RefineCall` on Opus (one call per prompt). **Haiku:** brief v2 as it runs today. Compare per prompt with a script where you can, and by your own reading of only the differences: which tasks, questions or decisions does Haiku miss or invent? A coverage number per prompt.
3. **Brief v3** (in `RefinedCard.js`, beside v1/v2, nothing removed): items typed `question | task | statement` in prompt order, each citing its sentence numbers, naming its target with a mention (module path or class), a task's details nested under it, and for each: an existing task it matches (search the session's task folders and `ai/index.json` rows) or "not filed", a question's answering doc or "unanswered". Run v3 on the same 8 with Haiku; compare to the benchmark again.
4. **Report** (`report.md` here, one screen): coverage per brief, cost per prompt, what Haiku drops, and a verdict: is v3 on Haiku good enough to run on every prompt? Also the list of **tasks from these 8 prompts that were asked but never filed**, with their sentence: that list is the first real answer to "why do my asks get lost".
5. Update `refine-queue.md` (what v3 is, how to run it). Commit by exact paths; `finish-task` in your own `session.jsonl`.
