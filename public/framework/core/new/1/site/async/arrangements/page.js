import { Page, p, div, a } from "/app.js";
import { code, section } from "../../ui.js";
import { probe, source } from "../lab.js";

export default new Page({
	meta: import.meta,
	title: "Three arrangements",

	/* Three children, three mounts, ONE probe function. Nothing about the pages
	 * differs except where container() puts them. */
	initialize(){
		this.add("in-tab", () => {
			p("I am a tab. My view lives in my parent's `regions` panel.");
			probe();
		});

		this.add("beside", () => p("A second tab, so the bar has two. I do nothing."));

		this.add("in-column", () => {
			p("I am a column. My view lives in my parent's `$pages`, classed `cols`.");
			probe();
			a.c("page-link", "← back").href("/async/arrangements/");
		});

		this.add("in-full", {
			classes: "full",
			content(){
				p("I cover the window: `position: fixed; inset: 0; z-index: 10`.");
				probe();
				p("Whatever the probe reports is directly underneath me, and you cannot see it.").ac("note");
				a.c("page-link", "← back").href("/async/arrangements/");
			},
		});
	},

	content(){
		p("The captor is one global, so the orphan always goes to the same place. What changes is whether you can see it — which is why one bug gets reported three times.");

		code(source(probe), "lab.js — the identical function all three run");

		section("1 · inside a tab panel");

		this.$tabs = this.tabs("in-tab beside");

		section("2 · inside a column · 3 · inside a full page");

		div.c("row", () => {
			a.c("page-link", "in-column").href("/async/arrangements/in-column/");
			a.c("page-link", "in-full").href("/async/arrangements/in-full/");
		});

		section("Measured — all three");

		code(`
View.captor at rest                body > div.app > div.pages
                                   (app.$pages · stack depth 1 · every route)

in a tab panel     orphan →        body > div.app > div.pages
in a column        orphan →        body > div.app > div.pages
in a full page     orphan →        body > div.app > div.pages`, "playwright, 1400×800");

		p("One destination. `View.captor` is set once, by `App.render()`, and nothing ever restores it to anything else — an arrangement is CSS on `.pages` and `.page`, and CSS cannot move a captor.").ac("note");

		section("…so why does it look like three bugs?");

		code(`
tab panel     the orphan is a flex sibling of the tabs page, OUTSIDE the panel
              → "my tab content is rendering next to the tab bar"

column        the orphan is a flex item in the OUTER .pages, beside the whole
              column set — the grid does not contain it
              → "my columns are the wrong width"

full page     .page.full is position:fixed; inset:0; z-index:10, so the orphan
              is behind it. Hit-tested at its own coordinates: elementFromPoint
              returns .page.full, not the orphan
              → nothing. No symptom at all, until you leave the full page`);

		p("The third is the dangerous one. A full page hides the evidence completely, so the bug ships, and then surfaces on a totally unrelated screen as mystery whitespace.").ac("note");

		section("The rule does not change");

		code(`
div.c("results", async $results => {     ← placed while the captor is ours
    const data = await load();
    $results.append(…);                  ← named, so the captor is irrelevant
});`);

		p("A named view is a named view in a panel, a column, a full page, or nothing at all. That is why the shape is worth learning once: it is the only one that does not have to know where it is.").ac("note");

		a.c("page-link", "the rule →").href("/async/rule/");
	}
});
