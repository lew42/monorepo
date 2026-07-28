import { h2, p, div, strong } from "/app.js";
import Page from "../lib/Page.js";
import { demo, snippet, note, cards } from "../lib/ui.js";

export default new Page(import.meta, {

	body() {
		p("Two classes, about 600 lines between them, no dependencies. `View` is one element. `App` is the thing that boots.");

		cards("/arya/framework/view/", "/arya/framework/app/", "/arya/framework/page/");

		h2("View is one element");

		p("`h1`, `p`, `div`, `a` and every other tag name are functions exported from `/app.js`. Each one makes a `View`, which wraps exactly one DOM element and gives you chainable methods for it.");

		demo(() => {
			div.c("pad", "I am a div with class pad")
				.style("background", "#eee");
		});

		p("`div.c(...)` is `div()` plus classes. Every method returns the view, so you keep chaining until you stop.");

		h2("Capturing is the part that feels like magic");

		p("You never wrote `appendChild` above, and you never assigned the div to a variable. That is because ", strong("View keeps a pointer to whatever element is currently being built"), ", and a new view attaches itself to it on creation.");

		p("Passing a function moves that pointer for the length of the call:");

		demo(() => {
			div.c("pad", () => {
				p("inside");
				p("also inside");
			});
			p("back outside");
		});

		note(p("This is why order matters and why you rarely need variables. It is also the one thing to keep in mind when you write your own class: build inside a function, not at the top level of a module."));

		h2("App is the thing that boots");

		p("`index.html` loads `/app.js`, which creates one `App`. The app looks at `window.location.pathname`, imports the matching `page.js`, waits for stylesheets, and only then puts anything in the DOM. That last part is why you never see a flash of unstyled content.");

		snippet(`/            ->  /page.js
/yourname/   ->  /yourname/page.js
/yourname    ->  /yourname.page.js   <- note the difference`);

		p("The app is on `window.app`, but importing it is cleaner:");

		snippet(`import app, { h1, p } from "/app.js";

app.stylesheet("/yourname/styles.css");`);

		h2("That is the whole framework");

		p("Everything past this point is method names. The two reference pages list them, and the Styles section covers what `framework.css` gives you before you write a line of your own CSS.");
	}
});
