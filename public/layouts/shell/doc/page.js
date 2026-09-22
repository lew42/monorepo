import { Page, md, demo, div, span, button } from "/app.js";

/* Patches demo.steps() on — a page-local side effect, the way ext/demo's own
 * doors already patch each other (layout.js imports exhibit.js). Not centrally
 * registered in app.js yet: that one line belongs to a task whose fence covers
 * app.js, not this one. */
import "/framework/ext/demo/steps.js";

/* The shell's doc. One note today — the owner's questions about what a page is,
   plus a hands-on for the three gestures the live shell offers.

   ⚠ The note is a DECLARED child holding its own `content()`, not a bare name in a
     string. A bare name sends core down its probe chain — `page.js` first, the
     `.md` only as a last resort — so every visit to any page under here would log
     a 404 for a `page.js` that was never going to exist. `/layouts/doc/` says the
     same thing, and measured it: 3 console errors on every page, 0 after. */

const note = (name, title, description) => [title, {
	description, icon: "article",
	content(){ return md.file(import.meta, name + ".md", { h1: false }); },
}];

/* A small stand-in for the real shell, not the `Shell` class itself. Why: the
   real shell's rail-plus-viewport lives inside a fixed-height region that never
   scrolls (`../page.js`, its own header comment), and wrapping THAT in
   demo.steps() was tried and measured broken — the two boxes demo.steps() adds
   have no height of their own, so `height: 100%` on the shell's row resolved
   against nothing and the whole thing grew to its un-clipped content height,
   9,671px, instead of filling the region (`../page.js`'s own warning has the
   number). Fixing that needs a rule in shell.css, which this task's fence keeps
   closed. This mock needs none of that fight — it sits in ordinary page flow —
   and it fires the same three events the real gestures do. The real thing, to
   actually feel the drag and the tree, is one click away: /layouts/shell/. */
function shell_mock(){
	const designs = ["Ocean", "Meadow", "Ember"];
	const widths = { Narrow: "8em", Wide: "16em" };
	let picked = designs[0], wide = false, folded = false;
	let $rail, $list, $view, $resize, $fold;

	const paint = () => $list.empty(() => designs.forEach(name =>
		button.c(name === picked ? "btn prim" : "btn", name).click(() => {
			picked = name;
			paint();
			$view.text(`${picked} — the design now in the viewport.`);
			$rail.el.dispatchEvent(new CustomEvent("design", { bubbles: true }));
		})));

	return div.c("flex wrap gap surface pad", () => {
		$rail = div.c("flex v gap-50", () => {
			div.c("flex v-center wrap gap-35", () => {
				span.c("h4 muted", "Designs");

				$resize = button.c("btn", "Wide").click(() => {
					wide = !wide;
					$resize.text(wide ? "Narrow" : "Wide");
					$rail.style("flex", `0 0 ${widths[wide ? "Wide" : "Narrow"]}`);
					$rail.el.dispatchEvent(new CustomEvent("resize", { bubbles: true }));
				});

				$fold = button.c("btn", "Hide").click(() => {
					folded = !folded;
					$fold.text(folded ? "Show" : "Hide");
					folded ? $list.hide() : $list.show();
					if (folded) $rail.el.dispatchEvent(new CustomEvent("fold", { bubbles: true }));
				});
			});

			$list = div.c("flex v gap-35", () => {});
			paint();
		}).style("flex", `0 0 ${widths.Narrow}`);

		$view = div.c("flex-1 surface pad", `${picked} — the design now in the viewport.`);
	});
}

export default new Page({
	meta: import.meta,
	title: "Docs",
	icon: "menu_book",
	description: "What counts as a real page, what is a dynamic one, and how a page derives from another.",

	children: [
		note("pages", "Pages", "The owner's questions about pages, each with the answer we can give now and the alternative."),
	],

	content(){
		demo.steps({
			steps: [
				{ say: "Resize the sidebar", when: "resize" },
				{ say: "Pick a design", when: "design" },
				{ say: "Open the fold", when: "fold" },
			],
			stage: shell_mock,
		});

		md("A small stand-in for the [real shell](/layouts/shell/) — the same three gestures, the same three events, none of the real page's fixed-height rules to fight (why, above `shell_mock`).");

		md("One note, and it is a list of questions rather than a statement — several of them are still open.");
		this.previews();
	},
});
