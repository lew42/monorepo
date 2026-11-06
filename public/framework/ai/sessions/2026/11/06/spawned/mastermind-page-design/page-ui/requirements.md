Budget: $8

# A working `page.ui` prototype at /live/design/

Load the `minion` skill first. Card (the owner's words): `/framework/ai/2026/11/06/page-and-item-voice-help-feature-demos-c/`. Background: [core/Page/doc/namespaces.md](/framework/core/Page/doc/namespaces.md).

## The ask (relayed from the owner)

Weigh two ideas for shrinking Page's ~150 methods, **visually**:
1. UI moves off Page into modules a page imports only when it needs them.
2. A `page.ui` property, made on demand, holding prebuilt widgets wired to the page, whose state is saved through the page's log.

The mastermind recommends doing both: modules are where the code lives, and `page.ui` is how a page reaches them. You build a small **working** prototype of that on one sub-page, `/live/design/`, plus the proposal as short cards, sorted into tabs by the prototype itself.

## Build (names and homes are decided; keep them)

All new files go in `public/live/design/`:

- **`PageUI.js`**: `export default class PageUI extends Item`.
  - `static types = new Map()` and `static add(name, Class)`: a widget module registers itself when it is imported (idea 1).
  - `get(key)` returns the widget, making it the first time (`new Class({ id: key, page })`). It emits `"made"`, so the page can draw it. A name nobody registered returns `undefined`, as Item does.
  - Must be an **own property** of the page (`this.ui = new PageUI({ page: this })` in the constructor). `Item.get` only walks own properties and data, never prototype getters (`core/Item/Item.js:449`). So `{"ui":{"tabs":{...}}}` walks page → ui → tabs.
- **`ui/Tabs.js`**: `export default class Tabs extends Item`. Data: `names` (array) and `selected` (one name). It has a View that draws a tab bar; a tap does `this.set({ selected: name })`. It ends with `PageUI.add("tabs", Tabs)` and has a `static example`.
- **`DesignPage.js`**: `export default class DesignPage extends LivePage` (`/live/LivePage.js`). It imports `./ui/Tabs.js`. Override as little as possible:
  - the constructor makes `this.ui`;
  - `render()` calls `super.render()` and then draws every made widget in one strip under the head (and new ones when `"made"` fires);
  - `draw_card` adds `data-tab` from the card's `tab` field. Tabs then shows only the cards whose `tab` is the selected one (a class or attribute on the page view; CSS in `DesignPage.css`, inside a `@layer`, see `public/framework/styles/doc/cascade.md`).
  - A small line in the strip, "ui: tabs", lists `PageUI.types` keys. That shows idea 1: only what was imported is offered.
- **`PageUI.test.mjs`**: one lean node test, under 1 s (`public/framework/core/Test/readme.md`).
  - Apply `{"ui":{"tabs":{"names":[…],"selected":"Idea 2"}}}` to a DesignPage and check `page.ui.get("tabs").get("selected")`.
  - Then build a fresh page from the same lines (as replay does) and check the state survived.
  - An unregistered name (`{"ui":{"nope":{}}}`) must not throw or store junk.

## The page

1. Make the sub-page: `item({path:"/live/", delta:{"pages":{"add":{"name":"design","title":"Page design: page.ui"}}}})`. Then set its line-1 class to your class: check how `/live/demos/tabs-page/page.jsonl` line 1 reads (`"class": …`). Try `./DesignPage.js`; if the browser doesn't resolve it, use `/live/design/DesignPage.js`. Say which one worked.
2. Post the cards in `cards.json` (beside this brief) in order, one `{"content":{"add":{…}}}` each, through the item tool.
3. Then `{"ui":{"tabs":{"names":["Today","Idea 1","Idea 2","Both"],"selected":"Both"}}}`.
4. Prove it in a headless browser (Playwright headless or the `site` MCP `shot`) at 400 and 1200:
   - shot A: "Both" selected;
   - send `{"ui":{"tabs":{"selected":"Idea 1"}}}` through the item tool, then shot B, after a reload, showing Idea 1 (state survived);
   - tap a tab in the headless page, then shot C;
   - set it back to "Both" at the end.
5. Fix layout until it reads well at 400 (tabs wrap or scroll; no overflow).

## Fence

- Write only:
  - `public/live/design/**`;
  - the one `pages.add` line on `/live/`;
  - `/live/design/`'s log through the item tool;
  - your task dir (`page-ui/`).
- **Never write `/live/` content** (no add, clear, save or restore there): voice-app is presenting on it.
- **No edits to `public/live/LivePage.js` or any `core/` file.** mastermind-live-page is working in them. If you truly need a change there, stop and log it as a `log` line naming file:line and the change; the mastermind sends it as a proposal.
- Never restart Servex or the dev server, never drive the owner's open tabs, never `git stash`. Commit only your own files, by exact path, on `compliance/dev` (main tree; no worktree).
- `node --check` every new .js before the page loads it: a module that doesn't parse blanks the page.

## Done

- `/live/design/` works, and tabs switch the cards from voice and by tap.
- The test passes.
- Shots A–C are in your task dir.
- Committed.
- One `log` line with:
  - the class spec that worked;
  - test output;
  - the shot paths;
  - anything you would change in the design.

Then stop.
