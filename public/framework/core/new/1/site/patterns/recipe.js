import { div, pre } from "/app.js";
import { source } from "/framework/util/source/source.js";

/* recipe(nav) — show the navigation that produced this page, by printing the
 * SAME object that built it.
 *
 * Every product in this section declares
 *
 *     const nav = () => ({ meta, title, children, content(){ … } });
 *     export default new Page(nav(), { …everything the page SAYS… });
 *
 * so the function on screen is the function that ran. Not a description of it
 * and not a copy of it: there is no second source to fall out of date, and a
 * mistake in it is a runtime error rather than a lie on the page.
 *
 * The two-object split is what makes it readable. A realistic product page is
 * long and almost all of it is content — which is exactly the part a reader of
 * THIS site does not want. Navigation in the first object, content in the
 * second, and the box shows the first.
 */
export function recipe(fn, label = "the navigation — the object that built this page"){
	return div.c("code", () => {
		div.c("code-label", label);
		pre(unwrap(source(fn)));
	});
}

// `() => ({ … })` — those parens belong to the arrow, not to the object
function unwrap(src){
	return src.startsWith("(") && src.endsWith(")") ? src.slice(1, -1).trim() : src;
}

export default recipe;
