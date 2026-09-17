import { Page, md, div, a, span, h2, p } from "/app.js";
import { Site, manifest, layouts, slug, is_layout_id, layout_url, canonical_layout } from "../Site.js";

/**
 * One page per tag: every site in the corpus that carries it.
 *
 * The tag itself is free text — `2 column grid`, `hamburger at 940` — so the url
 * carries its slug (`2-column-grid`) and this page maps back. A tag that is also a
 * LAYOUT ID gets a link to `/layouts/<id>/`, the encyclopedia entry that defines
 * the word; the tag page is the evidence, the encyclopedia is the standard.
 *
 * A layout id can ALSO show up as a SECTION inside a page that is not that layout
 * globally — Wikipedia's infobox is `2-sidebar right` on a page whose own layout is
 * `3-holy-grail`. `index.mjs` keys those separately, in `m.sections`, so this page
 * draws a second list, "as a section, on:", whenever that key exists too.
 */
const TagPage = class extends Page {

	content(){
		div.c("wide flow", async $w => {
			// layouts() too: a tag that IS a layout id links to the entry defining it,
			// and the alias table is what resolves `3-cards` onto `3-equal`.
			const [m] = await Promise.all([manifest(), layouts()]);
			$w.append(() => { this.matches(m); });
		});
	}

	matches(m){
		const tag = Object.keys(m?.tags ?? {}).find(t => slug(t) === this.name);

		// A `sections` key may be an old or alternate word for this same id — `4-equal`
		// for `n-wall` — so every key resolving to this tag through the standard's own
		// alias table counts, not just an exact string match (layouts/page.js does the
		// same fold for its own "as a section, on:" list).
		const section_keys = Object.keys(m?.sections ?? {}).filter(k => slug(canonical_layout(k)) === this.name);
		const section_names = [...new Set(section_keys.flatMap(k => m.sections[k]))];

		if (!tag && !section_names.length) return md("No site carries the tag `" + this.name + "`. [Every tag](/websites/) is on the corpus front.");

		if (tag){
			const names = m.tags[tag];
			md.c("measure start", (names.length === 1 ? "One site in the corpus is tagged " : names.length + " sites in the corpus are tagged ")
				+ "**" + tag + "**."
				+ (is_layout_id(tag) ? " It is a layout id, so it has an entry in the standard: [" + tag + "](" + layout_url(tag) + ")." : ""));

			Site.wall(m.sites.filter(s => names.includes(s.name)));
		}

		if (section_names.length){
			h2("As a section, on:");
			p.c("site-filter-note", (section_names.length === 1 ? "One site uses " : section_names.length + " sites use ")
				+ "`" + this.name + "` inside the page — not as the whole layout.");
			Site.wall(m.sites.filter(s => section_names.includes(s.name)));
		}

		div.c("site-filter-note", () => { a("← every site").href("/websites/"); });
	}
};

export default new TagPage({
	meta: import.meta,
	title: "Tags",
	icon: "sell",
	description: "One page per tag — every site that shares a layout, a technique or a breakpoint.",

	/* Every name is a tag slug, resolved against the manifest — so this page's own
	 * children are whatever the corpus happens to be tagged with today. */
	route(name){
		if (name.includes(".")) return;
		return new TagPage({ title: name, icon: "sell", url: this.url + name + "/" });
	},

	// The index of the index: every tag, biggest first.
	content(){
		div.c("wide flow", async $w => {
			const m = await manifest();
			$w.append(() => { this.all(m); });
		});
	},

	all(m){
		if (!m?.tags) return md("No `site/index.json` yet — run `node public/websites/tools/index.mjs`.");

		md.c("measure start", "Every word the corpus is tagged with, most-shared first. A tag is free text, so anything worth clicking through can become one — a layout id, a CSS technique, a breakpoint, a mood.");

		div.c("site-taglist flex wrap gap", () => Object.entries(m.tags)
			.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
			.forEach(([tag, names]) => a.c("site-tag").href("/websites/tag/" + slug(tag) + "/")
				.append(() => { span.c("site-filter-label", tag); span.c("site-filter-count", String(names.length)); })));
	},
});
