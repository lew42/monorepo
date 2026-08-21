import { Doc, md, div } from "/app.js";
import Playground from "./Playground.js";

export default new Doc({
	meta: import.meta,
	title: "Playground",
	description: "An Item tree rendered as real flex/grid DOM you can poke — a layout lab.",
	icon: "space_dashboard",
	classes: "full solo flex",

	notes: "schema decisions",
	files: "Playground.js canvas.js items.js documents.js properties.js toolbar.js playground.css page.js",

	// A TOOL, not a content page: `render()` owns the shell whole at this module's own
	// url, and still carries `this.classes` — the documented pattern for a layout page
	// that overrides render() (`core/Page/doc/property/classes.md`; precedent:
	// `framework/page.js:20`). `Doc`'s own tab-rendering (well/tabs) never runs here, but
	// `sections()` still adds "doc"/"files" as real routed children — `content()` below
	// is the Overview section's own page, reachable at its own url regardless.
	render(){
		return this.view ??= div.c("page", () => {
			this.tool = new Playground({ slug: "untitled" }).build();
		}).ac(this.classes ?? "standard");
	},

	// The Overview tab's page (design §1: "the ext/ preview is a still png, never a live
	// instance") — readme rendered, the tool linked as the exhibit.
	content(){
		md("**[Open the playground](/framework/ext/Playground/)** — the live exhibit; every control on it is real DOM, nothing here is a preview.");
		return md.file(import.meta, "readme.md");
	},
});
