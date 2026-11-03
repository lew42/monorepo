# Block-awareness, and where the fence hook goes

## Three contexts, and two places to decide

`code.js("app.method()")` in a sentence should be a bare `<code>`; on its own it should
be a `<pre>`. The string is identical in both, so the content cannot tell you. The
**captor** can: it is the view currently collecting children, so it *is* the answer to
"where am I being placed". `View.prototype.md` already asks the same question with its
`block_tags` set, so the precedent and the tag list both existed.

| captor | result |
|---|---|
| `div`, `section`, `td`, … (block) | `<pre class="code-block"><code>` |
| `p`, `li`, `span`, `a` (phrasing) | `<code class="code-inline">` |
| `pre` | bare `<code>`, no wrapper, **no `code-inline`** |

**`pre` has to be its own case** because `.code-inline` carries `white-space: nowrap` —
needed so a snippet can't wrap mid-sentence, fatal on a multi-line block. `demo()`'s
source pane is exactly that situation, and it would have collapsed onto one line.

**Then the captor turns out to be only half the story.** Arguments are evaluated before
the factory that receives them:

```js
p(() => { code.js("x") })      // captor IS the p — works
p("Call ", code.js("x"), "!")  // captor is whatever encloses p — wrong
```

**Verdict: guess from the captor, correct at `append`.** A `<pre class="code-block">`
landing in a phrasing parent is unwrapped to its `<code>`, and the orphaned `<pre>` is
removed from wherever it captured. Block parents return before any of it runs, so the
hot path pays one `Set.has`.

**Keep: correction, not deferral.** Always building a bare `<code>` and wrapping it at
append would break `code.js(src).ac("wide")` in *block* context, since the class would
land on the inner element instead of the block. Correcting after the fact keeps
`code.lang()` returning a real, finished, chainable element in the common case.

Correction does not make the chaining problem go away — it moves it. See the SHARP EDGE
section of `readme.md`, which is the one to read before using this API.

## Where the markdown-fence hook goes (the FOUC question)

Every readme on this site is full of fenced code blocks, and getting them highlighted
must not cost a frame of unstyled code.

1. A `requestAnimationFrame` / `MutationObserver` / sweep-on-ready pass.
2. Hook the point where generated markup enters a View, synchronously.
3. Do nothing automatic; make pages call `highlight()` themselves.

**Option 1 is the obvious one and it is exactly wrong.** All three variants run in a
**later task** than the DOM write, and the browser is free to paint in between — so each
flashes plain code for one frame, every time. That cannot be tuned away.

**Option 2 works only because `hljs.highlight()` is synchronous** and the language
modules are static imports. The fence pass runs inside the *same synchronous turn* as
the `innerHTML` assignment, and a script setting innerHTML cannot be interrupted by a
paint before it returns. Attached or detached, there is no frame in which
un-highlighted code exists.

Option 3 is honest, but every page and readme opting in by hand means half of them
don't.

**Verdict: option 2, at two doors.**

- **`View.prototype.html_unsafe`** — the choke point for `View.prototype.md`,
  `md.file()`, and multi-block `md()`.
- **`View.prototype.prerender`** — for markup that never passed through `html_unsafe`
  at all.

The second door was found by a **test, not by reading**, and that is the interesting
part. `md()` has two exits: multiple blocks get `.html_unsafe(html)`, but a **single**
root block is adopted straight off the parse template. So `md("```js…```")` hands back a
fully-built `<pre>` that View never wrote a byte of. Hooking one door and reasoning
carefully about it was not enough; hooking both and testing was.

`prerender()` is where "a View now exists" is true for every construction path, and the
guard is exact and free: `this.el` is truthy on entry **only** when the caller supplied
an element, because `prerender` is what creates it otherwise. So `div()`/`p()`/`el()` —
thousands of calls — test one falsy property and skip. Only adoption pays for a
`querySelectorAll`.

### The pass must skip what it already did

Found by asking the obvious follow-up and then measuring it: **yes, the batch pass was
re-rendering already-highlighted views.** `code.js()` output matches the very selector
`highlight()` scans for, so every View that adopted a container re-tokenized every
highlighted block inside it — a box holding three blocks cost three redundant
`hljs.highlight()` calls *per adoption*, repeatably.

It was never *wrong*: hljs spans don't change `textContent`, so re-running produces
byte-identical markup, which is why the idempotency tests passed and hid it. It was
waste, and it scaled with the page. The fix is one line — skip any `<code>` already
carrying `.hljs`, which `render()` sets on every path. Measured after: 3 → 0, with a
fresh fence in the same subtree still picked up.

**The general lesson: anything that adopts an element re-scans its whole subtree.
Idempotence makes that safe, not free.**

## Keep: no import coupling in either direction

`highlight.js` does not import `ext/markdown`; it recognises the `language-*` class that
marked happens to emit, which is also what Prism, Shiki and every other highlighter keys
off. If markdown was never imported the query matches nothing. `ext/demo` makes the same
soft deal here — `demo()` uses `code.js` if it exists and falls back to plain `code()` —
so `demo/` imports neither ext.
