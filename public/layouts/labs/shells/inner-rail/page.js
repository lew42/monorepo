import { Shell } from "../Shell.js";
import { Page, div, a, h2, md } from "/app.js";

/* Container: the app region, full viewport. Size: a 13em outer rail, then the
   content area — which splits AGAIN into an 11em inner rail and a body. Own
   layout: the one grid for the shell, a flex row inside `main`. Regions: three,
   and the third belongs to the CONTENT, not to the app. Preview: default card.

   ⚠ `main` hands its scrolling inwards (`shell-stage`): the inner body is the
     scroller, so the inner rail stays put while its own document moves. */

const sections = [
	["Overview", "The inner rail is this document's own table of contents. It moves you INSIDE the area; the rail on the far left moves you between screens. That difference is the whole question this page is here to answer."],
	["Treatment", "The outer rail is a filled band on the app's floor. The inner rail is a hairline and quieter type on the same paper as the text beside it — no second fill, no second frame."],
	["Why not both filled", "Two bands of equal weight one inside the other and the eye cannot tell which one owns the content. /framework/ux/* banded exactly that way; ext/Doc reached the same answer from the other side — a Doc nested in another Doc's panel draws its strip as a left rail, never a second well."],
	["The rule", "Outer chrome is a FILL. Inner chrome is a RULE. If inner chrome needs a fill to be found, the thing it belongs to is a screen, not an area."],
];

export default new Shell({
	meta: import.meta,
	title: "Inner rail",
	description: "A content area carrying its own rail — and the treatment that keeps it the area's.",
	icon: "layers",
	group: "Inner chrome",

	left(){ return this.rail("left"); },

	main(){
		return div.c("shell-main shell-stage", () => {
			div.c("shell-inner", () => {
				this.inner_rail();

				div.c("shell-inner-body", () => {
					div.c("shell-doc flow", () => {
						this.content();
						this.verdict();
					});
				});
			});
		});
	},

	// The area's own nav. ⚠ `#slug` links are the one href Router.link_clicked()
	// deliberately ignores, so this is a native in-page jump inside the inner
	// scroller and the shell never re-renders.
	inner_rail(){
		return this.$rail = div.c("shell-inner-rail", () => {
			div.c("shell-inner-title h4", "In this page");

			sections.forEach(([title], i) => a.c("shell-inner-link", title)
				.href("#" + Page.slug(title))
				.ac(i === 0 && "on"));
		}).on("click", e => {
			const link = e.target.closest("a");
			if (!link) return;

			this.$rail.el.querySelectorAll(".shell-inner-link").forEach(el => el.classList.remove("on"));
			link.classList.add("on");
		});
	},

	content(){
		sections.forEach(([title, body]) => {
			h2(title).attr("id", Page.slug(title));
			md(body);
		});
	},

	finding: "inner chrome reads as the area's the moment it stops looking like the app's — same paper, a hairline instead of a band, one type step down. Give it the outer rail's fill and you have two apps stacked; give it the outer rail's JOB (moving between screens) and it IS the outer rail, one level in.",
});
