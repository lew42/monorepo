# Figma design system — state (2026-10-12, night)

Owner's ask, in short: one design system drawn in Figma (Sept-2026 file `QYN0G2URSBHYH5I06MOjxU`), approved there, then coded; prime as a splash only; mobile first; elements → components → sections → layouts; sync with the web without breaking it. Rules and history: [ext/Figma/doc/use-figma.md](/framework/ext/Figma/doc/use-figma.md); web bridge: [ext/Figma/doc/token-sync.md](/framework/ext/Figma/doc/token-sync.md) and [/framework/ext/Figma/tokens/](/framework/ext/Figma/tokens/).

## Done
- ✅ Start page in Figma: `Claude · Overview` (dark "Design system · start here" card links every page).
- ✅ DS pages: 1 Elements, 2.1 Buttons (exemplar), 2.2 Lists & rows, 2.3 Cards & containers, 2.4 Inputs & controls, 2.5 Status & progress, 3 Sections, 4 Layouts. Reports: [kit/](kit/).
- ✅ Colour: prime plain, never a ground; schemes = Text modes (`surface`, `accent`, `on-accent`); insets are bare 10% layers; components inherit Resolution.
- ✅ Prototypes with ▶ PROTOTYPE badges: Claude prototype, UI Kit, Kit · Workflows.
- ✅ Web: `ext/Figma/tokens/` (FigmaTokens.mjs → opt-in `--fig-*` CSS; measure.mjs; demo page).
- ✅ Relayed: Sessions grid bugs → mastermind-data-grid; Figma-vs-page diff → mastermind-screenshot-system (no replies seen yet).

## In flight (started 01:34 UTC, brief: [kit/brief-ds-2.md](kit/brief-ds-2.md))
- ⬜ `DS · 1.1 Icons` — task-mastermind-figma-ds-icons
- ⬜ `DS · 1.2 Dark grounds` — task-mastermind-figma-ds-darker
- ⬜ `DS · 2.6 Dropdowns & menus` (fixed-height phone: inner scroll / page scroll / sheet; prototype) — task-mastermind-figma-ds-dropdowns
- ⬜ `DS · 2.7 Toggles, checkboxes & radios` — task-mastermind-figma-ds-toggles
- ⬜ `DS · 5 Diagrams & charts` (auto-layout flowcharts whose connectors follow resized cards; charts) — task-mastermind-figma-ds-diagrams, queued behind Servex's 5-agent cap; brief [kit/brief-diagrams.md](kit/brief-diagrams.md)

Each writes `kit/<slug>.md` when done. Next for whoever picks this up: review each page by screenshot, link it from the Overview's design-system card, fix off-rule colour (prime grounds) and fixed sizes, commit the task logs.

## Waiting on the owner
- ⬜ Which numbers win per row of the token table in token-sync.md (site vs Figma).
- ⬜ `dark`: Figma `#675F56` vs site `#42404B`.
