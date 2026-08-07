import { Page, p, div, el } from "/app.js";
import demo from "/framework/ext/demo/demo.js";
import { section } from "../../ui.js";
import { js, transcript } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Headings and landmarks",
	classes: "a11y-page",

	content(){

		transcript(`
/columns/child/grandchild/       three pages on screen at once
  h1  "Columns"
  h2  "What arranges this"
  h1  "Column child"
  h2  "Lazy above me, eager below me"
  h1  "Grandchild"

/tabs/notes/
  h1  "Tabs"
  h1  "Overview"     ← visible, and NOT in the chain
  h1  "notes"

landmarks on every route:  []`, "measured — heading and landmark dumps at depth");

		p("Three level-one headings on one screen, and no landmarks anywhere. The document outline algorithm that would have demoted nested `h1`s was never implemented by any browser or screen reader, so all three are announced as \"heading level 1\" — a user pressing `1` cycles between three things that each claim to be the top.").ac("note");

		section("The obvious fix is a bug");

		js(function heading_level_from_depth(){
			// DO NOT SHIP THIS
			const level = Math.min(this.chain().length, 6);
			return el(`h${level}`, this.title);
		}, "Page.render() — rejected");

		transcript(`
the SAME page, two entry points

  /columns/child/       "Column child" is the leaf     →  h1
  /columns/child/gc/    "Column child" is a column     →  h2

→ the page reads differently depending on which url you arrived at.`);

		p("That is the bug the readme already names, in a different costume: *\"the first tab's label changes depending on which tab renders\"*. `tabs()` solved it by making the label deterministic — the declared name, always. A heading level computed from the chain would reintroduce exactly what that rule was written to stop.").ac("note");

		section("Position: the level stays, the landmark carries the depth");

		transcript(`
                    with role=region + aria-label on every .page

/columns/child/gc/   regions ["Columns", "Column child", "Grandchild"]
/tabs/api/           regions ["Tabs", "API reference", "state"]
/full/left/deeper/   regions ["Full", "Left", "Deeper"]`, "measured, with the proposed Page.render()");

		p("The landmark list *is* the breadcrumb, and it costs nothing to keep true, because a hidden page is `display: none` and `display: none` is not in the accessibility tree. **The set of landmarks is exactly the set of visible pages, by construction** — there is nothing to synchronise and nothing that can drift.").ac("note");

		p("Look at the tabs row. `state` is the other tab set's default: visible, on screen, and not in the chain — the case the `.tab-panel:not(:has(…))` rule creates. It is a region because it is *there*, which is the right answer and the one nobody had to write.").ac("note");

		section("Which is why this goes in render(), not activate()");

		transcript(`
/a11y/tabs/   regions ["Tabs, or links?"]          ← navigated() names page.chain()
              headings [… "h1 They are links" …]      and a tab default is in no chain

/tabs/notes/  regions ["Tabs", "API reference", "state"]
                                                   ← the proposed Page.render()

The default tab is rendered by tabs() with .render(), never .activate() —
it is visible without ever entering the chain. Anything hung on activate()
misses it. render() is the one place every visible page passes through.`, "measured — the gap, and what closes it");

		p("So the two halves belong in two different places, and not by taste: **the region attributes go in `Page.render()`**, because that is what every visible page runs, and **the focus move goes in the site's `navigated()`**, because only the Router knows which page became current. `navigated()` names `page.chain()`, which is every page in the chain and no page outside it — the table above is exactly that gap.").ac("note");

		section("Live, on this document");

		demo(() => {
			// placed synchronously; filled after app.ready, because the marking
			// pass runs after every content() in the entering slice
			div.c("outline", async $outline => {
				await this.app.ready;

				const rows = [...this.app.$app.el.querySelectorAll("h1, h2, h3, [role=region]")]
					.filter(node => node.getClientRects().length)
					.map(node => [
						node.tagName === "DIV" ? "region" : node.tagName.toLowerCase(),
						node.getAttribute("aria-label") ?? node.textContent.replace(/\s+/g, " ").trim().slice(0, 44),
					]);

				$outline.append(() => el.c("table", "grid", () => {
					el("tr", () => ["exposed as", "name"].forEach(head => el("th", head)));
					rows.forEach(([kind, name]) => el("tr", () => {
						el("td", kind).ac("num").ac(kind === "region" && "pass");
						el("td", name);
					}));
				}));
			});
		}, "Everything a screen reader can jump to on this page, right now. The regions come from the site's `navigated()`; the headings are the page's own.");

		section("So what carries the hierarchy?");

		transcript(`
the url            /columns/child/grandchild/     already exact
landmarks          the visible pages, nested      free, and cannot drift
a breadcrumb       <nav aria-label="Breadcrumb">  the site's job
heading levels     h1 everywhere                  stable per page

Three of those are stable and one is not. Depth belongs to the three.`);

		p("A breadcrumb is the standard, boring, correct answer to *\"where am I in the tree\"*, and it belongs to the site — `Router.mark_links()` already gives it `.in-path`, so it needs nothing from the framework it does not already have.").ac("note");

		section("The one place I would accept a second level");

		p("A page that renders **another page inside its own content** — a preview, an embed — is a genuine sub-section, and its title probably should be an `h2`. That is a real case and it is not this one: at depth these pages are siblings in a grid, not nested content. If it ever comes up, the honest fix is a different render for the embedded case, not a level computed from the chain.").ac("note");

		p("Next: **Skip links** — twenty stops before the content, measured.").ac("note");
	},
});
