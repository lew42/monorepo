# Design decisions, 2026-10-27: chat spine, ownership, deltas, snapshots

What the owner and the voice agent settled after [system-proposal.md](system-proposal.md) and [chat-architectures.md](chat-architectures.md) were written. Nothing here is built; this is the record for whoever builds it. **DECIDED** = the owner said so. **LEANING** = the owner's strong direction, not final. **OPEN** = a question with no answer yet. Code claims were re-checked against the files on 2026-10-27 and cite lines (they drift; grep the name if a line is off).

## 1. The chat is one stored list, "the chat is the spine" (DECIDED; reverses the recommendation in chat-architectures.md)

- The chat is ONE stored, ordered list (`chat-architectures.md`, Option B). The view loops over the array and draws each entry's child node. **No computed time-merge** of several lists: the owner fears jumping or reordering glitches.
- Sentences, cards and tasks live in their own lists. They appear in the chat only through an entry that references them.
- Rule: Servex appends the chat entry in the **same write** that creates the sentence, so nothing exists without showing.
- Bias toward simplicity (DECIDED): build sentences and the chat first; add cards and tasks to it later.
- Supersedes: Option A (lists plus a derived chat) in `chat-architectures.md`, and any place in `system-proposal.md` that says the chat is merged or derived.

## 2. Names (DECIDED earlier, restated)

`AISession`, `AITask`, `AITaskPage`, `VoiceAssistant`; anything in `framework/ai` may be AI-prefixed. `Sentence` (not Prompt) is one raw unit; `Card` (not Section) is the refined grouping. No `Paragraph` class (only `PageParagraph` exists). `Turn` / `t14` ids are rejected (there is no Turn class).

## 3. Ownership, adopt, references (LEANING strongly)

- Every item has exactly one owner (its parent).
- `List.add` / `set` of an item **with no parent** ADOPTS it: set the parent, write the full item, once.
- Of an item **that already has a parent**: write a REF line `{add:{ref:id}}` and put the same object in memory. Only adopt sets `parent`.
- Only the owner's path emits change deltas. A list that merely references an item never emits for it, so no duplicate deltas.
- A move is explicit: re-parent plus one move line.
- On replay a ref resolves through the session's (or page's) id index; the log is append-only, so the original always comes first. A missing target draws a visible "gone" row.
- The owner's word is the "adopt" method. The code already makes `parent` the owning Item, not the List (`List.js:77-79`); keep that.

## 4. First delta and deep deltas (DECIDED shape)

- `new Item()` emits nothing until it has a home. The first delta is written at adopt time: `{type, ...own properties only, no defaults}` (what `JSON.stringify` of the own properties gives; constructor config goes in through `assign`).
- After that every change is a small delta that bubbles up the parent chain, each level prepending its key, until it reaches a **root that has a file** (a page or a session). Only roots need a filename.
- An item may instead have its own `.jsonl` (tasks do); then the parent's store skips it.

## 5. Snapshots come back as compaction (DECIDED direction)

- Deltas stay the streaming record. The root periodically writes one **snapshot line** of its whole state; replay starts from the latest snapshot. This recovers the simplicity of the owner's old system (set, change event, debounced save, full JSON rewrite).
- Class-declared lists (`session.tasks`) and arbitrary content lists are one thing: a List of Items at a path. Plain data is wrapped in a basic Item.
- Caveat to design for (OPEN): see "Where this meets the code", item 3.

## 6. What works today and the gap (verified against the code)

Working, with tests:

| Capability | Code | Test |
|---|---|---|
| Deep deltas through the parent into the root file | `Store.js:128-131` (attach), `:148` (`line_for`), `:273-293` (`hops`) | `Item.test.mjs:68-88` |
| `List.add` sets the parent | `List.js:77-80` (`adopt`), `:155-172` (`insert`) | `Item.test.mjs:81` |
| Replay by registered type | `Item.js:303` (`hydrate`), `:338` (`register`), `:349-355` (`replay`) | `Item.test.mjs:88` |
| An item's own file | `Store.js:263-267` (`owned_below`) | `Item.test.mjs:48-65`, `Store.test.mjs` |
| The move delta (also across lists) | `List.js:246-267`, `Store.js:241-261` (`address`) | `Store.test.mjs:36` |

Not working:

