import { Doc, md, code } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "new/starter",
	description: "The first real Router: lazy children, four working layouts, and the column problem that forced the redesign in new/1.",
	icon: "looks_two",

	files: "App.js Page.class.js Router.js server.js drive.mjs readme.md",

	content(){

		code.js(`children: "intro api"       // names — nothing imported, loaded when asked for
children: [intro, api]      // already-imported pages
children: [intro, "api"]    // both`);

		md("Where lazy `children` and `route()` first appear, alongside `naming()` (a page derives its own `url`/`name`/`title`, idempotently, in one method both the constructor and `add()` call) and a working Playwright driver (`drive.mjs`) instead of a rotted jsdom harness.");

		md("**The column problem is the reason this tier is superseded.** `activate()` calls `this.container().show(this)` — a *ladder*, each rung a different object's method — so a topic page overriding `show(child)` to lay out a column only ever controls its own direct child, never a grandchild. Four fixes were weighed (propagate down, search up, subclass, hand the layout the whole chain) and none was taken; the readme's `SOLVED` section explains why the real fix needed no JS at all — `display: contents` dissolves the intermediate boxes so a nested DOM lays out as one flat CSS grid. That's [new/1](/framework/core/new/1/)'s `.full`/`.cols`.");

		md("Also here: why there's no logging wrapper (`console.group` directly — a helper's own file:line makes devtools' source link useless), and the live-reload server, which subclasses the repo's real `Server` + `DevSocket` rather than copying either.");

		md.details(import.meta, "readme.md", "The column problem in full, naming(), logging, and what's still unresolved");
	}
});
