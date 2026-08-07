import { Page, p, a } from "/app.js";
import { code } from "../../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Grandchild",

	content(){
		p("Column 3, three deep and equal. I declare nothing at all — no mode, no children, no override.");

		code(`
chain     / › /columns/ › /columns/child/ › /columns/child/grandchild/
mode      findLast finds "columns" on /columns/
order     0        1              2                3
visible   hidden   column 1       column 2         column 3`);

		p("Four columns, not three — the root is an ancestor too, so it gets a track like everyone else. Measured at 290px each in a 1400px window. Nothing declares a column count; `grid-auto-flow: column` grows one track per visible page, so the count follows the url.").ac("note");

		a.c("page-link", "← Column child").href("/columns/child/");
		a.c("page-link", "Full").href("/full/");
	}
});
