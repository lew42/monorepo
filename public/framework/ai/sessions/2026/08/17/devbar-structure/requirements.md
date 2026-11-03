# DevBar `structure` section

## The ask (Mike, 2026-08-17, verbatim)

> build something into the devbar that shows what kind of classes or page
> structures we have? Sometimes there are nested pages?

## Scope

`public/framework/dev/DevBar/structure.js` — a new `structure(app)` section on the
`page` tab, after `xray`. For the active page (`app?.router?.active`, its `.el`):

- the chain of nested `.page` ancestors from the active page up — each one's
  `page-*` slug class plus its arrangement classes (standard / wide / full / …)
- the active page's direct content children — one line each: tag, classes (or `—`),
  and the computed `display` when it is `flex`, `grid`, or the element has `.flow`
- a count line: `7 children · 2 grid · 1 flex`

Text only. Utility classes for styling (`flex gap`, `muted`, `code`); no new CSS
unless the ladder forces it, and any new class is `dev-`-prefixed.
Refreshes on navigation the same way `route()` does (`devbar.refresh()`).

## Files owned by this task

- `public/framework/dev/DevBar/structure.js` (new)
- `public/framework/dev/DevBar/tools.js` (one import, one array entry)
- `public/framework/dev/DevBar/doc/structure.md` (new)
- `public/framework/dev/DevBar/readme.md` (one More line; stays ≤ 30 lines)

## Second deliverable

Honest test of the skill lifecycle end to end — one `improvements.md` line per real
friction, evidence not opinion. No SKILL.md edits.
