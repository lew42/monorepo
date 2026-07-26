import { Page2, p, pre, table, thead, tbody, tr, th, td, details, summary } from "/app.js";

export default new Page2({
	meta: import.meta,
	title: "Other",
	description: "Preformatted code, tables, disclosure.",
	content(){
		p("A `pre` block — base styles give it horizontal scroll so long lines never break the layout:");

		pre(`const app = window.app = new App({
    nav(){ /* ... */ }
});`);

		p("A table:");

		table(() => {
			thead(tr(() => { th("Class"); th("Effect"); }));
			tbody(() => {
				tr(() => { td("flex"); td("display: flex"); });
				tr(() => { td("gap"); td("gap: 1em"); });
				tr(() => { td("grid.auto"); td("auto-fit columns"); });
			});
		});

		p("A native disclosure widget:");

		details(() => {
			summary("Show more");
			p("Hidden content, revealed on toggle — no JavaScript needed.");
		});
	}
});
