"These cases of could-be-off could be deferred to the user" (Mike). A judgement
call the reader has already made shouldn't keep costing score every time the
audit runs — `defer()` remembers a waived `url + rule + selector` triple in
`localStorage`, and `analyze()` (in `LayoutTool.js`) subtracts those findings
from the score before anyone sees it.

## Only the polish tier is deferrable

`OPEN = new Set(["alignment", "hierarchy", "proportion"])` — the categories
`polish.js` produces. Content that cannot be reached (`rules.js`'s tier) is
never a matter of taste, so `deferrable()` refuses those regardless of what a
reader clicks; letting them be waived would make the score measure how much
had been dismissed rather than how sound the page is.

## It's a decision about this site, not a change to the rule

Deferring never touches `rules.js`/`polish.js` — the rule stays exactly as
strict for every other page and every other reader. It is purely a per-browser
`localStorage` filter applied in `split()`, which is why `LayoutTool.js`
subtracts `waived` from `issues` rather than the rule simply not firing.

## Improvements

1. **Deferrals live only in the browser that clicked them** — `localStorage`
   has no export, so a decision made on one machine doesn't travel to the
   saved `audit/findings.json` baseline or to a teammate's browser. For a
   single-maintainer site this is probably fine; worth a line in the readme if
   a second person starts using the audit page. *(simple, useful.)*
2. **`id()` concatenates `url|rule|sel` with no escaping.** A selector
   containing `|` (unlikely — `label()` in `probe.js` only ever emits
   `tag#id` or `tag.class.class`, none of which can contain a pipe — but
   nothing enforces that contract at this boundary) would silently collide
   with a different finding. *(simple, speculative.)*
