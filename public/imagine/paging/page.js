import { div, h2, span, a, icon, md } from "/app.js";
import { Realm, Paging, Stage } from "./paging.js";
import { PRESETS } from "./presets.js";
import { BLOCKS } from "./blocks.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  its own screen — `app.$pages`, not a column of /imagine/'s row. The
                realm is an app: a rail that never moves, and a middle that swaps.
   2 SIZE       the whole row. Rail `clamp(15rem, 12vw, 26rem)` — 240px at 1280,
                413px at 3440; the middle takes everything else. At 3440 that is
                ~3000px of middle, against the 1152px column this page used to be.
   3 OWN LAYOUT SIX LIVE MINIATURES FIRST — the six building blocks, one picture
                each — then the one line that says what they are and how to make one
                of your own. The playable page is below them, under its own heading.
                No h1 and nothing above the wall. Both the wall and the stage claim
                `wide`, so they grow with the middle instead of stopping at the 40em
                reading cap.
   4 REGIONS    two: the rail, and the middle (`$pages`). Every page in the realm
                mounts in the middle, so one click changes exactly one thing.
   5 PREVIEW    core's default card, on /imagine/'s own wall.

   ⚠ NO OPENING PARAGRAPH. The page under the sentence is a real, running page you
     can change by pointing at it, and the old opening ("Every page on this site is
     three things: an icon, some content, and a list of children…") told a reader
     what they were about to be shown instead of showing it (the owner, 2026-09-05).
     doc/decisions.md.                                                            */

/* THE PAGE THAT IS ON THE STAGE WHEN YOU ARRIVE — now BELOW the six blocks, under
   its own heading. Tabs over one panel: the most familiar shape there is, and the
   one where "the box does not move" is obvious.

   ⚠ `wide`, and a CARD WALL rather than the preset's prose. At 3440 a `reading` stage
     stops at its 64em cap — 1152px — and the first screen of the realm's front page
     was 58% bare grey (measured here; the audit said 52%). Prose in a `wide` box is
     no better: it keeps its 40em measure and leaves the rest of the box white. A wall
     reflows into whatever width it is given, so the front page uses the screen it is
     on at every size, and a tab click still swaps the panel without moving the box. */
const OPENING = { ...PRESETS.find(preset => preset.id === "docs-tabs").config, room: "wide", content: "cards" };

/* ── THE SIX BLOCKS, AS SIX RUNNING PAGES ──────────────────────────────────────

   One configuration per block, chosen so that the block's own word is the thing you
   can SEE in the picture: Navigation gets a left rail, Room gets the narrow box in a
   wide frame, Arrangement gets a toolbar around the box, Skin gets the dark surface.
   The reader meets the six words as six pictures before meeting any of them as a
   word.

   ⚠ WHY THE FRONT PAGE CHANGED. Until 2026-09-17 this page opened on the seven-word
     toolbar over one running page, and the six blocks the whole realm is organized
     around appeared only as rail text and as one markdown line 3,100px down — so the
     first thing a stranger saw was nine controls, and "what IS paging" had no answer
     above the fold. The owner's brief: level 1 is one screen, the handful of building
     blocks as picture cards, one line each, and the way in. The twelve ready-made
     pages moved to [Library](/imagine/paging/library/), where their wall already had
     a heading, and the four gesture miniatures moved to
     [Mechanisms](/imagine/paging/mechanisms/), which is the page about them. Nothing
     was deleted; both are one click down.                                        */
const SIX = {
	stage:       { navigation: "tabs", content: "cards", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" },
	navigation:  { navigation: "rail", content: "article", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" },
	content:     { navigation: "none", content: "dashboard", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" },
	room:        { navigation: "none", content: "article", room: "narrow", arrangement: "plain", surface: "card", background: "tint", type: "regular" },
	arrangement: { navigation: "none", content: "cards", room: "wide", arrangement: "bar-top", surface: "card", background: "tint", type: "regular" },
	skin:        { navigation: "tabs", content: "article", room: "wide", arrangement: "plain", surface: "dark", background: "dark", type: "display" },
};

// old name → where it went. `route()` below turns each into a one-line page.
const MOVED = {
	styles:      ["Skin", "/imagine/paging/skin/", "the five surfaces, and now two independent colour controls instead of one."],
	sizes:       ["Room", "/imagine/paging/room/", "the four width words, said in plain English."],
	center:      ["Room", "/imagine/paging/room/", "centring is an alignment, not a width — it lives with the width words."],
	transitions: ["Swap", "/imagine/paging/mechanisms/swap/", "the four swap visuals are on the swap page, on one stage."],
	explorer:    ["Library", "/imagine/paging/library/", "twelve configured pages you can change by pointing at them."],
	examples:    ["Library", "/imagine/paging/library/", "twelve real pages, each with its own configuration and its own url."],
	rightnav:    ["A settings page with a right rail", "/imagine/paging/library/settings/", "a right rail is one value of the navigation word."],

	/* ⚠ AND `build`, WHOSE `page.js` WENT ON 2026-09-17. The builder became Make's
	     right pane on 2026-09-13 and `/imagine/paging/build/` was left as a whole
	     page — a heading, three paragraphs and a button — whose only job was to say
	     so. That is one row here, which is what this map is for. The DIRECTORY stays:
	     `build/words.js` (the node vocabulary), `build/draw.js` (the one block
	     renderer) and `build.css` are live code that `make/`, `config.js` and
	     `stage.js` all import — `build/readme.md` says so. Only the page went. */
	build:       ["Make", "/imagine/paging/make/", "the builder is Make's right pane now — one screen with the tree, the live page and every control."],

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
	// ⚠ `made` is the one entry not a bare name: it is Make's own data subtree
	//   (core/Page/doc/data.md), so it is declared `{ name: "made", data: true }` —
	//   core reads `made/page.json` instead of probing for a `made/page.js` that was
	//   never going to exist, which is the one 404 that doc names as still open.
	children: [
		"library", "stage", "navigation", "content", "room", "arrangement", "skin", "cross",
		"mechanisms", "templates", "make", { name: "made", data: true }, "doc", "critique", "inventory",
	],

	/* ⚠ THE SIX PICTURES ARE THE FIRST THING ON THE PAGE. No `h1`, and no sentence
	     above them: the page opens on the six things the realm is made of, each one
	     RUNNING, and the line that says what they are sits underneath, small. (The
	     owner, 2026-09-06: *"we don't need to write the h1, taking up so much space.
	     instead, let's go straight into the demo."*) `paging.js` `render()` takes the
	     h1 off every page in the realm; this one was hand-written here as well, so it
	     goes here too. */
	content(){
		div.c("paging-wall-live wide", () => BLOCKS.forEach(block => this.block_shot(block)));

		/* ⚠ AND THE SENTENCE IS THE WAY IN. The hub never named the editor anywhere in
		     its body: the only way to it was a rail tile 255px below the fold, behind
		     34 other links, under a heading reading THE EDITOR (IT SAVES) — so a
		     newcomer who arrived asking "how do I make one of these?" had to scroll a
		     rail past six blocks, eleven library pages and four mechanisms to find out
		     (self-evident-critique-2, the way in). It is one sentence, right under the
		     six pictures, where the question gets asked. */
		this.lede("**Every page above is the same page, said six different ways.** Six words make it, and each picture is one of them — click one to change that word yourself. When you want a page of your own, [Make a page](/imagine/paging/make/): it saves to a real file at a real address.");

		h2("Change a word and watch");

		this.stage(OPENING);

		md("Whole pages already made: [twelve ready-made shapes](/imagine/paging/library/) · [eleven template families](/imagine/paging/templates/) · [the four things a click can do](/imagine/paging/mechanisms/). "
			+ "The long form is [Docs](/imagine/paging/doc/); the short version is the [readme](/imagine/paging/readme/).");
	},

	/* ONE BUILDING BLOCK, AS A LIVE MINIATURE. The card holds a real page RUNNING —
	   the same `Stage` the full-size page uses, at 0.6em in a clipped frame —
	   configured so that this block's own word is the visible thing in the picture.
	   `SIX` above says which configuration, and why.

	   ⚠ `inner: true` — a nested stage draws no path bar, no caption, cannot take the
	     screen, and never touches the address bar. Six stages writing one url would
	     fight.
	   ⚠ NOT `card()`. Core's `Page.nav()` reads `this.card` as the card CLASS for a
	     preview, so a method of that name is handed to `.ac()` as a function and every
	     preview on the site's own wall throws. The shadowing trap the code skill
	     names, met for the third time in this realm. */
	block_shot(block){
		// ⚠ ROOM'S CARD IS TWO COLUMNS WIDE. Its word is WIDTH, and a width word can
		//   only be seen against a frame wider than the box — `paging.css` has the
		//   measurement.
		return a.c("paging-shot").ac(block.id === "room" && "paging-shot-wide").href(block.url).append(() => {
			div.c("paging-shot-frame", () => {
				new Stage({ config: SIX[block.id], inner: true });
			});

			span.c("paging-shot-head", () => {
				icon(block.icon);
				span(block.title);
			});

			span.c("paging-shot-say", block.one_line);
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
		if (name === "readme") return this.readme_page();

		const moved = MOVED[name];
		if (!moved) return;

		return this.moved_page(name, moved, name === "toolbars" && this.moved_side.bind(this));
	},

	/* ⚠ THE README IS ROUTED, NOT LEFT TO THE FALLBACK. `/imagine/paging/readme/` has
	     always rendered — core's last-resort `Page.file()` finds the `.md` beside a
	     page — but only AFTER `Page.load()` misses, so every visit logged
	     `404 /imagine/paging/readme/page.js` in the console. Four of them in the last
	     sweep, on the one url the hub's own closing line points at. Six lines here
	     cost nothing and the page gains a real title. (The documentation skill names
	     this as the fallback's documented cost; this is the `route()` it recommends.) */
	readme_page(){
		const meta = this.meta;

		return new Paging({
			title: "Readme",
			icon: "description",
			heading: true,
			description: "The realm in one file — what it is, how to use it, and the traps that never throw.",
			content(){ return md.file(meta, "readme.md", { h1: false }); },
		});
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
});
