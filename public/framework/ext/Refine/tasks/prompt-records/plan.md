# Plan: prompts as records

Brief: [requirements.md](requirements.md). The owner's words: tab `e00f55c9`, transcript line 7283 (2026-10-23 01:50 UTC).

## What exists, and what each piece becomes

| Piece | What it does today | In the new system |
|---|---|---|
| `ai/AISession/PromptLog.js` | one `prompts.jsonl` per session; each prompt is a series of stage lines (`raw`, `clean`, `refined`, `notes`) | **the store.** Gains one stage, `parts`. Raw text is copied in, because the VS Code transcript lives outside the repo |
| `ext/Refine/Prompt.js` | one prompt seen at every refine step, with a view | **the class.** Gains `parts`, `uncovered`, `completion`, `complete` (computed) |
| `Server/PromptAudit.mjs` | pass 1 lean Haiku per prompt → `prompt-audit.jsonl`; pass 2 one Sonnet reviewer → `prompt-review.jsonl` | **the runner.** Its passes become steps of named processes; it writes `parts` lines into `prompts.jsonl`. The two old files stay as the v1 record |
| `ext/Refine` engine (`clean`, `structure`), Echo, Whisper | live refine of dictation | the **live** process's first steps (sentences, refine); unchanged |
| `task/prompt-tasks` (live, being fixed by the architect) | each tab prompt's asks filed as waiting tasks | the **live** process's "file" step; not touched here |

## Decisions

1. **A prompt's record is its `parts`.** A part is a run of sentences (one or a whole paragraph) with one meaning: `{id, cites: [sentence indexes], kind, text, outcome: {is, ref, why}}`.
   - `kind`: `ask` (something should happen), `question`, `rule` (a standing direction for agents), `idea` (thinking aloud, a maybe), `conversation` (narration, thanks, filler).
   - `outcome.is`: `done` (ref: a commit, file or task that shows it), `documented` (ref: the file where it is written down), `answered` (ref: where), `task` (ref: an open task that now carries it), `no-action` (a question about data, conversation, an idea not taken; `why` says which), `open` (nothing yet).
   - **Completion is computed:** a part is settled when its outcome is `done`, `documented`, `answered` or `no-action`, or `task` and that task is complete. A prompt is **complete** when every part is settled AND every sentence is cited by some part. An uncited sentence keeps the prompt open: that is how "three sentences nobody acted on" is caught.
   - Alternative: one file (or folder) per prompt, as its own Item. Wins when one prompt needs its own tasks, page and inbox; today a session holds up to hundreds of prompts and PromptLog already keeps them in one file. Alternative 2: prompt lines in `session.jsonl`; rejected because every session replay would load 300k characters of prompt text.
   - `Prompt` stays a plain data class, not an `Item`, because PromptLog is a stage store, not a delta log. When a prompt needs the item tool (its own verbs), it becomes `Prompt extends Item` with the stages as lines; noted in the doc.
2. **Asks left open become tasks on the session** (`tasks.add`, `source: {session, prompt, part}`), written by node, never by the model. Done or documented asks get no task.
3. **One pipeline, named processes.** Steps: `sentences` (code) → `parts` (model) → `outcomes` (model, with evidence or proposals) → `file` (node: open asks to session tasks) → `completion` (code). Sources (VS Code tab transcript, Whisper/Dictate `prompts.jsonl` raw lines, the cloud voice log) only change how raw text arrives. Processes are data (`PromptAudit.PROCESSES`): `live` (fast: parts, then file proposals; no evidence search) and `review` (after the fact: parts with the session's context, then evidence). The experiment picks which `review` uses.
4. **Experiment** on tab `e00f55c9`, two long prompts, against my own (Opus) careful reading:
   - (a) lean: the existing pass 1 items (Haiku, prompt only).
   - (b) whole-session Haiku: one Haiku agent given a condensed transcript (owner prompts, replies, one line per tool call) and told to read it in chunks.
   - (c) node loop: one Haiku session loaded with the stretch of condensed transcript after the prompt, then asked paragraph by paragraph "what was asked, what was done, where is the evidence", resuming the same session (cache reuse).
   - Measure: dollars, asks found against the reference (recall), invented asks, outcome agreement.
5. **Apply** the picked process to every unique prompt of `e00f55c9` (66 after dropping compaction duplicates), file open asks as session tasks, and show prompts with completion on the session page.
