# ds-darker: `DS · 1.2 Dark grounds`

Page `163:18033` (root frame `163:18034`), placed after `DS · 1 Elements` (no `1.1 Icons` existed yet). Nav links: Overview, 1 · Elements, 2.1 · Buttons.

## Sections
- Dark ladder `163:18986` and near-black ladder `163:19105`: dark, +10%/+20% white, +10% black; near-black = dark + 50% black, same three steps. Hex values computed from the `dark` variable.
- Same cards on a medium-dark and a near-black page `163:19224`: identical cards, one bare 10% white layer each.
- Darken + lighten together `163:19391`: page, card, well, chip nested; and a lifted card holding a sunken well.
- Text contrast `163:19896`: ink / muted / accent on all 8 steps, ratios computed in the script from the variables.
- In action `163:22886`: three 390 `Mobile` phones (dashboard with stats, chart bars, list; settings with toggles; media player with a big play icon and an up-next well).
- Rules box: 5 rules.

## Findings (computed)
- Ink fails 4.5:1 only on dark + 20% white (3.96).
- Muted (white 70%) fails on dark (4.04), dark + 10%/20% white, and near-black + 20% white (4.39); passes on near-black and its other steps.
- Accent as small text passes only on near-black + 10% black (4.77); near-black itself is 4.46.

## Notes
- No variables, styles or other pages touched; no kit components added or changed. Layers are paint layers over `surface` (Dark BG = `dark`); cards and wells are bare white/black overlays.
- The toggle in the settings phone is drawn by hand (no `Toggle` component existed): replace it with the `ds-toggles` component when it lands.
- Values no token gives: 10%/20% white and 10%/50% black overlay alphas (typed paints, as the brief allows), 52×32 toggle, chart bar heights.
- Still looks off: the third phone wraps under the first (same as the Buttons exemplar); contrast table is dense but readable.
