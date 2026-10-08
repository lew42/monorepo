verdict: pass
1. [note] The diff carries about 70 unrelated generated `files.jsonl` / `page.jsonl` changes (dated task dirs under `ai/2026-08-17` … `ai/2026/10/08`) beside the real work; they bury the review and are not "docs only" — commit them separately or confirm they are machine output.
2. [note] At 400 the system page is 2.34 screens of cards in one column (layout.json bands, `wide` share 2.337) — long to scroll; two columns of the smaller cards would fit more above the fold.
3. [note] At 1920 and 3440 the card grid fills only the left ~60% and the page is 59–63% empty (layout.json empty 0.591 / 0.625, narrow_share 0.77) — fine as a reading column, but the right side is unused.
4. [note] The page's scope is not stated in one line at the top (a name is a name plus its scope): the title is "Servex" while the page also holds Agent SDK, models and sessions material — shots/…system/1200.png, top band.
5. [note] Only the shot of the system page was reviewed with layout.json; the other shot folders are the dated task pages touched by the jsonl churn and show no change attributable to this work.

## Requirements
- 1 "restructured `/framework/ai/system/` page that is mostly cards of classes and live instances with minimal words" — yes — shots/…system/sheet.png: dark class cards (icon, name, core API, source link) for Servex, Agents, Dispatcher, Sessions, Assistant, Pool, Usage, Budget, Heartbeat, TaskLoop, Worktrees, Monitor; an `ai-live-agents` band is the live-instances part
- 1 four-width check — yes — shots/ holds 400, 1200, 1920, 3440; overflow_x false at all four
- 2 "Readmes + architecture.md for ai/ (and Servex/)" — yes — diff adds `ai/doc/architecture.md`, `Servex/doc/architecture.md`, edits `ai/readme.md`, `Servex/readme.md`, root `readme.md`
- 3 "findings.md" — yes — diff adds `ai-system-docs/findings.md`
- 4 "reuse other agents' outputs" — not checked — outside what the shots and diff show
- Addendum 1 `systems-map.md` linked from `ai/readme.md` — yes — diff adds `ai/systems-map.md` and edits `ai/readme.md`
- SDK section/page — yes — diff adds `Servex/doc/sdk.md`
- Addendum 2 iceberg index, accounting listed first — not verified — readme bodies were not opened in this pass
- Reuse the existing class-doc mechanism, no second version — not measured — new `system-classes.js` and `check-classes.mjs` appear in the diff; whether they extend `ext/Doc` was not checked

## Page structure
- page 1 (the title says what it is) — yes — shots/…system/1200.png: "Servex" with one intro sentence
- page 2 (level 1 is one page, shown not told) — yes — cards come straight after the one-line intro
- page 3 (detail one click down) — yes — each card links to its source
- scope sentence at top — no — see finding 4

## Navigation
- identify — tabs (Inbox, Dashboard, Log, System, Sessions, Tests), a left sidebar tree, a drawer menu
- tabs — yes — layout.json tab_rows 1 at all four widths
- sidebar — yes — shots/…system/1920.png, left; collapses at 400
- the active tab is marked — yes — "System" is underlined in the sheet at every width
- routed — yes — page has its own URL `/framework/ai/system/`

## Layout
- cards in a grid that adapts — yes — 1 column at 400, 3 at 1200, 5 at 1920, 9 at 3440 (sheet.png)
- nothing overflows — yes — overflow_x false at 400, 1200, 1920, 3440
- live-agents band sits under the cards — yes — `ai-live-agents` band in layout.json

## Sizing
- cards share one size — yes — sheet.png, every width
- text readable at 3440 — yes — widest_text 699 px, and the cards are small but legible
- large empty areas — no, a note — layout.json empty 0.625 at 3440 (finding 3)

## Wrapping
- headings and card text wrap cleanly — yes — shots/…system/400.png, no clipped words
- buttons wrapping — n/a at 1200 and up (`mode-btn`, `drawer-menu` are icon buttons, lines 1.7–1.8, the icon-font name measured as text); at 400 the `drawer-rail-ai` and `drawer-rail-menu` buttons read 3.2 lines, but that is the shared chrome rail, not this change

## Spacing and padding
- h1 and p sit on the same left edge — yes — layout.json left_stack: h1 total 14 and p total 28 at 400, 19 and 38 at 1200 (p is inset deeper than h1 by one `page` layer — consistent site-wide, not this change)
- gaps between cards even — yes — sheet.png
- room to breathe at the top — yes — first band h2 at y 127 (400) / 97 (1200)

## Colour and contrast
- dark cards on a light page: light text on dark, readable — yes — shots/…system/1200.png
- the card dark theme is the same in light and dark mode — not measured

## Flow
- most important first — yes — Servex, Agents, Dispatcher lead; accounting-style cards (Usage, Budget) follow the core three
- one clear reading order — yes — cards, then live agents, then the written sections
- length at 400 — no, a note — finding 2

## Words
- the intro adds something the reader does not know — yes — "The always-on process that runs everything below. Each card is one of its classes: its core API, and a link to the source." states what the cards are
- jargon undefined — note — cards use terms such as "quick-fix pool", "heartbeat", "worktrees" in one line each; the card text is short but assumes the reader knows them
- links for every named thing — yes — each card has a source link
