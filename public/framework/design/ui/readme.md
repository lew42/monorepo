# UI — buttons, toolbars, dropdowns, icons: states and targets

UI is the interactive part of a page — everything the reader presses. The built components themselves (the actual button, the actual dropdown) live at [/framework/ui/](/framework/ui/); this page is the rules for using and combining them.

## Use

- **The glyph is always `icon("name")`.** Material Icons are fixed-width, 1em square, so a row of them lines up with no help. Frame one (`.ui-icon-frame`) only for a click target, centring, or a grid of equal slots.
- **Buttons:** `.ui-icon-btn` (flush) or `.ui-icon-btn-bg` (backed). Toggle state is `aria-pressed`, never a class.
- **A widget keeps its core row on one line at every width** — the box, the mic, Send — with extras (a meter, a picker, captions) on a line underneath, so it's recognisably the same widget everywhere.
- **A mode button shows its current mode on its own face**, never in a separate label.
- **A debug or advanced toolbar is off by default**, and on only on the widget's own doc page.

Full rules: [doc/rules.md](./doc/rules.md).

## Watch out

- `icon:` on a page or tile fails silently for a name the site's icon set doesn't have — it prints the literal word instead of a glyph. Probe `offsetWidth`: ~19px is a real icon, 100px+ is a miss.
- Colour for a pressed or hovered state comes from [color](/framework/design/color/) — this page says which states exist, color says how they're painted.

## More

- [doc/rules.md](./doc/rules.md) — the full icon and control rules.
- [questions.md](./questions.md) — review questions for this system.
- [/framework/ui/](/framework/ui/) — the component gallery: the buttons, toolbars and dropdowns themselves.
- Templates: [/framework/ui/](/framework/ui/)
- Styling one button takes three pages: its states here, its paint in [color](/framework/design/color/), where its CSS rule and frame go in [code/css](/framework/code/css/).
