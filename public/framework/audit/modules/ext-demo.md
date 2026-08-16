# ext/demo

The site's one example mechanism — every runnable demo on every catalog leaf,
framework-wide, is one of four primitives (`demo()`, `demo.stage()`,
`demo.exhibit()`, `demo.app()`) or a config sugar over them. It earns its place
more thoroughly than almost anything else audited this pass: ~61 files call
`demo()` alone, and the module's own design record (twenty sections, entirely
question → options → weighing → verdict) is the best-argued document in the
directory. The single most important thing to do to it is **not** a redesign —
it's fixing a real, verified bug the conversion to `Doc` just made visible: every
one of the seven names in the new API tab (`stage`, `exhibit`, `page`, `tree`,
`layout`, `app`, `source`) will show a false **"Replaced at runtime"** banner,
because none of them were ever named to begin with, and `Doc`'s patch-detector
can't tell "never named" from "patched."

## State

| | |
|---|---|
| files | 16 (15 code/doc + `doc/record.md`) |
| lines of JS / CSS | 1396 / 493 |
| callers | Framework-wide. Non-dead-code counts: `demo()` ~61 files, `demo.stage()` 35, `demo.exhibit()` 31, `demo.tree()` 28, `demo.page()` 23, `demo.layout()` 23, `demo.app()` 17, `demo.source()` 3. Every leaf under `styles/layouts/`, `styles/sections/`, `ui/`, `core/Page/overview/`, `/web/`. Full breakdown in the readme's new "Who uses it." |
| docs before | `readme.md` already excellent and already broken into a short-section shape with a `doc/record.md` breakout (20 sections) — this module was documented like a `Doc` module before `Doc` existed. `page.js` was a plain `Page`: no `subject`, no API/Docs/Files tabs, zero `doc/method`, `doc/property` or `doc/file` files. No `classdoc` references found. |
| docs after | `page.js` → `Doc` (`subject: demo`, `methods: "stage exhibit page tree layout app source"`, `notes: "record"`, `files:` all 15). 7 `doc/method/*.md` (new), 15 `doc/file/*.md` (new), `readme.md` gained "Who uses it," a Traps entry for the patch-banner bug, and an "Open" section. `doc/record.md` untouched — already correct. |

## What I changed

- **`page.js`**: `import { Page, … }` → `import { Doc, … }`; `new Page({…})` →
  `new Doc({…})` with `subject: demo`, `methods: "stage exhibit page tree layout
  app source"`, `notes: "record"`, `files:` (all 15 non-`doc/` files). The
  `content()` body is byte-identical except for one added sentence pointing at
  the new API tab — this was a wrapper change. Verified: `node --check` clean,
  `curl` 200 on `/framework/ext/demo/`, `/framework/ext/demo/page.js`,
  `readme.md` and `doc/record.md`. `ls` against `files:` matches exactly.
- **`readme.md`**: added "Who uses it" (Step 2's finding — framework-wide, with
  live counts rather than an unreadable 200-row table), one new Traps bullet for
  the false-patch-banner bug, and an "Open" section pulling the standing items
  out of `doc/record.md` so they're visible without following the link.
  Everything else preserved as-is — it was already one screen and already good.
- Wrote all 22 new `doc/**` files: 7 method, 15 file. `doc/record.md` (the one
  pre-existing note) needed no changes.

## Recommendations

1. **Real bug: the API tab's "Replaced at runtime" banner is wrong on all seven
   members, right now.** *Claim:* `demo.stage = (fn, steer) => {…}`
   (`demo.js:128`), `demo.stage.two =` (`demo.js:144`), `demo.source =`
   (`demo.js:168`), `demo.source.file =` (`demo.js:171`), `demo.app =`
   (`app.js:31`), `demo.exhibit =` (`exhibit.js:43`), `demo.page =`
   (`exhibit.js:102`), `demo.tree =` (`exhibit.js:138`), `demo.layout =`
   (`layout.js:37`) are all function expressions assigned to a **member**
   expression, which JS never name-infers — confirmed empirically
   (`demo.stage.name === ""`). `Doc.member_page()`'s `patched(fn, name)`
   (`util/source/source.js:64`, `return fn.name !== name`) reads that as "an
   ext replaced this at runtime" and prints the warning banner
   (`Doc.js:130-131`) — for every single one, because none of them were ever
   named, not because any of them were patched. *Cost:* the real fix is naming
   each assignment (`demo.stage = function stage(fn, steer){…}`), which is
   free — no behavior changes, `fn.name` becomes correct, `patched()` needs no
   edit — but touches four files outside `page.js` (`demo.js`, `exhibit.js`,
   `app.js`, `layout.js`), all fenced off from this pass. It also likely affects
   `ext/markdown`'s `md.file`/`md.details` (same "function with properties"
   shape, same assignment style) — worth checking there too. **simple, important
   — filed, not fixed, per the fences.**
