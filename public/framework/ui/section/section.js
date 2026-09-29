import { div } from "../../core/View/View.js";
import { css } from "../parts.js";

/**
 * section(classes, build) — a wrapper div that shows its OWN class names as a
 * subtle hover label, so browsing the site teaches the class vocabulary.
 *
 *     section("bleed flex", () => {
 *         h2("A full-width, wrap-flowing section");
 *     });
 *
 * `classes` is every class the section carries — `.ui-section` is added for
 * you, and every OTHER class in the string becomes the hover label, written
 * back as ".bleed .flex". Add `ui-section-br` to move the label to the
 * bottom-right corner instead of the default top-left.
 *
 * Opt-in, by construction: nothing changes on any element that lacks
 * `.ui-section` — this is markup you choose to add, never a default. This
 * doesn't have to go on every element, only the ones worth labelling.
 * Record: readme.md, doc/decisions.md.
 */
export function section(classes = "", build){
	const list = classes.split(/\s+/).filter(Boolean);
	const label = list.filter(c => c !== "ui-section-br").map(c => `.${c}`).join(" ");

	return div.c(`ui-section ${classes}`.trim(), build)
		.attr("data-section-label", label || ".ui-section");
}

/* THE PRIMITIVE — a 1px border in the line colour, always on (that's the
   "subtle border" the owner asked for), and a label that only shows on
   hover so it never competes with the section's own content. The label text
   is the section's own class list, written back with a data-* attribute +
   `attr()` in ::before — section() above sets it once, to exactly what the
   caller typed minus ui-section itself, so this costs no extra DOM. */
css(`@layer theme {
	.ui-section {
		position: relative;
		border: 1px solid var(--line);
	}

	.ui-section::before {
		content: attr(data-section-label);
		position: absolute;
		top: 0.4em; left: 0.6em;
		font-size: 0.75em;
		color: var(--subtle);
		background: var(--surface);
		padding: 0 0.35em;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s;
		z-index: 1;
	}
	.ui-section:hover::before { opacity: 1; }

	/* Modifier: the same label, the opposite corner. */
	.ui-section-br::before {
		top: auto; left: auto;
		bottom: 0.4em; right: 0.6em;
	}
}`);

export default section;
