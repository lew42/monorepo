# demo — design record

**question → options → weighing → verdict.**

---

## 1. Why the example is a function and not a string

A code example written as a string is dead text in the editor: no highlighting, no
completion, no formatting, no syntax errors. Written as a function it is **live code
the IDE checks**, and the page renders exactly what was checked.

The stronger property is the one that makes this worth an ext at all: `demo(fn)`
stringifies `fn` *and calls it*, so **the code shown and the thing rendered cannot
be two different things.** There is no second copy to fall out of date. A docs
example here cannot lie about what it does — only about whether it's a good idea.

`source()` lives in `util/` rather than here, because `code.fn()` in `ext/highlight`
needs the identical transform and two copies of "where does a function body start"
would eventually print the same function two ways on one page.

---

## 2. The third pane: HTML output

**The question, as asked:** *"I asked at one point for a demo system that included
the html output — was that made? Is it possible?"* It had not been. It is.

**Options.**

| | |
|---|---|
| a hand-written HTML block beside each demo | a second copy — the exact thing §1 exists to prevent |
| `el.innerHTML` in a `<pre>` | one line, no indent, littered with the builder's whitespace text nodes. Technically the answer, unreadable as one |
| **serialize the live DOM** | ✓ |

**Verdict: serialize the live DOM**, via `util/markup`. It reports what *is* there
rather than what was meant, so the pane cannot drift from the box above it — the
same guarantee §1 gives the code pane, extended to the output.

### Closed by default — and now a column, not a drawer

The answer to "what does this render" **is the render**; the markup is the follow-up
question. So it stays hidden until asked for.

It *was* a `<details>` at the bottom of the box, which was free and had correct
keyboard behaviour. What killed it: a `<summary>` halfway down a tall box is a
control in the middle of content, and the thing it controls appears below the fold.
The toolbar (§7) is where a control belongs, so the pane lost its own disclosure and
the box grew a `<>` button.

Given a toggle, the arrangement question came back: **beside the JS, or under it?**

| | |
|---|---|
| always stacked | a 900px box showing two 400px columns of nothing |
| a `demo(fn, { split: true })` option | an option is API surface forever, and the author does not know how wide the box will be |
| a container query | correct, and more machinery than the thing it decides |
| **`flex-wrap` + a `22em` basis** | ✓ |

**Verdict: `flex-wrap`.** Two panes at `flex: 1 1 22em` sit side by side when the box
can hold two and stack when it can't — and "the box", not the viewport, is the width
that actually varies here. The same demo splits maximized and stacks in a phone
column, and nothing was configured.

`.ac("stack")` is the veto, for an example whose lines are long enough that half a
box is worse than the whole one. Nothing can measure that, so it stays a human call —
and it costs no API, because `demo()` already returns a View.

### Read on first open, not up front

Not laziness — correctness. A demo whose content arrives from a promise (`md.file`,
`code.file`) has **not finished building** when `demo()` returns, so serializing then
would show an empty box for exactly the examples that need it most. A click is always
later than that.

### Kept: it shows classes the author did not write

`<a href="/framework/">` serializes as `<a href="/framework/" class="in-path">`,
because `Router.mark_links()` really did add that. So the same demo shows slightly
different HTML depending on which url you arrived at.

Filtering it was considered and rejected. A serializer you can't trust for the next
question is worse than one that occasionally shows something surprising, and the
surprise is *true* — on the Router's own page it is the best available demonstration
of what `mark_links()` does. Recorded in `util/markup/readme.md` §6 as well, because
that is where someone will try to "fix" it.

---

## 3. Two soft dependencies, and why they stay soft

`demo/` imports **neither** `ext/markdown` nor `ext/highlight`, and works better with
each:

```js
const view = p.c("demo-note");
return view.md ? view.md(text) : view.backtick_append(text);   // caption
return code[lang] ? code[lang](src) : code(src);               // code + html panes
return code.file ? code.file(meta, url) : fetch(…);            // demo.source.file, §9
```

