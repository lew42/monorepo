# Design seat 2: notes

The shape itself (class map and sample lines) is [shape.md](shape.md). This page answers the brief's seven questions, compares each choice with the alternatives, and says what the current code gets right and wrong.

Three rules carry the whole design:

1. **One home per thing.** A sentence lives in `session.sentences`, a task in `session.tasks` (or inside its parent task), and so on. Nothing is stored in two places.
2. **Pointers go one way: the later thing points at the earlier one.** A task says which prompt it came from (`from`); the prompt does not list its tasks. A reply says what it answers (`to`); the prompt does not hold its replies. The reverse direction is computed on load (`session.sources`), so it can never drift.
3. **Every line carries the ids it creates, so applying it twice changes nothing.** That one property removes duplicates from reruns, echoes and retries alike.

---

## 1. Class map

See [shape.md](shape.md). In short:

- `Session extends Item`. It holds seven home lists (`sentences`, `prompts`, `replies`, `tasks`, `questions`, `cards`, `sessions`) and one view list, `chat`.
- `Sentence`, `Prompt`, `Reply`, `Question`, `Card` and `SessionRef` extend `Item`. They are small records with a `render()`.
- `Task extends Item` keeps the state machine it has today. A task holds a `List<Task>` of its children.
- `Chat extends List<Entry>`, and `Entry` is one field: `ref`.

**What changes from today, and why:**

- **Session no longer extends Task.** A task is a goal someone is working toward. A session is the conversation in which goals are discussed. When the two are one class, a session gets verbs that mean nothing for a conversation (pause, approve, reject), and today's `Session.replay_line` has to tell two record shapes apart (`_shape`). The session's "is the work done?" is still there, computed from its core tasks (`completion`). Its own lifecycle is one field, `closed`.
  - *The alternative:* keep `Session extends Task` (the owner chose it on 2026-10-24). It wins if a child session should drop straight into a parent's task tree as one of the tasks. In this design a child session instead points at the task it does (`task.done_by`), which keeps the task in one home. The rest of this design works on either base: the lists can sit on a Task just as well.
- **Prompt and Question are no longer Tasks.** A prompt is "what was said, cleaned up"; whether it is handled is computed (`unhandled`: its sentences that no task, reply or question cites). A question is open until `answer` is set: one field, no state machine. Both stop carrying copies of the Task verbs.
- **Sentence and Reply become classes with homes of their own.** Today the raw words are an array inside a Prompt, and replies live inside the Prompt they answer. So a sentence has no stable id before it is grouped, and a reply to two prompts has nowhere to live.

## 2. Tasks: nested, flat, or hybrid

**Choice: nested storage, flat addressing.** A subtask lives inside its parent's `tasks` list, on disk and in memory. Every id is unique in the whole session file, and the session keeps an in-memory `index` of every id at every depth, so a line can name any task by its bare id (`{"t-e4m8":{"complete":{}}}`) without spelling the path to it.

| | Nested (chosen, with a flat index) | Flat with parent ids | Fully nested, addressed by path |
|---|---|---|---|
| Rendering a tree | free: the data is the tree | every view rebuilds the tree from `parent` fields | free |
| Completion roll-up | walk the children | group by `parent` first | walk the children |
| Moving a task | one `move` line (`from` the old list) | change one field (cheapest) | one `move` line, and every later line's path changes |
| Broken states possible | none (a child is inside exactly one parent) | a `parent` naming a missing id; a cycle | none |
| Addressing in a line | bare id, via the index | bare id | the full path, which breaks when a task moves |

Flat is cheapest to move and query, but the tree becomes something every reader must rebuild, and its broken states (orphans, cycles) are real. Pure nesting with path addresses breaks old lines when a task moves. The hybrid keeps the tree as the data and keeps addresses stable.

**A few core tasks, not hundreds.** The top-level `session.tasks` are the core tasks. An ask that refines an existing task becomes a subtask of it or a change to it, not a new top-level task. The writer can warn when a session passes about seven open core tasks (a soft check, not a refusal: the right number is a judgment call).

**States.** Keep today's machine. The brief's words map onto it: open = `idle`, working = `running` (with `paused` beside it), `waiting`, `complete`, `stopped`.

## 3. Where each thing lives, and what a chat entry is

| Thing | Home | Who writes it |
|---|---|---|
| Sentence | `session.sentences` | the dictation pipeline (Whisper), one writer per session |
| Prompt | `session.prompts` | the refining agent |
| Reply | `session.replies` | the agent |
| Task | `session.tasks`, or inside its parent task | agents, and the owner's buttons |
| Question | `session.questions` | the agent; the owner writes `answer` |
| Card | `session.cards` | the agent |
| Child session | its own file; `session.sessions` holds a `SessionRef` | Servex at spawn |

