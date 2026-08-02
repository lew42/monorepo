import { Page, p } from "/app.js";
import { code, section, watch } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "1 · Replace",
	children: "deeper",

	content(){
		code(`
export default new Page({
    meta: import.meta,
    title: "1 · Replace",
    children: "deeper",
});`, "layouts/replace/page.js — no override at all");

		p("The default. My content hides, my child appears in my place, the sidebar never moves.");

		this.previews();

		section("What the default does");

		code(`
activate(){ parent.$pages.append(this.render()); }`, "Page.class.js — the JS half");

		code(`
.page.active-ancestor > .page-content { display: none; }`, "…and the one CSS rule that makes it ‘replace’");

		p("The Router puts `.active-ancestor` on every page above the leaf, so a page steps aside exactly when it has a child on screen. Coming back is one class removal — nothing is destroyed and nothing is rebuilt.").ac("note");

		section("The DOM you end up with");

		code(`
/layouts/replace/deeper/

.page.active-ancestor          ← Home
  .page-content                ← hidden by CSS
  .pages
    .page.active-ancestor      ← layouts
      .page-content            ← hidden
      .pages
        .page.active-ancestor  ← replace
          .pages
            .page.active-page  ← deeper, VISIBLE`);

		p("Every ancestor is still mounted and still in the chain. You see one page because everyone above hid their own content — not because anything was thrown away.");

		watch(
			"Click 'Deeper' below, then come back with the sidebar.",
			"Console: only 'deeper' activates — no ancestor is touched.",
			"Second visit says 'already built, re-using the same DOM node'."
		);
	}
});
