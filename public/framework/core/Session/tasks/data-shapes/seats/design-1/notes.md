# Seat 1: notes

The shape itself is in [shape.md](shape.md). This page answers the brief's seven questions, weighs each choice against the alternatives, and says what today's code gets right and wrong. Everything here is pseudocode and opinion; nothing is built.

## The rule everything follows

**Every piece of data has exactly one owner list. Anything else that needs it holds its id.**

- The raw words (`Sentence`) are owned by `session.sentences` and never move or change. A prompt, a reply, a task or a question that is "about" some words holds an id that points at them.
- A view never copies. A `Ref` in the chat draws the real item, found by id, and redraws when that item changes.
- A number (completion, cost, counts, "which prompt is this sentence in") is computed on read and never written down.

If you are unsure where a new thing goes, ask: "who would be wrong if this were deleted?" That list owns it.

---

## 1. Class map

The pseudocode is in [shape.md](shape.md#class-map). In words:

- **`Session extends Item`**, not `Task`. It holds four lists: `sentences` (Sentence), `chat` (Prompt, Reply, Question, Card, Ref), `tasks` (Task, nested) and `sessions` (SessionLink). Its own state is just `open` or `closed`. Its completion is computed from its tasks.
- **`Sentence extends Item`**: `text`, `via`, maybe `at`. Owned by the transcript.
- **`Prompt extends Item`**: `sentences` (a plain array of sentence ids), `state` draft or refined, `title`, `text`. Owned by the chat. **Not a Task**: a prompt is words; the work it asks for is tasks that point back at it.
- **`Reply`**, **`Question`**, **`Card`**: owned by the chat. `Question` is not a Task either; its phase (open or answered) is computed from whether it has an `answer`.
- **`Ref extends Item`**: `to` (an id), `why`. Owned by the chat. Its `render()` draws the target.
- **`Task extends Item`**: `title`, `state`, `from` (an anchor into the words), `tasks` (its children).
- **`SessionLink extends Item`**: its id is the child's session id; `role`, `model`, `for` (the task it was spawned for). It opens the child's own file when someone asks for it.

**Keep, change, replace:**

| Today | Verdict | Why |
|---|---|---|
| `Item` (`set`, `get`, events, `toJSON`) | keep | the delta grammar (a key that names a method calls it; a key that names a child walks into it) is exactly right |
| `List` (by-id verbs, `after`) | keep | ordering by `after`, never by index, survives concurrent changes |
| `Store` (one line per change, echo skip) | keep, add one thing | add a session-wide id index (`adopted`/`released` keep it), so a bare id finds any item in O(1) and a duplicate id is refused at insert |
| `Session extends Task` | change to `extends Item` | see below |
| `Prompt extends Task`, `Question extends Task` | change to `extends Item` | they are conversation, not work |
| `Prompt.raw`, `paragraphs`, `parts`, `refined`, `notes` | replace with `sentences` (ids) + `title`/`text` | five shapes for one set of words |
| task folders with their own `task.jsonl` | retire | a task big enough for its own file is a child session's work |

**Why Session is not a Task.** Making a session a Task put prompts, questions and child sessions into the same `tasks` list, because the list was the only place a session could hold things. That is how a session ends up with a hundred "tasks" and a completion number that means nothing. A session *has* tasks; it is not one. The thing a child session was spawned to do is a Task in the parent, and the child points at it (`SessionLink.for`).

## 2. Tasks: nested

**Pick: nested.** A task's children sit in its own `tasks` list. Ids are unique in the whole file, so any line can still name a grandchild by its bare id, as if the list were flat. Call it "nested storage, flat lookup": the tree is stored once, the id index is computed.

| | Nested (picked) | Flat with parent ids | Hybrid (some children in other files) |
|---|---|---|---|
| Draw the tree | free: it is the data | rebuild the tree on every view | free, but some branches load later |
| Sibling order | the List keeps it (`after`) | needs a separate order field per parent | List order |
| Move a subtree | one `move` line | one field set (`parent`) per moved task, but the subtree follows for free | a cross-file move |
| Completion rolls up | walk the children | needs an index from parent to children | some children are not loaded |
| Can a task be in two places? | no, by construction | no | yes, by accident (today's double-applied lines) |
| Cycles | impossible | possible (A's parent is B, B's is A) | possible across files |

Flat is the real competitor: moves are simpler and "all open tasks" is one filter. It would win if tasks were mostly queried and rarely drawn as a tree. Here the owner looks at the tree, and the brief wants a few core tasks with work underneath, so nested matches what is on screen.

**Keeping it to a few core tasks.** A new ask goes *under* an existing core task by default (`task({under})`). The session warns (a computed check, not a refusal) when it has more than about seven top-level tasks.

## 3. Where each thing lives, and what a chat entry is

| Thing | Owner | Shown in the chat as |
|---|---|---|
| Sentence | `session.sentences` | inside its Prompt (the prompt draws its own sentences) |
| Prompt | `session.chat` | itself |
| Reply | `session.chat` | itself; the Prompt it answers also lists it, computed from `re` |
| Question | `session.chat` | itself; its answer fills in place |
| Card | `session.chat` | itself; updated in place (`{"c-x":{"set":{…}}}`) |
| Task | `session.tasks` (or a parent task) | a `Ref` at the moment it was made (`why: "made"`), optionally another when it completes (`why: "done"`) |
| Child session | `session.sessions` (a SessionLink) | a `Ref` to the link, which draws the child's live card from its own file |

**A chat entry is any Item with a `render()`.** Either the chat owns it (Prompt, Reply, Question, Card), or it is a `Ref` whose only data is the id of something that lives elsewhere. The chat never holds a copy of a task's title or state, so nothing can drift.

**Why sentences are not chat entries.** When the owner speaks, a sentence goes into the transcript *and* into a draft Prompt in the chat (one `hear` line does both). The prompt draws its sentences live as they arrive. Refining fills in its title and text; it never moves a sentence. Splitting a prompt in two edits two id arrays. So the chat never has to swap a run of sentence entries for one prompt entry, which is where a view would flicker or briefly show both.

Alternatives I rejected:

- **Prompts own their sentences.** Then splitting or regrouping moves raw words between lists, and deleting a bad prompt loses what was said. The transcript is the safety net the brief asks for ("the raw sentences must persist").
- **One `Ref` per sentence in the chat, replaced by the prompt at refine time.** Simple at first, but every refine is a remove-and-insert on the chat, and two writers (the fast and smart assistants) racing on that is the hardest kind of conflict.
- **The chat is only refs, and every kind has its own list** (`prompts`, `replies`, `cards`…). Pure, but a reply or a card has no life outside the conversation, so a second list is a second place to look for no gain.

## 4. Ids and order

- **Unique in the file, not only among siblings.** Today an id is unique among its siblings while lines address bare ids at any depth (`Task.below`, `Session.find`), so two `fix-the-tab-bar` tasks in different branches are ambiguous. A session-wide index refuses the second one.
- **Made once, by whoever creates the thing, and carried on the line.** A short kind prefix plus random base-36: `s-` sentence, `p-` prompt, `r-` reply, `q-` question, `c-` card, `e-` ref entry, `t-` task. Six random characters give about two billion per kind per session, and the index catches the rare clash. Replay never makes an id.
- **Not slugs from titles.** Titles change; a slug id then lies, and the same title twice needs a `-2` suffix (today's `Task.List.make`). The title is for people; the id is for lines.
- **Code-made things get fixed, readable ids** (`t-ui`), so a rerun finds them (question 6).
- **Across files:** `<session id>#<item id>`. A child session that completes its parent's task writes `{"t-c3":{"complete":{…}}}` into the *parent's* file; the parent's file stays the one owner of that task.
- **Order is list order.** The `after` on each `add` and `move` keeps it. Nothing is ever sorted by time, so two lines with the same second never swap.
- **No timestamp in the entry's data.** Every line already carries `ts` (written by the one writer) and `by`. During replay an item remembers the `ts` of the line that made it as `created_at`, in memory only. The one exception is a time that differs from the write time: a sentence spoken while the phone was offline keeps its own `at`.

## 5. Storage: deltas are the truth, snapshots are a cache

**Pick: both, with clear jobs.**

- **`session.jsonl` (the truth):** append-only, one line per change, written by one writer (the item tool), which stamps `by` and `ts`, checks the line against the current state, and refuses a bad one. Lines are of two kinds:
  - **A verb on the session** when one act touches two lists, so it stays one line: `{"hear":{…}}`, `{"task":{…}}`, `{"spawn":{…}}`. The method on `Session` is the one place that keeps both lists in step.
  - **A plain delta** when one item changes: `{"t-c3":{"complete":{…}}}`, `{"c-x":{"set":{"text":"…"}}}`, `{"chat":{"move":{"id":"c-x","after":"r-d4"}}}`.
- **`session.snap.json` (a cache):** the whole session as JSON (`toJSON()`), plus `through: <line count>` and the byte offset it covers. Load = read the snapshot, then replay only the lines after `through`, then tail live. It is written by node, now and then (every N lines, or on close), never by hand. Delete it and nothing is lost: the next load replays everything and writes a fresh one.

One line per kind of change:

| Change | Line |
|---|---|
| a sentence arrives | `{"hear":{"id":"s-a1","text":"…","prompt":"p-b2"}}` |
| sentences grouped into a refined prompt | `{"p-b2":{"refine":{"title":"…","text":"…"}}}` |
| a prompt split in two | `{"p-b2":{"split":{"at":"s-a5","id":"p-e7"}}}` |
| a task made | `{"task":{"id":"t-c3","title":"…","under":"t-ui","from":{"to":"p-b2"}}}` |
| a task changes state | `{"t-c3":{"start":{}}}`, `{"t-c3":{"complete":{"outcome":"…","evidence":["…"]}}}` |
| a reply | `{"reply":{"id":"r-d4","text":"…","re":{"to":"s-a2","words":[3,6]}}}` |
| a question, then its answer | `{"ask":{"id":"q-f8","text":"Ship it now?"}}`, then `{"q-f8":{"set":{"answer":{"text":"yes","by":"owner"}}}}` |
| a card, then an update | `{"show":{"id":"c-g9","title":"Status","text":"…"}}`, then `{"c-g9":{"set":{"text":"…"}}}` |
| a child session | `{"spawn":{"id":"<child uuid>","role":"minion","model":"sonnet","for":"t-c3"}}` |

**Why not snapshots alone** (one whole JSON per change, the owner's older system, which worked): it is simple to load and easy to read. But two writers that each read, change and rewrite the whole file lose each other's changes (measured in this repo on 2026-09-19: read-modify-write lost 98% of concurrent writes, append lost none). It also keeps no history, and the live views would have to diff whole documents instead of applying one small line. As a cache beside the log, it keeps its one real benefit: a fast load.

**Why not deltas alone:** load time grows with the session's age. A long voice session has thousands of lines; the snapshot makes load cost proportional to what changed since the last snapshot.

## 6. Code-made versus UI-made

Four cases, four rules:

1. **Views write nothing.** `render()` reads; it never calls `set`.
2. **Structure that code declares is not data.** The session's four lists, a page's fixed layout, the menu: built in memory before the store attaches, so the store never records them. A rerun rebuilds them exactly. They are not in the file at all.
3. **Data that code must seed once uses a fixed id and add-if-absent.** `tasks.add({id: "t-ui", title: "UI"})` is a no-op when `t-ui` exists (List already does this, `List.insert`). The writer also refuses an `add` whose id is already in the file, so two tabs running the same seed code at once still make one task.
4. **A click makes its id once, at the click, and the line carries it.** Replay applies the line with that id and never makes a new one. Replay never records (the store's `replaying` flag, as today), so loading a session can never write to it.

The trap this closes: code that generates a fresh id each time it runs, after the store is attached. Rule 3 forbids it: seeding code uses fixed ids, and only a person's or an agent's act makes a random one.

## 7. Child sessions: their own file, linked from the parent

**Pick: own file, with a reference.** Each child is a full session in its own folder with its own `session.jsonl`. The parent holds one `SessionLink` (id = the child's session id, `role`, `model`, `for` = the task it was spawned for).

- **Who writes the link:** the parent's file, once, at spawn (`{"spawn":{…}}`). The child's line 1 carries `parent: {session, task}` as a birth fact; it is written once and never edited, so the two cannot drift.
- **Who owns the delegated work:** the parent's Task. The child does it and writes the task's completion into the parent's file. The parent's view shows the task with its worker (computed: the SessionLink whose `for` is that task).
- **Cost and state roll up on read:** the link opens the child's file lazily (snapshot plus tail) and asks it.

Inside the parent's file would mean two agents appending to one file at full speed, a parent file that grows with every grandchild, and no way to open a child on its own page without loading its whole family.

---

## What today's code gets right

- **The delta grammar** (`Item.apply`): a key that names a method calls it, a key that names a child walks into it, anything else is data. One rule for every class.
- **Lists by id, with `after`**, never indexes.
- **One `Store` per file, one line per change, echo skipping**, and the one writer (the item tool) that stamps `by` and `ts` and refuses a bad line.
- **Computed, never stored:** completion, progress, cost, the session's span.
- **Line time, not wall time,** on replay (`Task.clock`), so replaying twice gives the same result.
- **`Item.act`** records the verb a button called, not the field changes it made: the right shape for a live button.

## What today's code gets wrong

- **Session extends Task**, so everything a session holds went into one `tasks` list: prompts, questions, child sessions, real work. That is why there are hundreds of tasks.
- **Two replay paths.** `Item.apply` is the rule, but `Task.replay_line` has its own list of ~20 special keys plus a `FIELDS` list, and `Session.replay_line` has two record shapes (`{session}` versus `{assign}`) read by different code. A line can mean different things depending on which class reads it.
- **The words live in several places.** In real files, prompts are in `content`, voice sentences are `{"chat":…}` lines with their own `raw`, replies are nested inside prompts, and a `Prompt` alone keeps `raw`, `paragraphs`, `parts`, `refined` and `notes`. Five shapes for one set of words.
- **Ids are unique among siblings, but lines name them at any depth,** and ids are slugs of titles.
- **Two kinds of file for one idea:** a task folder (`task.jsonl`) and a session folder (`session.jsonl`), with HEAD requests to guess which (`Store.record_url`) and a reference system (`Task.from_ref`, `_own_file`) to stitch them together.
- **A parent's cost and children need a registry fallback** (`agents_under`) because the link from parent to child is not always written.

## My biggest worry

**Two writers reshaping the same prompt at once.** The fast assistant keeps appending sentences to a draft prompt while the smart assistant refines or splits it. A `hear` line that names prompt `p-b2` can arrive just after a `split` moved the tail of `p-b2` into `p-e7`; the sentence then lands in the wrong half. The one writer has to check each line against the current state and refuse or redirect a stale one (a `hear` into a prompt that has been refined goes to a new draft instead). That check is the hardest code in this design, and it must be in the writer, never in each client.

Second worry: a long voice session's chat grows to thousands of entries. The snapshot keeps loading fast, but the view should draw only what is on screen.
