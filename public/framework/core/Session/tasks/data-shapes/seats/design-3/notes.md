# Design seat 3: answers and trade-offs

The shape itself (class map and sample lines) is in [shape.md](shape.md). This page answers the brief's seven questions, compares each choice with the alternatives, and says what the current code gets right and wrong.

What I read: `Item.js`, `Store.js`, `List.js`, `JSONL.js`, `live.js`, `Task.js`, `Prompt.js`, `Question.js`, `Session.js`, the `core/Session` readme, and two real records (`2026/10/20/session-e00f55c9/session.jsonl`, `2026/10/25/v-xhx7fmx/session.jsonl`) to see what is on disk today.

---

## 1. Class map

The map is in [shape.md](shape.md). The decisions behind it:

- **Keep `Item`, `List`, `Store` and the JSONL tail as they are.** They already give the three things this design needs: one delta grammar (`set`), lists addressed by id with an `after` position, and "adding an id that is already there does nothing".
- **A session has three homes: `chat`, `tasks`, `sessions`.** Each item type has exactly one of them, decided by its class, never by where it is shown.
- **`Session extends Item`, not `Task`.** A session is a conversation; a task is a unit of work. The session *has* tasks and its state and completion are computed from them, so it still answers `state`, `completion` and `progress` like a task does. It just does not inherit task verbs that make no sense for a conversation (`approve`, `pause`, "complete needs evidence").
  - *Alternative:* keep `Session extends Task` (the owner's call on 2026-10-24). The rest of this design still works: `tasks` becomes Task's own list and `state` comes from Task. The cost is that a session can then be put in any task list, which is how child sessions ended up mixed in with ordinary tasks.
- **`Prompt` and `Question` are Messages, not Tasks.** Today both extend Task, so every prompt and every question counts as a task. That is one reason a session's task list grows into the hundreds. Here only real work is a Task. A prompt's completion is still computed (every ask has an outcome, and every task outcome is complete).
- **`Ask` is new.** It is the missing link between "what the owner said" and "what got done". Each ask records its outcome: a task, a reply, a note, or no action. "Has everything I asked been handled?" is then one query: asks with no outcome.

## 2. Tasks: nested, addressed by id

**Choice:** children live inside their parent's `tasks` list (nested), but every task id is unique in the whole session file, and the session keeps an index from id to item. So a line can name any task by its bare id, at any depth: `{"t-chat-speed":{"complete":{…}}}`.

| | Nested, addressed by id (chosen) | Flat list with `parent` ids | Nested, addressed by full path |
|---|---|---|---|
| Reading the tree | It is the tree | Every view rebuilds it | It is the tree |
| A line naming a task | `{"<id>":{…}}` | `{"<id>":{…}}` | `{"tasks":{"t1":{"tasks":{"t1a":{…}}}}}` |
| Moving a task to a new parent | One `move` line; old lines still find it by id | Change one field | Every later writer must know the new path |
| Sibling order | The list's own order | Needs a separate `order` field per parent | The list's own order |
| Snapshot | Reads like the screen | A flat list to reassemble | Reads like the screen |

**Keeping it to a few core tasks.** The top level of `session.tasks` is the session's plan, and should hold about 3–7 tasks. The `file` verb attaches a new ask to an existing core task when it fits (`under`), or makes a new core task when it does not. Two asks for the same thing point at the same task. The list warns past 7. Nothing stops a big session from having many tasks; the point is that the top level stays readable.

## 3. Where each thing lives, and what a chat entry is

| Thing | Home | How the chat shows it |
|---|---|---|
| Sentence | `chat`, until it is grouped; then inside its `Prompt` | Itself; once grouped, inside the prompt (drawn once) |
| Prompt | `chat` | Itself, with its sentences and its asks |
| Ask | inside its `Prompt` | Inside the prompt, with a live chip for its outcome |
| Reply | `chat` | Itself, with a quote chip of what it answers |
| Question | `chat` | Itself, with buttons when it has `options` |
| Card | `chat` (owned) | Itself |
| Task | `tasks` (nested) | Through an Ask's outcome chip, or a `Ref` message when an agent wants to show it |
| Child session | its own file; the spawn record lives in `sessions` | A `Ref` message added by the `spawn` verb |

**A chat entry is a `Message`**: an Item whose home is the chat list. A `Ref` is the one kind of message that holds no content of its own: it names an item that lives elsewhere (`"t-chat-speed"`, or `"<session id>/<id>"` in another file), and its `render()` draws that item live. It never copies a title or a state, so it cannot drift.

**Why sentences move into the prompt instead of being referenced by it.** If the prompt only listed its sentence ids, the chat would hold the sentences *and* the prompt, and every view would need a rule ("skip a sentence some prompt has claimed"). Moving them makes the rule unnecessary: each sentence has one parent, so it is drawn once. Regrouping is a `move` (or `ungroup`), and a reply anchored to a sentence still finds it, because anchors use ids and the index finds any id at any depth.

**References go one way, and only point at ids.** The ask says which task it became; the task finds the asks that point at it by looking them up (`asked_by`, computed). Storing both directions would give two places to keep in step.

## 4. Ids and order

- **Ids are made once, by whoever creates the item**, as a type letter and a random tail (`s-k2p9x4`, 6–8 base-36 characters), unique within the session file. The creator makes it, so the browser can show the item at once, before the server answers, and a retry after a dropped connection sends the same id, so it is not added twice.
- **Ids made by code are fixed names** (`t-review`), so code that reruns finds the same id again (question 6).
- **The session refuses an id that already exists anywhere in the file** under a different parent or type. The same id in the same place is a no-op, as `List.insert` already does.
- **Across files**, an item is `<session id>/<item id>`. Session ids are uuids, so that is unique everywhere.
- **Order is the order of the lines in the file**, plus `after` when an item must land somewhere specific (a grouped prompt lands where its first sentence was). Order never comes from timestamps: the phone and the PC have different clocks, and the one writer (Servex) already puts the lines in one order.
- **No timestamp field on a list entry.** The writer stamps `ts` on the *line*; an item's `created_at` is computed from the line that added it, as Task does today with `Task.clock`. A sentence may carry `said_at` only if the gap between speaking and arriving ever matters.

## 5. Storage: deltas are the truth, a snapshot is a cache

**Choice: both, with clear roles.**

- **`session.jsonl`, append-only, one event per line, is the only truth.** The line is the same delta `set()` takes, or a verb (`group`, `file`, `spawn`, `complete`) that a class method carries out. One meaningful event is one line, even when it changes two places (the `file` verb makes the task *and* sets the ask's outcome).
- **`snapshot.json` beside it, written only by node**, holds `toJSON()` of the whole session plus the byte offset it covers: `{"schema": 1, "through": 18342, "session": {…}}`. A page loads the snapshot, replays only the lines after that offset, and tails from there. A missing, older-schema or broken snapshot is ignored and the file replays from line 1.

| | Deltas only | Snapshot per change (the older system) | Deltas + snapshot cache (chosen) |
|---|---|---|---|
| Two writers at once | Safe: appends | One overwrites the other | Safe: appends |
| Live updates | Each line is one change to animate | A whole document per change | Each line is one change |
| Loading a long session | Replays every line (slow past ~1,000 lines) | One read | One read plus a short tail |
| A reader without the classes | Cannot interpret verbs | Reads plain JSON | Reads the snapshot's plain JSON |
| History | Every change, with who and when | Only if every version is kept | Every change |

What one line looks like for each kind of change:

```jsonl
{"chat":{"add":{"type":"Sentence","id":"s-k2p9x4","via":"voice","text":"…"}}}       // add to a home list
{"p-7hd2ka":{"title":"Chat opens slowly on the phone"}}                              // change a field, by bare id
{"t-chat-speed":{"wait":{"who":"owner","what":"phone or both?","question":"q-1x"}}}  // a verb on an item
{"q-1x":{"answer":{"text":"Both","by":"owner"}}}                                       // answer a question
{"chat":{"group":{"id":"p-…","sentences":["s-…","s-…"]}}}                              // a verb on a list
{"spawn":{"id":"31b7e2d0-…","for":"t-chat-speed","role":"builder","model":"sonnet"}} // a verb on the session
```

## 6. Code-made and UI-made

- **Structure made by code is declared, not recorded.** A class (a process template, a session kind) lists its fixed items in code (`static CORE = [{id: "t-review", title: "Review"}]`); the constructor makes them in memory on every load, and they are never written to the file. Lines then change them by their fixed id. A rerun cannot add a duplicate, because nothing is added.
- **A UI or agent action is recorded once, with an id made once.** The click makes the id, applies the change locally (instantly), and sends the line. Replaying that line later gives the same id, and adding an id that is already there does nothing.
- **The writer drops a line that would change nothing** (an `add` of an id already in place), so reruns do not fill the file with no-ops.

## 7. Child sessions: their own file, a spawn record in the parent

- **The child has its own `session.jsonl`.** Its line 1 says `parent: {session, for}`. Its own work (the steps it breaks the task into) lives in its own `tasks`.
- **The parent keeps one `SessionRef` per child in `sessions`**: the child's id, the task it serves, role and model. These facts never change, so copying them is safe. Everything that changes (state, cost, progress) is read live from the child's file.
- **The task stays in the parent.** When the child finishes, it writes the completion into the parent's file (`{"t-chat-speed":{"complete":{…}}}`, through the one writer). Moving the task into the child's file would split its history across two files and need a snapshot copy at the moment of handoff.
- *Alternative:* child sessions inside the parent's file. It is one file to load, but one busy child would flood the parent, two agents would be writing one file's state, and a child could not be opened on its own.

---

## What the current code gets right

- **One delta grammar** (`Item.apply`): a key naming a method calls it, a key naming a child walks into it, anything else is data. Nested lines, no path strings.
- **Lists by id, with `after`**, and `insert` of an existing id is a no-op. That is most of question 6 already.
- **`Item.act` records the verb, not the `set` lines it made**, so a button and an agent write the same line.
- **One Store per file, echo skip, one writer (Servex's item tool)**, which stamps `by` and `ts`.
- **Times come from the lines** (`Task.clock`), so replaying twice gives the same result.
- **Honest completion:** `complete` wants an outcome and evidence; a stopped task counts in neither done nor total.
- **`Prompt.raw` is append-only**, so the owner's words are never lost.

## What it gets wrong, or makes harder than it needs to be

- **Prompts and questions are Tasks**, so every prompt and question lands in task counts.
- **Nothing marks which tasks are the core ones.** The 2026-10-20 session's record has 1,040 lines, 867 of them `tasks` lines, and its readme counts 132 tasks. A session's top level is whatever was filed, in the order it was filed.
- **Sentence ids are computed by splitting text** (`r1`, `<paragraph id>1` from `Prompt.split`). If the split rule or a paragraph's text changes, the ids shift and the anchors pointing at them break. Here a sentence is an item with an id made once and text that never changes.
- **Two shapes for one conversation.** A voice record writes `{"chat":{from, via, text, …}}` log lines; the Prompt class keeps `raw`, `paragraphs` and `replies` inside each prompt. Replies live inside their prompt, so the chat's order has no single home.
- **Two record shapes for one class.** `Session.replay_line` tells an `{"assign"}` record from a `{"session"}` record and reads the second through its own `apply_line`, with special keys (`task`, `tasks`, `decide`, `settings`, bare ids found by a deep walk). That is a second delta grammar beside `Item.apply`. Here every session record has one shape and goes through `set()`, with the id index answering bare ids.
- **Lists made lazily by getters** (`Task.tasks`, `Prompt.paragraphs`) are invisible to `Item.get`, so Task and Prompt each override `get()` and `lists()` to special-case them. Making the lists in the constructor, as own properties, removes those overrides.
- **Bare ids are found by a deep walk** (`this.find(k)`) on every line. An index kept by add/remove events is the same answer without the walk.

## Risks and open points

- **Biggest worry: verb lines replay through today's code.** If the meaning of `group` or `file` changes, old sessions silently replay differently. Guards: keep verbs few and small, give the snapshot a `schema` number, and never change what an existing verb does: add a new verb instead.
- **An optimistic click the server refuses** (complete with no evidence) must be undone on screen. Checking with the same class code before sending (`can()`, `completion_problem()`) makes refusals rare; on a refusal the item is rebuilt from its lines.
- **Streaming a reply as it is written** should go over the socket only, and the reply is written to the file once, when it is final. Otherwise one reply becomes hundreds of lines.
- **Typed prompts from VS Code** arrive as one `Sentence` holding the whole text. The name is slightly wrong for that case; word ranges still work.
