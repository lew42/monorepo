import { Page, md, h2, div, img, a, span, p } from "/app.js";
import { table } from "/framework/ui/table/table.js";
import data from "./data.js";

/* The layout audit (page-audit, 2026-09-30). The owner: "an audit of all the different page
   layouts on the site, sorted by the number of uses of that layout… once we have a system, we
   don't want to deviate from our system." Every page the site links to was crawled headless and
   given one layout by its DOM marker; data.js is written by
   ai/2026-09-30/page-audit/classify.mjs --emit (re-run it, never edit data.js by hand).

   1 CONTAINER  standard page; the wall and the table go `wide`.
   2 OWN LAYOUT one line, the wall of layouts (a picture each, most-used first), the table,
                then the three child pages as cards. */

const here = new URL(".", import.meta.url).pathname;

// what went wrong with a layout, found by this audit; empty = nothing seen
const DEVIATIONS = {
	ai2: "Its tabs sat flush right, not beside the title like Doc's. Fixed: the shared tab filler had no `order` (ext/tabs/tabs.css).",
	doc: "Many tabs wrap to rows: /framework/core/Page/ has 6 rows at 400px, 3 at 1200, 2 at 1920. Open: group them, or \"more ▾\".",
	custom: "Home, Fly and Resume each build their own shell; so do /layouts/shell/ and /layouts/explorer/, on purpose (they demo shells).",
	standard: "The default, and a catch-all: task logs, notes and people pages all land here without choosing.",
};

export default new Page({
	meta: import.meta,
	title: "Page layouts in use",
	label: "Audit",
	icon: "fact_check",
	description: "Every page on the site, sorted by the layout it uses: most-used first. Reuse one before you build one.",
	children: "priority design reuse",

	content(){
		md(`**${data.crawled} pages, crawled on ${data.at}, each sorted into the layout it uses.** The most-used come first. A new page picks one of these; a page that builds its own is a deviation.`);

		div.c("page-previews wide", () => {
			for (const l of data.layouts){
				this.preview_card(
					{ url: l.examples[0]?.url, label: `${l.name} · ${l.count}`, description: l.api },
					l.shot ? () => img().attr("src", here + l.shot).attr("alt", `${l.name}: ${l.examples[0]?.url}`).style({ width: "100%", display: "block" }) : undefined,
				);
			}
		});

		h2("Every layout, with where it lives");
		div.c("wide", () => table(["Layout", "Pages", "page.js opt-ins", "Defined in", "Examples", "What went wrong"],
			data.layouts.map(l => [
				l.name, String(l.count), l.page_js == null ? "—" : String(l.page_js), l.defined_in,
				() => l.examples.slice(0, 3).forEach((e, i) => { if (i) span(" · "); a(e.url).href(e.url); }),
				DEVIATIONS[l.id] || "",
			])));
		p.c("muted", `"Pages" is the rendered crawl; "page.js opt-ins" is a grep of the code. AI 2 cards and task pages were capped at 15 per day (${data.skipped} alike pages skipped). ${data.errors} urls didn't render: most were links from the audio index resolved against the document instead of its module (fixed).`);

		h2("Next: the main pages, the design pass, and why reuse breaks");
		this.previews();
	},
});
