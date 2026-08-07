import { View, div, a, span, icon } from "../../core/View/View.js";

/* css: .page-preview, .page-preview-title — the card chrome is Page's; this
 * import is the loading edge for Page.css, not an annotation. */
import "../../core/Page/Page.class.js";

View.stylesheet(import.meta, "gallery.css");

/**
 * card(nav, thumb, classes) — a preview card with a live render in it.
 *
 *     this.children.forEach((page, name) =>
 *         card(this.nav_for(name), gallery[name]));
 *
 * Three indexes draw this object — layouts, components, sections — and each
 * hand-rolled the same markup before this module existed: same classes, three
 * copies, and the `.gallery-*` rules sitting in Page.css, which never emits
 * them. One emitting module is what makes the class names ownable.
 *
 * The thumbnail is INERT (`pointer-events: none`, gallery.css): a live render
 * inside a card that is itself a link would be an `<a>` in an `<a>` — invalid,
 * and the browser un-nests it. The label below is the only link; its `::after`
 * covers the card. `checkered` is the floor, so a render that paints no
 * background reads as unpainted rather than borrowing the card's white.
 *
 *   nav      { url, label, icon } — exactly what `Page.nav_for(name)` returns
 *   thumb    the render function, run while the thumbnail is capturing
 *   classes  thumbnail extras — a zoom, a pad. No centering: the thumb crops
 *            at a fixed ratio (gallery.css), and a crop only reads as "the top
 *            of the page" if the content starts at the top.
 *
 * A card that wants more of the wall chains the spans Page.css already has:
 *
 *     card(nav, thumb).ac("tall")      // stats, a pricing band
 */
export default function card(nav, thumb, classes = "zoom-25"){
	return div.c("page-preview gallery-card", () => {
		div.c("gallery-thumb checkered " + classes, thumb);

		a.c("gallery-link").href(nav.url).append(() => {
			if (nav.icon) icon(nav.icon);
			span.c("page-preview-title", nav.label);
		});
	});
}

export { card };
