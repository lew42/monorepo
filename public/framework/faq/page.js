import { Page, md, code, demo, h2, h3, div, p, span, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "FAQ",
	description: "Short answers, code first — the questions people actually hit, in the order they hit them.",
	icon: "help",

	content(){

		toc();

		md("Code first, then one or two sentences, then the page that goes deeper. Every question is its own link — on a wide window the rail beside this is the index. Still deciding whether to use this at all? [Versus](/framework/versus/) is the honest half.");

		h2("Getting started");

		h3("How do I make a page?");

		code.js(`// public/about/page.js
import { Page, p } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "About",
    content(){ p("Hello."); },
});`);

		md("**That's it — `/about/` works.** Add `children: \"about\"` to the page *above* it when you want it in that page's menu; the folder resolves either way. → [Start](/framework/start/)");

		h3("Why is my page a 404?");

		md("**Check the folder name and the trailing slash.** A url resolves to `<name>/page.js` on disk, so `/about/` needs `public/about/page.js` — spelled exactly, `page.js` exactly. Declaring it in the parent's `children` is about the *menu*, not the url.");

		md("If the console says *\"the file EXISTS but failed to load\"*, that is different and better news: the file was found and **threw**. Read the error — it is a syntax error or a bad import in your page.");

		h3("Do I need a build step?");

		md("**No, and there cannot be one.** Everything under `public/` is served as-is and runs as native ES modules. Serve the folder; that is the deploy.");

		md("Which also means **import paths are real urls**: `/app.js` or `./thing.js`, never `thing` or `lodash`.");

		h2("Building the page");

		h3("Why is my element in the wrong place?");

		code.js(`// WRONG — the div is built after the await, so it lands wherever
async content(){
    const data = await fetch("/x.json").then(r => r.json());
    div(() => data.forEach(d => p(d.name)));      // ← not in your page
}`);

		md("**You built it after an `await`.** This is the most common bug here and nothing throws. The captor — the element currently collecting children — is restored the instant your function *returns*, and for an `async` function that is its **first `await`**. Everything after it appends to whatever the captor has since become.");

		md("The mechanical check needs no judgement: **a factory call textually after an `await` is wrong.**");

		h3("How do I render data that arrives later?");

		demo(() => {
			div.c("flex v gap pad", $list => {
				$list.text("Loading…");

				// A promise, then a callback that RE-ESTABLISHES the captor.
				Promise.resolve(["Ada", "Grace", "Katherine"]).then(names =>
					$list.empty(() => names.forEach(name => p(name))));
			});
		}, "**Capture the container now; fill it in a callback later.** `$list.empty(fn)` and `$list.append(fn)` both make `$list` the captor while `fn` runs — so the code inside reads exactly like ordinary page code, and there is no ambient captor to get wrong.");

		md("The other blessed shape is to **return a promise**: `content()`'s return value is appended, and a promise is awaited first.");

		code.js(`content(){ return md.file(import.meta, "readme.md"); }`);

		md("That is a whole readme as a page, with no support from `Page`. Fetching is just `fetch` — the only question was ever where to put the result. → [View](/framework/core/View/api/append/)");

		h3("How do I make a component?");

		demo(() => {
			const chip = text => span.c("code pad", text);

			div.c("flex gap wrap", () => ["one", "two", "three"].forEach(t => chip(t)));
		}, "**A function.** It captures like any factory, because the factories inside it do. Reach for a `View` subclass when it needs state or several methods — then the class name becomes the CSS class, kebab-cased.");

		h3("Where do event handlers go?");

		demo(() => {
			p("Click me").style("cursor", "pointer")
				.click(function(){ this.text("Clicked."); });
		}, "`.click(fn)` / `.on(event, fn)`, chained. Inside the handler **`this` is the view**, so you rarely need to hold a reference — use `function(){}` and not an arrow if you want that.");

		h3("Where does shared state live?");

		code.js(`// store.js
export const store = { user: null, cart: [] };`);

		md("**A module.** ES modules are singletons, so importing `store` anywhere gives you the same object — there is no state system to learn and nothing to configure.");

		md("Update the DOM by holding the view and calling a method on it (`$count.text(n)`). That is the whole of what this does instead of re-rendering, and it is **genuinely worse than React** when one value feeds twelve places across a deep tree. Stated plainly on [Versus](/framework/versus/).");

		h2("Navigation");

		h3("How do I link to another page?");

		code.js(`a("About").href("/about/")        // any anchor works
about.link()                     // if you imported the page`);

		md("Every in-app anchor is upgraded automatically — no component, no `onClick`, no router import. `page.link()` knows its own url from `import.meta`, so **you never type a path twice**. → [Router](/framework/core/Router/)");

		h3("How do I mark the current nav item?");

		code.css(`.my-link.active { color: var(--prim); }`);

		md("**You don't.** `Router.mark_links()` puts `.active` (this exact url) and `.in-path` (a directory above it) on every in-app anchor after each navigation, including Back. CSS decides what each kind of link does with them, and **no view compares `window.location` itself** — one pass, one source of truth.");

		h3("How do I list my children?");

		code.js(`this.previews()                      // a card per child
this.tabs("guide api")               // a bar + the panel they render into
this.tabs("guide api").ac("vertical")// the same, as a left rail
new Sidebar({ brand: "Me", pages })  // a brand over links`);

		md("All four read the same `nav_for(name)` entry, so a child cannot be named three different ways. → [Page](/framework/core/Page/nav/) and [Sidebar](/framework/core/Sidebar/)");

		h3("Can a url have a dynamic segment?");

		code.js(`route(name){
    return { title: "Item " + name, content(){ p("…"); } };
}`);

		md("Define `route(name)` on the parent and `/items/42/` is yours. It runs for **undeclared** names only, so it structurally cannot shadow a child you declared — and it is tried before the filesystem, so a dynamic name costs no doomed request. → [Children](/framework/core/Page/children/)");

		h2("Styling");

		h3("Where do I put my CSS?");

		md("**Ideally nowhere.** Climb the ladder and stop at the first rung that works:");

		md(`| | |
|---|---|
| 1 | **nothing** — the default already handles it |
| 2 | **a utility class** — \`flex gap v-center pad h2\` |
| 3 | **an existing component's class** — \`.page-preview\`, \`.tab\` |
| 4 | **your module's own \`.css\`** — layout only, never colour |
| 5 | **\`/styles.css\`** — the site's skin |

→ [Styles](/framework/styles/), and the [layouts](/framework/styles/layouts/) built with no stylesheet at all.`);

		h3("How do I load a stylesheet?");

		code.js(`View.stylesheet(import.meta, "MyThing.css");   // at module scope`);

		md("It is awaited before first paint, so nothing flashes unstyled. And it must be **`import.meta`, not a document-relative path** — the SPA fallback makes the document url the *route*, so a relative fetch misses.");

		h3("Why isn't my CSS winning?");

		md("Almost always one of two things, and both fail silently.");

		code.css(`@layer base, theme, site, util;   /* all four, in full, in every file */

@layer theme { .thing { … } }     /* and every rule inside one */`);

		md("**1. Your rule isn't in a layer.** An unlayered rule beats *every* layer at any specificity — including yours, later, when you didn't mean it to.");

		md("**2. You wrote a short layer list.** The first `@layer` statement fixes the order, and a name first seen later is appended at the **end** — so `@layer base, theme;` silently moves `site` past `util`.");

		md("And if you are fighting a `framework.css` rule, that is a bug report about `framework.css`. **De-escalate upstream** — the framework holds the low ground on purpose. → [Layers](/framework/styles/layers/)");

		h3("How do I change fonts and colours?");

		code.css(`.app {
    --prim: #0b7;
    --ink: #222;
    --font: "Inter", sans-serif;
}`);

		md("Tokens, on `.app` or a theme class — **never back at `:root`**, which holds defaults only. That is what lets two variants of a page render side by side. → [theme](/framework/styles/layers/theme/)");

		h2("Shipping");

		h3("How do I run it locally?");

		code.js(`npm install
node server.js       # http://localhost`);

		md("Save a file and the browser reloads. The live-reload client checks the hostname and **no-ops anywhere that isn't localhost**, so production stays plain static files. → [Dev](/framework/dev/)");

		h3("How do I deploy?");

		md("Upload `public/`. Any static host, with one setting: **serve `index.html` for every url that isn't a file.** On Cloudflare that is `not_found_handling: \"single-page-application\"`; on Netlify a `/* → /index.html 200` rule. **That single fallback is the entire server-side configuration.**");

		h3("What extensions are there?");

		md("Markdown, syntax highlighting, live demos, a file browser, a table of contents, class documentation. Each is opt-in with one import, once, in your `app.js` — so a site that imports none ships none. → [Extensions](/framework/ext/)");

		h3("What if it doesn't do what I need?");

		md("Write it. `View` is a DOM element with a chainable API: no component protocol to satisfy, no lifecycle to hook, no build step between you and the browser. An extension may patch core; your own code may do anything.");

		h2("The five that fail silently");

		md("Worth reading once, because none of these throws:");

		md(`| | |
|---|---|
| **building DOM after an \`await\`** | it lands somewhere else |
| **a short \`@layer\` list** | \`site\` silently moves past \`util\` |
| **an unlayered rule** | beats every layer, at any specificity |
| **a document-relative fetch** | the document url is the *route*, so it misses. Use \`import.meta\` |
| **a mutual parent/child import** | breaks only on **deep reloads** — \`/a/\` throws while \`/a/b/\` works. Imports flow down; the backref arrives by adoption |

The last one is the meanest, because the shallow url you would test with is the one that works.`);

		md("Next: [Start](/framework/start/) if you haven't, or [View](/framework/core/View/) if you have.");
	}
});
