/* ── THE WIREFRAME DRAWER ──────────────────────────────────────────────────────
   Draws a layout with no content in it: boxes with a background, a hairline where a
   section contributes to the layout, bars where text would be, a placeholder image,
   a button. The drawing IS the layout — real flex and real grid, at a real viewport
   width — so what you see is what the CSS does, not a picture of it.

   HOW IT SCALES. The drawing is built at its true size (1920 x 1080 px, say) and the
   whole thing is then shrunk to whatever box it was given:

       .std-frame   container-type: inline-size; aspect-ratio: var(--w) / var(--h)
       .std-draw    width: calc(var(--w) * 1px); zoom: calc(100cqw / (var(--w) * 1px))

   A container query UNIT read by a child, never a container query on the drawing
   itself — a container query cannot restyle its own container, and that mistake has
   shipped whole invisible pages in this repo. Verified headless 2026-09-08: a 16em
   rail drawn at 1920 into a 300px frame measures exactly 40.0px, and the same rail
   drawn at 400 into a 120px frame measures 76.8px.

   ⚠ `.std-draw` pins `font-size: 16px`. The site's body size is a viewport clamp
     (14px → 18px), so without the pin a `16em` sidebar would be 288px wide inside a
     drawing labelled 1920 — on an ultrawide screen the picture would lie.

   ⚠ This class is NOT a View subclass, on purpose. `View.classify()` mints a CSS
     class from every constructor name in the chain, so `class Layout extends View`
     would wear `.layout` — ext/layout's namespace, 86 rules deep. It builds views
     with the element factories instead.

   The spec it draws is JSON so that a model can write one from a screenshot. The
   spec, field by field: doc/wire.md.                                             */

import { View, div, a, span, b } from "/app.js";

View.stylesheet(import.meta, "layouts.css");

/* ── THE DATA ──────────────────────────────────────────────────────────────────
   layouts.json is the authority; every page under /layouts/ reads it through here,
   so no two pages can disagree about what a layout is. Fetched once, then shared.
   ⚠ The url resolves against `import.meta`, never the document — the SPA fallback
     makes the document url the current route, so `./layouts.json` from a deep page
     would ask the wrong directory. */

let loading;

export const load = () => loading ??= fetch(new URL("./layouts.json", import.meta.url)).then(res => res.json());

// A tag, a word or an id as one url segment: lowercase, everything else a dash.
export const slug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// An id, or any of its aliases — `/layouts/3-cards/` finds `3-equal` and says so.
export const find = (data, id) => data.layouts.find(entry => entry.id === id)
	?? data.layouts.find(entry => entry.aliases?.some(alias => slug(alias) === slug(id)));

/* Every layout carrying a tag. An ID (or an alias of one) counts as a tag on itself,
   so `/layouts/tag/4-equal/` and `/layouts/tag/2-sidebar/` answer instead of 404ing —
   the corpus next door writes ids into its own tag lists, and a reader who clicks one
   there and edits the url should land somewhere true. */
export const tagged = (data, tag) => data.layouts.filter(entry =>
	entry.tags.some(t => slug(t) === slug(tag)) || slug(entry.id) === slug(tag)
	|| entry.aliases?.some(alias => slug(alias) === slug(tag)));

// Is this name a real tag written on an entry, rather than an id borrowed as one?
export const is_tag = (data, tag) => data.layouts.some(entry => entry.tags.some(t => slug(t) === slug(tag)));

/* Every tag in the corpus with how many layouts carry it, most-used first — so the
   tag row reads as a ranking of what this standard actually says, rather than as an
   alphabet a reader has to scan. */
export const all_tags = data => {
	const count = new Map();
	data.layouts.forEach(entry => entry.tags.forEach(tag => count.set(tag, (count.get(tag) ?? 0) + 1)));
	return [...count].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([tag, n]) => ({ tag, n }));
};

// The tree's rows: 1, 2, 3, 4 — then `n`, the layouts whose count is not a number.
export const numbers = data => [...new Set(data.layouts.map(entry => entry.n))]
	.sort((a, b) => (a === "n") - (b === "n") || a - b);

export const word_of = (data, word) => data.words.find(w => slug(w.word) === slug(word));

/* ── THE DRAWER ───────────────────────────────────────────────────────────────── */

export default class Layout {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* The three widths the standard draws at — a phone, a desktop, an ultrawide. The
	   same viewports the /websites/ corpus screenshots at, so a drawing and a real
	   shot of a real site can sit side by side and be compared honestly. */
	static WIDTHS = [
		{ w: 400,  h: 844,  label: "400",  means: "a phone" },
		{ w: 1920, h: 1080, label: "1920", means: "a laptop or a desktop" },
		{ w: 3440, h: 1440, label: "3440", means: "an ultrawide" },
	];

	// The fixed role list. A wire spec may use no other word — doc/wire.md.
	static ROLES = "page header nav main aside footer hero cards card text image button".split(" ");

