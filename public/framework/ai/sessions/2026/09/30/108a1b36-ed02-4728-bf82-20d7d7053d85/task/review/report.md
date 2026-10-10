verdict: fix
1. [fix] Ask 2 is not met: `ux/Dictate` is not rebuilt on MicStream + Transcriber. `MicStream`'s buffer is still a copy of `ux/Dictate/capture.js`, and Whisper's silence rule is still copied. The readme says so itself: "`ux/Dictate` is not rebuilt on these yet". `Dictate.js` and `capture.js` do not appear in the diff.
2. [fix] The old URLs `/framework/audio/MicPicker/`, `/LevelMeter/` and `/PushToTalk/` now show "Page Load Error" (see shots/…-audio-MicPicker/sheet.png). Ask 1 said to keep thin aliases, or remove them only after every caller moves. The pages moved to `/v1/`, but nothing redirects from the old paths, and `core/Page/audit/data.js` still names the old paths.
3. [note] On /framework/audio/ at 400px the three demo cards have ragged widths: card 2 is wide and card 3 is narrow. Card 2's state line is cut off as "Transcriber…." (shots/…-framework-audio/400.png, middle band).
4. [note] The Dictate page is 5 screens tall at 400px (layout.json tab-panel share 5.076). Below the widget, two paragraphs run about 90 words each ("Why it was silent before", "What actually moved"). That is content question 3, and those paragraphs belong in Docs.
5. [note] The v1 page's in-page link row ("Overview MicPicker LevelMeter PushT…") is cut off at the right edge at 400px (shots/…-audio-v1/400 in sheet.png).
6. [note] In the Dictate widget the level meter is a tiny grey sliver squeezed at the end of the core row, beside Send (shots/…-ux-Dictate/400.png). Controls question 23 wants extras like the meter on a line underneath.

## Requirements
- 1 "Consolidate framework/audio/ to three tools" — yes, with a gap — the audio tabs are MicStream · Recorder · Transcriber, `children: "MicStream Recorder Transcriber v1"`, and v1 is reachable. But the old URLs are dead and there are no aliases (finding 2)
- 2 "One copy of the mic code: ux/Dictate rebuilt on MicStream + Transcriber" — no — the copy remains, and the readme says so (finding 1)
- 3 "ONE live demo on /framework/audio/ at the top" — yes — shots/…-framework-audio/1920.png, top band: 1 pick a mic (picker, level bar, Hold/Toggle, Start) · 2 say something (transcript and Transcriber state) · 3 record (Record/Stop/Save, player, Recorder state). Each part's state View sits in its own card
- 4 "Readme: the three tools, the web API each wraps, and how Dictate assembles them (a small diagram)" — yes — audio/readme.md has the API table and the ASCII diagram. The diagram shows the intended wiring, not today's wiring
- 5 "ONE dictation widget, configurable, the same everywhere" — yes — `ux/Dictate/Widget.js` is built by `ext/drawer/tabs/ai.js` and `rail.js` (the ✦ sheet) and by the Dictate page. It has options such as `models: true`
- 6 "The Dictate page's Overview is the widget FIRST … debug bar ON here, collapsed" — yes — shots/…-ux-Dictate/400.png: the widget comes straight after the tabs, with "Debug ▾" collapsed under it
- 7 "Mobile: the tabs take three rows; group them" — yes — layout.json tab_rows 2 at 400 on audio, Dictate and drawer/rail

