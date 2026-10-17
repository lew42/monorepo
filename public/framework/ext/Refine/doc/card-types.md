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
- **Step** — a task inside a task. Tasks are recursive: add a task to a task and it is a step. There is no separate subtask type. (was "Subtask"; corrected by the owner, 2026-10-16, later)
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

## Addendum (owner, 2026-10-16, later, Claude mobile app) — purpose, decisions, more words, referencing, context cards

### Purpose is an aspect of every card, not a card type

- Prompt interpretation asks: is it clear, what does it mean, can the LLM make sense of it? That is really a question of **purpose**: what is the purpose of each statement?
- So any card can carry a `purpose`, with a confidence (weight) for how well we understand it. Usually it is trivial ("it is asking a question") and the purpose is clear.
- The deeper why ("why are they asking this?") is something the LLM does on its own. Don't build systems around it.
- This sits beside the clarity score and confidence scale in `doc/vision-2026-10-08.md` (addendum 2) and `doc/confidence.md`.

### A decision has options; options are a ranked live list

- A **Decision** holds a list of **Options**. Lists in this framework are live (they fire events; views bind to them and update), so use `List` for it.
- Options are **ranked** by a weight. Three ways to get the weights: a vote, a consensus, or one LLM that documents the options and weights them in a single pass. Start with the single pass.
- The high-level view is the ranked list: "this is a fork in the road, here are the options, this is how they rank". Seeing that an alternative existed is most of the value.
- A pros-and-cons **breakdown** per option is on demand (click into an option; or revisit a decision later: "was this the right call?"). Don't generate it for every decision.
- **Confidence on every decision.** Clearly right: just do it, write it down, mark it confident. Could go either way: do your best, mark it uncertain. Record the important decisions clearly; not every small one.
- **Decisions nest.** A composite decision is built of smaller decisions, or of **factors**. A factor may not have discrete options at all (different techniques, flavors, approaches); it is a concept identified as contributing to the design. Words that mean about the same thing here: option, factor, alternative, caveat. Pick one name per idea and lean into it.
- The UI is first a **record** (a decision tree of nested factors, a log); interactive in real time later, if we get there.
- Open: how decisions flow from prompt through plan to proposal.

### More words (candidates; not all of them need a card type)

- **Claim** — a statement that may be factual but is not verified yet. Don't be overconfident about claims.
- **Comment**, **Note**, **Reminder**, **Log**, **Paragraph**.
- **Source / Reference** — where something came from.
- **FAQ** — a kind of Question; it need not look different.
- **Dispute / Objection / Dissent** — disagreement with a statement or a decision.
- **Confidence / Weight** — an aspect any card can carry, not a card.
- **Breakdown** — breaking a thing into its sub-pieces.
- **Command** — the same as a Directive.
- **Request**, **Response**, **Prompt** — the chat-level units.
- **Step** — a child task (see the Work list above).
- The rule: define the important ones in a structured way, choose the right names, get comfortable with them, then use exactly those names. Organize into lists where it clearly fits; don't force a word into the wrong category.

### Referencing: every card can mention anything

- `ext/Mention` turns control characters in text (`#`, `@`, `/`, `!`) into namespaced references, like hashtags. The index for each namespace could live in one global file that is always loaded, so anything can be referenced quickly.
- Any card may reference anything through a mention. A universal markdown processor that wraps the markdown extension and turns references into links was being built; its status is unknown as of 2026-10-16. Check `ext/Mention` and the markdown extension before building another.
- Open: does referencing work for view-built content (the JavaScript helpers), or only for markdown?

### Cards are items; the selected card is the voice context

- Each card is an `Item`, so it can be selected. When the selection changes, a small system message tells the LLM which card is selected, so the reply is contextual, and the dictated response could be transcribed straight into that card.
- Still to decide for cards: the CSS, the UI, the interaction stages.

### Context cards: the pattern, and what already exists

- A context card is **not** a new card type with its own icon. It piggybacks on any class, page or module that already has an icon and a title (reached through a mention) and wraps a container for content that is unique to this session or instance: messages, a conversation, log lines, anything the item/page tools can show for that path.
- The point: frame every idea inside its primary context, so the whole conversation makes more sense.
- Past work found with `node Server/PastWork.mjs "context card"` (2026-10-16):
  - the owner's context-card and streaming-UI ideas, 2026-10-13: `/framework/ux/Dictate/doc/streaming-ui.md`
  - the ref row — an inline `#Page` chip upgraded to a full-width card, landed 2026-10-03: `/framework/ai/sessions/2026/10/03/list-events/ref-row-context-card/`
  - structured card types for AI board cards, owner 2026-10-01: `/framework/ai/sessions/2026/10/01/context-card-type/context-card-type/`
  - voice card types, amend, icon chip, proposals, 2026-10-05: `/framework/ai/sessions/2026/10/05/voice-chat-cards-and-model-context/`
  - content cards audit, 2026-09-28: `/framework/ai/sessions/2026/09/28/content-cards-audit/content-cards-audit/`
  - modules that exist now: `ui/card` (23 importers), `ux/Card` (3)

### The design smell the owner named

"Why don't we have clear procedures for putting ideas?" The procedure exists (CLAUDE.md law 5: a `doc/*.md` beside the module, linked from its readme); the gap is knowing which module, because Refine moved recently. Candidate fix: a "where ideas go" line at the top of `ai/readme.md` that names the home module per topic.

## Addendum 2 (owner, 2026-10-16, later still, Claude mobile app) — interactive cards, proposal verdicts, weight words, classes

### Interactive cards: controls, forms, and data saved against the card

- Cards need buttons, forms and small UI controls on them.
- The goal is a **systematic** way to add properties to a card and save data against it. Pre-built form fields that a card composes (a question with its response, for example), so you can build dynamic cards without new code each time.
- Whatever is saved belongs to that card, and the card can be referenced from anywhere (through a mention).
- The right data structure is not decided. It depends on the open Item / Page / List persistence question: JSONL appends with the `live()` tail, or a move toward a live database. That is up in the air as of 2026-10-16.

### Proposal verdicts: approve, improve, reject

For any proposal, the reviewer (usually an AI) gives one of:
- **Approve** — go.
- **Approve with a caveat** — go, but note this.
- **Improve** — suggest improvements without approving; judge it again when it comes back.
- **Reject** — no.

### More words

- **Query** — a question, or a request for data.
- **Request / Response** — the familiar server pair.
- **Assertion** — goes in the bucket with Claim and Statement.
- **Fact vs Opinion** — maybe not two card types; maybe one Statement with a weight. Not sure.
- **Subject / Object** — for naming the things a card is about.
- **Research** — a research system existed; its UI is one of many possible programs here.

### Weight words

A weighting system can mean any of: **confidence**, **probability**, **importance**, **relevance**, **bias**, **impact**, **influence**. Pick which ones a card actually carries; don't use them interchangeably.

### The system is dynamic, so it is classes

There are endless programs you could build here: ways to deal with each kind of content, its UI, cards, controls, feedback, workflows. The system has to expand without limit, so it is object-oriented: lean into classes. When you see a class you should always know where it is defined, be able to see the class architecture (which classes are nearby and how the whole fits), and once you know that, the structure itself is how you understand the system. (CLAUDE.md "Classes are the structure" and "Design the class architecture before you build".)
