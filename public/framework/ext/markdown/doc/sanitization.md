# Why `html_unsafe()`, not `html()`

**The question.** `View.html()` was changed to route through the Sanitizer
API's `Element.setHTML()`, falling back to `textContent` where unsupported —
so `html()` is "safe by default" everywhere else in the framework. Should
markdown output go through it too?

**Options weighed.**

| | |
|---|---|
| (a) inherit `html()` | sanitized markdown, for free |
| (b) `html_unsafe()` | raw, as written |
| (c) vendor DOMPurify as a fallback in core | both hold everywhere |

Safari implements `setHTML()` in **no version, desktop or iOS** (~67% global
support). Under (a), every doc page on this site would render as literal
`<h2>`/`**bold**` text for every Apple visitor — not a safe degradation, an
outage.

The content this module parses is repo-authored: string literals in
`page.js` files and same-origin `.md` files, whose trust boundary is *commit
access* — someone who could smuggle a script through markdown could already
add malicious JS directly to a `.js` file. Sanitizing here buys nothing and
costs correctness.

**Verdict: (b).** `View.html()` stays fail-closed for callers that can't
vouch for their input; this module opts out because it can vouch for its own.
(c) stays on the table and is the right answer **the moment markdown arrives
from anywhere but the repo** — a comment field, a user-submitted note, an AI
response embedded verbatim. `ext/AITask` and `ext/Ask` currently render model
output through `md()` too; that content is not user-typed, but it is not
repo-authored either, and is the nearest thing to a live edge case this
verdict has.

## One more consequence of the same verdict

`md()`'s single-block path builds off `template.innerHTML`, then adopts the
parsed element into the live DOM — which re-arms any handler attributes the
parsed HTML happened to contain. This was never a sanitization step; the
`<template>` only makes parsing inert, not the adoption. Under the verdict
above that's simply consistent with the rest of the module — **do not** "fix"
it to route through `html()` without revisiting this page, or `md("Hi.")` and
`md("Hi.\n\nThere.")` go back to taking different, inconsistent paths based
on block count.
