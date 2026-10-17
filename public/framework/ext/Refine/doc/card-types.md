# Card types and the task lifecycle — the owner's vocabulary, dictated 2026-10-16

Recorded so the intent survives chat (CLAUDE.md, law 5). The owner dictated this in the Claude mobile app on 2026-10-16 while flipping through their notes; that chat has no session log in the repo, so this file is the record. Nothing here is built as written: check it against `Prompt.js`, `doc/prompt.md`, `doc/architecture.md` and Servex's task loop before building. It extends the card list in `doc/vision-2026-10-08.md` (request / task / question / suggestion).

## The idea in one paragraph

Any prompt — anything you might say to an LLM — can be refined into structured cards. Each card is one content block with a type. A prompt splits on the period into sentences; each sentence becomes one or more cards. Every card is an `Item`, and items live in a `Page`.

## Card types (the vocabulary)

**Text units**
- **Sentence** — the generic unit. Split the prompt on "." and each piece is a sentence.
- **Statement** — a sentence that states something.
- **Question** — icon ¿, the Spanish inverted question mark. It pairs with the ? at the end of the sentence, so the card looks right.

**Asks** (what the owner wants)
- **Request** — asking for something.
- **Objective** — the goal behind the prompt.
- **Outcome** — the result wanted. Close to a requirement.
- **Requirement** — a constraint on the work. Carries a certainty level (next section).
- **Recommendation** — "should" strength.
- **Suggestion** — "could" strength: maybe do this, but only if it makes a lot of sense.
- **Directive** — a command to actually do something.
- **Direction** — a guiding idea, a general heading. Not a command.

**Work** (things with a lifecycle)
- **Task** — something with a completion: a checkbox. Done, move on. Not done, it still has to be resolved.
- **Subtask** — a task inside a task.
- **Plan** — the output of the planning phase.
- **Proposal** — the refined plan with an order of operations. A parent task that waits for approval.
- **Decision** — a fork in the road: it could go one way or the other, and the AI picks one.
- **Approval** — the mastermind signs off on a proposal (not necessarily the owner).
- **Phase** — a stage of the whole process (planning, proposal, ...). Phases are tasks too.
- **Status update** — a task's current state, reported.
- **Queue** — where approved work waits when resources are limited.

**Structure** (classes, not card types)
- **Item** — the base class. Any content (a sentence, a question, a task) is an Item.
- **Page** — extends Item. Holds child items; get/set.
- **Card** — the structured block a prompt is refined into.

## Certainty: every statement has a strength

Strongest to weakest:
1. **must / cannot** — a hard requirement. Use on occasion, not everywhere.
2. **should / should not** — a recommendation. "Probably shouldn't" means the same as "should not".
3. **could / maybe** — a suggestion. Here is a thought; do it only if it makes a lot of sense.

Requirements and outcomes sit on this scale. So does any statement.

## The lifecycle: prompt → plan → proposal → approval → task → complete

1. **Prompt** — words arrive live from Whisper transcription.
2. **Plan** (the planning phase) — identify the things involved; identify the shape (the class architecture, which is the most core thing to propose); refine it: expand, consider alternatives, lean into the best one.
3. **Proposal** — the plan is complete; now set the order of operations.
4. **Approval** — the mastermind approves.
5. **Task** — an approved proposal starts automatically, or enters a queue if resources are limited.
6. **Status** — each task's state is tracked and reported.
7. **Complete** — the owner's word is "complete", not "finished".

Rules:
- **Never drop a task** at any transition. A plan must not fizzle out before it becomes a proposal.
- **Node drives every step.** The Node process (Claude SDK) knows the state and fires the next function itself; it never waits for a model to remember.
- **One task system for everyone.** The mastermind's own work with minions (identify, shape, refine, approve) uses the same Task class as the work it plans.

## The Task class (notes toward the design)

- The core idea is just: is it complete?
- Fields: a title or name; a state; `startTime` (set when it starts); `completeTime`; `duration` (derived from the two); subtasks.
- Methods: `start`, `pause`, `complete` — and more as needed.
- A task is almost a page: it has a title and can hold its own tasks.

## Proposal vs Task (open design)

A proposal looks like a task: a title, subtasks, an order. Two ways to model it:
- `class Proposal extends Task` — the same methods, plus approval.
- The same data shape in a separate class: on approval, the proposal is converted into a Task (the same data, re-instantiated as a Task).

Either way, a proposal turns into a task when approved, and the data is never copied by hand.

## Constraints

- Object-oriented vanilla JavaScript; classes are the structure (CLAUDE.md).
- Low latency, real time: JSONL appends on the file system, the `live()` tail.
- Node + the Claude SDK; the process is state-aware and programmatic.

## Open questions

- [ ] Can every sentence be typed as either a question or a statement? Grammar has four sentence types: declarative (a statement), interrogative (a question), imperative (a directive), exclamatory. So a directive is its own type, not a statement.
- [ ] Does `Proposal` extend `Task`, or convert into one?
- [ ] What subtypes of Task exist?
- [ ] Which words fold together: Outcome vs Requirement, Recommendation vs Suggestion, Directive vs Request?
