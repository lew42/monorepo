import { Page, p } from "/app.js";
import { code, section, watch } from "./ui.js";

export default new Page({
	meta: import.meta,
	title: "new/starter",

	content(){
		code(`
App       boot, chrome, and the container above the root page          41 lines
Page      a node: url, content, children, and how it shows a child     95
Router    url → page, and the swap                                     92`, "the whole framework");

		p("Three classes. Pick a topic on the left; every page shows the code it's describing, and traces what it does to the console as you click.");

		section("The model, in one paragraph");

		p("A Page is a node with a url, some content, and a list of child names. The Router turns a url into a page by walking one segment at a time, asking each page for its child. Every page it walks through stays in the chain. When the url changes, only the part that differs is swapped. **A page shows its own child** — so how a child appears is the parent's decision, not the framework's.");

		code(`
export default new Page({
    meta: import.meta,
    title: "Docs",
    children: "intro api",       // names, not imports
    content(){ p("…"); }
});`, "a whole page.js");

		section("Where to start");

		code(`
The trio          App · Page · Router — the API, and who calls what
How it works      the load sequence, the chain, urls with no file
Layouts           four arrangements, four one-liners, zero base-class changes
Open questions    what this design does NOT do, and where it stops`);

		section("This page is the root");

		p("It loaded before anything else and it's still in the chain — you just can't see it, because its content hides whenever a child takes over. Click anything and come back; nothing here was rebuilt.");

		section("What's different from core/");

		code(`
core/ today                        new/starter
───────────────────────────────    ─────────────────────────────
import target, then climb up       walk down from the root
host() hunts for a layout marker   a page shows its own child
$app.empty() — rebuild it all      only the differing tail
Page.registry — a global map       nothing; just try the url
import every child (25 modules)    children: "a docs"
dynamic urls impossible            route(name)`);

		watch(
			"Open the console and leave it open — every navigation logs itself.",
			"Synchronous work is folded into groups; click one open to see the swap.",
			"Every source link points at the real line — nothing logs through a helper."
		);
	}
});
