# highlight — syntax highlighting on the `code` factory, for every page that shows code

## Use
```js
import "/framework/ext/highlight/highlight.js";     // once — this site does it in app.js

code.js(`const sum = (a, b) => a + b;`);            // a <pre> on its own, a bare <code> inside a sentence
code.js(src, "/app.js");                            // trailing FILENAME draws a label on the block
code.fn(() => { document.title = "hi"; });          // a function, not a string — stringified, never called
```
`code.html` / `code.css` / `code.md` / `code.json` work the same; `code.lang(name, src, file)` is the general
form and `code.file(import.meta, url)` fetches a file (a promise). Every markdown fence on the site is
highlighted too, and a fence's second info word (```` ```js /app.js ````) is the same FILENAME label.

## Watch out
- Chaining onto `code.js()` in argument position inside a sentence is silently discarded — classes, attrs, `.on()` handlers; use `p.c(…)` or the capture form: [doc/chaining.md](./doc/chaining.md)
- Only a block that builds its own `<pre>` reads the FILENAME arg; inline, or inside a hand-built `<pre>`, it is ignored: [doc/chaining.md](./doc/chaining.md)
- Unregistered languages (`bash`, `diff`) render as escaped plain text — no error, no warning; a grammar is one vendored file: [doc/decisions.md](./doc/decisions.md)
- The accessor map is written by hand, never from `hljs.listLanguages()` — hljs's `c` grammar would overwrite `code.c()`: [doc/decisions.md](./doc/decisions.md)
- The API tab's banner drops the `code.` prefix (`patched .lang`) — a `util/source` heuristic, not a bug here: [doc/decisions.md](./doc/decisions.md)

## More
- [Overview](/framework/ext/highlight/) · [doc/decisions.md](./doc/decisions.md) — why highlight.js, the `code.*` namespace, who uses it, open items
- [doc/choice.md](./doc/choice.md) — which highlighter, why five languages · [doc/hooks.md](./doc/hooks.md) — block-awareness, the two hook points, FOUC
- [doc/chaining.md](./doc/chaining.md) — the one sharp edge and every workaround · `editor.md` — MVP spec for the editor this was built for, unwritten
- Files: `highlight.js` (API at top), `highlight.css` (token colours only), `hljs/` (vendored ESM grammars)
