# Figma layout batch: Layout examples, Figma to CSS, Legacy vs Latest (brief)

Read [explore-brief.md](./explore-brief.md) first: the hard rules there (file `ADpu9u2V0BlEZfR3rrMfER`, `create_session`, skills `figma-use` + `figma-generate-design`, no variable/collection/existing-page edits, bind to existing v2 variables, auto layout, short and long text test, ~8 screenshots per page, return node ids, link format) apply here. Budget: $14. Do the job yourself (no sub-agents). Owner request relayed by voice-app, 2026-11-16: **clear and visual, not text-heavy.** One short label per example, no paragraphs.

## Background (why these pages)

Figma has two auto-layout versions, **Latest** (default for new frames since July 2026) and **Legacy** (can be switched back to only until January 2027). Fixed / Hug / Fill behave the same in both. Latest changes only these six edge cases:

1. A frame can't be narrower than its padding (plus an inside stroke), matching CSS border-box.
2. Inside strokes count in layout; outside and center strokes don't (CSS border vs outline).
3. A parent's stroke setting no longer affects its children.
4. Fill children split space by content area, so a child with more padding ends up wider. For exact equal splits use the grid flow with `fr` tracks.
5. Auto gap never goes negative, so items no longer overlap.
6. A single child in a "Between" auto-gap stack aligns to the start instead of the center.

## Step 0: can the API read or set the layout version? (do this first, report it)

The typings (`plugin-api-standalone.d.ts`) have no `layoutVersion` property, so probe at runtime: on a fresh auto-layout frame and on existing frames, list own and prototype property names that contain `version` or `layout` (loop `for (const k in node)` plus `Object.getOwnPropertyNames(Object.getPrototypeOf(node))`), and try reading candidates (`autoLayoutVersion`, `layoutVersion`, `layoutGridVersion`). Also try the Figma docs (WebFetch of help.figma.com / developers.figma.com "layout version") for the real property name if the runtime shows none.
- If it can be **read**: report, for Big Sloppy (`hbolzQ3Xnc78rhxAPj8xK2`, read-only!) and v2, how many auto-layout frames are Legacy vs Latest (counts per page, one script each, no edits).
- If it can be **set**: set Latest on every frame you create, and make the Legacy frames on the third page for real.
- If it **cannot be set to Legacy**: say so on the Legacy vs Latest page (one visible note at the top) and in your report. Do NOT fake it; build the Latest frames for real, and show the legacy behaviour as a labelled diagram or the documented expected result, marked "documented, not reproduced".
- If it cannot be read: say so; new frames are Latest by default.

## Pages (all new pages in v2; names exact, with the en dash and the arrow)

1. **`Explore – Layout examples`**: clean, minimal examples of every Fixed / Hug / Fill width x height combination (3 x 3 = 9), each a **real-world piece**: paragraph, button, sidebar, main area, equal columns, auto-height vs full-height columns. A grid of small labelled panels, each with one short label like `Hug x Fill: tag chip in a row`. Show the piece itself, not a diagram.
2. **`Explore – Figma → CSS`**: start from each Figma setting (width x height, once in a **row** parent and once in a **column** parent) and show the CSS outcome beside it with one short label (e.g. `Fill width in a row = flex: 1 1 0`; `Hug = fit-content / auto`; `Fixed = width: 200px`). Link the HTML twin (below) from a visible text node on the page, and also put its URL in the report.
   - **HTML twin in the repo:** `public/framework/ext/Figma/layout-css/index.html` (vanilla HTML and CSS, no framework, no build, no JS needed). It must be served by the dev server, so the URL is `/framework/ext/Figma/layout-css/index.html` (check it loads with the `shot` tool or `check_page`; never restart the dev server). Same examples, same labels, same order as the Figma page, so the owner can compare against real browser behaviour. Add the twin to `public/framework/ext/Figma/readme.md` (Docs/Files list, one line) and commit by exact path.
3. **`Explore – Legacy vs Latest`**: for each of the 6 differences, a Legacy frame next to a Latest frame plus **the browser's result** (an image or a faithful frame showing what CSS does; the HTML twin can contain the CSS cases), so the owner can see which matches the web. See Step 0 for what to do when Legacy cannot be set.

Layout of each page: titled sections, left to right or top to bottom in one clear order, 1920-wide wrapper per `public/framework/ext/Figma/doc/page-layout.md`; bind spacing, radius and colours to v2 variables (Scale, Scheme, Colors) where it makes sense, hardcode the rest and say so in the report. Always the **Latest** layout version for frames you create.

## Docs (same commit as your last Figma step)

- Write the findings (API support for layout version, what you could and could not do) in `public/framework/ext/Figma/doc/layout-versions.md` (short, no history) and link it from `public/framework/ext/Figma/readme.md`.
- I (the mastermind) add the "Use Latest everywhere" line to `design-system-notes.md`; you do not touch it.
- Commit by exact path; never push. Never write the owner's name into any file.

## Report (final message to `mastermind-figma`, one screen)

The three page links, the HTML twin URL, the Step 0 answer in one line, the Legacy/Latest counts for Big Sloppy and v2 if readable, what the owner should look at first, what you could not do and why, estimated cost.
