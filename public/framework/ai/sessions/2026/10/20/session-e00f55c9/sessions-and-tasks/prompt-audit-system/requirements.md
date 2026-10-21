# The prompt audit as a system: Haiku structures each owner prompt, a Sonnet reviewer finds each session's loose ends

Budget: $8 now (design + a one-session pilot). Opus, medium effort. Parent: `vscode-mastermind`: log with the `log` tool. The full week (or month) run waits for the weekly reset (2026-10-22 ~22:00 local); give its cost estimate instead. Token crunch: the week is at 70%.

## The owner (2026-10-21, after the pilot; words in the tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl`)

The pilot ([prompt-audit/report.md](../prompt-audit/report.md)): Haiku brief v3 found 99 of 99 of Opus's items at $0.06 a prompt; 18 of 33 asks were never filed. The owner now wants it as a reliable, reusable system, in two passes:

1. **Structure pass (Haiku, no context, each call well under 100k tokens).** One call per **owner prompt only**: never agent-to-agent messages, relays, compaction summaries, tool results or slash commands. A surefire filter: load the raw transcript, loop the messages, keep only the owner's own user turns (say how it is proved). Output in prompt order: tasks, questions, statements, and **doc-note suggestions** ("this should be written in `<file>`: one line"), since many asks are better kept as a note in the right readme than built as a task. This is the same pass that may later run in real time on every new prompt, so it must work without reading the code. Not wired to real time yet.
2. **Session review (Sonnet, one per session).** Reads the structure pass for every prompt of the session plus what the session actually did (its `session.jsonl`, task logs, commits, pages) and decides, per item: done (with the evidence), not done (a loose end, prioritized high/low), better kept as a doc note (proposed target file and line). Loose ends and notes are **kept separately for now**, never added to a finished session's tasks automatically (that would misstate its completion). A feedback loop between you (designing) and the Sonnet reviewer on the format and the judgments.

## Decisions to make (log each with the alternative)

- **New lean pipeline or reuse.** `Server/RefineQueue.mjs` (+ `RefinedCard.js` brief v3, `RefineCall.js`) exists; the older refine system (Whisper, cleaning, chat cards) tried to do too much. Reuse its prompt finder and call if they fit; otherwise build one small class (`PromptAudit`, one file) and say why. Node drives the queue; no agent copies prompts.
- **Where results live.** A separate file per session in its folder (for example `audit.jsonl`), each line referencing the prompt precisely (transcript uuid + message uuid or line + timestamp). Check how big `session.jsonl` files are before choosing (a script, not by reading).
- **The 18 tasks the pilot added** to `sessions-and-tasks/` contradict "kept separately": move them into the new audit file and close them on the task log with a `stop` line naming the move (append-only, never delete).

## Also

- **A map of every past audit and past-work system** (refine queue, AskIndex, OrphanAsks, UndoneToTasks, `asks.jsonl`, loose-ends reports, task closeouts, `past-work-index.md`, follow-up docs, earlier session audits): what each is, where its output is, whether it still runs. One doc, `ai/doc/audits.md`, linked from `ai/readme.md`; propose the one CLAUDE.md "Where to look" line (in `claude-md-line.md` here; the mastermind applies it).
- **Using tasks properly, going forward:** when an agent files a task, when a project (a plan with tasks to check off) instead, where it lives (the session's record), and a planning step before building. Write it in `core/Task/readme.md` in a few lines, and propose one CLAUDE.md line ("each owner prompt's asks are filed as tasks or notes the first time") in the same `claude-md-line.md`.
- **Pilot** both passes on one finished session of moderate size (not this tab, not the $646 one): cost, time, the reviewer's verdicts, and an estimate for the last 7 and 30 days.

## Done when

- [ ] Both passes run on one session; results in its audit file; reviewer feedback round recorded.
- [ ] Decisions logged; the 18 tasks moved; `ai/doc/audits.md` and the Task readme lines written; `claude-md-line.md` proposed.
- [ ] A doc for the system (how to run it for a day, a week, a month; what it costs), linked from `ai/readme.md`. Committed; `finish-task`.
