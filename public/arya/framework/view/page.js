import { el, h2, p, div, span, button, strong, a } from "/app.js";
import Page from "../../lib/Page.js";
import { demo, snippet, note, api } from "../../lib/ui.js";

export default new Page(import.meta, {

	body() {
		p("Every tag function returns a `View`. A view owns one DOM element, reachable at `.el` if you ever need the real thing. Almost every method returns the view, so calls chain.");

		h2("Making one");

		p("There are three ways in, and you will use the first two constantly:");

		api({
			'p("text")': "the tag name, called as a function",
			'p.c("cls", "text")': "same, with classes first — `.c` is on every tag function",
			'el("figure", "text")': "for a tag that has no shortcut, and `el.c(tag, cls, ...)` for classes"
		});

		demo(() => {
			p("plain");
			p.c("uppercase", "with a class — uppercase is a real framework.css utility");
			el("figure", "an el() tag, for anything without a shortcut");
		});

		h2("Arguments are flexible");

		p("Anything you pass to a tag function, or to `.append()`, gets handled by type. Strings become text, views become children, arrays are unpacked, and a function is run with the capture pointer aimed at this element.");

		demo(() => {
			div.c("pad", "text ", span("a view"), " ", ["and", " an array"], () => {
				strong(" and a function");
			}).style("background", "#eee");
		});

		note(p("A promise works too. `div(fetch(...).then(r => r.text()))` appends the result when it lands, though several promises in one parent will finish in whatever order they resolve."));

		h2("Classes");

		api({
			'.ac("a b")': "add classes, space separated",
			'.rc("a b")': "remove classes",
			'.hc("a")': "returns true or false",
			'.tc("a b")': "toggle classes",
			'.c("a b")': "only on the tag functions, not on an instance"
		});

		demo(() => {
			const box = div.c("pad", "click me to toggle the uppercase class")
				.style({ background: "#eee", cursor: "pointer" });

			box.click(() => box.tc("uppercase"));
		});

		h2("Content");

		api({
			".append(...)": "add children, same rules as the constructor",
			".empty(...)": "remove every child, then optionally append",
			".text(value)": "get or set `textContent`",
			".html(value)": "get or set `innerHTML` — never hand this user input",
			".remove()": "detach from the DOM"
		});

		h2("Attributes, style and events");

		api({
			'.attr("name", value)': "one argument gets, two sets",
			'.href("/path")': "shortcut for `.attr(\"href\", ...)`",
			'.style("color", "red")': "inline style — pass an object to set several at once",
			'.click(fn)': "shortcut for `.on(\"click\", fn)`",
			'.on("event", fn)': "listener, with `this` bound to the view",
			".hide() / .show()": "sets `display: none` and back"
		});

		demo(() => {
			const count = span("0");
			let n = 0;

			div.c("flex gap v-center", () => {
				button("add one").ac("prim").click(() => count.text(++n));
				div("clicks: ", count);
			});
		});

		h2("Backticks");

		p("`p()` is special: text you pass it gets scanned for backticks, and each `backticked` run becomes a `code` element. It is why the prose on this site reads the way it does.");

		demo(() => {
			p("Call `app.stylesheet()` to load CSS.");
			div("But `div()` does not do this.");
		});

		note(p("Only `p()` behaves this way. `li()`, `div()` and the rest pass strings straight through, which surprised me the first time a list item rendered with visible backticks in it."));

		h2("Loading other files");

		api({
			".load(import.meta, url)": "import a module and append its default export when it arrives",
			".lazy(import.meta, url)": "the same, but queued so several loads keep their order"
		});

		snippet(`div.c("sidebar").load(import.meta, "./sidebar.js");`);

		h2("Writing your own");

		p("Two options. Extend `View` when you want a real element with behaviour attached — you get capturing, and the class name becomes a CSS class automatically:");

		snippet(`import { View, div, h3, p } from "/app.js";

export class Card extends View {
    render(){
        h3(this.title);
        p(this.text);
    }
}

new Card({ title: "Hi", text: "..." });   // <div class="card">`);

		p("Or skip `View` entirely. `.append()` calls `.render()` on any object that has one, so a plain object is enough when you only need to group some markup:");

		snippet(`export default {
    render(){
        h3("No class needed");
    }
};`);

		p("That second form is what makes ", a("class Page").href("/arya/framework/page/"), " possible.");
	}
});
