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

Right-click clears a dragged width. A reset button in the toolbar would be a control
whose only job is undoing another control, and there is no other way back to
"whatever fits".

---

## 8. Open

- **No way to show a demo that must not run.** `code.fn()` covers it, on the other
  ext, which is the right split — but nothing on the demo page says so loudly.
- **The pane re-reads on show, not live.** Toggle it off and on after clicking inside
  a demo and you see the new DOM. A genuinely live pane needs a `MutationObserver`
  and has no asker yet.
- **No width presets.** "Mega / desktop / mobile" was asked for and is not here: a
  preset labelled `1920` is a promise about media queries that a div cannot keep
  (§6). Zoom percentages promise nothing they don't deliver. Presets land with the
  iframe or not at all.
- **`--demo-pad: 2rem` is a lot of a 262px box.** At 390px the frame is a quarter of
  the demo's width. Pre-existing, but the stage makes it more visible.
