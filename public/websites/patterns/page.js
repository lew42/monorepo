import { Page, View, md, div, a, span, h2, h3, p, table, thead, tbody, tr, th, td } from "/app.js";
import { manifest, layouts, tag_url, layout_url, canonical_layout, is_layout_id } from "../Site.js";

View.stylesheet(import.meta, "patterns.css");

/* ── /websites/patterns/ — what emerged from the corpus ────────────────────────
   LAYOUT, the five questions. Container: a top-level child of `/websites/`, which
   is NOT a columns host, so the ordinary page grid — the headline sits in `main`,
   everything with a size claims `wide`. Size: one column at 400; the counts wall is
   three panels, one across at 400, two at 1280, three from 1920 (`--column: 21em`).
   Own layout: `.grid.auto` for the wall, a two-track grid for a bar row, a plain
   `<table>` for the transitions. Regions: three — the headline, the wall, the table
   and the way in. Preview: the card `description` draws on `/websites/`.

   WHAT THIS PAGE IS FOR. A reader who has never opened the corpus should be able to
   say, out loud, what the web mostly does: how many columns a page has on a big
   screen, what it becomes on a phone, and which arrangements are worth copying.

   ⚠ EVERY NUMBER IS COUNTED HERE, AT RENDER, from `site/index.json`. Nothing on this
     page is typed — not in the headline, not in a bar, not in the table — so the page
     stays true as sites are added. If you find yourself writing a digit into prose,
     that is the bug.
   ⚠ An id is shown exactly as the record writes it, and linked through `layout_url()`,
     which folds the standard's aliases. No record spells an alias today — `3-cards` and
     `4-equal` were rewritten to `3-equal` and `n-wall` on 2026-09-08 — but the arrow stays,
     because the encyclopedia may rename an id at any time and the corpus follows by alias,
     not by a mass edit. When it does, this row says so instead of quietly disagreeing. */

const WIDE = "1920";      // the desktop reading — the widest width every record agrees on
const NARROW = "400";     // the phone

