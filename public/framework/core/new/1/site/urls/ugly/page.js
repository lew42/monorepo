import { Page } from "/app.js";
import { section } from "../../ui.js";
import { md, claim, visit } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Ugly urls",

	// Everything under me is claimed, including the names that used to break.
	route(name){
		return new Page({
			title: `Segment: ${name}`,
			content(){
				md(`
| what \`route()\` received | |
|---|---|
| raw segment | \`${name}\` |
| \`decodeURIComponent\` | \`${(() => { try { return decodeURIComponent(name); } catch { return "(malformed — throws)"; } })()}\` |
| derived \`url\` | \`${this.url}\` |
| css class from \`.ac("page-" + name)\` | \`page-${name}\` |
`);
				md(`**The segment is never decoded.** \`route()\`, \`children.get()\` and \`naming()\` all see the raw percent-encoded text, which is why the two rows above can differ.`).ac("note");
			},
		});
	},

	content(){

		claim(Page.prototype.alias, null, "`Page.prototype.alias`, rendered from the live function. `in` walks the prototype chain, so `constructor`, `render`, `url` and `__proto__` are all refused correctly. It is blind to the seven properties `Page` assigns *after* construction.");

		section("Ranked: likelihood × damage");

		md(`
| # | edge | what happens | likelihood | damage |
|---|---|---|---|---|
| 1 | **a segment is never decoded** | \`/x/hello%20world/\` reaches \`route()\` as \`hello%20world\`. A **declared** child named \`hello world\` is therefore unreachable — the Map key is decoded text, the segment is not. | high | medium |
| 2 | **child named \`view\`, cold load** | \`alias()\` sets \`this.view = page\`; \`render()\` returns a Page, \`activate()\` reads \`.el\` of undefined. **Blank page.** Works on a click, fails on a reload. | medium | **high** |
| 3 | **child named \`regions\` / \`$pages\`, cold load** | \`container()\` calls \`.get()\` / \`append()\` on a Page. Same order-dependence. | medium | **high** |
| 4 | **non-canonical href** | \`/urls/sla\` gets \`.in-path\` instead of \`.active\` — \`startsWith\` has no segment boundary. Only hand-typed hrefs can do it, and \`site/app.js\`'s nav is hand-typed. | medium | low |
| 5 | **a dotted final segment, no slash** | \`/docs/v1.2\` is rejected by \`link_clicked\`'s \`/\\.\\w+$/\` **and** 404s on the dev server. With the slash, \`/docs/v1.2/\` is fine everywhere. | medium | medium |
| 6 | **repeated \`go()\` to the current url** | three history entries for one page; clicking the tab you are already on costs a Back press. | medium | low |
| 7 | **an href starting with \`//\`** | \`<a href="//tabs//">\` is **protocol-relative**: it parses as \`http://tabs//\`, fails the origin check, and the browser leaves the site. | low | **high** |
| 8 | **child named \`loading\` / \`default_tab\`** | silently changes what a later \`tabs()\` does — labels, and which set owns the page url. | low | low |
| 9 | **root page with a child named \`parent\`** | \`root.parent = child\` and \`child.parent = root\`. \`chain()\` walks forever. **Tab hangs.** Only reachable on a page that has no parent. | very low | **total** |
| 10 | **a 404 leaves \`document.title\` stale** | the error view renders with the previous page's title. | low | low |
`);

		section("Verified safe");

		md(`
| segment | result |
|---|---|
| \`constructor\`, \`__proto__\`, \`render\`, \`url\`, \`children\`, \`route\` | refused by the guard, resolve normally — **no prototype pollution**, \`children\` is a \`Map\` |
| \`%3Cscript%3E\` | rendered as text; \`title\`, \`h1\` and \`href\` all take the string path, never \`innerHTML\` |
| a 300-character segment | resolves; url, class and title all fine |
| \`trailing.\` | resolves — the guard regex needs \`\\w\` **after** the dot |
| a mis-cased url | 404s identically in dev and production, because \`children.get()\` is consulted before the filesystem ever is. See **/urls/static/** |
`);

		section("Click them");

		visit([
			"/urls/ugly/constructor/", "/urls/ugly/__proto__/", "/urls/ugly/render/", "/urls/ugly/url/",
			"/urls/ugly/view/", "/urls/ugly/regions/", "/urls/ugly/$pages/",
			"/urls/ugly/hello%20world/", "/urls/ugly/h%C3%A9llo/", "/urls/ugly/%3Cscript%3E/",
			"/urls/ugly/v1.2/", "/urls/ugly/trailing./",
		]);

		md(`Rows 2, 3 and 9 above are **measured before the fix**, which is now **applied in \`Page.class.js\`** — so \`view\`, \`regions\` and \`$pages\` are safe to click above, and were not before.`).ac("note");

		section("The fix — say what state the class has");

		claim(() => {
			class Page {
				view;          // built once by render(), never rebuilt
				regions;       // named child -> container, written by tabs()
				$pages;        // I claim the subtree below me
				loading;       // load_all_children()'s promise
				default_tab;   // the first tabs() set owns this page's url
				parent;        // assigned by add(), the one place
				app;           // assigned on the walk, in child()
			}
		}, null, "Seven class fields, no initialisers, no behaviour change: a field declared with no value is `undefined` either way. The guard that already exists becomes complete, and the class's mutable state is now legible from the top of the file.");

		md(`The alternative — a third parameter on \`add()\`, or teaching \`alias()\` which names came from the url — makes the guard cleverer. This makes the class honest instead, which is why it costs a reader **less** to remember than the code it replaces, not more.`).ac("note");

		section("What is left unfixed, on purpose");

		md(`
| | why not |
|---|---|
| decoding segments | \`decodeURIComponent\` in \`child()\` would make \`children.get()\` and the module path disagree, and a malformed \`%\` **throws**. The honest fix is a rule — *a \`children\` key is a url segment, so write it url-safe* — not a call. |
| \`.in-path\` segment boundaries | every href the framework builds is canonical already. Fixing the comparison would hide the real bug, which is a hand-typed href. |
| protocol-relative hrefs | nothing in the framework produces one. It is a hazard to know, not a check to add. |
`);

		visit(["/urls/static/", "/urls/schema/"]);
	},
});
