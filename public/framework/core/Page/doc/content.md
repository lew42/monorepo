# Page content: three things, one way each

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

A page has three kinds of stuff. Each one should have exactly one name and one way to write it.

```js
page.pages      // List<Page>: child pages. Each has its own folder and url. This is navigation.
page.content    // List<Item>: the page's own blocks ("parts"), stored as lines in its page.jsonl.
PageHeading extends Item
PageHeading.View = class PageHeadingView extends View {}   // each kind (PageHeading, PageText, PageCard) draws itself
```

A page body is a list of parts. A part is an ordinary `Item` whose class has a `View`; there is no `Part` base class. `Page.render_content_list()` draws each part through its class's `View` (falling back to title and text when a class has none), so a plain `Page` is already a parts page. A part is one `page.jsonl` line:

```
{"content":{"add":{"id":"h","type":"part-heading","text":"Hello"}}}
```

`content(){ h1("Hello") }` in a `page.js` keeps working. It is one more kind of part: a code part. No page breaks.

## What is done (2026-10-12)

- `render_content_list()` draws an item through its class's `View` when it has one, and falls back to title and text when it does not.
- The kinds are `PageHeading`, `PageText`, `PageCard`: each an `Item` subclass with its own `View`, registered as `part-heading`, `part-text`, `part-card`. `HeadingPart.js`, `TextPart.js`, `CardPart.js` and `Part.js` re-export at the old names. `PartsPage` is an empty subclass kept so old `"class": ".../Parts.js"` lines still load. Details: [parts/readme.md](parts/readme.md).
- Owner refinement (2026-10-12): no `PagePart` base class and no `PartsPage`. A first cut had a `PagePart` base; it held only `define()` (two lines) and a `draw()` hook that the `View` already provides, so it was removed. Add a base only if kinds start sharing real behaviour (a common drag handle, say).

## What is not done: the plan, and why it waits

Two things are still messier than the target. Fixing them is major surgery (CLAUDE.md, "Ask before": a core API with hundreds of callers), so this is a plan only. Counts come from `node public/framework/core/Page/doc/content-census.mjs` (2026-10-12):

| Today | Callers | Target |
|---|---|---|
| `page.children` (a `Map` that wraps `page.pages`) | 255 files | `page.pages` (97 files already use it) |
| `children: "a b"` (a string, staged by a setter, unpacked by `declare()`) | 309 files | an array or `{name: Page}`; the string stays as sugar |
| `content` as a function (`content(){ ... }`) | 1,096 `page.js` files | stays, as the code part |
| `content` as a string or an address (`content: "/notes/x.md"`) | 30 files | an address part (`{"type":"part-address"}`) |
| `{"content": ...}` lines in `page.jsonl` | 5 files | already the target |

Order, when it is approved: (1) ✅ built 2026-10-12 ([content-list-step-1.md](content-list-step-1.md)): make `content` always a `List` and have a function or string wrap itself into one code or text part on assignment; (2) point the 255 `.children` readers at `.pages` with a script (dry run, manifest, reversible); (3) retire the `children` Map wrapper and the string setter last, after one release as a shim.

## Decision, and the alternative

Chosen: parts are `Item`s in the existing `content` List, drawn by each class's own `View`. Rejected: a second `views` list or a separate `PartsPage` base class, or a `PagePart` base class. That would be a second version of the same system (CLAUDE.md law 6), and it is what `PartsPage` was.

## A block that needs a url: embedded sub-page, or linked child page?

The owner's idea to evaluate: an **embedded sub-page** (no folder; its data sits inside the parent's `page.jsonl`; drawn as a card) against a **linked child page** (its own folder and url). `Card extends Page` already exists (`ai/cards/card.js`), so should a content item that needs a url simply be a `Card`?

