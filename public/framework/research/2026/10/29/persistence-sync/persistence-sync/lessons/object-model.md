# Lessons: objects whose changes become deltas

Owner: lessons-model agent. Status: complete, 2026-10-30. Test specs are in §12.

**What this page is.** Mike's framework turns object changes into JSONL lines. An `Item` changes, the change bubbles up to `item.store`, and the store appends one line. On load, the lines replay. This page reads the source of four libraries that do the same job (Colyseus Schema, the tldraw store, mobx-keystone, Loro) and says what `Item`, `List` and `Store` should take from each.

**How it was checked.** Every claim about lew42 was run against his real code in node, as small scripts in the scratchpad that import `Item.js`, `List.js` and `Store.js` unchanged. Every claim about the libraries links to the exact lines at a pinned commit.

Pinned commits:

- lew42: `lew42/monorepo` @ `9ba46ee8` (branch `integration/data-shapes-2`)
- Colyseus Schema: `colyseus/schema` @ `390cf383`
- tldraw: `tldraw/tldraw` @ `38e6c84d`
- mobx-keystone: `xaviergonz/mobx-keystone` @ `c291c74e`
- Loro: `loro-dev/loro` @ `75e4bf2b`
- Backbone: `jashkenas/backbone` @ `94260d91`

Sections:

1. Short answer
2. lew42 today, and six gaps found by running it
3. Colyseus Schema
4. tldraw store
5. mobx-keystone
6. Loro
7. Naming precedent: Backbone and Knockout
8. The seven questions, answered side by side
9. Top recommendations (ranked)
10. Proposed delta op vocabulary
11. Naming suggestions
12. Test specs, one per recommendation

---

## 1. Short answer

Mike's design is already close to the best of these. Like mobx-keystone, a change bubbles up and gains one name per level. Like Colyseus, verbs name members by id, never by index. Like Loro, `move` is a first-class op. Keep all of that.

What the four libraries do and lew42 does not:

1. **Every change says where it came from.** tldraw tags each change `user` or `remote`; Loro tags each event batch `local`, `import` or `checkout`. Code that reacts to a change checks the tag before it writes. In lew42, the only tag is a flag (`store.replaying`) that is cleared before the code reacting to the change runs. So a replayed line can make two tabs write the same new line (gap 1).
2. **One action becomes one delta group.** tldraw's `atomic()` and keystone's action middleware gather every change an action makes. lew42 writes one line per key: `set({a, b, c})` is three lines and `task.wait()` is seven. The real logs show it happening (gap 2).
3. **An add carries the whole new thing.** Colyseus sends the full new structure on ADD; tldraw's `added` holds the full record; keystone's `add` patch holds a snapshot. lew42's `add` line drops the child lists, so a replay loses them (gap 3).
4. **Deleting a field is its own op.** Colyseus has `DELETE`, keystone has `remove`, tldraw sync has `delete`. lew42 has none: clearing a field writes an empty `{"set":{}}` and a replay keeps the old value (gap 4).
5. **Every op can be inverted.** tldraw stores `[from, to]` and keystone stores inverse patches. lew42's `remove` stores only the id, so nothing can undo it from the log. This matters only if Mike wants undo or an audit view from the log.
6. **The schema is versioned.** tldraw stamps each document with a version per migration sequence. lew42 has no version on a file, and an unknown verb is silently stored as data (gap 6).

The top items are cheap: a `source` tag on the delta event, a `batch()` around a verb, an envelope-shaped `add`, and an `unset` op.

---

## 2. lew42 today, and six gaps found by running it

### How a change becomes a line (today)

