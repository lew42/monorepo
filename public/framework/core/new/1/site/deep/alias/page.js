import { Page, p, a, div } from "/app.js";
import { code, section } from "../../ui.js";
import { probe, snippet, whole } from "../probe.js";

export default new Page({
	meta: import.meta,
	title: "A child named after a property",

	// a directory called `view`. This used to break the page; it no longer does,
	// and the probe below explains why without my having to remember.
	children: "view",

	content(){
		probe("ask a fresh Page which of its own properties a child could shadow", (log) => {
			const fresh = new Page({ url: "/probe/", title: "probe" });
			const read_or_written = "view regions $pages loading default_tab parent app col classes content route meta".split(" ");

			read_or_written.forEach(key => log(
				key.padEnd(13),
				key in fresh ? "guarded" : "UNGUARDED — alias() will overwrite it"));

			log("");
			log("Computed, not typed. When Page declares another field this list");
			log("changes by itself — which is the only reason it is still true.");
		});

		p("`alias()` writes a resolved child onto its parent by name — `this.standalone.link()` — and refuses to shadow an existing property with `if (!(key in this))`. `in` sees the prototype and whatever the instance has *right now*.").ac("note");

		section("Most of this was fixed while I was writing the page");

		p("`Page` now declares its seven mutable fields at the top of the class — `view`, `regions`, `$pages`, `loading`, `default_tab`, `parent`, `app` — with no initialisers and no behaviour change. Declaring them is what makes `in` true, so the guard that was always intended now actually holds. Another seat found the same defect from the url side; the class comment records it.");

		p("That is a better fix than the reserved-name list I was going to propose, because it has no second copy to drift: the guard is the declaration, and the top of the file now states the class's whole mutable surface.").ac("note");

		section("What is left, and why the criterion is wrong");

		p("The declared seven are the properties `Page` *assigns* after construction. But `render()` also reads properties the author supplies, and those were not declared — so a child can still shadow them.");

		probe("crash a parent with a url, using no files at all", async (log) => {
			log("/deep/errors/ has a route() that claims any name, so visiting");
			log("/deep/errors/<x>/ adopts a child called <x> before the parent renders.");
			log("");
			log("Cold-loaded, measured:");
			log("");
			log("  /deep/errors/col/        Page Load Error — arg.split is not a function");
			log("  /deep/errors/classes/    Page Load Error — arg.split is not a function");
			log("  /deep/errors/content/    renders (wrong, but harmless)");
			log("  /deep/errors/harmless/   renders correctly");
			log("");

			const fresh = new Page({ url: "/probe/", title: "probe" });
			log("col in a fresh Page    :", "col" in fresh);
			log("classes in a fresh Page:", "classes" in fresh);
			log("");
			log("render() does .ac(this.col).ac(this.classes); View.ac() calls");
			log("arg.split(' ') on whatever it is handed. Handed a Page, it throws.");
		});

		p("This one is worse than the original in one specific way: it needs no author mistake and no file on disk. Any page with a `route()` — the feature that exists so a page can own urls it could not list in advance — can be crashed by a visitor typing a url. `/deep/errors/col/` is a live example.").ac("note");

		snippet("the fix is the same fix, with the right criterion", () => {
			class Complete extends Page {
				// the seven Page ASSIGNS — already declared upstream
				view; regions; $pages; loading; default_tab; parent; app;

				// …and the ones Page READS. render() reaches for every one of
				// these, so a child that shadows one breaks its parent.
				col; classes; content; route; meta;
			}
		});

		p("Five more lines, same mechanism, and it changes the rule from *'every property this class assigns'* to *'every property this class touches'* — which is the criterion that actually matches what `alias()` has to defend.").ac("note");

		section("The divergence that made it hard to see");

		p("Worth keeping on the record even though the common cases are fixed, because it is a property of the adoption order rather than of any one name: a shadowing child breaks the page on a cold load and not on a click.");

		code(`
click   parent.render() ran first  →  "view" is already an own property  →  alias skipped
reload  load_segments() adopts the WHOLE chain, then Router.activate() renders
        →  the alias lands first  →  render() returns a Page where a View belongs`,
			"why the same url behaved two ways");

		div.c("row", () => {
			a.c("page-link", "a directory called view (fine now)").href("/deep/alias/view/");
			a.c("page-link", "route() → col (still breaks)").href("/deep/errors/col/");
		});

		p("Clicking works because the parent has already rendered, so the property exists and `alias()` skips it. Reloading walks and adopts the whole chain before rendering any of it, so the alias lands first. Same url, same files, two outcomes — and `/tabs/` states the opposite as a design guarantee.").ac("note");

		whole(import.meta);
	}
});