**A chat entry is `{ref}` and nothing else.** `ref` is an id in this file, or a url path when the thing lives in another file (a child session, a task in another session). The chat List's key for an entry is its `ref`, so the same thing cannot appear in the chat twice: a second `add` with the same ref is a no-op, by List's existing rule.

- **Rendering:** `Entry.render()` looks up the ref (`session.index`, or the other file's Store) and returns the target's own `render()`. A missing target draws a "missing: <ref>" row instead of nothing, so a broken link is visible.
- **Every entry is a reference, cards included.** The brief allows the chat to own a card outright. I put cards in `session.cards` too, so the rule has no exception: the chat owns nothing and only orders things. It costs nothing extra on disk, because one `show` line does both the home add and the chat add.
- **Removing an entry never loses data.** When sentences are grouped into a prompt, their chat entries are replaced by the prompt's entry; the sentences stay in their home, and the prompt shows them one click down ("raw").
- **Why the chat is stored and not computed:** placement is a decision. An agent puts a card after a given reply; a grouping replaces several entries with one. A time sort across seven lists cannot express that, and clocks on a phone, a PC and an agent disagree. The chat can still be checked: every entry must resolve, and every sentence must be shown either directly or through a prompt that is in the chat. That check is a script, not a habit.

**No flicker.** A button runs its verb locally (today's `Item.act`), the line goes to the writer, and the echo is skipped (today's `Store.skip_echo`). Each target emits `change`, and only its own row redraws, because rows are keyed by `ref`. If an echo is not recognised, rule 3 makes replaying it harmless.

## 4. Ids and order

- **Ids are unique within the session file**, at any depth, across all lists. Today ids are unique only among siblings, yet `get()` and `Task.below()` search every list deeply, so a sentence and a task with the same id would be ambiguous. Unique per file removes that.
- **How ids are made:** a kind prefix plus a short random part (`s-a1f3`, `t-e4m8`), **minted by whoever creates the thing**: the phone for a sentence, the browser for a click, the agent for a task. Minting at the source means the local copy and the echo have the same id, which is what makes optimistic updates safe. A writer that is handed an id that is already taken refuses the line.
  - *The alternative:* the writer mints counters (`t5`, `t6`). They read better, but the browser's local copy would have no id until the echo, so the row would be drawn twice or swapped (flicker). Display numbers (#14) are computed from list position when they are wanted, never stored.
- **Order is list position.** An `add` lands at the end unless it names `after`; `move` and `order` change it. Lines are applied in file order, and the file is written by one writer, so every reader sees the same order.
- **Timestamps go on the thing, not on the list entry.** A sentence's `at` is when it was heard; a task's creation time is a fact about the task. A chat entry's position is its order, and its time is its target's. Each line also gets `ts` from the writer, which is when it was recorded. The item stores its own `at` in its data, so a snapshot keeps it (today `created_at` lives in memory only, computed from the line time, so a snapshot would lose it).

## 5. Storage

**Choice: append-only deltas are the truth; a snapshot is an optional cache.**

- **The log:** one line per change, in the Item grammar (a key naming a method calls it; a key naming a child walks into it). The session's own verbs (`say`, `refine`, `reply`, `add_task`, `ask`, `show`, `spawn`) are recorded as the verb, not as the list changes they cause, the same way `Item.act` records a button's verb today. So one line does all its list work (the home add plus the chat entry), and no writer can do half of it. Sample lines are in [shape.md](shape.md).
- **The snapshot:** `session.snapshot.json` = `{schema, through: {line, bytes}, state}`. Node (Servex) writes it after every N lines, and when a session closes. Load reads it, then replays only the lines after `bytes`. Deleting it loses nothing.

| | Deltas only | Snapshot per change (the older system) | Deltas + snapshot cache (chosen) |
|---|---|---|---|
| Two writers at once | safe: appends do not collide | a read-modify-write loses the other's change | safe |
| Live updates | send one line | send the whole document, or diff it | send one line |
| History | every change, who and when | gone unless every version is kept | every change |
| Load time | grows with the log | one read | one read plus a short tail |
| Old line shapes | read forever | none | read once by a migration, then retired |

The snapshot's `schema` number is its quiet benefit. When the shape changes, a migration replays the old lines with the old reader once and writes a snapshot in the new schema; new lines use the new shape. The compatibility code that fills today's `replay_line` methods can then be deleted instead of living forever.

The older system's snapshot-per-change worked because it had one writer and small documents. Sessions here have several writers (Whisper, the assistant, the mastermind, the owner's buttons) and a live socket, which is where whole-document writes lose changes.

## 6. Code-made versus UI-made

