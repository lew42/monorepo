# panel-pad-gap — `pad` (new) and `gap` (always live) as panel words with a knob, not just buttons

Laws: less is more · clarity · prioritize. **Deliverable: two words on every panel's body — `pad` and `gap` — each a row in the rail (and the bar's pop) whose buttons are the presets and which opens a knob for a free value; proven headless with computed padding/gap numbers; docs current; final message ≤ 12 lines.** Sonnet. Runs NOW — `panel-groups` and `workspace-d-verbs` have both landed (2026-08-19 12:50); no wait gate. ⚠ A previous agent on this brief died on a foreground wait: do not wait on anything; start with `new-task` and build.

The owner (2026-08-19), verbatim: *"we need modular 'pad', 'gap' (possibly more) panel modules. when present, the button turns into a section, and has a widget to edit. it doesn't seem to be a way to add padding to a panel right now."*

## Build

1. **`pad`** — a new `WORDS` row (`glyphs.js`): names `0 · 0.5em · 1em · 2em`, var `--panel-pad`, always live (no `modes`); `display.css` (or `panel.css` — whichever already styles `.panel-body` boxes; say which) gets `.panel-body { padding: var(--panel-pad, 0) }` — ⚠ check what padding the body has today and whether a template's own padding (`templates.css`) would double; the word sets the BODY's padding and a template keeps its own inner rhythm.
2. **`gap`** — exists, live only under flex/grid. Make it live always? Only if `gap` means something on a block body — it does not; leave `gap`'s modes as they are, but give it the same knob (3).
3. **The knob.** `ext/layout/controls.js` has `knob($el, "--radius", 0.25, 2, 0.05)` — a slider bound to a custom property on an element (read it; `ext/Panel/properties.js` may already import from `ext/layout` — check the import direction: Panel → layout is allowed if it already exists; if not, copy the 10-line idiom rather than add an edge, and say so). In the rail: the `pad` and `gap` rows show their preset buttons AND a small knob (`min 0 · max 4em · step 0.25em`) that writes the same key with a free value (`item.set("pad", "1.25em")`); the button row lights the preset that matches, none when free. The bar's pop: presets only (a pop is a grid of buttons; a knob belongs in the rail). The WORDS table must tolerate a value outside `names` (the knob) — `word_vars()`/`live_words()` read the value, not the index; verify and fix if it throws or paints nothing.
4. **Prove headless** (`file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`; scratchpad `…/scratchpad/`, probes `pad-gap-*.mjs`; block the dev socket `page.routeWebSocket(/.*/, () => {})`; build a tree via the page's loaded modules in `page.evaluate`): set `pad` 1em → computed `padding` 16px-ish on the body (say the base size); knob to 1.25em → computed follows and no preset lit; `gap` knob under flex → computed `gap` follows; a reload of a MemorySaver tree restores both (they persist like `display`). One png: `pad-gap-rail.png`.
5. **Docs:** `doc/words.md` gains `pad` and the knob rule ("a word with a continuous value has presets AND a knob; the knob writes the same key"); readme Use line; `doc/decisions.md` one entry.

## Fences

`ext/Panel/glyphs.js` (WORDS rows), `properties.js` (the knob beside the row), `display.css` or `panel.css` (one rule), `doc/words.md`, `readme.md` (one line), `doc/decisions.md` (one entry), `ext/layout/controls.js` NOT (read only), this dir. NOT `toolbar.js` unless the pop needs nothing but the WORDS row (then nothing to edit), NOT `paint.js` (if `word_vars` lives there — it is in glyphs.js per yesterday's landing; verify).

## Rules

- Load `code` and `css` once. Run `new-task` first (dir + brief exist; write `task.jsonl` line 1 and the `day.jsonl` line in `ai/2026-08-19/`; group `panels`); `documentation` then `finish-task` (`"tokens": null`). A skill that misleads you gets one line in its `improvements.md`. Timestamps from the clock; forward slashes; never Out-File a `.jsonl`; never a person's name — "the owner". Every CSS rule inside a layer. Wait in the foreground.
