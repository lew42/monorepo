# code — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.


- 2026-08-18 (figma-spec-sheet): silent on **`append_fn(fn)` calling `fn.call(this, this)`**. `.append(some_fn)` therefore passes the View as the function's FIRST ARGUMENT — so `.append(hero)` on a `tone => view` band handed it a View where its tone goes, `band()` had no case for it, and all twelve specimens rendered the default surface. Nothing threw. The rule: pass `() => fn(args)`, never a bare reference, to anything that takes parameters. Belongs beside the other traps that never throw.
