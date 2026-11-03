import { Page, View, div, a, span, icon } from "/app.js";
import Workspace from "../Workspace/Workspace.js";
import { open } from "../Workspace/documents.js";
import { dock } from "../tools.js";

View.stylesheet(import.meta, "playground.css");

/* THE WHOLE-WINDOW WORKSPACE — one document, its viewport set, and `ext/drawer` docked on
   the right, whose `ext/grip` IS the `fill` viewport's responsive handle (zero code for
   that part: Workspace/design §3, §6).

   The url carries the document: `route(name)` claims ANY segment instead of 404ing (the
   day page's own pattern, `ai/2026-08-18/page.js`), so `/playground/untitled/` resolves to
   the SAME shell opened on `untitled`; the root page answers `default` the same way, just
   without a segment.

   ⚠ THE DOCUMENT RAIL IS GONE (2026-09-18), AND THIS PAGE IS A THIN WRAPPER NOW.
     It used to carry a 22rem `Sidebar` down the left listing every saved document with a
     `+` to mint one — a second list of things-you-made, in a second place, beside an editor
     whose own screen already had one. That list is a group in Make's tree now
     (`/imagine/paging/make/`), and the one line above the workspace is the way back to it.

     THE ALTERNATIVE WAS A REDIRECT — make `/playground/<name>/` bounce to Make and delete
     this file. It is the wrong one: what the playground has that Make does not is the
     `Workspace` chrome — the viewport set (1 / all / twin, fit / 100%) and the drawer grip
     as a responsive handle — and a redirect would delete a working tool to save a file.
     What folded is the RAIL, not the page. `doc/decisions.md`.                          */

/* ONE LINE ABOVE THE WORKSPACE: where you are, and the way back to the list.
   ⚠ IT LISTENS FOR ITS OWN DOCUMENT BEING DELETED. The rail's Delete button is in the
     drawer (`properties.js`'s document block) and it announces on the document — so the
     shell standing on the deleted one has to leave, or it sits on a file that is gone. The
     rail used to do this; it is one line here instead. */
function head(page, name){
	const $head = div.c("panel-playground-head", () => {
		a.c("panel-playground-back").href("/imagine/paging/make/")
			.attr("title", "every page and every layout you have made")
			.append(() => { icon("chevron_left"); span("Pages and layouts"); });

		span.c("panel-playground-name", () => { icon("dashboard"); span(name); });
	});

	document.addEventListener("document-removed", e => {
		if ($head.el.isConnected && e.detail === name) page.app.router.go("/imagine/paging/make/");
	});

	return $head;
}

function build(page, name){
	return div.c("page layout-full panel-playground-page", () => {
		div.c("panel-playground flex v", () => {
			head(page, name);

			div.c("panel-playground-main flex-1", () => {
				dock();
				new Workspace({ saver: open(name), flow: true, height: "100%" });
			});
		});
	});
}

// The shape `route(name)` hands back — the same builder as the root page, with a different
// document name closed over. `full.js` is the model: `render()`, never `content()`, so
// there is nothing above the layout (no h1, no `.page.flow`).
function shell(page, name){
	return {
		title: page.title,
		render(){ return this.view ??= build(page, name); },
	};
}

export default new Page({
	meta: import.meta,
	title: "Playground",
	description: "The whole-window Workspace — a document, its viewport set, and the drawer as the responsive handle.",
	icon: "space_dashboard",

	// Undeclared names only (`child()` guards it) — a real child would still win.
	route(name){
		return !name.includes(".") && shell(this, name);
	},

	render(){
		return this.view ??= build(this, "default");
	},
});
