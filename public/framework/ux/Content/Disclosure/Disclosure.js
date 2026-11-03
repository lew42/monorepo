import { div, details, summary, span, icon } from "../../../core/View/View.js";
import { md } from "/app.js";
import ContentModule from "../ContentModule.js";

/**
 * class Disclosure extends ContentModule — a stack of native <details>: a title you can see,
 * a body that opens below it. Works without JS-driven state (the browser does the toggling).
 *
 *   new Disclosure({ items: [{ title, icon?, body, open? }], stack: "faq" | "flush" | "lines" })
 *
 * `body` is markdown text, or a function that draws any content. One item is a single disclosure.
 * The stack word (one class on the wrapper) is the whole look: gap, corners, dividers.
 */
export default class Disclosure extends ContentModule {

	render(){
		this.ac(`ux-content-${this.stack ?? "faq"}`);
		for (const item of this.items ?? []) this.item(item);
	}

	item(it){
		return details.c("ux-content-disclosure", box => {
			if (it.open) box.attr("open", "");
			summary(() => {
				if (it.icon) icon(it.icon);
				span.c("ux-content-title", it.title);
			});
			div.c("ux-content-body", () => typeof it.body === "function" ? it.body() : md(it.body ?? ""));
		});
	}
}

Disclosure.prototype.classes = "ux-content-stack";

export { Disclosure };
