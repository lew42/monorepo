import { div } from "/app.js";
import { section, stat, eyebrow } from "./parts.js";

/* Dashboard, filled. The same `grid gap auto`, retuned with one token — which is
 * the finding the Dashboard layout page is about. */
export default tone => {
	section(tone ?? "prim", () => {
		eyebrow("BY THE NUMBERS");

		div.c("grid gap auto", () => {
			stat("npm dependencies", "3");
			stat("of them in the browser", "0");
			stat("build steps", "0");
			stat("stylesheets a component needs", "0");
		}).style("--column", "9em");
	}).style("--section", "52em");
};
