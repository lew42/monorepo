# Page content: three things, one way each

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

Order, when it is approved: (1) make `content` always a `List` and have a function or string wrap itself into one code or text part on assignment; (2) point the 255 `.children` readers at `.pages` with a script (dry run, manifest, reversible); (3) retire the `children` Map wrapper and the string setter last, after one release as a shim.

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

Not built: `part-link`, the promote script, and scrolling to a block by `#id`. The alternative (embedded sub-pages as full `Page`s inside one `page.jsonl`) is recorded, not rejected on principle: revisit it if `Page` ever gets a light core that is cheap to create in bulk.

The old slice that proved the idea: [parts/doc/architecture.md](parts/doc/architecture.md). Related: [data-children.md](data-children.md) (children that live in data), [architecture.md](architecture.md).
