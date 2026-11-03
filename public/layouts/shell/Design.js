import { div, a, span, p, h2, h3, details, summary, icon } from "/app.js";

/* ── /layouts/shell/Design.js — a homepage as DATA, and the one drawer that reads it ──

   A design in this lab is a plain object: which bands the page has, and what is in
   them. `Design` is the only thing that turns one into DOM, so eight designs cost
   eight small objects and no eighth copy of the markup.

   WHY DATA AND NOT MARKUP. The whole point of the tree is that a child design
   differs from its parent by ONE thing. If each design wrote its own markup you
   could not say what the one thing was — you would have to diff two files. As data,
   the change IS the line: `derive(home, { hero: null })` subtracts the hero, and
   there is nowhere else for a second difference to hide.

   EVERY BAND IS A METHOD, which is the answer to the owner's question in
   `doc/pages.md`: a page renders its parts with its own methods, and a design that
   wants a different hero overrides `hero()` instead of forking the file.          */

const is_plain = value => !!value && typeof value === "object" && !Array.isArray(value);

/* ── DERIVE — the one mechanism, and the whole of it ──────────────────────────
   A child design is its parent's object with one key changed. The merge is ONE
   LEVEL deep, so `derive(home, { hero: { fold: "…" } })` changes the fold and keeps
   the hero's words — without that every change would have to restate the band it
   touches, and "one change" would stop being readable.

   ⚠ It is a COPY, never a mutation: the parent object is shared by every design
     under it, so writing into it would change designs that were already drawn.
   ⚠ It does NOT carry `children`, `title`, `meta` or any other page key, because a
     spec holds none of those — the page config is the other half of a design file,
     and it is written out every time on purpose. A child that inherited its
     parent's `children:` would declare its parent's siblings as its own.
   ⚠ Below one level it is still a reference: `derive(home, { wall: { count: 3 } })`
     keeps the parent's `wall.cards` ARRAY, the same array object. That is fine
     while nothing mutates a spec — and nothing here does — but it is the reason a
     change is written as a replacement (`{ cards: [...] }`) rather than a push.  */
export function derive(parent, changes){
	const next = { ...parent };

	for (const [key, value] of Object.entries(changes))
		next[key] = is_plain(value) && is_plain(parent[key]) ? { ...parent[key], ...value } : value;

	return next;
}

/* THE PAGE CONFIG a design file hands to `new Page(…)`. Eight files would otherwise
   each write the same two lines; the rest of the config — title, `children:`,
   `meta` — stays in the file, where a reader looks for it. */
export function design(spec, config){
	return {
		spec,
		icon: "web",
		content(){ return new Design({ spec: this.spec, page: this }).draw(); },
		...config,
	};
}

/* ── THE DRAWER ──────────────────────────────────────────────────────────────
   ⚠ `spec` and `page` are the ONLY assigned fields, and that is deliberate: every
     band is a METHOD with the same name as its spec key (`hero()` reads
     `spec.hero`), so assigning the spec's keys onto `this` would overwrite the
     methods with data and nothing would throw. One field, one dot.               */
export default class Design {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* The bands, in order. A band whose spec key is `null` draws nothing at all —
	   that is what "subtract one thing" means here. */
	draw(){
		this.topbar();
		this.hero();
		this.middle();
		this.band();
		this.footer();
		this.changed();
	}

	/* ── the bands ── every one of them `bleed`, because a band is paint: it may
	   butt the viewport's edge. Its words never do — they sit in `.std-shell-in`,
	   which restores the page's own gutter so every band shares one left edge. */

	topbar(){
		const bar = this.spec.nav;
		if (!bar) return;

		return div.c("std-shell-band std-shell-topbar bleed", () => {
			div.c("std-shell-in std-shell-topbar-in", () => {
				span.c("std-shell-brand", bar.brand);
				div.c("std-shell-topbar-links", () => {
					bar.links.forEach(([label, href]) => a.c("std-shell-navlink", label).href(href));
				});
			});
		});
	}

	hero(){
		const hero = this.spec.hero;
		if (!hero) return;

		return div.c("std-shell-band std-shell-hero bleed", $hero => {
			$hero.style("--std-shell-fold", hero.fold);

			div.c("std-shell-in std-shell-hero-in" + (hero.split ? " std-shell-hero-split" : ""), () => {
				div.c("std-shell-hero-words", () => {
					span.c("std-shell-eyebrow", hero.eyebrow);
					h2.c("std-shell-hero-title", hero.title);
					p.c("std-shell-hero-say", hero.say);
					this.acts(hero.acts);
				});

				if (hero.split) this.picture();
			});
		});
	}