2. **Merge `demo.tree()` and `demo.layout()`; leave `demo.page()` alone.**
   *Claim:* of the "six sugars," three (`demo()`, `demo.exhibit()`, `demo.app()`)
   are irreducible doors — different display shapes, not alternatives to each
   other. Of the other three, `demo.tree()` and `demo.layout()` are the same
   function signature (a single config object, no `name`, built for
   `new Page(demo.X({…}))`) differing only in which key names the specimen
   (`tree:` vs `layout:`) and how the card renders. `demo.page()` is
   structurally different on purpose — `(name, fn, config)`, built for
   `children: [demo.page(…), …]` — so merging it in would paper over a real
   difference (does this specimen need a `name` key or not) rather than remove
   one. See "Where this module overlaps others" below for the full answer to
   "is this three." *Merged call site:*
   ```js
   // was: demo.tree({ meta: import.meta, tree: shop })
   // was: demo.layout({ meta: import.meta, twin: true, layout(){ … } })
   demo.tree({ meta: import.meta, tree: shop })              // unchanged — dispatch on `tree:`
   demo.tree({ meta: import.meta, twin: true, layout(){ … } }) // same door, dispatch on `layout:`
   ```
   One function (`demo.tree`, kept — `demo.layout` retired), branching
   internally on `config.tree ? … : config.layout ? … : …` the same way
   `demo.layout()` already branches on `this.twin` for its stage. *Cost:* real
   — 28 + 23 = 51 call sites, and `demo.layout`'s name is more discoverable for
   "a whole page as a demo" than a repurposed `demo.tree` would be. **I would
   not actually do this merge** — the payoff is one fewer word to learn, not
   fewer bytes of implementation (the internal branching that already exists
   doesn't shrink), against 51 call sites of churn. Named because the brief
   asked for a concrete merge, ranked here rather than acted on. **medium effort
   to sketch, small value — not recommended.**
3. **Fix the taxonomy in the readme before touching any code.** *Claim:* the
   actual, zero-risk fix to "six sugars is a lot of API surface" isn't a merge —
   it's that `demo.app()` is documented as a peer of `demo()` / `demo.stage()` /
   `demo.exhibit()` ("four doors") when it behaves like a *component* (a `View`
   you can hand to any of the other three as their render function — see
   `page.js`'s own `demo.stage(() => demo.app(sample(), …))`), not a distinct
   display mechanism. Demoting it in the readme's framing costs one paragraph
   and clarifies more than any of the actual mechanism is currently confusing.
   *Cost:* none — a wording change, not made in this pass because "Four doors"
   already ships as a table other pages link to and I didn't want to change
   copy that thirty pages might quote without a green light. **simple,
   important — proposed, not applied.**
4. **Name each of the seven arrow functions.** The direct fix for #1 —
   `demo.stage = function stage(fn, steer){…}` instead of an anonymous arrow,
   for all seven assignments across `demo.js`, `exhibit.js`, `app.js`,
   `layout.js`. Zero behavior change (`this` isn't used in any of them), and it
   makes `fn.name` correct everywhere else that reads it, not just in `Doc`.
   *Cost:* four files, nine call sites, mechanical. **simple, important — the
   actual fix for #1, listed separately since #1 is the finding and this is the
   patch.**
5. *(Outside the box, ranked last on purpose.)* **Turn the Overview into its own
   rail, recursively, using the module's own sugar on itself.** *Claim:* the
   skill's "variants are pages, not a wall" guidance would split "the box," "the
   stage," "the exhibit," "the sugars," "the app" into sibling pages via
   `overview: [demo.page("box", …), demo.page("stage", …), …]` — which the
   module can build with its own primitive, unlike almost anything else on the
   site documenting itself. *Cost:* real design work (what's the right split,
   does the narrative order survive being non-linear), and the current single
   page already leads with code before prose throughout, which is most of what
   the guidance is protecting against. **medium, speculative — a genuine option,
   not taken.**

## Where this module overlaps others

**The "six sugars" question, answered directly: no, and it isn't really six.**
They're two tiers wearing one flat list. Tier one — `demo()`, `demo.stage()`,
`demo.exhibit()` — are irreducible: a quoted box, a resizable viewport, and a
full detail-page assembly are three different things a reader *wants*, not three
implementations of one thing. Tier two — `demo.page()`, `demo.tree()`,
`demo.layout()` — are config sugar over `demo.exhibit()`, and are legitimately
three because "what is the specimen" (a function / a tree / a whole page) is a
real three-way fact with three different card shapes (`zoom-50` render / linked
mini-app thumbnail / `zoom-25` or `twin()`), not an accident of naming — the
design record (§13, §15, §21) already argued this and rejected collapsing them
into one config-driven class. **`demo.app()` doesn't belong in either tier.** It
returns a `View`, exactly like `div.c(…)` or any other renderable factory, and
every real use hands it *to* `demo.stage()` or `demo()` as their content
function rather than using it as a peer door. Calling it a "door" in the readme
overstates its role; see Recommendation 3.

**`ext/layout`, `ext/Panel`, `ext/editor`'s shell, and this module's own
`stage()` all build "a thing shown inside a resizable frame with controls."**
From where I sit, they're already correctly two families, not one that should
merge into a fifth:

- **The ephemeral-viewport family** — `ext/demo`'s `stage()` (simulate a width
  via `zoom`, never touch real DOM structure, nothing persists) paired with
  `ext/layout`'s bar (read/write classes and inline style on a *live* target,
  in memory only unless something else saves it). These two are **already
  unified** at the one seam that matters: `demo.exhibit()` hard-imports
  `ext/layout` specifically so every detail page gets the same control surface,
  and `ext/editor`'s properties panel reuses the identical `ext/layout` word
  vocabulary for the same reason. `ext/layout` is the shared "controls"
  primitive across at least three consumers already — that's the unification,
  and it happened without a fifth module.
- **The structural-arrangement family** — `ext/Panel`'s splits (a persisted
  `Item` tree; dividing a panel *is* building the document) and `ext/editor`'s
  shell (literally a `Panel` workspace wrapping an `Item` canvas). Real,
  durable mutation, survives a reload.

  These two families should not merge: a demo stage's entire safety property is
  that dragging it can never mutate anything real, while a Panel split's entire
  point is that it does. A single "resizable frame" component serving both
  would need a mode flag distinguishing "this drag is real" from "this drag is
  a simulation," which is exactly the kind of option-as-permanent-API-surface
  CLAUDE.md warns against, for a merge whose only payoff is one fewer file. The
  unified version, from here, **already exists** — it's `ext/layout` as the one
  shared controls vocabulary, imported by the three consumers that need
  controls, while each frame (`stage()`, `Panel`) stays specific to what kind of
  resize it's honestly offering.

