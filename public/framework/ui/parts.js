import View from "../core/View/View.js";

export const css = rules => new View({ tag: "style", capture: false }).text(rules).append_to(document.head);

// A component function, plus the `.c("classes", …)` form every View factory has.
export const component = fn => Object.assign(fn, {
	c: (classes, ...args) => fn(...args).ac(classes),
});

/* `palette()` and `copy()` lived here and are gone (readme.md, "The unification").
 * A component's variants are child PAGES now, previewed with the one card system;
 * the code is `demo.exhibit()`'s source block, which grew the copy button. */

css(`@layer theme {
	.ui-pill { background: var(--wash); border-radius: 999px; padding: 0.15em 0.7em; }
}
@layer util {
	/* ⚠ util, not theme: the rule it opts out of is input:not(…), whose :not()
	   carries an attribute selector's specificity. A later layer wins regardless. */
	.ui-tags-input { border: none; background: none; padding: 0; min-width: 7em; }
}`);
