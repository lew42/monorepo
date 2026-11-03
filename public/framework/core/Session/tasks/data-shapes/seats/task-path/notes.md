# Notes, analysis seat (b) task-path

The table of origins and the counts are in [shape.md](shape.md). This page has the reasons, the code citations, and the recommendation. All counts come from replaying `session-e00f55c9/session.jsonl` with the real `Session` and `Task` classes, with `Task.resolver` set the same way node sets it (`Servex/agents/page_tools.js:725`). Without that resolver the totals come out wrong (569 entries, 253 done), which is worth knowing: **a task's state depends on whether the code that reads it can follow a `{"task": "<folder>"}` reference.** With it, the replay matches the item tool: 509 / 286 / 223 / 56%.

## 1. The short version

The session did not fail to finish tasks. It **made 509 of them** and counted the same dictation twice. Of the 223 undone, **211 (95%) were written by a program** (`PromptsToSession` 111, `prompt-tasks` 100, `PromptRecords` 4), and only 12 came from a person or an agent. Of the 286 done, **209 were closed in bulk by close-out passes, 63 are done Prompts nobody touched, and 14 were really worked.** The owner's goal ("a few core tasks per session, created as I dictate, and finished") is not what the machine builds: it builds a wide, shallow tree and then tries to clean it up afterwards.

## 2. How a task is born, origin by origin

### The VS Code tab
- **The prompt.** `.claude/hooks/prompt-relay.mjs:249` appends a `Prompt` item to the tab's page (`page_add`), and `hooks.prompted` fires. It makes no task. The Prompt only lands in `session.jsonl` later: `Server/PromptsToSession.mjs` (one `tasks.add` of type `Prompt`, skipping ids already present) or `Server/PromptRecords.mjs`. In e00f55c9 all 167 Prompts came from `PromptsToSession`, i.e. a **backfill**, not the live path.
- **The asks.** `Servex/agents/PromptTasks.js` runs `PromptRecords`: `sentences` (code), then one Haiku call (`parts_one`) that cuts the prompt into parts of kind `ask / question / idea / rule / conversation`, then `file`, `parent_for`, `attach_to` (`Server/PromptRecords.mjs` ~180-262). Each ask becomes an idle `Task` with `from:"owner"` and `source:{session,line,prompt,part}`; each part gets an outcome `{is:"task", ref}` that points back at it. Caller name: `prompt-tasks`. The older route is `Server/AskIndex.mjs:193 make_tasks` (caller `refine-queue`), which files every refined ask the same way, de-duplicated by `source_key` (`:211`). `PromptTasks` is **OFF** for the part that would move accepted tasks to a module home (`MODULE_HOMES = false`, `PromptTasks.js:107`), but the filing itself ran for this session: 100 of the 223 undone carry the `prompt-tasks` creator.
- **A hand-made task.** The tab (or a mastermind) calls the item tool with `tasks.add`; `run_item` (`page_tools.js`) writes it, usually with its own folder. 52 of the 509 have no `source` tag; 11 of those came from caller `agent` (9 done), 39 are from `prompt-tasks` without the tag (37 done).

### The voice agent
- **Fast seat.** `Sessions.assign_prompt` (`Servex/agents/Sessions.js:482`) writes `PromptLines.add_prompt` (`PromptLines.js:31`): `{tasks:{add:{type:"Prompt", id:"p-<ms>", raw, paragraphs}}}`, and keeps the Prompt open for more raw words (`push_raw`, `append_paragraph`) until `prompt_close_ms` passes. `PromptLines.js:8-11` states why it exists: voice sessions are never touched by `PromptsToSession` or `PromptRecords`, so this is the **only** writer of voice Prompts. A Prompt that never gets a task or a part, in a voice session, has no path to "complete" at all (`Prompt.completion`, `Prompt.js:123`, falls back to the share of its own `tasks`, which is empty, so it stays at 0).
- **Smart seat.** Writes `add_task`, `add_question`, `add_reply` (`PromptLines.js:48-58`) through the item tool, nested under the Prompt. A Question has a named finisher (the owner reading the answer, `{complete:{}}`). A nested Task has none.
- Not measured here: e00f55c9 is a VS Code tab, so none of its 509 came from this path. The voice path was read in code only.

