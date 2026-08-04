import { Page, p, a } from "/app.js";

// Link 1 of 5 in the depth ladder. Deliberately tiny — what is being measured
// is round trips, not parse time.
export default new Page({
	meta: import.meta,
	title: "a",
	children: "b",

	content(){
		p("Segment 4 of the chain. Reaching this url cost four sequential imports — `/`, `perf`, `walk`, `a` — each fetched only after the one before it returned a module.");
		a.c("page-link", "b →").href("/perf/walk/a/b/");
	},
});
