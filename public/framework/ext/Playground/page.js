import { Doc, md, div, h1, p } from "/app.js";
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
	//
	// Still needs a title, one orienting line and a way back out (audit 2026-08-30:
	// render() drew straight into the tool, no <h1> at all). One extra wrapper keeps
	// `.page`'s single-child sizing contract: outer stays "full solo flex" untouched,
	// and IT gets "flex v flex-1" so the header stacks above the tool instead of
	// splitting the row beside it (framework.css: .flex.v is column, .flex-1 fills the
	// remaining space — the same trio Playground.js already puts on .pg-frame, one
	// level down).
	render(){
		return this.view ??= div.c("page", () => {
			div.c("flex v flex-1", () => {
				div.c("flex v gap pad", () => {
					h1.c("page-title", this.title);
					p(this.description);
					this.crumbs();
				});
				div.c("flex-1", () => { this.tool = new Playground({ slug: "untitled" }).build(); });
			});
		}).ac(this.classes ?? "standard");
	},

	// The Overview tab's page (design §1: "the ext/ preview is a still png, never a live
	// instance") — readme rendered, the tool linked as the exhibit.
	content(){
		md("**[Open the playground](/framework/ext/Playground/)** — the live exhibit; every control on it is real DOM, nothing here is a preview.");
		return md.file(import.meta, "readme.md");
	},
});
