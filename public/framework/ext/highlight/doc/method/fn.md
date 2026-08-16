**Usage** — `code.fn(() => { … })` takes a **function**, not a string, and
renders its body via `source()` (`util/source/source.js`), dedented, always as
`"javascript"`. It **never calls** the function — that's the entire
distinction from `demo(fn)`, which stringifies *and* runs. There's no `file`
parameter: a function literal has no filename of its own to label, only the
file it's written in, which is what the Files tab is for.

**Necessity** — yes, and it's the one accessor worth reaching for over a
plain string. A string code sample is dead text: no highlighting-while-you-
type, no completion, no rename-refactor, and — the one that actually bites —
**no syntax errors**. A function body is live code the editor already
checked, and `fn.toString()` gives back exactly what it checked.

**Simplicity** — one line, and the constraint is the whole design: the
argument must *parse* as JavaScript, so this can't show pseudo-code or an
ASCII diagram — those still need a plain string through `code.js()`.
