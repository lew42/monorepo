# ui

`ui/` is nineteen UI components and one deliberate asymmetry: three
(`table`, `timeline`, `keys`) are exported functions because each hides a
loop; the other sixteen are copy-paste markup with, at most, a small
stylesheet beside them, because an independent 2026-08-09 review found their
functions had zero real callers and every genuine use on the site was
hand-written markup anyway. The module earns its place — the three functions
have real callers today, and the sixteen templates are honestly the better
answer for "logic a user shouldn't have to carry" than a function nobody
called would have been. The single most important thing to do to it: decide,
deliberately, that the sixteen template pages are the site's **demo system**
(`demo.exhibit()`, variants-as-children, live `preview()`) and not
API-documentation pages — and stop the generic "wrap every `page.js` in
`Doc`" instinct at the module's own index. Converting the leaves would have
shown every variant twice (once in `demo.exhibit()`'s own Variants wall,
again as a `Doc`-derived top tab) for no reader benefit.

## State

| | |
|---|---|
| files | 36 (35 in the module + `doc/record.md`) |
| lines of JS / CSS | 1612 JS (20 files); 0 standalone `.css` — every rule lives inline via `css()` inside a `<name>.js` |
| callers | `styles/sections/changelog.js` (`timeline()`), `styles/sections/team.js` + `testimonials.js` (`avatar()`), `styles/elements/forms/page.js` (`css()` from `parts.js`), `ext/AITask/AITask.js`, `ext/LayoutTool/tests/` + `audit/` (`ui.table()`), `dev/DevBar/page.js` (`ui.keys()`), several `framework/ai/*/page.js` task logs (`ui.table()`, `ui.timeline()`). **None of the sixteen templates has a caller anywhere in `public/`** — confirmed again by this pass's grep, matching the 2026-08-09 review's own finding. |
| docs before | `readme.md` — already excellent, one screen plus a 525-line `doc/record.md` breakout. `page.js` — a plain `Page` with `initialize(){ this.catalog(); }` (pre-`Doc`). `doc/*.md`: 1 file (`record.md`). No `doc/file/`, no `doc/method/`, no `notes:`/`files:` wiring. |
| docs after | `readme.md` — added a "Who uses it" caller table, an `ext/Timeline` disambiguation, and a note on the `Doc` conversion + the trap it surfaced. `page.js` — rewritten as `new Doc({ subject: ui, methods: "table timeline keys", notes: "record", files: <all 35>, children: <unchanged 19> })`. `doc/method/table.md`, `timeline.md`, `keys.md` — new. `doc/file/*.md` — 35 new files, one per file in the module, centralized under `ui/doc/file/` mirroring the tree (`ui/doc/file/accordion/accordion.js.md`, etc.) rather than fragmented per component directory. The 19 leaf `page.js` files are **unchanged**. |

## What I changed

- `public/framework/ui/page.js` — rewritten as `Doc`.
- `public/framework/ui/readme.md` — three additions (caller table, `ext/Timeline` note, `Doc`-pass note); no section restructured, none of the existing content removed.
- `public/framework/ui/doc/method/{table,timeline,keys}.md` — new.
- `public/framework/ui/doc/file/**/*.md` — 35 new files.
- Nothing else in the module touched — no `.css`, no non-`page.js` `.js`, no leaf `page.js`.

## Recommendations

1. **Real trap, not a bug: `Doc.overview_section()`'s `content()` runs bound
   to the Overview section, not the module's own `Doc` instance.** A
   `content()` that calls `this.previews()` (or reads `this.children` any
   other way) silently draws the section's own — usually empty — children
   instead of the module's real ones. I hit this live building `ui/page.js`
   and worked around it with `this.parent.previews()`. It belongs in
   `ext/doc/readme.md`'s own Traps list, not just a comment in this one
   file, since the next module to reach for a live preview inside its
   Overview will hit it fresh. *(simple, important)*
2. **Don't convert a demo-system page to `Doc` just because it has a
   `page.js`.** The nineteen leaves here are `demo.exhibit()` pages —
   `children:` is already their Variants wall, drawn by `demo.exhibit()`
   itself. `Doc` would have doubled that as top tabs with zero new
   information. This is a real gap in the `documentation` skill's blanket
   instruction (see Skill feedback) as much as it is a finding about this
   module. *(simple, important — already applied by not converting them; the
   "cost" is that the skill's literal instruction wasn't followed, stated
   here rather than silently)*
3. **The module index's top tab bar is 23 wide** (Overview + 19 declared
   children + API + Docs + Files) once wrapped in `Doc`, because
   `Doc.bar()` always spreads declared children into the strip and this
   module's children are real routed pages, not demo variants that could
   move under `overview:` without changing their urls. I judged this
   acceptable rather than hacking `bar()`/`sections()` blind (no browser
   available to verify the result) and added `this.parent.previews()` to
   the Overview so the visual, click-through browsing the site's prime
   objective wants doesn't depend on the tab strip at all. The honest fix is
   upstream: `ext/doc` gaining a documented way to declare "a real routed
   child that gets a preview card but not a top tab." *(medium, important —
   a shared-infrastructure change, needs Mike's sign-off per "propose before
   major surgery")*
