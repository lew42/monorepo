# Figma design system — state (2026-10-12, night)

Owner's ask, in short: one design system drawn in Figma (Sept-2026 file `QYN0G2URSBHYH5I06MOjxU`), approved there, then coded; prime as a splash only; mobile first; elements → components → sections → layouts; sync with the web without breaking it. Rules and history: [ext/Figma/doc/use-figma.md](/framework/ext/Figma/doc/use-figma.md); web bridge: [ext/Figma/doc/token-sync.md](/framework/ext/Figma/doc/token-sync.md) and [/framework/ext/Figma/tokens/](/framework/ext/Figma/tokens/).

## Done
- ✅ Start page in Figma: `Claude · Overview` (dark "Design system · start here" card links every page).
- ✅ DS pages: 1 Elements, 2.1 Buttons (exemplar), 2.2 Lists & rows, 2.3 Cards & containers, 2.4 Inputs & controls, 2.5 Status & progress, 3 Sections, 4 Layouts. Reports: [kit/](kit/).
- ✅ Colour: prime plain, never a ground; schemes = Text modes (`surface`, `accent`, `on-accent`); insets are bare 10% layers; components inherit Resolution.
- ✅ Prototypes with ▶ PROTOTYPE badges: Claude prototype, UI Kit, Kit · Workflows.
- ✅ Web: `ext/Figma/tokens/` (FigmaTokens.mjs → opt-in `--fig-*` CSS; measure.mjs; demo page).
- ✅ Relayed: Sessions grid bugs → mastermind-data-grid; Figma-vs-page diff → mastermind-screenshot-system (no replies seen yet).

## Landed and reviewed (second wave, brief [kit/brief-ds-2.md](kit/brief-ds-2.md))
- ✅ `DS · 1.1 Icons`, `1.2 Dark grounds`, `2.6 Dropdowns & menus` (with a ▶ prototype), `2.7 Toggles, checkboxes & radios`; reports in [kit/](kit/). Screenshotted, linked from the Overview card.
- ✅ Review fixes: kit `Tab bar` active tab lost its prime ground (accent icon + ink label instead); Dark grounds' hand-drawn toggles swapped for the `Toggle` component.

## Third wave
- ✅ `DS · 4.1 Foundational layouts` ([report](kit/ds-foundational.md)): seven layouts × four uses + phone collapse + a ▶ prototype (settings nav swaps the panel). Review fix: rule tiles stretch to the phone tile's height (no grey void). Linked from Overview.
- ✅ Kit sweep ([report](kit/ds-sweep.md)): `Focus` variant on Button/Toggle/Checkbox/Radio/Dropdown, white toggle-off knob, Tag/Toolbar/Pagination/Badge/Chat bubble lost their orange grounds. UI Kit's `PRIME` scheme column kept on purpose (it demos the scheme).
- ✅ Web controls ([report](kit/web-controls.md), [doc](/framework/ext/Figma/doc/controls.md)): `.fig-toggle/check/radio/select/icon` on [/framework/ext/Figma/tokens/](/framework/ext/Figma/tokens/). Select is styling only (no outside-click/keyboard yet).

- ✅ `DS · 5 Diagrams & charts` ([report](kit/ds-diagrams.md)): flowcharts whose arrows follow growing cards (vertical, horizontal, snake, branch/merge, timeline), charts (bars, stacked, donut, sparkline), phone + desktop in action. Linked from Overview; technique in [use-figma.md](/framework/ext/Figma/doc/use-figma.md).

- ✅ Web layouts ([report](kit/web-layouts.md), [doc](/framework/ext/Figma/doc/layouts.md)): `.fig-cols/split/three/media/side/bands` in a `.fig-lay` container that goes one column under 480 px; `.fig-stack` reused. Review fix: buttons hug inside a stack (were full width). Demo shows two uses per layout, not four.

- ✅ `DS · 6 Screens` ([report](kit/ds-screens.md)): sessions list, session detail, settings, near-black dashboard, article; 390 phones + three 1440 desktops; ▶ prototype (rows → detail, tab bar). Built only from kit instances. Review fix: the Tab bar's active label was dark on dark (a leftover Light BG mode); cleared on all instances. Gaps it found: 4.1 layouts and charts are not components yet; no near-black token.

- ✅ Web `.fig-select` behaviour ([report](kit/web-select.md)): `FigSelect` (one delegated listener; pick, outside click, Escape, arrows + Enter, one open at a time), reusing `ux/Menu`'s `<details>` recipe. Not done: phone bottom sheet.

- ✅ `Kit · Layouts` ([report](kit/componentize.md)): the seven layouts as components with a SLOT per region and a `Collapsed` phone form; `Chart / Bars, Stacked bar, Donut, Sparkline`; a `Ground` component (Dark / Near-black / Light / Gray) — near-black is Dark BG + 50% black, no new token. DS 6 dashboard and article now use them. Linked from Overview.

