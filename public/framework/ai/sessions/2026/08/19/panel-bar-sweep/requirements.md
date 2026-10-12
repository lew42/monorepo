# panel-bar-sweep — fewer icons: the hover bar keeps only what a hand needs; the rail is where the words live; a dropdown for templates; wrap is a toggle

Laws: less is more · clarity · prioritize. **Deliverable: the hover bar reduced to a handful of gestures, the popover clipping gone, `ext/Dropdown` (new, small) used for the template picker (icon + label), `display` one control (not three icons in the overlay), `wrap` a single toggle with an active state, the selection-care notes in the Panel readme; proven headless; final message ≤ 15 lines.** Opus — this is the UX judgment the owner asked for; deleting is the point. Runs NOW — `workspace-d-verbs` (12:52) and `panel-pad-gap` (13:17) have both landed on 2026-08-19; no wait gate. `glyphs.js` now carries `knob: true` on `pad`/`gap` and a rail-only `pad` row; `properties.js` draws a knob beside those rows — keep both when you reshape the rail.

The owner (2026-08-19), verbatim:

> do a sweep of all the popover menus, many get clipped, but also, there are too many little icons. there's no way anyone remembers all these...
>
> also, don't have a Wrap > Wrap/NoWrap drill down, when a single Wrap with active state would suffice.
>
> Also, we make a strong note in readme.md to be careful with selection/deselection... it seems like frequently a certain action will either keep something selected, and clicking off deselects it from the right sidebar, but keeps an orange selection visual (smells). Or, deselect something, where we have to select it again. I'm guessing this will take some work to get it to feel right... Also, we'll want to be careful with grouping, multi-selecting, multi-editing, etc. Just make these notes in readme.md for future.
>
> We should probably remove most of the overlay buttons, until we're sure what we want there... having 15 icons with any number of sub icons (that you have to hover, wait, read to see what they are), isn't great. this is why the panel selection and right sidebar can work.
>
> and again - the template switcher - should be a dropdown (we might need an ext/Dropdown, which handles the ui, show/select/hide, etc) with icons and a label.
>
> i feel like we could have a block, flex, grid display icon? or could be a native select element, i don't really care... but this should probably be removed from the overlay icon list.

## Decide, then build

1. **What the hover bar keeps** (`toolbar.js`, `toolbar.css`): the drag handle · close · the two split/divide icons (or none — the edge click IS split now; decide) · `more_horiz` folding the rest — and NOTHING else by default. Every word (template, tone, display, align, size, flex/grid words, pad, gap, mode, group) lives in the **rail** (`properties.js`), which the selection opens (docked on the workspace pages). Write the verdict in `doc/decisions.md` with the before/after icon count (two numbers: buttons on a hovered leaf's bar before, after). `tools.js`'s on-panel overlays (`zoom_scrub` stays — the owner likes it; the align overlay is already off; the display overlay — keep, it draws, it is not a button).
2. **`ext/Dropdown`** (new, ≤ 80 lines + css + readme + page.js + doc/decisions.md): `dropdown({ options: [{ value, label, icon }], value, pick(value) })` → a trigger showing the current option's icon + label, a list that opens on click, closes on pick / outside click / Escape, keyboard up/down/enter; **rendered so it is never clipped** — `position: fixed` measured from the trigger (or a top-layer `popover` attribute if it is simpler and supported) — this is the clipping fix. Prefix `dropdown-`; `@layer theme`; `new-css-class`. Use it for the **template picker** in the rail (icon + name; `T` entries already have icons/pictures — `glyphs.js`/`templates.js`), and for `display` (block · flex · grid — one control; a native `<select>` is acceptable if it reads better — say why you chose). If any popover must remain on the bar, it uses the same non-clipping placement.
3. **`wrap`** — a toggle: one button `wrap`, `on` when wrapping; same for `dense`, `group`, anything binary (`glyphs.js` WORDS: a row with two names that are on/off becomes `toggle: true`; the rail and any pop read it). Remove the `nowrap/wrap` two-button row.
4. **Popover clipping** — find every pop that clips today (the bar's pops at a panel's edge; the rail's rows at the rail's bottom) by measuring `getBoundingClientRect()` against the viewport on `/framework/ext/Panel/` for a corner panel at 1280 and 400; after your change, none clips (count before/after).
5. **Readme notes** (`ext/Panel/readme.md`, a short "Careful" block under Watch out, ≤ 6 lines, the owner's voice): selection/deselection must feel right — a deselect from the rail that leaves the orange ring is a smell; an action that drops the selection so you must reselect is a smell; grouping, multi-select and multi-edit are future and must be designed together; the bar is deliberately sparse until the words settle — the rail is the UI. Link `doc/focus.md`.
6. **Docs**: `doc/decisions.md` (the sweep verdict, counts), `doc/words.md` (toggles; template dropdown), `doc/file/toolbar.js.md` de-staled, `ext/Dropdown/readme.md` (index shape) + its page (show, don't tell: one dropdown with three icons).
7. **Prove headless** (`file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`; probes `bar-sweep-*.mjs`; socket blocked): hovered leaf's bar button count before → after (log both); the template dropdown opens, lists with icons + labels, picks `cells`, closes on Escape and on outside click, and its list box is fully inside the viewport for a bottom-right leaf at 1280 and 400; `display` set to grid via its control; `wrap` toggles `flex-wrap: wrap` on/off with one button; zero console errors on `/framework/ext/Panel/`, `/framework/ext/Panel/demo/`, the playground, `/framework/ext/editor/`; pngs `bar-before.png`, `bar-after.png`, `dropdown.png`.

## Fences

`ext/Panel/toolbar.js`, `toolbar.css`, `properties.js`, `glyphs.js` (toggle flag; WORDS rows), `tools.js` (only if a bar-gated overlay needs its call site changed), `readme.md`, `doc/*` (your entries), `ext/Dropdown/**` (new), `styles/css-scopes.txt` (one line), this dir. NOT `Panel.js`, `split.js`, `size.*`, `templates.*`, `paint.js`, `focus.js`, `workspace.js`, `Workspace/**`, `playground/**`, `demo/**`, `flow.js`.

## Rules

- Load `code` and `css` once; `new-css-class`, `new-page` for the Dropdown page. Run `new-task` first (dir + brief exist; write `task.jsonl` line 1 and the `day.jsonl` line in `ai/2026-08-19/`; group `panels`); the ledger logs edits; `documentation` then `finish-task` (`"tokens": null`). A skill that misleads you gets one line in its `improvements.md`. Timestamps from the clock; forward slashes; never Out-File a `.jsonl`; never a person's name — "the owner". Every CSS rule inside a layer; no container queries; only `p()`/`h1`–`h6` read backticks; no DOM after an `await` outside a callback. Wait in the foreground with `timeout: 600000`.

## Addenda — the owner's words while this task was in flight (relayed by message), verbatim

> the template switcher dropdown doesn't seem to do anything, and should have a "thin" scrollbar

> the 4 tone tiles are currently a 2x2 grid, they shoudl be 1x4 to utilize space better

Mastermind's reading: a pick must apply at once (repaint/roll — prove `cells` → 12 direct children, trigger relabelled); the list scrolls inside its own box (`overflow: auto; scrollbar-width: thin; scrollbar-gutter: stable` + a max-height); `tone` `cols: 4`, and any row of ≤ 6 pictures is one line.
