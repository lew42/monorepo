import { Page, md, code, demo, h2, h3, div, p, span, a, ul, li, button, input, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "FAQ",
	description: "The questions people actually ask, in the order they hit them.",
	icon: "help",

	content(){

		toc();

		md("Short answers with the code first. Each one links to the page that goes deeper.");

		h2("Getting something on screen");

		h3("How do I make a page?");

		code.js(`// public/about/page.js
import { Page, p } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "About",
    content(){ p("Hello."); },
});`);

		md("Then **name it in its parent's `children`** — `children: \"about\"` in `public/page.js`. Two steps, and the second is the one people forget. → [Start](/framework/start/)");

		h3("Why is my new page a 404?");

		md("**You didn't declare it.** Nothing crawls the filesystem, so a `page.js` its parent never named does not exist. Check the parent's `children` string, and check the spelling — the name in `children` is the folder name, exactly.");

		md("If the console says *\"the file EXISTS but failed to load\"*, that's different and better news: the file was found and **threw**. Read the error — it's a syntax error or a bad import in your page.");

		h3("Do I need a build step?");

		md("No. There isn't one, and there can't be — everything under `public/` is served as-is and runs as native ES modules. Serve the folder. That also means **import paths must be real urls**: `/app.js` or `./thing.js`, never `thing` or `lodash`.");

		h2("Building the DOM");

		h3("Why did my element appear in the wrong place?");

		md("**You built it after an `await`.** This is the single most common bug here, and nothing throws.");

		code.js(`// WRONG — the div is built after the await, so it lands wherever
async content(){
    const data = await fetch("/x.json").then(r => r.json());
    div(() => data.forEach(d => p(d.name)));      // ← not in your page
}`);

		md("The captor — the element currently collecting children — is restored the instant your function *returns*, and for an `async` function that's its **first `await`**. Everything after that appends to whatever the captor has since become.");

		h3("So how do I render data that arrives later?");

		demo(() => {
			div.c("flex v gap pad", $list => {
				$list.text("Loading…");

				// A promise, then a callback that RE-ESTABLISHES the captor.
				Promise.resolve(["Ada", "Grace", "Katherine"]).then(names =>
					$list.empty(() => names.forEach(name => p(name))));
			});
		}, "**Capture the container now; fill it in a callback later.** `$list.empty(fn)` and `$list.append(fn)` both make `$list` the captor while `fn` runs — so the code inside reads exactly like ordinary page code, and there is no ambient captor to get wrong.");

		md("The other blessed shape is to **return a promise**. `content()`'s return value is appended, and a promise is awaited first:");

		code.js(`content(){ return md.file(import.meta, "readme.md"); }`);

		md("That's how a whole readme becomes a page with no support from `Page`. → [View](/framework/core/View/append/)");

		h3("How do I make a reusable component?");

		demo(() => {
			const chip = text => span.c("code pad", text);

			div.c("flex gap wrap", () => ["one", "two", "three"].forEach(t => chip(t)));
		}, "**A function.** It captures like any factory because the factories inside it do. Reach for a `View` subclass when it needs state or several methods — then the class name becomes the CSS class, kebab-cased.");

		h3("Where does an event handler go?");

		demo(() => {
			p("Click me").style("cursor", "pointer")
				.click(function(){ this.text("Clicked."); });
		}, "`.click(fn)` / `.on(event, fn)`, chained. Inside the handler **`this` is the view**, so you rarely need to hold a reference. Use `function(){}` and not an arrow if you want that.");

		h2("Navigation");

		h3("How do I link to another page?");

		code.js(`a("About").href("/about/")        // any anchor works
about.link()                     // if you imported the page`);

		md("Every in-app anchor is upgraded automatically — no component, no `onClick`, no router import. `page.link()` knows its own url from `import.meta`, so **you never type a path twice**. → [Router](/framework/core/Router/)");

		h3("How do I highlight the current nav item?");

		md("You don't. `Router.mark_links()` puts `.active` (this exact url) and `.in-path` (a directory above it) on every in-app anchor after each navigation, and CSS decides what each kind of link does with them.");

		code.css(`.my-link.active { color: var(--prim); }`);

		md("**No view should compare `window.location` itself.** One pass, one source of truth.");

		h3("How do I make a sidebar / tabs / a menu of my children?");

		code.js(`this.previews()                      // a card per child
this.tabs("guide api")               // a bar + the panel they render into
this.tabs("guide api").ac("vertical")// the same, as a left nav
new Sidebar({ brand: "Me", pages })  // a brand over links`);

		md("→ [Page](/framework/core/Page/tabs/) and [Sidebar](/framework/core/Sidebar/)");

		h3("Can a url have a dynamic segment, like `/items/42/`?");

		code.js(`route(name){
    return { title: "Item " + name, content(){ p("…"); } };
}`);

		md("Define `route(name)` on the parent. It runs only after the declared children miss, so a dynamic name costs no doomed 404 and structurally cannot shadow a real `page.js`. → [Page](/framework/core/Page/child/)");

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

		md("It's awaited before first paint, so nothing flashes unstyled. And it must be **`import.meta`, not a document-relative path** — the SPA fallback makes the document url the *route*, so a relative fetch misses.");

		h3("My CSS isn't winning. What did I do?");

		md("Almost always one of two things, and both fail silently:");

		md("**1. Your rule isn't in a layer.** An unlayered rule beats *every* layer at any specificity — so an unlayered rule of your own will also be beaten by nothing and win over things you didn't mean to beat. Every stylesheet: `@layer base, theme, site, util;` then `@layer theme { … }`.");

		md("**2. You wrote a short layer list.** The first `@layer` statement fixes the order, and a name first seen later is appended at the **end** — so `@layer base, theme;` silently moves `site` past `util`. **Restate all four, in full, in every file.**");

		md("If you're fighting a `framework.css` rule, that's a bug report about `framework.css`, not a reason to escalate. **De-escalate upstream** — the framework holds the low ground on purpose. → [Styles](/framework/styles/)");

		h3("How do I change the fonts and colours?");

		code.css(`.app {
    --prim: #0b7;
    --ink: #222;
    --font: "Inter", sans-serif;
}`);

		md("Tokens, on `.app` or a theme class — **never back at `:root`**, which holds defaults only. That's what lets two variants of a page render side by side. → [theme](/framework/styles/theme/) and the [theme guide](/framework/styles/theme/guide/)");

		h2("Data and state");

		h3("Where does shared state live?");

		code.js(`// store.js
export const store = { user: null, cart: [] };`);

		md("**A module.** ES modules are singletons, so importing `store` anywhere gives you the same object — there is no state system to learn and nothing to configure. Update the DOM by holding the view and calling a method on it (`$count.text(n)`), which is the whole of what this framework does instead of re-rendering.");

		md("That is genuinely worse than React when one value feeds twelve places across a deep tree. It's stated plainly on [Versus](/framework/versus/).");

		h3("How do I fetch data?");

		md("`fetch`. See *\"render data that arrives later\"* above for where to put the result. If a page's whole content is remote, `return` the promise from `content()`.");

		h2("Everything else");

		h3("How do I run it locally?");

		code.js(`npm install
node server.js       # http://localhost`);

		md("Save a file and the browser reloads. The live-reload client checks the hostname and **no-ops anywhere that isn't localhost**, so production stays plain static files. → [Dev](/framework/dev/)");

		h3("How do I deploy?");

		md("Upload `public/`. Any static host, with one setting: **serve `index.html` for every url that isn't a file.** On Cloudflare that's `not_found_handling: \"single-page-application\"`; on Netlify a `/* → /index.html 200` rule. That single fallback is the entire server-side configuration.");

		h3("Can I use markdown / syntax highlighting / a file browser?");

		md("They're [extensions](/framework/ext/) — opt in with an import, once, in your `app.js`. Nothing in core depends on any of them, so a site that imports none of them ships none of them.");

		h3("What if I need something the framework doesn't do?");

		md("Write it. `View` is a DOM element with a chainable API — there's no component protocol to satisfy, no lifecycle to hook, and no build step between you and the browser. An extension is allowed to patch core; your own code is allowed to do anything.");

		md("And if you're deciding whether to use this at all, [Versus](/framework/versus/) lists where React wins, which is the honest half of the comparison.");

		h2("The five that fail silently");

		md("Worth reading once, because none of these throws:");

		md(`| | |
|---|---|
| **building DOM after an \`await\`** | it lands somewhere else. See above |
| **a short \`@layer\` list** | \`site\` silently moves past \`util\` |
| **an unlayered rule** | beats every layer, at any specificity |
| **a document-relative fetch** | the document url is the *route*, so it misses. Use \`import.meta\` |
| **a mutual parent/child import** | breaks only on **deep reloads** — \`/a/\` throws while \`/a/b/\` works. Imports flow down; the backref arrives by adoption |

The last one is the meanest, because the shallow url you'd test with is the one that works.`);

		md("Next: [Start](/framework/start/) if you haven't, or [View](/framework/core/View/) if you have.");
	}
});
