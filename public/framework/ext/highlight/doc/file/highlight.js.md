The whole module in one file. Importing it does six things at once: five
grammars register on `hljs`, nine members land on `code` (`.lang`, `.fn`,
`.file`, `.ext`, `.cache`, `.js`, `.css`, `.html`, `.md`, `.json` — plus the
aliases `.javascript`, `.xml`, `.markdown`), and three `View.prototype`
methods get replaced: `append`, `html_unsafe`, `prerender`. Everything else in
this module's docs is a consequence of this one file running once, at
`import "/framework/ext/highlight/highlight.js"` in `app.js:141`.

## `context()` — the three-way guess

Block, inline, or bare `pre` — decided by reading `View.captor` before the
element is built (`highlight.js:52-64`). This is the one piece of state the
whole SHARP EDGE trap (`doc/chaining.md`) traces back to: the captor answers
"where am I being placed" only when a factory call is made *inside* a capture
function, not in argument position.

## The FILENAME label — where `file` is honoured and where it isn't

`code.lang(name, src, file)` only attaches `data-file` on the branch that
builds its **own** `<pre>` (`highlight.js:95-97`) — the plain top-level-block
case. The other two branches (`"pre"` and `"inline"`, line 90-93) never read
the third argument at all: `"inline"` because there is no room for a label on
a bare `<code>` (the source comment says so), and `"pre"` because the caller
already owns that wrapper — `code.lang()` didn't build it, so it has nowhere
to hang the attribute. The source comment only states the inline half of that
rule.

## The two hooks that make it FOUC-free

`html_unsafe` (line 219) and `prerender` (line 238) are the two doors markup
can enter a View through, and both call `highlight()` synchronously — see
`doc/hooks.md` for why a synchronous highlighter is what makes this possible
at all, and why a rAF/MutationObserver sweep was rejected.

## The `append` patch and `inline_if_block`

Guesses at build time, corrects at append time: a `<pre class="code-block">`
landing inside a phrasing parent is unwrapped to its bare `<code>`
(`highlight.js:123-136`). This is where the SHARP EDGE trap actually happens —
`arg.el.remove()` discards the `<pre>` and anything chained onto it.

## Improvements

1. **The "ignored inline" comment (line 88) doesn't mention it's also ignored
   in explicit `"pre"` context.** A reader who wires `code.lang()` inside a
   hand-built `<pre>` (the `editor.md` sketch does exactly this) and passes a
   `file` argument gets no error and no label, for a reason the comment
   doesn't state. One clause. *(simple, useful)*
2. **`highlight(root)` and `hljs` are exported from `/app.js` and have zero
   external callers** (verified: only `app.js:141`'s own re-export and this
   file's internal calls reference them). The two patches already cover every
   way markup reaches the DOM through a View. *(simple, useful — already
   recorded as a Decision in `readme.md`, recommending they drop to
   module-local; not applied here per the audit's fences.)*
3. **`code.ext(url)` is public-looking (`code.ext(...)`) but has one caller**,
   `code.file` on the next line down. Demoting it to a module-local `function
   ext(url)` removes a name from a namespace whose whole value is "every entry
   here renders something." *(simple, useful — same status as #2.)*
4. **`context()` runs a linear `tag !== "PRE" && !block_parents.has(tag)`
   check on every `append()` call site-wide**, not just ones that touch
   `code`. Correct — `View.prototype.append` is swapped globally, so it has
   to run for every append — but it's the one place this module's cost is
   paid by pages that never call `code.lang()` at all. Not worth changing;
   noted because it wasn't obvious on first read. *(simple, speculative)*
