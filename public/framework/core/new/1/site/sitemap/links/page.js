import { Page, div, button, p } from "/app.js";
import { section } from "../../ui.js";
import { md, claim, visit } from "../../urls/ui.js";
import { check_links, survey, surveyed, by_seat } from "../crawl.js";

export default new Page({
	meta: import.meta,
	title: "Link checker",

	run(){
		this.$out.empty(() => p("crawling…"));
		survey(this.app, (row, n) => this.$out.empty(() => p(`crawling… ${n} pages · ${row.url}`)))
			.then(({ links }) => this.report(links));
	},

	report(links){
		const seats = by_seat(links);
		const detail = list => list.map(l => `- \`${l.href}\` — on \`${l.from}\`${l.text ? ` (“${l.text}”)` : ""}`).join("\n");

		this.$out.empty(() => {
			md("| # | section | links | ok | **broken** | **non-canonical** | off-site | file |\n|---|---|---|---|---|---|---|---|\n"
				+ seats.map((s, i) => `| ${i + 1} | \`${s.seat}\` | ${s.total} | ${s.ok} | ${s.broken.length || ""} | ${s.non_canonical.length || ""} | ${s.off_site || ""} | ${s.file || ""} |`).join("\n"));

			const bad = seats.filter(s => s.broken.length || s.non_canonical.length);

			if (!bad.length) return md(`**No broken and no non-canonical links anywhere.** ${links.length} anchors across ${seats.length} sections.`).ac("note");

			bad.forEach(s => {
				md(`#### \`/${s.seat}/\` — ${s.broken.length} broken, ${s.non_canonical.length} non-canonical`);
				if (s.broken.length) md("**Broken** — nothing resolves these:\n\n" + detail(s.broken));
				if (s.non_canonical.length) md("**Non-canonical** — these resolve, but give the page a second url:\n\n" + detail(s.non_canonical));
			});
		});
	},

	content(){

		claim(check_links, null, "Every anchor every page emits, resolved through **the router's own `load_segments`** rather than a copy of it — so a verdict here and a real navigation cannot disagree.");

		this.$run = div.c("row", () => button("Check every link").click(() => this.run()));
		this.$out = div.c("survey", () => md("Press the button. It crawls once per session and the other sitemap pages share the result.").ac("note"));

		if (surveyed()) this.run();

		section("The four verdicts");

		md(`
| verdict | meaning | is it a bug? |
|---|---|---|
| **ok** | resolves, and ends in \`/\` with no empty segments | no |
| **broken** | \`load_segments\` returns \`null\` — no declaration, no file, no \`route()\` claim | **yes** |
| **non-canonical** | resolves, but the href is not the page's own url | **yes, quietly** — see below |
| off-site | a different origin | no — \`link_clicked\` correctly declines it |
| file | a dotted final segment, e.g. \`/readme.md\` | no — declined on purpose, and the dev server 404s it |
`);

		section("Which of these are deliberate");

		md(`The checker reports facts and cannot read intent, so three clusters in the table above are **specimens, not defects** — and naming them is the difference between a useful report and 50 numbers nobody trusts:

| where | what | verdict |
|---|---|---|
| \`/deep/errors/*\` | a module that throws at import, one that 404s, one that is declared and absent | deliberate — the \`deep\` seat is demonstrating \`Page.load\`'s *missing vs broken* distinction |
| \`/urls/slash/\` — 1 broken, 4 non-canonical | \`/urls/sla\`, \`/urls/slash\`, \`/urls/slash//\` | deliberate — they are the exhibits for the marking rules |
| \`/patterns/api/Nope/\` | a mis-cased segment | deliberate — case-sensitivity demo |

Everything else in the table is a genuine broken link. The largest cluster by far is a nav rendered with **illustrative urls that were never built** — a mock sidebar linking \`/guide/\`, \`/api/\`, \`/changelog/\`. That is a legitimate way to demo chrome, and it is also indistinguishable from a typo to every reader and every crawler, so it is worth knowing about.`);

		section("Why non-canonical is a real finding and not pedantry");

		claim(() => {
			// Router.mark_links — a plain string prefix, with no segment boundary
			link.classList.toggle("active", link.pathname === here);
			link.classList.toggle("in-path",
				link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		}, null, "`here` is always the page's canonical url. So an href that is *not* canonical can never match `.active` — it silently becomes an ancestor of the page it points at, or nothing at all.");

		md(`
| href to this page | \`.active\` | \`.in-path\` | what the reader sees |
|---|---|---|---|
| \`/urls/slash/\` | yes | — | correct |
| \`/urls/slash\` | **no** | yes | a nav item that never highlights |
| \`/urls/slash//\` | **no** | **no** | a nav item that is never marked at all |
| \`/urls/sla\` | no | **yes** | an unrelated link marked as an ancestor |
`);

		md(`**Every href the framework builds is immune** — \`link()\`, \`preview()\`, \`previews()\` and \`tabs()\` all build from \`page.url\`, which is canonical by construction. Only a hand-typed href can do this, and \`site/app.js\`'s nav array is hand-typed, as is every \`visit()\` and \`a().href()\` in fourteen seats' pages. That is exactly the population this checker covers.`).ac("note");

		visit(["/sitemap/canonical/", "/sitemap/", "/urls/slash/"]);
	},
});
