This module's own page — a `Doc` documenting `Router` with `Router`'s real
prototype, plus a live demo of the two link classes rendered by this very page.

## The demo is the honest test

The four anchors in the `demo()` block are real `<a href>`s on this real page, so
`Router.mark_links()` lights them up exactly as it would anywhere else on the
site — the doc doesn't *say* what `.active`/`.in-path` do, it *shows* them,
produced by the framework's own pass rather than a fake.

## `subject: Router` reads the live prototype

Every method and property listed in `methods:`/`properties:` is a lookup against
the running class, not a hand-copied snippet — a method renamed here and not
re-listed prints a console warning the moment the page loads.

## Improvements

1. **No `overview:` rail.** The Overview is one demo and a few paragraphs, which
   is right-sized for a module this small — but it means there's no second card to
   compare against. Not worth manufacturing one. *(n/a — noted, not a defect)*
2. **The four-class code block (`.page.active-page` etc.) duplicates
   `doc/marking.md`'s own opening block.** Harmless — one is a two-second
   reference on the Overview, the other is the reasoning — but if the classes
   ever change, both need editing. *(simple, speculative)*