	// What each role puts inside itself when the spec does not say. The paint is CSS,
	// one rule per role in layouts.css, so a role is one word in two places and no more.
	static ROLE = {
		page:   { fill: "none" },
		header: { fill: "topbar" },
		nav:    { fill: "links" },
		hero:   { fill: "hero" },
		main:   { fill: "text", lines: 6 },
		aside:  { fill: "links" },
		footer: { fill: "links" },
		cards:  { fill: "cards" },
		card:   { fill: "card" },
		text:   { fill: "text", lines: 6 },
		image:  { fill: "none" },
		button: { fill: "none" },
	};

	/* ONE DRAWING, AT ONE WIDTH. `zoom` does the shrinking; the frame's aspect-ratio
	   gives the shrunk box a height without anyone measuring anything, so this works
	   in a hidden tab, in a screenshot and before fonts load. */
	frame({ w, h }){
		return div.c("std-frame", () => {
			div.c("std-draw", () => { this.box(this.wire ?? { role: "page" }, "col"); });
		})
			.style({ "--w": w, "--h": h })
			.attr("role", "img")
			.attr("aria-label", `${this.id ?? "This layout"} drawn at ${w} pixels wide`);
	}

	/* ONE BOX. `dir` is the direction its PARENT lays out in, which is what decides
	   whether this box is sized across a row or down a column. */
	box(node, dir){
		const role = Layout.ROLES.includes(node.role) ? node.role : "main";
		const spec = { ...Layout.ROLE[role], ...node };

		const $box = div.c("std-box std-" + role, () => { this.inside(spec); }).attr("title", role);

		if (spec.tone) $box.ac("std-tone-" + spec.tone);
		if (spec.scroll) $box.ac("std-scroll");

		// A wall counts its own tracks and a newspaper flows text through its own
		// columns. Both ARE the layout, so they go on the box, not on its children.
		if (spec.column) $box.style("--std-column", spec.column);
		if (spec.columns) $box.ac("std-newspaper").style("columns", spec.columns);

		return this.size($box, spec, dir);
	}

	/* SIZING — the one piece of arithmetic in the file.

	   ACROSS A ROW: a number is a share of the leftover (`flex: n 1 0`), a string is
	   a measured track (`flex: 0 1 16em`). Either basis is wrapped in a `max()` with
	   the STACK TERM — `(floor - 100%) * 999` — which is a huge positive length below
	   the floor and a negative one above it. Below the floor every child's basis is
	   wider than the row, so every child wraps onto its own line and shrinks back to
	   full width. That is the stack, in one expression, with no media query anywhere.

	   `stack: 2` CAPS how far it falls. A real footer often keeps two columns on a
	   phone instead of going to one, so the huge term is `min()`ed with an n-th of the
	   row: below the floor each child's basis is just under half the line and the row
	   breaks two-up. With no `stack` written the min() is not there at all and the
	   expression is byte-for-byte the one above — which is why the twelve wires in
	   layouts.json draw identically.

	   DOWN A COLUMN: a height is a height, and a box with none takes what is left. */
	size($box, spec, dir){
		const stack = spec.floor === "none" ? null : this.term(spec);

		if (dir === "row"){
			const fixed = typeof spec.w === "string";
			const basis = fixed ? spec.w : "0px";
			return $box.style("flex", `${fixed ? 0 : spec.w ?? 1} 1 ${stack ? `max(${basis}, ${stack})` : basis}`);
		}

		return $box.style("flex", spec.h ? `0 0 ${spec.h}` : "1 1 0");
	}

	/* THE STACK TERM. Huge and positive below the floor, negative above it — so a
	   `max()` against the basis switches at exactly the floor with no media query.
	   `stack: n` clamps the positive side to an n-th of the row (less the gaps, less
	   a pixel so rounding can never push the n-th item onto its own line). */
	term(spec){
		const floor = `calc((${spec.floor ?? "34rem"} - 100%) * 999)`;
		const to = Number(spec.stack ?? 1);
		if (!(to > 1)) return floor;
		return `min(${floor}, calc((100% - ${to - 1} * var(--std-gap)) / ${to} - 1px))`;
	}

	/* WHAT IS IN THE BOX. A spec with `kids` is a container, and its fill is whatever
	   its children draw. Everything else gets its role's own filler. */
	inside(spec){
		if (spec.kids) return this.kids(spec);
		if (spec.fill === "cards" || spec.column) return this.cards(spec);
		return this[spec.fill]?.(spec);
	}

	/* A container's children. `floor` and `stack` are inherited by the children,
	   because both are properties of the ROW (when does it break, and into how many
	   columns) while the children are the ones who have to carry the term that makes
	   it happen. A child that writes its own wins. */
	kids(spec){
		const dir = spec.dir === "row" ? "row" : "col";
		const down = this.inherit(spec);

		return div.c("std-kids std-" + dir + (spec.center ? " std-center" : ""), () => {
			spec.kids.forEach(kid => this.box({ ...down, ...kid }, dir));
		});
	}

