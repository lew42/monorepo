import { Page, md, div, a, span, button } from "/app.js";
import { Site, manifest, known, layouts, slug, short_title } from "./Site.js";

/* Warm the manifest at module eval, so a deep link to `/websites/stripe/` has the
 * list in hand by the time `route()` is asked for a name. Same move as
 * `framework/ai/<date>/page.js`'s `warm()`, for the same reason. */
manifest();
layouts();

// Real directories, so `route()` never turns one into an empty site page.
const dirs = new Set(["site", "tools", "doc", "tag"]);

export default new Page({
	meta: import.meta,
	title: "Websites",
	icon: "public",
	description: "Real sites, shot at four widths and tagged by their layout.",

	children: "patterns tag doc",

	/* Every other name is a SITE, built from its own json — the record is the page,
	 * the same way an `AITask` is built from a task dir's log. Left undeclared on
	 * purpose: a name in `children:` skips `route()` entirely.
	 * ⚠ A name with a dot is a file (`site/index.json`, a `.jpg`), never a page. */
	route(name){
		if (name.includes(".") || dirs.has(name)) return;
		// The record's own title (brand suffix trimmed) when the manifest is already
		// here, the url slug when it is not (a cold deep link) — either way the page
		// works, and `Site.retitle()` corrects a cold slug once its own fetch lands.
		const known_title = known()?.sites.find(s => s.name === name)?.title;
		return new Site({
			title: known_title ? short_title(known_title) : name,
			icon: "web",
			url: this.url + name + "/",
			src: this.url + "site/" + name + ".json",
		});
	},

	content(){
		md("Real websites, photographed at 400, 1280, 1920 and 3440 pixels wide, then measured and tagged by the layout they use. Click a tag to see every other site that shares it — [`/layouts/`](/layouts/) is the standard that names each arrangement, and [the docs](/websites/doc/) say how a site gets added.");

		md("**[What emerged →](/websites/patterns/)** — every one of these sites counted at 1920 and at 400: the most common layouts, how they collapse, and the best of each kind.");

		div.c("wide flow", async $w => {
			const m = await manifest();
			$w.append(() => { this.corpus(m); });
		});
	},

	/* THE FILTER ROW AND THE WALL. Nothing here persists — click a tag and the wall
	 * narrows, reload and every site is back. A demo is the page it is.
	 * ⚠ `corpus`, not `browse`: `ext/catalog/browse.js` patches `browse()` onto every
	 *   Page, and shadowing a core method never warns. */
	corpus(m){
		if (!m?.sites?.length) return md("No `site/index.json` yet — run `node public/websites/tools/index.mjs`.");

		/* ONLY THE TAGS THAT ACTUALLY NARROW THE WALL, most-shared first — a chip here
		 * is a CONTROL, and a control that changes nothing is worse than no control.
		 * Both ends are cut:
		 *   too rare — a tag exactly one site carries filters the wall down to that one
		 *     card, which the card itself already does, and all 26 of them stood 400px
		 *     tall on a phone, pushing every site below the fold on the page whose whole
		 *     job is to show them.
		 *   too common — `1-flow` is carried by 45 of the 47 (nearly every site on earth
		 *     is one column on a phone), so clicking it removes two cards and looks
		 *     broken. It is still a real tag with a real page; it is just not a filter.
		 * The full list, both ends included, is one click away at `/websites/tag/`. */
		const common = m.sites.length * 0.8;
		const tags = Object.entries(m.tags)
			.filter(([, names]) => names.length > 1 && names.length < common)
			.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
			.slice(0, 12);
		const chips = [];
		let active = null, $wall;

		const chip = (label, tag, count) => {
			const $chip = button.c("site-filter-chip").append(() => {
				span.c("site-filter-label", label);
				if (count != null) span.c("site-filter-count", String(count));
			}).on("click", () => {
				active = active === tag ? null : tag;
				chips.forEach(([$c, t]) => $c.el.classList.toggle("is-on", t === active));
				draw();
			});
			chips.push([$chip, tag]);
		};

		const draw = () => {
			const shown = active ? m.sites.filter(s => s.tags.includes(active)) : m.sites;
			$wall.empty(() => {
				if (active) div.c("site-filter-note", () => {
					span.c("muted", shown.length + " of " + m.sites.length + " sites carry this tag — ");
					a("open its own page").href("/websites/tag/" + slug(active) + "/");
				});
				Site.wall(shown);
			});
		};

		div.c("site-filter flex wrap gap v-center", () => {
			chip("all " + m.sites.length, null);
			tags.forEach(([tag, names]) => chip(tag, tag, names.length));
			a.c("site-filter-more", "every tag →").href("/websites/tag/");
		});

		$wall = div.c("site-wall-box");
		draw();
	},
});
