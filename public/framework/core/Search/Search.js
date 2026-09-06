import { Page } from "../Page/Page.class.js";
import { AXES, AXIS_LABELS, AXIS_ORDER } from "./tags.js";

const ESCAPE_RE = /[.*+?^${}()|[\]\\]/g;
const escape_re = s => s.replace(ESCAPE_RE, "\\$&");

/**
 * Search — the site's corpus, and the ranking over it. No DOM at all: this is the
 * data tier, the same as core/Item and core/List, and `Omnibox.js` is the one UI
 * that draws it.
 *
 *   const search = new Search();
 *   await search.build();                  // ~1s: every page the Router can reach
 *   search.rank("columns").slice(0, 40);   // best first
 *
 * THE CORPUS IS THE ROUTER'S OWN WALK. Every row here was produced by `Page.load()`
 * — the exact call `Page.child()` makes when you navigate — so a row cannot promise
 * a url the Router then fails to open. The list of urls to try comes from
 * `/directory.json` (every directory that holds a `page.js`), because the site's
 * root deliberately declares no `children:` and there is nothing else to walk.
 * doc/corpus.md — including the two kinds of page this leaves out.
 */
export class Search {

	constructor(...args){
		this.rows = [];
		this.read = 0;        // pages loaded so far — the progress the UI shows
		this.candidates = 0;  // urls to try, known as soon as the listing lands
		this.assign(...args);
		this.filters = new this.constructor.Filters({ search: this });
	}

	assign(...args){ return Object.assign(this, ...args); }

	// ════ THE CORPUS ════════════════════════════════════════════════════════

	// One build per instance, however many times this is called — the promise IS
	// the guard. `watched` is called every `batch` pages and once at the end, so a
	// UI can draw partial results the moment the first of them land.
	build(watched){ return this.building ??= this.gather(watched); }

	async gather(watched){
		const before = this.snapshot();
		const queue = this.candidates_from(await this.listing());
		this.candidates = queue.length;

		// A pool, not `Promise.all` over the whole list: 838 dynamic imports fired at
		// once starve the very navigation the reader may be making while they arrive.
		await Promise.all(Array.from({ length: this.workers }, async () => {
			while (queue.length){
				const url = queue.shift();
				const page = await Page.load(url, 0).catch(() => null);

				// Not `instanceof Page` = a `page.js` whose default export is something
				// else (a bare function, the pre-Page sandboxes). Nothing to search.
				if (page instanceof Page) this.rows.push(this.row(page, url));

				if (++this.read % this.batch === 0) watched?.(this);
			}
		}));

		this.rows.sort((a, b) => a.url.localeCompare(b.url));
		this.done = true;
		this.check(before);
		watched?.(this);
		return this;
	}

	/* ⚠ IMPORTING A PAGE MODULE CHANGES THIS DOCUMENT. `View.stylesheet()` runs at
	 * module scope, so the build pulls ~70 page stylesheets into `<head>`, and a
	 * module can touch `<body>` outright. Both are harmless while every rule sits in
	 * one of the four layers `framework.css` declares — and immediately visible when
	 * one does not: a rule outside every layer, or inside a layer nobody declared,
	 * sorts AFTER all of them and beats every framework rule at any specificity.
	 * `/castin/main.css` opens `@layer theme_cm` and its `a { color: #212121 }`
	 * repainted every link on the site the first time anyone searched; `/arya/`
	 * re-themed the whole page with one class on `<body>` (both 2026-09-06).
	 *
	 * The pages that do it today are skipped by url in `skip` below. This is the
	 * guard for the next one: it cannot fix the sheet, but it refuses to let the site
	 * change colour silently. CLAUDE.md — "Every CSS rule inside a layer". */
	check(before){
		if (typeof document === "undefined") return [];

		const bad = [];

		// The other half of the same hazard: a module can touch the document
		// directly. `/arya/lib/Page.js` runs `app.$body.ac("arya")` at module scope,
		// and one class on <body> re-themed the whole site.
		[document.documentElement, document.body].forEach((el, i) => {
			if (el.className !== before.classes[i])
				bad.push(`<${el.tagName.toLowerCase()} class="${el.className}"> — a page module changed it at import`);
		});

		for (const sheet of document.styleSheets){
			if (!sheet.href || before.sheets.has(sheet.href)) continue;

			let rules;
			try { rules = sheet.cssRules; } catch { continue; }   // cross-origin: not ours

			for (const rule of rules){
				const kind = rule.constructor.name;
				if (kind === "CSSLayerStatementRule" || kind === "CSSImportRule") continue;

				const layer = kind === "CSSLayerBlockRule" ? rule.name : null;
				if (layer && this.constructor.LAYERS.includes(layer)) continue;

				bad.push(sheet.href.replace(location.origin, "")
					+ (layer ? ` — @layer ${layer}, which nothing declares` : " — a rule outside every layer"));
				break;
			}
		}

		if (bad.length) console.warn("Search: reading the site pulled in stylesheets that outrank every framework rule.\n  "
			+ bad.join("\n  ") + "\n  Put their rules in base/theme/site/util, or add the url to Search.prototype.skip.");

		return bad;
	}