- **Code-made structure is declared, not logged.** If page code builds a list of tasks on every load, those tasks are not written to the file at all. They are rebuilt from code each time, with **derived ids** (a slug of a stable key: the same input always gives the same id). The file only holds changes to them, addressed by that id: `{"t-setup":{"complete":{}}}`. Replay order is code first, then the log, so the target always exists when its line arrives.
- **UI-made things are made once, at the click,** with a random id minted right there.
- **The safety net is rule 3.** If code does write an `add` (by mistake, or by design), a rerun's `add` with the same derived id is a no-op, because List already refuses a key it has.

The rule for a reader: an id is either derived (code-made; rerunning makes nothing new) or random (made once, by a click or an agent). Never derive an id from something that changes, such as a task's title: a rename would then make a second task on the next run.

## 7. Child sessions

**Choice: their own file, with a reference in the parent.** The parent's `sessions` list holds a `SessionRef {id, path, role, model, brief, at}`. The chat shows it as an entry whose `ref` is the child's path. When it is drawn, the child's live state (state, cost, its own tasks) is read from the child's file, opened through its own Store (today's `Task.open_ref` pattern).

- **Why not inside the parent's file:** the child is written by a different agent. Two agents in one file means a much larger file, every parent reader replaying the child's every word, and no page of its own for the child.
- **The ref holds only the facts of the spawn act** (who, which model, which brief, when). Those never change, so they are not copies. Anything that changes (state, cost, title) is read from the child.
- **A child that does a parent's task does not take the task with it.** The task stays in the parent (`task.done_by = <child path>`), and the child completes it by writing one line to the parent's file through the item tool: `{"t-e4m8":{"complete":{…}}}`. The task has one home, and the parent's completion moves the moment the child finishes.
  - *The alternative:* move the task into the child (today's handoff, `move_item`). Then the parent shows a reference where its task was, and the task's state lives in the other file, so the parent can only be read by opening the child.

---

## What the current code gets right

- **The Item grammar** (`core/Item/Item.js`, `apply`): a key naming a method calls it, a key naming a child walks into it, anything else is data. One rule for every level. This design keeps it and adds nothing to it.
- **List verbs by id with `after`**, and `insert` being a no-op for a key it already has (`core/List/List.js`). That idempotence is half of rule 3 already.
- **One Store per file, echo skipping, and recording a button's verb rather than its effects** (`Store.for`, `skip_echo`, `Item.act`).
- **A referenced child lives in its own file and its changes are never recorded in the parent** (`Task.from_ref`, `_own_file`, `owned_below` in `Store.js`).
- **Numbers are computed on read, never stored**: completion, progress, cost, `Question.phase`.

## What the current code gets wrong (or makes costly)

- **Sentences have no stable ids.** Before paragraphs exist, `Prompt.sentences` numbers them `r1, r2…` by splitting the raw text; after, `<paragraph id>1, 2…` by splitting the cleaned text. Editing the cleaned text renumbers the sentences, and every reply anchored to one points at a different sentence.
- **Replies live inside a Prompt** (`Prompt.replies`), so a reply that answers a sentence of an earlier prompt, or two prompts at once, has no right home.
- **Two replay paths for one class.** `Session.replay_line` reads a tab's record through its own hand-written `apply_line` and a spawned agent's record through `Task.replay_line` (the `_shape` switch). `Task.replay_line` itself mixes `put` and `set`, a `LINE_KEYS` list, a `FIELDS` list and legacy inference. The one Item rule is no longer the one rule. Each special line (`decide`, `settings`, `sessions` arrays, `{"task": ref}`) is a place where a reader can disagree with the writer.
- **Ids are unique per list but searched across all lists**, so two lists can produce an ambiguous `{"<id>": …}` line.
- **Slug ids from titles** for agent-made tasks: the same title twice gets `-2` in replay order, and a renamed task keeps an id that no longer matches it.
- **`created_at` exists only in memory** (from the line's time), so any snapshot or export loses it.
- **`Store.hops` only walks through List members**, so an Item held in a plain property (not a list) cannot be the origin of a recorded change. This design avoids the case by making `chat` a List, but it is a trap for any future Item-valued property.
- **There is no stored chat list today**: the chat is assembled from Prompts and transcripts, which is why the readme calls Chat V2 broken.

## Biggest worries

1. **Verb lines tie old logs to method code.** If `refine()` changes what it does, old `refine` lines replay differently. The snapshot's `schema` number is the answer: change the verb only together with a migration that writes a new snapshot.
2. **Optimistic order.** A click adds a row at the end locally; if another writer's line lands in the file first, the local order differs from the file's until the echo arrives. The fix is small but must be built: when the echo comes back, move the row quietly to the file's position.
3. **Cross-file writes** (a child completing the parent's task) need the single writer to stay single. If two processes ever append to one file without going through Servex, lines can tear.
