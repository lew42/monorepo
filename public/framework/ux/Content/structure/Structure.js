import { div, a, span, h4, ul, ol, li, strong, small, icon } from "../../../core/View/View.js";

/**
 * Structured content: four pieces, each one decision.
 *
 *   iconCard({ name, icon, weight, href })   a big icon with its name below. weight 1 | 2 | 3
 *   section({ title, items, bg })            a titled row of icon cards, heaviest first.
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

/* cards(items) — a few things side by side, each a gist card: big icon, name, one line,
   a link. The columns share the row evenly, so 4 cards are 4 across, never 3 and an orphan.
   Promoted from ai/overview.js (the ai-page task, 2026-09-30). */
export function cards(items){
	return div.c("wide", () => items.forEach(it => card(it)))
		.style({ display: "grid", gap: "var(--gap, 1rem)", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 13rem), 1fr))` });
}
export function card({ name, icon: ic, gist, href }){
	return a.c("card flex v gap-35").attr("href", href ?? "#")
		.style({ textDecoration: "none", color: "var(--ink)" })
		.append(() => {
			if (ic) icon(ic).style({ fontSize: "2rem" });
			span(name).style({ fontWeight: "700" });
			if (gist) small.c("muted", gist);
		});
}

/* flow(steps) — things that happen in order: numbered, each [name, href, one line]. */
export function flow(steps){
	return ol.c("flex v gap-35", () => steps.forEach(([name, href, text]) =>
		li(() => { (href ? a(name).attr("href", href) : strong(name)).style({ fontWeight: "700" }); span(" — " + text); })));
}

export default { iconCard, section, outline, cards, card, flow };