`ext/markdown` patches `View.prototype.md` at import time and `ext/highlight` adds
`code.js` / `code.html` to the `code` factory, so the feature test *is* the dependency
check. **An ext may lean on an ext; only core may never.** Hard-importing would drag
`marked` and five highlight grammars into every page that wanted one boxed example.

The captor detail that makes the code pane work: `pre.c("demo-code", () => code.js(…))`
puts a `<pre>` in the captor slot, and `code.js()` detects "pre" context and returns a
bare `<code>` — exactly the element this used to build by hand.

---

## 4. Strings before the function label; strings after caption

`demo("Label", fn)` and `demo(fn, "caption")` — argument *position* carries the
meaning, with no options object.

**The caption is the important one.** A doc page leads with code, and the sentence
explaining it reads *after* you have seen the thing. Putting it inside the same box
means prose can never detach from the example it describes, which is the failure mode
of a paragraph written above a demo and then edited.

`args.findIndex(is.fn)` is the whole parse. A demo with no function at all renders a
visible `.demo-error` rather than throwing — a broken example should not take the
page down, and it must not fail silently either. Same deal as `md-error`.

---

## 5. No margin in `demo.css`

A demo is a block in a flow, and the flow spaces it (`Page.css`). It had
`margin: 1.75em 0`, which at (0,1,0) out-ranked the specificity-zero flow rules and
gave demos a rhythm nobody else had. Deleted rather than matched — see
`core/Page/readme.md` §"Rhythm".

The code pane's background is another instance of the same class of bug, and it is
recorded in the file: it used to be hardcoded a shade lighter here, so a site setting
`--code-bg` restyled every code block on the page *except* the ones inside demos.
A demo's code area is a `pre`; it should look like one.

---

## 6. ⚠ A div is not a viewport — media queries do not respond to the handle

**This is the one thing to know before trusting the resize handle.** The stage is a
`<div>`. Dragging it narrow changes what the *content* is laid out inside, so
everything intrinsic responds correctly — `auto-fit`, `minmax`, `%`, `flex-wrap`,
`min()`, container queries. A `@media (max-width: 45em)` inside the example does
**not**: a media query asks the browser viewport, and the browser viewport did not
move. Drag a demo to 390px and it will still be showing you its desktop branch.

Zoom has the same shape of limit for the same reason, and `transform: scale()` would
have been worse — a scaled box still occupies its unscaled size, so nothing re-lays
out at all. `zoom` at least changes the element's own coordinate system, which is
what makes the readout meaningful.

**Today this is harmless and tomorrow it is a trap.** Every layout in
`styles/layouts/` is intrinsic — checked, there is not one `@media` among the eight —
so the handle currently tells the truth about everything it is pointed at. It stops
telling the truth the moment someone writes a demo with a breakpoint in it, or labels
a preset "390" and means it.

**The fix, when it is wanted, is an iframe** — a real nested viewport, where media
queries fire, `100vw` means something, and `scale()` on the iframe element gives
honest zoom-to-fit with a truthful px readout. The cost is real: building into another
document, injecting the framework's stylesheets there, and pointing `View.captor` at a
foreign `document`. Deferred deliberately, not overlooked.

---

## 7. The toolbar, and why the stage is three boxes

Every control that changes what you are looking at is in one strip at the top: the
label, the zoom, the `<>` pane toggle, and fill-the-window. Before, the label was a
strip, the HTML pane had its own `<summary>` halfway down, and there was no zoom or
resize at all — three different places to look for "how do I see this differently".

**Fill-the-window is a class, not a url**, and that is the deliberate half of the
split. `requestFullscreen()` needs a user gesture and so can never be restored on a
reload; this is the same class of thing — a way of *looking* at a box, not a place to
be. A layout that wants a url has one: `styles/layouts/viewport.js`, which claims
`<url>viewport/` through `route()` precisely so a live reload comes back to it.

**The three boxes** — `.demo-stage` › `.demo-screen` › `.demo-render` — are not
decoration, and two attempts to merge them both failed in ways that pass silently:

