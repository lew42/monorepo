import { Doc, md, div } from "/app.js";
import Page from "../../../core/Page/Page.class.js";
import { view, DefaultView } from "./DefaultView.js";

// A made-up class, here only to make the override visible: DefaultView's own
// best guess (every property, one row each) beside a hand-written `Widget.View`
// that draws something completely different instead.
class Widget {
	constructor(name){ this.name = name; this.count = 3; this.tags = ["red", "green", "blue"]; }
}
Widget.View = class extends DefaultView {
	render(){ md(`★ **${this.subject.name}** — ${this.subject.count} tags: ${this.subject.tags.join(", ")}.`); }
};

export default new Doc({
	meta: import.meta,
	title: "Object",
	description: "One default view for any object: a row with its icon, id, class and counts; open it to see its data, live.",
	icon: "data_object",

	files: "DefaultView.js DefaultView.css DefaultView.test.js Object.js Inspect.js InstanceTree.js page.js readme.md",
	notes: "default-view",
	children: "page app instance-tree",

	content(){

		md("**One view for any object.** `view(x)` draws one row: the class's icon, the id, the class as a small label, and counts. Click it open: a string or number is written out, an object it owns opens the same way, a reference says where it points. It is live: a change redraws only its own row. **[Watch a tree being built →](/framework/core/Item/watch/)**");

		div.c("ux-content-wall wide", () => {
			div.c("flex v gap", () => { md("#### This page (a `Doc`, a `Page` subclass)"); view(this, { open: 1, properties: "title url icon parent" }); });
			div.c("flex v gap", () => { md("#### The App"); view(this.app, { open: 1 }); });
			div.c("flex v gap", () => { md("#### The `Page` class"); view(Page, { open: 1, properties: "title url children parent", method_names: "add move walk crumbs render load" }); });
			div.c("flex v gap", () => { md("#### A plain object"); view({ name: "sidebar", width: 320, sticky: true, items: ["overview", "api", "docs"] }, { open: 2 }); });
			div.c("flex v gap", () => {
				md("#### A class with its own look");
				md("No `static View`: the default view."); new DefaultView({ subject: new Widget("demo"), open: 1 });
				md("`Widget.View`, its own:"); view(new Widget("demo"));
			});
		});

		md("`object()` and `inspect()`, the two older views, still work and draw this one (deprecated; `Object.js`, `Inspect.js`).");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => view({ name: "example", size: 12 }, { open: 1 }))); },
});
