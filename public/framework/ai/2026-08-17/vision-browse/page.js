import { Page, View, div, h1, md } from "/app.js";
import { row } from "./row.js";

View.stylesheet(import.meta, "vision-browse.css");

const SRC = "/framework/ai/2026-08-17/vision-baseline/baseline.json";

export default new Page({
	meta: import.meta,
	title: "Vision analyses",
	description: "18 pages, ranked best to worst by one model's single pass — the screenshot beside every score and the sentence that drove it.",
	icon: "visibility",

	/* Escapes the day's catalog rail (min(34em, 45%), ai.css) the same way
	   ai/2026-08-17/report/page.js does — 18 screenshots beside their scores
	   need width a task page's region never gives. Own title, per core/Page/doc/layout.md. */
	render(){
		return this.view ??= div.c("page full", () => this.content()).ac(this.name && "page--" + this.name);
	},

	content(){
		h1(this.title);
		this.caveat();

		div.c("vision-rows flow", async $rows => {
			const { rows, shot } = await fetch(SRC).then(r => r.json());
			const ranked = rows.slice().sort((a, b) => b.overall - a.overall);
			$rows.empty(() => ranked.forEach((entry, i) => row(entry, i + 1, shot)));
		});
	},

	caveat(){
		div.c("vision-caveat surface pad flow", () => {
			md("**Not ground truth.** One model, one pass, scored 2026-08-17. A blind re-score of these same 18 images by "
				+ "the same model agreed with itself at only `ICC 0.51` overall, and on four of the six axes — `layout`, "
				+ "`typography`, `hierarchy`, `overall` — the score carried no more information than always guessing one "
				+ "fixed number. Only `contrast` and `density` actually beat that constant (`rubric-v2/agreement.json`).");
			md("Today's build tasks took roughly **169** screenshots across every task; only these **18** were scored. "
				+ "The rest are evidence shots on their own task pages and aren't analysed here.");
		});
	},
});
