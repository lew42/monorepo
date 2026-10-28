# Data shapes: the synthesis

**What this is.** Eight seats studied the session system on 2026-10-28 ([the brief](requirements.md)). Three designed it from scratch without seeing any proposal ("blind"). Five analysed the real code: Item/List/Store, the task path, the chat/refinement/roles map, pages, and streaming. This page puts their answers together:

1. what they agree on, which is the signal;
2. one class map;
3. the points where they disagree, each with options;
4. a short list of decisions for the owner.

**Nothing is built.** The owner wants to refine the shape together before anything is built.

**Start here if the shape is unclear:** [flow-and-ids.md](flow-and-ids.md) walks a sentence from the mic to a finished task, line by line. It explains how a line finds its item (a recursive set, plus an in-memory index), why a move is one line, and why ids are short and random rather than UUIDs.

Seat folders: [design-1](seats/design-1/shape.md) · [design-2](seats/design-2/shape.md) · [design-3](seats/design-3/shape.md) · [items](seats/items/shape.md) · [task-path](seats/task-path/shape.md) · [consolidation](seats/consolidation/shape.md) · [pages](seats/pages/shape.md) · [streaming](seats/streaming/shape.md) · [structures](seats/structures/shape.md) (added after, §7). Each has a `shape.md` (one page) and a `notes.md` (the evidence).

## 1. What the seats agree on

The three blind seats never saw each other's work or the proposals. Where all three reach the same answer, and the code analysis backs it, that is strong signal.

| # | Agreement | Blind seats | Backed by |
|---|---|---|---|
| 1 | **A Session is not a Task.** Session extends Item, with its own lists. Today `Session extends Task` pours prompts, questions, child sessions and real work into one `tasks` list, which is why a session shows hundreds of tasks. | 1, 2, 3 | task-path (the counts), pages |
| 2 | **Prompts and Questions are messages, not tasks.** Only an *ask* becomes a task. A Question is open until it has an `answer`; it needs no task states. | 1, 2, 3 | task-path: 111 of the 223 "open tasks" are Prompts counted as tasks, with their asks counted again |
| 3 | **Tasks are nested:** stored as a tree, but every id is unique in the whole file, and a computed `index` finds any task by its bare id ("nested storage, flat lookup"). | 1, 2, 3 | items (today's ids misroute; see §4) |
| 4 | **A few core tasks per session.** The top level of `session.tasks` is the plan, about 3–7 tasks. New asks go *under* a core task by default. Past 7 there is a soft warning, never a refusal. | 1, 2, 3 | task-path |
| 5 | **The chat shows a task through a reference, never a copy.** A `Ref {to: id}` draws the live task. A reference holds an id only, never a title or state. | 1, 2, 3 | pages (same rule for child pages) |
| 6 | **A child session has its own file.** The parent keeps a small `SessionRef` holding the facts that never change (id, role, model, which task it serves); the rest is read live from the child. | 1, 2, 3 | pages, streaming |
| 7 | **One act is one line on disk.** A sentence arriving, or a task being filed, writes ONE line that does all its list work, even when two lists change. This fixes today's half-written pairs. | 1, 2, 3 | items (today's two POSTs are not atomic) |
| 8 | **One writer.** Servex's item tool stamps `by` and `ts`, checks each line against the live state, and refuses bad ones. | 1, 2, 3 | streaming: there are 5 writer paths today; hooks bypass the tool |
| 9 | **The log is the truth, and a snapshot is only a cache.** The snapshot is a file *beside* the log, deletable at any time and rebuilt from the log. It is never a rewrite of the log. | 1, 2, 3 | streaming (zero-risk plan, §8 of its notes) |
| 10 | **Replies anchor to what they answer:** a prompt, a sentence, or a word range in a sentence (`{to, words: [from, to]}`). | 1, 2, 3 | — |
| 11 | **Code-made structure is declared, not logged.** Code builds lists and fixed items with fixed ids, before replay, and never writes them. Only clicks and agents write, with an id made once. | 1, 2, 3 | items (proved: code that adds after replay brings back items the owner deleted) |
| 12 | **A record HAS a page; it is not one.** | — | pages (TaskPage already works this way; "be" would need surgery and collides on `children`, `content` and `render`) |

