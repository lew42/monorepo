# core/Page: the vision

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

The owner's ideas for where the page system goes. Some are on the back burner; they are written here so they are not lost. The source is section A of the owner's ask of 2026-10-15 ([ask-ea3d4c58.md](/framework/ai/sessions/2026/10/15/voice-20261015/ask-ea3d4c58.md)); the answers to its questions are in [answers.md](/framework/ai/sessions/2026/10/15/voice-20261015/page-system/answers.md).

## 1. The page is THE core data item

A page is not only something you look at. It is the framework's main kind of thing: anything with a name, a place (a url) and children is a page, and everything else (a task, a session, a card, a setting) is either a page or holds one.

```js
class Item            // a thing: icon, title, saved, events
class Page extends Item   // + a url, children, a way to load and draw
// a task, a session, a card: holds a page by reference (doc/composition.md)
```

What this asks of the code:

- **One shape for every thing.** The same API reads a page written as code (`page.js`), as a log (`page.jsonl`), as data (`page.json`), embedded in its parent, or made on the fly (`route()`). The caller should not need to know which.
- **Small, named parts.** `Page.class.js` keeps the identity and the tree; loading, drawing and links live in parts with their own names, as `Page.Jsonl` and `Page.Listing` already do ([classes.md](classes.md); the split proposal is in [answers.md](/framework/ai/sessions/2026/10/15/voice-20261015/page-system/answers.md), Q3).
- **Storage is declared, not guessed.** Each page (or item) could say where its data lives, so a new backend (a database, a Durable Object, [storage.md](storage.md)) is one field, not a new file name.
- **History for free.** A page written as a log keeps every change, and every open tab sees a change as it happens ([streaming.md](streaming.md)).

## 2. Debug views: see any instance

Any live instance can be drawn as a UI: its class, name, path, children, items and properties, each property shown by its type, and each instance of another class clickable to its own view. CLAUDE.md "Show the class" already asks for this next to every class demo.

Where it could live: the dev-shell sidebar, as an admin or dev mode you switch on, so every page you visit shows its own live tree beside it.

What exists today (census of 2026-10-15, [debug-views/out.md](/framework/ai/sessions/2026/10/15/voice-20261015/page-system/answers/debug-views/out.md)):

```js
view(thing)            // ux/Content/Object/DefaultView.js:148: any object as a tree; a class's static View wins
class DefaultView      // :33, class header, then every own property; objects expand on click
page_object(page)      // core/Page/object.js:21, one live Page through view()
class InstanceTree     // ux/Content/Object/InstanceTree.js:14, the live page tree from App, a view button per node
```

The DevBar already has an `instances` toggle (`dev/DevBar/tools.js:68-76`, off by default), but the dev-shell sidebar shows only `route` and `structure` (`dev/DevShell/DevShell.js:165`). **The smallest step:** add `instances` to that list, then check that a node's view button opens its tree.

Not built now. Status: back burner, recorded 2026-10-15.

## Open questions

- Does `page.json` stay a form, or fold into `page.jsonl` (a log with one line)?
- Is `page.children` (a Map) retired in favour of `page.pages`? The plan is in [content.md](content.md).
- Should an `Item` that is not a page get the same debug view? (Probably yes: the view reads the instance, not the class.)