- Scrolling on the **stage** clips the handle. The pill hangs 0.125em over the right
  edge by design, and any `overflow` above it both cuts it in half and turns the
  overhang into scrollable width. Measured: the drag stopped working entirely,
  because the half of the handle you aim at was the clipped half.
- `overflow-x` on the **render** forces `overflow-y` off `visible` too — the axes
  cannot be set independently unless the value is `clip`. That put an `auto/auto`
  scroll box around every demo on the site, which does nothing at all until someone
  writes a tooltip or a popover that overflows on purpose.

So: the stage owns the width and the handle, the screen owns the padding and the
scrolling, and the render is the bare content box. That last one is what makes
`.demo-size` honest — `offsetWidth` with no frame in it, and unaffected by `zoom`, so
a 700px stage at 50% correctly reads 1400px. Deliberately not the ResizeObserver
entry's `contentRect`: what that reports under `zoom` has moved between browser
versions, and `offsetWidth` has not.

The one thing a bare stage does not inherit is `--demo-pad`, declared on `.demo`.
`.demo-screen` therefore reads `var(--demo-pad, 1.5rem)`; inside a `.demo` the
fallback never applies.

Right-click clears a dragged width. A reset button in the toolbar would be a control
whose only job is undoing another control, and there is no other way back to
"whatever fits".

---

## 8. The stage is first-class; the code pane is opt-in

**The question.** Every page showing an example paid for a code block above the
render. On a *leaf* page — one whose whole job is "here is the thing" — that block
is what pushes the thing below the fold. `demo.stage(fn)` existed, but only as a
private extraction with the code pane deleted: no zoom, and no way to reach the
window's edge. The one resizable viewport on the site was reachable by accident,
and only for a wall of previews.

**Options.**

| | |
|---|---|
| `demo(fn, { code: false })` | an option is API surface forever, and "the box minus its box" is not a variant of the box |
| a second `leaf()` helper beside `demo()` | a fifteenth mechanism — exactly the sprawl `ai/2026-08-09/proposal.md` counted |
| **promote `demo.stage`, split the file** | ✓ |

**Verdict: `demo.stage(fn)` is the form**, upgraded in place rather than renamed.
Two call sites already used it and neither had to change; a new name would have had
to earn its way past one that was already right. The three boxes, the handle, the
ruler and the zoom moved out to **`stage.js` / `stage.css`**, which `demo.js`
imports — one implementation of "how wide is this really", and `demo.js` got
*shorter* by gaining an API.

### The corner, not a bar

A bare stage has no toolbar, and giving it one would re-create `demo()`'s chrome for
a page that asked for none. **The zoom joins the width readout in the stage's own
bottom-right corner** (`.demo-tools`), which is where the readout has always sat.
Inside a `demo()` the zoom stays up in the bar — §7's rule holds, every control that
changes what you are looking at is in one strip — so the corner carries the readout
alone there and `demo()` renders exactly as it did.

Moving `demo()`'s zoom into the corner too, so zoom lives in exactly one place, is
the obvious tidy and was **not** taken: it changes a box that appears on forty-odd
pages to fix a consistency nobody has complained about. Recorded as open (§11).

### Full-bleed is `.bleed`, not an option

`demo.stage(hero).ac("bleed")` on a `classes: "standard"` page. `.bleed` is already the
Page template's widest track (`Page.css`); `.demo-stage.bleed .demo-screen` hands back
the screen's inset so the render really touches the window. Nothing was invented,
and the word means on a stage what it means everywhere else on the site.

---

## 9. `demo.source()` — the code, closed, below the render

**The question** (`ai/2026-08-09`, open question 1): on a leaf page, does the source
go below the render on the page, or only into `ext/layout`'s panel? **Mike's
verdict, same day: both** — a `details` on the page for copy-paste *and* a Source
tab in the panel, built in parallel so the better one can win by being seen. This
module owns the first half.