| | Embedded block (an `Item` + `View`) | Linked child page (a `Page`) | Block as a `Card` |
|---|---|---|---|
| Lives in | a line of the parent's `page.jsonl` | its own folder | its own folder |
| Has a url | no (at most a `#id` on the parent) | yes | yes |
| Weight | an `Item` and a `View` | a `Page`: 2,269 lines of class (router, reader, store, settings) | a `Page` plus `Card`: 1,438 more lines of AI-board code |
| 50 on one page | cheap | 50 readers and watchers | 50 readers, watchers and board UI |

**Recommendation: no. Content items stay light; a block that needs a url becomes a linked child page.** A url is a router entry, and only a `Page` can have one, so "an item with a url" is a page by another name (law 6: one of everything). `Card` is the AI board's own page template, not a general block, and putting it in every page would pull the whole AI card system along. Many full `Page`s inside one page is the heavy option.

The two meet in the middle without a new class: a block can *point at* a child page (a `part-link` kind holding the child's path, drawn as a card with the child's title and summary). Growing is a promotion: when a block needs a url, a script moves its line into a new folder (dry run, manifest) and leaves a `part-link` behind.

Built 2026-10-12: `part-link`, the promote script and `#id` scrolling ([part-link.md](part-link.md)). The alternative (embedded sub-pages as full `Page`s inside one `page.jsonl`) is recorded, not rejected on principle: revisit it if `Page` ever gets a light core that is cheap to create in bulk.

## Design (owner, 2026-10-12, not built): `content` is always a List, and each kind draws itself

Today `page.content` has four shapes, and `render_content()` is the type-switch that handles them:

```js
// Page.class.js, render_content()
if (this.content instanceof List) return this.render_content_list();   // parts
if (is_address(this.content))     return this.content_at(this.content); // "/notes/x.md"
if (is.str(this.content))         return p(this.content);               // a string
return is.fn(this.content) ? this.content() : this.content;            // content(){ h1("Hi") }
```

### 1. `page.content` never changes type

**Built 2026-10-12** (step 1 only; steps 2 and 3 are not): [content-list-step-1.md](content-list-step-1.md) has what was built and where it differs from the text below. Live: [/framework/core/Page/content-shapes/](/framework/core/Page/content-shapes/).

```js
page.content                                  // always a List, the same object for the page's life
new Page({ content(){ h1("Hi") } })           // a function  -> one PageCode item added to the list
new Page({ content: "/notes/x.md" })          // an address  -> one PageAddress item
new Page({ content: "Some text." })           // a string    -> one PageParagraph item (draws with p(), as today)
new Page({ content: [{type:"part-text", text:"Hi"}] })   // array or POJO -> content.set(value), like a jsonl line
```

How: `content` becomes an accessor on `Page`. The getter is `ensure_content()` (so it is still made lazily, and a page with no content pays one empty List). The setter takes the value, and routes it by shape. An object or array goes to `content.set(value)`. A function, string or address makes one item and adds it to the list. `Object.assign` calls setters, so the constructor path (`assign`, below) needs no change.

Gains: a page can have its code *and* parts. Today a `{"content":...}` jsonl line on a page whose `content` is a function *replaces* the function (`Page.set()` calls `ensure_content()`, which overwrites it); with a list the function stays as the first item. The `typeof`/`is.fn`/`instanceof List` checks on `page.content` all disappear.

A `PageCode` item holds a function, and a function cannot be written to `page.jsonl`. It is added quietly (the way `declare()` adds a stub child) so `Item.Store` never writes it, and it is skipped when the list is saved.

Costs, to be counted before anyone builds it (the same major-surgery fence as `children`):
- The 1,096 `page.js` files that say `content(){...}` in a config object keep working (the setter takes it).
- A class that defines `content(){...}` in its **class body** (at least 10 files: `ai/cards/card.js`, `ai/AISession/AISessionsPage.js`, `core/Layout/Layout.js`, ...) puts a method on the subclass prototype, which hides the base accessor. Each needs moving into the constructor config, or the base must read a named hook instead. That is the real work.
- Callers that run the function directly (`this.content()` in `core/Page/Frame.js`, `core/Page/page.js`, `ext/Doc/Doc.js`) become `this.content.render()`.
- `Page` runs `assign(...args)` twice (once inside `super(...args)`, once after it, line 59), so a function would be added as two items. Drop the second call in the same change.

