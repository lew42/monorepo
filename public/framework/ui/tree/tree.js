import { css } from "../parts.js";

/* Indent is nesting, not a depth counter: every `.ui-tree-children` list adds ONE
 * `--ui-tree-indent` of its own padding, so a row N levels deep sits N paddings
 * from the root — the browser sums them. `Tree.draw()` (the class) throws the DOM
 * away and rebuilds, so there is never a stale depth value to keep in sync — doc/decisions.md. */
css(`@layer theme {
	.ui-tree, .ui-tree-children { list-style: none; margin: 0; padding: 0; }
	.ui-tree-children { padding-inline-start: var(--ui-tree-indent, 1.25em); }
	.ui-tree-item > .ui-tree-children { display: none; }
	.ui-tree-item.ui-tree-open > .ui-tree-children { display: block; }

	.ui-tree-row {
		display: flex; align-items: center; gap: 0.35em;
		padding: 0.2em 0.4em; border-radius: var(--radius);
		color: inherit; text-decoration: none; cursor: pointer;
	}
	.ui-tree-row:hover { background: var(--wash); }
	.ui-tree-selected { background: var(--wash); font-weight: 600; }

	.ui-tree-toggle {
		flex: 0 0 auto; width: 1em; text-align: center; font-size: 0.7em;
		background: none; border: none; padding: 0; color: var(--subtle);
		transform: rotate(0deg); transition: transform 0.1s;
	}
	.ui-tree-item.ui-tree-open > .ui-tree-row .ui-tree-toggle { transform: rotate(90deg); }

	.ui-tree-icon { flex: 0 0 auto; width: 1.2em; text-align: center; }
	.ui-tree-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}`);

/* ⚠ THE BEHAVIOR GRADUATED, 2026-08-21. What was state, listeners and a lifecycle
 * held in a closure here — a class written in the one shape nothing can subclass —
 * is now `class Tree` at `/framework/ux/Tree/`, and new code takes that.
 *
 * The CSS did NOT move, and that is the rule rather than an accident: splitting is
 * the usual answer, so a rule about a relationship or a state stays in `ui/`, and
 * the class wears these same `.ui-tree-*` classes above — doc/decisions.md, "The
 * graduation". The `tree()` function itself retired the same day, once its last
 * caller (`ext/Playground`) moved to `ux/Tree` — see doc/decisions.md. */
