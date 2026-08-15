import { Page, md, code, h3, p } from "/app.js";
import panel, { workspace } from "./workspace.js";
import full from "/framework/styles/layouts/full.js";

export default new Page({
	meta: import.meta,
	title: "Panel",
	description: "Chrome for arranging: divide, drag, align and fill any region — and it survives a reload.",
	icon: "dashboard_customize",

	content(){

		workspace().ac("bleed");

		md("**Split a panel with the two icons, drag one by its grip into another, drag a divider, pick a template from `T`** — then reload. The whole arrangement comes back: [`/framework/ext/Panel/full/`](/framework/ext/Panel/full/) is the same workspace filling the window.");

		md("A **section** is a full-width band of a real page — content, with its own measure and tone. A **panel** is chrome for *arranging*: it can host any section, frame it, align it, retint it, split beside it. Sections are what you ship; panels are how you wireframe.");

		code.js(`import panel from "/framework/ext/Panel/workspace.js";

panel(() => { h3("Anything"); p("…inside one managed panel."); });
panel("clock");                        // …or a name from the T vocabulary`);

		panel(() => {
			h3("Anything");
			p("…inside one managed panel. Split it, align it, hug it — the bar is the same one the workspace above uses, and this one has no saver, so nothing is written.");
		}).ac("wide").style("--panel-height", "14em");

		md("`panel(seed)` is the default container door: **one** managed leaf, same `Panel` class, same code path. A **function** is content the call site draws; a **string** is a `T` entry, which is what [`/framework/`](/framework/) puts its live clock on. `save()` resolving `false` is the honest answer when nothing is wired to write.");

		panel("clock").ac("wide").style("--panel-height", "14em");

		md("Every panel is an [`Item`](/framework/core/Item/), every drag is one `item.move()` through [`Sortable`](/framework/ext/Draggable/), the bar inside each body is [`ext/layout`](/framework/ext/layout/)'s own, and the whole tree writes through a [`Saver`](/framework/ext/Saver/). There is no fifth mechanism.");

		code.js(`divide(dir)   // my parent already runs this way? a new sibling. else I become the split
close()       // remove me; a container left with one child absorbs it`);

		md("**Splitting twice on the same icon adds a third column**, because the second click finds a parent that already runs that way. That is the whole rule — there is no separate \"add column\" verb.");

		md("The `T` menu adapts all fifteen [section bands](/framework/styles/sections/), lazily imported and tinted by the panel's tone, beside a handful of scenes that size themselves in container-query units — so one template is centred and scaled from a phone sliver to a 3440 monitor.");

		md("Next: [Editor](/framework/ext/editor/) — the same `Item` tree, edited instead of arranged.");

		md("Where this module stands, as a filterable ledger: [Editor × Panel review](/framework/ai/2026-08-14/editor-panel-review/).");

		md.details(import.meta, "readme.md", "Design record — section vs panel, the two verbs, and what edge-drop cost");
	},

	// A url, not a class toggle, so a reload comes back to the whole-window view.
	route(name){
		return name === "full" && full(this, () => workspace().style("--panel-height", "100%"));
	},
});
