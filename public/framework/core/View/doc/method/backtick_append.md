**Usage** — one call site, and it is the reason the method exists: the prose-tag
loop in `elements()` (`View.js:406`), which builds `p` and `h1`–`h6` plus their
`.c` variants. `p("Call `x` first")` and `h2("`add()` — sub pages")` route here so
prose can carry inline code with no second call.

**Necessity** — yes, given the prose factories' promise. Without it, `p` and the
headings would have to either lose backticks or become `md`, and `md` is an ext
that core cannot import.

**Simplicity** — right-sized at seven lines: strings go to `backticks()`, anything
else falls through to `append()` unchanged, so views and numbers still work.

