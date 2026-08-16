# demo — design record, long form

**question → options → weighing → verdict.** The current state is one screen up,
in `../readme.md`; this is the history, the alternatives and the reversals. Where
the two disagree, the readme is right and a section here has gone stale — §21
records what moved last.

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
| `class DemoPage extends Page` | Doc already weighed a subclass and said no: no named parts to override, and a class fixes identity where a function composes. `Layout` earns its subclass by overriding `render()` itself |
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
now responsive (`core/Page/doc/css.md`) that is 1024px at 1600 — unchanged from
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
2. **a layout bar wired to it** — `ext/layout` is the site's one control surface,
   so the assembly hard-imports it rather than leaving it to each page to remember;
3. **the definition, open, below** — and `note:` captioned under that.

`demo.exhibit({ stage, def, file, note })` is that assembly, and `demo.page()` and
`demo.tree()` are both two lines of config over it. `exhibit.js` is where all three
live, because "a demo as a **page**" is one responsibility and `demo.js`'s boxes are
another — which also keeps `ext/layout` off every page that only wanted a `demo()`.

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
- ~~**No width presets on the main box.**~~ **Reversed 2026-08-12 — §17.** The
  argument was that a preset labelled `1920` promises media queries a div cannot
  keep (§6). It stands, and the answer turned out to be labelling: the number is a
  *layout* width, which is exactly what the stage delivers and what the readout
  reads back. `demo.responsive` (§10) had been naming two widths on that basis all
  along.
- **`--demo-pad: 2rem` is a lot of a 262px box.** At 390px the frame is a quarter of
  the demo's width. Pre-existing, but the stage makes it more visible.

---

## 17. The stage can only shrink — simulated widths, and one control

**The question** (Mike, 2026-08-12): the stage renders at 100% of its container and
the handle only ever makes it *narrower*. On a laptop that puts every desktop and
ultrawide layout out of reach — the widths the site's own doctrine (§14) argues
hardest about are the ones a reader cannot see.

**Verdict: `zoom()` picks a WIDTH or a percentage.** A width lays the render out at
390 / 810 / 1440 / 3440 and computes `zoom = room ÷ width` so it fits where it is —
the arithmetic `demo.responsive` has always used, now `simulate()` in `stage.js` and
imported by `responsive.js` so there is one copy of it and one place the
`zoom`-not-`scale` trap is written down.

### The widths, and why the label leads with the number

`390 · mobile`, `810 · tablet`, `1440 · desktop`, `3440 · mega` — a current phone
(not the 375 of an iPhone 8), a tablet held upright, the width nearly every desktop
comp is drawn at, and the monitor §14 was written on. §16 refused presets because
`1920` promises media-query behaviour a `<div>` cannot deliver, and that objection
is still true (§6). What answers it is the *order of the words*: the number is a
layout width, the stage really does lay out at it, and the readout says so. The
device word is the mnemonic, second, and it is doing the same job the words `wide`
and `narrow` already do on `demo.responsive`.

### One control, not two — *superseded the same day by §20*

