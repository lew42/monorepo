import { Page, p, a } from "/app.js";
import { code } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Replace child",

	content(){
		p("I arrived with my parent, not on demand. In replace mode only I am visible — my parent is mounted one `order` slot to the left and hidden by CSS.");

		code(`
.page             { display: none; }     /* not in the chain */
.page.active-page { display: block; }    /* the leaf, and only the leaf */`);

		a.c("page-link", "← Replace").href("/replace/");
		a.c("page-link", "Columns").href("/columns/");
	}
});
