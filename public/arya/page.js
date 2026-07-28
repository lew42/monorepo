import { h2, p, ol, li, strong } from "/app.js";
import Page from "./lib/Page.js";
import { demo, snippet, note, cards } from "./lib/ui.js";

export default new Page(import.meta, {

	body() {
		p("No build step, no bundler, no JSX. You write JavaScript that calls functions named after HTML tags, and those tags appear on the page.");

		h2("The one rule");

		p("Calling a tag function creates that element ", strong("and puts it where you are"), ". There is no `return`, no template, no `appendChild`. This is the entire mental model:");

		demo(() => {
			h2("Hello");
			p("Calling p() put this paragraph here.");
		});

		p("Nesting works the same way. Pass a function, and everything called inside it lands inside that element:");

		demo(() => {
			ol(() => {
				li("first");
				li("second");
				li("third");
			});
		});

		note(p("That is the whole idea. Everything else on this site is a method name you can look up when you need it."));

		h2("Your first page");

		p("A page is a folder with a `page.js` in it. The URL maps straight to the folder, so `/public/yourname/page.js` is served at `/yourname/`.");

		snippet(`// public/yourname/page.js
import { h1, p } from "/app.js";

h1("Hello world");
p("Edit this file, refresh, done.");`);

		p("Run `node server.js`, open `http://localhost/yourname/`, and it is on screen. To make a sub page, make a sub folder with its own `page.js`.");

		h2("Two things that will trip you up");

		p("Both of these cost me time, so they are worth 30 seconds now.");

		p(strong("Trailing slashes matter."), " `/yourname/` loads `page.js` out of that folder. `/yourname` without the slash looks for `yourname.page.js` next to it instead, and you get a page load error.");

		p(strong("A typo in a stylesheet path gives you a blank white page"), " with nothing in the console. The app waits for every stylesheet before it renders anything, and a request that 404s never finishes loading. Copy your `app.stylesheet()` path carefully.");

		p("Both are written up, with a suggested fix, in Suggestions.");

		h2("Where to go next");

		cards("/arya/framework/", "/arya/styles/", "/arya/framework/page/", "/arya/notes/");
	}
});