- ✅ Web `.fig-near-black` + phone bottom sheet for `.fig-select` ([report](kit/web-ground.md)): sheet under 600 px screen width, pure CSS (not `ux/Popover`: it builds its own box; the select is native `<details>`). Limit: the sheet doesn't work inside `.fig-lay` (container-type traps `position: fixed`).

- ✅ Adopt ([report](kit/adopt.md)): 25 uses on 4.1, every DS 6 screen and the DS 5 dashboard are now `Kit · Layouts` instances; prototype reactions 21 before, 21 after; replaced frames kept as `was · …` backups off to the right. Review fix: 4.1 §7 gray app screen's tab bar centred and padded with tokens.

- ✅ 2026-10-13 [two-col.md](kit/two-col.md): `Layouts · Two columns` (213:24357), 15 variants 390→3440.
- ✅ 2026-10-13 [lists.md](kit/lists.md): `Lists · Sidebars, TOC & trees` (212:1424), Tree item set, 12 TOC styles, mobile prototype.
- ✅ 2026-10-13 desktop MCP connected (`figma-desktop`, 127.0.0.1:3845): reads the owner's live selection; see use-figma.md.

## In flight
- ✅ 2026-10-13 tidy-ds/kit/lab, icons, nesting, slots, transcribe reported. Index (masonry, natural height) + Index · full size rebuilt from ext/Figma/scripts/index-pages.figma.txt.
- ✅ builder ([report](kit/builder.md)): Kit · Mobile builder 260:71518, 27 blocks, matched toolboxes, mode inheritance verified.
- ✅ fluid-ds, fluid-kit, grids (250:105044), templates (262:34669) reported 2026-10-13; Index re-run (42 pages).
- ✅ templates-3col (269:89897, [report](kit/templates-3col.md)), icon-swap ([report](kit/icon-swap.md): 159 glyph components; UI Kit Back reaction is a best guess). Index re-run: 43 pages.
- ✅ Index page `234:2003` built as page 1 (38 previews); re-run after tidy finishes.
- ⬜ slots (brief-slots.md), icons (brief-icons.md).
- ⬜ 2026-10-13 tidy-ds, tidy-kit, tidy-lab (brief-tidy.md): every Claude page → 1920 wrapper → `Page · …` component; then I build the Index page.
- ⬜ 2026-10-13 nesting (brief-nesting.md), transcribe (brief-transcribe.md).
- ✅ Page 7 blue → accent on the master; Colour · Permutations (218:1062); Wizard step actions row.
- ✅ `Video · Kit` + `Video · Storyboard · The Twelve` ([report](kit/video.md)). Review fixes: Location tag's map box hidden by default (`Show map` boolean), end-card thumbnails show a scene image, flat 72% scrims → gradients (15→90%) so images stay bright.
- ✅ `Video · Channel ideas` ([report](kit/channels.md)): five channels (banner, comparison card, 4-tier price ladder, 7 thumbnails, 3 Shorts each) + sourcing (quoted-clip overlay, permission email, fair-use note); 43 credited Wikimedia photos, 9 generations.
- ✅ Images verified: `generate_image` → `upload_assets`, and Wikimedia Commons → `upload_assets` (see [video-kit.md](/framework/ext/Figma/doc/video-kit.md)).
- ✅ `Type · Title layouts` ([report](kit/titles.md)): 7 `Title / …` components (2–5 words, word + subtitle, weight, case), 8 rows of 16:9 + Shorts uses, casing rules; keep-set verdict in the page Notes. Line lock = line height 100%, gap −0.12 em; filler ≈ 0.39 × big; ~10 caps per Shorts line.

Owner rule (2026-10-12): summaries and anything waiting on the owner go on the Figma Overview's **For you** card (`186:1062`) and page notes, not chat.

## Next, if picked up
- Sheet select inside `.fig-lay` (container-type traps `position: fixed`; move the sheet to a top-layer `<dialog>`).
- Use the `.fig-*` layouts on one real site page, opt-in, as the first migration step in [token-sync.md](/framework/ext/Figma/doc/token-sync.md).
- Delete the `was · …` backups once the owner has looked.

## Waiting on the owner
- ⬜ Which numbers win per row of the token table in token-sync.md (site vs Figma).
- ⬜ `dark`: Figma `#675F56` vs site `#42404B`.
- ✅ ds-rows ([report](kit/ds-rows.md)): 11 DS pages on section rows (400 head + FILL specimens, min 480 wrap); single-stat block 277:104073; Stat hairline. Index re-run.
- ✅ 2026-10-14 wave: captions, essentials (296:109702), demo (296:106079), foundations (296:107999), fluid-audit, type (297:105637). Pages reordered; Index regrouped (45 pages).
- ⬜ dogfood (brief-dogfood.md): new pages use the Essentials cards.
