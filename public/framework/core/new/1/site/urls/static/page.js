import { Page } from "/app.js";
import { section, code } from "../../ui.js";
import { md, claim, visit } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "The static contract",

	content(){

		code(`
dev     express.static(site) -> express.static(public) -> if /\\.\\w+$/ 404, else index.html
prod    Cloudflare Workers assets, not_found_handling: "single-page-application"
                             -> if no asset matches, /index.html with 200`, "the two fallbacks");

		md(`They must agree for every url the schema can produce, because **a url that works in dev and 404s in production only shows up after a deploy** — and by then the person who wrote it has moved on.`);

		section("Measured against the dev server");

		md(`
| url | dev | production | agree |
|---|---|---|---|
| \`/urls/static/\` | 200 index.html | 200 index.html | yes |
| \`/urls/static\` | 200 index.html | 200 index.html | yes |
| \`/urls/static//\` | 200 index.html | 200 index.html | yes |
| \`/urls/nope/\` | 200 index.html → app 404 | 200 index.html → app 404 | yes |
| \`/urls/ugly/v1.2/\` | 200 index.html | 200 index.html | yes |
| \`/urls/ugly/v1.2\` | **404** | 200 index.html | **no** |
| \`/app.js\`, \`/styles.css\` | 200, real file | 200, real file | yes |
| \`/urls/nope/page.js\` | **404** | **200 index.html** | **no** |
`);

		section("The two disagreements, and why only one matters");

		md(`**\`/urls/ugly/v1.2\`** — dev's fallback refuses anything matching \`/\\.\\w+$/\`, production's does not. So a dotted final segment with no trailing slash is a *harder* 404 in dev than in production. The divergence points the safe way: **dev is stricter**, so nothing can pass review and then break live. And \`link_clicked\` rejects that url in both environments anyway, so it was never clickable — which is rule 1 earning its keep for the third time.`);

		md(`**\`/urls/nope/page.js\`** is the one that could have been serious, and is not — but only because one method already knew:`);

		claim(Page.missing, null, "`Page.missing`, rendered from the live function. Dev 404s the missing module, so the browser says *failed to fetch*. Production returns `index.html` with `Content-Type: text/html`, so the browser says *expected a JavaScript module, got MIME type text/html*. Both strings are in the regex, so a missing page is a missing page in both.");

		md(`Without those last two alternatives, every 404 in production would arrive as a **syntax error in a real file** rather than a missing one — and \`Page.load\` would have logged *"the file EXISTS but failed to load"* for a file that does not exist. That is the whole class of after-deploy bug, avoided by four words in a regex.`).ac("note");

		section("Case sensitivity — the one that should have bitten");

		md(`Windows filesystems are case-insensitive, Cloudflare's asset store is not. \`/COLUMNS/page.js\` returns **200 in dev** and would 404 in production, which is exactly the shape of the worst bug on this page.

**It cannot happen**, and the reason is structural rather than lucky:`);

		claim(async () => {
			// Page.child — the name reaching the network already matched a Map key
			const known = this.children.get(name);

			if (known === null){
				const page = await Page.load(this.url + name + "/");
			}
		}, null, "A segment only reaches `Page.load` after `children.get(name)` returned `null`, and `Map.get` is case-sensitive. So the string handed to `import()` is always one an author typed, never one a visitor did.");

		md(`
| | |
|---|---|
| \`/Columns/\` | \`root.children.get("Columns")\` → \`undefined\` → \`route()\` → 404. **In both environments.** |
| \`/columns/\` | \`null\` → \`import("/columns/page.js")\` — the declared spelling, always |
`);

		md(`\`route()\`-claimed names never touch the filesystem at all, so they cannot diverge either. **Only declared names hit the network** turns out to be a deployment guarantee as well as a performance one.`).ac("note");

		section("What would break it");

		md(`
| change | what it would cost |
|---|---|
| deriving a module path from a url segment without a Map lookup first | case-sensitivity divergence, and a doomed 404 per dynamic url |
| an \`index.html\` inside any page directory | Cloudflare's \`html_handling\` would serve or redirect to it and the SPA fallback would never run. There is currently **exactly one** \`index.html\` per site root. |
| a page url ending in \`.html\` | \`auto-trailing-slash\` rewrites it in production and nothing rewrites it in dev |
| relying on the dev server's extension 404 | production has no such rule; treat it as a dev convenience, never a contract |
`);

		section("Nothing here needs a server");

		md(`Every proposal in this section is client-side by construction. \`aliases\` resolves in \`child()\`, canonicalisation is \`history.pushState\`, the hash scroll is \`scrollIntoView\`. **There is no 301 anywhere**, which is the only way a redirect can exist on pure static hosting — and it is why \`aliases\` had to be a name lookup rather than an HTTP concept.`).ac("note");

		visit(["/urls/schema/", "/urls/alias/", "/urls/"]);
	},
});
