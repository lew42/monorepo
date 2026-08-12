import View, { div, a, span, code, button, icon, is } from "../core/View/View.js";
import { source } from "../util/source/source.js";

/* A <style> tag, with the layer statement written for you — a short `@layer`
 * list silently drops `site` past `util`, so no caller gets to forget it. */
export const css = rules => new View({ tag: "style", capture: false })
	.text("@layer base, theme, site, util;\n" + rules)
	.append_to(document.head);

// A component function, plus the `.c("classes", …)` form every View factory has.
export const component = fn => Object.assign(fn, {
	c: (classes, ...args) => fn(...args).ac(classes),
});

/**
 * palette(["label", render, url?], …) — the variants side by side, so a reader
 * compares before reading. Every ui page opens with one.
 */
export const palette = (...items) => div.c("ui-palette grid gap auto", () =>
	items.forEach(([label, render, url]) => div.c("flex v gap", () => {
		div.c("ui-stage", render);
		url ? a.c("page-link h4", label).href(url) : span.c("h4 muted", label);
	}).style("--gap", "0.4em"))).style("--column", "14em");

/**
 * copy(fn | text, lang?) — a code block with a copy button. This is what a
 * component documented as a template ships instead of a function.
 *
 * Pass the **function that rendered the example** and the two cannot drift: the
 * reader copies the code that ran, and the IDE was checking it all along.
 */
export const copy = (fn, lang = "js") => {
	const text = is.fn(fn) ? source(fn) : fn;

	return div.c("ui-copy", () => {
		(code[lang] ?? code)(text);

		button.c("ui-copy-btn", () => icon("content_copy")).attr("title", "Copy").click(function(){
			navigator.clipboard.writeText(text);
			this.empty(() => icon("check")).ac("ui-copied");
			setTimeout(() => this.empty(() => icon("content_copy")).rc("ui-copied"), 1400);
		});
	});
};

css(`@layer theme {
	.ui-pill { background: var(--wash); border-radius: 999px; padding: 0.15em 0.7em; }

	.ui-stage {
		display: flex;
		align-items: center;
		padding: 0.75em;
		border: 1px dashed var(--line);
		border-radius: var(--radius);
	}
	.ui-stage > * { min-width: 0; max-width: 100%; }

	.ui-copy { position: relative; }
	.ui-copy-btn { position: absolute; top: 0.5em; right: 0.5em; padding: 0.2em 0.4em; }
	.ui-copy-btn.ui-copied { border-color: var(--prim); color: var(--prim); }
}
@layer util {
	/* ⚠ util, not theme: the rule it opts out of is input:not(…), whose :not()
	   carries an attribute selector's specificity. A later layer wins regardless. */
	.ui-tags-input { border: none; background: none; padding: 0; min-width: 7em; }
}`);