```js
demo.source(hero);                          // the summary reads "Source"
demo.source(hero, "The whole band");
demo.source.file(import.meta, "hero.js");   // the summary reads "hero.js"
```

**Two functions, not one parsed signature.** `demo()`'s `args.findIndex(is.fn)`
parse works because label, caption and options are distinguishable by type. Here
they are not: the function form is `(fn, label)` and the file form is
`(meta, url, label)`, and they collide on "the second argument is a string". So the
file form gets its own name — the same split `md.file()` and `code.file()` already
make — and each function reads as one thing.

**Closed, and below.** The answer to "what is this" is the render; the code is the
follow-up question. That is §2's argument for the HTML pane, applied to a page
instead of a box — and the objection that killed the pane's own `<details>` does not
apply here, because a `<summary>` at the end of a page is not a control in the
middle of one. Nothing *enforces* below: `demo.source()` is an ordinary factory and
the page decides where to call it. The name and this record are the whole defence.

**The same soft dependency a third time** (§3): the file form uses
`ext/highlight`'s `code.file()` when it is loaded, and otherwise fetches into a
plain `<pre>`. ⚠ That fallback builds its `<pre>` with `capture: false` *before* the
await and only sets text after — a factory call textually after an `await` would
land wherever the captor had drifted to. Both failure modes (a bad status, a dead
network) become text in the box rather than an unhandled rejection.

---

## 10. `demo.responsive` — the same builder at two widths

`responsive.js`, a sibling of `demo.js`, in the shape `ext/highlight` uses on `code`:
importing it patches `demo.responsive`. It is a second file because it is a second
responsibility, and one-way — it imports `btn`, `caption` and `source_code` from
`demo.js` so the two boxes cannot drift, and `demo.js` never imports it back (a
mutual pair would break only on deep reloads).

- **The handle is a width dial, not just a splitter.** Every drag position is a
  pair of simulated widths, mirrored around the middle — centered the panes are
  twins, either extreme is exactly `wide` beside `narrow`, and dragging across
  trades them. So a drag shows both layouts *reflowing*; the first version pinned
  the two widths, and dragging only ever re-zoomed. Log-spaced, not linear:
  breakpoints sit at ratios, so a linear sweep spends most of the run above
  2000px where nothing moves.
- **The share clamps at ¼ / ¾**, not near the edges. The pane going mobile keeps
  enough of the row that it zooms *in* as its width falls while the wide side
  zooms out — at a 5% clamp both directions would just shrink.
- **`zoom`, not `transform: scale()`**, per §6 — and here it also removes work: a
  scaled box occupies its unscaled size, so the sketch this started from needed
  height-clipped wrappers and a `height = content × factor` pass, both of which
  simply do not exist under `zoom`.
- **The panes always meet at the handle.** The left pane gets `flex: 0 0 <share>%`
  and the right one takes the rest, and each pane's factor is then measured —
  `clientWidth / simulated` — rather than derived from the share. So the handle's
  width, a scrollbar, anything, is already accounted for.
- **The `ResizeObserver` is width-guarded.** `fit()` changes the row's height, which
  would otherwise call it straight back on every pass.
- **The media-query caveat is unchanged** (§6): a 3440px pane is 3440px of *layout*,
  not a viewport. Container queries respond; `@media` does not.

---

## 11. `demo.app()` — a tree in a box, promoted from the Page demos

**Renamed from `mini_app()` (Mike, 2026-08-12):** `mini-app.{js,css}` → `app.{js,css}`,
`MiniApp` → `DemoApp`, `.mini-app*` → `.demo-app*`, and it is reached the way
`demo.tree` is — `import { demo } from "/app.js"`, then `demo.app(tree, { nav })`.
The box was never *mini*; it is this tier's app, and the name now matches the
namespace every other entry point already uses.

**The question.** `demo.app` — App and Router for one in-memory tree, in a box —
was born in `core/Page/overview/` as that page's private machinery, and a
second consumer (`ai/2026-08-08`) was already importing it across the tree. The
five-block rule says anything that frames an example must name the block it
extends.

