**Usage** — the general form every accessor (`code.js`, `code.css`, …)
forwards to unchanged: `code.lang(name, src, file)`. `name` is an hljs
language id, `src` the text to colour, `file` an optional label. Dispatches
on `context()` (`highlight.js:52-64`) to decide the shape: a bare `<code>`
inside an existing `<pre>`, an inline `<code class="code-inline">` in a
phrasing parent, or its own `<pre class="code-block">` everywhere else — that
last branch is the only one that reads `file` at all.

**The banner above may render as `` an ext has patched `.lang` `` — missing
the `code.` in front.** Two independent naming gaps compound here: (1)
`code.lang = function(...){}` assigns to a member expression, and JS never
infers a name in that position, so `util/source/source.js`'s `patched(fn,
name)` (line 64) reads it as *replaced* even though nothing occupied `.lang`
before this ext added it; (2) `code` itself was built the same way —
`fns[tag] = function(){ … }` inside `View.elements()`'s `forEach`
(`core/View/View.js:417-419`) — so `code.name` is **also** `""`, and
`Doc.label()`'s `subject?.name ?? "the subject"` (`ext/Doc/Doc.js:207`)
doesn't catch it: `??` only substitutes on `null`/`undefined`, and `""` is
neither. Every method on this page inherits both gaps. Verified by direct
simulation, not by inspection alone — see this audit's report,
top Recommendation, for the repro. Not this module's bug to fix; recorded
here so the rendering doesn't read as broken *docs* when it's a broken
*banner*.

**The FILENAME label** — `code.lang("js", src, "/app.js")` draws
`/app.js` on the block's top edge via `highlight.css`'s `pre[data-file]::before`.
Two emitters produce the same attribute: this call, and a markdown fence's
info string second word (```` ```js /app.js ````, handled in
`ext/markdown/md.js`) — one stylesheet rule serves both. Only the top-level
block branch sets it; passing `file` while already inside a `<pre>`, or in a
sentence, is silently a no-op. Full reasoning: `doc/chaining.md`.

**Necessity** — yes, this is the one function every accessor and `code.fn`
route through; deleting it deletes the module.

**Simplicity** — right-sized. The three-way `context()` switch reads longer
than it is: two one-line cases and a three-line fallback, because the
fallback is the only branch that owns a `<pre>` it built itself.
