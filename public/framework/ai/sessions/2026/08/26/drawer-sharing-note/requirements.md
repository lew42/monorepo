# drawer-sharing-note

## The ask, verbatim

> make a quick note in the drawer's readme about sharing it with other modules, and any
> dangers of doing so, or any best practices to make it work smoothly.

## Context

It came out of a question answered first in this session: how the right rail works, whether
there is one drawer, and whether filling/emptying it per selection leaks. Measured headless
on `/framework/ext/Panel/` — 1,700 rebuilds of the rail's contents (~61k elements, ~34k
listeners), GC forced via CDP: nodes 10664 → 10664, listeners 3821 → 3821, heap +0.03 MB.
So churn is clean, and the readme should say why it stays clean.

The two live dangers are already recorded in code, not in the readme:

- `ext/layout/panel.js` wires `$rail.on("click", refresh)` once and never unwires — it fires
  for `ext/Panel`'s fills too, which is why `properties.js`'s `row()` has to
  `stopPropagation`. (`properties.js:152`)
- A fill that subscribes to anything long-lived (`root.on`, an observer, a document
  listener, a non-weak Map) is the thing that would actually leak — `properties()`'s
  self-unbinding `hear`/`stop` pair is the pattern that gets it right.

## Scope

- `public/framework/ext/drawer/readme.md` — one short section, index voice, links to the detail.
- `public/framework/ext/drawer/doc/decisions.md` — only if the readme needs somewhere to point.

Out of scope: changing `drawer.js`, fixing the `ext/layout` ownership bug (its proposal
already lives at `ai/2026-08-19/panel-bar-sweep/`).
