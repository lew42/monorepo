import { Page, md, demo, code, h2, div, span, button, ul, li, toc } from "/app.js";
import { stats } from "../stats.js";

/* Token-valued style objects, the house answer (framework/ui/parts.js) — a page
   arguing that you rarely need CSS ships none. */
const surface = {
	background: "var(--surface)",
	border: "1px solid var(--line)",
	borderRadius: "var(--radius)",
};

const panel = (title, body) => div.c("pad flex v", () => {
	div.c("h4", title).style("color", "var(--subtle)");
	md(body);
}).style({ ...surface, gap: "0.6em" });

export default new Page({
	meta: import.meta,
	title: "Versus",
	description: "What it refuses, what that buys, what it costs — and the column where React wins.",
	icon: "balance",

	content(){

		toc();

		md("Every number here is reproducible from a clean checkout, and every claim that cuts the other way is on the page too. A comparison that only wins is marketing, and marketing is not evidence.");

		// A counter is where every reactivity argument starts, so it is where this
		// page starts — above the numbers, because it is the thing you can click.
		demo(() => {
			let n = 0, $n;

			div.c("flex gap v-center", () => {
				button("−").click(() => $n.text(--n));
				$n = span.c("code", "0");
				button("+").click(() => $n.text(++n));
			});
		}, "**Hold the view, set the text.** No state hook, no re-render, no dependency array, no key — and nothing else on the page can be disturbed, because nothing else re-ran.");

		md("React's version needs `useState`, a re-render of the component, and a reconciliation pass to discover that one text node changed. That machinery buys something real when a value is derived from five others across a deep tree. **It buys nothing here.** The trade in one line: **React re-runs your function and diffs the result. This calls a method on the element you already have.**");

		h2("The whole framework");

		// ⚠ The figures live in framework/stats.js — the landing renders the same
		// row. Recount there, and recount the prose below with them.
		stats();

		md("714 lines is `View` + `Page` + `Router` + `App` with blanks and comments stripped — the whole framework. Left in, those four files are **993 lines**: a comment here has to earn its place by stating a trap the code cannot show, and everything else lives in the `readme.md` beside it. The 21 KB is *everything* needed to render a page, **including the CSS**, gzipped but not minified. Minified it would be roughly half.");

		md("For scale: **React + ReactDOM alone is ~45 KB gzipped and minified** — before a router, before a build tool, and before a line of your code.");

		code.js(`# from public/framework — measured 2026-08-08
cat core/View/View.js core/Page/Page.class.js core/Router/Router.js \\
    core/App/App.js core/App/Font.js util/is/is.js \\
    framework.css core/Page/Page.css | gzip -c | wc -c`);

		h2("What it refuses");

		md("The list is the product. Each row is a thing this framework will not do, and the reason someone would want it not to.");

		md(`| it refuses | what that buys |
|---|---|
| **a build step** | save the file, refresh the tab. Nothing to be slow, nothing to desync, no \`dist/\` to be stale |
| **a bundler** | the path in an \`import\` **is** the file on disk. What you debug is what you typed |
| **JSX** | \`div.c("card", () => p("hi"))\` is a function call. No compiler, no transform, no source map |
| **runtime dependencies** | nothing can break your site at 2am because it published a patch release |
| **config files** | there is no \`vite.config\`, no \`tsconfig\`, no \`babel.config\`, no \`.eslintrc\` to inherit |
| **a component protocol** | no lifecycle, no props contract, no \`key\`, no dependency array, no re-render |

The three npm packages in the repo — \`chokidar\`, \`express\`, \`ws\` — are the **dev server only**. Production is a folder of files.`);

		h2("Routing");

		code.js(`// the file IS the route
children: "intro guide api",`);

		md("**A folder with a `page.js` is a url** — nothing to register. That is the entire router configuration for a site of any size: no route table, no `<Route>` tree, no config file, no build-time manifest. `children` is the *menu* — which children this page lists, and in what order.");

		md("**And it code-splits by construction.** Every page is its own ES module, imported when it enters the tree; a cold route fetches its chain plus each of those pages' declared children, so a menu can draw once with real titles. Inline pages cost zero modules.");

		md("React's equivalent is a router library, plus `React.lazy`, plus `<Suspense>` boundaries, plus a bundler that understands your dynamic imports. Four things that must agree with each other.");

		h2("A list");

		demo(() => {
			const items = ["Write a page", "Save the file", "Refresh"];
			ul(() => items.forEach(t => li(t)));
		}, "`forEach`. No `key` prop, because nothing is being diffed — the elements are created once and never reconciled.");

		h2("Where React and Vue win");

		md("Stated plainly, because the list above is only credible next to this one.");

		md(`| | |
|---|---|
| **Ecosystem** | a component library, a date picker and a data grid are an install away. Here they are your afternoon |
| **Types** | TSX gives you typed props on every component. There is no type layer here at all |
| **Derived state at depth** | when one value feeds twelve places across a deep tree, re-render-and-diff genuinely is the simpler model. Manual updates get away from you |
| **Hiring** | thousands of people know React. One team knows this |
| **Devtools** | a component inspector, a profiler, time-travel state. Here: the elements panel, which is honestly not bad, but it is not the same |
| **SSR / streaming / RSC** | not attempted. Static host, client render, full stop |
| **Battle-testing** | React has survived a decade of everyone's edge cases. This has survived ours |`);

		h2("Who it is for");

		div.c("grid gap auto", () => {
			panel("Reach for it", `- A site that is **mostly content** — docs, a portfolio, a marketing site, a small app
- You want to **read the whole framework** before you trust it
- You are tired of a toolchain that breaks on its own schedule
- You want the deploy to be *copy the folder*`);

			panel("Don't", `- A large app with a large team and a long-lived component library
- You need **types** across a big surface
- Derived state feeds a deep tree in twelve places
- SSR, streaming or React Server Components are requirements`);
		}).style("--column", "17em");

		md("**The honest summary:** this is smaller, faster to read, and has no build step, and those are not small things. It is not a replacement for React on a large app with a large team. It is a much better answer than React for a site that is mostly content — and that describes more sites than the industry admits.");

		h2("The claim that matters most");

		md("Not the byte count — **you can read all of it.** `View`, `Page`, `Router` and `App` are **993 lines** as written and **714** with the comments stripped (checked August 2026), and `View` is about half of either. There is no compiler between what you wrote and what runs, nothing to reason about in between, and `fn.toString()` in the browser returns the source you typed.");

		md("*Those numbers are dated on purpose.* They have now been wrong three times — stale after a pass that deleted uncalled code, then stale again after a pass that moved the design record out of the source and into the readmes. **A number in prose is a claim with nothing to make it fail**, which is the same reason this site prefers a rendered `demo()` to a description of one. The method is the code block above; recount it when you doubt it.");

		md("That is why [Classdoc](/framework/ext/Doc/) can show a method's real source beside its notes, and why every `demo()` on this site is the code that ran rather than a copy of it: **there is no build step to get in the way.** A framework you can read end to end in an afternoon has a different relationship with its users than one you take on faith.");

		md("Next: [Start](/framework/start/) — three files and a working site. Or [FAQ](/framework/faq/), if you already have questions.");
	}
});
