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
		this.read = 0;
		this.candidates = 0;
		this.assign(...args);
		this.filters = new this.constructor.Filters({ search: this });
	}

	assign(...args){ return Object.assign(this, ...args); }

	// ════ THE CORPUS ════════════════════════════════════════════════════════

	build(watched){ return this.building ??= this.gather(watched); }

	async gather(watched){
		const before = this.snapshot();
		const queue = this.candidates_from(await this.listing());
		this.candidates = queue.length;

		await Promise.all(Array.from({ length: this.workers }, async () => {
			while (queue.length){
				const url = queue.shift();
				const page = await Page.load(url, 0).catch(() => null);

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

	// ⚠ IMPORTING A PAGE MODULE CAN CHANGE THE SITE: CSS outside declared layers or
	// module scope touching <body> silently outrank framework rules. check() detects it.
	// See doc/Search-notes.md.
	check(before){
		if (typeof document === "undefined") return [];

		const bad = [];

		[document.documentElement, document.body].forEach((el, i) => {
			if (el.className !== before.classes[i])
				bad.push(`<${el.tagName.toLowerCase()} class="${el.className}"> — a page module changed it at import`);
		});

		for (const sheet of document.styleSheets){
			if (!sheet.href || before.sheets.has(sheet.href)) continue;

			let rules;
			try { rules = sheet.cssRules; } catch { continue; }   // cross-origin sheets throw

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

	listing(){ return fetch(this.source).then(res => res.json()); }

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

	// ⚠ TRAP: not every page.js is reachable — parent must have page.js too.
	reachable(url, dirs){
		if (this.skip.some(prefix => url.startsWith(prefix))) return false;

		const segments = url.split("/").filter(Boolean);
		for (let i = 1; i < segments.length; i++)
			if (!dirs.has("/" + segments.slice(0, i).join("/") + "/")) return false;

		return true;
	}

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

	static TIERS = [
		"the title IS what you typed",
		"the title starts with it",
		"a word in the title starts with it",
		"the title contains it",
		"the description contains it",
		"every word you typed is somewhere",
	];

	query(text){
		const needle = text.trim().toLowerCase();
		return {
			needle,
			start: needle && new RegExp("\\b" + escape_re(needle)),
			words: needle.split(/\s+/).filter(Boolean),
		};
	}

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

	rank(text){
		const rows = this.rows.filter(row => this.filters.match(row));
		const q = this.query(text);

		if (!q.needle) return rows.sort((a, b) => a.depth - b.depth || a.title.localeCompare(b.title));

		const scored = [];
		for (const row of rows){
			const tier = this.tier(row, q);
			if (tier !== null) scored.push({ row, tier });
		}

		scored.sort((a, b) => a.tier - b.tier
			|| a.row.title.length - b.row.title.length
			|| a.row.depth - b.row.depth
			|| a.row.url.localeCompare(b.row.url));

		return scored.map(s => s.row);
	}
}

Search.prototype.source = "/directory.json";
Search.prototype.workers = 12;
Search.prototype.batch = 40;

Search.LAYERS = ["base", "theme", "site", "util"];

// Exclusions: see doc/Search-notes.md
Search.prototype.skip = ["/framework/core/new/", "/alex/", "/castin/", "/edric/"];

// Filters: see doc/Search-notes.md
Search.Filters = class SearchFilters {

	constructor(...args){
		this.on = new Map();
		this.assign(...args);
	}

	assign(...args){ return Object.assign(this, ...args); }

	values(group, row){
		if (group === "section") return [row.section || "home"];
		return row.tags.filter(tag => (AXES[tag] ?? "other") === group);
	}

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

	count(){ return [...this.on.values()].reduce((n, set) => n + set.size, 0); }

	clear(){ this.on.clear(); return this; }
};

export default Search;
