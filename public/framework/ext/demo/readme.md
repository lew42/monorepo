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

### Closed by default

The answer to "what does this render" **is the render**; the markup is the follow-up
question. So it costs one summary line until asked for, and a `<details>` gives that
for free with no JS and correct keyboard behaviour.

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

## 6. Open

- **No way to show a demo that must not run.** `code.fn()` covers it, on the other
  ext, which is the right split — but nothing on the demo page says so loudly.
- **The pane re-reads on every open, not live.** Close and reopen it after clicking
  a demo and you see the new DOM — which is a nice accident of the `toggle` handler
  rather than a designed feature. A genuinely live pane needs a `MutationObserver`
  and has no asker yet.
