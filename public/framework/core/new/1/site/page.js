import { Page, p } from "/app.js";
import { code, section } from "./ui.js";

export default new Page({
	meta: import.meta,
	title: "new/1",

	// ALL LAZY. Not one of these is imported until you walk to it — watch the
	// console: the import line appears on the click, never on this load. The
	// second row is the Navigation Recipes library, one section per council seat.
	children: "replace columns tabs dynamic full nav compound compose deep library chrome patterns motion a11y perf async urls content forms versus council start state kit mutation sitemap budget",

	content(){
		code(`
App      boot, the ONE flat container, and nothing else
Page     a node: url, content, children — eager OR lazy
Router   url -> page, the chain diff, and the marking`, "three classes");

		// p() does backticks only — NOT markdown. `**name**` would ship literal
		// asterisks to the screen; measured by the async seat.
		p("new/0 with a Router and lazy children. The flat container and modes-as-data are unchanged; what's new is that a child can be a `name` instead of an import.");

		section("Two tiers, one tree");

		code(`
children: [intro, guide]     // eager — imported with me
children: "intro guide"      // lazy  — imported when the Router walks to me`);

		p("They compose at any depth. This page declares all three children lazily; `/replace/` declares its child eagerly; `/columns/` is lazy and its child is eager again.").ac("note");

		section("What new/0 could not do");

		code(`
new/0   .parent from the parent's constructor, adopt() recursing the whole tree
        -> the tree must already exist -> visiting any url imports the WHOLE site

new/1   adopt() recurses the children that EXIST and runs out at the lazy
        boundary, because names are strings and there is nothing to recurse into`);

		p("That one sentence is the whole of new/1. Everything else follows from it.").ac("note");

		section("Pick one");

		this.previews();

		section("Navigation recipes");

		p("Six sections, each written by one seat of the design council. The first four above are the *mechanisms*; these are what you build with them.").ac("note");

		code(`
/nav/        primitives     each mechanism alone, in its simplest form
/compound/   compound       two or more navigation layers combined
/deep/       depth & edges  5 levels, hundreds of urls, and what breaks
/library/    layout library live layouts rendered small; click for full size
/chrome/     chrome         sidebars, crumbs, palettes, responsive shells
/patterns/   applied IA     whole miniature products — docs, API ref, settings
/motion/     transitions    animating in and out of display:none
/a11y/       access         focus, announcement, and the focus order under .full
/perf/       cost           what a navigation actually costs, in numbers
/async/      late content   the captor trap, and content that arrives after paint
/urls/       url design     the schema, trailing slashes, aliases, the query string
/content/    written work   markdown, tags, and the graph a tree cannot express
/forms/      unsaved work   what survives a navigation, and what can refuse one
/versus/     comparison     against ColumnPager, new/0, starter, and the field`, "one section per seat");

		p("Every page in every section shows the code that produced it.").ac("note");
	}
});
