import { View, div, h3, span, a, code, icon, md, ui } from "/app.js";
import { Paging } from "../paging.js";

View.stylesheet(import.meta, "templates.css");

/* ── A TEMPLATE IS A WHOLE PAGE SHAPE YOU CAN START FROM ───────────────────────

   The library (`../presets.js`) is twelve shapes this realm builds out of its own
   five words. A TEMPLATE is the other half: eleven shapes the REST OF THE SITE
   already ships, each drawn by its own real machinery — a magazine cover is
   `mag/page.js`'s own `column()`, a blog wall is `Post.wall()`, a shell is
   `Shell.rail()` + `Shell.main()`. `families.js` is that list, and nothing in it
   is a copy.

   `Template` is a `Paging` with one addition: the stage's box holds the FAMILY
   instead of the realm's own content. So a family page gets the hover toolbar for
   free, which is what "see this template under every colour and every type scale"
   has to mean before it means anything else.

   ⚠ THE TYPE AXIS MOVED. It used to be a sixth chip group added by a `Template.Toolbar`
     subclass; it is now one of the seven words every stage has (`../blocks.js`), so
     this class no longer has a toolbar of its own at all. (2026-09-05; doc/templates.md
     had already costed the move at four lines.)                                  */

export class Template extends Paging {

	// What the stage opens on. A family page is about the SHAPE, so the surface and
	// the type scale start where the family looks most like itself.
	config(){
		return {
			navigation: "none",
			content: "article",
			room: "wide",
			arrangement: "plain",
			surface: this.surface ?? "card",
			background: this.background ?? "tint",
			type: this.type ?? "regular",
		};
	}

	content(){
		this.lede("Point at the page below: the toolbar's two colour rows and its type size repaint this real " + this.title.toLowerCase() + ", live.");

		/* ⚠ THE ADAPTER, not the page. `families.js` asks its host for `at("style")`
		     to pick a tone word, and a `Paging` has no axes any more — so the draw
		     seam hands the family a two-line object reading the STAGE's own config.
		     Passing `this` would have thrown on the two families that ask. */
		this.stage(this.config(), {
			draw: stage => this.family.example({ at: axis => stage.config[axis === "style" ? "surface" : axis] }, true),
		});

		this.about();
		this.made();
		this.machinery();
		this.members();
	}

	// WHAT IT IS FOR — after the picture, never before it.
	about(){
		h3("What it is for");
		md(this.family.what);
	}

	/* THE ONE-LINE SPEC. `Make` builds a real page from one line of text; this is the
	   line this family would need. `family.gap` says which words do not exist yet. */
	made(){
		h3("Make a page from this");

		md(this.family.make);

		code.js(this.family.spec);

		md(this.family.gap
			? "**" + this.family.gap + "** The exact words Make would need are written up as a proposal: [doc/templates.md](/imagine/paging/doc/templates/)."
			: "Every word on that line is already in Make's vocabulary — [type it in](/imagine/paging/make/).");
	}

	// WHICH CLASS DRAWS THE EXAMPLE, AND WHERE IT LIVES. Nothing here is a mock-up,
	// so every row is a link you can open and read the source of.
	machinery(){
		h3("What draws it");

		ui.table(["what runs", "where it lives"], this.family.uses.map(([what, url, where]) => [
			() => code.js(what),
			() => a.c("page-link", where ?? url).href(url),
		]));
	}

	members(){
		if (!this.family.members?.length) return;

		h3("The family");

		div.c("templates-members", () => this.family.members.forEach(([label, url, note]) =>
			a.c("templates-member").href(url).append(() => {
				span.c("templates-member-name", label);
				span.c("templates-member-note", note);
			})));
	}
}

/* A FAMILY CARD — the wall's unit, and the only place the iconic example is drawn
   small. Title, the live example, one sentence, the way in. */
export const card = family => div.c("templates-card", () => {
	h3.c("templates-card-head", () => {
		icon(family.icon).ac("templates-card-icon");
		span(family.title);
	});

	div.c("templates-stage", () => { family.example(null, false); });

	md(family.card_line).ac("templates-card-say");

	a.c("page-link templates-card-more", family.title + " →").href("/imagine/paging/templates/" + family.name + "/");
});

export default Template;
