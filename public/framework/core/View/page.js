import { Page, p, pre, h2 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "View",
	description: "A chainable wrapper over a DOM element, with capturing.",
	content(){
		p("`View` wraps one DOM element (`this.el`) with a chainable API. Every HTML tag is a factory function — calling it creates a view and appends it to the current *captor*.");

		pre(`import { div, h1, p, a } from "/app.js";

div.c("card", () => {          // .c(classes, ...children)
    h1("Title");
    p("Body with a ", a("link").href("/x/"));
});`);

		h2("Capturing");
		p("Pass a function to a factory and it runs with the new view as the captor, so nested calls build nested DOM — that's how the tree above nests without you ever calling `.append()` yourself.");

		h2("Chainable methods");
		p("All return `this`, so they chain: `.ac`/`.rc`/`.tc` (add/remove/toggle class), `.attr`, `.href`, `.text`, `.html`, `.on`/`.click`, `.style`, `.hide`/`.show`, `.empty`, `.append`. Learn a handful and you can build any page.");
	}
});
