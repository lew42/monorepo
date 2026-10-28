# Notes: the delta path, both ways (seat g, asks 21 and 31)

**The short answer.** The path works and is already simple. An item's only link to its file is `parent`. A change climbs `parent` to the one root that has a store, and becomes one nested line. Every reader replays it with the same `set()`. [demo-delta-flow.mjs](demo-delta-flow.mjs) proves it in node with the real classes: a UI change, an agent's change and a hook's raw line all reach a second tab, which agrees with the first, and a fresh replay rebuilds an equal tree (**PASS**, 13 checks).

**Where it isn't rock solid** is the edges: how a container comes to exist (a List that code didn't build), how a hop is named (the writer drops the list name), and `set` with an Item or List as the value. Eleven breaks are listed in §2; the demo re-proves ten of them every run ("still true").

The walk, hop by hop: [delta-flow.md](delta-flow.md). One page: [shape.md](shape.md). Line numbers are at `a2b9d4f47`.

## 1. What holds (proved by the demo, Part 1)

- **One link, `parent`, set in one place** (`List.adopt`, `core/List/List.js:77-80`). Add, insert, move and hydrate all go through it. A member's parent is the owner Item, so an event skips the List and climbs Item to Item (demo: `heard at: n1 → c1 → root`).
- **One recorder per file**: `Store.attach` puts one listener on the root (`core/Item/Store.js:124-136`). No child knows its file.
- **One line per change, nested from the root** (`hops` + `wrap`, `Store.js:273-299`): `{"c1":{"notes":{"add":…}}}` two levels down.
- **One reader for every source**: `Store.read` → `replay_line` → `set` → `get`, hop by hop (`Store.js:97-110`, `Item.js:146-188`). A UI line, an agent's line and a hook's line are applied by the same code, and so is a fresh load.
- **The writer skips its own echo** (`Store.js:112-119`), and replay never writes back (`replaying`, `Store.js:102`, `:129`). In the demo, every line tab A wrote came back and was skipped, and tab B applied each one.
- **A torn line waits:** the tail cuts at the last newline (`Tail.js:62`). Half a hook line reached no tab; the rest of it reached both.
- **A cross-list move replays.** This had no test anywhere (seat a). The demo moves `n1` from `c1.notes` to `c2.notes`, and both the second tab and a fresh replay agree.
- **The reader already accepts a hop that names its list.** `{"cards":{"c1":{"set":…}}}` replays on a plain Item (`List.get` falls back to members, `List.js:116`), and `{"tasks":{"c3":{"start":{}}}}` replays on a Task and a Session (checked in node). So "the hop names its list" (decided in [ids-and-paths.md](../../ids-and-paths.md)) is **a writer-only change**: `Store.hops`, one line.

## 2. Where the path breaks or surprises, each with its fix in one line

B-numbers match the demo's Part 2 lines (B11 has no Part 2 line; Part 1's move shows it).

