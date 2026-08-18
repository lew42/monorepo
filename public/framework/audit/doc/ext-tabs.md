# ext/tabs

A small, single-purpose ext — one `Page.prototype` patch and its stylesheet — that
does exactly what its readme claims and nothing more. It earns its place doubly:
the component itself (bar + panel, three skins) is solid and well-trapped, and
since the `classdoc` → `Doc` migration it has quietly become **the layout engine
for every documented module on the site**, because `Doc` calls it twice per page.
The single most important thing to do to it: two silent-failure bugs found this
pass — a stale `"classdoc"` reference in the CSS and an uncaught rejection in the
fill promise — are both real and both **outside this pass's fences** (no `.css`,
no non-`page.js` `.js`); they need a follow-up pass that can touch code.

## State

| | |
|---|---|
| files | 4 (`tabs.js`, `tabs.css`, `page.js`, `readme.md`) |
| lines of JS / CSS | 81 / 172 |
| callers | **1 functional call site** — `ext/Doc/Doc.js` (`this.tabs().ac("vertical")` per section, `this.tabs(this.bar()…).ac("block")` for the top bar) — but it backs **8** `Doc`-based module pages today (App, Page, Router, Sidebar, View, `dev/Socket`, `ext/Doc` ×2). `app.js` imports `tabs.js` a second time specifically so any *other* `page.js` can call `this.tabs()` directly; nothing has yet. Two files use it only as a **prose code sample** (`core/Page/nav/page.js`, `framework/faq/page.js`); one (`web/nav/tabs/page.js`) reuses only the **CSS classes**, hand-built, because its sandbox has no Router for the real method. |
| docs before | `readme.md` existed and was already well-shaped (a real design record with Decisions/Traps, unlike some sibling modules); `doc/extraction.md` existed; `page.js` was a plain `Page`, hand-built with `h2`/`code`/`md` — not a `Doc`. Zero `doc/method/*.md`, zero `doc/property/*.md`, zero `doc/file/*.md`. The readme's own "only caller on the site" claim (about `Doc`) was true when written and stale today. |
| docs after | `readme.md` trimmed — the "which page earns a tab bar" test broken out to `doc/usage.md`, a new **Who calls it** section (table + the caller nuance above), the stale "only caller" line corrected, the two live bugs flagged, an **Open** section added. Two new notes (`doc/usage.md`, `doc/overflow.md`); `doc/extraction.md` kept as-is (a historical decision record, still accurate for the moment it describes). One `doc/method/tabs.md`. Four `doc/file/*.md` (one per module file). `page.js` rewritten as `new Doc({ subject: Page, methods: "tabs", notes: "usage overflow extraction", files: "tabs.js tabs.css page.js readme.md" })`, with two live `demo.app()` demos replacing the old four-real-declared-children shape. |

## What I changed

