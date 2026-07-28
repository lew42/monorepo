import { h2, p, strong } from "/app.js";
import Page from "../../lib/Page.js";
import { snippet, note, api } from "../../lib/ui.js";

export default new Page(import.meta, {

	body() {
		p("One `App` is created when the site boots, and it is the same object everywhere: `window.app`, or the default export of `/app.js`. You will use maybe four things on it.");

		h2("What you actually call");

		api({
			"app.stylesheet(url)": "load a CSS file, returns a promise the app waits on",
			"app.$body": "the `<body>` view — this is where a theme class goes",
			"app.$app": "the view your page renders into",
			"app.font(name)": "load `\"Montserrat\"` or `\"Material Icons\"`",
			"app.ready": "a promise that resolves after the app has injected itself",
			"app.loaded": "a promise that resolves once every stylesheet and font is in"
		});

		snippet(`import app, { h1 } from "/app.js";

app.stylesheet("/yourname/styles.css");
app.$body.ac("theme-1");

h1("Hello");`);

		note(p("Put both of those lines in one module that all your pages import, rather than repeating them at the top of every `page.js`. Mine live in `lib/Page.js`, so a page never mentions the theme at all."));

		h2("The boot sequence");

		p("Worth reading once, because it explains two behaviours that otherwise look like bugs:");

		snippet(`config()     // dev socket
render()     // make $body and $app, aim the capture pointer at $app
load()       // import this URL's page.js, then await every stylesheet
initialize() // your hook, still detached from the document
inject()     // $body.append($app)  <- first time anything is visible
ready`);

		p(strong("Nothing is in the document until step 5."), " Your page code runs against an element tree that is still in memory, so measuring anything — `offsetWidth`, `getBoundingClientRect` — gives you zero. Wait for `app.ready` if you need real numbers.");

		p(strong("A stylesheet that 404s stalls the whole app."), " `load()` awaits `app.loaded`, and a failed `<link>` never resolves its promise, so `inject()` never runs and you get a blank page with a clean console. Check the network tab first when that happens.");

		h2("How your page is found");

		p("`App.path_to_page_url()` is four lines, and it is the whole router:");

		snippet(`path.endsWith("/")
    ? path + "page.js"     //  /a/b/  ->  /a/b/page.js
    : path + ".page.js"    //  /a/b   ->  /a/b.page.js`);

		p("So `/yourname/` and `/yourname` load different files. Always link with the trailing slash. If the import fails for any reason, the app renders a `Page Load Error` heading with the message — which is helpful for a missing file and slightly misleading for a syntax error inside a file that was found.");

		h2("Whatever page.js exports");

		p("The app appends `mod.default`, and `View.append()` accepts any of these:");

		api({
			"nothing": "the page rendered at import time, top-level side effects",
			"a function": "the app runs it with the capture pointer set",
			"a view": "appended directly",
			"an object with .render()": "the app calls it — the useful one"
		});

		p("The last shape is what lets you import a page without rendering it, which is the whole point of the next section.");
	}
});
