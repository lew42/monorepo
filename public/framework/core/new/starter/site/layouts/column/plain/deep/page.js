import { Page, p } from "/app.js";
import { code } from "../../../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Deep",

	content(){
		p("I replaced my parent instead of standing beside it. Its text is gone from column 2 — hidden by CSS, not destroyed. That is what “switcher” means here.");

		code(`
.page.columns.active-ancestor     ← "2 · Columns"   splits
  .page.active-ancestor           ← "plain"         steps aside
    .page.active-page             ← "Deep"          takes its place`, "the classes, right now");

		p("Nobody made a mistake. `plain/page.js` never asked for columns, so it got the default — the correct behaviour for a page that didn't opt in, and the wrong result for the layout that wanted three columns.").ac("note");
	}
});
