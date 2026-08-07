import { Page, p, div, a, pre, button } from "/app.js";
import { code, section } from "../../ui.js";
import { this_file, when, cost } from "../../compound/recipe.js";

// 2 — DERIVED. A pure function of the segment, so it costs nothing and cannot
// drift: it is not a copy of the title, it is a function of the url.
function titleize(name){
	return name.replace(/-/g, " ").replace(/^./, c => c.toUpperCase());
}

// 3 — DECLARED. Accurate, including the acronym titleize() gets wrong. Also the
// second place every one of these titles now lives.
const LABELS = { "first-run": "First run", "rate-limits": "Rate limits", api: "API" };

export default new Page({
	meta: import.meta,
	title: "Labels before the import",

	// three real files, none of them imported until you click one
	children: "first-run rate-limits api",

	// The four answers, side by side, computed from the live children map. The
	// right-hand column is the import made visible: it says "(not imported)"
	// until the module that knows the title has actually been fetched.
	table_text(){
		return [
			"segment".padEnd(14) + "derived".padEnd(16) + "declared".padEnd(16) + "actual title",
			"".padEnd(14, "─") + "".padEnd(16, "─") + "".padEnd(16, "─") + "────────────",
			...[...this.children.keys()].map(name => [
				name.padEnd(14),
				titleize(name).padEnd(16),
				(LABELS[name] ?? "—").padEnd(16),
				this.children.get(name)?.title ?? "(not imported)",
			].join("")),
		].join("\n");
	},

	// nothing observes the children map, so re-reading it is a thing you ask for
	redraw(){
		this.$label_table?.empty(() => {
			div.c("code-label", "read off this page's children map, when the button says so");
			pre(this.table_text());
		});
		return this;
	},

	content(){
		when("anything lists children it has not imported — a sidebar, an index, a tab bar, a preview grid. Three seats of this council hit it from three directions.");

		section("The shape, named");

		p("A title is data that only the child's module knows. Reading it costs the import, and the import is the thing laziness exists to avoid. So:");

		code(`
The url segment is the only metadata a parent has for free.
Everything else about a child costs its module.`);

		p("That is the general shape. Every version of this problem — the tab bar reading differently per entry point, the sidebar that would import the whole site, the preview cards saying `tree-from-route` — is that one sentence in a different costume.").ac("note");

		section("Three answers, and what each costs");

		this.$label_table = div.c("code label-table");
		this.redraw();

		div.c("row", () => {
			[...this.children.keys()].forEach(name =>
				a.c("page-link", name).href(this.url + name + "/"));
			button("re-read the children map").click(() => this.redraw());
		});

		p("Open one, come back, and the table has NOT changed — then press the button and the row fills in. That is not a bug in the table, it is `built once` from `/compose/state/` showing up here: `content()` ran at first render and what it drew is a snapshot. The children map really did gain a page; nothing was watching it.").ac("note");

		p("Worth sitting with, because it is the honest cost of the whole design. There is no binding anywhere, so every derived label is a photograph taken at render time — which is fine for a title that never changes and wrong for anything that does.").ac("note");

		section("The ledger");

		code(`
1  the raw segment      free · never wrong · ugly for multi-word names
                        what previews() does today

2  titleize(segment)    free · CANNOT drift (it is a function, not a copy)
                        wrong for acronyms — "api" -> "Api", forever

3  a declared map       accurate · and now every title lives in TWO files.
                        The child renames itself; the parent still says the
                        old thing; nothing throws.

4  import them all      accurate · costs exactly the laziness. One line:
                        load_all_children(). Free when children are inline.`);

		section("The verdict");

		p("Take 2, and fix the input rather than the output. `titleize()` is the only one of the four that is a function rather than a copy, which is the same test that chose `fetch(import.meta.url)` for the source blocks and a CSS counter for the step numbers. Its one failure mode — acronyms — is a naming problem, and the fix is to name the directory so the segment reads: `api-reference` derives to `Api reference`, and `rest-api` never had to.");

		p("Reject 3 outright. A label declared by the parent is a second copy of the child's title, and the failure is silent and permanent: the child renames itself, the index keeps saying the old thing, and no test can see it. Reject 4 as a default and keep it as the one-line opt-in it already is — free when children are inline, and exactly wrong when they are not.").ac("note");

		p("Which leaves the honest recommendation, and it is not code: choose segments that read as labels. `/compound/` has ten directories named that way on purpose, and its index needs no label mechanism at all.");

		section("The file");

		this_file(import.meta);

		cost("`titleize()` is a guess and it is sometimes wrong in public. That is the price of never being stale, and it is visible — a reader can see `Api` is odd, where nobody can see that a declared label is six months out of date.");
	}
});
