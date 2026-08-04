import { Page, div, button, p, a } from "/app.js";
import { section } from "../../ui.js";
import { md, claim, visit } from "../../urls/ui.js";
import { survey, surveyed, canonical } from "../crawl.js";

export default new Page({
	meta: import.meta,
	title: "Canonical audit",

	run(){
		this.$out.empty(() => p("crawling…"));
		survey(this.app).then(({ pages, links }) => this.$out.empty(() => {
			const off = pages.filter(row => !canonical(row.url));
			const hrefs = links.filter(l => l.verdict === "non-canonical");

			md(`
| | |
|---|---|
| page urls derived by \`naming()\` | ${pages.length} |
| of those, non-canonical | ${off.length ? "**" + off.length + "**" : "**0**"} |
| hrefs written by hand | ${links.filter(l => l.verdict !== "off-site" && l.verdict !== "file").length} |
| of those, non-canonical | ${hrefs.length ? "**" + hrefs.length + "**" : "**0**"} |
`);

			md(off.length
				? "**Derived urls that are not canonical:**\n\n" + off.map(r => `- \`${r.url}\``).join("\n")
				: `**Not one derived url is non-canonical, and that is the point.** \`naming()\` can only produce \`new URL(".", meta.url).pathname\` or \`parent.url + name + "/"\`, and both end in \`/\` by construction. **The address bar is the only surface that can be wrong** — never the page's own url.`).ac(off.length ? "" : "note");

			if (hrefs.length) md("**Hand-written hrefs that are not canonical:**\n\n" + hrefs.map(l => `- \`${l.href}\` on \`${l.from}\``).join("\n"));
		}));
	},

	content(){

		claim(canonical, null, "Rule 1 as a predicate. Two ways this tier's one url shape can be written wrong — a missing trailing slash, and an empty segment — and **both still resolve**, which is exactly why they need auditing rather than throwing.");

		this.$run = div.c("row", () => button("Audit every url").click(() => this.run()));
		this.$out = div.c("survey", () => md("Shares the crawl with the rest of this section.").ac("note"));

		if (surveyed()) this.run();

		section("Two different surfaces, and only one was ever broken");

		md(`
| surface | can it be non-canonical? | why |
|---|---|---|
| **\`page.url\`** — what \`naming()\` derives | **no, by construction** | both branches end in \`/\` |
| **an href** | yes, if hand-typed | nothing validates a string |
| **the address bar** | **yes — this is the bug** | \`go()\` pushed the url it was handed |
| **\`.active\` / \`.in-path\`** | **no — never was** | \`mark_links()\` takes \`here\` from \`this.active.url\` |
`);

		md(`That last row is the one worth stating loudly, because it looks like it should be broken and is not. \`mark_links()\` was written to read the page rather than the browser, for an unrelated reason — \`go()\` pushes *after* the load succeeds, so mid-navigation \`location\` still shows the url being left. **The marking pass was already immune to every trailing-slash defect before anyone noticed there were any.**`).ac("note");

		section("Every way the address bar can end up non-canonical");

		md(`
| # | how you get there | before | after R2 |
|---|---|---|---|
| 1 | type or paste \`/tabs\` | bar keeps \`/tabs\` | \`replaceState\` → \`/tabs/\` |
| 2 | type or paste \`/tabs//\` | bar keeps \`/tabs//\` | \`replaceState\` → \`/tabs/\` |
| 3 | click a hand-typed \`href="/tabs"\` | \`pushState("/tabs")\` | \`pushState(active.url)\` → \`/tabs/\` |
| 4 | Back onto an entry created by 1–3 | reproduces the bad url | **no such entry can be created** |
| 5 | an aliased url, \`/alias/intro/\` (P3) | — | \`pushState\` → \`/alias/start/\` |
| 6 | \`location.assign(url)\` — the 404 fallback | raw url, full page load | unchanged, and correctly so |
`);

		md(`Rows 1–3 are the only sources; row 4 is their consequence and closes with them. **Row 6 stays deliberately unfixed**: at that point the Router has given up and handed the string to the browser, and rewriting a url on the way out would hide which url actually failed.`).ac("note");

		section("The rule this leaves");

		md(`> **A page's url is derived and cannot be wrong. Every other appearance of that url is a copy, and a copy can be.**

Which is why the fix belongs in \`go()\` — one place, on the way out — and not in a validator anybody has to call. Checking hrefs, as \`/sitemap/links/\` does, catches the copies nobody can fix automatically, because a hand-typed href is a typo and not a derivation.`);

		visit(["/sitemap/links/", "/sitemap/rule-one/", "/urls/slash/"]);
	},
});
