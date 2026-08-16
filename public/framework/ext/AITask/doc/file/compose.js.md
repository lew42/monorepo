The "start work" box on `/framework/ai/`: an ask, an optional name, an
effort, a model, one submit handler that posts `rpc:start` and waits for a
directory + a slug back — not for the work itself. Full flow, including the
mute and the fallback slug: [starting-work](/framework/ext/AITask/docs/starting-work/).

## Absent by design, not broken

`available()` (from `ext/Ask/Ask.js`) gates the whole function — off
localhost, `compose()` returns `undefined` and nothing renders. `dashboard.js`
calls `compose(found)` unconditionally; the guard lives here, once, rather
than at every call site.

## Improvements

1. **The three form controls are a hand-rolled `<form>`** with manual
   `el.value` reads and a submit handler that duplicates what the framework's
   own form helpers likely already offer elsewhere in the codebase — worth a
   comparison the next time a second compose-style box is needed, so the
   pattern doesn't get reinvented a third time. *(medium, useful)*
2. **No client-side length or content guard on the prompt** beyond
   `.trim()` truthiness — the server-side `slugify()` handles anything, but a
   truly enormous paste would still round-trip to the server before failing
   (if it ever does). Low risk given this only runs on localhost. *(simple,
   speculative)*
