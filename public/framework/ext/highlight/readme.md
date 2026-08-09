# highlight — design record

Syntax highlighting bolted onto core's `code` element factory. Importing the module
adds `code.js` / `code.fn` / `code.html` / `code.css` / `code.md` / `code.json` /
`code.lang` / `code.file` to the existing `code()`, and turns on highlighting for
every markdown code fence on the site. The API is at the top of `highlight.js`.

Long form: `./doc/choice.md` (which highlighter, and why five languages),
`./doc/hooks.md` (block-awareness, the two hook points, and the FOUC question). The
editor this was really built for is not written yet — MVP spec in `editor.md`.

## Decisions

**Which highlighter?** **highlight.js 11.11.1**, the `es/` build. Shiki produces the
best output by a distance and cannot be vendored without a bundler, so it loses to a
rule we're not willing to break. Each vendored file here is standalone ESM — zero
imports, no wasm — so adding a language is one file plus one `registerLanguage` line.
It is also **synchronous**, which is worth more than it looks. `./doc/choice.md`.

**`code.js(src)`, not `syntax("js", src)` and not `code("js", src)`.** Arity
overloading is out first: `code` comes from `View.elements()`, where every factory
appends *all* its arguments, so `code("js", src)` already means "append two strings".
A separate top-level `syntax()` gives the site two unrelated words for *"a bit of code
on the page"* with nothing a reader could use to tell them apart — and no answer for
`code.fn()`, since `syntax.fn` says nothing about code. **A namespace on `code`:** the
elemental behaviour is untouched if the ext is never loaded.

**`code.fn(fn)` — a function, not a string.** A string is dead text in the editor: no
highlighting, no completion, no formatting, no rename-refactor, and — the one that
bites — **no syntax errors**. A function body is live code the IDE checks, and
`fn.toString()` gives back exactly what it checked. It stringifies and **never calls**,
which is the whole distinction from `demo(fn)`. The limit: it must *parse* as
JavaScript, so pseudo-code and ASCII diagrams still need strings.

**Own the token CSS; don't vendor an hljs theme.** Every official theme sets its own
`.hljs { background; color }`, and this site already has two opinions about that box —
`framework.css`'s `pre, code` and `demo.css`'s `.demo-code`. A third would win or lose
by load order. hljs themes have no functional tie to the engine, so `highlight.css`
colours tokens and nothing else, grouped by *meaning* rather than grammar.

**No `View.prototype` method.** `.md()` earns one because prose gets *set into* an
existing view constantly; code doesn't — you are always making a new element, which is
what a factory is for. `View.prototype.syntax()` shipped by analogy and nothing ever
called it.

## SHARP EDGE: chaining onto argument-position inline code

**Anything chained onto `code.js()` in argument position, inside a phrasing parent, is
silently discarded.** Not just classes:

```js
p("Call ", code.js("x").ac("wide"), " first.");
//                     ^^^^^^^^^^^ gone
```

| chained | survives? |
|---|---|
| `.ac("wide")` | ✗ dropped |
| `.attr("title", "hi")` | ✗ dropped |
| `.on("click", …)` | ✗ dropped — **a dead handler, not a cosmetic bug** |

**Why.** Arguments are evaluated before the factory that receives them, so `code.js()`
runs while the captor is still the *grandparent* — it guesses "block", returns a
`<pre>`, and the chain applies to that `<pre>`. By the time `append` corrects the
guess, all it has is a finished element it is about to throw away.

**Two workarounds, and the first is usually what you meant:**

```js
p.c("wide", "Call ", code.js("x"), " first.");   // class on the sentence
p(() => code.js("x").ac("wide"));               // capture form — correct by construction
```

**Verdict: document it.** Copying the chain across is dead on arrival — `View.on()`
keeps no listener registry, and there is no web API to enumerate listeners outside
devtools. Copying only classes and attributes is arguably worse than the bug, because
block-intent classes would land on an inline `<code>` and misbehave like a CSS problem.
The obvious next move if anyone actually hits this is to **warn** when discarding a
`<pre>` that carries anything beyond `code-block`.

**The rule of thumb: argument position is for *plain* `code.js(src)`.** The moment you
want to chain, use `p.c()` or the capture form.

## Traps

- **⚠ The accessor map is explicit, never generated from `hljs.listLanguages()`** —
  hljs ships a language called **`c`**, which would silently overwrite `code.c()`, the
  classes variant every page uses.
- **⚠ Anything that adopts an element re-scans its whole subtree.** Idempotence makes
  that safe, not free: a container holding three highlighted blocks paid three
  redundant `hljs.highlight()` calls *per adoption*. The `.hljs` skip is the fix, and
  `render()` sets that class on every path.
- **⚠ Unregistered languages degrade, they don't throw.** A `bash` fence with no bash
  grammar renders as correctly-escaped plain text — not an exception, not a warning per
  block, and above all not unescaped markup. Same for `ignoreIllegals: true`: a doc
  snippet is usually a fragment, and an example ending mid-expression should look
  slightly worse, not take the page down.
- **⚠ `fn.toString()` returns the file's line endings.** On Windows `source()` gave
  `\r\n` while the same text through `innerHTML` came back `\n` — the DOM normalises,
  the string doesn't. `dedent()` normalises now; `source()`/`dedent()` live in
  `util/source/` so both callers share one implementation.

## Proposed

Findings from the every-member audit. **Not applied.**

**`highlight(root)` is exported from `/app.js` and imported by nobody.** The
function is essential — both patches call it — but the *export* has zero
consumers, and so does `hljs` beside it (`public/app.js:113`). They are there so
a page could re-scan a subtree it built by hand.
*Options:* (a) keep both; (b) keep `highlight`, drop `hljs`; (c) drop both from
`app.js` and leave them on `highlight.js`.
*Weighing:* the two patches (`html_unsafe`, `prerender`) already cover every way
markup reaches the DOM through a View, which is every way markup reaches the DOM
on this site. A manual re-scan is the escape hatch for a case that has not
happened. `hljs` on the site's API surface is worse than unused — it invites a
page to call the vendored engine directly and bypass the `.hljs` idempotence
guard that keeps adoption from re-highlighting N blocks per adoption.
**Recommendation: (c).** Both stay exported from `highlight.js`, where a caller
who needs them can reach them explicitly.

**`code.ext(url)` is public-looking and internal.** One caller,
`code.file()` (`highlight.js:166`). Three special cases (`htm`, `mjs`, `cjs`)
and otherwise the bare extension. It reads as API because it hangs off `code`
alongside `code.js` and `code.file`.
*Options:* (a) keep as-is; (b) make it a module-local `function ext(url)`.
**Recommendation: (b)** — one caller, and taking it off `code` removes a name
from a namespace whose whole value is that every entry on it renders something.
The same argument does *not* apply to `code.cache`, which is worth being able to
clear from a console.

## Open

- **More languages.** `bash` and `diff` are the two that would get used in these
  readmes. One file each; deliberately not done until wanted.
- **Auto-detection.** `hljs.highlightAuto()` is one line away. Not wired: slower, wrong
  often enough to be annoying, and every fence on this site can say what it is.
- **Line numbers / line highlighting.** Not built. A gutter breaks the editor's overlay
  alignment (`editor.md`), so if both are wanted they have to be designed together.
- **`code.file()` is used once**, on this ext's own page. It exists because a docs site
  eventually wants to show a real file rather than a copy of one, and it was cheap next
  to `md.file()`. If it is still unused in six months, delete it.
