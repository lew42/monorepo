**Usage** — the engine under every capture. Called from `append()`'s function
branch and its renderable branch (`View.js:64,70`). Every `div(() => …)` on the
site is one of these.

**Necessity** — the class. This *is* capturing: set the captor, run, restore, and
append whatever came back.

**Simplicity** — right-sized, and its four lines are the highest-consequence four
in the framework. Two properties to hold on to:

- `fn.call(this, this)` passes the view **both** ways, so `$box => …` and
  `function(){ this … }` both work.
- It restores the captor when your function **returns** — for an `async` function,
  its first `await`. That is the trap; see the `capturing` note.

A per-async-context captor would need `AsyncLocalStorage`, which browsers do not
have. Sync-render-then-async-append covers every case, so there is nothing to fix
here.

