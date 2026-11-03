# ds-dropdowns: report

Figma file `QYN0G2URSBHYH5I06MOjxU`, built from [brief-ds-2.md](brief-ds-2.md) (Dropdowns), shape copied from `DS · 2.1 Buttons`.

## Page built

- **DS · 2.6 Dropdowns & menus** → `163:18208` (root `163:18131`), placed after 2.5. Closed / open simple / open rich (search field, checkbox rows, divider, footer action) on white and on dark; a phone section with static copies of variants A (inner scroll), B (`tall: page scroll`, 390×1280 with an 844 fold line) and C (dark, bottom sheet); a dark Rules box.
- **Clickable prototype** sits to the right of the page (top-level frames are required for navigation): `▶ PROTOTYPE · Dropdown` badge above the start frame `163:23572`; Country → A `163:23362`, Language → B `163:23461`, Sort by → C `163:23598`; any row, the open trigger or the scrim returns to the start. Flow "Dropdown prototype" is the page's starting point.

## Components added (Kit · Controls, right of the existing ones)

- **Dropdown** `163:2256`: `Open=False/True/Scroll`, props Label, Value, Content (SLOT). `Scroll` caps the slot at 264 and scrolls inside (an instance cannot override `maxHeight`/`overflowDirection`, so it is a variant).
- **Menu row** `163:2241`: `State=Default/Hover/Selected`, props Label, Meta, Icon, Show icon. Row `139:1095` did not fit (its Selected is the old prime stack).
- No existing component changed.

## Not done / values no token gives

- Dropdown main is 320 wide (own width; instances FILL). Panel padding and trigger-to-panel gap are 4, the panel shadow (0/8/24, 18%) and 1px hairline are untokened; sheet top radius 16 per the register.
- No Checkbox component yet (ds-toggles): rich rows use `check_box` glyphs through the Menu row Icon property.
- Prototype not played in Present mode (tooling can only set reactions); scroll-in-Present is unverified.

## Still looks off

The `Open=Scroll` variant was cloned, so its Label/Value/slot bindings were re-set by hand; on a dark ground the 10% black hairline is faint.
