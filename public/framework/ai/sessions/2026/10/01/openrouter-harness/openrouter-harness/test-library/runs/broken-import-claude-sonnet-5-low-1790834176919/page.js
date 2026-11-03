import { Page, p } from "/app.js";
import { formatDate } from "./dates.js";

/* This run's copy of the openrouter test library's "broken-import" fixture
 * (Servex/ext/openrouter/evals/library/broken-import/test.json). The import
 * path was wrong (./date.js instead of ./dates.js); fixed here so this run's
 * page loads. */
export default new Page({
	meta: import.meta,
	title: "Last updated",
	description: "Shows the date — broken on purpose, for the model test library.",

	content(){
		p("Last updated: " + formatDate(new Date()));
	}
});
