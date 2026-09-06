# Tabs — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

## Which page earns a tab bar

A page with no prose of its own that exists to arrange its children — flipped
*between*, not drilled *into* — and only once its children fit inside the hosting
page's own measure, because a tab bar mounts them **there**, not in the region.
[`usage.md`](./usage.md) has the four-condition test and the `ext/` mistake
that forced the fifth.

## Who calls it

| caller | what for | url |
|---|---|---|
| [`ext/Doc/Doc.js`](/framework/ext/Doc/) | both levels of every `Doc` page — the top section bar (`.block`) and each section's vertical member rail | every module page below, e.g. [View](/framework/core/View/) |
| [`ext/tabs/page.js`](/framework/ext/tabs/) (this page) | its own two demo sets, underline and `.block` | `/framework/ext/tabs/` |

`Doc` is the only **functional** caller in framework code today, but it is not the
only *route* to `this.tabs()`: `app.js` imports `tabs.js` a second time, on its own
line, specifically so any other `page.js` can reach for it without depending on
`Doc` — the same shape `highlight` uses for `code`. Nothing else has taken that up
yet. Two more files reach for the method only as a **prose example**, not a live
call: [`core/Page/old/nav/page.js`](/framework/core/Page/old/nav/) and
[`framework/faq/page.js`](/framework/faq/). One file,
[`web/nav/tabs/page.js`](/web/nav/tabs/), reuses the **CSS classes** by hand
(`.tabs`, `.tab-bar`, `.tab-panel`) without importing `tabs.js` at all, because its
demo has no Router for the real method to talk to.

Eight module pages route through `Doc` as of today (App, Page, Router, Sidebar,
View, `dev/Socket`, `ext/Doc` and its own `overview/urls`), each rendering a
top `.block` bar plus one vertical rail per section — so the DOM footprint is
already much larger than "one caller" suggests, even though there is still exactly
one call site.

## Decisions

**Which children are tabs is decided at placement, not marked on the child.** So a
page can have several sets, and a child in none of them renders wherever it would
have anyway — nothing on a `Page` ever says *"I am a tab."*

**A set nests by nesting pages, not by nesting sets.** A tab whose panel needs its own
tabs is a `Page` with children that calls `tabs()` in its own `render()`. Both levels
then get real urls, real `.active` marking and a real back button for free, because the
only mechanism involved is `Page.container()` reading `parent.regions`. There is nothing
in this file about depth.

**The look is the default, not a variant.** A flat text label, a hairline under the set,
a 2px mark under the selected one, every value a token — `--line`, `--subtle`, `--ink`,
`--prim`. A `.minimal` class was rejected: the quiet version *is* the component, and a
tab bar that ships a box, a fill and a radius has decided something that was not its
call. `.vertical` stays a variant because it changes the **axis**, not the skin.

