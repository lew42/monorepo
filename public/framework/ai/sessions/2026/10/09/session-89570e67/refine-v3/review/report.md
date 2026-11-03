verdict: fix
1. [fix] At 400 the Refine toolbar crushes: the Model select is an empty box with no visible choice, the Mic/Level/Whisper/Transcript/Refine status row is cut off at the right edge (only Mic and Level show), and the textarea placeholder is clipped (wrapping 23, layout 3): shots/…-ext-Refine/400.png, top band.
2. [fix] The links under the workspace run together with no separators: "Saved long run (ladder)Compare models (try)How it fits (architecture)" (words 5, page 8): shots/…-ext-Refine/1920.png, band after the footer.
3. [fix] Ask 2 says "test Haiku 5.5 vs Sonnet 5.5 … record the numbers"; `doc/refine-v3-2026-10-09.md` says Sonnet was faster but records no Haiku-vs-Sonnet times or costs for the 125 words: the comparison is a claim, not a measurement.
4. [fix] Ask 5 wants the instance explorer beside or merged with the stages, "updating as the owner dictates"; it is folded shut in a `<details>` in the sticky footer, so in every shot it is a single closed button and the counts and tree are never visible (page 9, words 1): shots/…-ext-Refine/1920.png, footer band.
5. [fix] `RefineSystem.go()` counts words with `text.split(/s+/)` (splits on the letter "s", not whitespace), so `history[].words` is wrong for every prompt: diff, `RefineSystem.js` go().
6. [note] The working message hard-codes "usually about 8 s and about 3 cents"; the doc measures $0.003–0.0075 per call and a cold run at $0.57, and one refine now makes 2 + one-per-sentence calls. Show the estimate from the last measured run, or drop the cost figure.
7. [note] The "refinement disappeared" bug was not reproduced; a guard was added (`quick()` never overwrites a finished prompt). The doc says so honestly; it stays open.
8. [note] Literal colours in new CSS: `orange`, `seagreen`, `crimson` in `Whisper.css`, `var(--paper, #fff)` in `Prompt.css` (colour 3).
9. [note] `Prompt.css` patches itself: `.refine-prompt` is declared twice in one layer, and a second `@layer site` block re-overrides `.refine-toolbar` and its textarea set three lines above (css 42). Fold into one rule each.
10. [note] The Whisper page shows a bare instance with status "unknown" and 0 sessions, one narrow column on an empty 1920 screen; Whisper is also missing from the audio Overview's class cards (MicStream, Recorder, Transcriber only): shots/…-audio-Whisper/1920.png, shots/…-audio/1200.png.
11. [note] The Whisper server model is not shown (the brief asked for it); the doc says the server does not report it. Replay timeline (bonus) not built, also stated.

Widths given: 400, 1200, 1920, 3440 for all four pages (Refine, Refine/ladder, audio, audio/Whisper). All shots are the empty state: nothing was dictated, so the filled stages, scores and run links are judged from the diff only.

