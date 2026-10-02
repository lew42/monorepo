verdict: fix
1. [fix] The instance card opens every nested object at once, all the way up the `parent` chain (Page → core → framework → …). The middle column of the wall runs thousands of pixels taller than its neighbours, and a reader can't take in the card at a glance (layout: flow, sizing) — own shot at 1920 and 400 of `.ux-content-wall.wide`. Show nested cards closed, or one level deep and opening on click, the way `view()` already does.
2. [fix] Nested `Map` cards (`children`) and empty objects (`settings`) draw as boxes with no rows: chrome around nothing (content: show, don't tell) — own shot at 1920, `settings` → "Object" box, `children` → "Map" box. The minion logged this gap itself; it is visible on the demo page, so it needs fixing or hiding.
3. [fix] Requirement 3 asked for `instance.inspect()` and `Class.inspect()` as a method on every object. What shipped is a free function, `inspect(thing)`. That works, but it is not the shape the owner described; either add the method or record the choice and why in the task log.
4. [fix] Requirement 6: "A class's doc page opens with its class card" is not done. No class doc page (for example `/framework/core/Page/`) was changed. The docs went to `code/objects/doc/views.md`, not to `/framework/code/patterns` as asked.
5. [note] The new section sits below the fold at every width, so none of the four task shots shows it; the review needed its own element shots. Next time, shoot the section by its selector.
6. [note] `variant: "full"` renders the same as `card`. The choice is logged and named honestly, but it is still a variant name with nothing behind it.
7. [note] The top card's `path` starts empty, without the card's own subject in it, so an object that points straight back at itself opens one extra level before the cycle guard catches it (`Inspect.js`, `render()`).

Widths: the task shots give all four (400/1200/1920/3440), but they show only the viewport. The new `inspect()` wall is below the fold, so I added my own element shots at 1920 and 400 (it is a component inside a wall that rearranges with width).

## Requirements
- 1 "Build on what exists, don't duplicate" — yes — `InspectCard extends ObjectCard` and reuses `own_properties()`, `describe()` and the `path` cycle guard from `DefaultView`
- 2 "`static icon` on a class; an instance shows its class's icon" — yes — `icon_name()` in `Object.js`, read by `object()`, `view()` and `inspect()`; falls back to `data_object`
- 3 "`instance.inspect()` and `Class.inspect()`, separate from `render()`" — no — a free function `inspect(x)`; it is separate from `render()`, but it is not a method on objects
- 3a "Instance card: icon, instance name, class name, key properties (configurable), arrays as nested cards, recursive" — yes, but it nests too eagerly — own shot at 1920: the whole `parent` chain is open
- 3b "Class card: the same icon in a heavier frame, properties and methods, core API first" — yes — own shot at 1920, left card: 3px border, wash background, METHODS chips, order follows `PAGE_PROPERTIES`/`PAGE_METHODS`
- 3c "Variants minimal / card / full" — partly — minimal and card work; full is the same as card (logged as a decision)
- 4 "One view or many: recommend, record the alternative" — yes — task.jsonl decision: one `Thing.View`, the views array rejected because of its update cost
- 5 "Document it in the code system (/framework/code/patterns …)" — partly — `code/objects` readme and `doc/views.md` have "render vs inspect"; patterns is untouched
- 6 "A class's doc page opens with its class card" — no — no class doc page changed
- Part 2 (Dictate diagram) — n/a — the brief lands Part 1 first; this diff is Part 1 only
## Page structure
- page 1 (says what it is) — yes — shots/…/1920.png, top band: "Object", then the intro sentence
- page 2 (level 1 above the fold, detail nested) — no — the new `inspect()` section is far below the fold; tab-panel share 4.4 at 1920 (layout.json)
- page 3 (one takeaway obvious) — yes — the heading "`inspect()` — the debug view, the fourth size"
## Navigation
- navigation 1 — tabs (Overview, The page object, The app object, Docs, Files), sidebar, mobile bottom rail
- tabs fit one row — yes at 1200/1920/3440 (tab_rows 1); no at 400 (tab_rows 2), which predates this change
- routes — n/a
## Layout
- layout fits the width — partly — the wall's three columns are badly unbalanced at 1920: the instance column is several screens tall, the others under one
- no horizontal overflow — yes — overflow_x false at all four widths
## Sizing
- card measure capped — yes — `.ux-content-inspect` max-width 32em
- 400 fits — yes — own shot at 400: the nested cards indent but stay inside the screen, long URLs cut with an ellipsis
## Wrapping
- wraps — h3 "object() — the small card…" wraps to 2 lines at every width (layout.json), predates this change; at 400 the `description =` value drops to its own line (own shot), acceptable
## Spacing and padding
- left stack consistent — yes — h1 and p share the same inset (28/38/67/90 px)
- inside the card — yes — even row rhythm; nested rule plus indent reads clearly; the empty Object/Map boxes waste space (finding 2)
## Colour and contrast
- tokens only — yes — `--surface`, `--wash`, `--line`, `--prim`, `--subtle`; no raw colours
- contrast — yes — own shot: the orange property names and the dark values read on the light ground
## Flow
- reading order — no — a reader must scroll through every ancestor page's properties before reaching the `minimal` example below (finding 1)
## Words
- content 1 (plain sentences) — yes — the readme and the section intro say what `inspect()` is before any detail
- content 2 (no repetition) — note — the long comments in `Inspect.js`/`content.css` repeat the readme's explanation; fine for code, but long
