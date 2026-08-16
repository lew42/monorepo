# Chaining onto argument-position inline code

**Anything chained onto `code.js()` in argument position, inside a phrasing
parent, is silently discarded.** Not just classes:

```js
p("Call ", code.js("x").ac("wide"), " first.");
//                     ^^^^^^^^^^^ gone
```

| chained | survives? |
|---|---|
| `.ac("wide")` | ✗ dropped |
| `.attr("title", "hi")` | ✗ dropped |
| `.on("click", …)` | ✗ dropped — **a dead handler, not a cosmetic bug** |
| a `file` label passed to `code.lang`/`code.js` itself | dropped too, but by design — see below |

**Why.** Arguments are evaluated before the factory that receives them, so
`code.js()` runs while the captor is still the *grandparent* — it guesses
"block", returns a `<pre>`, and the chain applies to that `<pre>`. By the time
`append` corrects the guess, all it has is a finished element it is about to
throw away (`highlight.js:112-136`).

**Two workarounds, and the first is usually what you meant:**

```js
p.c("wide", "Call ", code.js("x"), " first.");   // class on the sentence
p(() => code.js("x").ac("wide"));               // capture form — correct by construction
```

**Verdict: document it.** Copying the chain across is dead on arrival —
`View.on()` keeps no listener registry, and there is no web API to enumerate
listeners outside devtools. Copying only classes and attributes is arguably
worse than the bug, because block-intent classes would land on an inline
`<code>` and misbehave like a CSS problem. The obvious next move if anyone
actually hits this is to **warn** when discarding a `<pre>` that carries
anything beyond `code-block`.

**The rule of thumb: argument position is for *plain* `code.js(src)`.** The
moment you want to chain — or pass a `file` label and expect it to survive an
inline correction — use `p.c()` or the capture form.

## Why the FILENAME label doesn't need its own warning

`code.js(src, file)`'s label is baked in *before* `append` ever runs — it's
an argument, not a chained call — so it can't be "lost" the way `.ac()` is.
But the correction still unwraps the `<pre>` down to its bare `<code>`
(`inline_if_block`, `highlight.js:123-136`), and the `data-file` attribute
lives on the discarded `<pre>`, not the surviving `<code>`. The label
disappears in exactly the same argument-position cases as everything else in
the table above — it just never had anywhere to go in inline context anyway
(`highlight.css`'s `code.code-inline` carries `white-space: nowrap`, with no
room for a label row). Same trap, same fix, one less thing to be surprised by.
