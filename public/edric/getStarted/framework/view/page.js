import { Page, h2, md, code, div } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "View",
	description: "Every tag function returns one. The methods you build with.",

	content(){
		code.js(`div.c("flex gap", () => {
    p("child 1");
    p("child 2");
});`).ac("mb");
		md("Every tag function (`h1, p, div, a`...) returns a `View`, wrapping one DOM element. You mostly just call methods on it.").ac("mb");

		div.c("flex gap", () => {
			div.c("flex-1", () => {
				h2("Classes").ac("mb");

				code.js(`div.c("flex gap");`).ac("mb");
				md("`.c(\"cls\")`: create with a class.").ac("mb");

				code.js(`div().ac("flex gap");`).ac("mb");
				md("`.ac(\"cls\")`: add a class (or several, space-separated) after the fact.").ac("mb");

				code.js(`div().rc("flex gap");`).ac("mb");
				md("`.rc(\"cls\")`: remove a class.").ac("mb");

				code.js(`if (div().hc("active")) {
    // ...
}`).ac("mb");
				md("`.hc(\"cls\")`: check if it has a class.").ac("mb");

				code.js(`div().tc("active");`).ac("mb");
				md("`.tc(\"cls\")`: toggle a class on/off.").ac("mb");

				h2("Content").ac("mb");

				code.js(`div().append(p("hello"), " ", a("link").href("/"));`).ac("mb");
				md("`.append(...)`: add children, views, text, DOM nodes, arrays, or a function that builds them.").ac("mb");

				code.js(`div().prepend(p("this goes first"));`).ac("mb");
				md("`.prepend(...)`: same as `.append()`, but adds to the start.").ac("mb");

				code.js(`div().empty(p("fresh content"));`).ac("mb");
				md("`.empty(...)`: clear all children, optionally append new ones.").ac("mb");

				code.js(`p().text("Hello");`).ac("mb");
				md("`.text(value)`: get or set the text content.").ac("mb");

				code.js(`div().html("<b>Hello</b>");`).ac("mb");
				md("`.html(value)`: get or set the inner HTML.").ac("mb");

				code.js(`p("Use \`.style()\` to set CSS.");`).ac("mb");
				md("Inside `p(...)`, text wrapped in backticks (like this) automatically becomes `code`.").ac("mb");
			}).style("min-width", "0");

			div.c("flex-1", () => {
				h2("Attributes & events").ac("mb");

				code.js(`div().attr("data-id", "42");`).ac("mb");
				md("`.attr(name, value)`: get or set an HTML attribute.").ac("mb");

				code.js(`a("Home").href("/");`).ac("mb");
				md("`.href(url)`: shortcut for `.attr(\"href\", url)`.").ac("mb");

				code.js(`div().style({ padding: "1em", color: "red" });`).ac("mb");
				md("`.style(prop, value)`: get or set inline CSS. Pass an object to set several at once.").ac("mb");

				code.js(`const log = () => console.log("clicked");
button("Click me").on("click", log);`).ac("mb");
				md("`.on(event, cb)` / `.off(event, cb)`: add or remove an event listener.").ac("mb");

				code.js(`button("Click me").click(() => console.log("clicked!"));`).ac("mb");
				md("`.click(cb)`: shortcut for `.on(\"click\", cb)`.").ac("mb");

				h2("Visibility & structure").ac("mb");

				code.js(`const box = div();
box.hide(); // later...
box.show();`).ac("mb");
				md("`.hide()` / `.show()` / `.toggle()`: control `display`.").ac("mb");

				code.js(`div().remove();`).ac("mb");
				md("`.remove()`: remove it from the page.").ac("mb");

				code.js(`oldView.replace(newView);`).ac("mb");
				md("`.replace(view)`: swap it out for another view.").ac("mb");

				code.js(`div.c("item").repeat(3); // three copies`).ac("mb");
				md("`.clone()` / `.repeat(n)`: duplicate it.").ac("mb");

				code.js(`p("Hello").append_to(app.$app);`).ac("mb");
				md("`.append_to(view)` / `.prepend_to(view)`: attach it somewhere else instead of where it was created.").ac("mb");

				h2("Loading other files").ac("mb");

				code.js(`div().load(import.meta, "./widget.js");`).ac("mb");
				md("`.load(meta, url)`: dynamically import a module and append its default export.").ac("mb");

				code.js(`div().lazy(import.meta, "./widget.js");`).ac("mb");
				md("`.lazy(meta, url)`: same as `.load()`, but waits its turn behind earlier `.lazy()` calls.").ac("mb");
			}).style("min-width", "0");
		}).ac("mb");

		md("There are a few more internal methods in `View.js` (`prerender`, `classify`, `buffer`/`flush`...) the framework uses under the hood, you won't need to call those directly when starting out.").ac("mb");

		md("Next: [Router](/edric/getStarted/framework/router/), what turns a url into one of these.");
	}
});