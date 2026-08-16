## What this file is

The front door of the CSS strategy: the ladder (stop at the first rung that
works), the four-layer restatement, the type scale demo, and the naming rule
for a class that is really an undeclared import. It is also the `Doc` that
turns `rules`, `layers`, `elements`, `layouts` and `sections` into top tabs.

## Ships no stylesheet

The comment at the top of the file is a claim the page has to keep proving:
every box on it — the row demo, the type-scale demo — is built from
`framework.css` utilities alone. If this page ever needed its own `.css`, the
argument it is making ("most CSS needs are four classes") would be false on
its own url first.

## Became a `Doc` in this pass

It was a plain `Page` before. The only behavioural change is additive:
`notes: "ownership cascade theme audits scrolling"` gives the five `doc/*.md`
design records their own urls under `/framework/styles/docs/<name>/` — they
were previously reachable only by clicking a relative link inside the
`md.details(…, "readme.md", …)` embed at the foot of this page, which is not a
route. `files: "page.js readme.md"` adds a Files tab for the two files
directly in this directory (the five subdirectories are their own tabs via
`children:`, not files of the root).

## Where the components went

The "nineteen-component gallery" callout mid-page is a pointer to
`/framework/ui/`, not a dead end — worth knowing before assuming this
directory owns component look-and-feel too.

## Improvements

1. **None of the five design-record notes were reachable before this pass.**
   Fixed here by wiring `notes:`. *(simple, important — already applied)*
2. **The "Where the components went" paragraph is the only place on this page
   that isn't strategy.** Could move to a one-line pointer in `readme.md`
   instead, freeing the Overview to stay on-topic. *(simple, speculative)*
