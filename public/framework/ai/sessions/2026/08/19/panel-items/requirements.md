# panel-items — the items INSIDE a flex/grid leaf are selectable, and the rail shows per-item words (grow · basis · self · order · span)

Laws: less is more · clarity · prioritize. **Deliverable: click a cell inside a flex/grid leaf and the rail shows that item's own words; the words persist on the panel and land as CSS on the item; proven headless; docs current; final message ≤ 12 lines.** Sonnet (Opus if the persistence shape is unclear after reading `persist.js`). Runs NOW — `panel-bar-sweep` landed 2026-08-19 14:05 (the rail is `properties.js`'s `words()` rows + `ext/Dropdown` for `template`/`display`; `glyphs.js` WORDS rows carry `knob: true` / `toggle: true`; the bar has six buttons and no pops). Another agent (`panel-flow-sizing`, Opus) is concurrently in `size.js`, `size.css`, `split.js`, `split.css`, `Panel.js`, `panel.css`, `demo/page.js`, `doc/sizing.md` — never touch those; append-only (one shell append per entry) on `doc/decisions.md` and `readme.md`, which both of you write. ⚠ `text.js` changed today: a click on a text run focuses the panel first and only picks the run inside the already-focused panel (drill-down) — an ITEM selection follows the same rule: panel first, then its item, then (if a run) the run.

The owner (2026-08-19), verbatim:

> the panel, especially a FlexPanel (consider extension classes?), GridPanel, etc.. should handle sub-panel UX. even though each item isn't a panel itself, they could easily act like it... maybe they don't need full panel UX, but maybe they could? they should at least be selectable, so the sidebar can display flex/grid properties per item

## The shape (no subclass — the accepted verdict; an item is an ELEMENT with words, not a Panel)

- **Selectable items.** Inside a leaf whose `display` is flex or grid, the body's direct children are selectable: a click selects the ITEM (the leaf stays the focused panel; the item is the leaf's selection — `focus.js` knows the panel, a new `item` selection rides beside it, or `ext/layout`'s `select()`/`.layout-selected` if that is cleaner — pick one, say why; the groups drill-down applies: the leaf first, then its item). `text.js` already selects runs inside a body with its own ring and gauge — read it; an item selection is the same shape one level up (a child of the body). Escape steps out to the leaf.
- **Per-item words.** flex: `grow` (0 · 1 · 2 · 3), `basis` (auto · 8em · 16em · 24em), `self` (auto · start · center · end · stretch), `order` (−1 · 0 · 1); grid: `span` (1 · 2 · 3 — columns), `row-span` if cheap, `self` (place-self). One `ITEM_WORDS` table beside `WORDS` in `glyphs.js`; the rail (`properties.js`) draws the item's rows under the leaf's rows while an item is selected.
- **Persistence.** `persist.js` already keeps per-element overlays on `panel.data.text` keyed to one dressable element (read its `record`/`box`/`tracked`; it replays after every repaint). Per-item words use the same mechanism under their own key (`data.items`, keyed by the child's index or a stable key the template gives it — `cells` can stamp `data-cell="n"`), landing as CSS custom properties on the child (`--item-grow` …) read by one rule block in `display.css` (`.panel-d-flex > * { flex-grow: var(--item-grow, …) }` etc.). No new file unless `persist.js` cannot host it in ≤ 40 lines — then `items.js` beside it, imports down only.
- **What is NOT built**: item drag-reorder (note it as next), items as full panels (say in `doc/decisions.md` why an element-with-words beats a Panel per cell: no chrome, no tree cost, the words transfer verbatim when the chrome is removed).

## Prove headless

(`file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`; probes `items-*.mjs`; socket blocked; build a flex leaf with `cells` via the page's modules): click cell 3 → the rail shows the item rows; set `grow 2` → computed `flex-grow` 2 on that cell only; `self center` → `align-self: center`; grid: `span 2` → `grid-column: span 2`; a repaint (template re-pick) keeps the words (persist replays); `toJSON → hydrate` keeps them; Escape steps back to the leaf. Zero console errors on the Panel page and the demo tab; one png `item-selected.png`.

## Fences

`ext/Panel/glyphs.js` (ITEM_WORDS), `properties.js` (item rows), `persist.js` (or new `items.js`), `display.css` (one rule block), `templates.js` (the `cells` stamp only), `focus.js` OR `text.js` (the item selection — one of them, smallest), `doc/words.md`, `doc/focus.md`, `readme.md` (one Use line), `doc/decisions.md` (one entry), this dir. NOT `toolbar.js`, `Panel.js`, `split.js`, `size.*`, `workspace.js`, `Workspace/**`, `playground/**`, `demo/**`.

## Rules

- Load `code` and `css` once. Run `new-task` first (dir + brief exist; write `task.jsonl` line 1 and the `day.jsonl` line in `ai/2026-08-19/`; group `panels`); `documentation` then `finish-task` (`"tokens": null`). A skill that misleads you gets one line in its `improvements.md`. Timestamps from the clock; forward slashes; never Out-File a `.jsonl`; never a person's name — "the owner". Every CSS rule inside a layer; no container queries. Wait in the foreground with `timeout: 600000`.
