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

## In flight
- ⬜ Web: the seven layouts as opt-in `.fig-*` CSS — task-mastermind-figma-web-layouts, brief [kit/brief-web-layouts.md](kit/brief-web-layouts.md)

Next: review each by screenshot, link from the Overview card.

## Waiting on the owner
- ⬜ Which numbers win per row of the token table in token-sync.md (site vs Figma).
- ⬜ `dark`: Figma `#675F56` vs site `#42404B`.
