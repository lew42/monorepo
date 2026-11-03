The module's own Overview: a code sample, a live queue demo (`MemorySaver`
wrapped in an artificial 30ms write delay so "a save during a write" is a real,
observable thing rather than a claim), and a walk through the four backends.

## The demo IS the test suite

`run()` is five assertions against real `MemorySaver` instances, rendered as
pass/fail rows rather than printed to a console — the same code path a unit
test would exercise, except a visitor sees it pass in their own browser on
every page load. There is no separate test file in this module; this is it.

## The synchronous-capture trap, handled correctly

```js
div.c("flex v gap", $checks => {
    span.c("muted", "running…");
    return run().then(rows => { $checks.empty(() => rows.forEach(row => line(row))); });
}).style("--gap", "0.3em");
```

The child callback returns the promise (not an `await` inside an async
function), and the rows are appended inside `$checks.empty(() => …)`, which
re-establishes the captor. A `code-architecture`-skill trap, followed exactly.

## Improvements

1. **Converted to `Doc` in this pass** — was a plain `Page`; see this module's
   audit entry for what moved into `properties:`/`methods:`/`notes:`/`files:`.
   *(done in this pass.)*
2. **The four-backends comparison duplicates `doc/backends.md` in miniature.**
   Deliberate — the Overview needs the short version with a live demo, the note
   needs the long version with the environment-detection idiom every real
   caller repeats. Flagging so a future edit doesn't let them drift apart.
   *(simple, useful — keep them in sync by hand for now.)*
