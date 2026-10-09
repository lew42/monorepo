import { Page, p, a, span } from "/app.js";
import RefineDemo from "./RefineDemo.js";

/**
 * The Refine page is ONE workspace (owner feedback 2026-10-09): sticky toolbar (mic, Refine, model, cost, status),
 * the stages side by side, a sticky footer. The older saved-run ladder lives one click away at `ladder/`,
 * and the model-comparison tool at `try/`.
 */
export default new Page({
	meta: import.meta,
	title: "Refine",
	description: "Speak one prompt: see it cleaned instantly, then refined into an outline with a clarity score per sentence.",
	icon: "fact_check",
	children: "try ladder",

	content(){
		new RefineDemo().ac("wide");
		p(() => {
			a("Saved long run (ladder)").href(new URL("ladder/", import.meta.url).pathname);
			span(" · ");
			a("Compare models (try)").href(new URL("try/", import.meta.url).pathname);
			span(" · ");
			a("How it fits (architecture)").href("/framework/ext/Refine/md/doc/architecture/");
		});
	},
});
