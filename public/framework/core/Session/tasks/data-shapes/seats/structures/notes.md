# Seat (f) `structures`: findings

Ask 20 of [the brief](../../requirements.md), with asks 13 and 14. I read [the synthesis](../../synthesis.md) and the [pages](../pages/notes.md) and [streaming](../streaming/notes.md) notes first, then checked the base in the code myself. One page of shape: [shape.md](shape.md). The rates come from a script (`rates.mjs`, in my scratchpad `%TEMP%/seat-structures/`); every other number is cited to the seat that measured it.

## 1. What already exists for these structures

Before designing anything new, here is what the repo already has. The pattern is clear: **three of these structures were each built with their own storage, outside Item.** That is a second (and third, and fourth) persistence system, which CLAUDE.md law 6 ("one of everything") says to avoid.

| Structure | What exists | How it stores | On Item/List? |
|---|---|---|---|
| Editor layer tree | `ext/editor` (palette, canvas, layer tree, properties) on `ext/Panel` | the owner's older snapshot way: `FileSaver` writes the whole document to `/data/editor.json` (1,993 bytes, measured) on every change (`ext/editor/page.js:21-25`) | the tree is Items, the store is not `Item.Store` |
| Undo | `ext/editor/History.js` | a whole-document snapshot pushed before every act (`History.js:19-24`); a restore builds a new tree, so the editor must move the saver, listeners and selection onto it (`History.js:1-4`) | no |
| Graph | `imagine/importance/Graph.js` (nodes, edges, judgments) | its own `load()`/`append()` pair over three JSONL files (`Graph.js:37-40`) | no: Maps and arrays |
| Comments | `core/Page/PageInbox.js` (notes agents leave on a page) | pseudo-verbs `note`, `inbox`, `note_state` read by its own `NotesLog extends JSONL` (`PageInbox.js:11-27`) | no |
| Table | `ext/DataGrid` (2,000 rows, sort, resize) | none: a view over a plain array | view only (fine) |
| Timeline | `ext/Timeline` | none: a view over `{at}` / `{from,to}` objects (`Timeline.js:15-24`) | view only (fine) |
| Board | the task board on `/framework/ai/` | a view over task state | view only (fine) |
| Doc with sections | `Page.content`, a typed List of parts | `page.jsonl` lines through `Item.Store` | yes |
| Users, teams, topics, channels, forms | nothing | — | — |

**Finding 1.** The views (DataGrid, Timeline, the board) are right as they are: a view should take a list and draw it. The problem is the three structures that each wrote their own store (editor, Graph, PageInbox). Each new structure should be an Item with named Lists written through the one `Item.Store`, so a fix to replay, snapshots or permissions reaches all of them at once.

## 2. The size profiles, and where they come from

**Measured on real records** (`rates.mjs`, 2026-10-28):

| Record | Lines | Active hours | Lines per active hour | Peak hour | Average line |
|---|---|---|---|---|---|
| Voice session v-sq8y7db | 8,360 | 8 | 1,045 | 1,054 | 328 bytes |
| …of which `chat` lines | 2,217 | 8 | ~277 | | |
| Tab session e00f55c9 `session.jsonl` | 1,047 | 53 | 20 | 189 | 3,199 bytes |
| Tab session e00f55c9 `page.jsonl` | 554 | 16 | 35 | | 1,704 bytes |
| Notes on pages (`{"note"…}` in every `page.jsonl`) | 22 notes in 14 of 5,655 page logs | | | | |

"Active hours" counts distinct clock hours with at least one line. The voice session's 1,045 lines an hour are mostly noise the owner already decided to drop (pseudo-property lines `place`, `quiet`, `sent`…; streaming §2). The 277 `chat` lines an hour are the honest rate of a busy conversation.

**Estimated** (each from a stated assumption; none is measured):
- **An editor page:** one line per *decision* (a drop, a property change, a rename), never per mouse move. A focused designer makes about 5–10 decisions a minute, so 300–600 lines an hour. Building 300 layers from nothing is 300 add lines of about 120 bytes, about 36 KB. A busy page used an hour a day for a year lands at 20–100k lines. Streaming measured 115,000 editor-shaped lines replaying in 0.24 s, so a year of one page is fine to replay; a snapshot sidecar keeps the first load quick.
- **A table:** cell edits are like editor decisions; the big event is an import (2,000 rows at once), which is why it needs a bulk add (§3, item 8).
- **A channel:** if a community channel runs at the voice chat rate for even 2 hours a day, that is about 200k lines a year. That is the one structure that truly grows without end, so it rolls monthly (§3, item 6).
- **A user, team or form definition:** a handful of lines a week.

**Finding 2.** File size is not what separates these structures. The two kinds that matter are: **append-forever streams** (channels, chat, form responses), which need rolling, and **edited documents** (editor pages, tables, docs), which need snapshots and undo. Everything else is small.

## 3. The shared base: ten features, and the gap in each

Each structure in [shape.md §1](shape.md) was sketched, then I listed what it needs from Item/List/Store. These ten features cover all of them. The synthesis already agrees on 1, 3, 4 and 5; the rest are new from this seat.

