# Past-work audits: the design (not running yet)

The owner's design, 2026-11-06. Nothing here runs until it has been calibrated, and then only when there is usage to spare. Every earlier audit is listed in [audits.md](audits.md); read it first, and learn from what didn't work.

## The goal

Fix the **system** that lets asks get lost, not just chase each loose end. An audit is worth running only if it changes the system: the logging, the instructions, the task flow.

## Two kinds

1. **Prompt audit.** The owner's own words, **newest first**, one prompt at a time. Skip agent-to-agent messages: a task handed down is the same task, not a new one, so there's no double accounting.
2. **System audit.** Per system group, then per directory, then per file. Is it used? Is it stable? Is it documented and mapped to its neighbours? Keep it, merge it, or retire it (write the lessons down first, then move it aside; never delete). The groups:
   - Item, List and Page
   - sessions and tasks
   - Servex, AI, roles, SDK and MCP
   - the web voice chat (Dictate, Recite, Refine)

   Folders that follow one known structure (session folders, `tasks/`) are checked as a pattern, not file by file. Readmes get a per-readme pass: is each statement still true, still needed, and linked?

## One instruction set, live and after the fact

Prompt refinement is the same step whether it runs live (the web voice chat, placing each sentence as it arrives) or after the fact (this audit). When it improves, rerun it on past prompts and compare the results. Its 8 current mechanisms are listed in [prompt-refinement-map.md](prompt-refinement-map.md); keep one.

## What each prompt yields (fixed before the first real run)

Settle this list once, so a forgotten field never forces a costly rerun:

- the asks, primary and secondary, in the owner's words
- the questions the owner asked
- mentions and tags (`@Page`, paths, modules)
- priority signals: anger, "I've asked this before"
- red flags: "waiting on you", "your call", "needs your yes", each one followed up to see if it was ever answered
- the status of each ask **judged against the current state**: done, still valid, or no longer relevant (not "was it done at the time")

## Context

- **One prompt in isolation:** cheap, but it loses context and gets things wrong. That's the weakness of the old HITL "clarity" pipeline, which sent each chunk to a fresh session.
- **The whole session replayed up to that prompt:** full context, but it can cost hundreds of dollars with a big model, and may be cheap with Haiku.

Calibration decides which to use.

## Calibration before anything runs

1. Take 3–5 recent prompts.
2. Run Haiku, then Sonnet, then Opus on the same prompts with the same instructions.
3. Compare the results; the owner judges them.
4. Freeze the instructions and the output fields, then scale up with the cheapest model that matches.

## Budget gate

- Run audits only while the weekly pace is **under 50%** (`node Server/usage-now.mjs`).
- Never start a batch at the week's reset, because it would burn the new week at once.
- Go slowly: one prompt at a time, in the background.

## Sources

| Source | Where |
|---|---|
| VS Code prompts | `Prompt` lines in session logs (the `UserPromptSubmit` hook) |
| Web voice chat | `sentences` in session logs |
| Claude app sessions (voice and text) | the cloud workspace's own transcript (`~/.claude/projects/-home-claude/<id>.jsonl` *in the cloud*); it has to be brought to the PC first |
| Everything else | raw transcripts in `~/.claude/projects/C--Code-lew42-monorepo/` |

How to search them: [../indexing-past-work.md](../indexing-past-work.md).

## Related ideas from the same prompt (written down, not built)

- **Plan extends Task.** It's probably a `core/Task/Process.js` subclass. A plan waits for approval before it runs. Quick tasks just run; long or hard ones get a plan first.
- **Requirements vs steps.** Subtasks that can be done in any order are requirements; ordered ones are a Process's steps.
- **Partial completion.** A task can be 0.5 or 0.8 done, and its parents average it in. Proof can be hallucinated, so "closed with proof" is a check, not a guarantee.
- **Mentions as tags.** A mention in a prompt or on a page tags it, and the mentioned thing keeps a backlink list (e.g. `mentions.jsonl`).
- **Readme reads.** Track whether agents actually read the readmes they should. The first step of any task is reading the right readmes. A script flags readmes that grow too long, rather than enforcing a hard limit.
