# Prompt refinement and the task system: one plan

The owner's direction, 2026-11-06/07, in one place. When the owner asks about prompt refinement, prompt coverage, questions, task priority or moving tasks, answer from this page: **what's built, what's planned, and what's next.** Prompt refinement and the task system are one job and have one owner (a mastermind), because tasks are what refinement produces.

## Built today

| Piece | Where |
|---|---|
| `Task`, `Session extends Task`; `completion_score()` averages tasks, recursively | `core/Task/`, `core/Session/` |
| `Process extends Task` (ordered steps) | `core/Task/Process.js` |
| `Question extends Task` | `core/Task/Question.js` (**duplicate name:** `ux/Content/Question` is a content module) |
| `Prompt extends Task` | `core/Task/Prompt.js` (**duplicate name:** `core/Session/Chat/Prompt.js` extends Message) |
| Web voice chat (Dictate) stores `sentences` + `sections` per turn | session logs; [prompt-refinement-map.md](prompt-refinement-map.md) lists all 8 refinement mechanisms |
| VS Code prompts logged by a hook | `.claude/hooks/prompt-relay.mjs` |
| The audit design | [past-work-audit-design.md](past-work-audit-design.md) |

## Planned (the shape)

### Sentences, prompt cards, tasks

```js
session.sentences  // raw, one per sentence, never edited
session.prompts    // prompt cards: groups of sentences
prompt.sentences   // refs to session.sentences (or one raw chunk)
prompt.task        // the task that covers it
```

- A **prompt card** groups sentences that belong together. It doesn't have to follow message boundaries, because the owner often jumps between topics and comes back. A card can hold a title, a summary, headings and lists: the owner's rambles, tidied into short cards.
- **Placement:** each incoming sentence goes into a card, either right away or after a few more sentences arrive. The web voice chat does this live. The owner wants to watch the raw text slide into its card and disappear, so he knows it was filed.
- Existing tasks come first. Add a missing requirement to an existing task rather than creating a near-duplicate.

### Coverage: is every sentence accounted for?

- A sentence is **covered** when its card is placed in a task. A card with no task leaves its sentences uncovered: an orphan.
- **Prompt coverage** is the share of covered sentences. Coverage says each ask was filed; completion says it got done. The goal is 100% for both, every session.
- Subtasks must sit inside their parent's scope. If a child isn't ~90% inside the parent, make them siblings, so postponing a parent never hides an urgent child.

### Questions

- The owner and AIs can both file a `Question` (a task). An unanswered question is incomplete.
- An ambiguous ask becomes a question rather than a half-understood task. That way it's surfaced, not lost.
- In a review, questions get a second look in batches: answer now, or note them as a small caveat.

### Weight and priority (not decided)

- Named scores, each around 1: `clarity` (how clear the ask was), `strength` ("make sure" vs "maybe"), `confidence`, `importance` (to the mission, or "I've asked before", or anger), `complexity`. A generic `weight` could combine them.
- Whether weight affects completion is open. AI-generated scores may be noise, so calibrate before trusting them.

### Plans, queues and moving tasks

- **Plan extends Process.** It waits for approval before it runs. Quick, easy tasks just run; long or hard ones get a plan first. When in doubt, ask.
- **Requirements vs steps.** Unordered subtasks are requirements; ordered ones are a Process's steps.
- **Created but not started.** A task can move to a **queue** (or "deferred") so the session can still close at 100%, while the task stays tracked.
- **Moving a task:**
  - `task.move_to(childSession)` hands it to a child, as the whole task, not a paraphrase.
  - It can also move to a module's `tasks/` (e.g. `core/Page/tasks/`).
  - The session keeps a reference, and a reference doesn't count toward its completion.
  - Open: a **multi-session task** (worked in two sessions) splits its cost across both. Accounting must handle a task whose log starts in one file and continues in another.
- **Cost per task:** attribute tokens and tool calls to the task they served, so a session's cost breaks down by task.

### What an agent reads

- **Levels:** an index line (title, state, completion), a **snapshot** (current state with computed values such as completion and cost, plus the description and subtask previews), and the full log (rarely).
- JSON is fine for agents. The open question is which fields the snapshot holds.

### Live and review use the same rules

- **Live:** the web voice chat refines each prompt as it arrives.
- **Review:** the same instructions run after the fact on a past session, and rerun when they improve.
- **Review rules:**
  - Lean on existing tasks; add what's missing.
  - Judge each ask against the current state.
  - Skip agent-to-agent messages.
  - Questions get tagged.
- **Closeout audit:** before a session closes, run the review on it. Log the misses (uncovered sentences, tasks closed but not done) and fix the instructions, not just the session.
- **Raw transcripts need their own reader:** a script for Claude Code / SDK transcript files, clearly named as such, separate from our session-log readers.

### Cost

- **Haiku under 100k tokens** costs a fraction of everything else, so chunk to stay under it.
- **Context:** isolated prompts lose context, and a full replay costs more. A running summary plus the last few turns is the likely middle ground. Calibration decides.
- **An Opus mastermind judges the calibration,** not the owner.
- **Audits run under 50% of weekly pace.** A small calibration (3–5 prompts) is allowed now.

## Next

1. **Calibrate on one real session:** this cloud session's transcript, now on the PC at `~/.claude/cloud-transcripts/cloud-8849dcc6.jsonl` (temporary git branch `transcripts/cloud-8849dcc6`). Take 3–5 prompts, run Haiku, Sonnet and Opus, compute coverage against the tasks in `ai/sessions/2026/11/06/cloud-voice-app-20261106/`, and have Opus judge. **Done 2026-11-07:** Sonnet 5.5 refines better than Haiku 5.5 and costs less (about $0.03 a prompt), and the record covered 0–31% of the ask sentences in three of the four prompts. Results, and three instruction fixes for the next run: [calibration/results.md](/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/calibration/results.md).
2. **Add `prompts` and coverage to Session,** additively, with the web voice chat as the first live user.
3. `task.move_to()`, the queue state, and what doesn't count toward completion.

## A note for every agent (the owner, 2026-11-07)

Long dictations pack a dozen ideas into one message, and each one gets handled worse. When passing work on, hand over **one task at a time** (or one task with requirements). Don't send a paragraph of twelve ideas.
