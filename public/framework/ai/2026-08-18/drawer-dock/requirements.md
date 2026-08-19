# drawer-dock — the rail stops jumping open on select; the stale selection label goes away

Laws: less is more · clarity · prioritize. **Deliverable: two fixes, each proven headless with a png in this dir; docs touched where a decision changes; final message ≤ 15 lines.** Sonnet.

The owner (2026-08-18, ~22:40), verbatim:

> the little element name ui that appears when somethign is selected fails to disappear sometimes when deselected.
>
> also, on the right sidebar drawer opening on select... I'm not sure I like it... too jumpy. I think, if we're going to have one, it should remain?

## 1. The rail no longer opens itself on select

Today: selecting an element (`ext/layout/panel.js` `select()`) or a panel (`ext/Panel/tools.js` listens for `panel-focus` and opens `ext/drawer`) **opens** the drawer, which pushes the page 19rem — the jump. Deselecting already never closes it (the owner, 2026-08-16: only its ✕ shuts it — keep that).

Change: **selection fills the rail only if it is already open** (`drawer.showing()`); it never opens it. Where the rail is part of the work — the Panel workspace pages `/framework/ext/Panel/` and `/framework/ext/Panel/full/` — the page opens the rail **once, at load** (so the push happens before you start, never mid-gesture; on `/full/` the ✕ still shuts it and it stays shut until reload or the button). Every other page (guides, layout demos, docs) gets a small explicit way in: the existing `layout.bar()` "sliders" chip already opens it — verify that path still opens the rail; if a page has a selectable region but no bar, add nothing (the owner can decide later). Record the reversal in `ext/layout/doc/decisions.md` and `ext/Panel/doc/decisions.md` (the "Selecting anything pushes the properties rail open" entry in the Panel Open list — mark it closed with today's date and the reason).

## 2. The selection label that sometimes stays

"The little element name ui" — reproduce before fixing. Candidates: the drawer head (`ext/layout/body.js` `head($el)` → the tag name beside ✕/COPY), the `.layout-selected` outline (`layout.css:81`), the Panel focus ring (`.panel.focus::after`, `panel.css:85`), the DevBar rail's `where` label (`dev/DevBar/ask.js:46`) or its selection text (`selection()` remembered on `selectionchange` — landed today, may be the culprit: it caches text so the chat box click does not clear it). Drive the deselect paths headless: click outside (capture-phase listener), Escape, `popstate`, `panel-unfocus`, a redraw after an edit, navigating to another page — and after each, assert no `.layout-selected`, no `.panel.focus`, an empty drawer head, and no stale name in the DevBar. The one that stays is the bug; fix its cause (one place), log the repro + fix as a `log` line with file:line. If none stays headless, say so plainly with the six paths you tried — do not invent a fix.

## Prove

Playwright via `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`; scratchpad `C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/a14ec0db-4e8c-4ce1-a14c-378e52ac01a0/scratchpad/`; block the dev socket `page.routeWebSocket(/.*/, () => {})`. On `/framework/styles/layouts/docs/` (a two-up with selectable panes): click a box → `.layout-selected` set, `.drawer.on` **absent**, `.app`'s reserved strip unchanged (no push); open the rail via the bar chip → now the selection shows in it. On `/framework/ext/Panel/full/`: rail open at load; select a panel → no additional push (measure the strip before/after: equal). Deselect paths → nothing stale (item 2). Pngs: `no-jump.png`, `docked-full.png`. Zero console errors on the four pages you touch.

## Fences

`ext/layout/panel.js`, `ext/layout/body.js` (only if the head is the stale one), `ext/layout/doc/decisions.md`, `ext/layout/readme.md` (one Watch-out line), `ext/Panel/tools.js` (the drawer wiring), `ext/Panel/page.js` — ⚠ another minion (`../panel-document/`) is editing `ext/Panel/page.js`'s `/full/` route line RIGHT NOW: wait until `../panel-document/task.jsonl` has a `landed_at` before touching `page.js` (`while (-not (Select-String -Path … -Pattern landed_at -Quiet)) { Start-Sleep 20 }`), then make the smallest edit; `ext/Panel/doc/decisions.md` (your entry only), `dev/DevBar/ask.js` (only if `selection()` is the stale one), this dir. NOT `ext/drawer/*`, `core/*`, `ext/markdown/*`.

## Rules

- Load `code` once. Run `new-task` first (dir + brief exist; write `task.jsonl` line 1 and the `day.jsonl` line; group `web-ui`); `documentation` then `finish-task` (`"tokens": null`). A skill that misleads you gets one line in its `improvements.md` (`skill-improvement`).
- Timestamps from the clock; forward slashes; never Out-File a `.jsonl`; never a person's name — "the owner". Only `p()`/`h1`–`h6` read backticks; no DOM after an `await` outside a callback. Wait in the foreground.
