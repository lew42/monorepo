# Tabs — design record

A bar of links, and the panel those children mount into. An ext that patches
`Page.prototype`, so `this.tabs("guide api")` reads exactly as it did when it lived
in core.

Long form: `./doc/extraction.md` — why it left `core/Page`, the options weighed, and
the physics checked before shipping.

## Which page earns a tab bar

The test, and the ordering is deliberate:

1. Do the children need more width than this page's measure? → **previews**
2. Does the reader drill *into* them rather than flip *between*? → **previews**
3. Is the list open-ended? → **previews**
4. Otherwise, and only then → **tabs**

`/framework/ext/` used to be the site's one tab bar and met the old four-condition
test — flat, four children, none with children of its own, flipped between rather
than drilled into — and it was still the wrong call. **A fifth condition was
missing, and it is the one that decides it:**

> A tab bar mounts its children **inside the hosting page**, so every child inherits
> that page's measure.

`ext` is a measured doc page at `60em`, so `files` — a file tree beside a code pane —
was laid out in **847px of a 1253px region**, and the component that most needs width
had the least. `previews()` mounts each child in the **region** instead, at the
region's width: the file browser went from 781px to 1187px.

**Where tabs are right: a page with no prose of its own that exists to arrange its
children.** `classdoc.page()` is that page twice over — a horizontal set of groups, and
a vertical rail of members inside each — and it is still the only caller on the site.

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
call site (`classdoc`'s top bar; its member rails stay `vertical`). It is the one shape
that carries **type**: the labels take the scale's `h4` — the annotation level, which is
what a strip of section names is — with `--tab-pad-x` widened to match. Restated rather
than handed to the anchor as `.h4`, because the variant is a class on the *set* and the
anchor is emitted by this module; keep it in step with `framework.css`. The underline
default is untouched. It ships no fill either: the hairline moves off the bar and onto the tabs, so under the selected one it
is *absent* rather than covered, which is the only way a tab can merge with a page whose
background this module is not allowed to know. **`--tab-fill` is the one way out**
(2026-08-12): a host that *tints* the strip needs the selected tab to cut back to
whatever its content sits on, so it names that ground and the tab fills with it —
default `transparent`, so an untinted bar is exactly what it always was. `--tab-pad-x`
arrived with it, for a host that wants the tab *labels* on its own text axis rather
than the tab boxes.

**The panel rule is about the panel, not the group.** Every set renders its first
child as the panel's `.default`, so no panel is ever blank, and which one shows is
read entirely off the url — clicking produces byte-identical output to reloading.

Three rules do work that would otherwise need JS:

```css
.tab.active, .tab.in-path                          { border-bottom-color: var(--prim); }
.tab-bar:not(:has(.tab.active)) > .tab:first-child { … }
.tab-bar:not(:has(> .tab + .tab))                  { display: none; }
```

The first comes free from `Router.mark_links()`. The second gives a set whose url isn't
selected the selected *look* on its first tab, mirroring the panel's own `.default`
fallback. The third is **a rail of one is not a rail** — the panel is still a region and
the child still mounts, but a bar with one entry is noise. It is what makes an overview
with no sub pages look like a plain page.

**`[aria-current]` counts as selected too, in all three shapes.** A stand-in app —
`ext/demo`'s `demo.app` — has no Router to set the two classes, and `mark_links()`
would clear a borrowed one anyway, so both the selected-state selectors and the
first-tab fallback read the attribute as a third mark. The alternative was a
`.demo-app .tab[aria-current]` block in `ext/demo`, which lost because it restated
this module's look in a later layer once per shape and still left `.vertical`
unmarked. Purely additive, and that is the reason it was cheap: the real Router
never sets `aria-current`, so no real tab gains or loses a mark. `ext/catalog`'s
rail fallback reads it the same way, for the same reason.

**Overflow: one strip that scrolls, never a wrapping block.** This was the module's
headline trap for as long as it existed — *"right at ~5 children, unusable at twenty"* —
and `core/View` documenting all fifty of its members made it real: the rail flips to a
horizontal bar under 64em, and fifty wrapped links were 500px of nav above the content
they navigate. `flex-wrap: nowrap` plus `overflow: auto` on both axes, and a
`max-height` on the rail so `position: sticky` means something (a rail taller than the
viewport sticks its top and puts its own last entries out of reach forever).

The scrollbar is hidden, so **`reveal()` scrolls the selected tab into the strip** — the
same bargain `ext/toc` makes, and the same reason: hiding a scrollbar is only honest if
something keeps the current item in view. `scrollBy` on the bar, never `scrollIntoView`,
which walks up and scrolls the region too.

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
