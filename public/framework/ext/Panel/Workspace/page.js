import { Doc, md, code, demo, div } from "/app.js";
import Workspace from "./Workspace.js";
import MemorySaver from "/framework/ext/Saver/MemorySaver.js";

export default new Doc({
	meta: import.meta,
	title: "Workspace",
	description: "Holds a Panel root — the class behind workspace()'s door, able to mount a second view of the same document.",
	icon: "dashboard",

	subject: Workspace,
	properties: "root saver mode zoom viewports $view $roots",
	methods:    "mount",
	notes:      "documents decisions",
	files:      "Workspace.js documents.js workspace.css page.js readme.md",

	content(){

		code.js(`import { workspace } from "/framework/ext/Panel/workspace.js";
import Workspace from "/framework/ext/Panel/Workspace/Workspace.js";

workspace({ saver, templates, seed });    // the thin door — unchanged, every caller
const ws = new Workspace({ saver });      // the class itself, when you want a second view
ws.mount();                               // …another box, same root — N viewports = N views of ONE root`);

		md("**`Workspace` HOLDS a `Panel` root — it never `extends` it.** A subclass would inherit `divide`/`split`/`close`/`mirror`, and `toJSON()` would write the bar's own chrome into the document file. `workspace(options)` is this class's door, unchanged: `new Workspace(options).$view`. Never: a fourth `Panel` subclass. [`doc/decisions.md`](./doc/decisions.md).");

		demo(() => {
			div.c("flex gap", () => {
				const ws = new Workspace({ saver: new MemorySaver() });
				ws.$view.style("--panel-height", "16em");
				ws.mount().style("--panel-height", "16em");
			});
		}, "**Two views of one root.** Split the left panel and the right one gains it too — both are `view()`s of the SAME `Panel` tree, one set of listeners between them. `ws.$view` is the first box, carrying the bar; `ws.mount()` is a second, bare one — task C mounts a whole viewport *set* this way, not a second document.");

		md("**Documents are files.** `documents.js` owns `/data/panels/<name>.json` and the index it writes itself — `/data/panels/index.json` — with no server route on either side.");

		code.js(`import { list, open, create, remove } from "/framework/ext/Panel/Workspace/documents.js";

await list();              // ["default", …] — default always answers, even before anyone wrote the index
const name = await create();  // mints "untitled", "untitled-2"… — or create("mine") to name it yourself
new Workspace({ saver: open(name) });
await remove(name);        // deletes the file, drops it from the index`);

		md("`default` is `/data/panels.json` — the one this module's own page has always used, unmoved: zero migration. Every other name is `/data/panels/<name>.json`. Why not `directory.json`: [`doc/documents.md`](./doc/documents.md).");

		md("Next: [Panel](/framework/ext/Panel/) — the page this door has always mounted into.");

		md.details(import.meta, "readme.md", "Readme");
	},

	// A Doc inside a Doc: no second title band — its sections as a left rail, the
	// shape Panel > Demo draws (and Doc's own member rails).
	render(){
		return this.view ??= div.c("page doc-section", () => this.tabs(this.bar().join(" ")).ac("vertical")).ac("page-" + this.name);
	},
});
