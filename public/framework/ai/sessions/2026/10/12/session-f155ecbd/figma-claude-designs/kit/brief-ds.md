# Brief v2: the design-system pages (Elements → Components → Sections)

The owner wants the Figma design system organized and presentable, not a wall of examples. Read this, then `public/framework/ext/Figma/doc/use-figma.md` (all of it: the rules changed tonight), then open the exemplar page **`DS · 2.1 Buttons`** (`158:1263`) with `get_screenshot` and copy its shape exactly.

## Where

Figma file `QYN0G2URSBHYH5I06MOjxU`. Create only the pages named in your prompt. Never edit the variables, the text styles, or another agent's page. You MAY add a variant to an existing kit component if your page needs it (say so in your report). Repo: write only your report `public/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/<slug>.md`, commit it by path. Load `skill://figma/figma-use/SKILL.md` (ReadMcpResourceTool, server `figma`) before the first `use_figma`; pass `skillNames: "resource:figma-use"`.

## The three levels (the owner's words, 2026-10-12)

- **Elements** are atoms: one thing (a title, an icon, an image box, a divider, a chip, a bar).
- **Components** are elements composed on a line, as a card, or as rows in a card.
- **Sections** are several components working together (a header and a table, stats and a timeline).

## Colour rules (changed tonight — follow these, not older pages)

- **Prime is a small splash, never a background.** No prime grounds, no prime cards, no prime selected rows. Prime appears as: the one primary button, an accent label (`accent` variable), a progress fill, an active icon. One hue only: no greens or reds except `error` for errors.
- **Selected / current = 10% black inset + accent icon**, ink text.
- **Dark grounds are where hierarchy has room:** on `Dark BG`, step up with a 10% white overlay and down with 10%/50% black, keeping light ink. Prefer dark-in-dark nesting over flipping light → dark → light.
- **Every container binds its fill to `surface`** and sets a Text mode (`Light BG`, `Light gray BG`, `Dark BG`); never type a ground colour. Insets are a bare 10% black (or 10% white on dark) layer.

## Spacing rules

- Containers set Resolution: a phone sample is `Mobile`, the page canvas `Default`. Components inherit; never set a mode on a component.
- Mobile sections pad with `section-pad-y`/`section-pad-x` (48/16: breathe vertically). Cards pad with `pad-y`/`pad-x`. Rows with `small-pad-y`/`small-pad-x`.
- Hug or fill. Fixed only for: the 390 phone width, image boxes, icons, bars, 44 touch targets. Name each fixed node with its reason.
- Text in a row that must fill: the row must FILL its parent first.
- A component's main must HUG (or have its own width) — never leave a display width on it, or every instance inherits it (that bit the Button set tonight).

## Page shape (copy the Buttons page)

1. A root frame 1440 wide, `surface` + `Light gray BG`, `Default`, padded with `section-pad`.
2. Header: a nav row of links (`← Overview`, previous page, next page — `setRangeHyperlink` to the page ids), an accent `h4` code (`2.2 · COMPONENTS`), an `h1` title, one `body muted` gist line.
3. Sections, each: `h3` title, one gist line, then a wrapping row of **`Specimen`** tiles (component `158:1238` on the UI Kit page: Content slot + Label property; set its Text mode for dark tiles). One specimen = one thing, minimal label.
4. Show each thing on white AND on dark (a second row of dark specimens), then an **"In action"** row: 390 `Mobile` phone samples inside specimens, composed from kit instances.
5. A dark **Rules** box at the end: 3–5 one-line rules.

Reuse kit components (UI Kit `126:15264`: Row `139:1095`, Tree row `139:1120`, Section header `139:1121`, Button `139:1132` incl. `Kind=Icon`, Specimen `158:1238`, Logo `142:1245`; Kit · Controls, Kit · Containers, Kit · Workflows components — find them with `findAllWithCriteria({types:['COMPONENT_SET','COMPONENT']})` on those pages). Build new components only where none exists.

Screenshot each section after building it and fix what looks off: clipped or one-letter-wide text, a fixed size that should hug, crowding on one side with empty space on the other, prime used as a ground.

## Report (`<slug>.md`, under 30 lines)

Pages built (name → id), components added or changed, anything you could not do, values no token gives, one line on what still looks off. Commit it, then stop.
