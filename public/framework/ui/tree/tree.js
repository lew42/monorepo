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

		/* THE FRAME the fold and the icon both wear, declared here so there is one
		   number rather than two that can drift apart.
		   NO BACKTICKS ANYWHERE IN THIS COMMENT: these rules live inside a
		   css(...) template literal, and one backtick ends it and blanks the site.
		   MEASURED, because the obvious assumption is wrong: an em inside a custom
		   property is NOT resolved at the element that declares it. An unregistered
		   custom property inherits as a token stream, so 1.3em is resolved wherever
		   it is USED - against that child's own font size. While the fold carried a
		   font-size of 0.9em this one token made a 16.63px icon box and a 14.97px
		   fold box (read back at 1920). That is why neither child sets a font size
		   of its own any more: same em, same square, and the token can be trusted
		   to mean one thing. 2026-09-19. */
		--ui-tree-frame: 1.3em;
	}
	.ui-tree-row:hover { background: var(--wash); }
	.ui-tree-selected { background: var(--wash); font-weight: 600; }

	/* The focused row. A tree is driven from the keyboard, and exactly one row is
	   tabbable (ux/Tree's roving tabindex), so the reader has to be able to see which.
	   A rule about a STATE is what this tier is for - it sits here beside :hover and
	   .ui-tree-selected, not in the class's own stylesheet (2026-09-17).
	   Not :focus-visible - the focus is MOVED by script on an arrow key, and whether
	   that counts as "visible" is a UA heuristic. It is always visible here.
	   The offset is negative on purpose: the framework's 3px positive offset is drawn
	   OUTSIDE the row, which a 14em rail clips. */
	.ui-tree-row:focus { outline: 2px solid var(--prim); outline-offset: -2px; }

	/* ONE SQUARE FRAME, WORN BY BOTH, so the fold, the icon and the label sit on one
	   centre line. The owner, 2026-09-19: "the icons should be properly framed so
	   that they always look good — in some sort of square frame, centered vertically
	   and horizontally … fixed height and width, aspect ratio square."
	   ⚠ line-height: 1 is the half that actually fixes the drift. A glyph inherits
	     the row's 1.4 line-height, which draws a line box taller than the glyph and
	     then sits the glyph on ITS baseline, not in the middle — so a material icon
	     rode a few px high of the word beside it. place-items: center centres the
	     line box; line-height: 1 makes that line box the glyph's own em square, so
	     centring it centres the glyph.
	   ⚠ aspect-ratio: 1 with only a width, rather than a second length: one number
	     can then never disagree with itself. */
	.ui-tree-toggle, .ui-tree-icon {
		flex: 0 0 auto;
		display: grid; place-items: center;
		width: var(--ui-tree-frame, 1.3em); aspect-ratio: 1;
		line-height: 1;
	}

	/* The fold, inside that frame. It sets NO font size of its own (see the frame
	   note above), so the glyph is the row's own size: 12.8px on the site's rail,
	   16px at a page's font size, in a 16.6px / 20.8px square. It used to be
	   font-size 0.7em with width 1em, which made a 9px glyph in a 9px box - a
	   length in em resolves against the element's OWN font size, so that "1em" was
	   0.7 of the row's. The owner could barely see it and nobody could hit it.
	   It stays quiet by COLOUR, not by size: --subtle, against the label's ink.
	   2026-09-19. */
	.ui-tree-toggle {
		background: none; border: none; padding: 0; color: var(--subtle);
		transform: rotate(0deg); transition: transform 0.1s;
	}
	.ui-tree-item.ui-tree-open > .ui-tree-row .ui-tree-toggle { transform: rotate(90deg); }
	/* min-width: 0 is what makes the ellipsis work. A flex item's floor is its CONTENT
	   width unless you say otherwise, so without it a long label pushes the row wider
	   instead of truncating - and pushes anything after it (ux/Tree's star and row
	   buttons) off the end of a narrow rail. Found 2026-09-17, adding those. */
	.ui-tree-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
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
