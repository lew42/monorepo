# Which Page features voice can actually use

Voice drives a page with one tool, `item({path, delta})` (`core/Page/doc/ai-api.md`). Five features
the owner asked about, each tried live under [/live/demos/](/live/demos/): once on a **LivePage**
sub-page (what a voice sub-page actually is) and once on a **plain Page** (`class` set to
`/framework/core/Page/Page.class.js`), to tell "Page itself is broken" from "LivePage does not draw it".

| Feature | Verdict | Delta voice sends | Demo |
|---|---|---|---|
| **tabs** | works (plain Page only) | `{"navigation":"tabs"}` on a page with children | [tabs-page](/live/demos/tabs-page/) · broken on LivePage: [tabs](/live/demos/tabs/) |
| **columns** | broken | `{"navigation":"columns"}` | [columns-page](/live/demos/columns-page/) · [columns](/live/demos/columns/) |
| **place** | works (plain Page, no own content) | `{"place":"note.md"}` | [place-fresh](/live/demos/place-fresh/) · broken on LivePage: [place](/live/demos/place/) |
| **nav** (left rail) | works (plain Page only) | `{"navigation":"rail"}` on a page with children | [nav-page](/live/demos/nav-page/) · broken on LivePage: [nav](/live/demos/nav/) |
| **previews** | broken | none — there is no delta for it | [previews](/live/demos/previews/) |

## Why, one cause each

- **tabs** — `Frame.js:19-20` reads `page.navigation === "tabs"` and calls `this.tabs()` (from `ext/tabs`), which draws a real clickable strip over a panel. Proven: [tabs-page](/live/demos/tabs-page/) shows "Overview · Alpha · Beta", each a working tab. Since 2026-11-06 a tab draws no title of its own, one Files button covers every tab, and a `tab` line can carry `content` text ([core/Page/doc/jsonl.md](/framework/core/Page/doc/jsonl.md), "The Files button, and pages shown as tabs").
  - **Broken on LivePage** because `LivePage.js` `render()` builds its own head, cards and foot (`LivePage.Head`, `Main`, `Foot`) and never constructs a `PageFrame` — so `Frame.js` never runs, no matter what `navigation` says. [tabs](/live/demos/tabs/) shows "Nothing on screen yet".
  - Smallest fix: not worth it — LivePage is one screen, not a page with a navigable child list; tabs belongs on plain Page.

- **columns** — `Frame.js` `render()` (lines 8-30) has a branch for every other navigation word (`rail`, `rail-right`, `tabs`, the two `arrangement` bars) but **none for `"columns"`**. `page.columns()` (`Page.class.js:636`) is a separate opt-in method a page's own `content()` must call in code (see `Columns.js:55`); the navigation word alone sets a property nothing reads at render time.
  - Smallest fix: add `if (page.navigation === "columns") this.page.columns();` (or equivalent) to `Frame.js`'s `render()`, so the word does what `rail` already does.

- **place** — `Jsonl.js`'s fallback `content()` (lines 199-206) calls `draw_folder()` → `log_draw()` → `draw_placed(entry)` for every `page.placed` entry, but only when the page has **no content of its own** (its default content, used by a bare `page.jsonl` page). Proven: [place-fresh](/live/demos/place-fresh/) shows `note.md`'s rendered markdown, plus a red "Not written yet" line for a file that does not exist — both the success and the failure path are real.
  - **Broken on LivePage** because `LivePage.Main` draws only `this.cards` (the `content` List) — it never calls `draw_folder()`/`log_draw()`, so `page.placed` entries are silently never drawn. [place](/live/demos/place/) shows the content text but not `note.md`.
  - Smallest fix: have `LivePage.Main` also call the page's `log_draw()` once, so a placed file appears among the live cards.

- **nav** (rail) — `Frame.js:14` draws `this.rail("left")` when `navigation === "rail"`: an eyebrow labelled "pages", then one link per child (`rows()`, lines 79-94). Proven: [nav-page](/live/demos/nav-page/) shows "pages / Alpha / Beta" as real `<a>` rows.
  - **Broken on LivePage** for the same reason as tabs: no `PageFrame` is ever built. [nav](/live/demos/nav/) shows "Nothing on screen yet".

- **previews** — there is no delta for it at all: `Page.callable` (`Page.class.js:42-46`) lists only `tab` and `place`; `Page.WORDS` (line 172) has no `previews`. `page.previews()`/`.list()` (`Previews.js`) is a method a page's own `content()` must call in real code — nothing in the item tool's vocabulary reaches it.
  - Calling it directly anyway (`{"previews":{}}`) is **refused**, not silently ignored: every delta is replayed in Node before it is written (`Servex/agents/page_tools.js:905`, `try_line`/`Refused`), and `previews()` builds real DOM (`div.c(…)`), which throws `document is not defined` outside a browser. The write is rejected with `"this line would not replay (document is not defined). Nothing was written."` — proven live against [previews](/live/demos/previews/).
  - Smallest fix: none makes sense for voice. A preview wall is code the page's author writes once; voice can already get the same result card by card with `part-link` (see `/live/readme.md`, "Going into a thing: sub-pages").

## What this means for voice today

Voice gets a working **rail** or **top tabs** menu only by building a **plain Page** sub-page (`class` explicitly `/framework/core/Page/Page.class.js`), not the LivePage every `/live/` sub-page gets by default. On an ordinary LivePage sub-page, the only features that work from voice are what `ai-api.md` already documents: content cards (`part-text`, `part-card`, `part-heading`, `part-link`) and the LivePage-specific words (`flash`, `alert`, `save`, `restore`).