| # | Break | Evidence | Fix (one line) |
|---|---|---|---|
| B1 | **A List that code made on a click-made item is not rebuilt on replay.** The `{"c1":{"notes":{"add"}}}` line lands in `c1.data.notes`. Only `Task.tasks` is made on demand (`core/Task/Task.js:52-56`, `:71`). | demo B1 | Classes declare their lists, and Item makes each on first use with the `get` route and the `lists()` name (Task's pattern, once, in Item). |
| B2 | **The writer drops the list name,** so two lists with the same member id misroute on replay, silently. | demo B2; `Store.js:289-290`; seat (a) E2 | `hops` pushes `list.name` before `list.key(node)`; the reader already handles it. |
| B3 | **`set({x: item})` only snapshots:** no `parent`, its later changes are never written, and replay gives a plain object. | demo B3, B6 | A container is declared (B1's fix); `set` walks into it and refuses an Item or List value anywhere else, loudly. |
| B4 | **An Item held in a property, with `parent` set by hand, writes its changes flat onto the parent** (replay changes the parent's title). | demo B4; `Store.js:286-292` | `hops` names the property when the node isn't in a list (with B3's declared slots, it can look the name up). |
| B5 | **`by`/`ts` become data on a plain Item root.** Session and Task strip them; nothing else does. | demo B5; `Item.js:355`; `Session.js:78` | `Item.replay_line` strips `by`/`ts` into a clock, for every Item. |
| B6 | **`page.set("k", v)` throws on every Page** (`Cannot use 'in' operator…`): `Page.set` takes one object (`Page.class.js:74`), so Item's two-argument sugar is broken there. | demo B6 | `Page.set(a, b)` starts with Item's own `is_plain(a) ? a : {[a]: b}`. |
| B7 | **`page.pages` verbs write a line that doesn't replay:** `Page.get` routes `content` but not `pages` (`Page.class.js:120`), and `lists()` reports `_pages`. Nothing calls these verbs today (searched), so it waits to bite. | demo B7 | `Page.get` and `Page.lists` treat `pages` like `content` (or B1's declared lists make it automatic). |
| B8 | **A child page with no file of its own loses its changes:** a Page never bubbles (`Page.class.js:68`), and nothing else records it. Correct for pages with files; a trap for a page made in code at run time. | demo B8 | A page made by a click gets its folder first (the item tool's `pages.add` already does this); warn when a store-less page emits a delta. |
| B9 | **A page's store records `act()` twice:** `PageLogReader.attach` has no `Store.muted` or `owned_below` check (`core/Page/Reader.js:33-36`, vs `Store.js:129`), so a button verb writes its `set` lines and the verb. That's harmless for `rename`, but a verb that adds would add twice on replay. | demo B9 | `PageLogReader.attach` calls `super.attach` and keeps only its line-1 skip. |
| B10 | **The Panel's per-cell `items` word is already broken:** `set_item` (`ext/Panel/persist.js:61-63`) reads and writes `items` on a Panel, whose `items` is its member List (`Panel.js:22`). The click writes `{"k1":{"set":{"align":"center"}}}`, which overwrites the child panel's own `align`, and nothing is saved where `items_apply` (`:194-196`) reads it. | demo B10 | Rename the word's key to `cells` (`persist.js`, `properties.js:386`). |
| B11 | **A cross-list move's `from` is the old `/` path**, read by `locate()`, which is marked "compat only, one release" since 2026-10-03 (`Store.js:236-261`, `Item.js:190-206`, `List.js:249-253`). The compat code carries every cross-list move. | demo Part 1 (the move line) | Write `from` as the dotted path the owner decided on, walked by `get`; keep `locate` to read old lines. |

**Surprises that are not breaks** (each one is a code reading):
- **A line is turned into text at flush, a microtask after the change** (`Store.js:162-194`). A `set({x: item})` records the item as it is at flush time.
- **A dotted key only works through the item tool** (`expand_dots`, `page_tools.js:429`). `Item.set({"cards.c1": …})` stores a field named `"cards.c1"` (checked in node). If paths become dotted, `apply` should expand them, so every writer and reader agrees.
- **The echo skip compares exact text.** The item tool rewrites some lines before writing them: on a session, a `tasks.add` gets `type` and is reordered (`page_tools.js:1158`); an `add` with no id gets one (`stamp_ids`, `:196-207`). The writer tab then sees its own line as new. For an `add` of an existing id that's harmless (a no-op); for a verb it would run twice. *Read, not run.*
- **A UI content part can anchor `after` a code-made part** (`{"content":{"add":{"after":"content-code"}}}`, demo). If the page's code changes, the anchor misses and the part goes last. Harmless, but surprising.
- **Pages get no replay check in Servex.** The item tool has no `Page` loader, because "Page touches the DOM" (`page_tools.js:392-404`). But `Page.class.js` does load in node with `site-hooks.mjs` (`Page.test.mjs` and this demo both do it), so page lines could get the same `try_line` check as tasks.
- **Two more breaks the streaming and items seats proved** (not re-run here): `Tail.js` keeps one offset per file shared by every tab, so a tab can miss a line; and when Servex is slower than 5 s, the browser appends the line itself, which can write it twice (`Store.js:210-213`).

## 3. The clean rule for `set` with an Item or a List

Asked: would `page.set("pages", list)` or `page.set("x", item)` wire up persistence? **No**, in three ways: the two-argument form throws on a Page (B6); the object form stores a snapshot in `data` and adopts nothing (B3); and `page.pages` itself doesn't replay (B7).

**The rule I'd adopt:**
1. **Containers are declared by the class and made on first use.** That covers a List (`tasks`, `notes`, `pages`, `content`) and an Item slot (a single child, if one is ever needed). Item does the getter, the `get` route and the `lists()` name once, from a declaration such as `static lists = {notes: Note}`. That's the "light per-list schema" in [placement.md](../../placement.md). Code-made structure is then free: nobody writes `new List(...)` in a constructor, and replay finds every container whether or not code ran first.
2. **`set` never replaces a container.** A delta object walks into it, as today. An array, a List or an Item given to a declared container is refused with a warning naming the verb to use (`add`, `order`). On an undeclared key, an Item or List value is refused ("declare it"). Nothing becomes a silent snapshot.
3. **Adoption stays in one place:** a List verb, or the declared slot. Both set `parent`, so the item's changes reach the file by the path in delta-flow.md.
4. **Every hop is named:** a container by its property name, a member by its id. With rule 1, `hops` knows every name.

**The alternative**, and when it wins: let `set({x: item})` adopt and write `{"x":{"snapshot":{…}}}` (seat a's snapshot verb), so any key can hold an Item. That's more flexible, but it's a second way into the tree beside the List verbs, and a typo'd key silently makes a new container. It would win if items of unknown shape must be attached by agents at run time, and then only with the per-list schema checking what may go where.

## 4. The on-demand `items` footgun: the census

If Item gains `get items()` (a List made on first use; the owner's ask 16), these are the uses it meets. Counted by a script over 1,593 `.js`/`.mjs` and 1,477 `.jsonl` files in `public/framework/`, skipping dated session folders, `tasks/`, `legacy/`, `old/` and `audit/`. The script is in the seat's scratchpad; the classification is by hand.

| Use | Where | Count | What happens with a getter |
|---|---|---|---|
| **List's own member array** | `core/List/List.js` (23 uses), `core/Page/PageContent.js` (6) | 2 files | **Breaks everything:** `List extends Item`, so `this.items ??= []` (`List.js:57`) would read the getter, which builds a List, whose constructor reads the getter… The stack overflows on the first List. List must define its own `items` |
| **An Item subclass that gives itself an `items` List** | `ext/Panel/Panel.js:22`, `ext/editor/blocks.js:18`, `core/Item/page.js:11` (the Item demo card) | 3 | `this.items = new List(…)` throws in a class body ("only a getter") unless the getter comes with a setter, as `Task.tasks` does (`Task.js:56`) |
| **An `items` data word on an Item** | `ext/Panel/persist.js:61-63`, `:194-196`; `ext/Panel/properties.js:386` | 1 system | **Already broken today** (B10): it reads the member List. The getter would make the same mistake on every Item |
| **The duck type "is this a List?"** | `Item.js:18`, `Store.js:7` (`Array.isArray(node.items)`) | 2 | Every type check would build an empty List on the Item it checks (`lists()` checks every property of every item). Use a flag (`node.is_list`) first |
| **`toJSON` and `lists()`** | `Item.js:227-231`, `:266-270` | — | The getter's backing field (`_items`) would be saved under that name unless `lists()` renames it, as Task does (`Task.js:76-78`). `Page.pages` has exactly this bug now (`_pages`, B7) |
| **Saved JSON with an `items` array** | `Item.hydrate` (`Item.js:325-331`) | — | Fine: it assigns `item.items = List` through the setter |
| **`items:` passed to a View** (Concepts, Timeline, Disclosure, Menu, the Sortable `{items: list}` shim) | 38 files, 96 keys | — | Unaffected: these are not Items |
| **A `.jsonl` line with an `items` key** | 1,477 files | **0 lines** | Nothing on disk needs migrating |

**So:** before Item gets `items`, (1) List defines its own `items`; (2) `is_list` stops reading `.items`; (3) the getter comes with a setter and a `lists()` rename; (4) Panel's word moves to `cells`. Or better, use §3's rule 1: a class *declares* `items` when it wants one, so Panel, Block and the demo card each declare it, and List never sees a getter at all. The owner's "every item can hold items" then means "every class can declare it in one line", not "every object carries one". I'd recommend that; the alternative is a getter on every Item, which costs the four fixes above and a List on every item that's ever type-checked.

## 5. `page.pages` and `page.content` as they really persist

| What | Lines written | Why |
|---|---|---|
| A child page declared in code (`children:`) | 0 | Built by code on every load, inserted quietly (`Children.js:20-25`) |
| A child page created by an agent | 1 `{"file":"kid/page.jsonl"}` in the parent, and a new `kid/page.jsonl` | The item tool handles `pages` itself (`page_tools.js:1109`, `Subpages.js:42`); replay links a quiet stub (`Jsonl.js:61-70`, `:89-92`) |
| A child page's own edits | in its own file only | Pages don't bubble (`Page.class.js:68`) |
| Content drawn by the page's code | 0 | Transient (`PageContentItem.js:6`, `PageContent.js:27-31`, `:61`) |
| A content part added from the UI | 1 `{"content":{"add":…}}` | A loud verb; replay goes through `Page.set` → `content.fill` → `add` (`Page.class.js:81-84`) |
| A `page.pages` verb | 1 line, which replays as data | B7 |

So `page.content` persists both ways, at any depth inside a part, by the general path. `page.pages` persists only through the item tool's folder-and-`file`-line route, which is quiet on replay by design: a child page's existence is a file on disk, not an item in a list. That is two storage shapes for one list. The pages seat recommended one `pages` List with one reference shape; if that lands, B7's fix is the first step.

## 6. The owner's design directions, checked

- **"Adopting links the child's storage to the parent's"** (ask 21): **holds**. The link is `parent`, set only by adoption, in both the old Saver path and the new Store path (delta-flow.md §0). It fails only where adoption doesn't happen: `set` of an Item (B3) and a property-held child (B4).
- **"Persistence must flow by itself, both ways, at any depth"** (ask 31): **holds for List-held items at any depth** (the demo goes two levels down and across lists), once each level's list exists on replay (B1). It **doesn't hold** for property-held items (B3, B4), for `page.pages` (B7), or for a child page with no file (B8).
- **"The delta path should be as simple as it can be":** it already is: one link, one event, one recorder, one reader. The fixes in §2 *remove* special cases (Task's hand-made getter, Page's `content`-only route, `locate`'s compat path, PageLogReader's copied `attach`) rather than adding any.
- **design-decisions §4, "the first delta at adopt, deltas bubble to a root with a file":** holds for List members (the `add` line is the first delta). Not for properties, as seat (a) found.
- **ids-and-paths, "dots, each level decides":** the reader is ready (§1, last point). Two gaps: `Item.apply` doesn't expand dots (only the item tool does), and the writer doesn't name lists yet.

## 7. Recommendation, in order (each small, each with a test, none yet built)

1. `Store.hops` names the list at every hop (B2). One line; the reader is ready. Then the demo's B2 check turns "STALE", which is the signal to update this page.
2. `Item.replay_line` strips `by`/`ts` (B5), and `PageLogReader.attach` reuses `Store.attach` (B9).
3. Declared containers in Item, made on first use (B1, B3, B7, §4). Task, Page and Panel then lose their hand-made getters.
4. `Page.set` accepts the two-argument form (B6).
5. Cross-list `from` as a dotted path (B11), and `Item.apply` expands dotted keys.
6. Panel's `items` word becomes `cells` (B10): a live bug, independent of the rest.

The demo is the regression check for all six: Part 1 must stay PASS, and each fix flips its Part 2 line to "STALE" (fixed), at which point that line moves into Part 1 as a check.
