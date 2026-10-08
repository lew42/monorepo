# Build: @mentions, known names become icon links

Load the `minion` skill first, then `code`. The owner's words, verbatim, are in
`public/framework/ai/2026-09-30/mentions/owner-words.md` — read them fully; they are the acceptance test.
The card's directory: `public/framework/ai/2026/09/30/mentions-page-becomes-an-icon-link-every/`.

The gist: anywhere the site renders written content, `@Page` becomes a small icon item (a
document icon + the word "Page") linking to `/framework/core/Page/`. One registry maps each name
to `{ url, icon }`.

## Where you work

The pool worktree **`C:/Code/lew42/worktrees/qf-9`** (branch `worktree/qf-9`, its server
`http://127.0.0.1:54379/`). Never edit the main tree. **Commit after every finished piece**
(a pool worktree can be reclaimed across a Servex restart). Never link node_modules. Any
process you start sets `windowsHide: true`; stop every server you start.

## Fence (only these files)

- NEW `public/framework/ext/Mention/` — `registry.js`, `Mention.js`, `page.js`, `readme.md`, `doc/`, `files.jsonl`
- `public/framework/ext/page.js` — add `Mention` to `children:` (nothing else)
- `public/framework/ext/markdown/md.js` — one call after parsing
- `public/framework/ext/Chat/md.js` — one call inside `md_into`
- `public/framework/ai2/needs.js` and `public/framework/ai2/inbox.js` — the row title/question spans only

## Deliverables

1. **`ext/Mention/registry.js`** — `export default { Page: { url: "/framework/core/Page/", icon: "description" }, … }`.
   A plain JS module (no fetch, so no DOM-after-await, and the browser caches it). Seed about
   20–30 entries from `public/framework/ai/2026/09/29/familiar-structure-every-named-system-ge/systems.md`
   and the familiar concepts: Page, View, App, Router, Servex, Card, Agent, Task, Chat, Panel,
   Item, Doc, JSONL, Markdown, Tabs, Files, Collab, Research, Mastermind… Check every url answers
   200 on the worktree server; drop any that don't. Icons are Material Symbols names (as `ui.item` uses).
2. **`ext/Mention/Mention.js`** — `mentions(el)`: walk `el`'s text nodes (skip inside `code`, `pre`,
   `a`, `textarea`), replace each `@Name` (capitalised, `/@([A-Z][A-Za-z0-9]+)\b/`, not preceded by a
   word character, so emails stay) with an inline icon item link: reuse `ui/item` (`item.js`,
   `.inline`) if it fits in a line of text; otherwise an `<a class="mention">` with an `icon` + name.
   Unknown names stay as plain text and are added to an exported `unknown` Set (plus one
   `console.debug`, never a warn/error — the merge smoke test fails on console errors). Synchronous.
   Also export `mention_html(str)` only if a caller needs a string form.
3. **Wire it:** `ext/markdown/md.js` (every markdown render, after parse), `ext/Chat/md.js`
   `md_into` (after `clean()` — so it also covers chat bubbles and Drill titles), and the AI 2
   **Needs you** row title + question (`ai2/needs.js` ~line 162/172) and the **Inbox** row
   title (`ai2/inbox.js`). Keep the plain text in `title="…"` attributes as it is.
4. **`ext/Mention/page.js`** — the page SHOWS it: first the whole registry as a wall of the
   actual icon items (what every `@Name` becomes), then one live line of sample text with
   `@Page`, `@Servex` and an unknown `@Nope` rendered, then the `unknown` names seen this session.
   `readme.md` in the house index shape (what · Use · Watch out · More), one `doc/syntax.md`.
5. **Proof:** screenshots at 400 and 1920 (`node Server/layout-check.mjs <url> --widths 400,1920`
   against the worktree server) of `/framework/ext/Mention/` and `/framework/ai2/` with at least
   one `@Page` visible in a row (if no real row has one, say so; don't fake data into live logs).
   Zero console errors on `/framework/ext/Mention/`, `/framework/ext/markdown/`, `/framework/ai2/`.

Budget: about $3. Log in your own task.jsonl as you go; land with a short outcome listing each
deliverable with its proof (shot path or url). Do not merge; I merge.

