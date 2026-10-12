import { Page, p } from "/app.js";
import { formatDate } from "./dates.js"; // WRONG — the real file is ./dates.js (one letter missing)

/* Deliberately broken for the openrouter test library
 * (Servex/ext/openrouter/evals/library/broken-import/test.json): this import
 * 404s because the file is named `dates.js`, not `date.js`, so the whole page
 * throws before it ever renders. The fix is the one path, nothing else. Never
 * fix this file directly: library.mjs copies it into a fresh run dir per run. */
export default new Page({
	meta: import.meta,
	title: "Last updated",
	description: "Shows the date — broken on purpose, for the model test library.",

	content(){
		p("Last updated: " + formatDate(new Date()));
	}
});