	acts(acts = []){
		return div.c("std-shell-acts", () => acts.forEach(([label, href, prim]) =>
			a.c("std-shell-act" + (prim ? " std-shell-act-prim" : "")).href(href).append(() => {
				span(label);
				if (prim) icon("arrow_forward");
			})));
	}

	/* The split hero's second half. A real picture would be a photograph nobody
	   here owns, so it is the site's own mark, drawn large — honest content, and
	   it holds its shape at any width the viewport can be. */
	picture(){
		return div.c("std-shell-hero-art", () => { div.c("logo").attr("aria-hidden", "true"); });
	}

	/* THE MIDDLE BAND — the wall, and the rail beside it when a design adds one.
	   One band rather than two, because the rail and the wall share a row: adding
	   a rail must not also add a band. */
	middle(){
		if (!this.spec.wall && !this.spec.aside) return;

		return div.c("std-shell-band std-shell-middle bleed", () => {
			div.c("std-shell-in std-shell-middle-in" + (this.spec.aside ? " std-shell-has-aside" : ""), () => {
				if (this.spec.wall) this.wall();
				if (this.spec.aside) this.aside();
			});
		});
	}

	wall(){
		const wall = this.spec.wall;

		/* THE COLUMN COUNT IS WRITTEN OUT, never derived from a card width, and that
		   is a decision this site already paid for once: `/layouts/practice/catalog/`
		   measured an `auto-fill` wall sitting on five columns from 2800 to 3360 with
		   a last row of two, and this one sat on five with a last row of ONE at 1920
		   before the ladder was written. A wall of six cards steps 1 · 2 · 3 · 6 —
		   every one a divisor of six, so no row is ever short at any width.

		   ⚠ `--std-shell-count` is written on the COLUMN, not on the wall. Both need
		     it — the wall to write its tracks, the column to cap itself — and a custom
		     property inherits DOWN, so the column is the only place both can read it.
		   ⚠ A runtime token override is the one case the css skill allows an inline
		     style for, and `.style()` here is a STATEMENT: a captured callback's
		     return value is appended too, which would MOVE the box it just placed. */
		return div.c("std-shell-wall-col", $col => {
			$col.style("--std-shell-count", String(wall.count));

			h2.c("std-shell-band-title", wall.title);
			p.c("std-shell-band-say", wall.say);

			div.c("std-shell-wall std-shell-wall-count grid gap", () => {
				wall.cards.forEach(card => this.card(card));
			});
		});
	}

	card(card){
		return a.c("std-shell-card").href(card.href).append(() => {
			h3.c("std-shell-card-title", card.title);
			p.c("std-shell-card-say", card.say);
		});
	}

	/* The rail a design ADDS beside the wall. Links, not cards — a rail's job is to
	   be a list you can scan, and a card in a 14em track is a card that clips. */
	aside(){
		const aside = this.spec.aside;

		return div.c("std-shell-aside", () => {
			h3.c("std-shell-aside-title", aside.title);
			div.c("std-shell-aside-links", () => {
				aside.links.forEach(([label, href]) => a.c("std-shell-navlink", label).href(href));
			});
		});
	}

	/* A BAND A DESIGN ADDS. Always dark in both colour schemes, so it declares
	   `color-scheme: dark` in the sheet — without that line the alpha rungs inside
	   it would resolve to the LIGHT mode's black-on-dark (framework.css). */
	band(){
		const band = this.spec.band;
		if (!band) return;

		return div.c("std-shell-band std-shell-quote bleed", () => {
			div.c("std-shell-in std-shell-quote-in", () => {
				p.c("std-shell-quote-text", band.quote);
				p.c("std-shell-quote-who", band.who);
			});
		});
	}

	footer(){
		const foot = this.spec.footer;
		if (!foot) return;

		return div.c("std-shell-band std-shell-footer bleed", () => {
			div.c("std-shell-in", () => {
				div.c("std-shell-foot-cols", () => {
					foot.groups.forEach(([title, links]) => div.c("std-shell-foot-col", () => {
						h3.c("std-shell-foot-title", title);
						links.forEach(([label, href]) => a.c("std-shell-navlink", label).href(href));
					}));
				});
			});
		});
	}

	/* ONE CLICK DOWN: what this design changed from its parent, and nothing else.
	   It is a fold rather than a line on the page because the design is the thing
	   being looked at — a caption above it would be the loudest text on screen. */
	changed(){
		const page = this.page;
		if (!page?.changed) return;

		/* The root design's parent is the SHELL, not another design, so it has no
		   parent to have changed from — `spec` is what says "this is a design". */
		const from = page.parent?.spec ? page.parent.title : null;

		return details.c("std-shell-changed bleed", () => {
			summary(from ? "What changed from " + from : "Where this tree starts");
			div.c("std-shell-in", () => { p.c("std-shell-changed-say", page.changed); });
		});
	}
}