**`.block` is a style option, not a second component** — folder tabs, opted into at the
call site (`Doc`'s top bar; its member rails stay `vertical`). It is the one shape
that carries **type**: the labels take the scale's `h4` — the annotation level, which is
what a strip of section names is — with `--tab-pad-x` widened to match. Restated rather
than handed to the anchor as `.h4`, because the variant is a class on the *set* and the
anchor is emitted by this module; keep it in step with `framework.css`. The underline
default is untouched. It ships no fill either: the hairline moves off the bar and onto
the tabs, so under the selected one it is *absent* rather than covered, which is the
only way a tab can merge with a page whose background this module is not allowed to
know. **`--tab-fill` is the one way out** (2026-08-12): a host that *tints* the strip
needs the selected tab to cut back to whatever its content sits on, so it names that
ground and the tab fills with it — default `transparent`, so an untinted bar is exactly
what it always was. `--tab-pad-x` arrived with it, for a host that wants the tab
*labels* on its own text axis rather than the tab boxes.

**The panel rule is about the panel, not the group.** Every set renders its first
child as the panel's `.default`, so no panel is ever blank, and which one shows is
read entirely off the url — clicking produces byte-identical output to reloading.

**`[aria-current]` counts as selected too, in all three shapes.** A stand-in app —
`ext/demo`'s `demo.app` — has no Router to set the two classes, and `mark_links()`
would clear a borrowed one anyway, so both the selected-state selectors and the
first-tab fallback read the attribute as a third mark. `ext/catalog`'s rail fallback
reads it the same way, for the same reason.

**`regions` and `default_tab` stayed on `Page`.** `Page.container()` reads
`this.parent?.regions?.get(this.name)` directly, so `regions` is Page's own concept
(*where do my named children mount?*) and `tabs()` is only ever one of its writers.

## Traps, none of which warn

- **The first tab owns the parent's url**, so a second `tabs()` on one page cannot
  also be default. Only the first set can.
- **Two sets sharing a child name** collide in `regions`, silently; the second call's
  panel wins.
- **A label must not depend on which tab you arrived at.** Declared children are
  imported at construction and the Router awaits them, so every title is real — this
  used to be a live bug reported as *"the first tab's label changes depending on which
  tab renders."* `label` is read before `title`, so a child relabels itself for every
  nav on the site with `new Page({ label: "…" })`.
- **`app` reaches a default child only because `tabs()` hands it over.** A default is
  rendered without ever being routed to, so `Page.child()` never runs on it — and a
  *nested* set with no `app` cannot call `mark_links()`, which reads as "the inner rail
  never highlights on a cold load".
- **Links built after `mark()` ran missed the pass** — `tabs()` calls `mark_links()`
  itself. Anything else rendering links late owes the same call.
- **⚠ `tabs.css` still says "classdoc" twice** (the `--tab-pad-x` comment and the
  `:where()` one) — leftover from before `ext/classdoc` became `ext/Doc`. Named at the
  top of [the audit](/framework/audit/modules/ext-tabs.md) because this file cannot
  fix its own CSS.

## Open

- **Overflow has no test past "it looks fine at fifty."** No page on the site has
  pushed a *vertical* rail past `core/View`'s fifty members, and the `64em` breakpoint
  was measured against one topic region. [`overflow.md`](./overflow.md).

## 2026-09-05 — the floor: every tab set shows its panel

> the current underline tabs (with underline becoming orange (--prim) when active..) don't
> really illustrate their tab content area, it's transparent, and so the link below the tab
> area stays, but there's no visual boundary between them. (the owner, 2026-09-05)

**The panel is a bounded surface now, by default.** A real background, a 1px frame, a radius —
the strip's own rule is the panel's TOP edge, and the selected tab paints its bottom border in
the panel's colour instead of the rule, so the label and the box read as one thing with no seam.
`.ac("underline")` is the one word back to the old, transparent strip; it needs no rules of its
own, since the floor rules are all gated `:not(.underline)` and simply stop matching.

Applied as `.tabs:not(.underline):not(.vertical)` — excluded from `.vertical` because that
skin's tab-level shape (padding, `border-inline-end`, the axis flip under `64em`) has LOWER
specificity than a blanket default would, and the default would have silently overridden it.
`.vertical` gets its own, simpler floor instead: just the panel's background/border/radius,
composed as `.tabs.vertical:not(.underline) > .tab-panel`, since the rail sits BESIDE the panel
with no shared edge to cut into.

**Composes with `.block` on purpose.** `:not(.underline):not(.vertical)` is three classes
against `.tabs.block`'s two, so on a set wearing both, the floor's colours win on every
overlapping property while `.block`'s type (the `h4` labels) stays untouched — the same
"whichever is heavier" shape the [proposal](/framework/ai/2026-09-05/paging-mechanisms-v2/ext-tabs-proposal.md)
worked out for its opt-in `.panel`, reused here for a default instead.

**Padding is asymmetric on purpose.** The pre-floor `.tab-panel` was `padding-top: 3em` only —
that number is the whole site's vertical rhythm under a tab set, a Doc module page included, so
it stays. Left/right/bottom take `var(--pad)`, since those were never
anything before the floor existed. Left open: a future pass could unify all four sides once
someone looks hard at whether 3em still reads right against a visible border; nothing regressed
by leaving it.

**Where this was checked and is safe:**
- `ext/Doc`'s well already set `--tab-fill: var(--wash)` on `.page.doc-page` before this task —
  the floor's background and the selected tab's cut both read that token, so a doc page's own
  well colour carries through with no new rule needed there.
- `.tab` is an anchor, never `.btn`; the theme's `:is(button, .btn)` rule (`css` skill, the
  (0,2,0) caveat) has nothing to match here.
- The six shots below and `mag`/blog control pages are pixel-identical before/after where they
  don't touch `.tabs` — the floor did not leak.

**A rail of one still needs its top edge.** `.tab-bar:not(:has(> .tab + .tab))` hides the bar
(above), which would otherwise leave the floored panel's top open with nothing to draw it — a
`:has()` rule restores `border-top` and the full radius on exactly that case.

