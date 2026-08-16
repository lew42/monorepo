# panel-ui-overhaul

## The ask (verbatim, Mike, 2026-08-15)

> we created a Panel system (ext/Panel)
>
> the toolbar ui is a little clunky (take screenshots, make it look nicer).  let's make light and dark modes, and let the toolbar appear on hover of the panel, as an overlay on top of the panel's bg.
>
> remove the flex grid gap hover toolbar that appears at the bottom of each panel (this might be the ext/layout widget)
>
> try to design layout ui to facilitate layout exploration (rapidly reconfiguring layout).
>
> remove the gap between panels.  make a hover "resize handle" that follows the cursor position.  when clicked, display a small toolbar with "hug" and "fill" options.  do this for both horizontal resize and vertical resize.  the outcome of these buttons should not complicate the css - try to keep things as simple as possible so you don't get into strange override territory.  the outcome might also depend on layout mode (flex, directoin, etc)
>
> the main panel has a fixed height.  we ideally want this panel system to evolve into a robust web editor.  the ext/layout has a property sidebar that appears.  i'm not sure the ext/layout sidebar is the best place to put Panel properties.  the Panel is used in the ext/Editor.  ask your minion(s) to suggest strategies.  we have a DevBar, but that shoudl be reserved for dev-only things (like, on localhost), and might be stripped when published.  so any web apps might need any number of contextual right sidebars.  they might need to be layered, so you could have 2 at a time?
>
> take a look at the styles/layouts/space/ page.  it has a layout generator.  try to integrate that into the panel system, so any panel could generate a randomized layout in a similar way.
>
> Orchestration: Fable orchestrates only; Opus minions do the work.

## Scope

Five workstreams over ext/Panel and neighbors:

1. **Toolbar redesign** — screenshots first; nicer toolbar; light + dark modes; toolbar becomes a hover overlay on the panel bg.
2. **Gaps + hover toolbars** — remove the bottom flex-gap hover toolbar (likely ext/layout widget); remove the gap between panels.
3. **Resize handle** — cursor-following hover handle on panel edges; click opens a small hug/fill toolbar; horizontal and vertical; CSS stays simple (no override territory); behavior may branch on layout mode (flex direction etc.).
4. **Sidebar strategy** (proposal, not code) — where do Panel properties live? ext/layout sidebar vs contextual right sidebars; DevBar is dev-only/localhost and may be stripped in production; apps may need N contextual right sidebars, possibly 2 layered at once. Deliverable: a strategies doc with a recommendation.
5. **Layout generator** — port/integrate the styles/layouts/space/ generator so any Panel can generate a randomized layout.

Overall goal: layout UI that facilitates *layout exploration* — rapidly reconfiguring layouts. The Panel system is headed toward a robust web editor (ext/Editor is a consumer).

## File-ownership fences (agents)

- **recon** (read-only): whole repo + screenshots. No edits.
- **toolbar+theme minion**: `public/framework/ext/Panel/**` toolbar/theme files only, as partitioned after recon.
- **resize minion**: `public/framework/ext/Panel/**` resize/interaction files, as partitioned after recon. Runs after or fenced from toolbar minion — exact split decided post-recon.
- **generator minion**: new generator module under ext/Panel + read-only on `public/framework/styles/layouts/space/**`.
- **sidebar strategist**: writes only `doc/*.md` under this task dir or ext/Panel — no code.

## Final fences (post-recon)

Recon found: the bottom hover bar is ext/layout's, wired at `workspace.js:101` + styled at `panel.css:72-85`; the inter-panel gap IS `.panel-grip` (`panel.css:51`); `dev/DevBar/grip.js` is the working precedent for a cursor-following handle; theming is free via `light-dark()` tokens. `workspace.js` is the collision file → A runs alone on it first.

- **A — toolbar** (first, alone on workspace.js): edits `Panel/workspace.js` (bar construction + imports), `Panel/panel.css` (NOT the `.panel-grip` block ~50-56), `Panel/page.js`; creates `Panel/toolbar.js`, `Panel/toolbar.css`. Detaches the layout bar (deletes workspace.js:101 + panel.css:72-85). Never edits ext/layout (10 other consumers). Returns readme delta as text.
- **B — resize** (after A): owns `.panel-grip` semantics — gap collapses to 0, DevBar-style hover handle follows cursor, click opens hug/fill popover. Edits `Panel/PanelDrag.js` (grip()), one line in `workspace.js` (grip call site); creates `Panel/grip.css`. Reads `dev/DevBar/grip.{js,css}`, never edits them. Returns readme delta as text.
- **C — generator** (parallel with A): creates `Panel/generate.js`, `Panel/doc/generator.md`; edits `Panel/templates.js` (one T entry) + `Panel/templates.css` (append-only). Reads `styles/layouts/space/*`, never edits it. Does NOT touch `page.js` — returns the demo block as text for the orchestrator to paste.
- **Sidebar strategist** (done): wrote `doc/sidebar-strategy.md` only.
- **Orchestrator**: merges readme deltas, pastes C's demo block, smoke-tests `/framework/ext/Panel/`, `/full/`, `/framework/ext/editor/` after A and after B.
- **Everyone**: no edits to `ext/editor` (flag findings instead); test on `/framework/ext/Panel/full/` to avoid churning shared `/data/panels.json`; screenshots go to scratchpad first (writes under `public/` live-reload open tabs), copied into this dir at the end.
