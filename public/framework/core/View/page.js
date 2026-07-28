import { Page, View, md, demo, div, h1, h2, h3, p, a, ul, li, label, input, span, button } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "View",
	description: "A chainable wrapper over a DOM element, with capturing.",
	content(){

		demo(() => {
			h1("Hello");
			p("A paragraph.");
		}, "Every HTML tag is a function. Call it, and the element appears.");

		md("Every box on this page is live — that code ran here, in this page's `content()`.");

		h2("Nesting");

		demo(() => {
			ul(() => {
				li("First");
				li("Second");
			});
		}, "Pass a **function** and whatever it creates goes inside.");

		demo(() => {
			div(() => {
				h3("Card");
				p("Body");
				a("A link").href("/framework/");
			});
		}, "Nest as deep as you like. This is the one idea in `View` — *capturing*: while your function runs, the new element is the one collecting children.");

		h2("Classes");

		demo(() => {
			div.c("flex gap", () => {
				button.c("prim", "Save");
				button("Cancel");
			});
		}, "`.c()` on any tag: classes first, then children.");

		h2("Chaining");

		demo(() => {
			p("Click me")
				.style("cursor", "pointer")
				.click(function(){ this.text("Clicked.").style("color", "green"); });
		}, "Every method returns the view, so they chain. Inside an event, `this` is the view.");

		demo(() => {
			p("2 + 2 = ", 2 + 2, ". And a ", a("link").href("/"), " inline.");
		}, "Strings, numbers and other views are all just arguments.");

		h2("Put it together");

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
				.style({ border: "1px solid rgba(0,0,0,.15)", borderRadius: ".5em" });
		}, "Data in, DOM out. No template language, no directives — it's a `forEach`.");

		md("That's a component. Wrap it in a function, or in a `View` subclass, and it's reusable.");

		h2("Your own views");

		demo(() => {
			class NoteView extends View {
				render(){
					span("🗒 ");
					span(this.note);
				}
			}

			new NoteView({ note: "I am a div.note" }).ac("pad");
		}, "Subclass `View`, write `render()`. The class name becomes the CSS class, kebab-cased — so `NoteView` renders `div.note`, ready to style.");

		md("It captures like any tag function, so `new NoteView(…)` drops straight into a layout beside `div()` and `p()`.");

		h2("The methods");

		md(`| method | does |
|---|---|
| \`ac\` \`rc\` \`tc\` \`hc\` | add / remove / toggle / has class |
| \`text\` \`html\` | get or set content |
| \`attr\` \`href\` \`style\` | attributes and inline styles |
| \`on\` \`off\` \`click\` | events (\`this\` is the view) |
| \`append\` \`prepend\` \`empty\` \`remove\` \`replace\` | structure |
| \`hide\` \`show\` \`toggle\` | visibility |

Learn six of them and you can build a page.`);

		md("Next: [Page](/framework/core/Page/) — a title, a url, and a place in a tree.");
	}
});
