## `page.js`

The module's whole demo, because `toc()` indexes whatever page it's on — so the best
demo of it is a page that calls it on itself. Every `h2`/`h3` below the call becomes a
live entry in the rail you can see beside this text (past `82em`).

## Self-demoing, not a code sample

Most `Doc` pages show usage in a `code.js` block and, separately, a `demo()` that
renders the effect. This one collapses the two: the `code.js` fragment is illustrative
(`content(){ toc(); h2("One"); }`), but the actual proof is that this very page's
headings — "Nothing is declared", "Scroll spy", "Why it appears one microtask late" —
are the rail's real entries.

## Scanned once, in the Overview only

As a `Doc`, this page's headings only ever get scanned inside the **Overview** tab —
the one place `content()` runs. The Files tab (`ext/files`) and the (absent) API tab
render their own pages that never call `toc()`, so nothing here demonstrates — or
needs to demonstrate — a toc inside a member page.

## Improvements

1. **No rendered comparison of a skipped vs. unskipped heading.** The `toc-skip`
   section explains the opt-out in prose and one code fragment, but never shows a
   `.h2` that *would* have polluted the rail next to the same one carrying `toc-skip`
   — the "show a variant's effect side by side" ideal the documentation skill asks for.
   Two inline `h2`s, one wrapped in `toc-skip`, would make the trap visible instead of
   described. *(medium, useful)*
2. **"Only on a plain reading page" states the `overview:` collision but can't
   demonstrate it** — showing it would need a second live `Doc` with both `overview:`
   and `toc()` set, i.e. building the broken case on purpose. Not worth the weight for
   one paragraph's claim; the prose plus the readme's exact selector is enough until a
   real page hits it. *(large, speculative — noted, not recommended)*
