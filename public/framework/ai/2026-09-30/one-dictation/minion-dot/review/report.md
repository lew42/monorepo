verdict: fix
1. [fix] Tapping the dimmed ✦ dot while the mic is off does nothing (requirement 1, "tapping the dot starts or stops the mic"). The dot's click handler always calls `w.stop_mic()`, which does nothing while the mic is off. The dot is drawn above the invisible tap layer, so the tap never reaches the layer that starts the mic. See `Widget.js`, `Widget.Pulse.render()`, `$dot.click(() => w.stop_mic())`. `proof-results.json` never taps the dimmed dot.
2. [fix] While the mic is off, the invisible tap layer covers the whole feed, not just empty space (requirement 1 says "anywhere in the *empty* feed"; layout 26). `.ux-dictate-widget-pulse-lock` sits over the whole thread (`inset: 0; pointer-events: auto`), so the wheel, text selection and any button inside a bubble (an `answer(choice)`) are captured, and every click starts the mic instead. The old layer did this too, but it was dark and only used by one opt-in demo. It is now invisible and on by default on every surface: the demo, the ✦ sheet and the ☰ drawer.
3. [note] The dot shots the brief asked for are missing from the task folder. `proof.mjs` writes `shots/dot-off-*.png`, `dot-on-*.png` and `floating-after-close-400.png`, but `shots/` holds only the layout-check page shots. The floating state and the "on" state could only be checked from `proof-results.json`'s numbers ("floating: true", "idle: 0, live: 1"), not seen.
4. [note] The dimmed dot is very faint at 0.4 opacity of `--prim` on white (colour 1). It is visible but marginal for a UI shape at 3:1 (`shots/…/1920.png`, top right of the demo card). The owner asked for "a subtle dimmed cue", so this is a judgement call, not a defect.
5. [note] The sounds needed no code change. The proof counts 2 + 2 oscillators on the demo and 2 + 2 on the sheet. The stop chime from tapping the *floating* dot (a third way to stop) was not counted.

