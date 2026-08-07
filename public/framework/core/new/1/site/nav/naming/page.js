import { Page, p, a, div, pre } from "/app.js";
import { code, section } from "../../ui.js";
import { source } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "What a name costs",

	initialize(){
		// A child named `preview`. Its view gets `page-preview`, which is also the
		// site's card class. This is the bug, reproduced at a real url.
		this.add("preview", () => {
			p("I am a page named `preview`, so `render()` gave me the class `page-preview` — which the site already uses for its little link cards. I have a 1px border, a blue link colour and 4.8px of padding, and none of it was my idea.");
			a.c("page-link", "← What a name costs").href("/nav/naming/");
		});
	},

	content(){
		source(import.meta);

		p("A page's `name` lands in two global namespaces it does not own: `this.<name>` on its parent, and `page-<name>` in CSS. The first is guarded. The second is not.").ac("note");

		section("Two divs, one difference");

		// Neither is the active page, so BOTH should be invisible.
		const $by_class = div.c("page page-preview", "Named by CLASS: .page.page-preview");
		const $by_attr = div.c("page", "Named by ATTRIBUTE: .page[data-page=preview]").attr("data-page", "preview");

		p("There are two `div.page` elements directly above. Neither is the active page, so `.page { display: none }` should hide both. You can see one of them.").ac("note");

		div.c("code", () => {
			div.c("code-label", "getComputedStyle — measured on this page, next frame");
			const $pre = pre();

			requestAnimationFrame(() => $pre.text([$by_class, $by_attr].map($v => {
				const c = getComputedStyle($v.el);
				return [
					$v.el.className.padEnd(20),
					("display: " + c.display).padEnd(24),
					("color: " + c.color).padEnd(28),
					"border: " + c.borderTopWidth,
				].join("");
			}).join("\n")));
		});

		p("`.page-preview` and `.page` are both one class deep, so the cascade breaks the tie by source order — and `.page-preview` is defined later. A page stops hiding because of what it was called.").ac("note");

		section("The url it breaks");

		// NOT `this.preview` — that is the METHOD. alias() refused to overwrite it,
		// which is correct, and the cost is that `this.preview.link()` throws a
		// TypeError three files away from the name that caused it. Ask the Map.
		this.children.get("preview").link("A real page named preview  →");

		p("`/nav/naming/preview/` is a working page wearing a link card's clothes. Nothing in its file asked for that.").ac("note");

		p("Writing that link is how this page found the other half of the cost. `this.preview` is `Page.prototype.preview`, because `alias()` saw the name was taken and quietly declined — so `this.preview.link()` is a `TypeError` at render, pointing at a line that looks fine. The guard is right; it is just silent. A one-line `console.warn` in `alias()` when it skips would have said so immediately.").ac("note");

		section("Who uses the auto-class");

		div.c("code", () => {
			div.c("code-label", "every .page-* selector in the stylesheets loaded right now");
			const $pre = pre();

			// The sheets' own bytes, not the CSSOM — `cssRules` walks come back
			// empty here, and a survey you cannot trust is worse than none.
			const hrefs = [...document.styleSheets].map(sheet => sheet.href).filter(Boolean);

			Promise.all(hrefs.map(href => fetch(href).then(r => r.text()).then(css => [href, css])))
				.then(sheets => {
					const found = new Map();
					sheets.forEach(([href, css]) => (css.match(/\.page-[\w-]+/g) ?? [])
						.forEach(selector => found.set(selector, new URL(href).pathname)));

					$pre.text([...found].sort().map(([selector, file]) => selector.padEnd(20) + file).join("\n")
						|| "none found — no stylesheet is loaded");
				});
		});

		p("Every one of those is a component class somebody wrote by hand — a card, a link, a title, a frame. Not one is a page's auto-class. It is emitted on every page in the site and consumed by nobody, except by accident.").ac("note");

		section("The fix");

		code(`
// Page.class.js, render() — today
    .ac(this.name && "page-" + this.name)   // style THIS page
    .ac(this.col)
    .ac(this.classes);

// proposed
    .ac(this.col)                            // per-page column width
    .ac(this.classes);                       // style pages LIKE this one

// Identity, not a style hook. Attributes and classes are different namespaces,
// so this cannot collide with a component class — ever.
if (this.name) this.view.attr("data-page", this.name);`, "one line moved, no call sites touched");

		p("`data-page` keeps the thing the auto-class was actually good for — reading the DOM in devtools and knowing which page you are looking at — and gives up the thing it was never good at. If you genuinely want to style one page, `classes: \"…\"` already does it, in the file that opted in.").ac("note");

		p("`this.<name>` is the other namespace, and it is already guarded: `child`, `link`, `render`, `chain`, `container` and `naming` are all methods on `Page`, so a child with one of those names quietly gets no shortcut. This page is called `naming` and `this.naming` is still the method.").ac("note");

		a.c("page-link", "← Primitives").href("/nav/");
	}
});