## 2. The class map (the synthesis)

The seats agree on everything here except what is tagged **[A]**–**[D]**. Those tags are the contested points in §3; the map shows the recommended option.

```js
class Item                         // KEEP: data bag, set(delta), get(name), events, toJSON
  get items()                      // ADD: a List made on first use (today only Task.tasks does this; seat items)
  replay_line(line)                // CHANGE: strips by/ts into a clock for every Item (today only Task/Session do)
class List extends Item            // KEEP: ordered members; add/remove/move/order by `after`
  // ADD: an id → member Map (replay is quadratic past ~4,000 members today)

class Session extends Item {       // CHANGE: no longer extends Task
  id, kind: "voice"|"vscode"|"agent", title
  parent?: { session, task }       // written once on line 1; never edited
  sentences: List<Sentence>        // [A] the raw words, append-only, never moved
  chat: Chat                       // [B] the conversation, in order
  tasks: List<Task>                // the few core tasks; subtasks nest inside
  sessions: List<SessionRef>       // one per child session
  index: Map<id, Item>             // COMPUTED: every item in the file, any depth
  // verbs, one line each:
  hear(sentence)                   // → sentences, and into the current draft Prompt (made if none)
  group / refine(prompt)           // title and clean text; split / merge
  file(ask → task, under?)         // [C] makes or names a task, records where the ask went
  reply · ask · show · spawn · close
  // computed: completion (core tasks only), open_questions, unhandled_asks, cost (own + children)
}

class Sentence extends Item { text, via: "voice"|"typed", at? }   // Whisper's raw chunk is not kept

class Chat extends List<Message> { get messages() }               // the owner's word

class Message extends Item { by, render() }                       // created_at = the add line's ts
class Prompt   extends Message { title?, text?, state: "draft"|"refined", sentences: [ids], asks? }   // [A] [C]
class Reply    extends Message { text, to?: Anchor }
class Question extends Message { text, options?, answer?: { text?, sentence?, by } }   // open = !answer
class Card     extends Message { title, text, image?, rows? }      // owned by the chat, edited in place
class Ref      extends Message { to: id | path }                   // render() draws the live target

class Task extends Item {
  title, state: "open"|"working"|"waiting"|"complete"|"stopped"
  from?: Anchor                    // the words that asked for it
  done_by?: <child session path>   // [D] who is doing it
  outcome?, evidence?, why?, waiting_on?
  tasks: List<Task>                // children, nested
  start() wait() complete({outcome, evidence}) stop({why}) reopen()
}

class SessionRef extends Item { id, path, role, model, for: <task id> }   // fixed facts only

type Anchor = { to: <id>, words?: [from, to] }

class Page extends Item            // KEEP: routing and layout (~2,250 lines)
// A record's page: a thin Page subclass that loads the record and draws it. Two exist today:
class TaskPage extends Page { task }          // core/Task/TaskPage.js: opens a task folder's task.jsonl
class AISessionDetail extends Page            // ai/AISession/AISessionDetail.js: the session detail page
```

**A session being built, on disk.** These are design-1's lines, which the other two blind seats match in substance:

```jsonl
{"session":{"id":"v-7k2q","kind":"voice"},"by":"servex","ts":"…"}
{"hear":{"id":"s-a1","text":"The tab bar is broken on my phone.","prompt":"p-b2"},"by":"dictate","ts":"…"}
{"hear":{"id":"s-a2","text":"Can you fix it today?","prompt":"p-b2"},"by":"dictate","ts":"…"}
{"p-b2":{"refine":{"title":"Fix the mobile tab bar","text":"…"}},"by":"smart","ts":"…"}
{"task":{"id":"t-c3","title":"Fix the mobile tab bar","under":"t-ui","from":{"to":"p-b2"}},"by":"smart","ts":"…"}
{"reply":{"id":"r-d4","text":"On it.","re":{"to":"s-a2"}},"by":"smart","ts":"…"}
{"t-c3":{"complete":{"outcome":"Wraps at 400 px.","evidence":["shots/400.png"]}},"by":"agent","ts":"…"}
```

