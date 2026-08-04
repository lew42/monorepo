import { Page, p, a } from "/app.js";
import { source } from "../../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "Two",

	content(){
		source(import.meta);

		p("Still nothing special. A page does not know or care whether it was declared by name or imported — it arrives the same way either way.").ac("note");

		a.c("page-link", "← Lazy").href("/start/lazy/");
	}
});
