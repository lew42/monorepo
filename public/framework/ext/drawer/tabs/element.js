import { div, span, small, a, button, h4 } from "/framework/core/View/View.js";
import { context } from "/framework/ext/Ask/pick.js";
import { section, row } from "/framework/dev/DevBar/parts.js";
import select, { item, word } from "../select.js";

/* THE ELEMENT TAB — the properties of whatever is selected on the page (select.js).
   Minimal on purpose: WHAT it is (its kind, tag, classes, first words) and WHERE it is
   (the page, the nearest readme, the module that owns its class, the page file that
   drew it). The where half is ext/Ask's own `context()` — the same gathering its
   "pick an element" does — so the two can never disagree.

   "Ask about this" puts the element on the AI tab's input as a chip; the next message
   carries it as context. doc/select.md. */
export default function element({ app, tabs }){
	const el = select.selected;

	div.c("drawer-props flex v", () => {
		if (!el?.isConnected) return void small.c("drawer-wait muted",
			"Click anything on the page — a paragraph, a heading, a list item, a card — to select it. Escape clears it.");

		const it = item(el);

		div.c("drawer-props-head flex v-center split", () => {
			h4.c("drawer-props-title", "This " + word(el));
			button.c("btn prim drawer-ask", "💬 Ask about this").attr("type", "button")
				.attr("title", "Add it to the AI tab's input as a chip").click(() => { tabs.chip(it); tabs.open("ai"); });
		});

		section("what", () => {
			row("tag", "<" + it.kind + ">");
			if (el.classList.length) row("class", [...el.classList].join(" "));
			row("text", it.text.slice(0, 140) + (it.text.length > 140 ? "…" : "") || "—");
		});

		// ⚠ `context()` fetches the readmes — so the box is captured now and filled in a
		// callback, never built after the await (code skill §1).
		section("where", () => {
			div.c("drawer-props-where flex v", $where => {
				small.c("muted", "finding its readme…");
				context(el, { app }).then(about => $where.empty(() => {
					link_row("page", about.page);
					if (about.file) link_row("file", about.file);
					if (about.readme) link_row("readme", about.readme.url);
					if (about.module) link_row("module", about.module.url);
					if (!about.readme && !about.module) row("readme", "none found near this page");
				}));
			});
		});
	});
}

// A key/value row whose value is a link — the dev bar's row, with the url inside it.
function link_row(key, url){
	div.c("dev-row", () => {
		span.c("dev-key", key);
		a.c("dev-val drawer-props-link", url.replace(/^\/framework\//, "")).href(url).attr("title", url);
	});
}
