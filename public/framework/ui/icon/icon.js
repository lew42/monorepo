import { css } from "../parts.js";

/**
 * Three classes, nothing to import and nothing to wire — same shape as ui/badge and
 * ui/alert: the class list IS the component. Everything here reuses the real icon,
 * `icon()` from core/View/View.js (a span.material-icons.icon), and the one new
 * token this task adds beside it in framework.css: `--icon-frame`. Because that
 * token and the icon's own `font-size: 1.25em` both read the SAME ancestor, raising
 * a container's font-size scales the icon, the frame and the button together — no
 * JS, no second number to keep in sync. The facts and the reasoning are in
 * doc/icons.md.
 *
 * .ui-icon-frame            — a fixed em box around one icon, centred both ways.
 *                              For an icon that must line up with others even when
 *                              the glyphs themselves are not the exact same width.
 * .ui-icon-btn               — the frame, clickable: flush (no background) by
 *                              default, a wash on hover. Add .ui-icon-btn-bg for a
 *                              button that reads as its own surface before hover too
 *                              (a rail's current item, say).
 * .ui-icon-btn[aria-pressed] — the toggle state. A toggle button already needs
 *                              aria-pressed for screen readers, so that attribute
 *                              IS the on/off switch — there is no second ".active"
 *                              class that could fall out of sync with it. "true"
 *                              lights the background and tints the icon; "false"
 *                              dims the icon.
 * .ui-icon-rail               — a row of icon buttons, flush and backed ones mixed
 *                              freely; it only supplies the gap between them.
 */
css(`@layer theme {
	.ui-icon-frame {
		display: inline-grid; place-items: center;
		width: var(--icon-frame); height: var(--icon-frame);
		line-height: 1; flex: 0 0 auto;
	}

	.ui-icon-btn {
		display: inline-grid; place-items: center;
		width: var(--icon-frame); height: var(--icon-frame);
		line-height: 1; flex: 0 0 auto;
		padding: 0; margin: 0; background: none; border: none; border-radius: var(--radius);
		color: inherit; cursor: pointer;
	}
	.ui-icon-btn:hover { background: var(--wash); }
	.ui-icon-btn:focus { outline: none; }
	.ui-icon-btn:focus-visible { outline: 2px solid var(--prim); outline-offset: -2px; }

	/* An opt-in background, for a button that should already read as its own
	   surface — not only once the pointer arrives. */
	.ui-icon-btn-bg { background: var(--fill-a08); }
	.ui-icon-btn-bg:hover { background: var(--fill-a32); }

	.ui-icon-btn[aria-pressed="true"] { background: var(--fill-a32); color: var(--prim); }
	.ui-icon-btn[aria-pressed="true"]:hover { background: var(--fill-a32); }
	.ui-icon-btn[aria-pressed="false"] { color: var(--subtle); }

	.ui-icon-rail { display: flex; align-items: center; gap: 0.25em; }

	/* The alignment guide, for the demo page only: a hairline at the row's centre,
	   toggled by a button on the page itself — no framework behaviour here, just
	   the one class it adds and removes. */
	.ui-icon-guide { position: relative; }
	.ui-icon-guide::before {
		content: ""; position: absolute; left: 0; right: 0; top: 50%;
		border-top: 1px dashed var(--prim); opacity: 0.6; pointer-events: none;
	}
}`);
