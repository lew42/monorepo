import { Page, View, div, span, a, h4, icon, md } from "/app.js";

View.stylesheet(import.meta, "imagine.css");

/* Container: the app's page region — a columns host stretches to fill it. Size: this
   page is a `small` 14em rail and nothing else; every section opens to its right on
   its own word. Own layout: core's column row, one call. Regions: one per column,
   core's. Preview: the default card.

   THE ROOT IS THE EXPERIENCE. There is no prose page here to read before you arrive:
   the rail is on screen at the first paint, `Start` is already open beside it (the
   `default` column — doc/method/default_column.md), and every deeper thing in the
   place — a person, a lane, a room three realms down — is another column in THIS row.
   One host, one crumb strip, one horizontal scroller, whatever url you land on cold.

   ⚠ `children` is an ARRAY so it can mix. A string declares a real directory and core
     loads its `page.js`; a POJO is written here. `start` is the only page in /imagine/
     that has no directory, because it has nothing of its own to say — it is this rail,
     drawn as cards.

   THREE GROUPS NOW, FOUR AT FIRST — the owner's own words were "I'm sort of lost…
   it's not clear at all." (2026-09-04) and "recommend renaming or restructuring to
   simplify architecture, UI." (2026-09-17). The study at
   ai/2026-09-17/imagine-integration/proposal.md found the cause and the cure: six
   tools, seven worlds, seven shapes, four studies, sharing one rail with no way to
   tell them apart. Move 1 (2026-09-17) sorted the rail into four groups and moved
   nothing. Move 3 (2026-09-18, ai/2026-09-18/imagine-move-3/) then moved the whole
   Shapes group to /layouts/ — that group and its seven names are gone from here now;
   see the comment on `GROUPS` below for where they went and why the old urls still
   answer. The remaining three groups keep their urls untouched; only the ORDER
   (grouped, not alphabetical-by-accident) and two headings changed from the start.

   `GROUP_OF` is the one marker both readers use — no second list to keep in step:
   `add()` below stamps `.group` on a child the moment it resolves, and core's own
   `previews()` (Page.class.js:673, unedited) already draws a heading whenever a run
   of children shares a `.group` — that is Start's wall, below. `column()` below is
   the same idea for the rail, which core's version has no such support for, so it is
   copied here with the two lines added — see the comment on it. */

const GROUPS = [
	["Tools",   "paging importance research stream cms generated"],
	["Worlds",  "game scenes team gallery codrops youtube feeds"],
	["Studies", "platform review vary"],
];

// The seven Shapes realms (layouts, sections, shells, screens, decks, blogx, mag) moved to
// /layouts/ — imagine-integration proposal, move 3, 2026-09-18 (ai/2026-09-18/imagine-move-3/).
// `design` (fourteen studies — the proposal's nine plus four that grew since, plus `lists/`,
// brand new) split across five places 2026-09-18 too (move 2, `ai/2026-09-18/imagine-move-2/`):
// nine plus `lists/` joined /framework/styles/system/studies/, and controls/layout/navigation/
// journey joined the module each one proved a rule for. Each old /imagine/<name>/ address
// (`design` included, down to its own sub-studies) still works: a one-line stub page.js is
// left behind (undeclared here, but core's own child() falls through to Page.load() for any
// name that isn't declared, so the url still resolves — it just no longer shows as a card or
// rail link).

const GROUP_OF = new Map(GROUPS.flatMap(([group, names]) => names.split(" ").map(name => [name, group])));

export default new Page({
	meta: import.meta,
	title: "Imagine",
	description: "A place made of column pages — a team to run, a world to walk, and three trees of variations.",
	icon: "auto_awesome",


	/* One level: the rail and Start's card wall both draw MY children and stop there —
	   a section's own columns arrive when you open it. Without this the place cost 92
	   page.js modules to show 15 (measured 2026-08-30). doc/declaring.md. */
	depth: 1,
	width: "small",   // the rail. `small` scales now (14em at 1280, 24em at 3440); without it the nav is a 46em reading column

	initialize(){ this.columns(); },

	// core's add() (Page.class.js) does the real work of resolving and adopting a
	// child; this only tags the result on the way back, so every reader downstream —
	// this page's own column() and core's own previews() — sees the same `.group`
	// on the same object. `Page.prototype.add.call`, not `super`: this object is
	// handed to `new Page()`, it is not a subclass, so there is no `super` to reach.
	add(name, child = {}){
		const page = Page.prototype.add.call(this, name, child);
		if (GROUP_OF.has(name)) page.group = GROUP_OF.get(name);
		return page;
	},

	// Core's own column() (Page.class.js), copied rather than wrapped — its loop has
	// nowhere to hang an insertion — with one addition: a heading before the first
	// realm of each new group, read off the same `.group` field previews() (Start's
	// wall, below) already keys off. If core's column() changes shape, this drifts
	// with it; the two added lines are marked below.
	column(host){
		let group;

		return div.c("page-column-body", () => {
			div.c("page-column-head", () => {
				span.c("page-column-title", this.title);
				if (this !== host) a.c("page-column-close", () => icon("close")).href(this.parent.url);
			});

			if (this.content)
				div.c("page-column-prose flow", () => this.render_content());

			if (!this.index) this.children.forEach((child, name) => {
				// ← the two added lines: a heading, once per group, in the same run
				//   core's previews() already draws them in.
				if (child?.group && child.group !== group)
					h4.c("imagine-rail-group", group = child.group);

				const nav = this.nav_for(name);

				a.c("page-column-item").href(nav.url).append(() => {
					if (nav.icon) icon(nav.icon);
					span.c("page-column-label", nav.label);
					if (child?.children.size) icon("chevron_right");
				});
			});
		}).ac(this.width && "page-column-" + this.width);
	},

	children: [
		{
			title: "Start",
			icon: "grid_view",
			width: "large",

			// The one word that makes the place open instead of arriving empty.
			classes: "default",

			content(){
				// ⚠ "Nothing here opens a new screen" is gone — it read as a warning that
				//   something would not work, when every card below IS a real link that
				//   navigates; the true claim ("same urls, same row") needs no second half
				//   (self-evident-critique-3, finding 5).
				md("**Pick a way in.** A card below, or the rail beside it — same urls, same row.");

				// My siblings, drawn by themselves, grouped into three headings — the
				// SAME `.group` field the rail reads (set by /imagine/'s own `add()`
				// above), read here by core's own previews(), unedited. `previews()`
				// takes a subset because this page is the index and an index does not
				// list itself.
				this.parent.previews(new Map([...this.parent.children].filter(([name]) => name !== this.name)))
					.style("--column", "15em");

				md("Everything you change is remembered by **url** — the team's board and your run in the world both survive a reload, keyed on the page's own address ([how](/imagine/readme/)).");
			},
		},

		// Grouped in the proposal's own order (Tools · Worlds · Studies), each realm in
		// the order inventory.md lists it. 17 names now, not 24 — the seven Shapes
		// realms moved to /layouts/ 2026-09-18 and are gone from this list; their old
		// urls still answer (a one-line stub each), they just don't have a card here.
		...GROUPS.flatMap(([, names]) => names.split(" ")),
	],
});