| | |
|---|---|
| leave it beside its first consumer | buried where nobody would look, and the cross-tree import was the smell |
| a sibling system of its own | a fifteenth mechanism — the census again |
| **promote into `ext/demo`** | ✓ it frames a render, which is the *stage* block |

**An iframe instead was asked and rejected.** An iframe needs a real url, and the
demo trees are deliberately fictional — so every card would need its tree as real
files, boot the whole app (fourteen boots on one rail), and hide the site chrome via
a mode App does not have; `demo.source()` would stop printing the one small tree
you are looking at. The iframe stays what §6 says it is: the eventual answer for
*viewport simulation*, not for tree demos. What demo.app must not borrow from the
real app — and why its marks are `aria-current`, never `.active` — is recorded in
`core/Page/readme.md`.

---

## 12. `web()` — the shared sample tree

One fictional site — nine children, `html`/`css`/`js` a level deeper — that any
demo takes and overrides the **root** of, so what changes between demos is exactly
what each demo teaches. `core/Page/nav/` is four of them — wall, catalog, sidebar,
crumbs; the point of a shared tree is that the tree visibly *doesn't* change.

**Deliberately not used by the Page overview demos.** There the *source is the
lesson* — and every one of those pages now prints its own file, where an import
would be the first line a reader met. Bespoke minimal trees where the code
teaches; `web()` where the arrangement does.

Content is `p()`, not `md()` — this module keeps §3's rule and takes no markdown
dependency for nine one-liners.

---

## 13. `demo.page()` — a demo as a child page, and why it isn't a class

**The question** (Mike, Aug 2026): pages with many demos bury them down a scroll —
the range slider on the forms page took real scrolling to find. Direction: *use
previews as nav whenever possible* — each demo a sub page, so the catalog rail
becomes a **visual table of contents**.

| | |
|---|---|
| `Page.prototype.demo(fn)` | a method renders one block, but the ask is a page *shape* — preview + content + note as one unit |
| `class DemoPage extends Page` | classdoc already weighed a subclass and said no: no named parts to override, and a class fixes identity where a function composes. `Layout` earns its subclass by overriding `render()` itself |
| **a config factory, `demo.page(name, fn, {note, icon})`** | ✓ the `tree()` / `word()` precedent — spread-overridable, no new identity |

The card is the render at `zoom-50`, fresh per call (a cached render would be
stolen from the card); the page is the stage, its source open **below** it, and
the note captioned under that — see §15, where the shape was settled for both
factories. First consumer: `styles/elements/forms/`, ten demos, one rail.

---

## 14. A demo box is an exhibit, so it leaves the measure

**The question**, from a 3440 monitor: every `demo()` on the site rendered 936px wide
with 2200px of grey beside it. `styles/layers/util/` showed fifteen `flex gap` examples
in a reading column; `styles/layers/base/`, nine side-by-side compares — the densest
comparison layout on the site — at the same 936px. The page arguing hardest that
layouts *"respond to the width of the box… which is why the same class string is
correct across a 3440px monitor"* was demonstrating that inside a 546px stage.

The doctrine that settles it is one sentence: **the measure is for reading; anything
you *look at* rather than read leaves it.** A demo is the definition of the second kind.

| | |
|---|---|
| each page adds `.ac("wide")` to its demos | ~30 pages, and every new demo is a chance to forget. The doctrine would live nowhere |
| a page-level `classes: "full"` for demo-heavy pages | 45 pages look like they want it and none do — their titles, captions and "next:" lines are prose and still want the measure |
| **the block knows what it is: `demo()` carries `wide`** | ✓ one edit, ~30 pages |

**Verdict: `demo()` and `demo.stage()` add `wide` themselves.** With `--breakout`
now responsive (`core/Page/doc/layout.md`) that is 1024px at 1600 — unchanged from
before — and **1655px at 3440, up from 936**. The class is inert anywhere but a
direct child of a `.page.standard`, so a demo nested in a flex row, a card or a catalog
panel is untouched.