### 2. Each kind draws itself, so `Page` has no type-switch

The kinds already exist or are named above. Every one is an `Item` with a `View` (the view pattern), and the list draws its items in order:

```js
page.content.render()                         // replaces this.render_content(); the page no longer knows the kinds
PageCode.View.render()      // calls item.fn.call(page); a returned element or promise is drawn, as today
PageAddress.View.render()   // content_at(address): the markdown or the "link to the third level" step
PageParagraph.View.render() // p(item.text)
PageHeading / PageText / PageCard                      // done
```

Where the loop lives: a small `PageContent extends List` with `PageContent.View`, created by the accessor above (`this.constructor.Content`, so a subclass can swap it, like `List.View`). It owns what `render_content_list()` does today: one bare row per item, the title/text fallback card for an item with no `View`, the `ref` row, and the opt-in drag to reorder. Moving that code is a move, not a rewrite. A new kind is then one class and one `register()` line; nothing in `Page.class.js` changes. (`Item` already has `item.view`, lazily `new this.constructor.View({ item })`; `render()` on the list is the same idea one level up. A name check is needed before building: `Page.render()` already means "draw the whole page".)

### 3. Three ways to write a value: `assign`, `set`, and `Page.set`

All three exist today, and they look alike, which is why they feel like they should be one.

```js
// core/Item/Item.js
assign(...args){ return Object.assign(this, ...args); }       // CONSTRUCTION
set(a, b){ return this.apply(Array.isArray(a) || is_plain(a) ? a : { [a]: b }); }   // a CHANGE
apply(delta){ for (const key in delta) this.set_one(key, delta[key]); }   // the routing, per key
set_one(key, value){
	if (typeof this[key] === "function") return this[key](value);          // 1. a key naming a method CALLS it
	const target = this.get(key);
	if (target?.set && !(target instanceof Map)) return target.set(value); // 2. a nested thing gets the delta
	this.put(key, value);  this.emit("change", ...);  this.emit("delta", ...); // 3. else data, an event, a Store write
}

// core/Page/Page.class.js
set(obj){   // a page.jsonl line
	(this.jsonl_lines ??= []).push(obj);  this.emit("line", obj);   // log bookkeeping
	obj = this.take_words(obj);                                     // the six words, handled before routing
	if ("content" in obj && !(this.content instanceof List)) ...    // make content a List first
	return super.set(obj);
}
```

| | `assign(...args)` | `set(delta)` / `apply()` | `Page.set(line)` |
|---|---|---|---|
| Job | build the object | change it, and tell everyone | `set` for a log line, plus the log's bookkeeping |
| Who calls | the constructor (`new Page({...})`); `hydrate()`; any `Object.assign(this, ...)` | the Reader, the page tools, a field setter (`item.title = x`), code | `Page.Reader` (one call per line), `overlay()`, a field setter on a page |
| A key naming a method | **overwrites** it (`content(){}` replaces the method) | **calls** it (`{"add": {...}}` runs `add`) | calls it |
| Events and Store | none: `data` and `store` do not exist yet | `change` + `delta`, which `Item.Store` persists | the same, plus `line` |

**Was a merge planned before? No plan to merge these was found** (grep of `ai/` and the `core/Item`, `core/Page` docs). What exists is a series of smaller folds, none of which touched `assign`:
- `List.set()` was deleted: `List extends Item` and uses `apply()` (a comment in `core/List/List.js`, 2026-10-03).
- `PageLog` was folded into `Page`, whose `set()` became a thin wrapper over `apply()` ([decisions.md, "Page extends Item"](decisions.md)).
- The `at` key was dropped; nesting is the path now (`ai/sessions/2026/10/03/list-events/drop-at-key/requirements.md`; the compat branch in `apply()` is marked "fold-away").
- The sentence you likely remember: "`page.set(obj)` is `assign()` that calls methods instead of overwriting them" ([jsonl.md](jsonl.md)). It describes the idea, not a plan.
- [Item/doc/method/assign.md](../../Item/doc/method/assign.md) records that `assign` is deliberately a one-liner, written out per class rather than shared. (`Item/doc/method/set.md` is stale: it describes a `data[key]` write from before `apply()`.)