1. `item.set({k: v})` calls `apply()`, then `set_one()` for each key. A key that names a method calls it. A key that names a child hands the rest down. Anything else is data: `put()`, then `emit("change")` and `emit("delta", {set:{k:v}}, this)`. [Item.js#L155-L193](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L155-L193)
2. List verbs `add`, `remove`, `move`, `order` and `clear` call `announce(verb, payload)`, which emits `delta` with the list as the origin. [List.js#L264-L269](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L264-L269)
3. `Events.emit` bubbles every event up through `.parent`. [Events.js#L23-L27](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Events/Events.js#L23-L27)
4. `Store.attach` listens for `delta` on the root. If the store is not replaying or muted, it wraps the line in one name per level (`hops` + `wrap`) and appends it. A microtask later, the whole tick's lines are written in one call. [Store.js#L135-L178](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L135-L178), [hops L252-L285](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L252-L285)
5. Replay is the same `set()`, one `get()` per name: `{"items":{"k1":{"set":{"n":2}}}}`.

The result is a nested path of names (`items` → `k1`), with ids rather than indexes at the list levels. That is the right shape. In the comparison, it sits between keystone (array paths that include indexes) and tldraw (a flat id with no path at all).

### The gaps, each one reproduced in node

| # | What breaks | Proof (node, his code unchanged) | Cause |
|---|---|---|---|
| 1 | **A replayed line makes the reader write.** Two tabs both tail one forward line, and both write the same Ref re-path line. Two tabs tail a child task's `complete`, and both write the parent's auto-complete (three lines each, with different `ran_ms`). | Ref: both tabs wrote `{"pins":{"r1":{"set":{"path":"done.c1"}}}}`. Task: both wrote `completed_at`, `ran_ms`, `state`. | `replaying` is cleared before the `read` event fires ([Store.js#L108-L119](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L108-L119)); `Ref.settle` calls `set()` ([Ref.js#L51](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Ref.js#L51)); `Task.child_changed` calls `complete()` ([Task.js#L100-L104](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Task/Task.js#L100-L104)) |
| 2 | **One call becomes many lines.** `task.set({waiting_on, ran_ms, state})` writes 3 lines; `task.wait({on, what})` writes 7. | 3 and 7 lines in node. Real logs: 4 session files hold `wait()` split into 5 lines, ~600 ms apart (e.g. `core/Page/tasks/page-mastermind/item-tool/session.jsonl` lines 52–56). | `set_one` emits once per key ([Item.js#L189-L192](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L189-L192)) |
| 3 | **`add` drops child lists.** Adding a `Prompt` that already has paragraphs writes no paragraphs. | Live: 1 paragraph. Replayed: 0. | `add` announces `{id, type, after, ...made.data}`: data only, no lists ([List.js#L280-L286](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L280-L286)) |
| 4 | **Clearing a field does not replay.** `set({color: undefined})` writes `{"set":{}}`. | Live: `undefined`. Replayed: `"red"`. | `JSON.stringify` drops `undefined`; there is no unset op |
| 5 | **A data field named `after` is lost; one named `type` changes meaning.** | `add({data:{after:"lunch"}})` replays with no `after`, and `after` is read as a position. `data.type:"bug"` is read as a class name ("unknown type"). | The flat add payload mixes list metadata with data ([List.js#L281-L286](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L281-L286); `hydrate` drops `after`, [Item.js#L430](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L430)) |
| 6 | **An unknown verb becomes data, silently.** A line `{"items":{"k1":{"archive":{…}}}}` from a newer writer is stored as a field `archive`; `{"items":{"reorder_by":"title"}}` becomes list data. | No warning. | The last rule of `set_one` treats any unknown key as data |

Also observed (not ranked as gaps):

- **A stale move.** Tab A removes `a` while tab B moves `d` "after a". In B, `d` goes first; in A and in a fresh replay, `d` goes last. Tab B differs from the file until reload. [List.js#L212-L219](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L212-L219) (a missing anchor appends). Loro and tldraw avoid this with positions that do not depend on a neighbour (see §6).
- **A stale edit after a cross-list move.** Tab A moves `c1` from `todo` to `done`. Tab B, not yet caught up, renames `c1`. B writes `{"todo":{"c1":{"set":…}}}`. Every reader then stores it as a field named `c1` on the `todo` list, and the rename is lost. Addressing by an id that never changes (tldraw, Colyseus refId) would not lose it.
- `List.replace` and `List.insert` are quiet by design. That is right for loading, but `replace` has no announced form, so a live swap cannot be written (Session and Task call it only during replay today).

---

## 3. Colyseus Schema

**What it is.** The state layer of the Colyseus multiplayer game server. You declare `Schema` classes with typed fields; the server mutates them, and each tick it encodes only what changed into a binary patch for each client. Clients decode the patch into the same classes and get `onAdd`, `onRemove`, `listen` and `onChange` callbacks.

**Key mechanism: a ChangeTree per instance, holding the latest op per field.** Each field gets a setter that records an op against the field's index. A second write in the same tick merges into the first: DELETE then ADD becomes `DELETE_AND_ADD`, and repeated ADDs stay one ADD. So only the latest value is sent.

```ts
// annotations.ts — the generated setter for a primitive field
if (value === previousValue) return;
if (value !== undefined && value !== null) {
  ctor[$track](this[$changes], fieldIndex, OPERATION.ADD);
} else if (previousValue !== undefined && previousValue !== null) {
  this[$changes].delete(fieldIndex);      // clearing a field is its own op
}
values[fieldIndex] = value;

// ChangeTree.record — merge with this tick's earlier op on the same field
if (prev === 0) put(index, op)
else if (prev === DELETE) put(index, DELETE_AND_ADD)
// else keep the existing ADD: only the latest value is encoded
```

Links:

- Setter: [annotations.ts#L401-L429](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/annotations.ts#L401-L429)
- Merge: [ChangeTree.ts#L439-L464](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/ChangeTree.ts#L439-L464)
- Op codes: [spec.ts#L7-L27](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoding/spec.ts#L7-L27): `ADD`, `REPLACE`, `DELETE`, `DELETE_AND_ADD`, plus `CLEAR`, `REVERSE`, `MOVE`, `MOVE_AND_ADD`, `DELETE_AND_MOVE`, `ADD_BY_REFID`, `DELETE_BY_REFID`

**Addressing: a flat refId, not a path.** Every Schema or collection instance gets a refId from a counter that only goes up and is never reused. [Root.ts#L31-L37](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/Root.ts#L31-L37), [assigned at L174-L189](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/Root.ts#L174-L189). The patch says "switch to refId N" and then lists field ops. The client never walks a path. [Encoder.ts#L91-L98](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/Encoder.ts#L91-L98)

**Lists.** `ArraySchema` records ops by position, with a separate set of move ops used while it reorders (`isMovingItems`). The setter picks `MOVE`, `MOVE_AND_ADD` or `DELETE_AND_MOVE` ([ArraySchema.ts#L41-L99](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/types/custom/ArraySchema.ts#L41-L99)). The authors are unsure about `sort()`: it writes `REPLACE` for every slot, with the comment "wouldn't OPERATION.MOVE make more sense here?" ([L676-L691](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/types/custom/ArraySchema.ts#L676-L691)).

**Pausing and filtering.** `untracked(fn)` and `pause()` stop recording ([ChangeTree.ts#L795-L803](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/ChangeTree.ts#L795-L803)). A `StateView` per client controls which subtrees are encoded for that client.

**Why it is done this way.** It runs at 20–60 Hz over a network. Sending only the latest value per field per tick is what keeps the bandwidth flat. Positions and refIds are small integers because every byte counts. Colyseus has no history at all: a late joiner gets a full snapshot, not a replay.

**Lesson for lew42.**

- **Adopt: a delete op for a field.** Colyseus treats "set to empty" as `DELETE`, separate from `ADD`. lew42 writes `{"set":{}}` and loses the clear (gap 4). Add `{"unset":["color"]}`.
- **Adapt: merge by key within one flush.** `Store.append` already gathers one microtask's lines ([Store.js#L173-L178](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L173-L178)). It could merge the `set`s for the same path into one line, the way Colyseus keeps the latest op per field. That fixes gap 2 for free. Keep the history, though: merge within a tick, never across ticks, because his log is the record and Colyseus has none.
- **Ignore: positional ops and integer refIds.** Mike's lines are read by people and agents, and ids survive concurrent edits better than positions. His by-id verbs are the right call for a log.
- **Ignore for now: per-client views.** Useful only when one server streams one tree to many clients with different rights. Revisit when the static site gets a live server.

---

## 4. tldraw store

**What it is.** `@tldraw/store` is the record database behind the tldraw canvas. Every shape, page and binding is a flat, immutable record keyed by a string id (`shape:abc`), held in signals (`@tldraw/state`) so reads are reactive. Every write produces a `RecordsDiff` (`added`, `updated` as `[from, to]`, `removed`), tagged with its source.

**Key mechanism 1: the diff holds both before and after, so it inverts in five lines.**

```ts
interface RecordsDiff<R> {
  added:   Record<Id, R>
  updated: Record<Id, [from: R, to: R]>
  removed: Record<Id, R>          // the whole record, not just its id
}
function reverseRecordsDiff(diff) {
  return { added: { ...diff.removed }, removed: { ...diff.added },
           updated: map(diff.updated, ([from, to]) => [to, from]) }
}
```

Links: [RecordsDiff.ts#L29-L36](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/RecordsDiff.ts#L29-L36), [reverse L80-L92](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/RecordsDiff.ts#L80-L92)

**Key mechanism 2: squashing.** Diffs fold together per id: add then remove cancels; add then update stays one add; update then update keeps the first `from` and the last `to`. [squash L253-L347](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/RecordsDiff.ts#L253-L347). Even inside one `put()`, a record set back to its starting value records nothing ([Store.ts#L683-L691](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/Store.ts#L683-L691)).

**Key mechanism 3: every change carries its source.**

```ts
type ChangeSource = 'user' | 'remote'
interface HistoryEntry { changes: RecordsDiff; source: ChangeSource }

mergeRemoteChanges(fn) { this.atomic(fn, true, /*isMergingRemoteChanges*/ true) }
// updateHistory(): source: this.isMergingRemoteChanges ? 'remote' : 'user'
// flush: adjacent entries are squashed only while their source is the same
store.listen(fn, { source: 'user', scope: 'document' })   // persistence listens to 'user' only
```

Links:

- [ChangeSource L77](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/Store.ts#L77)
- [HistoryEntry L117-L122](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/Store.ts#L117-L122)
- [updateHistory L603-L620](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/Store.ts#L603-L620)
- [mergeRemoteChanges L1080-L1094](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/Store.ts#L1080-L1094)
- [squash by source L1382-L1410](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/Store.ts#L1382-L1410)
- [listener filters L531-L566](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/Store.ts#L531-L566)

**The key detail for lew42.** When a remote change triggers a side-effect handler, whatever that handler writes is tagged `user`, not `remote`: "Whatever the after-handlers … changed in response to a remote operation is not itself remote" ([Store.ts#L1274-L1305](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/Store.ts#L1274-L1305)). Every handler also receives `source` as an argument, so it can choose not to write on a remote change ([StoreSideEffects.ts#L28](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/StoreSideEffects.ts#L28)). That is exactly the decision lew42's `Ref.settle` and `Task.child_changed` need to make, and today they cannot see the source.

**Key mechanism 4: batching and undo marks.** `atomic(fn)` runs inside a signals `transact()`, so a listener sees one squashed diff ([Store.ts#L1308-L1350](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/Store.ts#L1308-L1350)). The editor's `HistoryManager` listens only to `user` changes and builds a pending diff. A `mark(id)` closes one undo step; `undo()` reverses everything back to the last mark. `batch(fn, {history: 'ignore'})` keeps a change out of undo.

- [Listens to user changes only: HistoryManager.ts#L45-L67](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/editor/src/lib/editor/managers/HistoryManager/HistoryManager.ts#L45-L67)
- [batch L97-L126](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/editor/src/lib/editor/managers/HistoryManager/HistoryManager.ts#L97-L126)
- [mode to state L340-L344](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/editor/src/lib/editor/managers/HistoryManager/HistoryManager.ts#L340-L344)

**Scope tags.** Every record type has a `scope` (`document`, `session` or `presence`). Persistence saves only `document`; camera and selection never reach the file.

**Lists.** tldraw has no list type. Order is a field: `index: IndexKey`, a fractional-index string, plus `parentId` ([TLBaseShape.ts#L61-L76](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/tlschema/src/shapes/TLBaseShape.ts#L61-L76)). A move is just an update of `index` and `parentId`. `getIndexBetween('a0','a2')` gives `'a1'` ([reordering.ts#L104-L109](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/utils/src/lib/reordering.ts#L104-L109)).

**On the wire.** The sync layer turns `[from, to]` into a small patch: `put`, `patch`, `remove` per record and `put`, `delete`, `append`, `patch` per value. A string that only grew is sent as `append`. [diff.ts#L10-L160](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/diff.ts#L10-L160)

**Migrations.** A file stores `{schemaVersion: 2, sequences: {"com.tldraw.shape": 4, …}}`, and each migration has an id `sequence/version`, a scope (`record`, `store` or `storage`), `up`, and an optional `down`. Loading a file from a *newer* version fails with `TargetVersionTooNew` instead of guessing.

- [Migration type: migrate.ts#L195-L224](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/migrate.ts#L195-L224)
- [SerializedSchemaV2: StoreSchema.ts#L96-L101](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/StoreSchema.ts#L96-L101)
- [Too-new check: StoreSchema.ts#L553-L576](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/StoreSchema.ts#L553-L576)

**Signals and diffs side by side.** Records live in an `AtomMap`, so `store.get(id)` inside a computed subscribes to that record. Separately, `store.history` is an atom with a buffer of diffs ([Store.ts#L374-L376](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/Store.ts#L374-L376)). A reactor flushes accumulated diffs to listeners once per animation frame ([L508-L516](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/store/src/lib/Store.ts#L508-L516)). Reads use signals; writes go through listeners.

**Why it is done this way.** A canvas makes hundreds of tiny writes per drag. Squashing per source turns a drag into one diff per frame, and `[from, to]` makes undo and sync rebasing trivial. Flat ids mean a change can be applied without walking a tree. Scopes keep UI state out of documents.

**Lesson for lew42.**

- **Adopt: a source tag on every `delta`.** Pass it as an argument, `emit("delta", line, origin, {source})`, with `source` set to `"local"`, `"replay"` (loading the file) or `"remote"` (a tailed line from another writer). Side effects (`Ref.settle`, `Task.child_changed`) check it. This fixes gap 1. Today the only signal is `store.replaying`, which is cleared before the `read` event that `Ref.watch` and views listen to ([Store.js#L103-L121](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L103-L121)).
- **Adopt: `batch(fn)` that flushes one line per path.** It is the same idea as `atomic`, but lew42 does not need signals for it: a counter on `Store` (it already has `Store.muted`, [Store.js#L28](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L28)) and a merge in `flush`. `act()` already does half of this ([Item.js#L105-L113](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L105-L113)).
- **Adapt: before-values only where undo needs them.** Store the full record on `remove` (the "removed record" side of tldraw's diff) and the old `after` on `move`. Skip `[from, to]` on every `set`: Mike's undo is app-level by decision ([doc/architecture.md "Undo is not in Item"](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/architecture.md)), and the log already holds the previous `set` of each field.
- **Adapt: a version line.** One `{"schema": {"Item": 1, "Task": 3}}` per file (or on the snapshot line he is already planning), plus "refuse or warn on a verb newer than I know". This is the tldraw `sequences` idea without the machinery.
- **Ignore for now: flat records.** His nested-by-name path is easier to read in a log and is already built. Keep a stable id per item for cross-file Refs, which he already has.
- **Consider later: a `scope` on fields.** UI state (open, scroll, selection) should never reach a document's log. Today nothing in core marks it; a `static session_fields = [...]` list would do.

---

## 5. mobx-keystone

**What it is.** A MobX-based state tree with class models (`class Todo extends Model({...})`). Every mutation inside a model action produces JSON-Patch-like `add`, `remove` and `replace` patches with array paths, plus their inverse patches. It has snapshots, references by id, transactions and an undo middleware, and it has Yjs and Loro bindings.

**Key mechanism 1: patches bubble up, gaining one path segment per level.**

```ts
// emitPatch.ts — the same event goes to each ancestor, with the path prefixed per level
emitPatchForTarget(obj, patches, inversePatches, prefix=[])
let parentPath = fastGetParentPath(obj)
while (parentPath) {
  reversedPrefix.push(parentPath.path)          // "todos", then 3, then …
  emitPatchForTarget(parentPath.parent, patches, inversePatches, reversedPrefix)
  parentPath = fastGetParentPath(parentPath.parent)
}
// Patch = {op:"add"|"remove"|"replace", path:(string|number)[], value?}
```

Links: [emitPatch.ts#L309-L337](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/patch/emitPatch.ts#L309-L337), [Patch.ts#L1-L22](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/patch/Patch.ts#L1-L22). This is the same design as lew42's `Events.emit` bubbling plus `Store.hops`. The difference is that keystone builds the path as the event climbs, while lew42 rebuilds it from the root once, at the store.

**Key mechanism 2: every patch is born with its inverse.** An array splice records a forward and an inverse patch together. A remove's inverse is an `add` carrying the old snapshot. When as many items are added as removed, it writes remove-then-re-add rather than `replace`, because "we might end up in a situation where the same node might attempt to be temporarily twice inside the same tree (e.g. sorting)" ([tweakArray.ts#L313-L400](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/tweaker/tweakArray.ts#L313-L400)). So keystone has **no move op**; a sort is removes plus adds.

**Key mechanism 3: undo is one event per top-level action.** The undo middleware starts a recorder when an action begins and closes it when that same root action finishes. One event holds all its patches, its inverse patches, the action name and the target path. Nested actions join their parent's event. `withoutUndo(fn)` and `createGroup()` control what counts.

```ts
// undoMiddleware.ts — onFinish of the ROOT action context
const event = { type: "single", targetPath, actionName: ctx.actionName,
                patches, inversePatches }
manager.store._addUndo({ event, ... })
// undo():  applyPatches(root, event.inversePatches, /*reverse*/ true) inside withoutUndo
```

Links: [UndoSingleEvent L70-L93](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/actionMiddlewares/undoMiddleware.ts#L70-L93), [middleware L714-L828](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/actionMiddlewares/undoMiddleware.ts#L714-L828), [undo() L423-L446](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/actionMiddlewares/undoMiddleware.ts#L423-L446), [withoutUndo L846-L855](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/actionMiddlewares/undoMiddleware.ts#L846-L855)

**Key mechanism 4: a path plus the ids along it.** A serialized action call carries `targetPath` *and* `targetPathIds` (the model id at each step). Applying the call checks that the ids still match, so a path that now points at a different object is refused instead of silently hitting the wrong one.

- [ActionCall: applyAction.ts#L12-L40](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/action/applyAction.ts#L12-L40)
- [Id check: path.ts#L331-L361](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/parent/path.ts#L331-L361)

**References.** `Ref` is itself a model holding only `id`. `rootRef` resolves it by searching the shared root, with a cache ([Ref.ts#L12-L40](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/ref/Ref.ts#L12-L40), [rootRef.ts#L45-L80](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/ref/rootRef.ts#L45-L80)). That is lew42's `Ref`, except that keystone stores an id where lew42 stores a path. Because the reference holds only an id, a move needs no re-path.

**Moves in the Loro binding.** keystone adds a helper, `moveWithinArray(array, from, to)`, so that the Loro binding can emit a native Loro move instead of a remove and an add ([moveWithinArray.ts#L1-L60](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/mobx-keystone-loro/src/binding/moveWithinArray.ts#L1-L60)). That is direct evidence that a patch vocabulary without move was not enough once a CRDT was involved. The binding also tags its own commits with a unique origin string and skips its own echo ([bindLoroToMobxKeystone.ts#L85-L160](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/mobx-keystone-loro/src/binding/bindLoroToMobxKeystone.ts#L85-L160)).

**Snapshot versioning.** There is no migration system; `fromSnapshotProcessor` and `toSnapshotProcessor` on a model transform old snapshot shapes ([Model.ts#L220-L240](https://github.com/xaviergonz/mobx-keystone/blob/c291c74e7eb590dcb825716f8abd8d1ebb3fc0b5/packages/lib/src/model/Model.ts#L220-L240)).

**Why it is done this way.** JSON Patch is a standard, so patches can go anywhere. Inverse patches make undo generic. One undo event per root action matches what a user thinks of as one step.

**Lesson for lew42.**

- **Adopt: one group per root verb.** keystone's rule is "the outermost action owns the recorder; nested actions join it". That is the rule `Item.act()` and a `batch()` should follow. Then `Task.verdict()` calling `set()` calling five `set_one`s is one group, and one line per path. Today it is five lines (gap 2).
- **Adapt: ids beside the path, for safety.** lew42's line already uses ids at list levels (`{"todo":{"c1":…}}`). What it lacks is a refusal when the id is not where the path says (the stale-edit case in §2, where the rename became a field named `c1`). The cheap form: when a hop names a list and the id is not a member, warn and keep the line for inspection instead of storing it as data.
- **Adopt the idea, not the format: inverse info at write time.** A remove line that carries the removed item's envelope can be inverted later. Today `{"remove":"b"}` cannot.
- **Ignore: JSON Patch paths with indexes, and the dependency.** Index paths break under concurrent edits; his by-id names are better. keystone needs MobX and decorators, which clash with no-build ([notes/signals_reactivity_lists.md §5](../notes/signals_reactivity_lists.md)).

---

## 6. Loro

**What it is.** A CRDT library (Rust core, WASM and a pure-TypeScript port) with containers for text, list, movable list, map, tree and counter. Edits in a transaction are committed together; every commit fires one event batch, with a diff per container and the absolute path to it.

**Key mechanism 1: one event batch per commit, with who and why.**

```ts
interface LoroEventBatch {
  by: "local" | "import" | "checkout";   // made here / merged from a peer / time travel
  origin?: string;                       // a free tag set on commit; NOT persisted
  events: { target: ContainerID; path: (number|string|TreeID)[]; diff: Diff }[];
  from: Frontiers; to: Frontiers;        // the versions before and after
}
```

Links: [lib.rs#L7210-L7254](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L7210-L7254), [EventTriggerKind event.rs#L80-L87](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-internal/src/event.rs#L80-L87). "The `origin` will not be persisted, but the `message` will" ([lib.rs#L1204](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L1204)). The undo manager skips events whose origin matches `excludeOriginPrefixes` and merges steps within `mergeInterval` ([lib.rs#L5716-L5776](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L5716-L5776)).

**Key mechanism 2: a move is a real op, but the event is a delta.**

- **Movable list.** The stored op is `Move { from, to, elem_id }` ([list_op.rs#L20-L44](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-internal/src/container/list/list_op.rs#L20-L44)): the element keeps its identity, so concurrent moves do not duplicate it. The event a subscriber gets is still a retain, delete and insert delta (`Delta = {insert}|{delete}|{retain}`). Internally, an insert that came from a move is flagged `from_move` ([event.rs#L288-L298](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-internal/src/event.rs#L288-L298)). The docs say `mov` "avoids creating surplus values in the list, unlike a delete followed by an insert" ([lib.rs#L4764-L4775](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L4764-L4775)).
- **Tree.** Ops are `Create`, `Move` and `Delete`, each with a `parent` and a fractional-index `position` ([tree_op.rs#L17-L31](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-internal/src/container/tree/tree_op.rs#L17-L31)). Tree events *do* name the move, and they carry both the new and the old place: `{action:"move", target, parent, index, fractionalIndex, oldParent, oldIndex}` ([lib.rs#L7281-L7308](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L7281-L7308)). `enableFractionalIndex(jitter)` adds random digits so two peers inserting at the same spot do not collide ([lib.rs#L5525-L5545](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L5525-L5545)).

**Why it is done this way.** In a CRDT, "insert after X" fails when X is deleted concurrently, and "delete then insert" duplicates an item that two peers move at once. A fractional position (a string that sorts between its neighbours) and an element id that survives the move fix both. Event batches carry `by`, so a UI binding can skip its own echo and an undo manager can skip remote edits.

**Lesson for lew42.**

- **Adopt: `by: local | import`, as `source`.** This is the same lesson as tldraw's `ChangeSource`, from a second, independent library. Loro adds the useful extra of a free-form `origin` string for app tags ("ref-repath", "auto-complete"). Like Loro's origin, his tag should *not* be written into the line. The writer's stamp (`by`, `ts`) is already there.
- **Adapt: a move event with both the old and the new place.** Loro's tree move event names `oldParent` and `oldIndex` beside the new place. lew42's `move` line has `{id, after, from}`, where `from` is the old *list* but not the old *neighbour*. Adding `was: <old after>` makes the move invertible and lets a view animate from the right spot. It costs one field.
- **Consider: fractional positions for concurrent drags.** The stale-move case in §2 is the exact problem fractional indexing solves. Today Mike's tabs mostly re-read and agents mostly append, so this is low priority. If two people ever drag in one list at once, write `{"move":{"id":"d","pos":"a1V"}}` in place of `after`.
- **Ignore: Loro itself, for now.** A WASM dependency is heavy for a no-build static site, and every client would need the whole op log. If live multi-writer editing arrives, `mobx-keystone-loro` shows how a model layer binds to Loro.

---

## 7. Naming precedent: Backbone and Knockout

- **Backbone Collection** fires one `add` per model and then one `update` per call, with `options.changes = {added, removed, merged}` ([backbone.js#L1000-L1015](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1000-L1015)). `reset(models)` swaps everything and fires `reset` with `options.previousModels`, and no granular events ([L1022-L1035](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1022-L1035)). So granular events serve views, and the one `update` serves persistence and sync. That maps onto lew42's `change` (per key, for views) and a batched `delta` (per action, for the store).
- **Knockout `arrayChange`** records `{status: 'added'|'deleted', index, value, moved}`. A reorder is a delete plus an add, linked by `moved` ([notes §4](../notes/signals_reactivity_lists.md)). That is the same "delta plus a move flag" shape as Loro's `from_move`.

Both are precedent for the names `add`, `remove`, `reset` and `move`, and for one summary event per call.

---

## 8. The seven questions, answered side by side

| Question | Colyseus | tldraw | mobx-keystone | Loro | lew42 today | Suggestion |
|---|---|---|---|---|---|---|
| How a nested change is addressed | flat refId | flat record id | array path (with indexes), plus ids along it | container id + absolute path | nested names, ids at list levels | keep names; refuse a hop to a missing member instead of storing it as data |
| How a list move is written | `MOVE` op by position | update `index` (fractional) and `parentId` | none: remove + add | `Move{from,to,elem_id}`; event is a delta with `from_move`; tree event names old and new place | `{move:{id, after, from?}}` | keep; add `was` (old after) |
| One user action = one group | per tick, latest op per field | `atomic()` / `transact` | the root action owns the recorder | commit = one batch | per microtask, but one line per key | `batch(fn)` and a per-path merge in `flush` |
| Tag by origin | n/a (one writer) | `source: user/remote`; side effects get it | binding origin string | `by: local/import/checkout` + `origin` | `store.replaying` flag, cleared too early | `source` argument on every `delta` |
| Inverse ops for undo | none | `[from,to]`, `removed` holds the record | inverse patches | undo manager (op-based) | none in the log; editor snapshots | envelope on `remove`, `was` on `move` |
| Schema versioning | codegen'd schema, the server decides | `sequences` + migrations, refuse too-new | snapshot processors | binary format version | none; unknown verbs become data | a `schema` line + warn on an unknown verb |
| Signals (reads) and diffs (writes) | callbacks only | signals for reads, listeners for diffs | MobX observables for reads, patches for writes | events only | events only (`change`, `delta`, `read`) | keep events; add signals later only for derived views |

---

## 9. Top recommendations (ranked)

1. **Tag every `delta` with its source (`local`, `replay`, `remote`), and pass the tag to side effects.** From tldraw `ChangeSource` and Loro `by`. Fixes gap 1: two tabs write the same Ref re-path or the same parent completion.
2. **`batch(fn)`: one action writes one line per path.** From tldraw `atomic`, keystone root-action recording and Colyseus latest-op-per-field. Fixes gap 2: `wait()` is five lines in real logs today.
3. **`add` writes the envelope `{id, type, data, <lists>}`, with the position beside it.** From the Colyseus full-structure ADD and tldraw's full `added` record. Fixes gaps 3 and 5: lost paragraphs, and `after` or `type` as data names. Today's reader already replays this shape (checked in node), so only the writer changes.
4. **An `unset` op for removing a field.** From Colyseus `DELETE`, keystone `remove` and tldraw sync `delete`. Fixes gap 4.
5. **Warn (do not store as data) on an unknown verb or a missing member.** From the tldraw too-new refusal and the keystone id check. Fixes gap 6 and the stale-edit case.
6. **A `schema` stamp per file (class to version), and new verbs instead of changed ones.** From tldraw `sequences`. It is cheap now and expensive after the planned snapshot work.
7. **Make `remove` and `move` invertible: `remove` carries the envelope, `move` carries `was`.** From the tldraw `removed` record and the Loro tree `oldParent`/`oldIndex`. It enables log-based undo and an audit view later, and costs nothing now.
8. **Keep `move` and `order` first-class and by id.** From Loro `Move` and keystone-loro `moveWithinArray`, the evidence that remove + add was not enough. No change; just do not regress.
9. **Later, only if concurrent drags matter: fractional `pos` instead of `after`.** From tldraw `IndexKey` and the Loro tree. Fixes the stale-move case.

Recommendations 1 to 5 each come with a failing test spec in §12. Recommendations 6 to 9 are design choices, not bug fixes; §12 says why each has no failing test yet.

---

## 10. Proposed delta op vocabulary

The rule stays Mike's: **a line is nested names down to the target, then one verb**. Names are property or list names, then member ids. The verbs are below.

### Item verbs

| Op | Fields | Example | Notes |
|---|---|---|---|
| `set` | `{key: value, …}` | `{"set":{"title":"Weekly shop","count":2}}` | one line per item per batch, many keys |
| `unset` | `[key, …]` | `{"unset":["color"]}` | new; replaces `{"set":{"k":undefined}}` |
| `<verb>` | the verb's argument | `{"start":{}}`, `{"wait":{"on":"owner"}}` | a method call recorded as itself (`act`), as today |
| `moved_to` | `{url, path}` | `{"moved_to":{"url":"/s/b/","path":"tasks.x"}}` | the cross-file forward, as today |

### List verbs (always under the list's name)

| Op | Fields | Example |
|---|---|---|
| `add` | an envelope `{type?, id, data, <lists>}` plus `after` (or `pos`) | `{"cards":{"add":{"id":"c1","type":"Card","data":{"title":"Milk","after":"lunch"},"notes":[…],"after":null}}}` |
| `remove` | `id`, or `{id, was}` with `was` = the removed envelope | `{"cards":{"remove":{"id":"c1","was":{"id":"c1","data":{"title":"Milk"}}}}}` |
| `move` | `{id, after, from?, was?}`, where `was` is the old after | `{"done":{"move":{"id":"c1","after":null,"from":"todo","was":"c0"}}}` |
| `order` | `[ids]` | `{"cards":{"order":["c3","c1","c2"]}}` |
| `replace` | `{id, with: envelope}` | `{"cards":{"replace":{"id":"c1","with":{"id":"c1","type":"Task","data":{…}}}}}` |
| `clear` | `true` | `{"cards":{"clear":true}}` |
| `reset` | `[envelopes]` | `{"cards":{"reset":[{"id":"a","data":{}},{"id":"b","data":{}}]}}` |

Notes on the list verbs:

- **`add`, envelope form.** `after` stays outside `data`, so a data field named `after` or `type` is safe. Old flat lines still replay for one release. The reader already accepts this shape.
- **`remove`.** The bare-id form stays valid.
- **`replace`.** New, announced: a live class change ("task becomes project", [one-stream.md](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/one-stream.md)).
- **`reset`.** New: the whole contents in one line. Backbone's `reset`; useful for an agent rewriting a list.

### File-level lines

| Line | Example | Notes |
|---|---|---|
| schema | `{"schema":{"Item":1,"Task":3}}` | line 1, or on the snapshot line |
| batch marker (optional) | not needed | a batch flushes as one JSON array per tick through the existing Append RPC; each line stays self-contained |

**What stays out of the line.** The `source` tag (`local`, `replay` or `remote`) and Loro's `origin` are runtime only. Like Loro's origin, they are not persisted. The writer's stamp, `by` and `ts`, stays as today.

### The event, in memory

```js
// emitted by Item and List, heard by Store, views, Ref, Task
item.emit("delta", line, origin, { source: "local" | "replay" | "remote", tag?: "ref-repath" })
```

---

## 11. Naming suggestions

- **`source`**, not `origin`, for local, replay or remote. `origin` is already the name of the second `delta` argument (the node where the change happened) in `Store.attach`. tldraw uses `source` too.
- **`batch(fn)`** for grouping, on `Item` (delegating to its store). tldraw and Mike's own `core/new` API sketch both use `batch`. Do not reuse `act`, which records a verb.
- **`unset`** for removing a field, beside `set`. `delete` is taken by `Item.delete()`, and `remove` is the List verb.
- **`was`** for the before-value carried by `remove` and `move`. It is short and reads well in a log line: `{"move":{"id":"d","after":"b","was":"a"}}`.
- **`reset`** for "replace all members". `clear` stays "remove all".
- **`schema`** for the version line. tldraw calls it `schemaVersion` with `sequences`; one word is enough here.
- Keep **`add`, `remove`, `move`, `order`** and **`after`**. They match Backbone, Knockout and Loro.

---

## 12. Test specs, one per recommendation

All specs fit Mike's harness: a plain Node script using `core/Test/Test.js`, run with `node <file>`, like [Item/persistence.test.mjs](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/persistence.test.mjs). They reuse that file's real pieces:

- a real temp directory and a real `.jsonl` file per test;
- `DiskStore`: the real `Item.Store` with only `flush()` swapped to `fs.appendFileSync` and a `by`/`ts` stamp, exactly as persistence.test.mjs does ([L36-L47](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/persistence.test.mjs#L36-L47));
- `tab(file, make)`: a second reader that tails the same file by byte offset ([L62-L76](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/persistence.test.mjs#L62-L76)).

**What is mocked, and why.** Only `flush()`: in a browser it POSTs to Servex, and Servex is not running here. The clock is fixed, as in persistence.test.mjs. Nothing else is mocked.

Every "today" result below was observed by running his unchanged code in node (scripts in the scratchpad, `lessons-model/probe/`).

Suggested home: `public/framework/core/Item/delta-ops.test.mjs`, one `Test` per spec, so `node delta-ops.test.mjs` prints a PASS or FAIL line for each.

### T1. A replayed line never makes a reader write (rec. 1, source tag)

**Checks:** when tab B *reads* a line that tab A wrote, tab B appends nothing. The reaction that line causes (a Ref re-path, a parent's auto-complete) is written once, by the tab whose action caused it.

**Setup (real):** one temp `.jsonl`, two `tab()` readers on it, the real `Ref`, `Task` and `List`. Mocked: `flush()` only.

**Steps (case a, Ref):**

1. File lines: `{"todo":{"add":{"id":"c1"}}}`, `{"pins":{"add":{"id":"r1","type":"Ref","path":"todo.c1"}}}`, `{"done":{"add":{"id":"c1"}}}`.
2. Open tab A and tab B; `await r1.resolve()` in each.
3. A third writer (the item tool's handoff) appends `{"todo":{"c1":{"set":{"moved_to":{"url":"","path":"done.c1"}}}}}`.
4. Both tabs `pull()`; wait two ticks.

**Steps (case b, Task):**

1. Parent task `p`, running, with child `c1` in its own file (`_own_file`, its own store attached, the way `Task.from_ref` and `open_ref` wire it).
2. Both tabs tail the child's file: `{"start":{}}`, `{"complete":{"auto":true}}`.

**Expected:** case a, the file gains **at most one** `{"pins":{"r1":{"set":{"path":"done.c1"}}}}`, and ideally zero, because the writer of the forward owns the re-path. Case b, the parent file gains **one** completion group (or none, if the agent's own process writes it), never one per open tab.

**Today:** case a, *both* tabs append the re-path line (2 identical lines). Case b, both tabs append `completed_at`, `ran_ms` and `state` (6 lines, with different `ran_ms`). Causes:

- `replaying` is reset before the `read` event ([Store.js#L108-L119](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L108-L119)).
- `Ref.watch` re-settles on `read` and calls `set()` ([Ref.js#L51](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Ref.js#L51), [L79-L84](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Ref.js#L79-L84)).
- `child_changed` calls `complete()` ([Task.js#L100-L104](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Task/Task.js#L100-L104)).

**Honesty check:**

- *Case a is real.* `move_item` writes exactly that forward ([doc/ref.md "Forwards"](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/ref.md)). Two tabs on one session page is normal. The one condition: the Ref must live *in the stored file*. Today's main Ref user (`SessionTasks`) keeps its Refs in memory, so the test must put the Ref in a list, as `Ref.test.mjs` already does ([L82-L105](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Ref.test.mjs#L82-L105)).
- *Case b is real in the browser.* A parent session page holds child tasks through `open_ref` and tails their files.
- *Edge cases:* an echo of A's own line must still be skipped (`skip_echo`); a reaction to a `local` change must still be written; a `replay` at load time must write nothing.

### T2. One call writes one line per item (rec. 2, batch)

**Checks:** `task.wait({on, what})`, `task.set({a, b, c})` and `verdict()` each append **one** line for that item.

**Setup (real):** a temp file, `DiskStore`, a real `Task` replayed from `[{"id":"t1"},{"start":{}}]`. Mocked: `flush()`.

**Steps:**

1. Call `t.wait({on: "owner", what: "the merge"})` directly (not through `act`); tick.
2. Call `t.set({state: "complete", ran_ms: 5, waiting_on: null})`; tick.
3. Read the new lines, then replay the file into a fresh Task.

**Expected:** step 1 adds 1 line, `{"set":{"state":"waiting","waiting_on":"owner","waiting_what":"…","waiting_since":"…","ran_ms":…}}`; step 2 adds 1 line; the fresh replay equals the live task.

**Today:** step 1 writes 7 lines, one per key, including `deferred:null` and `decide_by:null`; step 2 writes 3 lines (both observed). The real logs hold `wait()` split into 5 lines in 4 session files (e.g. `core/Page/tasks/page-mastermind/item-tool/session.jsonl` lines 52–56, `by:"owner"`, 600 ms apart). Cause: `set_one` emits once per key ([Item.js#L148-L151](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L148-L151), [L189-L192](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L189-L192)).

**Honesty check:**

- *Real.* The 4 split `wait()` calls are in committed logs. `Task.verdict`, `stop` and `complete` all call multi-key `set()` ([Task.js#L373-L391](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Task/Task.js#L373-L391)).
- *Through the button path it is hidden.* `act()` mutes the store and records the verb, so the test must call the verb directly, as node code and the item tool's `live_root` do.
- *Do not weaken it:* the merged line must still replay identically. Also cover two different items changed in one batch (two lines, not merged across paths) and a `set` then an `unset` of the same key in one batch (the last one wins).

### T3. An added item replays with its child lists (rec. 3, envelope add)

**Checks:** `list.add(item)` of an item that already has members in its own lists replays with the same members.

**Setup (real):** temp file, `DiskStore`, a real `Session` root, a real `Prompt` (its `paragraphs` list is typed). Mocked: `flush()`.

**Steps:**

1. `p = Prompt.hydrate({type:"Prompt", id:"p1", raw:["hello there."], paragraphs:[{id:"g1", text:"hello there."}]})`.
2. `session.tasks.add(p)`; tick.
3. Replay the file with `Session.replay`.

**Expected:** the replayed `p1` has 1 paragraph, and the file's `add` line holds `paragraphs: [...]`.

**Today:** the line is `{"tasks":{"add":{"id":"p1","type":"Prompt","after":null,"raw":[…]}}}`. Live there is 1 paragraph; replayed there are 0 (observed). Cause: `add` announces `...made.data` only ([List.js#L280-L286](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L280-L286)). By contrast, `set(prop, item)` writes the full `toJSON()` envelope and replays fine.

**Honesty check:**

- *Real.* 1,088 committed `add` lines carry a Prompt's paragraphs, so some writer (the item tool, `PromptsToSession`) already sends this shape. Today they are written in node, not through `List.add`.
- *Where it bites.* A browser that adds a populated item (a paste, a duplicate, a Prompt refined client-side) loses its lists. I found no browser caller doing that *today*, so this is a trap for the next feature, not a live bug. The test stays: it is a real API path (`List.add(item)` is the documented way to add an Item).
- *Edge cases:* a member list holding a `Ref`; a typed list (`Prompt.paragraphs`) whose setter ignores plain arrays ([Prompt.js#L72-L73](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Task/Prompt.js#L72-L73)).

### T4. Data named `after` or `type` survives an add (rec. 3)

**Checks:** a data field whose name is list metadata round-trips.

**Setup (real):** as T3, with a plain `Item` root and a `List` named `items`.

**Steps:** `items.add({id:"k2", data:{after:"lunch", type:"bug", title:"T"}})`; tick; replay.

**Expected:** replayed `k2.get("after") === "lunch"` and `k2.get_one("type") === "bug"`, with no "unknown type" warning. The member's position is unchanged.

**Today:** `after` is gone after replay, and it was read as a position (`"lunch"` is no member, so the member is appended). `type` is read as a class name and warns "unknown type 'bug'". Causes: `hydrate` drops `after` ([Item.js#L430](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L430)), and the flat payload spreads data beside `id`, `type` and `after` ([List.js#L281-L286](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L281-L286)).

**Honesty check:**

- *Possible but unseen.* No class in core declares a field named `type` or `after`, and no committed log has one. `type` is an ordinary word for a card or a bug, so it will happen.
- *Keep it, but rank it below T3*, because the same fix (an envelope add) closes both.
- *Already verified:* today's reader replays an envelope add correctly (class, `after`, `type` and child lists all survive), so the fix is writer-only.

### T5. Clearing a field replays (rec. 4, unset)

**Checks:** after `item.set({color: undefined})` (or `item.unset("color")`), a replay has no `color`.

**Setup (real):** temp file, `DiskStore`, a plain `Item`.

**Steps:** `set({color:"red"})`; tick; clear the field; tick; replay.

**Expected:** the file's last line is `{"unset":["color"]}`; the replay has `get("color") === undefined`.

**Today:** the last line is `{"set":{}}`; live it is `undefined`, but replayed it is `"red"` (observed). Cause: `JSON.stringify` drops `undefined` from `{set:{color:undefined}}` ([Item.js#L191](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L191)).

**Honesty check:**

- *Rare today.* No committed log has an empty `{"set":{}}`, and no stored-item code calls `set({k: undefined})`. Code that clears a field uses `null` (139 lines), which round-trips. `Panel` deletes `data[k]` directly, which is never logged at all ([split.js#L63](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/Panel/split.js#L63)), but Panel saves through a whole-document Saver, not the log.
- *Rework rather than drop:* make the test about the API Mike would need for "reset to default". That means `unset(key)` writes a line that replays, plus `set({k: undefined})` either becomes an unset or warns. Without it, the next "reset" button on a logged item silently fails on reload.
- *Edge case:* an unset of a key that was never set writes nothing.

### T6. A line that cannot land warns, and is not stored as data (rec. 5)

**Checks:** (a) a verb this class does not have, and (b) a hop to a list member that is not there, are both reported, and neither is stored as a data field.

**Setup (real):** two `tab()`s on one temp file, a `Board` with lists `todo` and `done` (the persistence.test.mjs shape). Mocked: `flush()`.

**Steps:**

- **(b) stale edit:** tab A moves `c1` from `todo` to `done`; tab B, not yet caught up, does `todo.find("c1").set({title:"renamed"})`; both `pull()`; then replay fresh.
- **(a) unknown verb:** append `{"todo":{"c1":{"archive":{"reason":"old"}}}}` by hand (a newer writer's verb); replay.

**Expected:**

- (b) the replay warns "no member c1 in todo" and does not create `todo.data.c1`. Ideally it resolves `c1` by id and applies the rename, as a stable-id design would.
- (a) the replay warns "unknown verb archive", and `c1.data.archive` stays unset (or is kept in a visible "unread lines" list).

**Today:**

- (b) Tab A and a fresh replay hold `todo.data = {"c1":{"set":{"title":"renamed"}}}`, and `c1` keeps its old title. Only tab B shows the rename (observed).
- (a) `c1.data.archive = {reason:"old"}` with no warning (observed). Cause: the last branch of `set_one` treats any unknown key as data ([Item.js#L186-L192](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L186-L192)).
- The item tool's own check refuses only lines that *throw* during replay ([page_tools.js#L796-L800](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L796-L800)), so neither is caught at the door.

**Honesty check:**

- *(b) is real:* a drag in one tab and an edit in another within the tail delay (about 250 ms) is a normal two-tab race. It is rare with one person, common with an agent and a person.
- *(a) is real:* the moment one branch adds a verb and an older checkout's tab or node reads the log.
- *Constraint:* the warning must not break the "plain key is data" rule for genuine new fields. Only a key whose value is a *verb-shaped object* at a list hop, or a hop under a List that is not a member, should warn.

### Recommendations 6 to 9: no failing test, on purpose

- **6 (schema stamp).** Nothing fails today, because there is one writer version. The honest test is a contract test once a second version exists: open a file whose `schema.Task` is higher than the code's, and expect a warning plus read-only mode. Writing it now would mean inventing a version, so it is deferred.
- **7 (invertible remove and move).** A missing feature, not a bug. The test arrives with undo: "undo of `remove` restores the item with its data and position from the log alone".
- **8 (keep move first-class).** Already covered by `persistence.test.mjs` (move cells). No new test.
- **9 (fractional positions).** The stale-move race is real and reproduced: tab B shows `d,b,c` while the file says `b,c,d` until reload. But the fix is a format change, so the test belongs with that decision. Spec for then: two tabs, A removes `a`, B moves `d` after `a`; expect both tabs and a fresh replay to agree on one order.
