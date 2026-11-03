The backup path, never the detector. The numbers decide what's broken; this
hands a model a screenshot **and** the numeric findings and asks which it can
actually see — the one question vision genuinely answers better than
arithmetic. Full comparison against three models on the same corpus:
[Thresholds § Can a model find the same things?](../knowledge/thresholds.md).

## Read-only by construction, not by convention

`TOOLS = "Read,Glob,Grep"` is the entire boundary between a prompt typed into
a public page and a write to this repo — there is no server-side check behind
it, so widening this list is the one change in the whole module that would
actually be dangerous rather than merely wrong.

## Absent, not broken, off localhost

`available()` (from `ext/Ask`) gates the button's existence entirely — there's
no dev server off localhost to run a Claude turn against, so the button simply
doesn't render rather than rendering and failing.

## The prompt sends findings *in*, deliberately

An open-ended "what's wrong with this picture" produces a fresh opinion with
no relationship to what the rules already found. Asking "which of these do you
actually see" tests the rules' *findings* against a human-shaped judgment,
which is the actually useful question once the numbers already exist.

## Improvements

1. **`report.url` is resolved against `location.origin`** because the probe
   only ever records a pathname — correct, and the one line in this file most
   likely to silently break if `ext/Ask`'s screenshot ever runs same-tab
   instead of in a fresh browser context. Worth a shared test alongside
   `ext/Ask`'s own suite rather than only a comment here. *(medium,
   speculative.)*
2. **No cost/time ceiling before the button is even shown** — `vision.js`
   itself does nothing to prevent asking on a page whose `analyze()` already
   found zero issues, where a second opinion has the least to add. Not
   currently a real cost problem (a human clicks it deliberately), but if this
   were ever wired to run automatically it would need one. *(simple,
   speculative.)*