### The dictation sheet
It creates no task. `ux/Dictate/chat.js:215` draws `{tasks:{add}}` and `{"<prompt>":{tasks:{add}}}` lines that someone else wrote, through `ext/Chat/v2/ChatV2Model.js:28` (`apply`). What it sends goes to the same two seats above. It is a viewer, so it has no "who finishes it".

### Servex spawns
`Agents.js:226` calls `open_task` (`:1048`) when a spawn has a `task`; it writes the child's `task.jsonl` and calls `SessionRecord.link_parent` (`:1073`), and `Server/ChildLinks.mjs` repairs missing links later (`--apply`). The parent then shows a `ChildSession` entry. These are the only tasks with a real finisher: the spawned agent, chased by `Servex/TaskLoop.js` while the task is `running` (`TaskLoop.js:108-114`). 9 of 509; 4 undone, and 3 of those 4 have no touch from any agent.

### Close-out passes (not an origin, but the real finishers)
`Server/CloseoutWalk.mjs` (Haiku judges one prompt's asks: complete, stop, or defer with a home and a `decide_by`), plus the agents `task-mastermind-session-closeout`, `…-note-tasks`, `minion-review-stops` and `mastermind-deputy`. They write `complete`, `stop`, `wait{decide_by, deferred}` and `set{fair:"standing"}` lines onto existing tasks. These are where 209 of the 286 "done" came from.

## 3. Why they stayed open (the causes, each with a count)

The 223: 111 Prompts, 101 asks, 6 hand-made, 4 child sessions, 1 rule task. States: idle 129, waiting 60, running 33, missing 1.

**A. The same dictation is counted twice (111 of 223).** A Prompt is a `Task` (`Prompt extends Task`, `Prompt.js`), so `Task.progress_of` (`Task.js:176`) counts it, and every ask that was split from it is counted again as a task in the same session. Of the 111 undone Prompts, 74 are held up (at least in part) by a part that points at a task, and that task is itself one of the counted entries (47 open parts plus unfinished task, 27 unfinished task only); the other 37 are held up by open parts only (33), open parts plus an uncited sentence (1), or have no parts recorded (3). This one fact moves the headline: counting only the asks, the session is 263 asks + 18 rules + 52 hand-made + 9 children = 342 "things the owner or an agent might do", of which about 112 are undone (the non-Prompt undone count is 112). That is 67% done, not 56%.

**B. Questions, ideas and rules cannot close (up to 25 Prompts).** A Prompt completes only when every part is settled: outcome `done`, `documented`, `answered` or `no-action`, or a task that is complete (`Prompt.settled`, `Prompt.js:49-51`), and no sentence is left uncited. Among the undone Prompts, parts by kind: ask 484, question 255, idea 217, rule 204, conversation 185. The open ones: **question 227, idea 187, rule 154, ask 85**. In the record, no question part ends `answered` unless the splitter or a pass wrote it (23 of 255), and I found no code that sets `answered` or `documented` when a reply or a doc appears. With question/idea/rule parts ignored, 25 of the 111 Prompts would complete right now. This is a design gap, not noise: the parts are real and the outcomes are never filled in.

**C. A stopped task never counts as settled (38 refs).** `Task.settled` (`Task.js:68`) says "complete or stopped: neither blocks a parent". `Prompt.settled` (`Prompt.js:51`) says only `complete`. 38 part→task references point at a stopped task (often a duplicate or noise that a close-out pass rightly stopped), so the part can never settle. This is two rules for the same question in neighbouring files. With stopped counted as settled, 4 more Prompts complete; combined with B, 34 of 111.

**D. Part→task references that cannot be resolved (34 refs).** `Prompt.task_state` (`Prompt.js:114`) looks the ref up by its **last path segment**. 34 `{is:"task"}` outcomes point at a `…/requirements.md` file path or an unknown folder, so they return `null` and count as open. A path-aware lookup (strip the file name, resolve the folder) completes only 4 of 111, so this is a small cause, but it proves the refs are written by more than one tool in more than one shape.

**E. "Deferred" is parking, not deciding (48).** `closeout-walk` marked 48 asks `wait{on: <module>, decide_by: 2026-11-01, deferred:true}`. Nobody is woken on 2026-11-01. `Servex/Dropped.js` stops a deferred task past its date or with no home, but it only runs while Servex runs, and the date is still in the future when this is read. Another 12 are waiting on the owner. That is 60 "waiting" tasks that have a stated decision but no mechanism to make it.

**F. "Running" with nobody running it (33).** 22 have no folder at all. 11 have a folder, unchanged for 64 to 73 hours. They were set `running` by `task-mastermind-session-closeout` (20) and `minion-review-stops` (2) on a single pass about 3.1 days ago. `TaskLoop.js:114` chases only `running` tasks whose **agent** is live, and these have no live agent, so nothing wakes them and nothing declares them dead. `Dropped.js` needs 60 quiet minutes and a missing owner; that rule did not fire, probably because the "owner" is the close-out agent's id, not an agent that is gone. (Not verified in the registry: a follow-up for the architect.)

**G. Idle tasks have no chaser at all (129 idle).** `Servex/doc/task-loop.md`: "Accepted (idle), proposed (waiting), paused, stopped and complete tasks are left alone." The loop chases only `running`. A filed ask sits `idle` until someone starts it, and nobody is assigned to start it. 16 were handed to a single agent at once (`assigned_to: mastermind-dictation-2`), which is the only owner any of the 112 non-Prompt undone tasks has.

**H. No one ever touched 126 of the 223.** 111 Prompts (by design nobody touches a Prompt), 8 asks, 3 hand-made, 3 child sessions, 1 rule. Another 47 were touched only by `minion-review-stops:set` (a `fair:"standing"` mark, a statement that the owner should not expect them, not work), and 49 were started or worked.

**I. The cleanup is bulk, not work.** Of 286 done: `closeout-walk:complete` 92, `task-mastermind-session-closeout:complete` 60, `minion-review-stops` 37, `…-note-tasks` 16, `mastermind-deputy` 4 = 209; 63 never touched (the 56 done Prompts and a few more, which complete by themselves when their parts do); 14 worked. "Done" in this session mostly means "a pass judged it already built or noise". That is useful, but it is a *different* thing from "an agent finished it", and the tally mixes them.

## 4. What works, and what doesn't

**Works**
- The record is honest. Replaying `session.jsonl` with the real classes gives the owner's number exactly. Every state is computed on read (`Task.state`, `Task.js:139`; `Prompt.state`, `Prompt.js:131`), never typed.
- `source:{session,line,part}` on each ask links it back to the sentence; `AskIndex.source_key` and the dedupe make re-filing idempotent.
- `CloseoutWalk` has a good rule: a verdict of `done` needs evidence that exists (a repo path or commit), and a deferral needs a home and a time.
- `Dropped.js` and the TaskLoop chase are right for spawned work (ChildSession), which is the one shape that has a finisher.

**Doesn't work**
- A Prompt as a counted task, and an ask as a counted task, for the same words (A).
- Parts of kind question/idea/rule with no code that settles them (B).
- Two different "settled" rules, `Task.settled` and `Prompt.settled` (C).
- Idle tasks and deferred tasks have no wake-up, and "running" tasks with no agent look alive (E, F, G).
- Splitting into 4 to 7 parts per prompt, then filing every ask part as a task, makes 263 asks from 167 prompts, many of them fragments of one idea (the `closeout-walk` prompt itself says so: "most are fragments of one idea and some are not asks at all").

## 5. Should node re-prompt every undone task?

**No.** The owner is right that for 200 it is insane, and the data shows why it would not help: 111 of the 223 are Prompts, which have no agent to prompt; 60 are waiting by decision; 126 have never had an owner. A re-prompt would wake an agent per task, and the agent's only honest answer is "this is a fragment" or "this is a message". The cost is tokens, the result is more bulk closes.

What to do instead, in order of value for the owner's goal:

1. **Stop counting Prompts as tasks.** The proposal docs already point there: `ai/system-proposal.md:53` makes `Prompt` a "light Item", not a Task, and `design-decisions-2026-10-27.md:8` puts sentences, cards and tasks in their own lists. Do it, and the 111 vanish from the tally with no loss: a Prompt is a message that *owns* some asks. Its "progress" can still be shown on the Prompt, computed, but it never counts in the session total.
2. **Let question, idea and rule parts settle without a task.** A question part is settled when a reply exists; an idea is settled when it is written down (`documented`); a rule when written down. Filing a task per rule ("Write down X") was already tried: 18 of them, 17 done, because the close-out pass wrote them down. The parts model already has the outcome names; only the setters are missing. With B fixed, 25 more Prompts complete at once.
3. **One settled rule.** `Prompt.settled` should defer to `Task.settled` (stopped counts as settled, with its reason). Fixes 38 refs.
4. **Few core tasks per session, each with one named finisher.** The unit the owner wants is *a task that someone will do*. File an ask as a task only when it passes one test: **a named agent or the owner is assigned at the moment it is made** (`assigned_to`, or a spawn). Everything else stays a part of its Prompt, with an outcome, and is not a task. Today 96 of the 112 non-Prompt undone have no assignee. The count of tasks per session drops from 509 to roughly the number of asks that were actually worked: in e00f55c9, the touched-by-an-agent set is 49 + 14 = 63.
5. **Deferred and "waiting" get a clock the code runs.** A deferred task past `decide_by` is closed or re-asked by `Dropped.js` (it does this already); the gap is that the 48 dates are in the future and nothing records "decided at date X" as an event to review. A one-page *closeout report* (below) is the review.
6. **"Running" requires a live agent.** A start by a close-out pass with no spawn must not write `running`. 33 of the 223 are this. Cheapest rule: `Task.start()` from a caller that is not the task's own agent becomes `assigned`, not `running`.
7. **Close-out reports, it does not mass-complete.** `CloseoutWalk` today writes a verdict line per ask (`complete`, `stop`, `wait`). Keep the evidence rule, but make the *session's* output one page: "N asks, M already built (evidence), K worth doing (named), the rest parts of a Prompt". Then the owner sees 5 to 15 lines and decides, instead of 223 rows.

## 6. The owner's design directions, checked against these findings

| Direction (doc) | Verdict | Why |
|---|---|---|
| `Prompt` is a light Item, not a Task (`system-proposal.md:53`) | **Holds, and is the single biggest fix.** | Cause A alone is 111 of 223. The proposal's own caveat is correct: it breaks `Prompt extends Task`, `PromptRecords` and `PromptTrace`, so old sessions need a legacy path. The count change is the benefit. |
| Each RefinedPrompt resolves to a `Question` (complete when answered) or a `Task` (complete when done) (`system-proposal.md:174`) | **Holds, and explains B.** | It gives question/idea/rule parts their own closers instead of making them task-shaped. Today they are neither. |
| Sentences, cards and tasks live in their own lists; the chat references them (`design-decisions-2026-10-27.md:8`) | **Holds.** | A Prompt and its asks counted together is exactly what "own lists" prevents: the ask lives in `tasks`, the Prompt in `prompts`. |
| Completion stays computed on read; Servex writes the closing line (`system-proposal.md:174`) | **Holds, with a warning.** | The record already works this way. The problem is who writes the closing line: 209 of 286 are from bulk passes. "Servex writes the closing line" should mean *an agent that did the work*, or a report the owner reads. |
| `Prompt.completion` = settled parts over parts + uncited sentences (`core/Task/doc/prompt.md:25`) | **Breaks in three places.** | B (open question/idea/rule), C (stopped refs), D (unresolvable refs). Each is a one-function change in `Prompt.js` or the setters, with counts above. |
| "A few core tasks per session" (requirements item 9) | **Is not what the machine does.** | Nothing in the code limits the number of tasks, and `PromptRecords` filing 4 to 7 parts per prompt guarantees the opposite. The limit has to be a rule at filing time (recommendation 4), not a cleanup afterwards. |
| TaskLoop keeps open work moving (`Servex/doc/architecture.md:11`) | **True only for `running` tasks with a live agent.** | 129 idle, 60 waiting and 33 stale-running are not chased. The doc says so itself (`task-loop.md`, "Chase"). |

## 7. Unverified, and next questions

- I did not check the registry for whether the 33 "running" tasks' owner (`task-mastermind-session-closeout`) counts as gone for `Dropped.js`.
- The voice path (fast/smart seat) was read in code, not measured. A voice session was not replayed.
- `set{fair:"standing"}` is written by `minion-review-stops` onto 47 asks. The replay does not show those as a state change. I did not trace whether `Task.FAIR_KINDS` (`Task.js:227`) counts them in a "fair" tally elsewhere.
- Counts above are for one session. A second session (a smaller, newer one) replayed with the same scripts would show whether the 66% Prompt share is general or because e00f55c9 was backfilled.
