import { Page } from "/app.js";
import { section } from "../../ui.js";
import { md, claim, visit } from "../ui.js";

/* Every row of the table below is a REAL Page, constructed here and asked for
 * its url. Nothing quotes naming(); if naming() changes, this page changes with
 * it. That is the only way a schema document can be trusted. */
const derive = options => new Page(options);

const rows = () => [
	["meta, a directory page", { meta: { url: location.origin + "/urls/schema/page.js" } }],
	["meta, the site root", { meta: { url: location.origin + "/page.js" } }],
	["meta, nested deep", { meta: { url: location.origin + "/a/b/c/page.js" } }],
	["parent + name", { parent: { url: "/a/" }, name: "b" }],
	["parent + name, from the root", { parent: { url: "/" }, name: "top" }],
	["url given outright", { url: "/given/anything/" }],
	["title falls back to name", { parent: { url: "/a/" }, name: "guide" }],
	["nothing at all", {}],
];

export default new Page({
	meta: import.meta,
	title: "Schema",
	children: "inverse",

	// Anything I did not declare, I claim. route() runs after the declaration,
	// so it can never shadow inverse/page.js.
	route(name){
		return new Page({ title: `Claimed: ${name}`, content(){
			md(`No file, no declaration. \`route("${name}")\` built this page on the spot — and it could not have shadowed a \`page.js\`, because a file you want is a file you declared.`);
		} });
	},

	content(){

		claim(() => new Page({
			meta: import.meta,           // the file's own location IS the url
			title: "Schema",
			children: "inverse",         // one name, one segment, one directory
			route(name){                 // everything else under me, claimed
				return new Page({ title: `Claimed: ${name}` });
			},
		}), ["/urls/schema/", "/urls/schema/inverse/", "/urls/schema/42/", "/urls/schema/anything/"],
			"Four live urls. Three of them have no file.");

		section("The five rules");

		md(`
| # | rule | where it lives |
|---|---|---|
| 1 | **A page url always ends in \`/\`.** There is no second shape in this tier. | \`Page.naming()\` |
| 2 | **A segment is a \`children\` key**, looked up exactly, case-sensitively. | \`Page.child()\` |
| 3 | **The filesystem is the router**: \`/a/b/\` ← \`/a/b/page.js\`. | \`Page.child()\` + \`Page.load()\` |
| 4 | **Only a declared name reaches the network.** \`route()\` claims the rest. | \`Page.child()\` |
| 5 | **The page's own url is canonical**, not the one you typed. | \`Router.activate()\` |
`);

		section("Rule 1, executed");

		claim(derive, null, "Each row below calls exactly this, then reads back `url`, `name` and `title`.");

		md("| given | url | name | title |\n|---|---|---|---|\n" + rows().map(([label, options]) => {
			const page = derive(options);
			const cell = v => v === undefined ? "*undefined*" : "`" + v + "`";
			return `| ${label} | ${cell(page.url)} | ${cell(page.name)} | ${cell(page.title)} |`;
		}).join("\n"));

		md(`**There is exactly one url shape.** The older \`core/Page\` tier had two — \`/docs/page.js\` → \`/docs/\` **and** \`/docs/x.page.js\` → \`/docs/x\` — which is why its \`Page.module_url()\` needs a branch. \`naming()\` has no such branch, so in this tier the inverse is one expression and the trailing slash is never optional.`).ac("note");

		section("The inverse, both directions");

		claim(() => {
			const module_url = url => url + "page.js";       // /a/b/  ->  /a/b/page.js
			const page_url = meta => new URL(".", meta.url).pathname;   // …and back
		}, "/urls/schema/inverse/", "The whole convention. `/urls/schema/inverse/` is the file that says so.");

		section("Three slots, one lookup");

		claim(() => {
			const known = this.children.get(name);

			if (known) return known;                              // a Page — here already
			if (known === null) return Page.load(this.url + name); // declared — go get it
			return this.route?.(name);                            // never declared — claim it?
		}, null, "`undefined` and `null` are different answers, and that is the whole design: a name you never declared costs no doomed 404, and `route()` structurally cannot shadow a file.");

		section("When does the url exist?");

		md(`Rule 1 says a page url always ends in \`/\`. It does not say *when* there is one — and a page built inline has no url at all until a parent adopts it.

\`add()\` used to construct the child and assign \`parent\` **afterwards**, so \`naming()\` and \`initialize()\` both ran before the page knew where it lived. A page calling \`this.add()\` from \`initialize()\` handed its children a url of \`undefinedkid/\`, silently — and every \`route()\`-built page is in exactly that position.`);

		claim(() => {
			// add(), before — the child was built, THEN told where it is
			const page = new Page(options);
			page.assign({ name, parent: this, app: this.app }).naming();

			// add(), now — adoption goes in through the constructor
			const adopt = { name, parent: this, app: this.app };
			const page2 = new Page(options, adopt);
		}, null, "**Applied.** The constructor already takes `...args` and lets later ones win — the same shape as `new Router(this.router, { app: this })` — so handing adoption in as the second argument makes the ordering problem stop existing.");

		md(`
| \`add(name, …)\` given | \`this.url\` inside \`initialize()\` | child added there |
|---|---|---|
| an options object | \`/host/a/\` | \`/host/a/kid/\` |
| options, nested two deep | \`/host/c/deep/\` | — |
| \`new Page({ … })\` you built | **\`undefined\`** | **\`undefinedkid/\`** |
`);

		md(`The last row cannot be fixed and should not be: you constructed the page before anything adopted it, so there was no url to have. **The rule is that \`route()\` and \`add()\` want options, not a constructed \`Page\`, whenever the page needs \`initialize()\`.** A page with its own \`meta\` is never affected — it knows its url from its own file.`).ac("note");

		section("Where the rules break");

		md(`Rule 5 is the one the code does not yet keep — \`Router.go()\` pushes the url it was handed, so \`/tabs\` and \`/tabs//\` stay in the address bar. That is **/urls/slash/**. Rules 2 and 4 have edges worth knowing: **/urls/ugly/**.`);

		visit(["/urls/slash/", "/urls/ugly/", "/urls/static/"]);
	},
});
