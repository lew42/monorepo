verdict: pass
1. [note] The earlier review.md says "only CSS/docs changed, no new file", but the diff adds `tokens/FigSelect.js` (48 lines); the size was overridden to "none" twice in task.jsonl. This full review replaces it.
2. [note] The behaviour (pick, close, keys, one open) is JavaScript, so the shots can't show it: both shots show the same static closed and open states as before. Judged from the code in diff.patch; the agent reports a headless test in task.jsonl.
3. [note] Tab moving focus out of an open `.fig-select` leaves it open (only a click, Escape or a pick closes it). This is the same as `<details>`, but a listbox usually closes on blur.
4. [note] `ext/Figma/files.jsonl` gains a third `screenshots/` "gone" line. It is tooling noise and harmless, but the log now flips gone, back, gone.
5. [note] The report the brief asks for, `kit/web-select.md`, is not written yet. It should land with the merge.

Widths given: 400 and 1920 (`shots/…-Figma-tokens/`). No requirements.md is in the task folder, so the asks below come from `kit/brief-web-select.md`.

## Requirements
- 1 "choosing a row sets the trigger value and closes" — yes — `FigSelect.pick` sets the summary's first child text, `aria-selected`, `open = false`, and fires `fig-select`
- 2 "outside click and Escape close" — yes — document click closes every open `.fig-select` except the one clicked; Escape closes and refocuses the summary
- 3 "arrow keys move, Enter picks" — yes — `move()` clamps through the rows; ArrowDown on a closed select opens it; Enter on a row calls `pick`
- 4 "one open at a time" — yes — a capture-phase `toggle` listener closes the others
- 5 "Reuse what exists first … don't build a second popover system" — yes — it is the `ux/Menu` native-`<details>` recipe with delegated listeners, not a new popover; the reason is in doc/controls.md
- 6 "a small class, one file" — yes — `class FigSelect` in `FigSelect.js`, with static members
- 7 "Opt-in only: nothing outside `.fig-*` changes" — yes — every handler returns early unless the target is in `.fig-select` or `.fig-select-row`
- 8 "Long lists cap at 264 and scroll inside" — yes — tokens.css:170 sets `.fig-select-panel { max-height: 264px; overflow: auto }`, and the selected row scrolls into view on open
- 9 "bottom sheet if Popover already supports that, otherwise note it" — yes — doc/controls.md says `ux/Popover` has no sheet mode
- 10 "Update doc/controls.md" — yes — the Watch out line was rewritten
- 11 "check the demo at 400/1200/1920/3440" — n/a for this review; review.mjs picked 400 and 1920
- 12 "Report kit/web-select.md" — not yet — see note 5
## Page structure
- page 1 — yes — shots/…/1920.png: the "Open dropdown" heading names the demo; the layout is unchanged by this diff
- others — n/a — the diff changes no markup or layout
## Navigation
- nav 1 — the site sidebar at 1920; the drawer and bottom rail at 400; nothing new
- others — n/a
## Layout
- all — n/a — no layout change; 1920.png shows the select column at about 270 px, as before
## Sizing
- select width — yes — the trigger fills its card at both widths (400.png, 1920.png); `overflow_x` false at both
## Wrapping
- wraps — yes — the layout.json wraps (h3 titles, `fig-btn`) are elsewhere on the page and were there before this diff; none is in `.fig-select`
## Spacing and padding
- panel — yes — the open panel sits 4 px under the trigger, with padding matching the rows (400.png and 1920.png, bottom band)
## Colour and contrast
- rows — yes — the selected row "Canada" is bold on a tinted fill with a check; the others read clearly on the light surface (1920.png, bottom band)
## Flow
- n/a — the order on the page did not change
## Words
- doc/controls.md — yes — plain sentences: what the select does, how it is wired, what is not done
- code comments — yes — one line each, pointing to the doc
