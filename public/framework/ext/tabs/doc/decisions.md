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
call: [`core/Page/nav/page.js`](/framework/core/Page/nav/) and
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

## 2026-08-18 — `--tab-fade` removed

> also, there's a --tab-fade on the .tab-bar that's completely misplaced...
>
> just remove this --tab-fade from the entire repo, I don't know where or why this is here

Three references, all in `tabs.css`: the custom property and `mask-image` on `.tab-bar`, and
the `mask-image` repeat inside the `max-width: 64em` vertical rule. All removed; the
`border-bottom` hairline, `scrollbar-width: none` and `reveal()` are untouched. The
measurements that argued for it are kept in [`overflow.md`](./overflow.md) so the cost of the
removal is on the record — hard cuts at both edges, no affordance but `reveal()`.
