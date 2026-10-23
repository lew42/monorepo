# Prompt records: every owner prompt broken down, tracked and completed

The owner's long prompts hide sentences nobody acted on. A **prompt record** splits a prompt into parts, says what came of each part, and computes whether the whole prompt is complete. **A prompt is complete when everything it asks is done or documented** (the owner, 2026-10-22), and when no sentence was skipped.

The owner's words: tab `e00f55c9`, transcript line 7283 (2026-10-23). Task: [tasks/prompt-records](../tasks/prompt-records/requirements.md).

## The record

A prompt's record lives in its session's own `prompts.jsonl` ([PromptLog](/framework/ai/AISession/PromptLog.js)), next to the stages that file already had (`raw`, `clean`, `refined`, `notes`). Two stages are new:

| Stage | What it holds |
|---|---|
| `parts` | `{process, step, subject, parts: [{id, cites, kind, text, outcome: {is, ref, why}, parts: [details]}]}`. A later line replaces an earlier one. |
| `handled` | `{to, note}`: whoever routed the prompt's proposals marked it handled. |

- **A part** is a run of sentences with one meaning: one sentence, or a whole paragraph about one thing. `cites` are sentence numbers.
- **`kind`:** `ask` (something should happen), `rule` (a standing direction for agents), `question`, `idea` (thinking aloud, a maybe), `conversation` (narration, filler). A long prompt usually has 1 to 3 main asks; their specific suggestions are nested under them as `parts`.
- **`outcome.is`:** `done` (ref: a file, commit or task that shows it), `documented` (ref: the doc), `answered` (ref: the reply's transcript line), `task` (ref: the open task that carries it), `no-action` (conversation, or an idea not taken), `open` (nothing yet).

**Completion is computed, never stored** ([Prompt.js](../Prompt.js): `uncovered`, `progress()`, `completion()`, `complete()`):

- A part is **settled** when its outcome is `done`, `documented`, `answered` or `no-action`, or `task` and that task is complete.
- A sentence that **no part cites** counts as one more unsettled part. That is how a skipped sentence keeps its prompt open.
- `progress()` = settled parts out of (parts + uncited sentences); `complete()` is true when that is all of them.

**Where it is stored, and the alternatives.** One file per session, because a session can hold hundreds of prompts and PromptLog already kept them that way. One file (or folder) per prompt, as its own Item, wins when a prompt needs its own tasks, page and verbs; then `Prompt` becomes `Prompt extends Item` with these stages as its lines. Prompt lines inside `session.jsonl` were rejected: every session replay would load 300k characters of prompt text. The raw text is copied in, because the VS Code transcript lives outside the repo.

`Prompt` stays a plain data class, DOM-free since 2026-10-23 (its view moved to [PromptView.js](../PromptView.js)), so node and the browser compute completion with the same code.

## One pipeline, two processes

[`Server/PromptRecords.mjs`](/Server/PromptRecords.mjs) (`class PromptRecords`) runs the same steps for every source. Only how the raw text arrives differs: a VS Code tab transcript, a Whisper/Dictate session's raw lines, or the cloud voice log.

| Step | Who | What it writes |
|---|---|---|
| sentences | code | `raw` and numbered `clean` lines, once per prompt |
| parts | Haiku, one call per prompt, no context (`PARTS_BRIEF`) | a `parts` line, every outcome `open` |
| outcomes | Haiku, one call per window of the session, with the condensed transcript and Read/Grep (`OUTCOMES_BRIEF`) | a `parts` line with outcomes and evidence |
| file | node, through the item tool's `run_item` | a task on the session for each part still open, `source: {session, line, prompt, part}` (the transcript line, so the raw words are one click away); the part's outcome becomes `task`, and it settles when that task completes |
| completion | code | nothing: `Prompt.completion()` reads the lines |

The processes are data (`PromptRecords.PROCESSES`):

- **`live`** (every new owner prompt in a VS Code tab, through [PromptTasks](/Servex/agents/PromptTasks.js)): sentences, parts, then each top-level **ask** becomes a waiting proposal on the session, with its details in the description, at most 5 per prompt (the rest stay open on the record). Rules and questions stay on the record and are never filed as tasks.
- **`review`** (after the fact): sentences, parts, outcomes, then each top-level ask or rule still open becomes an idle task (a rule as "Write down: …").

```
node Server/PromptRecords.mjs <session 8hex> --dry                 # unique prompts (compaction replays dropped), what is recorded
node Server/PromptRecords.mjs <session> --process review           # parts + outcomes; add --file to file open parts as session tasks
node Server/PromptRecords.mjs <session> --summary                  # completion per prompt
node Server/PromptRecords.mjs <session> --handled <prompt id> --to <task path or agent>   # a router closes a prompt's waiting proposals
```

The session page shows the records first on its **Coverage** tab: how many prompts are complete, then each prompt with every part, its outcome and its evidence link ([AISessionCoverage.js](/framework/ai/AISession/AISessionCoverage.js)).

## The experiment that picked the process (2026-10-23)

Two long prompts of tab `e00f55c9` (lines 4136 and 5965, 15k and 18k characters), read three ways and judged by Sonnet against a careful Opus reading (22 and 24 asks). Records: [experiment/results.jsonl](../tasks/prompt-records/experiment/results.jsonl).

| Way | Asks found (recall) | Invented | Real cost per prompt |
|---|---|---|---|
| (a) lean: Haiku, the prompt alone | 0.95 and 1.0 | 0 | **$0.16 and $0.29** |
| (b) Haiku given the whole condensed session, reading it in chunks | 0.91; the second run hit 40 turns with no answer | 0 | $2.39 and $2.78 |
| (c) node loop: Haiku loaded with what followed, asked 8 sentences at a time | 1.0 and 1.0 | 0 | $1.96 and $2.16 |

**The pick:** finding what a prompt asks needs no context, so the parts step is blind and cheap (a). Context matters only for outcomes. The loop (c) saw only the transcript and called 3 of 5 spot-checked done items open (the evidence was in repo files); the whole-session reader (b) called almost everything done. So outcomes run once per window of the session, with the transcript in the message and Read/Grep to confirm a doc note: about 10 times cheaper than (c), and able to see the repo.

Measured on the way: the SDK's `total_cost_usd` on a **resumed** session is cumulative, so adding it per turn overcounted 12 times; a resumed session's real cost is read from its own transcript ([experiment/cost.mjs](../tasks/prompt-records/experiment/cost.mjs)). Haiku 5.5 is priced like Opus 5.5 per token in `Server/Transcripts.mjs` ($4 in, $20 out), above Sonnet 5.5 ($2.5, $12.5); ⬜ the parts step on Sonnet is the next experiment.

## From the older systems, kept and dropped

- **Kept from ext/Refine:** one prompt as one object (`Prompt`), numbered sentences with cites, the session's `prompts.jsonl` as the store, rules not model calls for anything computable. **Dropped for this use:** the clean/structure/outline ladder and clarity scores; they serve live dictation, not completion.
- **Kept from the prompt audit** ([ai/doc/prompt-audit.md](/framework/ai/doc/prompt-audit.md)): the owner-prompt filter (`PromptAudit.prompts`), blind per-prompt structuring, the `update` kind (now `rule`, with its `file`). **Replaced:** pass 2's single reviewer over all 800 items (most verdicts empty) by outcomes per window; flat items by main asks with details nested. Its two files stay as the v1 record.

## Not built yet

- ⬜ The browser counts a `task` outcome as open; it does not yet resolve the task's state (node does, in `--summary`).
- ⬜ Whisper/Dictate and the cloud voice agent as sources of the `live` process (today: VS Code tabs).
- ⬜ A session's completion counting its prompts, not only its tasks.
