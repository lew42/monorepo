# Seat (f) `structures`: what else the Item/Page system should carry

**The short answer.** Every structure a site will want (an editor's layers, tables, boards, graphs, timelines, forms, users, teams, topics, channels, comments, documents) is **an Item with named Lists**, and nothing more. What they need from the base is the same short list: ids that are unique in a file plus an index to find them, one reference shape that works in the browser, an Item that can hold a List on demand, a sidecar snapshot, a way to roll a file that only grows, a channel for things that must *not* be saved (a cursor, a drag), and a write check at the one writer. Today's base has none of these yet; the other seats found each gap ([synthesis §4](../../synthesis.md)). Evidence and citations: [notes.md](notes.md).

## 1. The catalogue, as classes

```js
// THE EDITOR (Webflow / Figma-like). One file per page; the document file is the index.
class Design extends Item   { title, pages: List<Ref DesignPage>, library: List<Component>, tokens: {…} }   // design.jsonl
class DesignPage extends Item { title, layers: List<Layer> }                                  // <page>/layers.jsonl
class Layer extends Item     { type, props: {…}, layers: List<Layer> }                        // a tree; ids unique per file
class Instance extends Layer { of: Ref Component, overrides: {…} }                            // a ref that carries local changes

class Table extends Item    { columns: List<Column>, rows: List<Row> }                        // columns code-made, rows UI-made
class Row extends Item      { …cells by column id }
class Board extends Item    { source: Ref List, group_by: "state" }                           // a VIEW when columns are a field…
class Lane extends Item     { title, cards: List<Ref> }                                       // …real Lists only when people make columns
class Graph extends Item    { nodes: List<Node>, edges: List<Edge> }                          // Edge { from, rel, to }
class Timeline extends Item { events: List<Event> }                                           // Event { at | from,to, label, ref? }
class Form extends Item     { fields: List<Field> }                                           // code-made, declared, never logged
class Responses extends Item { entries: List<Response> }                                      // one file per form; one add per submit

class User extends Item     { name, avatar, pinned: List<Ref>, teams: List<Ref Team> }        // /u/<name>/user.jsonl
class Team extends Item     { title, members: List<Member>, topics: List<Ref Topic>, access } // Member { user: Ref, role }
class Topic extends Item    { title, chat: Chat, channels: List<Ref Channel>, pages: List<Ref Page> }
class Channel extends Item  { title, chat: Chat }                                             // own file, rolled monthly
class Chat extends List<Message | Ref>                                                        // the same Chat the session uses
class Thread extends Item   { on: Anchor, chat: Chat }                                        // comments on ANY item, in comments.jsonl beside it
class Doc extends Item      { sections: List<Section> }                                       // = a page's content list today
class Section extends Item  { title, blocks: List<Block> }

type Anchor = { to: <id or path>, words?: [from, to] }   // the synthesis's anchor, reused
```

## 2. Profiles: where each lives, how fast it grows

Rates marked *m* are measured on real records; the rest are estimates from a stated assumption (in [notes.md §2](notes.md)).

| Structure | Own file? | Ids | Lines / active hour | Lines / year | Line shapes it needs |
|---|---|---|---|---|---|
| Layer tree (1 page, 300 layers) | yes, per page | unique per file | 300–600 (one per *decision*) | 20–100k per busy page | set, add, move (across parents), remove, verb |
| Table (2,000 rows) | yes | unique per file | 50–500 cell edits | 10–50k | set, **bulk add**, move, remove |
| Board | no (a view) or inline | the source's | 0 (a move is a `set state`) | 0 | set; move only for hand-made lanes |
| Graph | yes | unique per file | 20–100 | 5–20k | add, remove (edges), set |
| Timeline | usually a view | the source's | 0 if computed | 0 | — |
| Form + responses | form: code · responses: yes | response id made once | 1–50 submits | 1k–100k | add (one per submit) |
| User / profile | yes | name | <5 | <1k | set, add/remove refs |
| Team | yes | slug | <5 | <500 | add/remove member, set role |
| Topic chat | yes | unique per file | *m* chat ~280 (voice session, real messages) | 100k+ → roll monthly | add, set (edit), react verb |
| Channel | yes, monthly roll | unique per file | same as chat | same | add, set, verb |
| Comments (Thread) | sidecar `comments.jsonl` per root | unique per file | *m* rare: 22 notes in 5,655 page logs | <1k per root | add, set (resolve) |
| Doc with sections | inline (it is `page.content`) | unique per file | *m* tab page log 35 | ~5k | set (whole block text), add, move |

## 3. What they all share (the base, smallest set)

| # | Base feature | Who needs it | Today |
|---|---|---|---|
| 1 | **Ids unique per file + a live `id → item` index** that can also say "not here" | all | missing: `List.find` is a scan (`core/List/List.js:112`), `Item.find` walks the whole tree (`core/Item/Item.js:240`) |
| 2 | **One `Ref` shape resolved in the browser too** | editor pages, channels, boards, comments, users | node only (`Task.resolver`, `core/Task/Task.js:454`) |
| 3 | **`items` on demand** for any Item, and named typed Lists (`of`) | all containers | only `Task.tasks` (`Task.js:70-71`); `of` works (`Item.js:307,330`) |
| 4 | **The hop names its list** (`{"layers":{"L7":…}}`) | moves, history, permissions | ids only (`Store.js` `hops`) |
| 5 | **Sidecar snapshot + equality gate** | editor, table, chat | missing (streaming §8) |
| 6 | **Roll a file by rename** (`continues` line) | channel, chat, busy editor page | missing |
| 7 | **An ephemeral channel**: cursors, selection, drag, "typing…" go over the socket and never to disk | editor, chat | missing: the socket only tails files |
| 8 | **Bulk add in one line** | table import, editor paste | refused (the item tool takes no array) |
| 9 | **Undo as inverse deltas**, written forward | editor, table, doc | editor snapshots the whole document per act (`ext/editor/History.js:19-24`) |
| 10 | **A write check at the one writer** (identity from the connection) | users, teams, channels, comments | everyone is `owner` on loopback (`Servex/Servex.js:678-683`) |

## 4. Pick three to prove the base, in order

1. **The editor's layer tree.** It needs features 1, 3, 4, 5, 7 and 9 at once: deep ids, moves across parents, one layer's history, undo, mouse-rate discipline, and size. `ext/editor` already exists, saving the owner's older way (one whole JSON per change), so porting it also proves the store is swappable.
2. **A topic with channels (and comments as a Thread).** It needs 2, 6, 7 and 10: references across files in the browser, a file that grows without end, "typing…", and who may post. It reuses the session's `Chat`, so it is cheap once the session chat is built.
3. **A table.** It needs 1, 8 and the flat-list scale: thousands of members in one List (replay is quadratic past ~4,000 today), bulk import, and the code-made/UI-made split (columns declared, rows logged). `ext/DataGrid` already draws 2,000 rows.

If the order must follow cost instead of proof: the channel first (it rides on the session chat being designed now), then the table, then the editor.
