**Usage** — one internal caller: `append_pojo()` (`View.js:102`), which is itself
called from one place. Effectively unreachable from any file in `public/`.

**Necessity** — no, on current evidence. It exists to give `append({ header: … })`
a `this.header` back.

**Simplicity** — it is the sharpest edge in the file for the least return. The
collision guard is `if (!this[prop])`, which is truthiness against the **prototype
chain** — so `append({ text: "hi" })` sees `View.prototype.text`, warns, and
silently drops the assignment, while `append({ note: … })` succeeds. A guard that
consults the prototype cannot be reasoned about from the call site. The house rule
that killed `Page.alias()` applies verbatim: *a convenience that needs a deny-list
is not a convenience.*

