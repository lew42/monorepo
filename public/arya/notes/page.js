import { h2, h3, p, strong, a } from "/app.js";
import Page from "../lib/Page.js";
import { snippet, note, api } from "../lib/ui.js";

export default new Page(import.meta, {

	body() {
		p("Things I hit while building this section, roughly in the order they would hurt a new person. The first three are the ones I would fix before showing the framework to anybody.");

		h2("1. A missing stylesheet is a blank white page");

		p("`View.stylesheet()` resolves its promise on `load` and has no `error` handler:");

		snippet(`new View({ tag: "link" }).attr("rel", "stylesheet").attr("href", url)
    .append_to(document.head).on("load", () => { res(); });`);

		p("`App.load()` awaits `Promise.all` over those promises, and `inject()` runs after. So one typo'd path means one promise that never settles, which means `inject()` never runs, which means ", strong("an empty body and a completely clean console."), " There is nothing to search for and nothing to read.");

		p("Two lines fix it:");

		snippet(`.on("load", res)
.on("error", () => {
    console.error("stylesheet failed to load:", url);
    res();   // resolve anyway — an unstyled page beats no page
});`);

		note(p("Resolving rather than rejecting is the point. A missing stylesheet should degrade, not take the site down. Same argument applies to `app.font()`."));

		h2("2. A page.js cannot be imported");

		p("Top-level `p()` calls render at import time, so importing a page for its `link()` also renders the page. Every workaround in the repo — `export default { link, render }` — still runs whatever was at the top of that module.");

		p("Written up properly, with the class and a working router, in ", a("class Page").href("/arya/framework/page/"), ". The short version:");

		snippet(`export default new Page(import.meta, {
    title: "Flex",
    body(){ p("..."); }
});`);

		p("`View.append()` already calls `.render()` on anything that has one, so `App` needs no changes for this to work. It could ship in `framework/core/` tomorrow.");

		h2("3. The trailing slash");

		p("`/yourname/` loads `/yourname/page.js`. `/yourname` loads `/yourname.page.js`. Both are reasonable, and a newcomer typing a URL by hand hits the wrong one about half the time and gets `Page Load Error`.");

		p("I would try the folder form first and fall back:");

		snippet(`try {
    mod = await import(path.replace(/\\/?$/, "/") + "page.js");
} catch {
    mod = await import(path + ".page.js");
}`);

		p("Or redirect: if the path has no extension and no trailing slash, `history.replaceState` one on and carry on.");

		h2("4. Page Load Error hides real errors");

		p("`load_page()` wraps the import in one `try`, so a syntax error, a bad import inside the page, and a thrown error during render all produce the same `Page Load Error` heading. The message is there, but the heading points you at the wrong thing — I spent a while checking a path that was fine while the actual problem was a typo three lines into `body()`.");

		p("Separating the import from the render would let each say what it is:");

		snippet(`let mod;
try { mod = await import(url); }
catch (e) { return this.render_error("Page not found", url, e); }

try { this.$app.append(mod.default); }
catch (e) { return this.render_error("Page threw while rendering", url, e); }`);

		p("Printing `error.stack` rather than `error.message` would help too.");

		h2("5. Every page repeats the same two lines");

		p("`app.$body.ac(\"theme-1\")` is at the top of fourteen `page.js` files. It is easy to forget, and forgetting gives you an unstyled page with no error.");

		p("Either let `App` take it as config, or set it in one module every page imports. Mine is in `lib/Page.js`, alongside the `app.stylesheet()` call, so a page never mentions either.");

		api({
			"new App({ theme: \"theme-1\" })": "the app adds it to $body during render()",
			"app.theme(\"theme-1\")": "same thing, callable from a page"
		});

		h2("6. Only p() understands backticks");

		p("`p(\"call `foo()`\")` renders a `code` element. `li()`, `div()`, `h2()` and everything else render the backticks as literal characters. I found this by writing a list and getting visible backticks in the output.");

		p("`backtick_append` is already written and it is one line to attach it. I would put it on the text-ish tags — `li`, `td`, `h1` through `h6`, `span` — or add a `.bt()` method so it is explicit everywhere.");

		h2("7. There is no way to read an input");

		p("Forms are the first thing anyone builds, and getting a value means reaching past the view:");

		snippet(`name.el.value          // today
name.value()           // could be`);

		p("A `.value(v)` that gets and sets, following the same shape as `.text()` and `.attr()`, would round out the form story. `.checked()` too.");

		h2("8. framework.css is missing three classes");

		p("Building the ", a("landing page").href("/arya/styles/build/"), " I had to write inline styles for the same three things over and over:");

		api({
			".surface": "white, 1px border, small radius — a card, a panel, a well",
			".section": "3em vertical padding, 1em horizontal — a page band",
			".container": "max-width plus auto margins"
		});

		p("Every one of those is a one-liner, and every page needs all three. They feel more fundamental than `.zoom-175`.");

		h3("Smaller ones in the same file");

		api({
			"no color-scheme": "nothing declares it, so native inputs, selects and scrollbars stay light no matter what the page does — `color-scheme: light dark` on `:root` is the whole fix",
			"--bg": "reads like the page background but it is a dark surface colour — `--dark` or `--surface-dark` would not need explaining",
			"--subtle": "`rgba(0,0,0,0.5)` disappears on a dark background, so it cannot be used in a dark theme",
			"no --text": "there is no token for foreground colour, so a theme has to set it per element",
			".flex > * { margin: 0 }": "correct, but it silently strips margins off headings inside any flex container",
			".gap": "only `1em` and `2em` — `.gap-half` comes up constantly",
			"disabled buttons": "no styling, so they look enabled until you click one",
			".class-ctrls": "`View.ctrl()` renders it and no stylesheet styles it"
		});

		h2("9. Documentation belongs next to the code");

		p("`framework/readme.md` is one line. Since `is.js` already has a `page.js` sitting beside it, the pattern exists — a `page.js` next to `View.js` and `App.js`, rendered at `/framework/core/view/`, would put the reference where you are already looking when you have a question.");

		h2("Things I would not change");

		p("Capturing seemed strange for about ten minutes and then became the reason this is pleasant to write. `@layer` in `framework.css` is exactly right — my stylesheet wins by default and loses on purpose, without a specificity fight. And keeping the utility list this short is a genuine feature; I never had to go look anything up.");

		p("The gap is not the design. It is that the two or three failure modes above are silent, and silence is the worst thing a beginner can hit.");
	}
});