## Page structure
- page 1 — yes — audio: "Pick a mic, talk, watch the transcript settle."; Dictate: the widget's own prompt
- page 2 — yes — audio: the three numbered cards come first, then MicStream/Recorder/Transcriber tiles
- page 3 — yes — widget, then its state, then detail
- page 4 — n/a
- page 5 — yes — audio `children:` names the three tools and v1
- page 6 — yes — tabs are routed. The debug bar's open state is not checked
- page 7 — yes — doc layout (layout.json layout "doc")
- page 8 — yes — "1 — pick a mic, start it", "2 — say something", "3 — optional: record it too"
- page 9 — no — at 1920 the Dictate widget sits alone in a small card in a wide empty column (shots/…-ux-Dictate/1920.png)
- page 10 — yes — live cards, not sentences
- page 11 — yes
- page 12 — yes — /framework/audio/v1/ and /framework/ux/Dictate/v1/ are shot and render
## Navigation
- page 13 — tabs, a sidebar, a bottom rail (✦ / ⋯ at 400), a sheet
- page 14 — yes — tab_rows 1 at 1920 and 1200, 2 at 400
- page 15 — yes
- page 16 — yes — six tabs, which fit
- page 17 — yes — the sidebar folds away at 400
- page 18 — yes
- page 19 — yes — the last card clears the bottom rail at 400
- page 20 — yes — the sheet has `?sheet=full` and back steps it down (drawer readme); not shot open
- page 21 — yes — ‹ Back
- page 22 — n/a
- page 23 — no — the meter sits squeezed in the core row (finding 6)
- page 24 — yes — Debug is collapsed on the Dictate page and off in the sheet
- page 25 — yes — Hold/Toggle is a two-button pair, and the active one is filled orange
## Layout
- layout 1 — no — at 1920 the audio demo takes about half the width with nothing to its right; at 3440 the cards spread across the full width (shots/…-framework-audio/sheet.png)
- layout 2 — yes — Docs three-region
- layout 3 — no — ragged card widths at 400 (finding 3)
- layout 4 — yes
- layout 5 — yes
- layout 6 — yes
- layout 7 — yes — no band has big_empty set
- layout 8 — yes
- layout 9 — yes
- layout 10 — yes
- layout 11 — yes — 3 tiles, 3 across at ≥1200
- layout 12 — yes
## Sizing
- layout 13 — yes
- layout 14 — yes
- layout 15 — n/a
- layout 16 — yes
- layout 17 — yes
- layout 18 — yes — overflow_x false at every width
- layout 19 — not measured
## Wrapping
- layout 20 — yes — the wraps list only shell buttons (✦AI, ⋯More, mode-btn); the page's own rows stay on one line
- layout 21 — yes
- layout 22 — yes — the widget's control row wraps cleanly into two lines at 400
- layout 23 — yes
- layout 24 — no — the v1 link row is cut off at 400 (finding 5)
## Spacing and padding
- css 1 — yes — left_stack 28px at 400
- css 2 — yes — MicStream page p: 32+1+28 = 61px, under 3em
- css 3 — yes
- css 4 — yes
- css 5 — not measured
- css 6 — yes
- css 7 — yes — the cards are white on the grey page
- css 8 — n/a
- css 9 — not measured
- css 10 — not measured
## Colour and contrast
- css 11 — yes — dark text on white cards
- css 12 — yes — the orange Toggle carries dark text; the ratio is borderline but readable
- css 13 — not measured
- css 14 — yes
- css 15 — not measured — shots are light only
- css 16 — yes
- css 17 — yes — numbered uppercase card eyebrows
- css 18 — not measured
## Flow
- layout 25 — yes — the widget or demo comes first on both pages
- layout 26 — yes — except the cut-off v1 link row (finding 5)
- layout 27 — yes
- layout 28 — yes
- layout 29 — n/a
- layout 30 — yes — widest_text 685px at most
- layout 31 — n/a
## Words
- content 1 — yes — live widgets first
- content 2 — yes
- content 3 — no — Dictate page.js lines 130 and 134 run about 90 words each (finding 4)
- content 4 — yes — for the audio page. The Dictate page is slower to get, because of its length
- content 5 — yes
- content 6 — n/a
- content 7 — yes — MicStream, Recorder and Transcriber are named the same way throughout
- content 8 — yes — tool names link to their pages
- content 9 — yes — the readme has a diagram, and the page has the live demo
- content 10 — yes
- content 11 — yes
