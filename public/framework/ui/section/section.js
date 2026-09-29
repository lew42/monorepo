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
 * you, and every LAYOUT class in the string (anything that isn't `ui-section`
 * or a `ui-section-*` modifier) becomes the hover label, written back as
 * ".bleed .flex". Add `ui-section-br` to move the label to the bottom-right
 * edge instead of the default top-left.
 *
 * Opt-in, by construction: nothing changes on any element that lacks
 * `.ui-section` — this is markup you choose to add, never a default. This
 * doesn't have to go on every element, only the ones worth labelling.
 * Record: readme.md, doc/decisions.md.
 */
export function section(classes = "", build){
	const list = classes.split(/\s+/).filter(Boolean);
	const label = list.filter(c => c !== "ui-section" && !c.startsWith("ui-section-")).map(c => `.${c}`).join(" ");

	return div.c(`ui-section ${classes}`.trim(), build)
		.attr("data-section-label", label || ".ui-section");
}

/* THE PRIMITIVE — a 1px border in the line colour, always on (that's the
   "subtle border" the owner asked for), `--pad-card` for breathing room
   (the framed-box padding token — a bordered box is a "card" by the site's
   own rule, so it reads the same token `.card` does rather than a number
   invented here), and a label that only shows on hover so it never competes
   with the section's own content.

   The label sits ON the border line itself, like a <fieldset><legend> —
   `translateY(-50%)` centers it vertically on the top edge, and its own
   `background: var(--surface)` paints over the border line under the text so
   the two don't visually collide. That is also what keeps it off the
   section's own content: it lives OUTSIDE the padded content box, straddling
   the border, never on top of the first line of text (found live: centred
   inside the padding box like a normal absolute label, it printed right over
   the band's first word). The label text is the section's own layout class
   list, written back with a data-* attribute + `attr()` in ::before —
   section() above sets it once, to exactly what the caller typed minus
   ui-section and any ui-section-* modifier, so this costs no extra DOM. */
css(`@layer theme {
	.ui-section {
		position: relative;
		border: 1px solid var(--line);
		padding: var(--pad-card);
	}

	.ui-section::before {
		content: attr(data-section-label);
		position: absolute;
		top: 0; left: 0.6em;
		transform: translateY(-50%);
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

	/* Modifier: the same label, on the BOTTOM edge instead. */
	.ui-section-br::before {
		top: auto; left: auto;
		bottom: 0; right: 0.6em;
		transform: translateY(50%);
	}
}`);

export default section;
