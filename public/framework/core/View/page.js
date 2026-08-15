import { View, classdoc, md, demo, h1, h3, p, ul, li, div, span, button, label, input } from "/app.js";

export default classdoc.page({
	meta: import.meta,
	title: "View",
	description: "A chainable wrapper over a DOM element, with capturing.",
	icon: "image",

	Class: View,

	// Every member, in the order a reader meets them: the everyday API, then the
	// lifecycle, then the plumbing under append(), then the statics.
	methods: "append ac style attr text html on click empty "
		+ "rc tc hc href remove hide show toggle "
		+ "render prerender initialize classify assign "
		+ "append_to append_fn append_promise append_pojo append_prop "
		+ "backtick_append backticks has_class toggle_class html_unsafe "
		+ "load lazy ctrl "
		+ "stylesheet elements body url set_captor restore_captor",

	properties: "el capture tag classes name parent captor previous_captors stylesheets supports_sanitizer",

	notes: "capturing lifecycle",

	content(){

		demo(() => {
			h1("Hello");
			p("A paragraph.");
		}, "Every HTML tag is a function. Call it, and the element appears — that box is this code, running here.");

		demo(() => {
			ul(() => {
				li("First");
				li("Second");
			});
		}, "Pass a **function** and whatever it creates goes *inside*. That is the one idea in `View`, and it nests as deep as you like.");

		demo(() => {
			div.c("flex gap", () => {
				button.c("prim", "Save");
				button("Cancel");
			});
		}, "`.c()` on any tag takes classes first, then children.");

		demo(() => {
			p("Click me")
				.style("cursor", "pointer")
				.click(function(){ this.text("Clicked.").style("color", "green"); });
		}, "Every method returns the view, so they chain. Inside a handler, `this` **is** the view — so use `function`, not an arrow.");

		demo(() => {
			const todos = ["Write a page", "Save the file", "Refresh"];

			div.c("flex v gap pad", () => {
				h3("Today");

				todos.forEach(text => {
					label(() => {
						input().attr("type", "checkbox");
						span(" " + text);
					}).style("cursor", "pointer");
				});
			})
				.style({ border: "1px solid var(--line)", borderRadius: ".5em" });
		}, "Data in, DOM out. No template language, no directives — it's a `forEach`.");

		demo(() => {
			class NoteView extends View {
				render(){
					span("🗒 ");
					span(this.note);
				}
			}

			new NoteView({ note: "I am a div.note" }).ac("pad");
		}, "Subclass `View`, write `render()`. The class name becomes the CSS class, kebab-cased — `NoteView` renders `div.note` — and it captures like any tag function, so it drops straight into a layout beside `div()` and `p()`.");

		md("Every method and property on the left has its own page: the real source, who calls it, and an honest note on whether it should exist at all.");

		md("Next: [Page](/framework/core/Page/) — a title, a url, and a place in a tree.");

		md.details(import.meta, "readme.md", "Design record — capture, and what should be deleted");
	},
});