| | |
|---|---|
| a preset row of four buttons in `$tools` | four controls where there was one, and the corner of a `bare` stage is a pill on a border with no room for them |
| a preset `<select>` beside the zoom `<select>` | two dials answering one question — "how am I looking at this" — and in a `demo()` they would sit in two different places (§7's whole point is one strip) |
| **widths and percentages in the one `<select>`, two `<optgroup>`s** | ✓ |

**Verdict: merge.** Every option does the same thing to the render — sets a zoom —
and half of them also name the width it is computed from. `100%` is the neutral
entry, so the way back was already in the list and no `Fit` had to be invented.

The merge is also what makes "zero new API on the callers" true: `demo()`,
`demo.stage()`, `demo.exhibit()` and `demo.tree()` **already** call `zoom($view,
measure)`, each into the right place for its own chrome, so all four got widths
without a line changing in `demo.js` or `exhibit.js`. A control built into `$tools`
by `stage()` itself would have put a second dial in `demo()`'s corner, below the bar
that already has one.

### Never magnified, and never centred

`zoom` is capped at 1: `room = min(container, width)`. A 390px layout in a 1200px
stage at 3× is a magnifying glass, not a phone — the one thing a reader can check
against reality is 1:1, and the whole feature exists to show the *layout*, which 3×
does not change. Below 1 there is no cap: `mega` in a 900px stage draws at 26%,
which is small and honest.

The 810px of empty stage that leaves beside a phone is **not** centred, deliberately:
today's axis verdict (`core/Page/doc/css.md`) puts everything on one left edge,
and a box that re-centres its contents restarts that argument inside a stage. A
phone on the left with room to its right is what a phone in a desktop window is.

### The handle wins ties

A drag makes the width the reader's own, so a simulated one lets go rather than
fighting it, and the handle keeps meaning what it has always meant: *this is the
width the example lays out at*. Re-fitting a preset to a dragged stage was the
alternative and it demotes the handle to a zoom slider — the readout would sit at
`1440px` through the whole drag and nothing would reflow, which is this repo's
least favourite failure mode. Right-click still clears everything, the percentage
included.

The two halves are 30 lines apart in `stage.js` and talk through one `demo-release`
event on `.demo-stage` — the element the handle and the control are sure to share,
including in `demo()`, where the control lives up in the bar and outside the stage,
and in `demo.tree()`, where it points at the demo app's page region rather than at
the render.

### The readout, checked

`offsetWidth` is the element's own box and ignores `zoom` (§7), and under a preset it
is the number that was picked, exactly — measured in Chrome: `1440px · 60%`,
`3440px · 25%`, `390px` at 1:1, `1731px · 50%` for a manual half-zoom of an 866px
stage. The computed factor now rides along whenever it isn't 1, because under a
preset nothing else on screen says what the render was scaled to. Same format
`demo.responsive` prints under each pane.

### Kept: the stage still opens at 100%

Mike floated rendering it a little under 100% so there would be room to drag it
*larger*. Weighed and declined: it would shrink every demo on the site by default to
buy an affordance the widths now provide outright, one click and with a number
attached — and §14 had just spent the `wide` track making these boxes bigger.

---

## 18. Two-up drag: one re-simulation per frame

**The problem.** `demo.responsive`'s split handle re-simulated on every
`pointermove`: two width writes, then `fit()` measuring both panes and re-zooming
them, each a full relayout of a live render. Fans spin.

**Measured, Chrome, `/framework/ext/demo/`** — 200 `pointermove`s dispatched inside
one turn of the loop (what a 240Hz pointer, or any pointer faster than the handler,
actually delivers):

| | main thread | re-simulations |
|---|---:|---:|
| before | **781–807 ms** | 200 |
| after | **0.4–2 ms** | 1 |

Three fixes, all of them removing work rather than deferring it:

1. **rAF coalescing** — `drag(el, move)` in `stage.js` keeps the last event and runs
   `move` once per frame. The stage's own handle uses it too: it was reading
   `getBoundingClientRect()` per move, a forced layout of the whole document.
2. **Unchanged widths do nothing.** `split()` computes both simulated widths and
   returns if neither moved — which is every frame the pointer spends past the ¼/¾
   clamp, and the reason two of the three passes above cost zero.
3. **Read both rooms, then write both panes.** Interleaved, the second
   `clientWidth` read re-lays-out the document the first write just dirtied — two
   forced layouts per pass where one will do.

**The trailing debounce was not needed and not taken.** It was the third candidate:
let the flex split track the pointer live and re-zoom ~100ms later. It changes the
feel — the panes would lag their own divider — and with the numbers above there is
nothing left to defer.

### Open

- ~~**`demo.tree()`'s pill doesn't report the simulated width.**~~ **Closed by §20**
  — the controls left the demo app's titlebar for the stage's own strip, so they
  point at the render the ruler measures.
- **`demo.responsive` doesn't carry `wide`.** §14 gave the doctrine to `demo()` and
  `demo.stage()`; the two-up is the widest exhibit on the site and was missed.
- **A simulated width is still not a viewport** (§6). `@media` reads the real
  window; everything intrinsic responds. The iframe remains the only honest answer
  to *that* question, and these labels are careful not to make the promise.

---

## 19. The exhibit is a band, `ui/` joined it, and a demo can carry variants

Three changes, one thesis: *one page system everywhere.* `demo.exhibit()` was four
loose siblings on the page grid; it is now one block that can lay itself out, and
the last section still doing its own thing joined it.

### 19.1 Why the four siblings became one band

`stage`, `steer bar`, `source` and `caption` were direct children of `.page.standard`,
so each picked its own track: the stage took `bleed`, the source took `main`. **On a
3440 monitor that is a 3020px render above a 936px code block with 2000px of grey
beside it** — the exact complaint `--breakout` was made responsive for
(`core/Page/doc/css.md`), one level down.

| | |
|---|---|
| put the source on `bleed` too | a `<pre>` of 80-character lines in a 3020px box is the same grey, differently arranged |
| a container query on the page | correct, and it needs a wrapper anyway — so the wrapper is the actual answer |
| explicit `grid-row` / `grid-column` per sibling on the page template | four rules coupling `ext/demo` to Page.css's track names, and one that breaks the moment a caller adds a fifth block |
| **one `.demo-exhibit` band, `flex-wrap` inside it** | ✓ |

**Verdict: `demo.exhibit()` emits one `bleed` band holding a render column and a
definition column.** `flex-wrap` + a basis, not a query — §2's verdict applied to a
page, and for §2's reason: the width that varies is the *band's*, and the band is
the thing that knows. `84em + 32em + the gutter` is ~121em, deliberately past
`--breakout`'s own 96em knee, so:

| viewport | band | render | definition |
|---|---|---|---|
| 390 | 390 | **390** (flush) | 390, inset |
| 810 | 810 | 745 | 745 |
| 1440 | 839 | 772 | 772 |
| 3440 | 2698 | **1767** | **661, beside it** |

Measured, all four. **Nothing below ~2.5K moves at all** — 1440 is byte-identical to
what it was — and the mega monitor stops spending its right third on nothing.

**The phone gets the other half of the fix.** `--gutter-x` bottoms out at `2em`,
which is 16% of a 390px screen spent on axis. Under `36em` the band pays none of it
and the render is the full width; only the definition column keeps the inset,
because that column is *text*. That bends `doc/css.md`'s one-left-edge rule
exactly as far as §14 already does — the measure is for reading, and a render is
not reading.

⚠ **Two rules moved with the DOM.** `.page.standard > .demo-stage.bleed` and
`.page.standard > .demo-steer.bleed` (the gutter payback) no longer match, because
neither is a direct child of the page any more; the band pays it once instead.
`stage.css`'s rule still serves `styles/layouts/word.js`, which composes a stage
without the assembly. And `demo.tree()`'s **bare** stage, which had no track class
at all and was therefore capped at `main` (936px), is now a render column — a mini
app lays out at desktop width rather than at reading width. That is the intent;
the letterbox it produces for a `height: "18em"` tree on a 3440 is open below.

### 19.2 The source block grew a copy button

`ui/parts.js` shipped `copy(fn)` — a second code block with a clipboard button —
beside every `demo.source()` on the site. One of two things showing you the same
code is always the stale one, so the affordance moved into the block that was
already there and `copy()` was deleted.

⚠ It reads the **rendered `<pre>` at click time**, not the function: `demo.source.file`
fetches, so there is nothing to hold until it lands — and copying what you can see
cannot drift from it. ⚠ `preventDefault()` is load-bearing: a click anywhere inside
a `<summary>` toggles it, and that is the element's *default action*, not a listener,
so `stopPropagation()` alone leaves the reader closing the box they just opened.

### 19.3 `Variants` — a demo page's children, under the exhibit

**The question** (this session's brief): any demo page should be able to carry
child variants — *the simple example IS the category for the complex ones.*

| | |
|---|---|
| a `variants: [...]` config of render functions | a fifteenth preview mechanism, and none of them would have a url |
| a `Page.prototype.variants()` beside `previews()` | a second wall, differing from the first by a heading |
| **`page.children` → `h2("Variants")` + `previews()`** | ✓ |

**Verdict: hand the assembly the page.** `demo.exhibit({ page: this, … })` renders
`h2("Variants")` and `this.previews()` when the page has children, and stops when it
doesn't — so `styles/sections` and `styles/layouts` gained the capability by adding
one word each and changed no pixels. Zero new preview mechanisms: the cards are
`Page.css`'s, the same ones the rail is made of.

⚠ **The heading and the wall are emitted as direct children of the page, outside the
band.** `previews()` carries `bleed`, and both that track and its `--gutter-x`
payback are written with a child combinator — inside the band they would silently
be a `main`-width wall with no inset.

⚠ **`page`, not `this`.** `demo.exhibit()` is called, never bound, so the page has
to arrive as a named key. It reads `page.children` and `page.previews()` and nothing
else, which is what keeps it out of the black-magic column.

### 19.4 What `ui/` looked like before, and what it is now

`ui/` was the last section outside the system: a `previews()` wall with three token
overrides for an index, and nineteen detail pages that were `palette()` +
`copy()` + prose + loose `demo()` boxes. The `ai/2026-08-11` census had already
named `palette()` the fourth preview mechanism and pre-committed the fix; this is it.

- **The index is `initialize(){ this.catalog(); }`** — the same one line
  `styles/sections`, `styles/layouts` and `styles/elements/forms` wear.
- **Every leaf leads with `demo.exhibit()`**: the component live on a stage, the
  layout bar wired to it, the template open beside it with a copy button.
- **`palette()` and `copy()` are deleted.** Every runnable example on those pages
  is now either *the* exhibit or a variant child page — 29 of them, all real urls.
- The per-page calls are in `ui/readme.md`.

### 19.5 Also fixed here

**`.demo-note` had no padding outside a `.demo`.** It read `padding: var(--demo-pad)`
with no fallback, and only `.demo` declares that token — so on every exhibit page the
caption was a tinted, hairlined strip with its text against both edges. Invalid at
computed-value time is not an error anybody sees. The box treatment is now scoped to
`.demo > .demo-note`; on a page the caption is just muted prose under the source,
which is what it always meant.

### 19.6 Open, from this session

- **A tall bare stage letterboxes on a mega monitor.** A `demo.tree()` with
  `height: "18em"` in a 1900px render column is a 7:1 strip. The render column caps
  nothing on purpose (§19.1); if this bites, the cap belongs on the *tree*, which is
  the thing that knows it wanted a window.
- **The definition column does not stick.** Beside a tall render on a 3440 you scroll
  the code out of view. `position: sticky` is three lines and no asker yet.
- ~~**`/web/layout/tracks/` still hand-rolls its exhibit**~~ **Closed 2026-08-12** —
  it is `demo.layout({ layout(){ … } })` now, pure config: the four-track page is the
  specimen, and its prose is the exhibit's caption.
- **The `Variants` heading is a fixed word.** "Related" was the other candidate; a
  config key for it would be API surface forever, so the word is the API. Rename it
  in one place if it turns out wrong.

---

## 20. The strip is the stage's own

**Mike, on seeing §17** (2026-08-12, same day): the widths belong in a **toggle**,
centred; the zoom belongs **top right**; there should be a **fullscreen** button
beside it and **one** of those on the site, not the three there were; and the zoom
wants a **magnifier you can drag**, the way a design tool does it.

That is one verdict with four parts, and it reverses §17's "merge into the one
select" the same day it was written. §17 merged because a second control meant a
second *place* — `demo()`'s bar and a bare stage's corner. **What actually fixes
that is giving the stage its own strip**, which is the thing neither §7 nor §8 was
willing to do.

| | |
|---|---|
| the caller places the controls (§17) | four call sites, three different places, and a centred toggle in `demo()` would have to be centred in `demo.css`'s bar — a file this module does not own |
| a fifth block, "the stage toolbar", beside the five | the census again — and it is not a new block, it is the stage's own chrome |
| **`stage()` builds the strip** | ✓ |

**Verdict: every stage builds `[ · | mobile tablet desktop mega | 🔍 zoom ⤢ ]`
itself.** `demo()`, `demo.stage()`, `demo.exhibit()` and `demo.tree()` do nothing
but build a stage, and all four are identical because there is one implementation
and no wiring left to get wrong. Three tracks (`1fr auto 1fr`) so the widths are
centred on **the stage**, not on whatever the dials happen to weigh; a `1fr` floors
at its own content, so the dials keep their corner when the strip runs out of room
and the toggle wraps inside its own cell.

### What that cost the other files, and what it bought

Three deletions, no additions:

- **`demo()`'s bar** loses its zoom and its fill-the-window toggle, and is now
  `[label … <>]`. §7's rule survives with a sharper edge: **the bar controls the
  box, the strip controls the render.** The `opts.full` **link** stays — it is a
  url, not a toggle (`styles/layouts/full.js` claims `<url>full/` so a reload lands
  back on it), which is the same distinction §7 drew in the first place.
- **`demo.tree()`'s titlebar** loses the zoom and the fullscreen button it was
  given when a bare stage had nowhere to put them. They pointed at `app.$pages`
  while the ruler measured the render — so the readout could not report what a
  width had simulated (§18, open). Now a width simulates **the whole demo app**,
  rail included, which is what "this app at phone width" should have meant, and the
  pill reports it.
- **The `demo-release` event is gone.** §17 needed it because the handle and the
  control were built by different callers; now they are built four lines apart in
  one closure, so `resizer($stage, release)` just takes the callback. An invented
  event name that survived one day is the right lifetime for one.

### Widths as a toggle, and what it fixed

A segmented row of four `.demo-btn`s, pressed state `.on` — the same button and the
same pressed state every other demo control uses, so this is one flex rule of new
CSS. It beats the `<optgroup>` on the thing a `<select>` is worst at: **which width
is active is visible without opening anything**, and re-pressing the pressed one
releases it, which is the natural "off" a dropdown had to fake with a `100%` entry.

The select gets its short list back, and is a zoom control again.

⚠ The device word is now the whole label, where §17 argued the *number* should lead.
The honesty lives one line down instead: the button's `title` is `390px of layout —
a width, not a device`, and the readout under the render prints `390px` or
`1440px · 59%` the whole time. §6's caveat is unchanged and unchangeable — a div is
not a viewport.

### Zoom on top of a width, not instead of it

§17 made a percentage clear the simulated width. That was wrong in the way that
only shows up once you have both: **scrubbing into a 1440 layout to read it is the
point**, and clearing the width to do it throws away the thing you were reading.
So the two are now orthogonal — a width sets the layout, a zoom sets the drawing —
and the render scrolls inside the screen when the product is bigger than the room.

The bookkeeping that makes that safe is one flag, `fitted`: the container-resize
re-fit only runs while the zoom is still the one the width computed, so a reader's
own zoom is never stomped by a window resize. And it is the same flag that decides
what a release takes with it:

| | |
|---|---|
| press the pressed width | width off, and the zoom it computed goes with it |
| drag the handle | width off; a *computed* zoom goes, a *scrubbed* one stays — the reader chose that one |
| right-click the handle | everything: width, zoom, and the dragged stage width |
| click the magnifier | show it whole — the current width's fit, or 1:1 if there is none |

⚠ A released width **must** take its computed zoom with it, or letting go of `mega`
leaves the render laid out at whatever ¼ of the room happened to be — measured, and
fixed, before this was written down.

### The magnifier multiplies

`factor × 2 ** (dx / 240)`, clamped to 0.1–4: zoom is logarithmic, so 240px of drag
doubles it whether you started at 25% or 200%, and a linear scrub would be unusable
at one end or the other. It rides the same `drag()` rAF helper as §18's fix, so a
240Hz pointer still re-zooms once per frame. The `<select>` beside it grows a
hidden `<option>` that is shown, labelled and selected only when the zoom is off the
list — so the control never displays a step it isn't on, and never a blank.

### One fullscreen

There were three: `demo()`'s bar toggled `.max` on the whole box (code pane
included), `demo.tree()`'s titlebar toggled it on the stage, `demo.responsive()`
toggles it on its own box. The first two are now the strip's one button, toggling
`.demo-stage.max`, with the icon flipping to `close_fullscreen` so the way out is
the way in. `demo.responsive` keeps its own: it has no stage — two simulated panes
are not a render — and that is the honest reason a fourth would have been wrong.

⚠ **`stage.js` emits `.demo-btn`, which `demo.css` owns.** The rule is "import the
module that emits the class", and this module cannot: `demo.js` imports `stage.js`,
so the pair would be a cycle — the failure that only shows up on a deep reload. The
class arrives with whoever built the stage, which is `demo.js` or `exhibit.js` in
every case there is, and the `css:` note in the file says so.

### Narrow: a container query, and where it has to sit

Three tracks need room. Under one, the `auto` middle track collapses to its
min-content and the four-button toggle stacks **four rows tall** above a 294px
render — measured at a 400px window before it was fixed. The fix is one
`@container (max-width: 34em)` on `.demo-stage` that makes the strip a single
centred column, and it is a *container* query on purpose: what runs out of room is
the stage, which is the one width `@media` cannot see. This file spends §6 saying
that about the example; it turns out to be just as true of the chrome.

⚠ **It has to sit after the rules it overrides.** Same specificity, same layer, so
it wins on document order alone — written above them, the tracks did not move and
only `justify-items` took, which reads exactly like "container queries are broken".

### Open

- **The strip shows on every stage, including the ones nobody will touch.** A card
  preview at `zoom-50` renders a stage with four device buttons on it. Cheap and
  inert, but it is chrome on a thumbnail — a `.demo-stage.quiet` would be the fix if
  it ever grates.
- **`demo()` now has two strips**, its bar and the stage's. Justified by what each
  controls, but a box with a label and a `<>` in a full-width bar is a lot of bar
  for two things.
- **Nothing keys Escape out of fullscreen.** The button is in the strip and the
  strip is inside the stage, so it is always on screen — but a keyboard user has no
  second way out.

---

## 21. Four doors — the two-up became a mode, and one sugar ate two `detail.js`

The 08-12 strategy read counted **ten entry points** in this module and named the
disease: *"the 08-09 census regrown inside the block that was supposed to cure
it."* (`ai/2026-08-12/strategy/layout-simplicity.md`, Move 2.) Four changes, all
of them deletions.

### `demo.responsive` → `demo.stage.two()`

**The question.** §20 gave the stage a strip with the site's one fullscreen —
"one of those on the site, not the three there were" — and then §20 itself
recorded the exception: *"`demo.responsive` keeps its own: it has no stage."*

| | |
|---|---|
| leave the exception | a stated goal with an admitted counter-example is a goal nobody enforces |
| give `demo.responsive` a stage | that is the fold, written the long way |
| **the two-up IS a stage** | ✓ |

**Verdict: `two.js` builds the same `.demo-stage` shell** — the strip, the screen,
`.max` — with two simulated panes in place of one render, and imports `filler()`
from `stage.js` so there is one fullscreen implementation. What it deletes: the
box (`.demo` chrome), the code pane above the panes, the private fullscreen
button, and `responsive.css`.

The strip carries **only** the filler. The width buttons and the zoom stay off,
because the split handle already is this stage's width dial and two dials
answering one question is what §17 rejected. `level: true` — the taller pane
floors the shorter — is an option rather than the default: `core/Page/layout`
needs it (a phone page beside a monitor page), and a fragment demo does not, where
it would only add a tall empty band under the wide pane.

### `demo.layout()` — one sugar, two `detail.js` files deleted

`styles/layouts/detail.js` and `core/Page/layout/detail.js` were the same config
factory twice: `classes: "standard"` + `preview()` + `content(){ demo.exhibit(…) }`
+ `frame()`, differing in the card (a `zoom-25` shape vs a `twin()` of two device
screens), the stage (one vs the two-up), and `parts:`. The second file's own
readme said it *"extends the first; it does not replace it"*.

| | |
|---|---|
| keys on `demo.exhibit()` itself | `preview()` is needed **before** `content()` ever runs — a card is drawn on a dormant page, so the renderer cannot supply one |
| each page keeps its own `preview`/`frame` | three methods of boilerplate on twenty-two pages |
| **a third sugar beside `page()` and `tree()`** | ✓ |

**Verdict: `demo.layout(config)`.** The three sugars now name what the specimen
*is* — a function (`page`), a site tree (`tree`), a whole page (`layout`) — and
each is `preview()` plus a `content()` that calls the one exhibit. The deltas
became three config keys: `twin:` (the card is a phone beside a monitor, the stage
is the two-up, and the frame paints a ground), `parts:` (regions as chips in the
panel), `height:`.

⚠ **`demo.exhibit()` stays a renderer**, called from inside `content()`. Twenty-three
call sites in `styles/sections` and `ui/` follow it with their own prose, so it
cannot become a config factory without an `after:` key, which is API for nothing.

The tiers became pure config: `core/Page/layout`'s ten pages each gained one line
(`import { site } from "../web.js"`) and lost the `layout(site)` parameter, which
`detail.js` used to inject — an ext cannot import a page tier's content object, and
an explicit import is not black magic.

### `web()` → `sample()`

Two `web()`s existed: this module's `Page` **tree** and `core/Page/layout/web.js`'s
page **content**. `core/Page/layout/readme.md` recommended renaming this one to
`tree()`, "three call sites". Checked today: seven call sites, and **two of them
(`/web/nav/rail/`, `/web/nav/drill/`) call `demo.tree()` in the same file** — the
rename would have put two unrelated `tree`s a line apart.

**Verdict: `sample()`, in `sample.js`** — §12's own words for it, "the shared
sample tree". `web` stops being a demo word either way, which was the point.

### `demo.source()` takes a string

The open item recorded three times (`styles/layouts/readme.md` §Open,
`ai/2026-08-09` §Open, §16 here). One `is.fn(src)` in the one function, and
`styles/layouts/word.js`'s borrowed `.demo-source` hand-roll — a `details` +
`summary` + `code.js` built by hand because its template is a built string, not a
function — is deleted.

### Open, from this wave

- **`demo.page()` and `demo.tree()` keep their names.** 53 + 44 call sites; the
  four-door *presentation* is free, a hard rename is not.
- **`ext/demo/layout.js` sits one word from `ext/layout/`.** The panel is imported
  there as `panel` so the file reads, but the two directories still share a word.
- **The two-up still has no `wide`.** §14 gave the doctrine to `demo()` and
  `demo.stage()`; `demo.stage.two()` now takes it too, but a two-up composed
  directly through `two()` (which `demo.layout` does) owns its own track.