**Six before/after shots**, `scratchpad/tabs-panel/shots/` (1280 and 3440 each): `/framework/ext/Panel/`
(a Doc page, `.block` top bar), `/framework/core/Page/` (another Doc page), `/imagine/mag/` and
`/blog/systems/layout-generators/` (unrelated pages — confirmed byte-identical before/after,
the floor doesn't leak), `/imagine/paging/mechanisms/swap/` (the reference — also identical,
see below), `/framework/ext/tabs/` (this module's own demo, the clearest before/after: a
transparent underline strip becomes a bordered white box against the demo's checkerboard).
Proved with `ui-test` on this module's own Doc page: clicking Overview → API → Docs → Overview
kept the panel's `x`/`y`/`width` exactly constant across all three clicks (only height moved,
with content), and the selected tab's `border-bottom-color` equalled the panel's
`background-color` every time (`match: true`, all four reads) — `scratchpad/tabs-panel/ui-test-out/steps.json`.

**The reference (`/imagine/paging/paging.css`'s `.paging-tab-panel` etc.) should drop its own
four classes now that `ext/tabs` matches it** — the [proposal](/framework/ai/2026-09-05/paging-mechanisms-v2/ext-tabs-proposal.md)
said so and this task agrees. Left undone: two of its three call sites (`demos.js`'s
`swap_demo()`, `make/tabs.js`'s `tabs_items()`) sit outside this task's fence (only
`mechanisms/swap/` and `paging.css` itself were open to it), and removing the shared rules
without moving all three would break the two left behind. A fence, not a shrug.

## 2026-08-18 — `--tab-fade` removed

> also, there's a --tab-fade on the .tab-bar that's completely misplaced...
>
> just remove this --tab-fade from the entire repo, I don't know where or why this is here

Three references, all in `tabs.css`: the custom property and `mask-image` on `.tab-bar`, and
the `mask-image` repeat inside the `max-width: 64em` vertical rule. All removed; the
`border-bottom` hairline, `scrollbar-width: none` and `reveal()` are untouched. The
measurements that argued for it are kept in [`overflow.md`](./overflow.md) so the cost of the
removal is on the record — hard cuts at both edges, no affordance but `reveal()`.


## 2026-09-06 — reversed: flush is the default, the rectangle is the opt-in

> the top tabs in the paging demo look broken: the default tab doesn't start selected, and
> there's a gap between tab buttons and tab content (and a border on tab content). I prefer the
> flush, seamless tab look. (the owner, 2026-09-06)

**The floor above became `.tabs.bounded`.** Every rule the 2026-09-05 pass added — the panel's
fill, its 1px frame, its radius, and the selected tab cut out of its top edge — is now gated on
a class the caller says, and **nothing on the site says it**. A set with no word is the
pre-floor strip again: a hairline under the bar, a 2px accent under the selected tab, and the
panel below it with no box.

`.underline` still parses and now names the default, so any call site that ever typed it keeps
working; there were none. The weight is unchanged — `.tabs.bounded:not(.vertical)` is (0,3,0),
the same as the old `:not(.underline):not(.vertical)` — so it still composes with `.block`
exactly as before: the folder skin's type stays, the rectangle's colours win.

**The panel's `padding-top: 3em` did NOT change.** It is the pre-floor number and the whole
site's vertical rhythm under a tab set; the owner's "gap" was measured on
[`/imagine/paging/`](/imagine/paging/), whose demo draws its own strip and had 9px at 1280 and
28px at 3440 of frame gap between the strip and the box. That is fixed in the lab
([`/imagine/paging/doc/decisions.md`](/imagine/paging/doc/decisions.md)); this module's 3em is
untouched.

**Two of the three heavy users, measured before and after at 1280 and 3440** —
[`/framework/core/Page/`](/framework/core/Page/) and [`/framework/ext/Doc/`](/framework/ext/Doc/),
both `.tabs.block`: the panel's border went **1px → 0** and its background
**`rgb(242,242,242)` → transparent**, the bar-to-panel gap stayed 0, the top padding stayed
45.1px / 54px, and the selected tab stayed lit at every reading. The flip to flush is the only
change they show.

**The first tab was never the bug.** `.tab-bar:not(:has(.tab.active, …)) > .tab:first-child`
has lit the default tab since the floor landed, and both pages read the accent on Overview
before this task touched anything. What was unlit was the paging lab's own `.paging-strip`,
which listed only the children and so had nothing to light while the box showed the page's own
content; it gained a `Home` tab — this module's `tab-default` idea, in the lab's own renderer.
