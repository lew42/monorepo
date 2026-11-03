verdict: fix
1. [fix] `ext/Refine/readme.md` line 54 still says "`Connection.js` draws the Mic → Level → Whisper → Transcript → Refine row" as a file in `ext/Refine`, but this diff moves it to `ux/Dictate/Connection.js` and Refine now uses `VoiceStrip`. Point that line at `ux/Dictate/VoiceStrip.js` and `doc/voice-architecture.md` (content: no stale pointers).
2. [note] The review shots cover only `/framework/ux/Dictate/` Overview. Its first screen is the chat `Widget`; the changed compact `VoiceStrip` demo box is not in any shot, and the Refine page was not shot at all. The Refine evidence below comes from the task's own `refine-1400.png`. The phase-2 shots that `phase-2-report.md` links (`voicestrip-*.png`) are in the diff as binaries but not yet in the main tree, so they show up only after the merge.
3. [note] The `Connection` doc comment says a reason "is cut with '…' rather than wrapped". The CSS clamps it to 3 lines inside a fixed 4.2em box. That does not move anything, but the reason does wrap: `refine-1400.png` shows "connected, last / reply 0.4 s" on two lines. Fix the comment, not the CSS.
4. [note] `refine-1400.png`: Refine took 62.6 s, and the raw transcript repeats the same sentence pair. If that is the test fixture, say so in the test; if not, it is a duplicate-segment bug worth a look.
5. [note] `layout.json` tab_rows 2 at 1200 on the Dictate page (the tab bar wraps; "Surfaces · Docs" go to a second row). This was there before and is outside this diff.

Widths given: 400, 1200, 1920, 3440 (Dictate page only).

## Requirements
- 1 "One widget… say which is the survivor in a doc line" — yes — `ux/Dictate/doc/voice-architecture.md`: "`Dictate` is the only engine"; `VoiceStrip` is the dictation panel, `Widget` the chat panel. Refine and the Dictate demo both use `VoiceStrip`. Nothing was deleted (`Connection` moved with git mv).
- 2 "Buttons never move" — yes — `VoiceStrip.css` has a fixed-height `.voice-strip-bar` (2.75em), a fixed 3.5em mic and a min-height guess line. `refine-1400.png`: the mic, Refine and "Record next prompt" sit in their own row above the box. `test/dictate-flow.mjs` measures the button boxes before and after (per the report: 0 moved).
- 3 "Plain status words" — yes — the row reads "Mic on / Whisper connected, last reply 0.4 s / Transcript 39 words" (`refine-1400.png`). The compact sentence reads "Ready. Press the mic." / "The microphone could not start: <reason>".
- 4 "Whisper: diagnose the flow" — yes — `ext/Refine/doc/whisper-flow-2026-10-09.md` exists (from phase 1, not in this diff).
- 5 "A connection view… checked once on page load, never by polling" — yes — `Connection.check_whisper()` is called once in `VoiceStrip.render` and again only from the ↻ click. It reuses `audio/v1/LevelMeter`. Each step shows green/amber/red plus a reason.
- 6 "Refine itself works end to end" — yes — `refine-1400.png`: Refine "done, 62.6 s", with the raw, clean and refined columns filled.
- 7 "Transcriber page layout is all broken: note only" — yes — `audio/readme.md` line 78.

## Page structure
- page 1 (title says what it is) — yes — shots/…Dictate/1200.png: "🎤 Dictate" with the tabs beside it.
- page (one takeaway above the fold) — yes — 1200.png: a working demo widget, then "How it works".
- page (new doc linked) — yes — an "Architecture" tile was added to CONCEPTS, and the readme links `doc/voice-architecture.md`.

## Navigation
- techniques — tabs, a sidebar (the site tree)
- tabs fit — no (note) — tab_rows 2 at 1200; 1 at 400, 1920, 3440. Pre-existing.
- route everything — n/a

## Layout
- layout reads as one column of content beside the tree — yes — layout.json `layout: "doc"` at every width.
- no horizontal overflow — yes — `overflow_x: false` at all four widths.

## Sizing
- text measure is readable — yes — widest_text 567 / 609 / 685 px at 1200 / 1920 / 3440; 344 at 400.
- wide screens use the space — no (note) — empty 0.706 at 1920 and 0.812 at 3440: the content is a narrow doc column. Pre-existing page shape, not this diff.

## Wrapping
- controls do not wrap — yes for this diff's controls (mic, Refine, Record next prompt, in `refine-1400.png`). layout.json flags `chatbox-compose-more` (2.4 lines) and `drawer-rail-*` (3.2 at 400), both outside this diff.
- step reasons — wrap inside a fixed box (see finding 3).

## Spacing and padding
- left edges line up — yes — left_stack h1 = p at every width (28 / 38 / 67 / 90 px).
- bands are sized right — yes — the header band is 0.058–0.087 of the screen; nothing has `big_empty`.

## Colour and contrast
- status dots readable — yes — green #2a9d4b, amber #e0a000, and red via `--error` for the dots. A failed step's reason turns red at full opacity.
- muted text contrast — yes — the step reasons are at 0.75 opacity on a light ground (`refine-1400.png`), still legible.

## Flow
- reading order matches the work — yes — steps row → controls → transcript → guess → results (`refine-1400.png`).
- nothing moves while words arrive — yes — fixed bar, fixed step boxes, min-height guess.

## Words
- plain words, no jargon — yes — "Mic: idle · Whisper: connected"; "first answer" is gone.
- no stale pointers — no — finding 1 (`ext/Refine/readme.md`).
- doc comments match the code — no (note) — finding 3.
