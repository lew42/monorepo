import { View, div, a, span, icon } from "../../core/View/View.js";

/* css: .page-preview, .page-preview-title — the card chrome is Page's; this
 * import is the loading edge for Page.css, not an annotation. */
import "../../core/Page/Page.class.js";

View.stylesheet(import.meta, "gallery.css");

/**
 * wall(cells) — the grid the cards sit in.
 *
 *     wall(() => this.children.forEach((page, name) =>
 *         page?.layout && card(this.nav_for(name), () => page.layout())))
 *         .style({ "--column": "18em" });
 *
 * Three indexes drew this grid, each with its own class string, and one of them
 * reached for `bleed` to get more room — which is edge to edge INCLUDING the
 * page's own inset, so the cards butted against the sidebar. The escape is
 * decided here now, once: `wide` takes the breakout tracks and stops at the
 * gutter, so no index can lose the gutter by picking a different word.
 *
 * Retune with `--column` (card width) and the `--thumb-*` pair below; the wall
 * counts its own columns from there.
 */
export function wall(cells){
	return div.c("gallery-wall wide", cells);
}

/**
 * card(nav, thumb, classes) — a preview card with a live render in it.
 *
 *     card(this.nav_for(name), () => page.layout());
 *
 * The thumbnail is INERT (`pointer-events: none`, gallery.css): a live render
 * inside a card that is itself a link would be an `<a>` in an `<a>` — invalid,
 * and the browser un-nests it. The label below is the only link; its `::after`
 * covers the card. `checkered` is the floor, so a render that paints no
 * background reads as unpainted rather than borrowing the card's white.
 *
 *   nav      { url, label, icon } — exactly what `Page.nav_for(name)` returns
 *   thumb    the render function, run while the stage is capturing
 *   classes  stage extras — a zoom, a pad. They go on the STAGE, inside the
 *            crop, so a `pad` is content-space padding and the thumb's own
 *            height range stays in page units whatever the zoom.
 *
 * **A cell is as tall as what it shows.** No page declares a size; the thumb
 * takes its render's natural height between `--thumb-min` and `--thumb-max`
 * (gallery.css), which is why a two-line component is a two-line card. The one
 * exception declares it ON ITS OWN PAGE — `card: "tall" | "wide" | "big"` — and
 * `nav_for()` carries it here like `icon`. It arrives as `.gallery-tall` etc.,
 * gallery's own classes, so the words mean what this module says they mean.
 */
export default function card(nav, thumb, classes = "zoom-25"){
	return div.c("page-preview gallery-card", () => {
		div.c("gallery-thumb checkered", () => div.c("gallery-stage " + classes, thumb));

		a.c("gallery-link").href(nav.url).append(() => {
			if (nav.icon) icon(nav.icon);
			span.c("page-preview-title", nav.label);
		});
	}).ac(nav.card && "gallery-" + nav.card);
}

export { card };
