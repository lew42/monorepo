# omnibox-prototype — build brief

Less is more · clarity is the exception · prioritize. Read [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; everything there is mandatory. Skills, in this order: `new-task` (this dir, group `platform`), `code`, `layout`, `new-page`, `css` before the first CSS line, `new-css-class` before the first class name, `ui-test` to prove the keyboard flow, `documentation`, `finish-task`.

**The ask (brief §5, verbatim intent):** a core Omnibox primitive — always prominent, available throughout the site, keyboard-oriented, fast, searchable, context-aware, autocomplete, previews, discovers related content, possibly a command/chat surface. Search the current topic first; surface a strong global match; preview likely destinations; evaluate whether the Space bar could switch modes. *These are ideas, not fixed UX requirements — prototype and evaluate the best interaction model.*

**Read first:** `public/imagine/platform/existing/page.js` (the scout found nothing keyboard-first exists; `ux/Filter`, `ux/Menu`, `ext/Dropdown` are the nearest primitives — read those three), `public/framework/core/Page/readme.md` (previews, `is: "topic"` roles, `nearest()`), `public/framework/core/Sidebar/`, `public/directory.json` (the whole tree already shipped — what an index looks like), `public/framework/ext/readme.md` (how an ext opts in).

## Deliverable — a demo you can open, then the ext behind it

1. `public/framework/ext/Omnibox/` — `Omnibox.js` (one class, parts as static subclasses), `Omnibox.css` (as little as possible; every rule in a layer; the `omnibox-` prefix registered via `new-css-class`), `readme.md` (index shape: what · Use · Watch out · More), `page.js` (the module's own page under `/framework/ext/`: add `Omnibox` to `public/framework/ext/page.js`'s `children:` — the ONE edit outside your fence, one word), `doc/decisions.md` (the interaction-model verdicts, one screen).
2. `public/imagine/platform/omnibox/page.js` — the demo in the platform world: the omnibox live over the REAL site index, with three scripted scenarios written on the page (find a topic from cold; search inside the current topic first; jump to a page you half-remember). The mastermind wires `omnibox` into the hub's `children:` — do not edit `public/imagine/platform/page.js`.

## What it must do (closed list)

- **Index**: the pages that exist, from `directory.json` (dirs with a `page.js`, plus `.md` pages) — no crawl, no server. Titles: derive from the dir name for the prototype; if a loaded page is in memory (`Page` tree), use its real `title`/`description`. Measure: index build time and size at the current site (~1000 urls) — two numbers in the log.
- **Open**: one key from anywhere (`/` when no input is focused, and `Ctrl+K`/`Cmd+K`); `Esc` closes; the box is visible closed too (a prominent field in the shell, not only a modal — decide and say why).
- **Rank**: current topic's subtree first (`nearest("topic")` when the current page has one, else the current page's own subtree), then global; prefix > word-start > substring; a strong global match (exact title) may outrank local — define "strong" and log the rule.
- **Keyboard**: arrows, Enter navigates, Tab completes the top match; nothing needs a mouse.
- **Previews**: the highlighted result shows the page's existing preview card (`preview()`), never a bespoke one.
- **Modes**: evaluate the Space-bar idea honestly — prototype the cheapest version (Space after an empty box switches search → command?) and write the verdict in `doc/decisions.md`, including the one reason it might be wrong (Space is a character in a query).
- **Not now**: users, content search inside pages, chat. Say so on the demo page.

## Prove it

`ui-test` plans: open with `/`, type three characters, arrow down twice, Enter → the url changed; the whole flow at 400 and 1280. Screenshots in your task links. Zero console errors at 400/1280/1920/3440.

## Fences

Write only `public/framework/ext/Omnibox/`, `public/imagine/platform/omnibox/`, the one word in `public/framework/ext/page.js`, `public/framework/styles/css-scopes.txt` (via the skill), and this task dir. Never touch `app.js`, `core/`, or the Sidebar. Budget: ~250k tokens; the demo page first, polish last; if you must cut, cut modes, then previews.
