# highlight

Syntax highlighting bolted onto core's `code` element factory. Importing the
module adds `code.js` / `code.fn` / `code.html` / `code.css` / `code.md` /
`code.json` / `code.lang` / `code.file` to the existing `code()`, and turns on
highlighting for every markdown code fence on the site. The design record is
below; the API is at the top of `highlight.js`.

The editor that this was really built for is not written yet — its MVP spec is
in `editor.md`.

---

## Which highlighter?

**Options.** Shiki, Prism, highlight.js, speed-highlight, sugar-high.

**Weighing.** `ext/` says vendor it, no CDN at runtime, and the repo says no
bundler. That constraint decides this almost by itself — the question is not
"which highlighter is best" but "which one survives being copied into a
directory by hand."

| | ships ESM | vendor cost | sync |
|---|---|---|---|
| Shiki | yes, ESM-only | ✗ deep graph: `@shikijs/core`, `oniguruma-to-es`, `regex`, grammars, wasm-or-JS engine | no |
| Prism v1.30 | ✗ global-based | — | yes |
| highlight.js | yes, `es/` | **one file per language, zero imports** | **yes** |
| speed-highlight | ESM-native | small, langs auto-lazy | no |
| sugar-high | yes | one 36 kB file | yes |

Shiki produces the best output by a distance — real TextMate grammars, VS Code
themes. It is also the one that cannot be vendored without a bundler, so it
loses to a rule we're not willing to break. Prism v1 is still global-based
(v2, the ESM rewrite, remains unreleased); the `prism-esm`/`refractor` forks
exist but add a fork to trust. sugar-high is genuinely tempting at ~1 kB, but
it's JS/JSX-first and this site documents CSS and HTML too.

**Verdict: highlight.js 11.11.1**, the `@highlightjs/cdn-assets` `es/` build.
Each vendored file is standalone ESM — checked: zero `import` statements, no
wasm, no `sourceMappingURL` to 404 — so adding a language is one file plus one
`registerLanguage` line. It is also **synchronous**, which is worth more here
than it looks: see the FOUC entry below, and `editor.md`.

Cost is ~20 kB core + 0.5–13 kB per language, unminified-but-minified, served
as static assets like everything else.

**Keep: five languages, not fifty.** js, css, xml, markdown, json. Their built-in
aliases cover `js`/`jsx`/`mjs`/`cjs`, `html`/`svg`/`xhtml`, `md`. An
unregistered language is not an error (below), so the cost of being wrong is a
gray code block, and the cost of being greedy is real bytes on every page load.

---

## `code.js(src)`, not `syntax("js", src)` and not `code("js", src)`

**Options.** Overload the existing `code()` factory on arity; add a new
top-level `syntax()`; hang the languages off `code` as a namespace.

**Weighing.** Arity overloading is out first. `code` comes from
`View.elements()`, where every factory appends *all* its arguments, so
`code("js", src)` already means "append two strings" — an arity switch would
silently change what existing calls do, and `code("hello", "world")` would start
guessing at languages. It also reads like a puzzle: nothing about `code(a, b)`
says the first argument is a language.

That left `syntax(lang, src)`, which shipped first and was replaced almost
immediately. The objection is simple once stated: a separate top-level function
gives the site two unrelated words for "a bit of code on the page" — `code()`
when you want the element, `syntax()` when you want it colored — with nothing a
reader could use to infer which is which. `syntax()` also had no answer for
`code.fn()`, because the natural name for it (`syntax.fn`) says nothing about
code.

**Verdict: a namespace on `code`.** `code()` and `code.c()` stay exactly what
they were; `code.js(src)`, `code.html(src)`, `code.lang(name, src)` and friends
are added by the ext. One word for code, one import to make it colored, and the
elemental behaviour is untouched if the ext is never loaded.

`code.fn(() => { … })` is the accessor that justifies the whole rework — see
below.

**Keep: the accessors are an explicit map, not generated from
`hljs.listLanguages()`.** Generating would mint `code.wsf`, `code.xjb`,
`code.mkd` and a dozen aliases nobody types — and, the real hazard, **hljs ships
a language called `c`**, which would silently overwrite `code.c()`, the classes
variant every page in the repo already uses. The loop that installs accessors
skips any name already present and warns, but the explicit map is what makes
that a belt-and-braces check rather than the only defence.