4. **`ui.js`'s nine css-only imports are the only thing standing between a
   component and rendering unstyled with no error.** No leaf `page.js`
   imports its own sibling `<name>.js`; the CSS arrives purely because
   `ui.js` imported it for the side effect. A comment at each end (or a
   short dev-only assertion that every `.ui-*` class referenced by a page's
   own markup has a matching `<style>` in the document) would catch this
   before it ships silently. *(simple, useful)*
5. **The two upstream token/utility proposals in `doc/record.md` — `--ok`/
   `--warn` beside `--error`, and `.flex.end`** — are still open, still
   correctly unapplied (each has one real caller, below the stated bar), and
   still worth carrying forward exactly as recorded. Not re-litigated here.
   *(medium, speculative until a second caller wants either)*
6. **Outside-the-box: stop routing the sixteen templates as top-level pages
   at all.** Each is a handful of markup with no logic and no caller; the
   only things a `page.js` currently buys them are a url, a card, and a
   `demo.exhibit()`. A single `/framework/ui/snippets/` page with all
   sixteen as sections of *one* scrollable, filterable gallery (still every
   snippet visible via `previews()`, still copy-buttoned, still driven by
   the same `demo.exhibit()` machinery per snippet) would cut nineteen
   `page.js` files and nineteen urls down to three (the real components) plus
   one gallery — collapsing the 23-tab question in recommendation 3 by
   removing its cause instead of working around it. This is a large,
   url-breaking change and is offered as a thought experiment, not a plan.
   *(large, speculative)*

## Where this module overlaps others

- **`ui.timeline()` and `ext/Timeline` are two things, correctly.**
  `ui.timeline()` is a static vertical list of dated entries with no time
  axis; `ext/Timeline` is a zoomable h/v axis with lanes, live updates and a
  `--t`/`--em-per-hour` positioning model. They share an English name and
  nothing else — no code, no shared component, no shared CSS. Both readmes
  now cross-link (`ext/Timeline/readme.md` already had the disambiguation
  before this pass; `ui/readme.md` gained the reverse link in this one).
  Not a candidate for merging.
- **`ui/panel/` and `ext/Panel` are also two things sharing a word, and
  further apart than the Timeline pair.** `ui/panel` is a card template
  (surface, head, body, foot, two hairlines). `ext/Panel` is Blender-style
  split-pane arrangement chrome for an editor workspace — an `Item`
  subclass with drag, persistence and a control stack. Zero shared code,
  zero shared concept beyond the English word. Worth a one-line
  cross-reference the way Timeline's is, not worth more; not done in this
  pass since it wasn't in the brief and the risk of confusion is lower (no
  caller has ever reached for the wrong one, per the grep in this audit).
- **`parts.js`'s `css()` helper is reused outside `ui/` entirely** —
  `styles/elements/forms/page.js` imports it for its own unrelated
  stylesheet, purely as the layer-safe `<style>`-tag helper. That's a sign
  `css()` belongs one level up (maybe `styles/parts.js`, which already
  re-exports `surface`/`pill` the same way `ui/parts.js`'s readme records),
  not a sign of a UI-specific overlap. Noted, not fixed — moving it is
  exactly the kind of rename-touching-a-caller surgery CLAUDE.md asks to be
  proposed rather than landed inside an audit pass.
- **Not `Editor`, `Panel`, `ext/layout`, `DevBar` or `demo`.** From here,
  `ui/` is the one of the five that is unambiguously *not* the same thing
  wearing another name — it has no arrangement logic, no persistence, no
  control surface. It **consumes** `ext/demo` and `ext/layout` (every leaf
  page is a `demo.exhibit()`, wired to `layout.bar()`) rather than
  duplicating either.

## Skill feedback

- **"`page.js` — rewrite it as `new Doc({ … })`" has no stated exception for
  a module whose pages already *are* the site's demo system.** I had to
  resolve this myself by reading CLAUDE.md's "one demo system, five blocks"
  against the skill's blanket instruction, and the two genuinely disagree
  for a module shaped like this one. The skill should say, explicitly: if a
  page's `content()` is already `demo.exhibit({ page: this, ... })`, its
  `children:` is already a Variants wall — do not also wrap it in `Doc`,
  because the two mechanisms both turn `children` into a preview wall and
  you get it twice. Only the module's own index page needs `Doc`.
- **A real, silent trap in `ext/doc` that the skill's own "rules that keep
  biting" section doesn't mention:** `content()` inside a `Doc` config runs
  bound to the Overview *section* Page, not the `Doc` instance itself, the
  moment that section is built by `overview_section()`. Every other rule in
  that section of the skill is about capturing/`await`/backticks — this one
  is about `this` silently meaning something narrower than the object you
  wrote the config for, and it produces no error, just an empty rail. Worth
  a line next to "A page nobody links to does not exist."
- **No guidance on where `doc/file/*.md` should live for a module with its
  own nested subdirectories that each have a `page.js`.** I inferred the
  answer — one centralized `doc/file/` tree at the module's root, mirroring
  `ext/doc`'s own precedent (`doc/file/overview/urls/page.js.md`) — but had
  to reverse-engineer it from an example rather than being told. Worth a
  line: "for a module whose components live in their own directories, a
  centralized `doc/file/` at the root beats one `doc/` per component,
  unless that component is independently documented with its own `Doc`."
- **Positive:** the "Do not hand-cite line numbers" rule and the
  Improvements-heading-always requirement were both unambiguous and easy to
  follow exactly as written — no feedback needed there, stated for contrast
  with the two points above.
