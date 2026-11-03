# UI: the icon and control rules, in full

Moved from `.claude/skills/css/SKILL.md`'s "Icons" section (the rules about pressable things), plus the parked Controls questions from `.claude/skills/page/questions.md`. The short version is on [the readme](/framework/design/ui/).

## Icons (icon-system, 2026-09-30)

- The glyph is always `icon("name")` (span.material-icons.icon). Material Icons are fixed width: every glyph is a square 1em box, so a row of icons lines up with no help.
- Inline with text: plain `.icon` (1.25em, line-height 1, vertical-align -0.15em). Never add your own nudge.
- Frame it only for one of three reasons: a click target, centring inside a taller box, or a grid of equal slots. Then use `.ui-icon-frame`, not your own width, height or padding.
- Buttons: `.ui-icon-btn` (flush), `+ .ui-icon-btn-bg` (backed); toggle state is `aria-pressed`, never a class. A row of them: `.ui-icon-rail`. Icon + label rows: `ui.item()`.
- Everything is in em off `--icon-frame`, so a bigger container font-size scales icon, frame and padding together. A new px size or padding on an icon is a one-off: check [/framework/ui/icon/](/framework/ui/icon/) first (detail in its doc/icons.md).
- `icon:` on a page or a tile is unverified and fails silently: the site loads **Material Icons**, not Symbols — a name only the newer set has renders as its literal word (~291px in a 219px card label) and nothing throws. Probe a new name's `offsetWidth`: a real glyph is ~19px, a miss is 100px+.

## Controls (the parked questions, 2026-09-30)

These came from a real widget audit (audio-consolidate) and are the start of this page's own rules, beyond icons:

- A widget keeps its core row (the box, the mic, Send) on one line at every width, with extras (a meter, a picker, captions) on a line underneath, so it is recognisably the same widget everywhere.
- A debug or advanced toolbar is off by default, and on only on the widget's own doc page.
- A mode button (hold vs toggle, on vs off) shows its current mode on its own face, never in a separate label.
