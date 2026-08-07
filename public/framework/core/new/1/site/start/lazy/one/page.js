import { Page, p, a } from "/app.js";
import { source } from "../../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "One",

	content(){
		source(import.meta);

		p("Fetched on the click that brought you here, not before. Go back and my card will read `One` — my title — because I am in memory now.").ac("note");

		a.c("page-link", "← Lazy").href("/start/lazy/");
	}
});
