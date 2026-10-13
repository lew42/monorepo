# Brief v3 addendum: icons, dropdowns, toggles, darker darks

Read [brief-ds.md](brief-ds.md) first: every rule there holds (page shape copied from `DS · 2.1 Buttons`, Specimen tiles, white then dark rows, an In-action row, a Rules box, tokens only, prime as a splash, hug or fill). Then this. The owner (2026-10-12, night): "push the fundamental elements — they're easy, and if they're robust and battle-tested we can use them a lot."

## Icons

- Font `Material Symbols Rounded`, style `Regular`; an icon is a text node whose characters are the ligature name (`menu`, `close`, `check`, `chevron_right`, `expand_more`, `play_arrow`, `more_vert`, `circle`). Look names up at fonts.google.com/icons if unsure (WebFetch is fine); a wrong name renders as the word.
- Fill bound to `text`, `muted` or `accent`. Sizes are a register: 16, 20, 24, 32, 48 (name the node `Icon (24: glyph)`).
- Alignment rule to test, not assume: an icon sized to the text's line height sits on the same line and wastes nothing; a big icon above a title creates deliberate space (good on cards and over images, wasteful in lists). Show both and say which reads better in the Rules box.

## Dropdowns (the site has `ux/Menu`, `ux/Popover`, `ui/menu`: read them; its dropdown holds any content)

- A closed select (label, value, `expand_more`); an open menu of rows; a rich dropdown (sections, icons, a search field, checkboxes, a footer action).
- In a FIXED 390×844 phone (the one place a fixed height is the point): variant A, the menu has a max height and scrolls inside (`clipsContent` + `overflowDirection = 'VERTICAL'`, prototype-scrollable); variant B, the menu runs long and the page scrolls (draw the phone taller to show it, named `(tall: page scroll)`); variant C on mobile, the menu becomes a bottom sheet. Wire at least one with a prototype click (closed → open) and put a big ▶ PROTOTYPE badge above its start frame.

## Toggles, checkboxes, radios

- Components with variants: Toggle (Off/On), Checkbox (Unchecked/Checked/Indeterminate), Radio (Off/On); hug, 44 touch target. On = accent fill with `on-accent` mark; off = 10% overlay. Build them in Kit · Controls if missing, as component sets with a Label property.
- When to use which: a toggle for one on/off mode; a segment row for 2–3 modes; a dropdown for 3+. Show the same choice done three ways.

## Darker darks (the owner likes the contrast when dark gets "a lot darker")

- Base on `dark` with 50% black over it (near-black), then step UP with 10% white and DOWN with 10% black; stack darken and lighten together. Light ink throughout. Compare a medium-dark page with a near-black page holding the same cards.
