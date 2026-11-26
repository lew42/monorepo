verdict: fix
1. [fix] Docs gap: `ux/Auth/doc/decisions.md` is the module's decisions page and says nothing of the Google/Video/SignIn choices (Google first, one button over video, mock-vs-real). Nothing in the diff touches `doc/`, and the readme's "Use" and "Files" got the new files but "Watch out" got no entry for the GIS script load or the `/api/config` fallback.
2. [fix] Index gap: `ux/Auth/files.jsonl` lists `google/` and the new files, but `google/files.jsonl` carries `V01.png`/`V02.png` added then marked `gone`; the two stills `V01.jpg`/`V02.jpg` are indexed, yet `V02.jpg` is used by nothing (page.js only uses V01). An unused committed image is clutter: use it or drop it.
3. [fix] A fresh agent cannot continue from the task folder alone: `signin/session.jsonl` has the "landed" line but the requirements' item 6 asks for a `smoke.mjs` result and the screenshot paths. No log line states a smoke pass, and the test result for `GoogleButton.test.mjs` is not recorded either. Add both to the task log.
4. [note] The Figma Forms page was named as the source to follow ("if it is there when you build"); no log line says whether it was there or compared (requirement 3).
5. [note] `layout.json` for the google page reports `tab_rows 4` at 1200/1920/3440, but sheet.png shows the page tab bar on one row at every width; the measurement is counting the whole tabs band, not wrapped tabs (the Auth overview reads 1). At 400 the tab bar clips at the right edge ("MAGIC-AUTH", then a cut-off tab), which is the shared scroller, not this diff.
6. [note] 3440: the three columns sit with `empty 0.50`, the widest column paragraphs run 628px; fine, but the sign-in view column is much shorter than the button column, leaving a ragged bottom (shots/…-google/3440.png).
7. [note] The shots' 404 console error appears on the baseline `/framework/ux/Auth/` too, so it is not from this diff.
8. [note] Widths: all four (400, 1200, 1920, 3440) were given for two pages.

## Requirements
- 1 GoogleButton, Google branding, dark variant, GIS when a client id, mock otherwise, `signin` event — yes — diff `GoogleButton.js`; `look_up`/`go_real` mirror /app/; mock says so on screen
- 2 Sign-in view extends Auth by seams: Google first, Apple, email link, password one tap down — yes — `SignIn.js` (`login`, `social_button`, `password`)
- 3 Page `/framework/ux/Auth/google/`: portrait video, poster, real `<video>`, scrim, ONE button, host line, variants, sign-in view, phone first, centred on desktop — yes — shots/…-google/400.png, 1200.png (video centred, not stretched)
- 4 readme updated in same commit — yes — readme.md gains the Sign in with Google section and Files line; but see finding 1
- 5 Lean core test — yes — `GoogleButton.test.mjs` three tests, fake DOM; run result not logged (finding 3)
- 6 Screenshots at four widths, smoke, landed log — partly — shots exist, landed line exists; no smoke result (finding 3)
- Live instances page for the new class — yes — `/framework/ux/Auth/google/` shows GoogleButton in six variants with a live signin readout

## Page structure
- page 1 title says what it is — yes — "Sign in with Google" under the Auth header, shots/…-google/400.png
- level 1 is one screen, shown not told — yes — 400.png: the video and button fill the first screen
- detail nested below — yes — variants and sign-in view follow the video
- tabs/files/readme reachable — yes — readme as `md.details`, Files and Tasks tabs present

## Navigation
- page 3 — tabs (Overview/Files/Tasks/Inbox under the page's own tab bar), a sidebar, a bottom rail at 400
- one navigation technique per level — yes — 400.png
- active tab marked — yes — "SIGN IN WITH GOOGLE" underlined in orange
- tab bar wraps — no for the page tabs (sheet.png: one row at every width); layout.json `tab_rows 4` is a measurement artifact (finding 5); at 400 the bar scrolls and clips at the edge

## Layout
- one clear column of focus at 400 — yes — 400.png
- video is the hero, not stretched — yes — 1200.png/1920.png, 9:16 frame centred
- overlay thumb-reachable, at the bottom — yes — 400.png, bottom band
- columns reflow without overflow — yes — layout.json `overflow_x false` at all four widths
- tall sign-in column vs short — no — 3440.png ragged bottom (finding 6)

## Sizing
- video frame sized by height, width follows aspect — yes — `--h: min(82vh, 56rem)`, 1200/1920 shots
- button height from control grammar (`size-large`) — yes — 400.png, button about 48px
- widest_text readable — yes — layout.json `widest_text 363/595/692/628`

## Wrapping
- host line wraps to two lines, centred — yes — 400.png, two lines
- no stray wraps from the diff — yes — layout.json `wraps` lists only drawer/mode buttons, which are the shell's (they are on the baseline page too)
- tab rows — `tab_rows 1` at 400; not measured reliably at 1200+ (finding 5)

## Spacing and padding
- overlay padding on a clear layer — yes — `ux-auth-video-over` 1.25em, `left_stack` layers 18/19/20/23px
- bottom padding respects the safe area — yes — `env(safe-area-inset-bottom)` in the diff, 400.png
- gap between video and caption — yes — 400.png
- doubled `page` padding — no — layout.json `left_stack` at 1920 shows two `page` layers (38 + 54), matches the baseline page's single layer; a nested `page` wrapper is in the stack. Judged a note, not a fix.

## Colour and contrast
- button white/dark per Google branding, solid, no alpha — yes — diff CSS `#fff`/`#131314` with stroke; 400.png dark button
- white text over scrim readable — yes — 400.png, the line sits on a dark ramp
- light button on the `wash` ground is distinct — yes — 1200.png
- error colour from token — yes — `var(--error)`
- hard-coded hex outside tokens — no — `#111`, `#202124` and the Google values are literals; Google's are required by its branding rules, the other two are small
- no colour schemes, no glass — yes — diff

## Flow
- sequence reads video, button, then variants, then sign-in view — yes — 1200.png left to right
- mock press result is visible — yes — note under the button and the `signin event:` readout
- "or use your email" after the social row, password one tap down — yes — 3440.png sign-in view

## Words
- host line reads well — yes — "Hi! Sign in with one tap and I will pick up where you left off."
- the three wordings are Google's own — yes — `labels`
- mock message says why — yes — "no Google client id is set, so no real account was used."
- readme in plain sentences — yes — readme.md section
- Apple copy "sign-in is a mock here" — yes — `SignIn.social`