## 3. The contested points

**[A] Where do sentences live?**

| Option | Who | Pro | Con |
|---|---|---|---|
| **Own `sentences` list; a Prompt holds their ids** (recommended) | design-1, design-2 | Raw words never move, so anchors stay valid forever; refining or splitting a prompt only changes ids | One more list |
| Sentences sit in the chat, then **move into** the Prompt when grouped | design-3 | Drawn once, no extra list; the tree matches the screen | A move rewrites where the words live; an ungroup must move them back |

Design-1's trick settles the follow-up question of how an ungrouped sentence shows. Every `hear` puts its sentence into a draft Prompt at once, so the chat holds Prompts from the first word on, and the sentence entries never get reshuffled.

**[B] What is a chat entry?**

| Option | Who | Pro | Con |
|---|---|---|---|
| **The chat owns the conversation** (prompts, replies, questions, cards) **plus `Ref`s** for things that live elsewhere (tasks, child sessions) (recommended) | design-1, design-3 | Matches the owner's words ("references mixed with owned items"); a card has one obvious home | Two kinds of entry |
| **The chat is pointers only:** every thing has a home list, and the chat holds a `{ref}` per thing | design-2 | One kind of entry; each thing appears at most once, because the ref is the key | Seven home lists; every message is two objects |

**[C] Does a Prompt carry `asks`?**

| Option | Who | Pro | Con |
|---|---|---|---|
| **Asks inside the Prompt:** each ask has an `outcome` (`task`, `answered`, `noted`, `no-action`) (recommended) | design-3 | "Was every ask handled?" is a simple field check. Questions, ideas and rules settle without becoming tasks, which removes task-path's cause 2 (227 question parts, 187 ideas and 154 rules left blocking completion) | One more class |
| No asks; a Task points back with `from`, and "what did this prompt make" is computed | design-1, design-2 | Fewer objects | An ask that became no task leaves no trace |

**[D] When a child session does a parent's task, where does the task live?**

