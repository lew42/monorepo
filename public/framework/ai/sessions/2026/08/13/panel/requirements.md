# ext/panel — requirements

Mike, 2026-08-13 (three messages, autonomous session): *"we need more 'fill'
layouts… imagine a very large 3440 monitor, and we want to fill it with an
'experience': a scene, a bg, maybe 3D. probably centered, and scaled properly.
could be split easily? maybe dragging any panel around, like Blender ui panels
or Adobe or even Windows multi-window drag zones. create a panel system
(ext/Panel)… a panel should be able to divide, move, fill, hug, nest, drag,
drop, drop between, drop inside."* Plus: per-panel split-V / split-H icons
(clicking a second time adds another column/row), a 3×3 alignment picker, a
**T** content dropdown populated from templates, defaulting to **random** fill.
Plus: *"panels could render any section inside, and provide controls for
quickly repurposing (alignment, color…). maybe panel() is the default
container? it's like an auto layout widget… panels provide quick layout
controls by default, so you can quickly wireframe ui systems and reconfigure
them via a nice ui to explore alternatives."*

**Section vs panel (doctrine, record in the readme):** a *section* is a
full-width band of a real page — content with its own internal measure and
tone. A *panel* is chrome for arranging and exploring: it can host any section
(or experience), frame it, align it, retint it, split beside it. Sections are
what you ship; panels are how you wireframe.

## Prior art — read before writing

The API digest covering everything below, with line numbers:
`C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\51c5ac4b-ed59-4c55-9fec-593d1b0addd4\scratchpad\api-digest.md`.
House style: `.claude/skills/code-architecture/SKILL.md` — read it first.

- `core/Item` + `core/List` — the persistence envelope `{type,id,data,items}`;
  `Item.register(Class, name)` as the last line of the defining module;
  `move(parent, before)`; events bubble to the root; saver by upward delegation.
  Rulings that bind this module: `../persistence/requirements.md`.
- `ext/saver` — `FileSaver({path})` writes through the dev socket RPC;
  `LocalStorageSaver({key})` deployed. The editor's two-line chooser
  (`ext/editor/page.js:16-17`) is the pattern, verbatim.
- `ext/draggable` — `Sortable` with `locate(e) → {list, before}`; the editor's
  `Node` subclass wraps the drop commit. `handle: false`, never undefined.
- `ext/editor` — the wiring discipline to copy: `Item.open(saver)` then
  `$shell.empty(() => …)`; one listener set on the root; `change` saves but
  never redraws; selection by id, never node.
- `ext/layout` — `layout.bar(target)`, `layout.context(el, fn)`, and
  `controls.js` (`pick, menu, toggle, chips, knob, btn`). The drawer is one per
  document; reuse is at the **control level** (verdict:
  `framework/ai/2026-08-12/apps/readme.md`).
- `framework/ai/2026-08-12/apps/panes/` — the closest sketch: recursive
  `build(tree)`, the grip resize math, and `panes.css`'s
  `flex: 1 1 0; min-width: 0; min-height: 0` at every level. **Mine it, never
  import it** (a log directory is not a module). Its grip is not rAF-coalesced
  and writes px — `ext/demo/stage.js` `drag()` and fraction-writing fix both.
- `styles/sections/` — fifteen bands, each module `tone => view`, default
  export at `/framework/styles/sections/<name>.js`:
  `navbar hero logos features split stats testimonials pricing faq team
  changelog contact signup callout footer`. Four tones:
  `dark | prim | wash | surface`.

## Rulings (orchestrator, revisable — dissent in your report, not in code)

1. **Directory is `ext/panel/`** (lowercase, like every ext). Files:
   `Panel.js` (Item subclass), `panel.js` (widget/view, default export),
   `panel.css` (structure only), `templates.js` + `templates.css` (the T
   vocabulary), `readme.md`, `page.js`. Each file ≤ ~100 lines.
