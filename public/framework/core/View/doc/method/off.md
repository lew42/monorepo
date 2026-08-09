**Usage** — **none.** No call site in `public/`, framework or sandbox. The only
mention is prose in `edric/framework/view/page.js:77`.

**Necessity** — no, and worse: **it cannot work.** `on()` registers a *wrapper*
arrow so it can rebind `this`, and the DOM removes a listener by reference — so
the function you hand `off()` is never the function that was registered. Every
call is a silent no-op.

**Simplicity** — the fix is not to simplify this method but to decide the question
it implies. Either `on()` returns (or stores) the wrapper so `off()` has something
to remove, or `off()` goes. A listener registry was considered and rejected —
memory that must be invalidated — so the honest move is deletion. Proposed in
`readme.md`.

