import { Page, md, demo, div, h3, p, a } from "/app.js";
import { surface } from "../parts.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Card",
	description: "A surface, and why it is three inline declarations rather than a class.",
	icon: "web_asset",

	content(){

		demo(component, "`pad flex v` and one style object. A card is `--surface` on a `--line` hairline with `--radius` corners — **three token values, no colour named** — and `pad` and `flex v` do the rest.");

		md("## Why not a `.card` class?");

		md("Rung 4 of the [ladder](/framework/styles/) is *the module's own `.css` — layout only*, and a fill, a border and a radius are a **look**. The test is whether the rule would still be right if the component were dropped into a completely different site: `flex: 0 0 var(--sidebar)`, yes; `background: var(--surface)`, that site's call.\n\nSo the surface lives in `parts.js` as a token-valued style object, which is the same call [`layouts/parts.js`](/framework/styles/layouts/) and `styles/util/page.js` already made:");

		md("```js\nexport const surface = {\n\tbackground: \"var(--surface)\",\n\tborder: \"1px solid var(--line)\",\n\tborderRadius: \"var(--radius)\",\n};\n```");

		md("The other option was rung 3 — reuse `.page-preview`, which is already a bordered surface with a hover state. It was rejected: that class also brings `display: flex; align-items: center`, a `:hover` accent, and the `.active` / `.in-path` states `Router.mark_links()` paints. A static card that lights up when you happen to be on a matching url is a nav card wearing a costume. On the [design record](/framework/styles/components/).");

		md("## Cards in a row");

		demo(() => {
			div.c("grid gap auto", () => ["View", "Page", "Router"].forEach(name =>
				div.c("pad flex v", () => {
					h3(name);
					p("One class does the wall: `grid gap auto`.");
					a.c("page-link", "Read →").href("/framework/core/" + name + "/")
						.style("textDecoration", "none");
				}).style({ ...surface, gap: "0.5em" })
			));
		}, "`grid gap auto` is `repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))` — a responsive card wall with no media query. Resize the window.");

		md("One thing to know: `pad flow` looks like the obvious inner class and it is wrong. `flow` is **page** rhythm — `--flow-sub` is `2rem`, so an eyebrow label and the title it belongs to land 32px apart. `flex v` plus a small gap is a component's own rhythm.");

		md("Next: [Stat tiles](/framework/styles/components/stats/) — the same surface, four across, one token retuned.");
	}
});
