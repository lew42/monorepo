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
 * `.wash`, `.muted` in framework.css. `surface` and `pill` went with their last
 * importers (`styles/sections/parts.js`, deleted); a band writes its own three
 * declarations inline where it wants a pill. */
