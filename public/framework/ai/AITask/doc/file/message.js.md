Renders one transcript line, block by block — text through `md()`, thinking
folded behind `fold()`, tool calls and results clipped and preformatted,
images as inline `data:` URIs. Used by `conversation.js` for every line that is not
talk — the contents of a folded tool run.

## `fold()` is this module's own expando

A clickable bar over a hidden body, toggled by a class rather than the
native `<details>` element — used for thinking blocks here, for harness tag
bodies in `prompt.js`, for the chat panel on the Session tab and for the day
timeline on a dashboard.

⚠ **The body is built on its FIRST open, not up front.** A fold's whole job is
to keep something expensive out of the way, and a hidden subtree is still built,
still in the DOM and, when the body is a whole nested transcript, still fetched. Independent of `AITask.js`'s `<details>` use in
`head()`; two different expando mechanisms coexist in the module, each
reasonable in its own spot (native semantics for a genuinely document-shaped
disclosure, a styled div for a repeated small toggle inside a dense feed).

## `clip()` is the shared truncation budget

400 chars by default, with a `(N chars)` suffix naming what was cut — used
for tool inputs (at a tighter 160-char clip, inlined in `block()`), tool
results, and thinking blocks, so a huge payload never makes one message
dominate the whole feed.

## Improvements

1. **The two expando mechanisms (`fold()` here vs. native `<details>` in
   `AITask.head()`) could be unified** — a native `<details>` styled to match
   `.ai-fold` would drop the manual `classList.toggle` handler and gain
   keyboard/find-in-page support for free. Not urgent: both read fine today
   and nobody has hit the accessibility gap yet. *(medium, speculative)*