- `readme.md` — restructured: conceptual overview unchanged, usage test moved out
  to `doc/usage.md` (summarized + linked + added to `notes:`), new **Who calls it**
  section (Step 2's deliverable), stale caller claim corrected, `classdoc` bug
  flagged under Traps, **Open** section added.
- `doc/usage.md`, `doc/overflow.md` (new) — the readme's old "which page earns a
  tab bar" test and the overflow trap, each given its own url and folded into
  `notes:`.
- `doc/method/tabs.md` (new) — guarantees and silent traps the source can't show.
- `doc/file/tabs.js.md`, `doc/file/tabs.css.md`, `doc/file/page.js.md`,
  `doc/file/readme.md.md` (new) — one per file, each ending in a ranked
  Improvements list.
- `page.js` — rewritten as `new Doc({...})`. `subject: Page, methods: "tabs"` was
  a deliberate, verified choice (not the obvious one — this module documents
  itself by pointing at a class it doesn't own): `Doc.declaration`/`member()` read
  `Page.prototype.tabs` live, and because `Page.prototype.tabs = function(){...}`
  is a member-expression assignment, `patched()` correctly detects it as replaced
  at runtime — so the API tab shows the real patch, banner and all, the same trick
  `ext/Doc/page.js` documents for `highlight`. Two `demo.app(sample({...}))` demos
  replaced the old four-real-declared-children shape, keeping "every tab is a
  real, reloadable url" provable rather than asserted.
- `public/framework/audit/modules/ext-tabs.md` — this file.

No `.js` outside `page.js` and no `.css` were edited; `tabs.css`'s two `"classdoc"`
comments (lines 21, 111) are named, not fixed — see Recommendations.

## Recommendations

1. **Bug: `tabs.css:21` and `tabs.css:111` still say "classdoc."** *(`--tab-pad-x is
   exposed so a host can pull the strip left … classdoc's well does`* and
   *"…with a plain class — classdoc's overview does"* — `ext/classdoc` became
   `ext/Doc` today and these two comments were missed. **simple, important** — a
   two-word edit, blocked this pass only by the no-`.css` fence.
2. **Bug: the tab fill's promise has no `.catch()`.** `tabs.js:40-60` — `filling`
   is built from `Promise.resolve(...).then(fill)` and handed to
   `this.app?.loaders?.push(filling)` with no rejection handler anywhere in the
   chain. A throwing child `content()` during the fill rejects `filling` silently:
   the bar never paints and nothing prints beyond whatever the child itself
   logged. Every other `app`-touching line in this file is defensively
   optional-chained; this one isn't. **simple, important** — one `.catch(console.error)`
   turns a silently blank bar into a diagnosable one. Blocked this pass by the
   `.js`-outside-`page.js` fence.
3. **Reuse the `subject: <class it doesn't own>` pattern for `ext/highlight`
   once it migrates to `Doc`.** `highlight.js` patches `code` the same way
   `tabs.js` patches `Page.prototype.tabs`, and `ext/Doc/page.js`'s own prose
   already claims highlight "shows what actually runs" — but `highlight/page.js`
   is still a plain `Page` today, asserting that in words instead of proving it
   the way this pass just made `tabs`'s own page do. **medium, useful** — not this
   module's job, but the pattern is now proven and cheap to copy.
4. **Overflow is proven at exactly one size.** No page on the site has pushed a
   *vertical* rail past `core/View`'s fifty members, and the `64em` breakpoint was
   measured against one topic-region shape. Worth a synthetic stress case (a
   `Doc` module manufactured with 200 members) once there's a harness to run it
   in. **medium, speculative** — nothing is broken; nothing has tested it either.
5. **Outside-the-box: fold `ext/tabs` into `ext/Doc` as a private implementation
   detail, and stop patching `Page.prototype` globally.** The redundant `app.js`
   import exists to let *any* `page.js` reach for `this.tabs()` directly — but in
   the time since extraction, exactly zero modules have. If that stays true, the
   general-purpose ext is carrying the cost of a global prototype patch (every
   `Page` everywhere gets a `.tabs` method, wanted or not) for a capability only
   one caller uses. The counter-case: `app.js`'s comment frames this as a
   deliberate long-term bet ("this import is what makes `this.tabs(...)` work on
   any OTHER `page.js` too"), and un-inlining would be a real regression the day
   that bet pays off. **large, speculative** — ranked last on purpose; the
   evidence today is "unused," not "unusable."

## Where this module overlaps others

Not the five named in the brief (`Editor`/`Panel`/`ext/layout`/`DevBar`/`ext/demo`)
— `tabs` doesn't split, arrange a workspace, or hold editable state; it's a bar and
a panel, full stop. It sits instead in a smaller, already-named family: `core/Page`'s
own [nav guide](/framework/core/Page/nav/) lists **Previews, Catalog, Sidebar,
Tabs, Crumbs** as the framework's five ways to navigate a page tree, and all five
that mount content (Previews, Catalog, Tabs) share the one real mechanism —
`Page.container()` reading `parent.regions`. `ext/catalog` is the closest sibling:
both read `[aria-current]` as a third selected-mark for the same reason (a
stand-in demo app has no Router), and both are "children as navigation, region
swaps on click." They're deliberately not one thing — catalog is a persistent rail
for drilling into an open-ended list, tabs is a bar for flipping between a fixed
few — but if a *fourth* region-mounting nav shows up, the shared "read regions,
mark aria-current" plumbing is worth factoring out before it's copied a third time.

## Skill feedback

- **The skill's own `page.js` template omits `readme.md` from `files:`, but the
  convention (confirmed only by reading `ext/Doc`'s own dogfooded `page.js`) is
  that it belongs there.** Quote: *"files: 'View.js View.css page.js', // → Files
  tab + doc/file/<path>.md"* — no `readme.md`. `ext/Doc/page.js` itself lists
  `files: "Doc.js Doc.css page.js readme.md overview/urls/page.js"` and ships
  `doc/file/readme.md.md`. I only found this by cross-checking a real module
  instead of the skill text, which never says explicitly whether the readme (or
  the page.js itself) counts as one of "every file in the module." One sentence
  in the skill — *"files: includes page.js and readme.md, never doc/ or ai/"* —
  would remove the need to reverse-engineer it.
- **No guidance for documenting an ext that patches a prototype it doesn't own.**
  `subject: <the patched class>, methods: "<the one patched name>"` turned out to
  be exactly right for `tabs` (and would be for `highlight`) — the live-patch
  banner falls out for free — but the skill's "classes and non-classes alike"
  section lists four shapes (class / function-with-properties / namespace object
  / none) and this is a fifth: *a class you don't own, documented for one member
  you added to it at runtime.* Worth naming explicitly, since guessing wrong here
  either means `subject: undefined` (losing the live-patch proof for free) or
  inventing a fake local class just to hang `subject:` on.
- **Step 4's `curl` check only proves `page.js` itself is servable**, not that any
  of the new `doc/*.md` pages render without a 404 or an `.md-error` box — a
  one-line addition (`curl` one member/note url too, or note that a browser sweep
  is still needed for those) would close a real gap between "verified" and "the
  file exists on disk."
