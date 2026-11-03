The class. One constructor, one six-step `instantiate()`, and a handful of thin
members — most of the file *is* the lifecycle. Everything that could resolve a url
was cut to `Router` and `Page`; what is left is boot order and `$pages`.

## `instantiate()` is the whole mental model

```
config() → render() → await load() → initialize() → inject() → ready.resolve()
```

One method, unawaited from the constructor, so `new App()` reads as a single line
and `app.ready` is how anyone waits for it. The body runs inside its own
try/catch — any throw logs, renders the error page, and still resolves `ready` —
so the wait always settles. Full reasoning: `../boot.md`.

## Two members are compatibility, not a third API

`stylesheet()` (instance) and `path_to_page_url()` exist only because dropping them
once took three sandboxes down at once. Neither may grow an implementation — both
forward, verbatim, to the thing that replaced them. `../aliases.md`.

## `log_label()` is the odd one out

Not compatibility, not a hook — just written and never wired up. Zero callers,
unlike `Page.log_label()`'s three. See `doc/method/log_label.md`.

## Improvements

1. **Every `App.js:NN` line citation across this module's docs had drifted** —
   comments added to the file since these were written shifted call sites by 2 to
   8 lines, and one citation (`framework/ui/page.js:29`, in `doc/property/router.md`)
   pointed at a `mark_links()` call that no longer exists anywhere. Fixed in this
   pass, file by file. *(simple, important — done.)* Nothing catches this kind of
   drift automatically; a module that goes a year without a doc pass will drift
   again the same way.
2. **`initialize()` has been overridden by nobody in a year** — the readme's own
   standing test for removing it has been met. Removing a public hook is exactly
   the kind of change this module's fences (rightly) forbid an audit from making;
   it is recorded here as agreeing with the readme's Proposed verdict, not as new
   information. *(simple, important — needs the owner.)*
3. **`path_to_page_url()` encodes a url convention this framework no longer has**,
   and its only real caller is `arya/lib/Router.js`. The readme's proposal to move
   it there stands. *(medium, useful — needs coordination with arya.)*
