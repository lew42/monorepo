verdict: fix
1. [fix] The committed branch is broken: `WhisperLog.js` at `18c8329a4` (and in this diff) calls `h4.c("wl-title", …)` in `draw()` but imports only `View, div, span, button`, so `draw()` throws a ReferenceError and the table never renders. The shots look right only because `C:/Code/lew42/wt-whisper-log` has the h4 line deleted but **not committed** (`git status`: ` M WhisperLog.js`). Commit that one-line deletion before merge (code: traps that never throw).
2. [fix] At 1200 the text column, the point of the page, is cut off: rows keep `min-inline-size: 66em` (about 900 px) inside a `.wl` of `100vw - 24rem` (816 px), so "ask not w…" is clipped and needs a sideways scroll (sizing, wrapping) — shots/…-Whisper-log/1200.png, every row's right edge. Let the stacked layout start wider (the 48rem query) or shrink the fixed columns so 1200 fits.
3. [note] No `layout.json` this round (the shots line has `"bands": []`), so every measured question is `not measured`, judged from the pngs. Widths given: 400, 1200, 1920, 3440 for both pages.
4. [note] The `+N ms` gap under each clock is at `opacity: .5` on grey, which reads faint at every width (colour) — 1920.png, column 2.
5. [note] The parent Whisper page links the log only through the sidebar; its own text never mentions it (navigation: findable) — shots/…-audio-Whisper/1200.png. A one-line link in its paragraph would help.
6. [note] The `audio` tab bar still wraps INBOX to a second row at 1200; this was there before and the diff doesn't touch it — shots/…-audio-Whisper/1200.png, top band.

Fixed since review 2: local times (run buttons read "10-16 19:08:50"), the sticky header now covers the rows, "commit-dropped" no longer wraps, rows stack at 400, and the repeated h4 title is gone (uncommitted, see 1).

## Requirements
No `requirements.md` in the task folder; the brief named in task.jsonl is `ext/Refine/readme.md` and the card is "Whisper log: the raw stream, structured". Asks taken from the card and `audio/Whisper/doc/whisper-log.md`.
- 1 "the raw stream" — every event numbered, Whisper's whole reply kept — yes — 1920.png: 38 events, `#`, src/kind columns; `server` holds the `verbose_json` body (diff, WhisperLog.record)
- 2 "structured" — readable table, diffs, amend/duplicate flags — yes — 1920.png: struck red removed words, green added, chips per kind, "problems only" filter
- 3 reachable by a visible link — yes — 1200.png sidebar "Whisper log" under Whisper; readme links `/framework/audio/Whisper/log/`
- 4 works on the committed branch — no — finding 1, `h4` not imported at HEAD
## Page structure
- page 1 says what it is — yes — 1920.png: "Whisper log", then stats and a legend
- page title not repeated — yes — the h4 is gone in the shots (uncommitted)
- one takeaway obvious — yes — a table of events in order, problems filter top right
## Navigation
- techniques used — a sidebar, the parent's tabs, a row of run buttons (a toggle group)
- current place shown — yes — 1920.png sidebar "Whisper log" highlighted
- run buttons show which is on — yes — 1920.png: "10-16 19:08:50 · 38" filled green
- routed (reload lands here) — yes — own URL `/framework/audio/Whisper/log/`; the chosen run is not in the URL (small)
## Layout
- content uses the space it is given — yes at 1920/3440 (table ~2560 px of ~3270), no at 1200 — finding 2
- sticky header covers what scrolls under it — yes — 1920.png, first table row
- 400 stacks instead of scrolling sideways — yes — 400.png: time · src · kind, then origin, then text
## Sizing
- [measured] widths — not measured (no layout.json)
- table fits its column — no at 1200 (900 px rows in 816 px), yes at 400, 1920, 3440
- `.wl` sized by `100vw`, not its column — note; works here because the sidebar is a known 24rem
## Wrapping
- chips don't wrap — yes — "commit-dropped" one line at 400, 1200, 1920, 3440
- run buttons wrap cleanly — yes — 1200.png two rows, 400.png three rows of pairs
- text column wraps sensibly — yes at 1920 (one or two lines), no at 1200 (clipped, finding 2)
- origin wraps — note — 1920.png row 29: "req 7 · seg 0 · 179 ms · conf / 0.97 · nospeech 1e-12" on two lines, acceptable
## Spacing and padding
- row padding even — yes — 1920.png, about 0.15em × 0.4em per row with hairline dividers
- gap between header, legend and table — yes — 1920.png, top bands evenly spaced
- 400 rows not wastefully tall — yes — 400.png, each row fits its text, no blank columns now
## Colour and contrast
- diff colours readable — yes — 1920.png: red strike and green fill on the light ground
- faint text — note — `+N ms` at opacity .5 (finding 4); interim rows at .65 are intentional
- chips distinguishable by kind — yes — green final, blue chunk/go, gold commit-dropped, grey others
## Flow
- reading order top to bottom — yes — title, stats + runs, legend, table, newest last
- newest at the bottom stays in view — yes — the table scrolls to the end on load (1920.png ends at #39)
## Words
- legend explains the jargon — yes — "req = the request number sent to whisper-server · seg = … · click a row for everything it recorded."
- header says what the text column shows — yes — "text (changed words vs the previous line)"
- empty state is helpful — yes — "Nothing yet. Speak into a page that wires the log (the Refine page does)." (code; not shot)
- times are local — yes — "10-16 19:08:50", clock "19:08:55.695"