- `page.set("key", someItem)` stores a snapshot only: no adopt, later changes not logged (`Item.js:146-159` `set_one`; asserted as "known gap" at `Item.test.mjs:91-103`). This is the owner's arbitrary-property case and is already marked as next.
- No adopt-or-ref rule: `List.adopt` always overwrites `parent` (`List.js:77-79`).
- No compaction snapshot (no snapshot line type in `Store.js` or `Item.js`).

Read first: [core/Item/doc/owner-2026-10-21-items-hold-items.md](/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md) (the target model) and its plan [core/Item/doc/next.md](/framework/core/Item/doc/next.md) (its line numbers were stale and are fixed 2026-10-27).

## 7. How is a new session.jsonl created? (answered from the code)

**Today it is node only; the browser cannot create one.**

- A session folder is made by the SessionStart hook, `TaskDirs`, or a spawn. `Servex/agents/Agents.js:1066` appends line 1 through `SessionRecord.start_file` (`Server/SessionRecord.mjs`); cloud voice sessions are made in `Servex/ext/remote/RemoteMCP.js:179-188`; `Sessions.session_path` (`Servex/agents/Sessions.js:694`) is the one place the path shape lives.
- A browser `Item.Store` writes through `POST /api/item` (`Store.js:184-186`, `:200-222`). The tool **refuses a dated session folder that is not on disk** ("a session folder is made only by the SessionStart hook, TaskDirs or a spawn", `Servex/agents/page_tools.js:103`). Off localhost the store writes nothing (`Store.js:174-180`, `:224-227`).
- The browser can only append to an existing session, and make a folder inside it with `pages.add` / `tasks.add`.

To generalize storage beyond Servex (the owner's wish: a session embedded in a parent's `page.jsonl`, or in its own file), these would have to change (OPEN, a proposal, not decided):

1. An **adopt that creates**: adopting a session-like item into a parent writes its first delta into the parent's file (section 4), or, if it asks for its own file, creates the folder plus line 1 through ONE node entry point that the browser reaches via `/api/item` (an `add` with `own_file: true`). Servex stays the only disk writer.
2. `page_tools.js:103` must accept "create" for that one verb while still refusing a typo'd path.
3. Session discovery (`AISession.scan`, the dated index) must also find embedded sessions, or an embedded one is invisible to the dashboard.

## 8. The fast seat (LEANING)

Pause it as a placer, keep the switch. Code writes sentences instantly and applies a default grouping rule; the smart seat batches and does grouping fixes, titles, tasks and replies. Measure cost for a day before deleting anything. (Background: [chat-architectures.md](chat-architectures.md), the fast-vs-smart latency numbers there are estimates, not measured.)

## 9. Still standing, carried forward (OPEN)

- Roles condensed to one file each, injected into the system prompt ([roles-proposal.md](roles-proposal.md)).
- Investigate the "helper" role ($941 of spend).
- Voice-assistant spend (the $844 vs $263 discrepancy in the system-map task).
- The lean-core-test rule: one `X.test.mjs` per class.
- Retire the pseudo-properties.
- Fold the ~60 tools into `item`.
- "Fewer Servex tools" as a token saving: this voice chat spent about 65% of its usage re-reading the tool list.

## Where this meets the code (found while writing this)

1. **Ref targets need session-unique ids; ids are only sibling-unique today** (`List.js:149-154`: "unique only among its SIBLINGS in this one list"). `hops` emits just the member id and `get()` finds it by scanning every list the owner has (`Item.js:161-170`, `List.js:116`). So a sentence, a card and a chat entry in one session must never share an id, or the ref (and today's deep delta) is ambiguous. Decide the id rule (e.g. a per-type prefix) before building refs.
2. **"The same write" is not atomic today.** `Store.flush` posts lines one at a time (`Store.js:200-222`), so sentence and chat entry are two POSTs and a crash between them leaves a sentence that never shows. Fix: send both as one delta ARRAY, one JSONL line (`Item.apply` accepts arrays, `Item.js:125`); whether the item tool's validator accepts an array line is unchecked.
3. **Compaction needs one writer.** Many writers append to a session file (the browser store, `Agents.js:1066`, `PromptLines.js`, hooks). A snapshot line computed from memory can miss a line appended during the compute. Safe form: the snapshot is appended (never a rewrite), written only by Servex, which is the single writer that knows the file order; old lines stay.
4. **Browser cannot create a session** (section 7), so "storage generalized beyond Servex" is a node-entry-point change, not a browser change.