| Option | Who | Pro | Con |
|---|---|---|---|
| **It stays in the parent:** `done_by = <child>`, and the child writes the completion into the parent's file through the one writer (recommended) | design-2, design-3 | One home; the parent's completion moves the moment the child finishes; the parent reads without opening children | A cross-file write, which is safe only with one writer |
| It moves into the child (today's handoff, `move_item`) | today's code | The child owns all its work | The parent shows a reference, and its completion needs every child file (streaming: ~100 child fetches per redraw today) |

**[E] The snapshot: a sidecar file or a line in the log?**
- **Sidecar** (`session.snap.json` beside the log, recommended): all three blind seats and streaming. It has zero risk, because the log is never touched. Gate it with a test that the snapshot plus the tail equals a full replay, run on every real session before the feature turns on.
- **An appended `{"snapshot":…}` line** (design-decisions §5; the items seat says it works, and proved it): it keeps one file. But a reader still downloads everything and must scan for the last snapshot. Keep it for later, for when a file is rolled.

**[F] Ids.** *Settled further in [ids-and-paths.md](ids-and-paths.md):*
- every hop names its list, and each List looks members up in a Map;
- ids need to be unique only among siblings (the owner's 2026-10-03 rule);
- ids are short and random, with fixed names for code-made structure;
- references store a path and fall back to the id.

The original two answers follow; do both.
- Ids are unique per file (designs), with the computed index.
- The hop names its list, `{"b":{"s1":…}}` (items). Today a member line drops the list name, so two lists with the same id silently misroute on replay (proved, E2).

## 4. What the analysis found in today's code

These are facts for later, not design. Fix nothing until the owner says build.

- **The 223 open tasks:**
  - 111 are Prompts counted as tasks, and their asks are counted again.
  - 211 of the 223 (95%) were made by a program.
  - Of the 286 "done", 209 were closed by mass close-out passes; only 14 were really worked by an agent.
  - **Don't re-prompt them.** The count measures what the machine filed, not what the owner asked. ([task-path](seats/task-path/shape.md))
- **Replay grows too fast:**
  - The biggest voice session (8,360 lines) takes 2.1 s to replay in node. 10× e00f55c9 takes 6.2 s (89× the time for 10× the lines).
  - An editor-shaped file of 115,000 lines replays in 0.24 s, so JSONL is not the limit; three loops in our code are.
  - The session page replays the whole session on *every* streamed batch. ([streaming §2–3](seats/streaming/notes.md))
- **A lost-update bug:**
  - `Tail.js` keeps one offset per file, shared by every tab.
  - When a second tab opens a record just after an append, the first tab never gets that line.
  - Reproduced in node. The fix is one offset per socket.
- **The JSONL flow, answered:**
  - The **dev server's** single `fs.watch` notices an append and pushes only the new bytes over its WebSocket. Servex writes; it does not watch.
  - In the tab, `live.js` hands the lines to the Store, which replays them.
  - First load and live updates are the same code.
- **File size is not the first limit; mouse-rate writes are.** Rule: a drag is local, and one line is written on release.
- **Other stores fit** behind a six-method interface (append, read, subscribe, stat, list, snapshot): SQLite/D1, or a Cloudflare Durable Object with R2. The one change needed first is an opaque cursor in place of today's byte offset. ([streaming §9](seats/streaming/notes.md))
- **Persistence test matrix:** no class except Item and List round-trips a move or a remove through a real file. No test writes through the browser Store's real flush. ([streaming §10](seats/streaming/notes.md))
- **Page CRUD exists and passes its tests** (`Servex/agents/Subpages.js`, 33 + 21 checks, verified headless), but:
  - a created child doesn't show in its parent's nav;
  - there is no move between parents;
  - a rename leaves a 404 with no redirect.

  Child pages are stored four ways at once. The recommendation is one `pages` List with one reference shape, shared with tasks and sessions. ([pages](seats/pages/notes.md))
- **Items don't hold items on demand.** A bare Item stores `{items:{add}}` as plain data; only Task's `tasks` is made on demand.
- **Consolidation:**
  - Four chat families sit on three line shapes. Bring them to one view over one stored list, keeping Chat's input half (composer, mic) and its scroll and cursor helpers.
  - Of the 14 prompt-refinement systems, 2 earn their keep. The rest are off, duplicates, or run by hand.
  - For roles, `session-smart` becomes the one voice agent. The fast seat folds into it, placing in batches so it doesn't double the re-read cost.
  - `helper` ($941 of spend) has no row in `roles.js`. ([consolidation](seats/consolidation/shape.md))

## 5. Against design-decisions-2026-10-27

- **Holds:**
  - one owner per item (adopt vs ref);
  - deltas bubble to a root that has a file;
  - one ordered chat list, never a time-merge;
  - "the same write" (it becomes one verb line);
  - the fast seat paused.
- **Changes:**
  - Its "chat entries only reference sentences/cards/tasks" becomes the hybrid in [B] (the chat owns cards and messages, and references tasks).
  - Its "snapshot line in the log" becomes a sidecar first [E].
  - Its fix for the sentence + chat pair (one *array* line) doesn't work today: the item tool refuses an array. A verb line does the same job.
- **Reverses something built on 10-25:** *Prompt extends Task* and *Question extends Task*. Every blind seat, and the task-path counts, say they should be messages. That is decision 2 below.

## 6. Decisions for the owner

Each one has a recommendation, so a "yes" is enough.

1. **Session stops extending Task** and gets its own lists (`sentences`, `chat`, `tasks`, `sessions`). Recommended: yes (all seats).
2. **Prompt and Question become chat messages, not tasks**, which undoes the 10-25 build. Only asks become tasks. Recommended: yes. This one change removes about half of the "open tasks".
3. **[A] Sentences** live in their own list, and a Prompt holds their ids. Recommended: yes.
4. **[B] The chat** owns messages and cards, and holds `Ref`s to tasks and child sessions. Recommended: yes.
5. **[C] Asks inside the Prompt**, each with an outcome, so questions, ideas and rules settle without becoming tasks. Recommended: yes.
6. **[D] A child's task stays in the parent;** the child writes its completion there. Recommended: yes.
7. **One writer:** hooks and agents go through the item tool, with a raw append only when Servex is down. Recommended: yes.
8. **[E] Snapshots** are a sidecar cache file first; rolling the log comes later and only by rename. Recommended: yes.
9. **A record has a page, never is one,** as `TaskPage` (for tasks) and `AISessionDetail` (the session detail page) already do. Recommended: yes.
10. **What to build first, once building is allowed.** Recommended: the safe fixes from §4, before any reshaping, because they are bugs in today's system:
    - the lost-update fix;
    - linear replay;
    - stripping `by`/`ts` for every Item;
    - the hop naming its list.

## 7. Beyond sessions: what else the base must carry (seat f, ask 20)

[Seat (f)](seats/structures/shape.md) sketched every structure the site will want: the editor's layer tree, tables, boards, graphs, timelines, forms, users, teams, topics, channels, comments and documents.

- **Each one is an Item with named Lists, and nothing more.** The session shape above is the same pattern; a topic's chat is the same `Chat` class.
- **They all need the same ten base features, and today's base has none of them yet:**
  1. ids unique per file, with a live index;
  2. one `Ref` shape that also resolves in the browser;
  3. `items` on demand;
  4. the hop names its list;
  5. a sidecar snapshot;
  6. a file rolled by rename;
  7. an **ephemeral channel** for things never saved (cursors, selection, a drag, "typing…");
  8. bulk add in one line;
  9. undo as inverse deltas, written forward;
  10. a write check at the one writer.
- Features 1, 3, 4 and 5 are already among this page's decisions or safe fixes. The new ones are 7 (ephemeral channel), 8 (bulk add), 9 (undo) and 10 (permissions).
- **Three structures to prove the base, in order:**
  1. **the editor's layer tree**, which tests the most features at once (`ext/editor` exists and still saves one whole JSON per change, so porting it also proves the store is swappable);
  2. **a topic with channels and comments**, which rides on the session chat;
  3. **a table**, which tests scale and bulk import.
- If the order follows cost instead: the channel, then the table, then the editor.
- Comments live in a `comments.jsonl` beside the item they discuss. A channel rolls monthly. Board and timeline are views over a list, not lists of their own.

## 8. Strategy (the tab's recommendation, 2026-10-28)

Each step lands on its own and breaks nothing before the next one starts.

1. **Decide the shape together:** the ten decisions in §6, done interactively, before any build. This is the only step that needs the owner.
2. **Fix today's bugs, with no change of shape.** This is what "get streaming working properly" needs:
   - one offset per socket in `Tail.js` (the lost update);
   - linear replay: pseudo-property lines become verbs, a live id index, `lists()` cached, and `SessionTasks` applying new lines instead of replaying everything. The target: the voice session under 200 ms;
   - `by`/`ts` stripped for every Item;
   - the hop names its list.

   Each fix gets the missing test from the persistence matrix.
3. **One writer:** hooks and `LogLine` go through the item tool. Then add the sidecar snapshot, with its equality gate.
4. **The new session shape,** built beside the old one:
   - new classes, so the old ones keep reading old files;
   - old sessions are migrated once, by replaying them into a schema-numbered snapshot.

   Prompts stop counting as tasks here, which removes most of the open-task noise.
5. **One chat view over the stored list.** The fast seat folds into the smart agent, placing in batches, and dictation works on the website itself. The other chat views and refinement systems are then marked legacy, by a scripted move.
6. **Prove the base:** the editor's layer tree, then a topic with channels, then a table (§7).

Meanwhile: don't re-prompt the 223 open tasks. Under the new shape, most of them are prompts and settle by themselves; the rest go on one close-out list for the owner, not into mass completion.

## Not covered yet

- Users, teams, topics, channels and the editor are class sketches only (§7, [pages §5–6](seats/pages/notes.md)). None is designed in depth, and permissions are a shape with no design behind it.
- Design-1's worry: two writers reshaping one prompt at once (fast appends while smart splits). The writer has to redirect a stale `hear`. This is the hardest piece of code in the design.
- Verb lines tie old logs to method code. The answer is a `schema` number on the snapshot, and a new verb rather than a changed one.
- Per-sentence context cost, auto-compaction and token accounting stay in view, as the brief asked. They are not designed here.
