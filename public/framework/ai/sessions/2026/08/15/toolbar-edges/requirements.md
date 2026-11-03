# toolbar-edges

## The ask

Continuation of Mike's 2026-08-15 autonomy grant ("keep improving!"). The hover-overlay toolbar shipped this afternoon left two edges open, both flagged with measurements:

1. **Narrow panels** (panel-ui-overhaul, minion A): below ~230px the bar is wider than its panel and the tail clips with no affordance — "a narrow-panel affordance is still unwritten" (readme, Open).
2. **Control-surface collision** (properties-region, minion P): the bar is an overlay that lights on hover — i.e. exactly when a control surface's top row is in use. The inspector hand-reserves `2.4em`; ext/editor's regions have the same collision and no reserve (flag 3 of that task).

## Scope

- A minimal narrow-bar affordance: every verb stays reachable in a ~150–230px panel; the wide bar is unchanged. Design call is the minion's (overflow popover, priority collapse, scroll — simplest that reads well).
- One shared mechanism for "this template's top edge holds controls" replacing the inspector's private reserve — so ext/editor's regions *could* adopt it (adoption itself is out of scope, flag-only).
- Out of scope: ext/editor edits, new features, anything not these two edges.

## Fences

- **Minion R**: `Panel/toolbar.js`, `Panel/toolbar.css`, `Panel/templates.css`, `Panel/properties.js` (drop its private reserve if the shared mechanism supersedes it), `Panel/panel.css` (only if the mechanism belongs there), `Panel/page.js` (only if `files:`/demo must change), `Panel/doc/file/*.md` for touched files. Returns readme delta as text.
- **Orchestrator**: readme merge, landing.
- Everyone: panels.json backup/diff-restore; screenshots staged in scratchpad; ext/editor and ext/layout read-only.
