import { weight as page_weight } from "./weight/weight.js";

// One weight for anything: a url (a page), an object with a `url`, or an object with a number `weight` (an Item, a card). 1 when it has none. (readme.md, doc/design.md)
export default class PageWeight {

	static TIERS = 3;   // sizes w1..w3, matching ux/Content icards (content.css)
	static BIG = 10;    // past this, the thing renders bigger, not only first

	static async of(target){
		if (typeof target === "number") return target;
		if (typeof target === "string") return (await page_weight(target)).weight;
		if (typeof target?.weight === "number") return target.weight;
		if (target?.url) return (await page_weight(target.url)).weight;
		return 1;
	}

	static tier(w){ return Math.max(1, Math.min(this.TIERS, Math.round(w))); }
	static big(w){ return w > this.BIG; }
	static classes(w){ return `w${this.tier(w)}${this.big(w) ? " weighty" : ""}`; }

	// [{ target, weight }] heaviest first (a stable sort: equal weights keep their order), dropping any under `min`.
	static async rank(targets, { min = 0, key = t => t } = {}){
		const rows = await Promise.all([...targets].map(async target => ({ target, weight: await this.of(key(target)) })));
		return rows.filter(row => row.weight >= min).sort((a, b) => b.weight - a.weight);
	}

	// Rank the cards already drawn in `box` (a View) by the page url each links to: reorder, hide the light ones, stamp the size classes.
	static async apply(box, { min = 0 } = {}){
		const cards = [...box.el.querySelectorAll(":scope > .page-preview")]
			.map(el => ({ el, url: el.querySelector("a.page-preview-link")?.getAttribute("href") }));

		const rows = await this.rank(cards, { min: 0, key: card => card.url });
		for (const { target, weight } of rows){
			const { el } = target;
			el.classList.add(...this.classes(weight).split(" "));
			el.title = `weight ${weight}`;
			el.hidden = weight < min;
			box.el.append(el);
		}
		return rows;
	}
}
