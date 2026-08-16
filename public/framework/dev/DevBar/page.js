import devbar from "./DevBar.js";
import { Doc, md, code, h2, div, button, ui } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "DevBar",
	label: "Dev rail",
	description: "A right rail of dev chrome on every page, behind one keystroke.",
	icon: "build",

	subject: devbar,
	methods: "refresh toggle",
	notes: "docking sizing threads measuring",
	files: "DevBar.js ask.js devbar.css grip.css grip.js layout.js parts.js readme.md settings.js tools.js page.js",

	content(){

		code.js(`import devbar from "/framework/dev/DevBar/DevBar.js";

render(){ …; devbar(this); },        // app.js — once, for the whole site
navigated(){ devbar.refresh(); },`, "public/app.js");

		md("It is already on. Press the keys anywhere on this site — or press the button:");

		div.c("flex v-center gap", () => {
			button.c("prim", "Open the dev rail").click(() => devbar.toggle(true));
			ui.keys("Ctrl", "\\");
		});

		md("The `✕` at the head's inline end shuts it — and everything it remembers is one `localStorage` document, so it comes back the way you left it: open or shut, how wide, and which knobs were on.");

		md("**`block`**, beside it, is `window.$BLOCKRELOAD` — the one switch that stops [Socket](/framework/dev/Socket/) reloading the page under you while you are mid-edit in a form. It is the *only* knob that is deliberately **not** remembered: a block that survived a reload would read as live reload being broken.");

		h2("Four buttons, four viewports");

		code.js(`const width = innerWidth - target;   // the rail IS the difference`);

		md("The rail is the only thing between the window and the page, so **sizing the page is one subtraction**. The four presets aim the *page* at 390, 810, 1920 and 3440 — and the one you are at stays lit. A target this window can't hold has no rail width that reaches it, so that button greys out and its tooltip says which window it needs. [Sizing](/framework/dev/DevBar/docs/sizing/) has the floor it clears and why the lit state reads a setting, never a measurement.");

		h2("Drag the edge");

		md("There is no splitter bar. Put the pointer near the rail's inline edge and **the handle appears at your pointer's Y** — it rides the mouse, so there is nothing to aim for, and the edge is a clean line the rest of the time. The width is remembered too.");

		h2("What it shows");

		md(`| section | |
| --- | --- |
| \`viewport\` | the four presets, the size, the resolved body font-size, and **the window in \`em\`** — the unit every layout here is written in |
| \`layout\` | this page's [LayoutTool](/framework/ext/LayoutTool/) score, at the width you are actually looking at |
| \`route\` | the active page's url as crumbs, and its title |
| \`ai\` | this page's threads, and a chat on whichever is open |
| \`dev server\` | whether the live-reload socket is connected |
| \`x-ray\` | outline every box on the page |
| \`go\` | the five places you were going anyway |`);

		md("The list is a plain array in `tools.js` — [not a registry](/framework/dev/DevBar/), on purpose. Adding one is a function and one array entry.");

		h2("The `layout` section — score the page you are on");

		code.js(`analyze(document.querySelector(".app"));   // the audit's root, on this page`, "framework/dev/DevBar/layout.js");

		md("A grade, the severity counts, **the width it actually measured** and the three ratios that explain most findings — then the three leading ones, worst first. `re-run` measures again; `full report` swaps in [LayoutTool](/framework/ext/LayoutTool/)'s own report, in the rail.");

		md("Tick **follow the resize** and the number tracks the page: drag the rail's edge, or hit a preset, and the score changes as the layout does — the fastest way to find the width where something breaks. It watches `.app`, not the window, because the rail resizes the *page* without the window moving at all. [Measuring](/framework/dev/DevBar/docs/measuring/) has the settle timer, the generation counter a drag needs, and why the tool is imported on demand.");

		h2("The `ai` section — threads live beside the page");

		code.js(`public/framework/styles/layouts/ai/rhythm/task.jsonl`);

		md("A thread is a directory next to the page it is about, holding the same `task.jsonl` [ext/JSONL](/framework/ext/JSONL/) already reads — **a chat is a task**, which is why there is no second store and no join. So the `+` opens one, the pills switch between them, and a reload replays the exchange: `chat_session_id` continues the session, the `chat` lines redraw it. [Threads](/framework/dev/DevBar/docs/threads/) has the captor trap this section has to dodge to build it.");

		md("Nothing declares a thread and nothing crawls for one — the **directory listing is the index**, read from `/directory.json`. And nothing here works off localhost: [`ext/Ask`](/framework/ext/Ask/) is the bridge, and the bridge is the dev server.");

		h2("It pushes, it doesn't cover");

		code.css(`padding-inline-end: min(calc(var(--drawer, 0px) + var(--devbar, 0px)), max(0px, 100% - 26rem));`, "framework.css");

		md("`.app` reserves a rail at its inline end for each panel docked there, and **sums them** — so the rail and [`ext/layout`](/framework/ext/layout/)'s drawer sit side by side instead of on top of each other. The clamp is what stops a 17rem push leaving no page on a phone: under about 43rem the reservation collapses and the rail covers instead. [Docking](/framework/dev/DevBar/docs/docking/) has the full mechanism, including why it mounts on `<body>`.");

		h2("Dark, and not one colour");

		code.css(`.dev-bar { color-scheme: dark; }`);

		md("Every token in `framework.css` is a `light-dark()` pair, and `light-dark()` resolves against the element *using* the token — so one declaration retunes ink, surface, line, wash and subtle together. `devbar.css` names no colour at all. The same move [mode](/framework/styles/layers/theme/) makes on `.app`.");

		md("The rail mounts on `<body>`, outside `.app` and outside the site's theme: it is tooling, not content, and a panel that changes size when you change the site's type scale is a panel you cannot trust.");

		md.details(import.meta, "readme.md", "Design record — two rails at one edge, and why there is no handle");
	},
});
