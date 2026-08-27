# S4 — ux inner tabs vertical (verbatim brief)

## The ask (verbatim, from the orchestrator)

TASK S4 — a Doc nested inside another Doc renders vertical tabs (kills the ux/* alternating bands).

THE BUG (verified today by pixel sampling): `/framework/ux/Tree/` nests one Doc (`ux/Tree/page.js:90`) inside another (`ux/page.js:14`). Each Doc paints its title band + `.tab-bar` with `var(--well)` (a translucent shadow, `ext/Doc/Doc.css:26,40-45`) over the ambient `--wash`, and the outer `.tab-panel` between them shows plain `--wash` — so the stack reads #E3E3E3 -> #F2F2F2 -> #E3E3E3 -> #F2F2F2: broken alternating bands. Owner's decision: the INNER Doc should use the left inner tab style instead — `.tabs.vertical` (`ext/tabs/tabs.css:109-153`, transparent rail, border-inline-end, active = `--prim` accent), the same style the Doc "API" section already uses (`ext/Doc/Doc.js:52` `this.tabs().ac("vertical")`).

WHAT YOU BUILD: automatic detection — when a Doc's parent chain puts it inside another Doc's panel, its own top `tabs()` call renders the `vertical` variant (and skips/adjusts the `--well` title band so no second band appears). Implementation your call, simplest wins (e.g. check `this.parent instanceof Doc` or an ancestor walk at render time in `ext/Doc/Doc.js:220-227`). No opt-in flags unless automatic proves wrong somewhere — then report instead of hacking.

## Scope / file fence

- Own: `ext/Doc/**`, and only if needed, `ext/tabs/tabs.css`.
- Sibling agents are editing `core/Page/**` concurrently — stay out.

## Blast radius requirement

Before landing: find every Doc-nested-in-Doc on the site. Crawl `/framework/` and `/notes/`
headless (sandbox dirs error by design — skip; mini_app/marking demo hrefs 404 by design),
detect DOM with `.doc-page` inside a `.doc-page .tab-panel`, list every hit, screenshot each
before/after at 1280. If any page other than ux/* changes and looks WORSE, stop and report
rather than shipping.

## Verify

- /framework/ux/Tree/ before/after screenshots at 1280.
- Pixel-sample the vertical stack to confirm the E3/F2 alternation is gone.
- Confirm plain (non-nested) Doc pages (e.g. /framework/ext/Doc/) are byte-identical in
  appearance (screenshot diff or pixel samples).

## Source

Decision recorded at `../column-pages/design.md` §7; full mastermind ask at
`../column-pages/requirements.md`. Wave A of that run: S1 core columns (Opus) / S3 generator
(Opus) / S4 this task (Sonnet).