## Skill feedback

**`Doc`'s member lookup is one level deep, and the skill doesn't say what to do
about a two-level door.** `demo.stage.two` and `demo.source.file` are real,
documented, load-bearing entry points that simply cannot appear in `methods:` —
`Doc.declaration`/`member()` resolve `subject[name]`, never `subject[a][b]`, and
there's no guidance in the skill (or in `ext/doc/readme.md`) for "a member of a
member." I resolved it by documenting both inside their parent's
`doc/method/*.md` prose and noting the gap in `page.js.md`, but I was guessing —
the skill's "Every name in every list has its `.md` on disk" check has no
answer for a name that structurally *can't* have a list entry.

**Second, and stronger: the skill never mentions `patched()`'s false-positive
mode for a "function with properties" subject**, even though `ext/doc/readme.md`
itself names `md` and `demo` as the canonical example of that `subject:` shape
in the same breath it explains the patch-detection trick — a trick built
assuming class methods (which get real names from class syntax), silently wrong
for exactly the other shape the same paragraph endorses. Auditing this module is
what surfaced it; a module documented as a class would never have hit it. Worth
a line in the skill's "Auditing an existing module" checklist: *if `subject` is
a function with properties, check whether its members are named function
expressions before trusting the patch banner.*

**Third, minor:** Step 2's instruction — "For each [caller], note what they use
it for and their page url" — has no guidance for a module used in 60+ files.
Written literally it would have produced a table longer than this whole report
for no more signal than "everywhere." I substituted counts and a few named
examples; "a module with no callers is itself a finding" (the brief) has no
stated opposite for "a module with too many callers to enumerate usefully."
