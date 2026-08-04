import { Page, div, p } from "/app.js";
import { section } from "../../ui.js";
import { md, claim, visit } from "../../urls/ui.js";

/* The three mechanisms rule 1 carries, each as the real expression, so the
 * table below is computed rather than asserted. */
const module_url = url => url + "page.js";                 // Page.child / Page.load
const declined = path => /\.\w+$/.test(path);              // Router.link_clicked AND server.js

const paths = ["/urls/schema/", "/urls/schema", "/docs/v1.2/", "/docs/v1.2", "/a.b/c/", "/x/y.json", "/trailing."];

export default new Page({
	meta: import.meta,
	title: "Rule 1, three times",

	// fetched live, so the dev server answers for itself
	probe(){
		this.$http.empty(() => p("asking the server…"));

		Promise.all(paths.map(path =>
			fetch(path, { method: "GET" }).then(res => ({ path, status: res.status })).catch(() => ({ path, status: "ERR" }))
		)).then(rows => this.$http.empty(() => {
			md("| path | server | `link_clicked` | reachable by click? |\n|---|---|---|---|\n" + rows.map(({ path, status }) =>
				`| \`${path}\` | ${status === 200 ? "200" : "**" + status + "**"} | ${declined(path) ? "**declined**" : "intercepted"} | ${status === 200 && !declined(path) ? "yes" : "**no**"} |`
			).join("\n"));

			md(`Fetched from the dev server just now, in your browser. The \`404\`s are \`server.js\` refusing to fall back for anything matching \`/\\.\\w+$/\` — **the same regex \`link_clicked\` uses**, in a different process, for a different reason.

**Your console shows those 404s too. They are this table working**, and they are the only route in the site that logs one on purpose.`).ac("note");
		}));
	},

	content(){

		md(`**The trailing slash is not a formatting preference.** It is load-bearing in three independent mechanisms, in three different files, and if you drop it all three fail at once — two of them silently.`);

		section("1 · It carries the module path");

		claim(module_url, null, "`Page.child()` builds the import path by concatenation. There is no join, no normalisation, and no branch — because rule 1 guarantees there is nothing to normalise.");

		md("| page url | `url + \"page.js\"` | |\n|---|---|---|\n" + [
			"/urls/schema/inverse/", "/urls/schema/inverse", "/", "",
		].map(url => {
			const built = module_url(url);
			const ok = built.endsWith("/page.js");
			return `| \`${url || "(empty)"}\` | \`${built}\` | ${ok ? "resolves" : "**nonsense**"} |`;
		}).join("\n"));

		md(`\`/urls/schema/inversepage.js\` is not a 404 you would diagnose quickly — it is a plausible-looking path to a file nobody ever wrote. This is why \`naming()\` appends the slash rather than trusting the caller.`).ac("note");

		section("2 · It carries the click");

		claim(declined, null, "`Router.link_clicked` returns `null` for any pathname whose **final** segment has a dot. Anchored at the end — so `/a.b/c/` is fine and `/a/b.c` is not.");

		md("| path | `/\\.\\w+$/` | |\n|---|---|---|\n" + paths.map(path =>
			`| \`${path}\` | ${declined(path)} | ${declined(path) ? "**never intercepted** — full page load" : "intercepted"} |`
		).join("\n"));

		md(`A page legitimately named \`v1.2\` is **unreachable by click** at \`/docs/v1.2\` and perfectly fine at \`/docs/v1.2/\`. The slash is the entire difference, and nothing anywhere reports it — the link just does a full page load instead of a navigation, which looks like the site being slow rather than the url being wrong.`).ac("note");

		section("3 · It carries the fallback");

		this.$http = div.c("survey");
		this.probe();

		section("Three mechanisms, one character");

		md(`
| | file | what the slash does | how it fails without it |
|---|---|---|---|
| 1 | \`Page.class.js\` | makes \`url + "page.js"\` a valid path | a 404 on a path nobody wrote |
| 2 | \`Router.js\` | keeps the final segment undotted | a silent full page load |
| 3 | \`server.js\` (and Cloudflare's SPA fallback) | keeps the request out of the extension rule | a hard 404 in dev, 200 in production |
`);

		md(`They were written at different times, by different people, for unrelated reasons. **None of them mentions the others.** That is what makes rule 1 a rule rather than a convention: it is the single assumption three independent mechanisms happen to share, so it cannot be relaxed in one place without breaking the other two — and the failures are a 404, a performance regression and a dev/prod divergence, which nobody would ever file as the same bug.`);

		section("So the rule is one sentence");

		md(`> **A page url always ends in \`/\`.** \`naming()\` produces nothing else, and three separate mechanisms depend on it.`);

		visit(["/sitemap/", "/sitemap/canonical/", "/urls/schema/", "/urls/static/"]);
	},
});