2. **Panel extends Item, not Layout** — ext/layout has no class to extend;
   its controls are reused directly, and `layout.bar($body)` is attached
   inside each panel body (Mike's UX-test instruction).
3. **One class.** `class Panel extends Item`; a panel with items is a split
   (`data.dir: "row" | "col"`), a leaf renders `data.template`. `leaf()` duck
   like the editor's Block. `Item.register(Panel, "Panel")` last line.
4. **`data` keys:** `dir`, `template` (default `"random"`), `align` (two-letter
   `tl tc tr cl cc cr bl bc br`, default `cc`), `tone` (optional), `mode`
   (`"fill" | "hug"`, default fill), `grow` (number, default 1).
5. **Verbs on Panel:** `divide(dir)` — if my parent's dir === dir, insert a new
   leaf sibling after me (this is "clicking a second time adds another
   column"); else I become a container: my content moves to a new first child,
   a new leaf joins as second, I take `dir`. `close()` — remove self; a
   container left with one child absorbs it (unwrap). Structure changes only
   through Item verbs.
6. **Bar controls** (left to right): drag grip, `icon("vertical_split")`
   (columns), `icon("horizontal_split")` (rows), 3×3 alignment popover (nine
   dot buttons), **T** template `menu()` over `["random", …template names]`,
   tone `pick()` when the template is tone-aware, ✕ close. Verify the icon
   glyphs actually render; fall back to text glyphs if a name is missing.
7. **Random:** `"random"` is panel.js behavior, not a template. `scatter(panel)`
   may split into 2–4 subpanels (bounded: depth ≤ 2, respect small panels) and
   **commits** concrete random templates/dirs to `data` so a reload is stable.
   Re-picking "random" re-rolls. "Intelligent" fill is an open question — note
   it, don't build it.
8. **Drag/drop:** `class PanelDrag extends Sortable`, handle = the bar.
   Axis-aware `before()` (parent's dir picks clientX vs clientY);
   `drop_check` is both halves (`target !== this && !this.item.contains(target.item)`).
   **Drop inside** = edge zones on a leaf body (outer ~20%): dropping splits
   that leaf on that side. Priority: reorder within a split → move across
   splits → edge-split. Ship what's solid; record what isn't.
9. **Resize:** `.panel-grip` between siblings; pointer capture, rAF-coalesced;
   convert the pair's px to **grow fractions** written to both neighbors'
   `data.grow`; `save()` on pointerup, never per-move.
10. **Persistence:** editor pattern verbatim — localhost `FileSaver({path:
    "/data/panels.json"})`, else `LocalStorageSaver({key: "panels"})`;
    `Item.open(saver)` then fill inside a callback; `seed()` when load is null.
    Root listeners: `change` → save only; `add`/`remove` → save + structural
    redraw. Control handlers repaint their own panel's DOM, then `set()` —
    a `change` must never trigger the full redraw.
11. **`panel(fn)` is the default container door** — default export: wrap any
    content in ONE managed leaf panel (bar, alignment, hug/fill,
    `layout.bar($body)`) with **no saver** (`save()` resolving false is
    correct). Same Panel class, same code path.
12. **Sections in T:** templates.js adapts all fifteen section modules —
    lazy `import()` inside `draw`, appended as a promise (never a factory call
    after `await`). Tone: `panel.get("tone") ?? "surface"`. The panel body
    scrolls; a band keeps its own internal measure.
13. **Experiences in T** (the 3440 fill): `.panel-body` gets
    `container-type: size` (Worker 1, panel.css); templates size with cq units
    so content is **centered and scaled** at any panel size — phone sliver to
    full 3440. Template visuals live in `templates.css` under `.panel-t-*`
    (a template's look is its payload — the one sanctioned exception to
    "module css is layout only"; say so in the readme).
14. **Demo page** (`ext/panel/page.js`): render-first — the persisted workspace
    full-bleed at `var(--panel-height, 34em)`, then a `panel(fn)` single-widget
    demo, then prose + `md.details(import.meta, "readme.md")`. `route(name)`
    returns `full(this, …)` from `styles/layouts/full.js` for the whole-window
    experience at `/framework/ext/panel/full/`. Add `panel` to the children
    string in `ext/page.js`.

## Ownership

- **Worker 1 (panel core):** `ext/panel/Panel.js`, `panel.js`, `panel.css`,
  `page.js`, `readme.md`; the one-line `ext/page.js` children edit; the
  exec-summary `framework/ai/2026-08-13/panel/page.js`. **May not touch**
  `templates.js` / `templates.css` (a stub exists — code against it).
- **Worker 2 (templates):** `ext/panel/templates.js` + `templates.css` only,
  plus notes at `framework/ai/2026-08-13/panel/templates.md`. If the readme
  exists when you finish, append one numbered section at the END; merge, never
  overwrite.
- **Neither** touches `core/`, `styles/`, `ext/layout`, `ext/draggable`,
  `ext/saver`, `ext/editor`, `server.js`, `Server/`, or this file.

**The seam** (`templates.js`, stubbed by the orchestrator):

```js
export const templates = {
    name: { icon: "…", draw($body, panel){ /* captor is $body */ } },
};
export default templates;
```

`draw` may append a promise; it must never factory-call after an `await`.
panel.js iterates `Object.keys(templates)` for the T menu and calls
`templates[name].draw($body, panelItem)` with the captor already on `$body`.

## Acceptance (real browser, dev server already on :80 — do NOT restart it)

1. `/framework/ext/panel/` renders, zero console errors.
2. Split-V twice → three columns; split-H inside one → rows in a column.
3. Grip drag resizes; sizes survive a container resize (fractions, not px).
4. Alignment and template picks repaint one panel, not the tree.
5. T → `hero` renders the section; tone chip retints it.
6. Drag a panel by its bar into another split — axis-aware placeholder;
   drop commits; drop on a leaf's edge splits it (if shipped).
7. ✕ closes; a one-child container unwraps.
8. Reload → the whole arrangement (structure, sizes, templates, tones,
   alignment) comes back. `public/data/panels.json` exists (gitignored).
9. `/framework/ext/panel/full/` fills the window; check at 3440-wide viewport.
10. `node --check` passes on every JS file (copy to `.mjs` in the scratchpad).

## Traps (all have bitten this repo; details in the digest)

captor restored at the first `await` — build after it lands in `$app`; a
backtick anywhere inside a `` css(`…`) `` literal kills every page; restate
`@layer base, theme, site, util;` in full in every stylesheet, every rule in a
layer; `flex-1` lacks `min-height: 0` — restate `flex: 1 1 0; min-width: 0;
min-height: 0` at every nesting level; a flex child of a heightless box
collapses; `handle: false` never undefined; `.ac("")` throws; `.style("--x",v)`
needs the View method (setProperty); a `<select>`'s value is written after its
options; the layout drawer closes on any capture-phase click outside its
classes — panel chrome must stopPropagation; selection/redraw state is an id,
never a node; empty drop targets need min size to stay hittable; coalesce
pointermove with rAF; no mutual imports (child page.js never imports its
parent's); a nested `.page` needs `default` or Page.css hides it silently.

## Protocol

No commits, no pushes — leave everything uncommitted on `michael/dev`. No npm
installs. Global playwright is available for browser verification; screenshots
go to the scratchpad, never the repo. Don't start or kill servers; if you must
run node, capture the PID and `taskkill //F //PID` it when done. Make calls,
don't ask; record open questions in your exec summary / notes file.
