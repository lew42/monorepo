import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "2026-08-11",
	description: "The objective sheet: Layout widget, demo progression, the measure doctrine, previews-as-nav everywhere.",
	icon: "flag",

	content(){

		md("**2026-08-11 — the objective, as directed.** Morning session shipped grid-by-default refinements, `title → url` derivation with `move()`, the slider skins, `demo.page()` and the page-ified forms. The afternoon directive, organized:");

		md(`## 1. The Layout widget — \`ext/Layout\`

- \`styles/layouts/Layout.js\` answered: it is the base class of the eight layout
  showcase pages, not dead code — but it collides by name with the control panel.
- \`ext/layout\` **recapitalized to \`ext/Layout\`** (two-step git mv — case-only
  renames go wrong on Windows otherwise) and upgraded: a **universal toolbar**
  attachable to any element, providing control over it.
- The properties drawer (right sidebar) must **push content over, not fly over**.
- Use the widget **on pages** — page layout control from the same surface.
- Design a better sidebar UI while at it.`);

		md(`## 2. The Page demos

- More demos; **simplify the progression** — from the simplest example up to
  full websites. Consider importing sections as material.
- Better **page navigation examples**: what it looks like (layout, nav), how it
  works (how pages are organized, imported, defined, edited), how you customize
  the template and features.`);

		md(`## 3. The measure doctrine

- \`styles/elements/forms\` is far too narrow on a 3440 monitor — and the problem
  is general. A simple single-column content page wants \`--measure\`; a page of
  **structured content with its own columns** wants width, maybe full width.
- There is too much variation and inconsistency in page layout. Decide the
  doctrine: when measure, when wide, when full — and make the site follow it.`);

		md(`## 4. Information architecture — previews as nav, everywhere

- layouts, sections, ui, elements, the page demos: **overlapping and
  disorganized**. From \`/framework/\` you should see a quick tree of most things.
- Rendered **previews as left-rail navigation** wherever a section has visual
  material — the visual table of contents, familiar everywhere.
- Preview design questions to answer: do cards need titles, or a label inside
  the preview? Which previews list first? How many fit above the fold? How big
  does a preview need to be when the full render is one click away?
- **Progression**: simple first, organized into logical categories, each base
  example growing sub-example trees — a parent renders its child previews below
  itself. Balance against over-categorization: depth costs clicks.`);

		md(`## Wave 1 — landed

- **Demos 11 → 14** (\`landing\`, \`docs\`, \`site\` — whole websites from imported
  \`sections\` bands; \`everything\` → \`deep\`; one idea per demo, icons deferred to
  \`labels\`; \`wide:\` for trees that ARE sites). Record: \`core/Page/overview/demos/readme.md\`.
- **The navigation guide is a path**: [Navigation](/framework/core/Page/nav/) →
  [Children](/framework/core/Page/children/) → [Shell](/framework/core/Page/shell/) →
  Flow — live \`web()\` miniatures throughout, every old url kept.
- **\`ext/Layout\`**: \`layout.bar()\` over a View, Element or Page; \`layout.words\`
  as an extensible registry; the drawer **pushes** via one \`--drawer\` token on
  \`.app\` (−304px on \`.pages\`, reverses on close); \`knob()\` no longer stamps its
  default at load (a real, live bug). The \`Layout.js\` name collision: weighed in
  \`ext/Layout/readme.md\`, pick is \`Shape.js\`, **awaiting Mike**.
- Verified together: 20 routes × 1600/3440 — zero errors, zero overflow. (The
  outer region's \`overflow-y: hidden\` is styles.css's nested-scroll design, not
  a regression — exactly one region scrolls per route.)`);

		md(`## Wave 2 — landed (T1–T8, T12)

- **The width doctrine is real**: walls take the bleed track, \`--breakout\` is
  responsive (\`max(7em, (100% - 96em) / 4)\` — 1600 byte-identical, a \`.wide\`
  block 1188 → 1655px at 3440), demo boxes are exhibits (\`quoted\` opts back to
  the reading measure). **Average fill at 3440: 63% → 76%** (82% excluding the
  nineteen by-design prose pages); \`/framework/ui/\` shows 19/19 above the fold.
- **\`initialize(){ this.catalog(); }\` is the one-line index conversion** — the
  page's own \`content()\` becomes the rail's first card, a real child at a real
  url. classdoc consumes the lifted mechanism; layouts, sections and forms are
  rails now. Two live catalog.css bugs died in the pass (the \`:has(a.active)\`
  child-combinator trap; a card span inventing a phantom rail track).
- **\`/framework/\` is a tree**: \`walls()\` (new, name provisional) — 45 live cards
  across 7 section rungs, every one a real link. \`ext/Layout/\` rebuilt
  render-first: 14% → 92% fill.
- Verified: 20 hot routes × 1600/3440 combined, plus each agent's own 168- and
  352-route crawls at three widths — zero errors, zero overflow, zero regressions.

**Deferred** (usage instruments blind at decision time): T9 flattening, T10
palette→previews, T11 overlap verdicts — the proposal's task list stands ready.

**Awaiting Mike**: the \`walls()\` name; the \`Shape.js\` rename for
\`styles/layouts/Layout.js\` (ext/Layout/readme.md); the T1 inset rule's
9th-column trade; the fifteen relative \`.md\` links that 404 through the router
(one decision, recorded in the proposal's T12 notes); the \`.range-soft\` slider
candidate on [forms/range](/framework/styles/elements/forms/range/).`);

		md("**The preview family is documented**: [Previews](/framework/core/Page/previews/) — `previews()` / `walls()` / `catalog()` are what a parent calls to arrange its children; `preview()` is what a child overrides to draw its own card; `preview_card()` is the shape both share.");

		md("**Two records, two sessions.** The proposal is the first — analysis, 166 routes measured, twelve tasks. `pages.md` is the session after it, which built the `Page` pages themselves and opened the `/web/` guide tier.");

		md.details(import.meta, "proposal.md", "The proposal — 166 routes measured, the measure doctrine, the IA, twelve tasks");

		md.details(import.meta, "pages.md", "The pages session — standard, bare cards, the sticky rail, 14 demos, /web/");
	},
});