**Can one absorb the others? `assign` into `set`: no. `Page.set` into `Item.set`: yes, in steps.**

- **Not `assign` into `set`.** For a key naming a method they mean opposite things (overwrite versus call), and `assign` runs before `data`, `id` and the Store exist, so it cannot emit or persist; building an object is not a change. Merging them would make `new Page({ content(){...} })` *call* `content` at construction. They stay two verbs with one job each.
- **But they can meet at the value.** If `content` and `children` are accessors (setters), then `assign({content: x})` and `set({content: x})` both end in the same code: `content.set(x)`. The two verbs stay; the special cases inside `Page.set` (and the string stage-then-`declare()` dance of `children:`) go away. This is the gain of section 1.
- **`Page.set` shrinks to nothing.** With `content` always a List, the `ensure_content()` branch is gone. The `jsonl_lines` and the `line` event belong to the reader, not to every write: move them to `page.line(obj)`, which the `Page.Reader` calls and which calls `set(obj)`. (Observed by reading, not tested: because `Page.set` is also what a field setter calls, `page.title = x` today pushes a "log line" and emits `line` too.) The six words become accessors like `title`/`icon`, so `set_one` handles them. Then `Page` has no `set` of its own and `Item.set` is the only one.

**Recommended order, each step a small merge, all behind the same approval as the `children` migration:** (a) the `content` accessor and the kinds above; (b) delete `Page`'s second `assign` call and its duplicate `assign` method (`Item` has the same line); (c) `page.line()` for the log bookkeeping; (d) the words as accessors; (e) delete `Page.set`. The alternative, a single `set(value, { construct: true })` verb, is recorded and rejected: a flag that switches a method between "call" and "overwrite" is two verbs hiding in one name.

The old slice that proved the idea: [parts/doc/architecture.md](parts/doc/architecture.md). Related: [data-children.md](data-children.md) (children that live in data), [architecture.md](architecture.md).

## Comments moved out of Page.class.js (2026-10-12)

Wording kept as it was; the code keeps a one-line pointer here. Plan: [comment-plan.md](./comment-plan.md).

### A CONTENT LIVELIST, DRAWN — the one reusable view (deliverable 6,

*was Page.class.js line 1322*

════ A CONTENT LIVELIST, DRAWN — the one reusable view (deliverable 6,
page-item-design.md). One row per item, each item's own `.view`; drag to
reorder with `ext/Draggable/Sortable` (dynamic import — core never imports
ext); redrawn from the list's own events, never polled.
⚠ `item: { items: list, … }` on the CONTAINER's own Sortable, and `item: item`
  (the real content Item) on each ROW's — `Sortable.release()` (ext/Draggable)
  commits a drop through `where.list.item.items.move(dragged, { from:
  dragged.parent?.items })`, a name every OTHER caller of Sortable (Panel, the
  editor's blocks) happens to have chosen for its own list too. `content`'s
  real name everywhere else is `content`; `items` here is only that one seam,
  confined to this method. A page has no `.items` of its own, so `from`
  resolves to `undefined` and `move()` reorders within THIS list — exactly
  right for a flat list with no nesting.

### build_row deliberately builds its chip with View.captor nulled (it is

*was Page.class.js line 1385*

`build_row` deliberately builds its chip with `View.captor` nulled (it is
also used inline, mid-sentence, where auto-appending would land it in the
wrong place) and hands back the raw element — appended here by hand, not by
an implicit arrow return, because this callback also needs to run
`draw_body()` after it without that second call's return value (`undefined`,
a block body) overwriting the chip as what gets appended.
