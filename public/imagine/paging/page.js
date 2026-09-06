import { div, h2, p, span, a, icon, md } from "/app.js";
import { Realm, Paging, Stage } from "./paging.js";
import { PRESETS, preset_url } from "./presets.js";
import { BLOCKS } from "./blocks.js";
import { nest_of } from "./url.js";
import { DEMOS } from "./demos.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  its own screen — `app.$pages`, not a column of /imagine/'s row. The
                realm is an app: a rail that never moves, and a middle that swaps.
   2 SIZE       the whole row. Rail `clamp(15rem, 12vw, 26rem)` — 240px at 1280,
                413px at 3440; the middle takes everything else. At 3440 that is
                ~3000px of middle, against the 1152px column this page used to be.
   3 OWN LAYOUT one live page on the stage FIRST, the sentence under it, then the
                twelve presets as a wall of LIVE MINIATURES, then the four gestures.
                No h1 and nothing above the demo. The stage claims
                `wide` and opens on the `wide` room word, so it grows with the middle
                instead of stopping at the 40em reading cap.
   4 REGIONS    two: the rail, and the middle (`$pages`). Every page in the realm
                mounts in the middle, so one click changes exactly one thing.
   5 PREVIEW    core's default card, on /imagine/'s own wall.

   ⚠ NO OPENING PARAGRAPH. The page under the sentence is a real, running page you
     can change by pointing at it, and the old opening ("Every page on this site is
     three things: an icon, some content, and a list of children…") told a reader
     what they were about to be shown instead of showing it (the owner, 2026-09-05).
     doc/decisions.md.                                                            */

/* THE PAGE THAT IS ON THE STAGE WHEN YOU ARRIVE. Tabs over one panel: the most
   familiar shape there is, and the one where "the box does not move" is obvious.

   ⚠ `wide`, and a CARD WALL rather than the preset's prose. At 3440 a `reading` stage
     stops at its 64em cap — 1152px — and the first screen of the realm's front page
     was 58% bare grey (measured here; the audit said 52%). Prose in a `wide` box is
     no better: it keeps its 40em measure and leaves the rest of the box white. A wall
     reflows into whatever width it is given, so the front page uses the screen it is
     on at every size, and a tab click still swaps the panel without moving the box. */
const OPENING = { ...PRESETS.find(preset => preset.id === "docs-tabs").config, room: "wide", content: "cards" };

// old name → where it went. `route()` below turns each into a one-line page.
const MOVED = {
	styles:      ["Skin", "/imagine/paging/skin/", "the five surfaces, and now two independent colour controls instead of one."],
	sizes:       ["Room", "/imagine/paging/room/", "the four width words, said in plain English."],
	center:      ["Room", "/imagine/paging/room/", "centring is an alignment, not a width — it lives with the width words."],
	transitions: ["Swap", "/imagine/paging/mechanisms/swap/", "the four swap visuals are on the swap page, on one stage."],
	explorer:    ["Library", "/imagine/paging/library/", "twelve configured pages you can change by pointing at them."],
	examples:    ["Library", "/imagine/paging/library/", "twelve real pages, each with its own configuration and its own url."],
	rightnav:    ["A settings page with a right rail", "/imagine/paging/library/settings/", "a right rail is one value of the navigation word."],

	/* ⚠ AND `toolbars`, DELETED 2026-09-06. It was a second name for four of
	     arrangement's seven values: `/toolbars/top/` and `/arrangement/bar-top/` drew
	     the SAME stage, and the toolbars page's four cards were text — an icon and a
	     sentence — so a reader clicked one to find out what it meant (the owner: *"these
	     paging toolbars links don't really show anything meaningful"*). Arrangement
	     already names all seven, each with a live page and a link to the proven layout
	     it compiles to, so the page went and the word stayed. doc/decisions.md.        */
	toolbars:    ["Arrangement", "/imagine/paging/arrangement/", "a toolbar is one of arrangement's seven values, and so are a footer and the two side panels — every one of them shown live on that page."],
};

// The four `toolbars/<side>/` urls, and the arrangement value each one WAS. Links to
// them are saved in other realms and in the notes, so each still answers.
const SIDES = {
	top:    ["bar-top", "Toolbar top"],
	bottom: ["bar-bottom", "Footer"],
	left:   ["rail-left", "Panel left"],
	right:  ["rail-right", "Panel right"],
};

export default new Realm({
	meta: import.meta,
	title: "Paging",
	description: "One configurable page, six building blocks, and twelve ready-made shapes.",
	icon: "auto_stories",

	// Nothing is drawn from the children list — the rail is the navigation, and it
	// is built from `rail.js`. Depth 0 keeps a visit to the hub from fetching a
	// whole program of pages nobody asked for.
	index: true,
	depth: 0,

	// ⚠ Nothing crawls: a page exists once this list names it. `navigation` is built
	//   by the nav-stability task and shares this list.
	children: "library stage navigation content room arrangement skin cross mechanisms templates make build doc critique inventory",

	/* ⚠ THE DEMO IS THE FIRST THING ON THE PAGE. No `h1`, and no sentence above it:
	     the page opens on the running page it is about, and the one line saying what to
	     do with it sits underneath, small. (The owner, 2026-09-06: *"we don't need to
	     write the h1, taking up so much space. instead, let's go straight into the
	     demo."* The stage's top edge was 330.8px down at 1280 and is 152.6px now.)
	     `paging.js` `render()` takes the h1 off every page in the realm; this one was
	     hand-written here as well, so it goes here too. */
	content(){
		this.stage(OPENING);

		this.lede("Change a word in the bar above and watch the page under it change.");

		h2("Twelve pages, ready made");

		div.c("paging-wall-live", () => PRESETS.forEach(preset => this.preset_card(preset)));

		h2("What one click can do");

		p("Each of these four is live. Click it.");

		div.c("paging-cards", () => DEMOS.forEach(demo => this.gesture(demo)));

		md("The six building blocks everything here is made of: "
			+ BLOCKS.map(block => "[" + block.title + "](" + block.url + ")").join(" · ")
			+ ". The long form is [Docs](/imagine/paging/doc/); the short version is the [readme](/imagine/paging/readme/).");
	},

	/* ONE PRESET, AS A LIVE MINIATURE. The card holds the preset RUNNING — the same
	   `Stage` the full-size page uses, at 0.6em in a clipped frame — so the wall is
	   twelve pictures of twelve page shapes rather than twelve sentences about them.
	   `/templates/` has done this since it shipped and was the best page in the realm
	   for it; this wall was still twelve text cards (paging-audit-2).

	   ⚠ `inner: true` — a nested stage draws no caption, cannot take the screen, and
	     never touches the address bar. Twelve stages writing one url would fight.
	   ⚠ NOT `card()`. Core's `Page.nav()` reads `this.card` as the card CLASS for a
	     preview, so a method of that name is handed to `.ac()` as a function and every
	     preview on the site's own wall throws. The shadowing trap the code skill
	     names, met for the third time in this realm. */
	preset_card(preset){
		return a.c("paging-shot").href(preset_url(preset)).append(() => {
			div.c("paging-shot-frame", () => {
				new Stage({ config: preset.config, nest: nest_of(preset.nest), inner: true });
			});

			span.c("paging-shot-head", () => {
				icon(preset.icon);
				span(preset.title);
			});

			span.c("paging-shot-say", preset.one_line);
		});
	},

	/* ── WHERE THE OLD PAGES WENT ─────────────────────────────────────────────
	   Six directories were merged into the six blocks on 2026-09-05, and links to
	   them exist in other realms, in the task logs, and in anything anyone saved. A
	   url that used to work should say where it went rather than 404 — so `route()`
	   answers each old name with one line and the way on. Core asks `route()` only
	   for names `children:` does not have, so none of these can shadow a real page.
	   Delete a row once nothing points at it any more.

	   ⚠ `heading: true` — a moved page is PROSE, not a demo, so it keeps the `h1` that
	     every other page in the realm now drops (`paging.js` `render()`). A page whose
	     entire content is one sentence needs the sentence to have a name over it. */
	route(name){
		const moved = MOVED[name];
		if (!moved) return;

		return this.moved_page(name, moved, name === "toolbars" && this.moved_side.bind(this));
	},

	moved_page(name, [title, url, says], route){
		return new Paging({
			title: "Moved: " + name,
			icon: "moving",
			heading: true,
			description: "This page is now " + title + ".",
			route: route || undefined,
			content(){
				this.lede("**This page moved.** It is now [" + title + "](" + url + ") — " + says);
			},
		});
	},

	// `/imagine/paging/toolbars/left/` and its three siblings: each answers with the
	// arrangement value it was, and a link straight to that value's live page.
	moved_side(name){
		const side = SIDES[name];
		if (!side) return;

		const [value, title] = side;

		return this.moved_page(name, [title, "/imagine/paging/arrangement/" + value + "/",
			"the same live page, under the word the rest of the realm uses for it."]);
	},

	// One gesture: the miniature does its thing right here, with nothing to read
	// first, and the link under it goes to the page that does it at full size.
	gesture(demo){
		return div.c("paging-card", () => {
			span.c("paging-card-head", () => {
				icon(demo.icon);
				span(demo.word);
			});

			demo.draw();

			span.c("paging-card-say", demo.takeaway);

			a.c("page-link", demo.says).href(demo.real);
		});
	},
});
