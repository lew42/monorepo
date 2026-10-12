# D3 — demo audit + `page.demo()` prototype + merge proposal

## The ask (owner, verbatim, 2026-08-30 — the two demo paragraphs)

> I like the idea of demos, but our demo system needs compaction. I don't like the source expando in demos. I feel like the demos should be more configurable. anyway, using responsive demos (utilize the full 3440, probably by using a column for code and a column for render).. there are too many demos that have fixed heights that cut off the demo. there's still too many variants of the demos. there's the split screen version (twin?), there's a black border version (like a device), sometimes we display the width below the viewport, sometimes not (I think we always should).

> I like the demo app mode, with the path rendered above, so we can see how the routing works. we recently leaned into the page system. I kind of feel like the demo system could be merged into the page system? we don't want all pages to be forced into demo mode, but if the page class had a demo method, we could render a consistent ux, any page could be imported and rendered as a demo, so the page could be the basic unit of control for these layouts, navigation systems, templates, UI, etc.

## Parts

1. AUDIT — inventory every variant in `ext/demo/**` + `ext/layout` (the control bar): call-site counts per variant, every fixed height, which pages clip, width-readout presence by variant. Numbers, not opinions.
2. PROTOTYPE `Page.prototype.demo()` in `ext/demo/` — ext patches Page (the `ext/tabs` pattern, no core edits). One UX: path bar above, render stage with no fixed clip, width readout ALWAYS, code in a COLUMN beside at wide / below at narrow, NO expando. One options object.
3. PROPOSAL — `proposal.md` in this dir: variant to config mapping, deletes, call-site counts per step, breakage, order. The mastermind decides scope.

## Fence

`ext/demo/**` + this task dir. Read-only everywhere else. Do not change existing demo variants' behaviour (pages depend on them today).
Standing rules: never kill/restart the :80 dev server; never drive owner tabs; never stash; never commit; probe screenshots to the session scratchpad, keepers here; hands off `ext/Playground`, `dev/DevBar`, `ext/grip`.