---

## `code.fn(fn)` — a function, not a string

**Question.** How should a code example be written in a `.js` file?

**Weighing.** A string is dead text in the editor: no highlighting, no
completion, no formatting, no rename-refactor, and — the one that actually bites
— no syntax errors. Every example in the repo written as a template literal is
unverified text that merely looks like code.

A function body is live code. The IDE checks it, formats it, and renames through
it, and `fn.toString()` gives back exactly what the IDE was checking. The limit
is that it must *parse* as JavaScript, so pseudo-code, ASCII diagrams and other
languages still need strings.

**Verdict: `code.fn(fn)`, which stringifies and never calls.** That last part is
the distinction from `demo(fn)`, which stringifies *and* runs. The two now sit
either side of one line: `demo()` for something that should execute, `code.fn()`
for something that should only be read.

`source()`/`dedent()` moved to `util/source/` so both callers share one
implementation. Two copies of "where does a function body start, and how far do
we dedent" would eventually print the same function two different ways on the
same page — which is exactly the drift the show-real-source idea exists to
prevent. (It also turned up a real bug: `fn.toString()` returns whatever line
endings the file was checked out with, so on Windows `source()` gave `\r\n`
while the same text through `innerHTML` came back `\n` — the DOM normalises,
the string doesn't. `dedent()` normalises now.)

---

## Block-aware: three contexts, and two places to decide

**Question.** `code.js("app.method()")` in a sentence should be a bare `<code>`;
on its own it should be a `<pre>`. The string is identical in both. Where does
the answer come from?

**Weighing.** Not the content — it cannot tell you. The **captor** can: it is
the view currently collecting children, so it *is* the answer to "where am I
being placed". `View.prototype.md` already asks the same question with its
`block_tags` set, so the precedent and the tag list both existed.

Three cases, not two, and the third is load-bearing:

| captor | result |
|---|---|
| `div`, `section`, `td`, … (block) | `<pre class="code-block"><code>` |
| `p`, `li`, `span`, `a` (phrasing) | `<code class="code-inline">` |
| `pre` | bare `<code>`, no wrapper, **no `code-inline`** |

`pre` has to be its own case because `.code-inline` carries `white-space:
nowrap` — needed so a snippet can't wrap mid-sentence, fatal if applied to a
multi-line block. `demo()`'s source pane is exactly that situation, and it would
have collapsed onto one line.

**Then the captor turns out to be only half the story.** Arguments are evaluated
before the factory that receives them is ever called:

```js
p(() => { code.js("x") })      // captor IS the p — works
p("Call ", code.js("x"), "!")  // captor is whatever encloses p — wrong
```

In the second form `code.js()` runs while the captor is still the
*grandparent*, usually a div, so it guesses "block" and builds a `<pre>` that is
about to be dropped into a sentence. Found by test, not by reading.

**Verdict: guess from the captor, correct at `append`.** A
`<pre class="code-block">` landing in a phrasing parent is unwrapped to its
`<code>` (and the orphaned `<pre>` removed from wherever it captured). Block
parents return before any of it runs, so the hot path pays one `Set.has`.

**Keep: correction, not deferral.** The alternative — always build a bare
`<code>` and wrap it at append — would break `code.js(src).ac("wide")` in block
context, since the class would land on the inner element instead of the block.
Correcting after the fact keeps `code.lang()` returning a real, finished,
chainable element in the common case.

Correction does not make the chaining problem go away, though. It moves it —
see the next entry, which is the one to read before using this API.

---

## SHARP EDGE: chaining onto argument-position inline code

**Anything chained onto `code.js()` in argument position, inside a phrasing
parent, is silently discarded.** Not just classes:

```js
div(() => {
    p("Call ", code.js("x").ac("wide"), " first.");
    //                     ^^^^^^^^^^^ gone
});
```

Measured, all three:

| chained | survives? |
|---|---|
| `.ac("wide")` | ✗ dropped |
| `.attr("title", "hi")` | ✗ dropped |
| `.on("click", …)` | ✗ dropped — **a dead handler, not a cosmetic bug** |

**Why.** The chain runs *before* `append` ever sees the value. `code.js()`
guessed block, returned the `<pre>`, and `.ac()/.attr()/.on()` all applied to
that `<pre>`. By the time the correction fires, all we have is a finished
element we are about to throw away. The chained intent is already baked into the
wrong node.

The handler case is the worst of the three because it fails silently *and*
functionally: a click that never fires, with nothing in the console.

**Options.**

1. **Copy everything from the `<pre>` onto the `<code>`.** Dead on arrival:
   `View.on()` calls `addEventListener` with an anonymous wrapper and keeps no
   registry, so listeners cannot be enumerated, let alone moved. There is no
   web API for it outside devtools. Classes and attributes *could* be copied —
   but that half-fix is arguably worse than the bug, because block-intent
   classes (widths, margins, `display`) would silently land on an inline
   `<code>` and misbehave in a way that looks like a CSS problem.
2. **Warn when discarding a `<pre>` that carries anything beyond
   `code-block`.** Doesn't fix it, but converts a silent failure into a visible
   one. Cheap, and the honest minimum if this ever bites someone.
3. **Make `code.lang()` return a proxy** that records the chain and replays it
   onto whichever element wins. Real fix, real complexity, and it makes a
   simple factory into a deferred-effects machine. Not worth it for a case with
   two easy workarounds.
4. **Document it and give the workaround.**

**Verdict: option 4 for now, with option 2 as the obvious next move if anyone
actually hits it.**

**The workaround — put the class on the paragraph:**

```js
p.c("wide", "Call ", code.js("x"), " first.");   // class where it belongs
```

Which is usually what you meant anyway: a class describing *this sentence*
belongs on the sentence, not on two words inside it.

**Or use the capture form, which is correct by construction:**

```js
p(() => { code.js("x").ac("wide"); });   // captor IS the p — nothing is discarded
```

In the capture form the captor is already the `p`, so `code.js()` builds the
inline `<code>` directly and the chain lands on the element that survives.
Verified: `.ac()` on that path works.

**The rule of thumb:** argument position is for *plain* `code.js(src)`. The
moment you want to chain, use `p.c()` or the capture form.

---

## No `View.prototype` method

`.md()` earns one because prose gets *set into* an existing view constantly —
`p().md("…")` is the common case. Code isn't like that: you are always making a
new element, which is what a factory is for. The first version shipped
`View.prototype.syntax()` anyway, by analogy rather than by need, and nothing
ever called it except the module's own internals. Deleted; `render(view, …)` is
a module-local function now.

---

## Where the markdown-fence hook goes (the FOUC question)

**Question.** Every readme on this site is full of fenced code blocks. Getting
them highlighted must not cost a frame of unstyled code.

**Options.**

1. A `requestAnimationFrame` / `MutationObserver` / "sweep the document on ready"
   pass.
2. Hook the point where generated markup enters a View, synchronously.
3. Do nothing automatic; make pages call `highlight()` themselves.

**Weighing.** Option 1 is the obvious one and it is exactly wrong. All three
variants run in a **later task** than the DOM write, and the browser is free to
paint in between — so each one flashes plain code for one frame, every time.
That is the failure mode we were explicitly trying to avoid, and it can't be
tuned away.

Option 2 works only because `hljs.highlight()` is synchronous and the language
modules are static imports. The fence pass therefore runs inside the *same
synchronous turn* as the `innerHTML` assignment, and a script setting innerHTML
cannot be interrupted by a paint before it returns. Attached or detached, there
is no frame in which un-highlighted code exists. (This is the second place the
sync/async choice pays off, and the reason speed-highlight — otherwise a lovely
fit for a no-build repo — would have needed a sequence guard instead.)

Option 3 is honest but means every page and every readme opts in by hand, which
in practice means half of them don't.

**Verdict: option 2, at two doors.**

- `View.prototype.html_unsafe` — the choke point for `View.prototype.md`,
  `md.file()`, and multi-block `md()`.
- `View.prototype.prerender` — for markup that never passed through `html_unsafe`
  at all.

The second door was found by a test, not by reading the code, and it's the
interesting part. `md()` has two exits: multiple blocks get `.html_unsafe(html)`,
but a **single** root block is adopted straight off the parse template
(`new View({ el: template.content.firstElementChild })`). So `md("```js…```")`
hands back a fully-built `<pre>` that View never wrote a byte of, and the
`html_unsafe` patch never sees it. Hooking one door and reasoning carefully
about it was not enough; hooking both and testing was.

`prerender()` is where "a View now exists" is true for every construction path,
and the guard is exact and free: `this.el` is truthy on entry **only** when the
caller supplied an element, because `prerender` is what creates it otherwise. So
`div()`/`p()`/`el()` — thousands of calls — test one falsy property and skip.
Only adoption pays for a `querySelectorAll`.

### The pass must skip what it already did

Found by asking the obvious follow-up question and then measuring it: **yes, the
batch pass was re-rendering already-highlighted views.** `code.js()` output is a
`<pre class="syntax"><code class="hljs language-js">`, which matches the very
selector `highlight()` scans for — so every View that adopted a container
re-tokenized every highlighted block inside it. A box holding three blocks cost
three redundant `hljs.highlight()` calls *per adoption*, repeatably.

It was never *wrong* — hljs spans don't change `textContent`, so re-running
produces byte-identical markup, which is why the idempotency tests passed and
hid it. It was just waste, and it scales with the page.

The fix is one line: skip any `<code>` that already carries `.hljs`.
`render()` sets that class on every path, so it's an exact "already
processed" marker for both this pass and hand-written `code.js()` calls.
Measured after: 3 → 0, with a fresh fence in the same subtree still picked up.

Worth stating as a general lesson about the two patches: **anything that adopts
an element re-scans its whole subtree.** Idempotence makes that safe, not free.

**Keep: no import coupling in either direction.** `highlight.js` does not import
`ext/markdown`; it recognizes the `language-*` class that marked happens to
emit, which is also what Prism, Shiki and every other highlighter key off. If
markdown was never imported the query matches nothing. Same soft-dependency deal
`ext/demo` already makes with `md()` — and `ext/demo` now makes the same deal
here: `demo()` uses `code.js` if it exists and falls back to plain `code()`, so
`demo/` still imports neither ext.

---

## Our token CSS, not a vendored hljs theme

**Question.** highlight.js ships ~250 themes as plain CSS. Take one?

**Weighing.** Every official theme sets its own `.hljs { background; color }`.
This site already has two opinions about that box — `framework.css`'s
`pre, code` and `demo.css`'s `.demo-code` — and a third would be the one that
loses or wins arbitrarily by load order. hljs themes have no functional tie to
the engine; they're just class names.

**Verdict: own the ~20 declarations.** `highlight.css` colors tokens and nothing
else — no background, no font — grouped by *meaning* rather than by grammar, so
one decision covers js + css + html + md + json at once. Colors are custom
properties (`--syn-keyword`, …) so a page or a body theme class can restyle
without touching selectors. The palette follows GitHub Light because the site's
code blocks are light and the association is already in everyone's head.

Gotcha recorded because it cost a round: `.hljs-tag` wraps the **whole** element
(`<div class="a">`) while `.hljs-name`/`.hljs-attr`/`.hljs-string` re-color the
parts inside it. Coloring `.hljs-tag` green tints the punctuation and leaves
nothing to distinguish the tag name; it has to be the muted color, with
`.hljs-name` carrying the tag color.

---

## Unregistered languages degrade, they don't throw

A `bash` fence in a readme, with no bash grammar loaded, renders as
correctly-escaped plain text via `.text()` — not an exception, not a console
warning per block, and above all not unescaped markup. Same for
`ignoreIllegals: true` on every call: a doc snippet is usually a fragment, not a
valid program, and without it `highlight()` throws on the first construct the
grammar can't place. An example that ends mid-expression should look slightly
worse, not take the page down.

---

## Open

- **Dark theme.** The palette is light-only. `--syn-*` are custom props, so a
  `body.theme-dark` block is the whole job — but nobody has designed the dark
  skin yet, so there's nothing to match.
- **More languages.** `bash` and `diff` are the two that would actually get used
  in these readmes. One file each; deliberately not done until wanted.
- **Auto-detection.** `hljs.highlightAuto()` exists and is one line away. Not
  wired: it's slower, it's wrong often enough to be annoying, and every fence on
  this site can just say what it is.
- **Line numbers / line highlighting.** Not built. Note for whoever wants them:
  a gutter breaks the editor's overlay alignment (`editor.md`), so if both are
  wanted they have to be designed together.
- **`code.file()` is used once, on this ext's own page.** It exists because a docs site
  eventually wants to show a real file rather than a copy of one, and it was
  cheap next to `md.file()`. If it's still unused in six months, delete it.
