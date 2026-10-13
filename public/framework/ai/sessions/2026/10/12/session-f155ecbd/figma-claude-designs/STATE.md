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

## In flight
- ⬜ `DS · 4.1 Foundational layouts` — task-mastermind-figma-ds-foundational, brief [kit/brief-layouts.md](kit/brief-layouts.md)
- ⬜ `DS · 5 Diagrams & charts` — task-mastermind-figma-ds-diagrams, brief [kit/brief-diagrams.md](kit/brief-diagrams.md)
- ⬜ Kit sweep (Chip/Segment/Row prime states → inset, focus rings, lighter toggle knob) — task-mastermind-figma-ds-sweep, brief [kit/brief-sweep.md](kit/brief-sweep.md)
- ⬜ Web: toggle, checkbox, radio, select, icons as opt-in `.fig-*` CSS on [/framework/ext/Figma/tokens/](/framework/ext/Figma/tokens/) — task-mastermind-figma-web-controls, brief [kit/brief-web-controls.md](kit/brief-web-controls.md)

Each writes `kit/<slug>.md`. Next: screenshot each page, link it from the Overview card, fix off-rule colour and fixed sizes.

## Waiting on the owner
- ⬜ Which numbers win per row of the token table in token-sync.md (site vs Figma).
- ⬜ `dark`: Figma `#675F56` vs site `#42404B`.
