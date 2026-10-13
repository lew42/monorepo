verdict: fix
1. [fix] There is no `decision` line in the task log (req 2). `grep -c '"decision"' task.jsonl` returns 0, yet `doc/inbox-data.md` says the alternatives are in "the `decision` line in the task log". Append the line (Server/decide.mjs), or fix the doc's pointer.
2. [fix] The detail does not have the card's chat in a right sidebar (req 3, the owner's "a right sidebar per card to talk to it"). shots/detail-1920.png shows only an "Open its card, and talk to it" link that leaves the timeline. Embed the card page's existing chat, the way `AISessionDetail` does, or record why it can't be done.
3. [note] New landings don't reach the timeline on their own. `landings.jsonl` only grows when someone runs `node Landings.mjs --append`, so the `live()` tail has nothing new to show until the `on-landing.mjs` edit lands. The doc gives that edit as exact text, but no `decision` line carries it (see 1).
4. [note] Every shot logs one 404 (layout.json `errors`, all three pages, both widths), so "smoke clean" (req 4) is unproven. The unrelated `/ext/` page shows the same 404, so it may be older than this change. Name the file.
5. [note] At 1920, with nothing selected, the timeline leaves the whole screen beside a ~340 px rail empty (shots/…Inbox-timeline/1920.png, empty 0.692). Opening the top row by default at wide widths would put that space to use.
6. [note] The detail's top line ("landed · … · score 69.9 · landings.jsonl:1301") shows debug data without `?debug`, and about 80 px of space sits between it and the title (shots/detail-1920.png, band 2). Keep the kind and time; move the score and source behind `?debug`.
7. [note] The Inbox module page shows two titles ("Inbox", then the readme's h1, which wraps to 4 lines: layout.json `wraps` h1 lines 4 at 1200). Its `button primary` link also renders as a plain underlined link (shots/…Inbox/1200.png, band 2).
8. [note] The count line wraps at 1200 and leaves "you" alone on line 2 (shots/…timeline/1200.png, band 2; widest_text sample).
9. [note] `timeline/landings.jsonl` adds a 428 KB derived cache to git, under a parent task whose job is slimming the repo. The doc defends it (a static host needs it), but say in the parent's report that it costs 428 KB.

Widths given: 1200 and 1920 for all three pages, plus detail-1200/1920.

## Requirements
- 1 "The map, computed" — yes — `InboxSources.mjs` writes the table between markers in `doc/inbox-data.md`. It names the record and the caches, and has a Duplicates line.
- 2 "The decision … a `decision` line in your log … retires as read-only with a pointer" — no — the doc has the decision, the alternatives and board.jsonl retired read-only, but task.jsonl has 0 `decision` lines
- 3a "every landed task's title + one-line outcome + link as a row, interleaved with owner notes and needs-you, ranked by `Inbox.rank`" — yes — shots/…timeline/1920.png: LANDED, NEEDS-YOU and DECISION rows mixed; `Timeline.rows()` scores with `Inbox.rank`
- 3b "a filter chip 'big things only' on by default" — yes — the chip is pressed in shots/…timeline/1200.png; `?all` turns it off
- 3c "Preview rail → detail page → the card's own chat in the right sidebar" — no — the rail and the detail work (shots/detail-1200.png), but the chat is a link out, not a sidebar
- 3d "reuse `ext/DataGrid` … streams via `live()`, no `setInterval`" — yes — DataGrid in rail view; `Timeline.start()` uses `live()`; the diff has no setInterval
- 4 "Four widths, smoke clean, merge.mjs, a 1200 screenshot, debug view shows sources and scores" — partly — the "Sources and scores" chip exists; only 1200 and 1920 were given; a 404 on every page
- 5 "Report on your card" — not verified — the card is outside the diff

## Page structure
- page title says what it is — yes — "Inbox timeline" plus the count line, shots/…timeline/1200.png, top band
- one takeaway is obvious — yes — "1087 things built · 63 waiting on you or for you"
- module page shows before it tells — partly — "Open the inbox timeline" comes first, then the whole readme with a second h1 (note 7)

## Navigation
- techniques — a sidebar (site nav), a rail with the detail as a column beside it, chips, Table/Rail tabs
- each view has its own URL — yes — `/timeline/<row_key>/`; `?all` and `?debug` are kept in the URL
- the detail can be closed — yes — × at the top right of shots/detail-1920.png
- the rail stays put when a row opens — yes — shots/detail-1200.png against shots/…timeline/1200.png

## Layout
- the layout fits the content — yes at 1200, partly at 1920 — the rail and detail columns are right; with nothing selected, 1920 is 69% empty (note 5)
- no horizontal overflow — yes — layout.json overflow_x false at both widths

## Sizing
- the rail width suits the cards — yes — about 340 px, three-line previews
- prose measure — yes — the detail text stops at about 580 px (shots/detail-1920.png)

## Wrapping
- nothing wraps that shouldn't — no (small) — the count line wraps at 1200 (note 8); card titles wrap to 2 lines at 1200, which is fine
- layout.json wraps — only the chrome (mode-btn, drawer-menu) on the timeline; the module page's h1 takes 4 lines

## Spacing and padding
- even rhythm — mostly — the rail cards are evenly padded; the detail has a large gap between its meta line and the h3 (note 6)
- left stack — yes — layout.json left_stack p 15 px at 1200, 27 px at 1920

## Colour and contrast
- text contrast — yes — dark text on white cards; the muted subs are readable
- the chip's on state is clear — yes — accent border on "Big things only"
- the kind labels are distinct — partly — LANDED and NEEDS-YOU differ only by weight and opacity

## Flow
- top-down reading order — yes — count, chips, view tabs, then the rail, newest and most urgent first
- the detail reads in order — yes — meta, title, actions, outcome

## Words
- plain words for the reader — mostly — "things built", "waiting on you", "Open its card, and talk to it"; the detail's meta line puts `landings.jsonl:1301` and "score" in front of the owner (note 6)
- the doc is clear and current — yes, except the decision-line pointer (finding 1) — `doc/inbox-data.md` uses full sentences and a computed table
