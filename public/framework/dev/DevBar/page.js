import devbar from "./DevBar.js";
import { Page, md, code, h2, div, button, ui } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "DevBar",
	label: "Dev rail",
	description: "A right rail of dev chrome on every page, behind one keystroke.",
	icon: "build",

	content(){

		code.js(`import devbar from "/framework/dev/DevBar/DevBar.js";

render(){ …; devbar(this); },        // app.js — once, for the whole site
navigated(){ devbar.refresh(); },`);

		md("It is already on. Press the keys anywhere on this site — or press the button:");

		div.c("flex v-center gap", () => {
			button.c("prim", "Open the dev rail").click(() => devbar.toggle(true));
			ui.keys("Ctrl", "\\");
		});

		md("The `✕` in its header shuts it — and everything it remembers is one `localStorage` document, so it comes back the way you left it: open or shut, how wide, and which knobs were on.");

		h2("Four buttons, four viewports");

		code.js(`const width = innerWidth - target;   // the rail IS the difference`);

		md("The rail is the only thing between the window and the page, so **sizing the page is one subtraction**. The four presets aim the *page* at 390, 810, 1920 and 3440 — and the one you are at stays lit. A target this window can't hold has no rail width that reaches it, so that button greys out and its tooltip says which window it needs.");

		md("`.app` normally stops its push above a 26rem reading column, which would floor the page at 416px and make the `390` button a liar. A width you asked for clears that floor — [`--rail-floor`](/framework/styles/), the same contract shape as `--rail-ease`.");

		h2("Drag the edge");

		md("There is no splitter bar. Put the pointer near the rail's inline edge and **the handle appears at your pointer's Y** — it rides the mouse, so there is nothing to aim for, and the edge is a clean line the rest of the time. The width is remembered too.");

		h2("What it shows");

		md(`| section | |
| --- | --- |
| \`viewport\` | the four presets, the size, the resolved body font-size, and **the window in \`em\`** — the unit every layout here is written in |
| \`route\` | the active page's url as crumbs, and its title |
| \`ai\` | this page's threads, and a chat on whichever is open |
| \`dev server\` | whether the live-reload socket is connected |
| \`x-ray\` | outline every box on the page |
| \`go\` | the five places you were going anyway |`);

		md("The list is a plain array in `tools.js` — [not a registry](/framework/dev/DevBar/), on purpose. Adding one is a function and one array entry.");

		h2("The `ai` section — threads live beside the page");

		code.js(`public/framework/styles/layouts/ai/rhythm/task.jsonl`);

		md("A thread is a directory next to the page it is about, holding the same `task.jsonl` [ext/JSONL](/framework/ext/JSONL/) already reads — **a chat is a task**, which is why there is no second store and no join. So the `+` opens one, the pills switch between them, and a reload replays the exchange: `chat_session_id` continues the session, the `chat` lines redraw it.");

		md("Nothing declares a thread and nothing crawls for one — the **directory listing is the index**, read from `/directory.json`. And nothing here works off localhost: [`ext/Ask`](/framework/ext/Ask/) is the bridge, and the bridge is the dev server.");

		h2("It pushes, it doesn't cover");

		code.css(`padding-inline-end: min(calc(var(--drawer, 0px) + var(--devbar, 0px)), max(0px, 100% - 26rem));`);

		md("`.app` reserves a rail at its inline end for each panel docked there, and **sums them** — so the rail and [`ext/layout`](/framework/ext/layout/)'s drawer sit side by side instead of on top of each other. The clamp is what stops a 17rem push leaving no page on a phone: under about 43rem the reservation collapses and the rail covers instead.");

		h2("Dark, and not one colour");

		code.css(`.dev-bar { color-scheme: dark; }`);

		md("Every token in `framework.css` is a `light-dark()` pair, and `light-dark()` resolves against the element *using* the token — so one declaration retunes ink, surface, line, wash and subtle together. `devbar.css` names no colour at all. The same move [mode](/framework/styles/layers/theme/) makes on `.app`.");

		md("The rail mounts on `<body>`, outside `.app` and outside the site's theme: it is tooling, not content, and a panel that changes size when you change the site's type scale is a panel you cannot trust.");

		md.details(import.meta, "readme.md", "Design record — two rails at one edge, and why there is no handle");
	},
});
