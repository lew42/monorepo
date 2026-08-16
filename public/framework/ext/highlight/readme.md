# highlight — design record

Syntax highlighting bolted onto core's `code` element factory. Importing the
module adds `code.js` / `code.fn` / `code.html` / `code.css` / `code.md` /
`code.json` / `code.lang` / `code.file` / `code.ext` to the existing `code()`,
turns on highlighting for every markdown code fence on the site, and — as of
today — lets any of those calls carry a trailing FILENAME that draws a label
on the block. The API is at the top of `highlight.js`.

Long form: `./doc/choice.md` (which highlighter, and why five languages),
`./doc/hooks.md` (block-awareness, the two hook points, and the FOUC
question), `./doc/chaining.md` (the one sharp edge, and every workaround).
The editor this was really built for is not written yet — MVP spec in
`editor.md`.

## The FILENAME label

`code.js(src, "/app.js")` — or the general form, `code.lang(name, src,
file)` — draws `/app.js` on the block's top edge via a `data-file` attribute
and one `highlight.css` rule. A markdown fence's info string carries the same
thing as its **second** word (```` ```js /app.js ````), emitted by
`ext/markdown` — see its own
[`file-labels`](/framework/ext/markdown/docs/file-labels/) note for that
half — so a bare `pre[data-file]` from a fence is styled too, not just
`code.lang()`'s own output. One attribute, two emitters, one rule. Only the
branch that builds its own `<pre>` reads the argument at all; a block already
inside a hand-built `<pre>`, or inline in a sentence, silently ignores it.
Demoed on `page.js`; the full story, including how it interacts with the
chaining sharp edge, is `doc/chaining.md`.

## Decisions

**Which highlighter?** **highlight.js 11.11.1**, the `es/` build. Shiki
produces the best output by a distance and cannot be vendored without a
bundler, so it loses to a rule we're not willing to break. Each vendored file
here is standalone ESM — verified zero imports, no wasm — so adding a
language is one file plus one `registerLanguage` line. It is also
**synchronous**, which is worth more than it looks. `./doc/choice.md`.

**`code.js(src)`, not `syntax("js", src)` and not `code("js", src)`.** Arity
overloading is out first: `code` comes from `View.elements()`, where every
factory appends *all* its arguments, so `code("js", src)` already means
"append two strings". A separate top-level `syntax()` gives the site two
unrelated words for *"a bit of code on the page"* with nothing a reader could
use to tell them apart. **A namespace on `code`:** the elemental behaviour is
untouched if the ext is never loaded.

**`code.fn(fn)` — a function, not a string.** A string is dead text in the
editor: no highlighting, no completion, no formatting, no rename-refactor,
and — the one that bites — **no syntax errors**. A function body is live
code the IDE checks, and `fn.toString()` gives back exactly what it checked.
It stringifies and **never calls**, which is the whole distinction from
`demo(fn)`. The limit: it must *parse* as JavaScript, so pseudo-code and
ASCII diagrams still need strings.

**Own the token CSS; don't vendor an hljs theme.** Every official theme sets
its own `.hljs { background; color }`, and this site already has two
opinions about that box — `framework.css`'s `pre, code` and `demo.css`'s
`.demo-code`. A third would win or lose by load order. `highlight.css`
colours tokens and nothing else, grouped by *meaning* rather than grammar.

**No `View.prototype` method.** `.md()` earns one because prose gets *set
into* an existing view constantly; code doesn't — you are always making a new
element, which is what a factory is for.

**`subject: code`, not a class, not nothing.** `page.js` documents `code`
itself — the shared element factory from `core/View`, not something this
module owns — because after this file runs, `code.lang`, `code.fn`,
`code.file`, `code.ext` and `code.cache` genuinely are its own properties,
and `Doc`'s API tab is the only mechanism on this site that shows a member's
*real, running* source. The cost is real and worth naming rather than hiding:
`code` was itself built with `fns[tag] = function(){ … }`
(`core/View/View.js:417`), a member-expression assignment JS never infers a
name for — so `code.name` is `""`. Every method this page lists is *also*
assigned that way (`code.lang = function(...){}`), which trips
`util/source/source.js`'s `patched()` heuristic into calling a brand-new
addition a "replacement," and `Doc.label()`'s `?? "the subject"` fallback
doesn't catch an empty string. The visible result: the API tab's banner
renders as `` an ext has patched `.lang` `` — missing the `code.` in front.
Verified by direct simulation; full repro in
`public/framework/audit/modules/ext-highlight.md`. The alternative —
`properties:` instead of `methods:` — hides the bug but also hides the real
source, which is the one thing worth more than a clean banner. **Verdict:
keep `methods:`, keep the real source, flag the banner where it happens**
(`doc/method/lang.md`); the fix belongs to `ext/doc`/`core/View`, not here.

## Traps

- **⚠ The accessor map is explicit, never generated from `hljs.listLanguages()`** —
  hljs ships a language called **`c`**, which would silently overwrite
  `code.c()`, the classes variant every page uses.
- **⚠ Anything that adopts an element re-scans its whole subtree.** Idempotence
  makes that safe, not free: a container holding three highlighted blocks
  paid three redundant `hljs.highlight()` calls *per adoption*. The `.hljs`
  skip is the fix, and `render()` sets that class on every path.
- **⚠ Unregistered languages degrade, they don't throw.** A `bash` fence with
  no bash grammar renders as correctly-escaped plain text — not an
  exception, not a warning, and above all not unescaped markup.
- **⚠ `fn.toString()` returns the file's line endings.** On Windows `source()`
  gave `\r\n` while the same text through `innerHTML` came back `\n` —
  `dedent()` normalises now; `source()`/`dedent()` live in `util/source/` so
  both callers share one implementation.

## Who uses this

Opted in **once**, in `app.js:141` — every page gets `code.js` /
`code.fn` / … for free from then on. Two shapes of caller:

**Explicit `code.*()` calls** — over sixty `page.js`/module files across the
framework write real snippets this way; it is close to the default way a doc
page shows code at all. A representative sample:

| file | uses it for |
|---|---|
| [`core/App/page.js`](/framework/core/App/) | `code.js()` for its constructor and lifecycle examples |
| [`ext/doc/page.js`](/framework/ext/doc/) | documents the doc system with the doc system |
| [`ext/markdown/page.js`](/framework/ext/markdown/) | demos the fence-side of today's FILENAME label — the peer of `code.lang()`'s own |
| [`styles/elements/code/page.js`](/framework/styles/elements/code/) | the box `code()` renders into, and says highlighting is an ext |
| [`ui/kbd/page.js`](/framework/ui/kbd/) | a small component page's usage examples |

**Two soft dependencies** — `demo()` and `files()` each check `code.js`/
`code.file` and fall back to plain `code()`/a raw `fetch` if this ext isn't
loaded, so neither imports it: `ext/demo/demo.js` (source panes) and
`ext/files/files.js:64` (`file_pane()`). This is the pattern every ext here
follows — lean on another ext without an import, so nothing breaks if it's
missing.

**Implicit callers** — every fenced code block in every `readme.md` and
`doc/*.md` on the site, because `View.prototype.html_unsafe` and
`View.prototype.prerender` scan for `language-*` classes unconditionally once
this module is loaded. There is no list to keep in sync; it is every fence,
everywhere, including the ones in this readme.

## Open

- **More languages.** `bash` and `diff` are the two that would get used in
  these readmes. One file each; deliberately not done until wanted.
- **Auto-detection.** `hljs.highlightAuto()` is one line away. Not wired:
  slower, wrong often enough to be annoying, and every fence on this site can
  say what it is.
- **Line numbers / line highlighting.** Not built. A gutter breaks the
  editor's overlay alignment (`editor.md`), so if both are wanted they have
  to be designed together.
- **`code.file()` has one caller** — this ext's own page. Cheap to have built
  next to `md.file()`; if it's still the only one in six months, that's a
  real signal, not a coincidence.
- **`highlight(root)` and `hljs` are exported from `/app.js` but have zero
  external callers** (verified) — the two synchronous hooks already cover
  every way markup reaches the DOM through a View. Recorded as a finding, not
  applied: dropping the export is a one-line change whenever someone's
  touching this file anyway.
- **`code.ext(url)` is public-looking and internal** — one caller,
  `code.file()`. Demoting it to a module-local function removes a name from
  a namespace whose whole value is "every entry here renders something."