	// The fields a row hands down to every child it holds.
	inherit(spec){
		const down = {};
		if (spec.floor !== undefined) down.floor = spec.floor;
		if (spec.stack !== undefined) down.stack = spec.stack;
		return down;
	}

	// A wall (`column` set) counts its own tracks. A plain card row is a wrapping row.
	cards(spec){
		const n = spec.n ?? 3;
		const wall = Boolean(spec.column);

		return div.c(wall ? "std-kids std-wall" : "std-kids std-row", () => {
			for (let i = 0; i < n; i++)
				this.box({ role: "card", ...this.inherit(spec) }, wall ? "wall" : "row");
		});
	}

	/* ── THE FILLERS ── content-free by design: bars where the words go, a crossed
	   rectangle where a picture goes, a pill where a button goes. Nothing readable,
	   so the eye reads the ARRANGEMENT and nothing else. */

	// A run of text: near-full-width bars, every fifth one short, the way a paragraph ends.
	text(spec){
		return div.c("std-lines", () => {
			for (let i = 0; i < (spec.lines ?? 6); i++) this.bar((i + 1) % 5 === 0 ? 55 : 88 + (i * 7) % 12);
		});
	}

	// A list of links — a nav column, an aside, a footer.
	links(spec){
		return div.c("std-lines", () => {
			for (let i = 0; i < (spec.lines ?? 4); i++) this.bar(52 + (i * 13) % 34);
		});
	}

	// A site header: a mark on the left, a few links on the right.
	topbar(){
		return div.c("std-topbar", () => {
			div.c("std-mark");
			div.c("std-navlinks", () => { for (let i = 0; i < 4; i++) div.c("std-navlink"); });
		});
	}

	// The first band: one big claim, two lines under it, one button.
	hero(){
		return div.c("std-hero-in", () => {
			div.c("std-claim");
			this.bar(62);
			this.bar(48);
			div.c("std-button");
		});
	}

	// A card's insides: a picture, then a heading and two lines.
	card(){
		return div.c("std-card-in", () => {
			div.c("std-image");
			div.c("std-lines", () => { this.bar(70); this.bar(94); this.bar(60); });
		});
	}

	// One line of wireframe text. `%`, so it scales with the box it is in.
	bar(pct){ return div.c("std-bar").style("width", pct + "%"); }

	/* ── THE FOUR SHARED VIEWS ─────────────────────────────────────────────────
	   A thumbnail, one width of a drawing, a tag row and a strip of chips. They
	   live HERE — not in `page.js` — because `/layouts/tag/` needs three of them
	   and importing its own parent would be a parent↔child cycle (works all
	   session, breaks on the first deep reload), and because `/websites/Site.js`
	   needs `shot()` too: a SIBLING tier, reached by importing this absolute url
	   rather than copying the class. Imports flow down within a tier; across
	   tiers, an absolute `/layouts/Layout.js` import is how reuse works instead. */

	// One layout in a wall: its picture at 1920, its id, and when to reach for it.
	static thumb(entry){
		return a.c("std-thumb").href("/layouts/" + entry.id + "/").append(() => {
			new Layout({ wire: entry.wire, id: entry.id }).frame(Layout.WIDTHS[1]);
			span.c("std-thumb-id", entry.id);
			span.c("std-thumb-say", entry.when);
		});
	}

	/* ONE WIDTH OF A DRAWING, labelled. `--a` is the drawing's aspect ratio and the
	   CSS (`.std-shot`) uses it as the flex GROW with a zero basis, so widths at
	   400 / 1920 / 3440 come out proportional to their aspects — which is the same
	   as saying every frame in the row lands the same height, with no measuring.
	   Shared by a layout's own page (three widths of the standard's own drawing)
	   and a site record's page (three widths of that SITE'S wire, once it has one). */
	static shot({ wire, id }, size){
		return div.c("std-shot", () => {
			div.c("std-shot-label", () => {
				b(size.label);
				span(" · " + size.means);
			});
			new Layout({ wire, id }).frame(size);
		}).style("--a", (size.w / size.h).toFixed(3));
	}

	// Every tag in the standard, biggest first, with `active` lit.
	static tag_row(data, active){
		return div.c("std-tags", () => {
			all_tags(data).forEach(({ tag, n }) => {
				const $chip = a.c("std-tag").href("/layouts/tag/" + slug(tag) + "/").append(() => {
					span(tag);
					span.c("std-tag-n", String(n));
				});
				if (slug(tag) === slug(active ?? "")) $chip.ac("std-tag-on");
			});
		});
	}

	// A named list of tags, no counts — a layout's own row, a recipe's technique.
	static chips(tags){
		return div.c("std-tags", () => {
			tags.forEach(tag => a.c("std-tag")
				.href("/layouts/tag/" + slug(tag) + "/")
				.append(() => { span(tag); }));
		});
	}
}
