# Check 9 asks against the repo: core

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/28-core/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `core`, folder `public/framework/core` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/core/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/core/readme.md`)

# Core — the eight classes under every page (listed under More): four are elements, one owns the url, three are the DOM-free data tier

## Index

- [App](./App/) — boot and the one container pages mount into; you construct it once in `/app.js`
- [Item](./Item/) — one node of a persistent document tree, no DOM; base for anything that nests and saves
- [Layout](./Layout/) — thirty browsable page arrangements, each proven at seven widths
- [List](./List/) — the ordered collection behind `item.items`; an Item detail
- [Property](./Property/) — one live value; `bind(fn)` returns its own unbind (used by Template)
- [Page](./Page/) — a folder with `page.js`: a url, content and children
- [Session](./Session/) — a record in its own dated folder with a `page.jsonl`; `AISession` extends it
- [Router](./Router/) — turns a url change into the DOM state; for anyone building pages or links
- [Search](./Search/) — the site's search corpus, ranking and search box
- [Section](./Section/) — a page you put inside a page
- [Shell](./Shell/) — five optional regions around a CSS grid (header, left, right, footer, main); a Shell's main can hold another Shell
- [Sidebar](./Sidebar/) — brand over a tree of links, resizable, for site nav
- [Task](./Task/) — a DOM-free unit of work: state machine, computed duration and progress, subtasks
- [View](./View/) — chainable wrapper over one DOM element; every HTML tag is a function
- [new](./new/) — one kept sketch; never import from it
- [doc](./doc/decisions.md) — what belongs in core and the cross-tier traps (no readme; docs only)

## Use
```js
// app.js
import App from "/framework/core/App/App.js";
window.app = new App();
export * from "/framework/core/App/App.js";
// page.js
import { Page, p } from "/app.js";
export default new Page({ meta: import.meta, title: "Hello", children: "about", content(){ p("Hi."); } });
```

## Watch out
- Core never imports `ext/` or `dev/`; what it needs from outside arrives by constructor injection from `app.js` — [doc/decisions.md](./doc/decisions.md)
- Imports flow down; a child importing its parent breaks only on deep reloads — [doc/decisions.md](./doc/decisions.md), worked example `Page/children/page.js`
- `core/new/` ships but is not live; a typo'd import there resolves to a same-named *different* class, and nothing throws — [doc/decisions.md](./doc/decisions.md)
- A POJO default export whose `render` shadows `Page`'s fails silently; write `content()` — [doc/decisions.md](./doc/decisions.md)
- `Page.regions` is read by core and written only by `ext/tabs`; tolerated here, not a pattern — [Page/doc/property/regions.md](./Page/doc/property/regions.md)

## More
- [Overview](/framework/core/) · [`doc/decisions.md`](./doc/decisions.md) — what belongs in core, the cross-tier traps in full, the open `List` question. Each class below has its own readme; read in this order.
- [View](/framework/core/View/) — chainable DOM element
- [Page](/framework/core/Page/) — url, content, children
- [Router](/framework/core/Router/) — url to CSS classes
- [App](/framework/core/App/) — boot, one container
- [Sidebar](/framework/core/Sidebar/) — brand over links
- [Item](/framework/core/Item/) — persistent node, DOM-free
- [List](/framework/core/List/) — ordered items, zero imports
- [Task](/framework/core/Task/) — a unit of work, DOM-free

## Also here (readme audit, 2026-10-13)
- [Events](./Events/) — on/off/emit mixin everything else builds on
- [track](./track/) — opt-in instance tracking: call once, read back live


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/28-core/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 9 asks

1. `84e31e9ecc` (4 days old): Decide whether clones fork or duplicate, and whether hard copies are linked or unlinked
2. `791b6541d1` (4 days old): Support per-property overrides at section or property level, with reset and visibility into which are overridden
3. `9df5f1832d` (4 days old): Build live lists where adding an item propagates changes, with items organised and saved themselves
4. `7db56f9638` (4 days old): Save deltas to a JSONL file
5. `579adfd03f` (4 days old): Say whether setting an item emits an event automatically, or should
6. `fad95371df` (4 days old): Maybe extend item into a bindable item
7. `c1d43f17ea` (4 days old): Explore syntax patterns for referencing and binding properties when cloning pages and templating
8. `2cdf993a3b` (4 days old): Make Field extend Property with its own set method and a field type such as text input or slider
9. `5446456224` (4 days old): Let clone take a POJO and assign to any property or field
