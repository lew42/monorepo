import { Page, p, div, a } from "/app.js";
import { code, section } from "../../ui.js";
import { recipe } from "../recipe.js";

/* A documentation site for "Kettle", a fictional job queue. The archetype:
 * asymmetric on purpose, because that is what documentation actually looks
 * like. The guide is four levels deep and built from five files; the reference
 * is one level deep, fourteen entries wide, and built from zero files.
 */
const nav = () => ({
	meta: import.meta,
	title: "Kettle docs",

	// deep · flat · medium — and the shapes are declared differently on purpose
	children: "guide reference tutorials",

	// `full` minus `position: fixed`, in patterns.css. Without it the columns
	// share one scrollbar and a long guide page drags the whole site with it.
	classes: "patterns-fills",

	content(){
		this.$pages = div.c("pages cols", () => div.c("col", () => this.contents()));
	},
});

export default new Page(nav(), {

	contents(){
		recipe(nav);

		p("Three sections, one region classed `cols`, and every child mounts into it by walking up — none of them mentions columns, or me.");

		section("Contents");

		this.previews();

		section("Same tree, three ways of declaring it");

		code(`
guide/       5 files      lazy, four levels deep
reference/   0 files      14 inline children, one level, from an array
tutorials/   0 files      3 inline children, one level`, "one docs site, three tiers");

		p("The file tree and the url tree are the same tree only when you want them to be. A reference of fourteen configuration keys is real content with fourteen real urls, and making fourteen directories for it would be filing, not authoring.").ac("note");

		section("Where the replacement is not sufficient");

		code(`
/patterns/docs/                          1 column   1160px
/patterns/docs/guide/                    2           580 | 580
/patterns/docs/guide/concepts/           3           387 | 387 | 387
/patterns/docs/guide/concepts/batches/   4           290 | 290 | 290 | 290`,
			"measured, 1400px viewport");

		p("`ColumnPager` showed the last two of the chain. `.cols` shows all of them, and nothing caps it — so the deeper the guide, the narrower the reading column, which is precisely backwards. Four levels is not an unusual guide.").ac("note");

		section("…and the cards above read differently depending on how you got here");

		code(`
CONTENTS, on this very page

reload  /patterns/docs/guide/concepts/batches/   ->  Guide  reference  tutorials
click   / -> /patterns/ -> /patterns/docs/ -> …  ->  guide  reference  tutorials`,
			"measured, character by character");

		p("A cold deep load resolves the whole chain before anything renders, so `previews()` finds `guide` already loaded and prints its title. Click your way in and `previews()` runs at `/patterns/docs/`, when `guide` is still `null` — so it prints the declared name, and because a page is built once it never says anything else.");

		p("`tabs()` refuses to do this on purpose: it prints declared names so a bar cannot read differently per entry point. `previews()` has the same problem and does not have the same rule — which makes it the second measured counterexample to “clicking produces byte-identical output to reloading”.").ac("note");

		div.c("row", () => {
			a.c("page-link", "go four deep and watch it →").href("/patterns/docs/guide/concepts/batches/");
			a.c("page-link", "the API reference").href("/patterns/api/");
		});
	},
});
