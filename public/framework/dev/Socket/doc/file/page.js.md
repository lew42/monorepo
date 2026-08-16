The Socket module's `Doc` — `Overview`, `API` (three properties, eleven
methods), `Docs` (three notes), `Files` (this tab). It was migrated from
`ext/classdoc` to `Doc` on 2026-08-15, the same day this file was written.

## What it documents, and what it leaves out

`methods:` lists eleven of Socket's nineteen own methods — the connection
lifecycle, the message protocol, and `changed`. Two groups are deliberately
absent, and neither absence is visible on the page:

- `async_rpc`, `ls`, `rm`, `write`, `cmd` and `log` — the "client → server"
  surface the readme's `## Proposed` argues should shrink to three. Listing
  names likely to be deleted would document a shape that's about to change.
- `loaded` and `restyle` — `changed()`'s two helpers. They are covered in one
  section of [`changed`](/framework/dev/Socket/api/changed/) rather than given
  pages of their own, because their whole meaning is the decision `changed()`
  makes with them, and splitting it would put the `@layer` trap in three files
  instead of one. Stale beats missing here.

## The Overview reads as a three-step tour

Boot line, then the guard that makes it safe (`h2("The guard is in the
class")`), then the protocol (`h2("The server calls a method on you")`), then
what a save actually does (`h2("A save reloads the tabs that loaded the
file")`) with [wire](/framework/dev/Socket/docs/wire/) as the full contract.
Each block leads with a code sample and captions it — the shape the skill asks
for.

## Improvements

1. **Say why eight methods are missing from `methods:`.** One sentence on the
   page turns an invisible authorial choice into a visible one; right now only
   this file records it. *(simple, important.)*
2. **The Overview has no `demo()`.** Every block is `code.js` + `md`, which is
   honest for a module whose behaviour is a page reloading, but the CSS swap is
   genuinely demonstrable — a button that calls `restyle()` on a scratch sheet
   would show the mechanism in one click. *(medium, later.)*
