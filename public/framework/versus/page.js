import { Page, md, demo, code, div, p, span, button, input, ul, li, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Versus",
	description: "The claims, with the numbers that back them — and the column where React wins.",
	icon: "balance",
	content(){

		toc();

		md("Every number here is reproducible from a clean checkout. Where this framework loses, it says so — a comparison that only wins is marketing, and marketing is not evidence.");

		md("## The whole framework");

		md("| | |\n| --- | --- |\n| **824** | executable lines — `View` + `Page` + `Router` + `App` |\n| **24.6 KB** | gzipped, *everything* needed to render a page, **including CSS** |\n| **0** | build steps |\n| **0** | runtime dependencies |\n| **0** | config files |\n\nAnd that 24.6 KB is **unminified source with the comments left in** — 30% of it is comment, shipped on purpose, because the readable source is the product. Minified it would be roughly half.\n\nFor scale: React + ReactDOM alone is ~45 KB gzipped, minified, *before* a router, before a build tool, and before a line of your code.");

		md("*Measured 2026-08-05. Re-run it: `gzip -c` over `View.js`, `Page.class.js`, `Router.js`, `App.js`, `Font.js`, `is.js`, `framework.css`, `Page.css`.*");

		md("It was 27.7 KB a day earlier, and the 3 KB came off the **comments**, not the code — the executable line count is unchanged. Design rationale moved into the `readme.md` next to each class, where it can be as long as it needs to be without standing between a reader and the method they opened the file for.");

		md("## A counter, which is where reactivity usually starts");

		demo(() => {
			let n = 0, $n;

			div.c("flex gap v-center", () => {
				button("−").click(() => $n.text(--n));
				$n = span.c("code", "0");
				button("+").click(() => $n.text(++n));
			});
		}, "**Hold the view, set the text.** No state hook, no re-render, no dependency array, no key — and nothing else on the page can be disturbed, because nothing else re-ran.");

		md("React's version needs `useState`, a re-render of the component, and a reconciliation pass to discover that one text node changed. That machinery buys you something real when a value is derived from five others across a deep tree. **It buys nothing here**, and you pay for it on every component you ever write.");

		md("The trade in one line: **React re-runs your function and diffs the result. This calls a method on the element you already have.**");

		md("## Routing");

		code.js(`// lew42 — the file IS the route
children: "intro guide api",`);

		md("A folder with a `page.js` is a url. Naming it in `children` registers it. That is the entire router configuration for a site of any size — there is no route table, no `<Route>` tree, no config file, and no build-time manifest.\n\n**And it is lazy by construction.** A `children` entry is a *name* until someone navigates to it. Measured on this site: every cold route fetches **exactly its chain length** and nothing more. Inline pages cost zero modules.\n\nReact's equivalent is a router library, plus `React.lazy`, plus `<Suspense>` boundaries, plus a bundler that understands your dynamic imports. Four things that must agree with each other.");

		md("## A list");

		demo(() => {
			const items = ["Write a page", "Save the file", "Refresh"];
			ul(() => items.forEach(t => li(t)));
		}, "`forEach`. No `key` prop, because nothing is being diffed — the elements are created once and never reconciled.");

		md("## Where React and Vue win");

		md("Stated plainly, because the list above is only credible next to this one.\n\n| | |\n| --- | --- |\n| **Ecosystem** | a component library, a date picker and a data grid are an install away. Here they are your afternoon. |\n| **Hiring** | thousands of people know React. One team knows this. |\n| **Devtools** | a component inspector, a profiler, time-travel state. Here: the elements panel, which is honestly not bad, but it is not the same. |\n| **Derived state at depth** | when one value feeds twelve places across a deep tree, re-render-and-diff genuinely is the simpler model. Manual updates get away from you. |\n| **Types** | TSX gives you typed props on every component. |\n| **SSR / streaming / RSC** | not attempted here. Static host, client render, full stop. |\n| **Battle-testing** | React has survived a decade of everyone's edge cases. This has survived ours. |\n\n**The honest summary:** this is smaller, faster to read, and has no build step, and those are not small things. It is not a replacement for React on a large app with a large team. It is a much better answer than React for a site that is mostly content, and that describes more sites than the industry admits.");

		md("## The claim that matters most");

		md("Not the byte count — **you can read all of it.** 825 lines across four classes, and one of them (`View`) is most of it. There is no compiler step between what you wrote and what runs, no transform to reason about, and `fn.toString()` in the browser returns the source you typed.\n\nThat is why [Classdoc](/framework/ext/classdoc/) can show a method's real source next to its notes: **there is no build step to get in the way.** A framework you can read end-to-end in an afternoon has a different relationship with its users than one you take on faith.");

		md("Next: [Start](/framework/start/) — three files and a working site.");
	}
});