	snapshot(){
		if (typeof document === "undefined") return { sheets: new Set(), classes: ["", ""] };
		return {
			sheets: new Set([...document.styleSheets].map(s => s.href)),
			classes: [document.documentElement.className, document.body.className],
		};
	}

	// The dev server writes this file on every change; production ships it built.
	listing(){ return fetch(this.source).then(res => res.json()); }

	// Every directory holding a `page.js`, minus the ones no url can walk to.
	candidates_from(data){
		const dirs = new Set();

		(function walk(nodes){
			for (const node of nodes ?? []){
				if (node.type !== "dir") continue;
				const kids = node.children ?? [];
				if (kids.some(k => k.type === "file" && k.name === "page.js")) dirs.add(`/${node.full}/`);
				walk(kids);
			}
		})(data.files);

		return [...dirs].filter(url => this.reachable(url, dirs));
	}

	// ⚠ The Router resolves a url ONE SEGMENT AT A TIME (`Router.load_segments`), so
	// a page dir whose parent has no `page.js` of its own is a url nothing can walk
	// to — 69 of them on this site, most inside the `core/new/1` sandbox.
	reachable(url, dirs){
		if (this.skip.some(prefix => url.startsWith(prefix))) return false;

		const segments = url.split("/").filter(Boolean);
		for (let i = 1; i < segments.length; i++)
			if (!dirs.has("/" + segments.slice(0, i).join("/") + "/")) return false;

		return true;
	}

	// One row per page: what a reader searches by, and nothing else. `tags` is the
	// page's own `tags:` prop — no page declares one yet, and the filter groups for
	// them stay hidden until some do (doc/filters.md).
	row(page, url){
		return {
			url,
			title: page.title,
			description: page.description ?? "",
			icon: page.icon,
			tags: page.tags ?? [],
			section: url.split("/").filter(Boolean)[0] ?? "",
			depth: url.split("/").filter(Boolean).length,
		};
	}

	// ════ RANKING ═══════════════════════════════════════════════════════════
	// Six tiers, best first, and the whole rule is: the TITLE answers if it can,
	// and only a title that says nothing lets the description answer. Explained,
	// with a live example of each, on /framework/core/Search/.

	static TIERS = [
		"the title IS what you typed",
		"the title starts with it",
		"a word in the title starts with it",
		"the title contains it",
		"the description contains it",
		"every word you typed is somewhere",
	];

	// The query, prepared once per keystroke rather than once per row.
	query(text){
		const needle = text.trim().toLowerCase();
		return {
			needle,
			start: needle && new RegExp("\\b" + escape_re(needle)),
			words: needle.split(/\s+/).filter(Boolean),
		};
	}

	// Which tier a row earns, or null for "not a match at all".
	tier(row, q){
		const title = row.title.toLowerCase();
		const description = row.description.toLowerCase();

		if (title === q.needle) return 0;
		if (title.startsWith(q.needle)) return 1;
		if (q.start.test(title)) return 2;
		if (title.includes(q.needle)) return 3;
		if (description.includes(q.needle)) return 4;
		if (q.words.length > 1 && q.words.every(w => title.includes(w) || description.includes(w))) return 5;

		return null;
	}

	/* Best first. An empty query is not "no results" — it is the whole site, nearest
	 * the front door first, so the box is a way to browse and not only to search. */
	rank(text){
		const rows = this.rows.filter(row => this.filters.match(row));
		const q = this.query(text);

		if (!q.needle) return rows.sort((a, b) => a.depth - b.depth || a.title.localeCompare(b.title));

		const scored = [];
		for (const row of rows){
			const tier = this.tier(row, q);
			if (tier !== null) scored.push({ row, tier });
		}

		// After the tier: the shortest title (the most exactly-about-this page), then
		// the shallowest url (a section beats a page buried inside it), then a-z.
		scored.sort((a, b) => a.tier - b.tier
			|| a.row.title.length - b.row.title.length
			|| a.row.depth - b.row.depth
			|| a.row.url.localeCompare(b.row.url));

		return scored.map(s => s.row);
	}
}

