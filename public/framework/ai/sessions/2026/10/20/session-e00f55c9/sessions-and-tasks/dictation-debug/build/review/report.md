verdict: pass
1. [note] review.mjs shot `/framework/ux/Dictate/surfaces/`, a page where the diff changed one row of text. It did not shoot the Debug tab itself. The Debug tab is judged here from the builder's shots `shots/debug-390.png`, `debug-390-reloaded.png` and `debug-1920.png`, which have no layout.json, so nothing about it is measured.
2. [note] On a phone the Sent and AI rows, the two that answer "the AI never answers", are below the fold. In `shots/debug-390.png` the chat takes the top half, and only Mic, Whisper and Transcripts fit on screen (flow). This is the first review's note 6, still open. The polish brief picks it up.
3. [note] The surfaces page's new "Debug tab" row still points at the old picture `drawer-dictation-1920.png` (`ux/Dictate/surfaces/page.js`, in the diff). That picture shows the retired Dictation tab. `shots/debug-1920.png` is the right picture.
4. [note] An event line is cut off mid-sentence: in `shots/debug-1920.png`, "What happened" band, "the live wire to Servex dropped (Servex is not answering);" ends on a semicolon with nothing after it. The rest of the reason is either missing or was never written (words).
5. [note] `report.md` "Docs this made out of date" still lists `ext/drawer/doc/tabs.md`, `doc/sheet.md` and the readme's list of views, but the diff updates all three (`ext/drawer/readme.md` now says "chat, live, sessions, debug and settings"). Only `surfaces/page.js`'s dead `tabs/dictation.js` reference really remains.

## Requirements
Widths given: 400, 1200, 1920 and 3440 of `/framework/ux/Dictate/surfaces/` (review.mjs), plus the builder's Debug-tab shots at 390 and 1920.
- 1 "Make the drawer's Dictation tab a Debug tab… shows each layer, live" — yes — shots/debug-1920.png: five rows (Mic, Whisper, Transcripts, Sent to the AI, AI), each with the owner's question word for word and a live reason
- 2 "Each layer shows a real error message when it fails" — yes — the reasons name the step and the cause ("Servex did not answer session/say in 10 s", in the build report and `ext/Session/Session.js` in the diff); a dropped wire shows up in the event list (debug-1920.png)
- 3 "The tab is routed… pick one and say why" — yes — the subpath `<page>/ai/debug/`, with the reason in `doc/debug-tab.md#routed`; shots/debug-390-reloaded.png is still on Debug after the reload
- 4 "Find the stall and fix it, including whether the mic is released on reload. Reproduce it first" — yes — `test/stall.mjs` showed 1 send in 25 s before the fix and 4 after; the mic hand-over fixes the silent stop; `pagehide` stopped 1 of 1 tracks on reload
- 5 "A UI rule, written into rules.md" — yes — `framework/doc/rules.md` (diff): "Anything that can fail tells the user what went wrong", in three parts, with the owner's quote
- 6 "Errors are logged per page and per module… extend what writes ai/errors/" — yes — `ErrorLog` also writes `<module>/failures.jsonl`, and `app.js` watches every page
- 7 "Propose (don't build yet) a watcher" — yes — `ext/ErrorLog/doc/page-watcher.md`
- 8 "One subscription system… Servex follow" — yes — a failure is one line in the module's own log; `Servex/doc/follow.md` is updated; nothing is sent directly
- 9 "Web live-transcribe… bubbles and deltas" — yes — one piece per `at`, kept in time order; `test/deltas.mjs` passes, and the old code fails 3 of its checks
- 10 "Dictate into the VS Code tab" — n/a
- Class with live instances — yes — `DictateHealth` is a static store; the Debug tab is its live view (debug-1920.png)

## Page structure
- page 1 — yes — shots/127-0-0-1-56758-framework-ux-Dictate-surfaces/1920.png: the title "Voice and chat surfaces" says what the page is; debug-1920.png: "Debug", then "Dictation, layer by layer"
- page 2 — yes — the surfaces page shows each surface as a screenshot card before any detail (1200.png, grid band)

## Navigation
- techniques — tabs (the Doc page's tabs, the AIPage view row, the drawer tabs), a sidebar, a sheet (phone)
- tabs fit — yes — layout.json tab_rows 1 at every width
- current tab shown — yes — 1920.png: "Voice and chat surfaces" is underlined; debug-1920.png: Debug is shown unlinked as the current view
- sheet routed — yes — debug-390-reloaded.png: still on Debug after the reload

## Layout
- yes — the surfaces page is a single doc column with a sidebar from 1200 up (sheet.png); the Debug tab is two columns (layers | events) at 1920 and one column at 390

## Sizing
- text measure — yes — layout.json widest_text 358 / 594 / 637 / 716 px, all within the measure
- empty share — note — empty 0.24 / 0.41 / 0.55 / 0.69 at 400 / 1200 / 1920 / 3440. At 3440 most of the screen is empty beside the narrow doc column, but this diff did not cause it
- Debug tab — yes — debug-1920.png: the columns share the width; nothing is cramped

## Wrapping
- yes — layout.json wraps: the h1 takes 2 lines at 400 (acceptable for a title); "✦AI" and "☰Menu" at 3.2 lines are the rail's icon-above-label buttons, as designed; at 390 the Debug questions wrap cleanly under their labels (debug-390.png)

## Spacing and padding
- yes — layout.json left_stack p 16 / 38 / 54 / 90 px, which scales with the width and stays one layer deep; the Debug rows have even gaps (debug-1920.png)

## Colour and contrast
- yes — the green, amber and red dots also come with words, so a row never relies on colour alone; the muted question text is light but readable (debug-1920.png)

## Flow
- no (note) — at 390 the chat comes before the five rows, so the two rows that matter most are below the fold (finding 2)

## Words
- yes — plain sentences; the intro says what green, amber and red mean; the reasons name the step and the cause
- note — one event reason ends on a semicolon (finding 4)