1. **Ids unique per file, and a maintained `id → item` index.**
   - Why: every structure addresses a deep member directly (a layer, a row, a message, a comment's target).
   - Today: ids are unique only among siblings (seat items, proved misroute E2). `List.find` scans the list (`core/List/List.js:112`). `Item.find` walks the whole tree (`core/Item/Item.js:240`), and `Task.below` is that walk (`core/Task/Task.js:107`). `Item.get` loops over every list at every hop (`Item.js:184-188`).
   - The index must also answer "not here" quickly: in the voice replay, 6,257 of 9,176 lookups missed and each miss walked the whole tree (streaming §2).
2. **One `Ref` shape that resolves in the browser.**
   - Why: an editor document points at its pages, a topic at its channels, a user at teams, a comment at its target, a board at its source.
   - Today: `Task.from_ref` resolves through `Task.resolver`, which only node sets (`Task.js:454`). Pages write `{"file":…}` and tasks write `{"task":…}`: two spellings (pages §3).
3. **`items` on demand, and named typed Lists.**
   - Why: every container here holds something.
   - Today: only `Task.tasks` is made on demand, and only because Task overrides `get` (`Task.js:70-71`). Typed members work: a list's `of` class builds untyped members (`Item.js:307,330`).
   - **My view on the owner's direction:** a generic `items` is a good default for an untyped container, but each structure above reads better with its own named list (`layers`, `rows`, `messages`). Both should come from the same on-demand mechanism, declared by the class.
4. **The hop names its list:** `{"layers":{"L7":{"props":…}}}`.
   - Why: a move between parents, one layer's history and list-level permissions all need to know *which list* a line touched without replaying.
   - Today: the wire chain is child ids only, never list names (`core/Item/Store.js`, the `hops` comment above line 275).
5. **A sidecar snapshot, with the gate "snapshot + tail = full replay".** Agreed by every seat (synthesis [E]); the edited documents above need it most.
6. **Rolling a file by rename,** with line 1 of the new file `{"continues":{…}}` (streaming §8 step 2).
   - Why: a channel, a long chat, and form responses grow forever. Roll by month, so the folder reads `chat/2026-10.jsonl`, `chat/2026-11.jsonl`, and a reader of "this month" opens one file.
   - Today: nothing rolls.
7. **An ephemeral channel: state that is sent but never saved.**
   - Why: a cursor, a selection, a drag in progress, "typing…", a voice level meter. These change at mouse rate and are worth nothing tomorrow. Streaming showed that writing a drag costs ~15 MB an hour; the rule both seats wrote ("a drag is local; one line on release") is right, but two people in one document still need to *see* each other's drag.
   - Today: missing. The dev socket only tails files (streaming shape).
   - The shape: the same socket, a message kind that the server relays to the other subscribers of that file and never appends.
8. **A bulk add in one line:** `{"rows":{"add":[…2,000 rows…]}}`.
   - Why: a table import or an editor paste is one act, so by the synthesis's rule 7 it is one line.
   - Today: the item tool refuses an array (synthesis §5).
9. **Undo as inverse deltas, written forward.**
   - Why: editor, table and doc all need undo, and the log is append-only.
   - Today: the editor's `History` snapshots the whole document per act and swaps in a rebuilt tree on undo (`History.js:1-4,19-24`). That works at 2 KB; at 300 layers × 50 steps it is 15,000 layer copies, and swapping the tree breaks every live listener.
   - The shape (§4 below): before a change, the tab keeps the inverse delta; undo writes that inverse as a new, ordinary line. History only grows.
10. **A write check at the one writer.** §5 below.

**What I would not add to the base:** a per-character text merge (CRDT). Every structure here edits a whole field at a time (a block's text, a cell), and with one writer the last line wins cleanly. It becomes worth it only if two people type in one paragraph at once.

**Some lists should be queries, not stored lists.** `user.sessions` or `user.comments` would gain a line every time the user does anything; they are better computed from the records (`by` is already on every line). Store only what the user *decides*: pinned pages, teams joined. The same holds for a board whose columns are a state: a card move is `{"<task>":{"state":"working"}}`, not a list move. Real lane Lists are only for boards where people make the columns by hand.

## 4. The editor in depth (ask 14)

**Files.** One file per page, `<page folder>/layers.jsonl`, with 300 layers. The document has its own small file, `design.jsonl`, holding the list of page refs, the shared component library and the design tokens.
- *Why not one file for the document:* it can work (lines address by id, and 115k lines replay in 0.24 s, streaming §5), but every page's history would sit in one tail, and every open tab would receive every page's changes. The pages seat reached the same answer (pages §6).
- *When one file wins:* a small document of a few pages, where one file is simpler. A page can start in the document file and be moved out later, because a ref replaces it.

**Shared components need a new kind of reference.** A component placed on several pages is an `Instance`: a reference to the component *plus local overrides* (a different label, a colour). The synthesis's rule 5 says a reference holds an id only, never a copy. An instance breaks that on purpose, so it should be its own class (`Instance extends Layer { of, overrides }`), never a plain `Ref` that slowly gathers fields. This is the one place in the catalogue where a ref carries data.

**Selection, drag and undo:**

| | Local state or a line? | Why |
|---|---|---|
| Selection | local; broadcast on the ephemeral channel (§3, 7) when others are in the document | it changes constantly and means nothing after the tab closes |
| Drag | local preview at mouse rate; **one** `move` or `set` line on release | streaming: per-move writes cost ~15 MB an hour |
| Undo | a local stack per tab of `{forward, inverse}` deltas; undo **writes** the inverse as a new line | the log never shrinks; undo is just another edit, so it streams to other tabs like any edit |
| Undo with two people | undo only your own lines (`by` is you); if the target changed since, skip that step and say so | never undo someone else's work silently |

**Reading one layer's history.** Collect the lines whose hop chain contains the layer's id, plus the `move` lines whose `id` is that layer, then replay them in order.
- This works only if the layer's id is unique in the file and never changes when the layer moves (base feature 1). Today, ids are sibling-unique, so a layer moved under a parent that has a same-named child would collide.
- A quick first pass can search the text for `"L7"` before parsing; an id → line-offsets sidecar (written beside the snapshot) makes it instant on a big file.
- A worry to keep: today a cross-list `move` carries its `from` as an old `/`-separated path string (`Store.js`, `line_for` comment). History must read both the new hop and that string.

**Where it breaks today** (pages §6 found the first two): deep ids need the index; mouse-rate writes need the discipline; the editor's store is the snapshot `Saver`, not `Item.Store`; undo replaces the tree; nothing relays a selection.

## 5. Permissions and identity, as a shape only

**Identity comes from the connection, never from the line.** This is already true today, and it is the right base:
- a browser post to `/api/item` is accepted from loopback only and runs as `caller: "owner"` (`Servex/Servex.js:676-683`);
- an agent's write is stamped `by: ctx.caller`, its Servex id (`Servex/agents/page_tools.js:514,523,543`).

Once users exist, the socket or session cookie names the user, and the writer stamps `by` from that. A line's own `by` is never trusted. An agent acting for a user adds who it acts for: `{by: "agent-x", for: "u/ana"}`.

**The unit of access is a file, with optional rules per list.** Each root record carries one `access` property, set only by its owner, and its changes are ordinary lines (so who got access, and when, is history):

```js
access: {
  owner: "u/ana",
  roles: { editor: ["team/design"], commenter: ["*members"], reader: ["*"] },
  lists: { messages: "member", comments: "commenter" }   // who may add to which list
}
```

- **The check** runs at the one writer before the append: find the caller's role (resolving a team ref through that team's members), read which list the line touches, and compare. This needs base feature 4 (the hop names its list); with ids only, the writer must replay to learn which list a line touched.
- **Comments sit in their own file** (`comments.jsonl` beside the document) so a commenter can be allowed to write there without being able to touch the document. That is simpler than list-level rules, and it is what the file-as-unit shape gives for free.
- **Reading** is "which files may this socket subscribe to". On the static site everything is public, so private data needs a server-backed store (D1 or a Durable Object; streaming §9).

## 6. Pick three, in order

1. **The editor's layer tree:** proves ids and the index, moves across parents, one item's history, undo, the drag rule, the ephemeral channel and the snapshot, all at once. `ext/editor` exists and saves the owner's older way, so porting it to `Item.Store` also proves the store can be swapped.
2. **A topic with channels, with comments as Threads:** proves browser refs across files, rolling, "typing…", and who may post. It reuses the session `Chat`, so it costs little once that exists.
3. **A table:** proves a flat List of thousands (replay is quadratic past ~4,000 members today, synthesis §2), bulk add, and the code-made/UI-made split: columns are declared in code, rows are logged.

By cost instead of proof, the order would be channel, table, editor.

## 7. The owner's directions: where they hold and where they break

- ✅ **"Items hold items, on demand."** Holds as a direction; only Task does it today. Refined: the same mechanism should give each structure its *named* lists (`layers`, `rows`), with `items` as the default name.
- ✅ **"Code builds the structure; items arrive from the UI."** Holds, and a form is its cleanest case: the fields are declared in code and never logged; the responses are logged, one line per submit.
- ⚠ **"Several pages share one JSONL file?"** They can, but they should not past a small document: one file per page, and a small document file as the index.
- ⚠ **"JSONL's size is a real limit."** Measured, it is not the first one (115k lines in 0.24 s). Write rate (mouse moves) and download size are. Channels are the one structure that needs rolling.
- ✅ **"An editor could replay one layer's history alone."** Holds, only once ids are unique per file (base feature 1).
- ✅ **"The older snapshot system worked well."** For a small edited document (the editor's 2 KB) it is fine, and a swappable store lets a structure choose. For undo, inverse deltas beat snapshots once a document grows.
- ⚠ **Users, teams, topics, channels (ask 13).** They fit Item + Lists with no new base class. What they lack is identity and the write check (§5), browser refs, and rolling. They also want a home outside `/framework/` (pages §5).
