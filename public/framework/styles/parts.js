import { div, span, md } from "/app.js";

/* next(link, path) — the row every layout page ends with: where to go, and where
 * you are.
 *
 *     next("[Dashboard](/framework/styles/layouts/dashboard/) — the same grid.",
 *          "styles/layouts/cards/");
 */
export const next = (link, path) => div.c("flex v-center split wrap gap", () => {
	md("Next: " + link);
	span.c("h4 muted", path);
});

/* The looks that used to live here as style objects are classes now — `.surface`,
 * `.wash`, `.muted` in framework.css. `surface` stays for `framework/report/`,
 * which quotes it; `pill` has one call site and no class yet.
 */
export const surface = {
	background: "var(--surface)",
	color: "var(--ink)",
	border: "1px solid var(--line)",
	borderRadius: "var(--radius)",
};

export const pill = { background: "var(--wash)", borderRadius: "999px", padding: "0.15em 0.7em" };
