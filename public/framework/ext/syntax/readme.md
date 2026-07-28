# syntax

Syntax highlighting as a View addon. Importing the module patches
`View.prototype.syntax()` and turns on highlighting for every markdown code
fence on the site. The design record is below; the API is at the top of
`syntax.js`.

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

## `syntax()`, not `code("js", src)`

**Options.** Overload the existing `code()` factory on arity; add `highlight()`;
add `syntax()`.

**Weighing.** `code` comes from `View.elements()`, where every factory appends
*all* its arguments. `code("js", src)` already has a meaning today — append two
strings — so an arity switch would silently change what existing calls do, and
`code("hello", "world")` would start guessing at languages. Arity overloading
also reads like a puzzle at the call site: nothing about `code(a, b)` says the
first argument is a language.

`highlight()` is the more standard word, but it collides with the other meaning
of highlighting — search hits, `<mark>` — which is a thing a docs site plausibly
wants later.

**Verdict: `syntax(lang, src)`.** A new word for a new thing, unclaimed in both
the DOM and this codebase, and it rhymes with `md()` — which is the shape this
repo has already proved works for an ext: a `View.prototype` method, a capturing
factory, a `.c()` variant, and a `.file(import.meta, …)` that returns a promise.

---

## Where the markdown-fence hook goes (the FOUC question)

**Question.** Every readme on this site is full of fenced code blocks. Getting
them highlighted must not cost a frame of unstyled code.

**Options.**

1. A `requestAnimationFrame` / `MutationObserver` / "sweep the document on ready"
   pass.
2. Hook the point where generated markup enters a View, synchronously.
3. Do nothing automatic; make pages call `syntax.dom()` themselves.

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
batch pass was re-rendering already-highlighted views.** `syntax()` output is a
`<pre class="syntax"><code class="hljs language-js">`, which matches the very
selector `syntax.dom()` scans for — so every View that adopted a container
re-tokenized every highlighted block inside it. A box holding three blocks cost
three redundant `hljs.highlight()` calls *per adoption*, repeatably.

It was never *wrong* — hljs spans don't change `textContent`, so re-running
produces byte-identical markup, which is why the idempotency tests passed and
hid it. It was just waste, and it scales with the page.

The fix is one line: skip any `<code>` that already carries `.hljs`.
`View.prototype.syntax` sets that class on every path, so it's an exact "already
processed" marker for both this pass and hand-written `syntax()` calls.
Measured after: 3 → 0, with a fresh fence in the same subtree still picked up.

Worth stating as a general lesson about the two patches: **anything that adopts
an element re-scans its whole subtree.** Idempotence makes that safe, not free.

**Keep: no import coupling in either direction.** `syntax.js` does not import
`ext/markdown`; it recognizes the `language-*` class that marked happens to
emit, which is also what Prism, Shiki and every other highlighter key off. If
markdown was never imported the query matches nothing. Same soft-dependency deal
`ext/demo` already makes with `md()` — and `ext/demo` now makes the same deal
here: `demo()` uses `view.syntax` if it exists and falls back to `.text()`, so
`demo/` still imports neither ext.

---

## Our token CSS, not a vendored hljs theme

**Question.** highlight.js ships ~250 themes as plain CSS. Take one?

**Weighing.** Every official theme sets its own `.hljs { background; color }`.
This site already has two opinions about that box — `framework.css`'s
`pre, code` and `demo.css`'s `.demo-code` — and a third would be the one that
loses or wins arbitrarily by load order. hljs themes have no functional tie to
the engine; they're just class names.

**Verdict: own the ~20 declarations.** `syntax.css` colors tokens and nothing
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
- **`syntax.file()` has no page using it yet.** It exists because a docs site
  eventually wants to show a real file rather than a copy of one, and it was
  cheap next to `md.file()`. If it's still unused in six months, delete it.