export default new Page({
	meta: import.meta,
	title: "Patterns",
	icon: "bar_chart",
	description: "What 47 real sites actually do, counted at 1920 and at 400.",

	/* THE JUDGMENTS, one click down, as `best.md` beside this file.
	   ⚠ `route()` rather than core's "a `.md` beside me IS a page" fallback: that
	     fallback only fires AFTER a probe for `best/page.js` 404s, and the 404 lands in
	     every reader's console. `/websites/doc/` moved to `route()` for exactly this
	     (three of them). Answered synchronously, so a cold deep link works too. */
	route(name){
		if (name !== "best") return null;
		const meta = this.meta;
		return {
			title: "The best of each kind",
			/* ⚠ `wide`, and the classes matter. Every verdict here is a paragraph AND a
			 * screenshot of the site it judges, and in the reading track the whole page
			 * was a 40em column hard left with 2700px of empty screen beside it at 3440,
			 * 11036px tall, with each 1920-wide screenshot squeezed to 700px and
			 * unreadable. `site-best` gives the sentences their 40em back and puts the
			 * picture beside them above 78em (patterns.css). */
			content(){ return md.file(meta, "best.md", { h1: false }).then(view => view.ac("site-best wide")); },
		};
	},

	content(){
		/* ⚠ No DOM after the await: the box is captured now and filled in the callback,
		   which re-establishes the captor. */
		div.c("wide flow", async $w => {
			const [m] = await Promise.all([manifest(), layouts()]);
			$w.append(() => { this.report(m); });
		});
	},

	report(m){
		const sites = m?.sites ?? [];
		if (!sites.length) return md("No `site/index.json` yet — run `node public/websites/tools/index.mjs`.");

		md.c("measure start", headline(sites));
		this.count_panels(m, sites);
		this.collapse_table(sites);
		this.best_link();
	},

	/* THE COUNTS, SHOWN. Three panels: the layout of a whole page, the layout of a
	   part inside one, and the tags the corpus shares most. A bar is a plain div with
	   a width — no chart library, and the number is beside it because a bar alone is
	   not a fact. */
	count_panels(m, sites){
		const pages = page_rows(sites);
		const page_max = Math.max(1, ...pages.map(r => Math.max(r.wide, r.narrow)));

		const sections = Object.entries(m.sections ?? {})
			.map(([id, names]) => ({ id, n: names.length }))
			.sort((a, b) => b.n - a.n || a.id.localeCompare(b.id));
		const section_max = Math.max(1, ...sections.map(r => r.n));

		const tags = Object.entries(m.tags ?? {})
			.map(([tag, names]) => ({ tag, n: names.length }))
			.sort((a, b) => b.n - a.n || a.tag.localeCompare(b.tag))
			.slice(0, 10);
		const tag_max = Math.max(1, ...tags.map(r => r.n));

		div.c("grid auto gap", () => {
			panel("A whole page", "How many sites use each arrangement for the page itself.", () => {
				legend();
				pages.forEach(row => {
					bar_row(row.id, layout_url(row.id), () => {
						bar(row.wide, page_max, "", tag_url(row.id));
						bar(row.narrow, page_max, "is-small", tag_url(row.id));
					});
				});
			});

			panel("A part inside a page", "The same ids, counted where they name a SECTION — a hero, a card row, an infobox.", () => {
				sections.forEach(row => {
					bar_row(row.id, layout_url(row.id), () => { bar(row.n, section_max, "", tag_url(row.id)); });
				});
			});

			panel("The ten most common tags", "A tag two sites share is what lets you walk sideways. Click one for every site that carries it.", () => {
				tags.forEach(row => {
					bar_row(row.tag, tag_url(row.tag), () => { bar(row.n, tag_max, "", null); });
				});
			});
		}).style("--column", "21em");
	},

	/* HOW THEY COLLAPSE. One row per transition, biggest first. A shaded row is one
	   that does not change between the two widths at all. */
	collapse_table(sites){
		const seen = {};
		sites.forEach(site => {
			const from = site.layout?.[WIDE], to = site.layout?.[NARROW];
			if (!from || !to) return;
			(seen[from + " > " + to] ??= []).push(site.name);
		});

		const rows = Object.entries(seen)
			.map(([key, names]) => ({ from: key.split(" > ")[0], to: key.split(" > ")[1], names }))
			.sort((a, b) => b.names.length - a.names.length || a.from.localeCompare(b.from));

		h2("How they collapse");
		p.c("measure start", "Every site read twice — once at 1920, once at 400 — and the move between the two counted. Where both columns say the same thing the layout did not move at all, and those rows are tinted.");

		table.c("site-pat-table", () => {
			thead(() => { tr(() => { th("at 1920"); th("at 400"); th("sites"); }); });
			tbody(() => {
				rows.forEach(row => {
					/* ⚠ Always a real class — `classList.add("")` throws. */
					tr.c(row.from === row.to ? "site-pat-same" : "site-pat-moved", () => {
						td(() => { a(row.from).href(layout_url(row.from)); });
						td(() => { a(row.to).href(layout_url(row.to)); });
						td(String(row.names.length));
					});
				});
			});
		});

		const holds = sites.filter(site => site.layout?.[NARROW] && !site.layout[NARROW].startsWith("1-"));
		p.c("measure start site-pat-holds", () => {
			span(holds.length === 1
				? "One site in the corpus still shows more than one column at 400: "
				: holds.length + " sites still show more than one column at 400: ");
			holds.forEach((site, i) => {
				if (i) span(i === holds.length - 1 ? " and " : ", ");
				a(site.name).href("/websites/" + site.name + "/");
				span(" (" + site.layout[NARROW] + ")");
			});
			span(". Everything else is a single column on a phone.");
		});
	},

	/* THE WAY IN. The judgments are prose, and prose is one click down — `best.md`
	   beside this file, which core/Page renders at `/websites/patterns/best/`. */
	best_link(){
		div.c("page-previews bleed", () => {
			a.c("page-preview").href(this.url + "best/").append(() => {
				span.c("page-preview-title", "The best of each kind");
				span.c("page-preview-desc", "One site per category, judged from its shots — then three layouts to copy and three to avoid.");
			});
		}).style("--column", "24em");
	},
});