## Requirements
Shot set: all four widths, because the dot sits inside the demo card on a page layout; the floating dot is a 400-only state, and its own shot is missing (finding 3).
- 1 "The dot becomes the ✦ shape… `--prim`… bottom right of the feed… scales with the voice" — yes — `Widget.Pulse` draws the "✦" glyph in `--prim`, bottom right; the level scale reads idle 0, live 1 (`proof-results.json`); `shots/…/400.png`, demo card
- 1a "When the mic is off, it is dimmed but still visible" — yes — `-pulse-dot-dim` sets opacity 0.4; proof: "dim: true, hidden: false" at 400 and 1920
- 1b "Tapping the dot starts or stops the mic" — no — tapping only stops it; a tap on the dimmed dot does nothing (finding 1)
- 1c "Tapping anywhere in the empty feed starts it too" — yes, but the layer covers the whole feed, not only empty space (finding 2)
- 2 "On by default, on every surface; remove the `level` bars; drop the option from the docs" — yes — `Widget.prototype.pulse = true`; the meter CSS, JS, `composer_meter` and the doc lines are removed; proof finds 0 `.ux-dictate-widget-meter*` elements
- 3 "After the sheet closes, the dot stays… fixed, bottom right" — yes — `hide({keep_mic})` calls `float(true)`; proof: "floating: true", "sheet hidden: true"
- 3a "Tapping that dot stops the mic, and the dot goes away" — yes — `locked(true)` calls `float(false)` and the dot returns into the hidden sheet; proof: "holder collapsed: true"
- 3b "Build on sheet-close-keep-mic, don't redo it" — yes — the change adds one line each to the existing `show()`/`hide()`
- 4 "One start chime and one stop chime, on the demo and the sheet" — yes — 2 and 2 oscillators on each surface (`proof-results.json`)
- 4a "AudioContext created or resumed inside the tap handler" — n/a — no change was needed, and the counts pass
## Page structure
- page 1 — yes — `shots/…/1920.png`: "Dictate", and the first line says what the demo is
- page 2 — yes — the demo comes first, then "How it works" with four part tiles
- page 3 — yes
- page 4 — n/a
- page 5 — yes — an existing page
- page 6 — yes — the tabs are routed (unchanged)
- page 7 — yes — the doc layout (layout.json `layout: doc`)
- page 8 — no — the dimmed ✦ looks like a start button but does nothing (finding 1)
- page 9 — yes — the "tap to talk" text card is gone; one mic cue
- page 10 — yes
- page 11 — yes
- page 12 — yes — `pulse: false` and `v1: true` still reachable
## Navigation
- nav 1 — tabs, a sidebar, a bottom rail (400), a sheet (✦), and now a fixed overlay (the floating dot)
- nav 2 — yes — tab_rows 2 at 400, 1 at 1200, 1920 and 3440
- nav 3 — yes
- nav 4 — yes
- nav 5 — yes — `shots/…/3440.png`, sidebar beside the main column
- nav 6 — yes
- nav 7 — yes — the floating dot sits at bottom right (z-index 42) above the rail; it is small and only shows while the sheet is closed with the mic on (no shot, finding 3)
- nav 8 — yes — the sheet behaviour is unchanged apart from the dot
- nav 9 — n/a
- nav 10 — n/a
## Layout
- layout 1 — yes — `shots/…/3440.png`, nav beside the main column (unchanged by this diff)
- layout 2 — yes — Docs three-region
- layout 3 — yes — the demo card is unchanged in width; the dot adds no width
- layout 4 — yes
- layout 5 — yes — the dot sits 0.5em inside the feed corner
- layout 6 — n/a
- layout 7 — yes — bands at 1920: doc-well 0.077, tab-bar 0.077, tab-panel 3.579 (long doc); none is big and empty
- layout 8 — n/a
- layout 9 — yes
- layout 10 — yes — the dot is 1.1em inline and 1.4em floating
- layout 11 — yes — the part tiles end in a full row at 1920
- layout 12 — yes
## Sizing
- layout 13 — yes — the dot is sized in `em`; the feed height is unchanged
- layout 14 — n/a
- layout 15 — n/a
- layout 16 — yes — the thread scroller is unchanged; no new scroller
- layout 17 — yes
- layout 18 — yes — overflow_x false at every width
- layout 19 — yes — the dot uses `em`
## Wrapping
- layout 20 — yes — wraps list only buttons this diff does not touch (`drawer-rail-ai` 3.2 at 400 is the two-line icon+label rail button; `mode-btn`, `chatbox-compose-more`)
- layout 21 — yes — nothing new wraps under 1920
- layout 22 — n/a
- layout 23 — yes — `shots/…/400.png`, the demo stacks cleanly
- layout 24 — n/a
## Spacing and padding
- layout 33 — yes — left_stack 28px at 400
- layout 34 — yes
- layout 35 — yes
- layout 36 — yes
- layout 37 — yes — no new gaps; the dot's `0.5em`/`0.8em` offsets are control-scale positions
- layout 38 — yes
- layout 39 — yes
- layout 40 — n/a
- layout 41 — yes — the new rules are inside `@layer theme`
- layout 42 — yes — the CSS shrank (the meter rules and the lock card's paint were removed)
## Colour and contrast
- colour 1 — no (note) — the dimmed ✦ at 0.4 opacity is faint against the white card (finding 4); the live dot at full `--prim` is fine
- colour 2 — n/a
- colour 3 — yes — `--prim`; the old literal `rgba(0,0,0,.55)` and `#fff` are gone
- colour 4 — n/a
- colour 5 — yes — `--prim` is a theme token
- colour 6 — n/a
- colour 7 — yes — the same ✦ glyph as the rail's AI button
- colour 8 — n/a
## Flow
- layout 25 — yes
- layout 26 — no — the invisible full-feed layer captures scroll and clicks on bubble content while the mic is off (finding 2)
- layout 27 — yes
- layout 28 — yes
- layout 29 — yes — the dot scales with `transform`, so the layout never moves
- layout 30 — yes — widest_text 344, 567, 614 and 685
- layout 31 — n/a
- layout 32 — yes
## Words
- content 1 — yes — the demo is live on the page
- content 2 — yes
- content 3 — yes
- content 4 — yes
- content 5 — yes
- content 6 — n/a
- content 7 — mostly — the code says "pulse", "the ✦ dot" and "the pulsing dot" for one thing; the option name stays `pulse`, and the docs say "the ✦ dot"
- content 8 — yes
- content 9 — yes — the readme and docs sit beside the live demo
- content 10 — yes
- content 11 — yes
