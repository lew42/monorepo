import { div, a, span, h4, ul, li, icon } from "../../../core/View/View.js";

/**
 * Structured content: four pieces, each one decision.
 *
 *   iconCard({ name, icon, weight, href })   a big icon with its name below. weight 1 | 2 | 3
 *   section({ title, items, bg })            a titled row of 3–5 icon cards, heaviest first.
 *                                            bg: true → a background, so padding;
 *                                            bg: false → no background, no padding.
 *   outline(items, { bg })                   a nested list; an item is "text" or
 *                                            { name, icon?, children: [...] }
 *
 * The one rule: a background brings padding, no background brings none.
 */

const by_weight = (x, y) => (y.weight ?? 2) - (x.weight ?? 2);

export function iconCard({ name, icon: ic, weight = 2, href }){
	const el = href ? a : div;
	const card = el.c(`ux-content-icard w${weight}`, () => { if (ic) icon(ic); span(name); });
	if (href) card.attr("href", href);
	return card;
}

export function section({ title, items = [], bg = false }){
	return div.c(bg ? "card ux-content-section" : "ux-content-section", () => {
		if (title) h4(title);
		div.c("ux-content-icards", () => [...items].sort(by_weight).forEach(iconCard));
	});
}

export function outline(items = [], { bg = false } = {}){
	const list = xs => ul(() => xs.forEach(x => {
		if (typeof x === "string") return li(x);
		li(() => {
			span.c("ux-content-outline-name", () => { if (x.icon) icon(x.icon); span(x.name); });
			if (x.children?.length) list(x.children);
		});
	}));
	return div.c(bg ? "card ux-content-outline" : "ux-content-outline", () => list(items));
}

export default { iconCard, section, outline };
