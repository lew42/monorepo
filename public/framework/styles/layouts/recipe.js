import { div, code, md, details, summary } from "/app.js";

/* recipe(page, note) — the setup, inside the layout it sets up.
 *
 *     recipe(this, "Three bands. The middle one is `flex-1`.");
 *
 * The class string comes off the page, so it is the string that actually shaped
 * what you are looking at. Closed by default: a recipe lives in whichever region
 * the layout can spare, and the narrowest is a 14em rail.
 *
 * ⚠ `code.file()` returns a PROMISE — the placed `div` is what fills.
 */
export default function recipe(page, note){
	return div.c("pad flex v gap surface").style("--gap", "0.8em").append(() => {
		div.c("h4", "The recipe");

		code.js(`classes: "${page.classes ?? ""}"`);

		if (note) md(note);

		details(() => {
			summary("page.js");
			return code.file(page.meta, "page.js");
		});
	});
}

export { recipe };