/* ── THE SENTENCE, COUNTED ── the letters come from the data, every time. */
function headline(sites){
	const n = sites.length;
	const word = { 1: "are one column", 2: "are two", 3: "are three", 4: "are four" };

	const cols = {};
	sites.forEach(site => {
		const key = (site.layout?.[WIDE] ?? "?").split("-")[0];
		cols[key] = (cols[key] ?? 0) + 1;
	});

	const said = Object.keys(cols).sort().map((key, i) =>
		"**" + cols[key] + "** " + (word[key] ?? "are `" + key + "`") + (i === 0 ? " at 1920" : ""));
	const list = said.length > 1 ? said.slice(0, -1).join(", ") + " and " + said.at(-1) : said[0];

	const others = sites.filter(site => site.layout?.[NARROW] !== "1-flow");
	const one_column = others.filter(site => (site.layout?.[NARROW] ?? "").startsWith("1-"));
	const many = others.length - one_column.length;

	const phone = !others.length
		? "At 400 every one of them is `1-flow` — one column, each row the full width."
		: "At 400 all but **" + others.length + "** are `1-flow` — one column, each row the full width — and **"
			+ one_column.length + "** of those " + others.length + " are still a single column, so only **"
			+ many + "** of the " + n + " keep a second column on a phone.";

	return "Of **" + n + "** real websites, " + list + ". " + phone;
}

/* ── ONE ROW PER LAYOUT ID ── every id that appears at either width, counted at both. */
function page_rows(sites){
	const ids = new Set();
	sites.forEach(site => [WIDE, NARROW].forEach(w => { if (site.layout?.[w]) ids.add(site.layout[w]); }));

	const at = (id, w) => sites.filter(site => site.layout?.[w] === id).length;

	return [...ids]
		.map(id => ({ id, wide: at(id, WIDE), narrow: at(id, NARROW) }))
		.sort((a, b) => b.wide - a.wide || b.narrow - a.narrow || a.id.localeCompare(b.id));
}

/* ── THE PARTS ── plain functions, not Page methods: `bar` and `panel` are already
   method names on core's `Page/Frame.js`, and a page method by either name would
   shadow one for anything that ever mixes them. */
function panel(title, note, rows){
	div.c("site-pat-panel surface pad", () => {
		h3.c("site-pat-panel-head", title);
		p.c("site-pat-note muted", note);
		rows();
	});
}

function legend(){
	div.c("site-pat-legend muted", () => {
		span.c("site-pat-key", () => { span.c("site-pat-swatch"); span("at 1920"); });
		span.c("site-pat-key", () => { span.c("site-pat-swatch is-small"); span("at 400"); });
	});
}

function bar_row(label, href, bars){
	div.c("site-pat-row", () => {
		div.c("site-pat-id", () => {
			a(label).href(href);
			/* ⚠ Only a LAYOUT ID has an alias. The standard's table also folds trait
			   words onto layouts (`measure` → `1-centered`), and a tag panel showing
			   "measure → 1-centered" would claim the two are the same thing. */
			const canon = is_layout_id(label) ? canonical_layout(label) : label;
			if (canon !== label) span.c("site-pat-alias muted", " → " + canon);
		});
		div.c("site-pat-bars", () => { bars(); });
	});
}

function bar(count, max, kind, href){
	div.c("site-pat-bar " + kind, () => {
		div.c("site-pat-track", () => { div.c("site-pat-fill").style("--w", (count / max * 100) + "%"); });
		if (href && count) a.c("site-pat-n", String(count)).href(href);
		else span.c("site-pat-n muted", String(count));
	});
}