// Defaults on the prototype, so a caller overrides one by assign and none of them
// is an argument anybody has to pass.
Search.prototype.source = "/directory.json";
Search.prototype.workers = 12;   // parallel imports; 12 read 818 pages in ~1s
Search.prototype.batch = 40;     // pages between progress callbacks

// The four layers framework.css declares, in `check_sheets()`'s order-of-truth.
Search.LAYERS = ["base", "theme", "site", "util"];

/* The exclusions. Each is a citation, not a preference — delete the line when the
 * reason goes away.
 *
 * ⚠ `core/new/1/` is the prior-art sandbox — "read, never import" (the `code` skill),
 *   and one page in it throws at import ON PURPOSE. 264 page.js files, none of them
 *   a page anybody is looking for.
 * ⚠ The three personal sandboxes below ship CSS that breaks the layer law
 *   (CLAUDE.md): `/castin/main.css` opens an undeclared `@layer theme_cm`, and
 *   `/alex/styles.css`, `/alex/styles/html/toggle-switch.css` and
 *   `/edric/style/css/demo.css` are unlayered outright. Importing any of them
 *   repaints the whole site — links went #212121 and the body ground went #ddd,
 *   measured 2026-09-06. `/arya/`, `/michael/`, `/resume/` and `/fly/` are clean
 *   and are in the corpus. Fix the four sheets and these three lines go. */
Search.prototype.skip = ["/framework/core/new/", "/alex/", "/arya/", "/castin/", "/edric/"];

/* The facets. A group is a name and a way to read a row's values for it; a chip is
 * one value. Nothing is selected by default, and nothing selected means everything
 * — which is what "filters default to all" is, with no special case to write.
 *
 * Within a group the chips are OR (Framework or Imagine); between groups they are
 * AND (Framework AND docs). doc/filters.md. */
Search.Filters = class SearchFilters {

	constructor(...args){
		this.on = new Map();   // group name → Set of chosen values; absent or empty = all
		this.assign(...args);
	}

	assign(...args){ return Object.assign(this, ...args); }

	// A row's values for one group. Section is the first url segment, which EVERY
	// page has; each axis is the subset of the page's own `tags:` on that axis.
	values(group, row){
		if (group === "section") return [row.section || "home"];
		return row.tags.filter(tag => (AXES[tag] ?? "other") === group);
	}

	// Every group that has something to choose between, options counted from the
	// corpus and commonest first. A group with fewer than two options is not a
	// choice, so it does not render — which is exactly how the four tag axes stay
	// invisible until pages start declaring `tags:`, and appear on their own after.
	groups(){
		if (this.stamp === this.search.rows.length) return this.cache;

		this.stamp = this.search.rows.length;
		return this.cache = ["section", ...AXIS_ORDER]
			.map(group => ({ group, label: this.label(group), options: this.options(group) }))
			.filter(g => g.options.length > 1);
	}

	options(group){
		const counts = new Map();
		for (const row of this.search.rows)
			for (const value of this.values(group, row)) counts.set(value, (counts.get(value) ?? 0) + 1);

		return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
			.map(([value, count]) => ({ value, count, label: this.title(value) }));
	}

	label(group){ return group === "section" ? "Where" : AXIS_LABELS[group] ?? group; }

	title(value){ return value.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }

	// AND across groups, OR inside one. An empty set is not a filter.
	match(row){
		for (const [group, chosen] of this.on){
			if (!chosen.size) continue;
			if (!this.values(group, row).some(value => chosen.has(value))) return false;
		}
		return true;
	}

	chosen(group, value){ return !!this.on.get(group)?.has(value); }

	toggle(group, value){
		const set = this.on.get(group) ?? this.on.set(group, new Set()).get(group);
		set.has(value) ? set.delete(value) : set.add(value);
		return this;
	}

	// How many chips are lit — the number the "clear" control shows.
	count(){ return [...this.on.values()].reduce((n, set) => n + set.size, 0); }

	clear(){ this.on.clear(); return this; }
};

export default Search;
