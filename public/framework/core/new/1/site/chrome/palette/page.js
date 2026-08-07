import { Page, div, p, span, a, input } from "/app.js";
import { code, section } from "../../ui.js";
import { jump_list, prev_next, show_source, demo } from "../chrome.js";

/* Type-ahead over every name the tree can offer without an import.
 *
 * Which is the whole story: this searches LABELS and URLS. It cannot search a
 * title it has not imported, it cannot search content at all, and it cannot see
 * a url that route() would have claimed — those names are unbounded by design.
 */
function palette(root){
	let entries = jump_list(root), hits = entries, at = 0, $input, $hits;

	const draw = () => {
		const q = $input.el.value.trim().toLowerCase();

		hits = entries.filter(e => !q || e.label.toLowerCase().includes(q) || e.url.includes(q));
		at = Math.max(0, Math.min(at, hits.length - 1));

		$hits.empty(() => hits.length
			? hits.slice(0, 12).forEach((e, i) => a.c("chrome-palette-hit", () => {
					span(e.label);
					span.c("chrome-palette-url", e.url);
				}).href(e.url).ac(i === at && "on"))
			: div.c("chrome-palette-empty", `no NAME contains "${q}"`));
	};

	const move = step => { at = (at + step + hits.length) % hits.length; draw(); };

	return div.c("chrome-palette", () => {
		$input = input().ac("chrome-palette-input")
			.attr("type", "text").attr("placeholder", "jump to…")
			.on("input", () => { at = 0; draw(); })
			.on("keydown", e => {
				if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
				if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
				if (e.key === "Enter") $hits.el.querySelector(".on")?.click();   // it's an <a> — let it be one
			});

		$hits = div.c("chrome-palette-hits");
		draw();
	});
}

export default new Page({
	meta: import.meta,
	title: "Jump to",
	classes: "chrome",

	content(){
		demo(() => {
			// real entries, real urls — Enter and click both navigate for real
			palette(this.app.root);
		}, "Type. `↑` `↓` move, `Enter` follows the highlighted one — by clicking it, so an anchor stays the only thing that navigates.");

		show_source(palette);

		section("What it can search");

		this.reach();

		p("Every declared name reachable without an import: the root's children, plus the children of any page already loaded. The number grows as you browse, which is the honest shape of a lazy tree — and the reason this is a jump-to, not a search.").ac("note");

		show_source(jump_list);

		section("What it cannot");

		code(`
titles      a page not imported has no title — only its label
content     nothing is in memory to grep; a full-text index is a build step
route()     /items/42/ is claimed on arrival, so its names cannot be listed
depth       children of an unloaded page are not declared anywhere yet`);

		p("So the box must not promise search. Showing the `url` beside every hit is what makes it honest: you are picking a path, and the path is the thing that is actually known.").ac("note");

		section("The hotkey belongs to the chrome");

		code(`
// in the chrome, built once, alive for the session
document.addEventListener("keydown", e => { if (e.key === "k" && e.metaKey) … });

// on a page — the page is HIDDEN, not destroyed, so this handler outlives
// the screen it belongs to and fires from three pages away
`, "why this demo has no ⌘K");

		p("A page's DOM stays in `$pages` after you leave it; only a class takes it off screen. A global key handler registered by a page therefore never goes away. Chrome may own one precisely because chrome is built once and never leaves — which is the same property that makes it the right home for a palette in the first place.").ac("note");

		prev_next(this);
	},

	// how much of the tree is visible from here, and how much of that cost import
	reach(){
		const list = jump_list(this.app.root);
		const loaded = list.filter(e => e.loaded).length;

		return div.c("chrome-box", () => {
			div.c("chrome-stamp",
				`${list.length} entries · ${loaded} of them imported · ${list.length - loaded} still names`);

			div.c("chrome-shell-pages", () => {
				p(`From \`/\` on a cold load this list would be \`${this.app.root.children.size}\` — the root's children and nothing else. It is longer now only because you walked here.`).ac("note");
			});
		});
	},
});
