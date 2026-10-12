# Page content: three things, one way each

A page has three kinds of stuff. Each one should have exactly one name and one way to write it.

```js
page.pages      // List<Page>: child pages. Each has its own folder and url. This is navigation.
page.content    // List<PagePart>: the page's own blocks, stored as lines in its page.jsonl.
PagePart extends Item
PagePart.View = class PagePartView extends View {}   // each kind (PageHeading, PageText, PageCard) draws itself
```

A page body is a list of parts. `Page.render_content_list()` draws each part through its class's `View`, so a plain `Page` is already a parts page. A part is one `page.jsonl` line:

```
{"content":{"add":{"id":"h","type":"part-heading","text":"Hello"}}}
```

`content(){ h1("Hello") }` in a `page.js` keeps working. It is one more kind of part: a code part. No page breaks.

## What is done (2026-10-12)

- `render_content_list()` draws an item through its class's `View` when it has one, and falls back to title and text when it does not.
- `Part` is now `PagePart`; the kinds are `PageHeading`, `PageText`, `PageCard`. `PartsPage` is an empty subclass kept so old `"class": ".../Parts.js"` lines still load. Details: [parts/readme.md](parts/readme.md).

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

Chosen: parts are `Item`s in the existing `content` List, drawn by each class's own `View`. Rejected: a second `views` list or a separate `PartsPage` base class. That would be a second version of the same system (CLAUDE.md law 6), and it is what `PartsPage` was.

The old slice that proved the idea: [parts/doc/architecture.md](parts/doc/architecture.md). Related: [data-children.md](data-children.md) (children that live in data), [architecture.md](architecture.md).