**The opt-out is `.ac("quoted")`** — the word the doctrine itself uses for a code
block that is quoted rather than exhibited. It joins `stack`, `max` and `bleed` as a
bare word on `.demo`, and it is written four classes deep in `demo.css` precisely so
it beats `.page.standard > .wide` on specificity instead of on stylesheet load order.

⚠ **`demo.stage()` is decorated; `stage()` is not.** `exhibit.js` (§15) imports the
raw `stage()` from `stage.js` and puts it in its own `bleed` band, so the fourteen
Page-overview demos take no `wide` and nothing double-applies. Anything that
composes `stage()` directly owns its own track, which is the reason the two doors exist.

---

## 15. `demo.exhibit()` — one detail page, built once

**The question** (Mike, Aug 2026): *"I wish I could conclude on a consistent demo
UX."* Every catalog detail page on the site was assembling its own: `styles/sections`
hand-rolled a stage plus a file source, `styles/layouts` did it without a bar,
`demo.page()` and `demo.tree()` each had a third arrangement, and the Page overview
demos a fourth. Four answers to one question, none of them wrong on its own page.

**Verdict — a detail page is three things, in this order, always:**

1. **the thing, running, on a stage you can drag narrower** — `demo.stage(fn)`, or
   the demo app on a bare stage;
2. **a layout bar wired to it** — `ext/Layout` is the site's one control surface,
   so the assembly hard-imports it rather than leaving it to each page to remember;
3. **the definition, open, below** — and `note:` captioned under that.

`demo.exhibit({ stage, def, file, note })` is that assembly, and `demo.page()` and
`demo.tree()` are both two lines of config over it. `exhibit.js` is where all three
live, because "a demo as a **page**" is one responsibility and `demo.js`'s boxes are
another — which also keeps `ext/Layout` off every page that only wanted a `demo()`.

### The source is the DEFINITION, not the file

`demo.tree()` used to print its own `page.js`, imports and
`export default new Page(demo.tree({…}))` included. Mike: *"clear and good, except
for a newcomer the extra imports and `export default new Page(demo.tree(…))` is all
quite confusing."*

| | |
|---|---|
| the whole file | the lesson is four lines into it, behind two lines of harness the reader has no use for |
| the file, minus a marked region | a second syntax to learn, and a comment that silently drifts from the code |
| **the function, stringified** | ✓ the machinery `demo()` has always used (§1), pointed at `tree` / `fn` |

**Verdict: stringify the definition.** `tree:` was *already* a function — it has to
be, because a `Page` caches its `view` — so this needed no signature change, only
`source(this.tree)` where `demo.source.file(this.meta, "page.js")` used to be. The
whole file is one click away as a link beside the summary (`target="_blank"`, which
is also what makes the Router leave it alone), so nothing is hidden, only ranked.

⚠ **A comment inside the definition prints with it.** That is the one place in this
repo where a comment is doc rather than debt: `// the rail: one link per child` is
part of the lesson, and the file's other comments — the harness ones, outside the
function — correctly do not appear.

### The bar follows what the render shows

`stage(steer)` builds the render and calls `steer(target)` with whatever the bar
points at — **again, every time that target moves.** A tree demo navigates inside
its box, so a bar bound once to the root would, three clicks later, be editing a
page that is no longer on screen: a control that silently does nothing, which is the
failure mode this repo cares most about. `DemoApp.shown(page)` is the one hook that
makes it live, and the bar is redrawn into its own slot rather than re-pointed,
because a control reads its target at build.

For a function demo the target is the `.demo-render`, so the reader can point at any
box inside the example and read back the line that builds it.

### One title per surface

A demo detail page had two titles: the lesson's (`labels`) and the specimen's
(`Guide`, rendered by the root page inside the box). **The page `h1` is the lesson's
name; the specimen's name lives in the box's own chrome** — the url strip, the rail.
So a demo app *on a stage* hides its root's `h1` (`.demo-app-root`, marked by
`app.js`, hidden by `exhibit.css`). ⚠ In a **card** it keeps it: a thumbnail is the
sign over the door, and fourteen name-less thumbnails were the problem the distinct
root names were introduced to solve. ⚠ Children keep their `h1` everywhere — on half
these demos it is the thing being taught.

