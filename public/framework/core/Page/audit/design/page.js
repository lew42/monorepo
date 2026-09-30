import { Page, md, h2, div, img, a, p } from "/app.js";
import { table } from "/framework/ui/table/table.js";
import pages from "./data.js";

/* The design pass (page-audit, 2026-09-30). The owner, 12:35: read every screenshot "in
   horizontal rows… is it the right size? Is it too big or too small? Does it have the right
   amount of padding?", from mobile up to 3440. The numbers come from
   `node Server/layout-check.mjs --bands`; data.js and shots/ are written by
   ai/2026-09-30/page-audit/design-emit.mjs (re-run it, never edit them by hand). */

const here = new URL(".", import.meta.url).pathname;
const W = ["400", "1200", "1920", "3440"];
const bad = (w, m) => m.tab_rows > 1 || (w === "400" && m.left > 32) || m.wraps > 2 || m.big_empty;

export default new Page({
	meta: import.meta,
	title: "The design pass: nine main pages at four widths",
	label: "Design pass",
	icon: "straighten",
	description: "The main pages measured at 400, 1200, 1920 and 3440: tab rows, the tab bar's share of the screen, padding and wraps.",

	content(){
		md(`**The main pages at four widths, read top to bottom as bands.** The worst: [Page](/framework/core/Page/)'s tabs wrap to 6 rows at 400px and take 16% of the phone screen before any content.`);

		h2("On a phone (400px)");
		div.c("page-previews wide", () => {
			for (const pg of pages) if (pg.shots["400"])
				this.preview_card({ url: pg.url, label: pg.url, description: `${pg.widths["400"].tab_rows} tab rows · ${pg.widths["400"].wraps} wraps` },
					() => img().attr("src", here + pg.shots["400"]).attr("alt", `${pg.url} at 400px`).style({ width: "100%", display: "block" }));
		});

		// the Opus reader's ranked findings, with the CSS cause of each (ai/2026-09-30/page-audit/design/)
		h2("Ranked: what to fix, and what was fixed");
		div.c("wide").append(md.file(import.meta, "findings.md", { h1: false }));

		h2("The numbers");
		p.c("muted", "Per width: tab rows · the tab bar's share of the screen · padding at the text's left edge · one-line things that wrapped. A row is bold where something is off.");
		div.c("wide", () => table(["Page", ...W], pages.map(pg => [
			() => a(pg.url).href(pg.url),
			...W.map(w => {
				const m = pg.widths[w];
				if (!m) return "—";
				const s = `${m.tab_rows} rows · ${m.tab_share}% · ${m.left ?? "?"}px · ${m.wraps} wraps`;
				return bad(w, m) ? () => md(`**${s}**`) : s;
			}),
		])));
	},
});