## Requirements
- 1 "The cleaned text appears within about a second of each Whisper chunk … show time per stage" — yes — `quick_clean()` runs on `on_text`/`on_guess`/input (wired in VoiceStrip, verified); Cleaned shows "instant, N ms", Outline and Clean show stage seconds; not visible in empty shots
- 2 "Each LLM run is its own new session … model, tokens, cost and duration show on the page and link to its session page" — yes — `RefineCall` (Agent SDK, new session each), runs listed with model · s · $ and link to `/framework/ai/sessions/<id>/`
- 2b "test Haiku 5.5 vs Sonnet 5.5 … record the numbers" — no — finding 3
- 3 "Clarity per sentence by a cheap model … compare against the current scorer" — yes — `ClarityScorer` on Haiku, one sentence with neighbours; doc compares (rule ≈1.0 everywhere vs model 0.55–0.8); rule kept as `rule_clarity`
- 4 "Whisper as classes … own log of every request … every self-amendment … view lives on the class … move the hand-built log off ext/Refine" — yes, mostly — `Whisper`, `WhisperSession`, `.View` on each, `revision()` detects amendments, Refine no longer uses WhisperLog; server model missing (note 11)
- 5 "full width, columns that wrap (auto-fit) … labelled sections" — yes — `repeat(auto-fit, minmax(min(100%,22em),1fr))`, sections 2 Cleaned · 3 Outline · 4 Scores; shots/…-ext-Refine/1920.png
- 5b "instance explorer: how many of each instance exist … updating as the owner dictates … reuse DefaultView" — partly — `RefineExplorer` uses DefaultView and live counts, but is collapsed out of sight (finding 4)
- "the refinement disappeared (bug: find and fix)" — no — not reproduced, guarded (note 7)
## Page structure
- page 1 — yes — Refine description: "Speak one prompt: see it cleaned instantly, then refined…"; Whisper page title + description
- page 2 — no — Refine opens on the tool, not concept tiles; acceptable for a workspace
- page 3 — yes — input, stages, logs, links, in that order
- page 4 — n/a
- page 5 — yes — `children: "try ladder"`; audio `children` adds Whisper (tab visible)
- page 6 — no — the explorer's open/closed state has no URL; small
- page 7 — no — Refine uses page-specific grid CSS (`.refine-prompt`, sticky toolbar/foot) rather than a layout word
- page 8 — no — Model select at 400 shows nothing (finding 1)
- page 9 — no — the explorer occupies a closed button only; Whisper page has one line of state on an empty screen
- page 10 — yes — scores as bars, runs as rows, Whisper log as a table
- page 11 — yes — every stage numbered and titled with a one-line "what"
- page 12 — yes — old ladder moved to `ladder/`, linked both ways
## Navigation
- nav 1 — a sidebar (site rail); tabs on audio pages; a sticky toolbar and sticky footer on Refine
- nav 2 — yes — tab_rows 1 at 400/1200 on audio and audio/Whisper
- nav 3 — yes — audio tabs are child pages
- nav 4 — yes
- nav 5 — yes — rail beside main at 3440, folds to ☰ at 400
- nav 6 — yes in shots; the throttled explorer repaint (400 ms) limits jumps
- nav 7 — yes — the sticky footer is in flow (`position: sticky`), not covering the last row
- nav 8 — n/a
- nav 9 — n/a
- nav 10 — n/a
## Layout
- layout 1 — no — Refine at 3440 stretches three near-empty columns across ~2900px (empty 71%); Whisper page is one narrow column (sheet)
- layout 2 — no — Refine workspace is a new shape, not named as a proposal
- layout 3 — no — at 400 the toolbar and status row are too wide for the box (finding 1)
- layout 4 — yes
- layout 5 — yes
- layout 6 — yes — the stage columns sit in `.wide`
- layout 7 — yes — no big_empty bands; refine-demo share 0.79 at 400, 0.62 at 1200
- layout 8 — yes — empty-state columns equal
- layout 9 — yes
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes
## Sizing
- sizing 13 — yes — textarea fixed `3.4em` is a deliberate input height
- sizing 14 — n/a
- sizing 15 — yes — `.whisper-rows` 14em scroll, `.refine-foot-more` 45vh scroll, `.voice-conn` clip at 4.5em
- sizing 16 — no — `.voice-conn` overflow hidden clips the status row at 400 instead of wrapping (finding 1)
- sizing 17 — yes — toolbar is at the top
- sizing 18 — yes — overflow_x false at every width on all four pages
- sizing 19 — yes — em throughout
## Wrapping
- wrap 20 — yes — wraps list only the shell's drawer buttons; ladder title "Saved run (ladder)" wraps to 2 lines at 400 (fine for an h1)
- wrap 21 — yes — no new wrap under 1920
- wrap 22 — yes — `.refine-score`, `.refine-run`, `.whisper-h` are flex-wrap
- wrap 23 — no — at 400 the status row and Model select crush instead of stacking (shots/…-ext-Refine/400.png)
- wrap 24 — n/a
## Spacing and padding
- spacing 33 — yes — left_stack 28px at 400 on all pages
- spacing 34 — yes — one layer
- spacing 35 — yes
- spacing 36 — yes
- spacing 37 — no — `.refine-toolbar` padding `.5em`, `.refine-foot` `.3em`, `.whisper-*` gaps are constants, not the clamp; small
- spacing 38 — yes
- spacing 39 — yes — toolbar/footer paint `--paper` with a rule
- spacing 40 — n/a
- spacing 41 — yes — every rule in `site` or `util`
- spacing 42 — no — note 9
## Colour and contrast
- colour 1 — yes — body text on light ground; Whisper stat line at opacity .7 is borderline grey (shots/…-ext-Refine/1920.png, footer)
- colour 2 — yes
- colour 3 — no — note 8
- colour 4 — yes — toolbar and footer differ from the page ground
- colour 5 — not measured — literal `#fff` fallback and named colours will not flip in dark mode
- colour 6 — yes
- colour 7 — yes — numbered stage headings are one anchor
- colour 8 — no — `.whisper-stat`, `.refine-what`, `.refine-cost` use `opacity` instead of `.muted`
## Flow
- flow 25 — yes — input first, then results
- flow 26 — no — at 400 three status cells are off the right edge, hidden by overflow
- flow 27 — yes
- flow 28 — yes
- flow 29 — n/a in shots; the stages redraw in place on each chunk
- flow 30 — yes — widest_text 529px at 1920, 650px at 3440 (Refine)
- flow 31 — n/a
- flow 32 — yes — left_stack single layer
## Words
- words 1 — partly — stages and logs are shown; the instance explorer, the "show" of the classes, is hidden (finding 4)
- words 2 — yes
- words 3 — yes
- words 4 — yes — "Refine: speak, it gets cleaned, outlined and scored" reads from the stage titles
- words 5 — no — the run-together links (finding 2); "The live objects behind this page" is clear
- words 6 — n/a
- words 7 — no — "Refine demo" session, "Refine" status cell, "Refine" button and page title; "Said" vs "Whisper raw" in the brief; minor
- words 8 — yes — each stage links its class; readme links Whisper and the v3 doc
- words 9 — yes — readme and doc sit beside live pages
- words 10 — yes
- words 11 — yes