**The card is the tree at `zoom: 0.5`, and the zoom rides the demo app, not the
thumb.** 18em of rail lays the site out at 36em, which is a readable window
rather than the 88em desktop the old quarter-scale card implied. ⚠ Zooming the
*thumb* was the old shape and it cost an override: `em` inside a zoomed box
computes in zoomed units, so `--thumb-max` cropped at half the ems it named and
`max-height: none` had to be written back. On the demo app instead, Page.css's
crop is simply correct.

## 16. Open

- ~~**Two `styles/` tiers still hand-roll the detail page.**~~ **Closed 2026-08-12 —
  the tiers converged.** `styles/sections` (fifteen bands) and `styles/layouts`
  (eight shapes) both call `demo.exhibit()` now, so *every* catalog detail page on
  the site is the one assembly: `styles/sections`, `styles/layouts`, the Page
  overview demos, `demo.page()`'s ten forms demos and `demo.tree()`. Four answers
  became one, and both conversions **deleted** machinery rather than adding it:
  - `sections` lost its hand-rolled `layout bleed` band, its `layout.bar()` call and
    its `demo.source.file()`; the tone chips it already registered with
    `layout.context()` now ride the exhibit's own render, so a band has exactly one
    control surface. It also reversed its own §8 — *"no stage on a leaf band,
    revisit if the stage ever grows a flush mode"* — because `.bleed` **is** that
    flush mode (§8 here).
  - `layouts` lost `Layout.js` and `recipe.js`. The subclass existed only to
    override `render()` so a page could BE its layout; on a stage it no longer is,
    so it dissolved into `detail.js`, a config factory in the shape of
    `demo.tree()` (§13's verdict, applied a second time). `recipe()` printed the
    class string and the page's own `page.js` — the definition's first line and the
    file link beside the summary are both of those, from the assembly.
  - What the conversion needed and did not have: nothing. `def`, `file`, `note` and
    a `steer` callback covered a live tone switcher and a nested `.page` without a
    new option. The one thing worth knowing is that a layout's render is a real
    `.page` inside the stage and therefore needs `default` — the arrangement
    contract's own word for "shown without being routed to", which `demo.app()`
    already uses for the same reason.
- **Zoom lives in two places** — `demo()`'s bar and a bare stage's corner. One
  control, two homes, because unifying them means moving a control on every page
  that has a demo (§8).
- **`demo()` — the box — has no layout bar.** Only the *page* assembly does. A box
  is a quoted example inside a page about something else, and thirty of them each
  growing a toolbar is the noise §7 moved into one strip in the first place.
- **`.demo-stage` is not in `toc()`'s skip list.** A bare stage renders example
  content, and a heading inside an example is not a section of the page — but only
  `.demo` is skipped, so `demo.stage()` leaks its example's headings into the rail
  until the caller adds `toc-skip`. The fix belongs in `ext/toc`.
- **No way to show a demo that must not run.** `code.fn()` covers it, on the other
  ext, which is the right split — but nothing on the demo page says so loudly.
- **The pane re-reads on show, not live.** Toggle it off and on after clicking inside
  a demo and you see the new DOM. A genuinely live pane needs a `MutationObserver`
  and has no asker yet.
- **No width presets on the main box.** "Mega / desktop / mobile" was asked for and
  is not there: a preset labelled `1920` is a promise about media queries that a div
  cannot keep (§6). Zoom percentages promise nothing they don't deliver.
  `demo.responsive` (§10) names two widths and inherits the same caveat — it is a
  layout comparison, not a viewport. Real presets land with the iframe or not at all.
- **`--demo-pad: 2rem` is a lot of a 262px box.** At 390px the frame is a quarter of
  the demo's width. Pre-existing, but the stage makes it more visible.
