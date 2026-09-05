import { View, div, h3, span, a, code, icon, md, ui } from "/app.js";
import { Paging } from "../paging.js";

View.stylesheet(import.meta, "templates.css");

/* ── A TEMPLATE IS A WHOLE PAGE SHAPE YOU CAN START FROM ───────────────────────
   Everything in this realm so far has been about ONE box: what a click does to it,
   and what surface it wears. A TEMPLATE is the next rung up — the shape of a whole
   page, already built and already in use somewhere on this site.

   `Template` is a `Paging` with two additions and nothing else:

     THE EXAMPLE  the box no longer holds the teaching sample; it holds the FAMILY's
                  own machinery, drawn by the family's own classes, imported from
                  where they live. `families.js` is that list. Nothing is copied: a
                  magazine cover here is `mag/page.js`'s own `column()`, a blog wall
                  is `Post.wall()`, a shell is `Shell.rail()` + `Shell.main()`.

     A TYPE AXIS  a sixth chip group — `compact` `regular` `display` — beside the
                  five surface chips core already gives every page here. One class on
                  the same box the surface class lands on, so colour and typography
                  are two independent words over ONE example. That is the whole of
                  "lean into theming": the reader repaints the same real thing.

   ⚠ `paging.js` is a FENCE (it belongs to another task). The type axis is added by
     subclassing — a toolbar group and a `dress()` stamp — rather than by widening
     the vocabulary in `words.js`. If the axis survives, moving it down into `words.js`
     is four lines and deletes this class's `Toolbar`. doc/templates.md.               */

export const TYPE = ["compact", "regular", "display"];

const TYPE_MEANS = {
	compact: "0.9× the base step and tighter leading — a dense index, a rail, a table",
	regular: "the site's own step — every page you have read so far",
	display: "1.15× the base step with a steeper heading ramp — a cover, a slide, a hero",
};

export class Template extends Paging {

	// ── the type axis ─────────────────────────────────────────────────────────
	// `opening()` is core's own seam for "where this page starts"; adding a key to
	// it is the whole of adding an axis, because `modes()`, `at()` and `pick()` are
	// all written against whatever keys `opening()` returns.
	opening(){ return { ...super.opening(), type: "regular" }; }

	axis_word(axis){ return axis === "type" ? "typography" : super.axis_word(axis); }

	/* One class, on the SAME box the surface class lands on (the column body), so a
	   surface and a type scale compose without either knowing about the other.
	   ⚠ Removed before added, like `Paging.dress()` does for the styles: `repaint()`
	     re-runs this and a stale class would stack. */
	dress(){
		const $box = super.dress();

		$box?.rc(...TYPE.map(word => "templates-type-" + word))
			.ac("templates-type-" + this.at("type"));

		return $box;
	}

	note_axis(axis, was, value){
		if (axis !== "type")
			return super.note_axis(axis, was, value);

		return "`" + value + "` is " + TYPE_MEANS[value] + ". Not one word of the example changed — only the type scale it is set in.";
	}

	// ── the box holds the FAMILY, not the sample ──────────────────────────────
	// `Paging.shown()` calls `sample()`; this is the one line that makes the stage
	// show a real template instead of the teaching ladder.
	sample(){ return this.family.example(this, true); }

	// ── the page ──────────────────────────────────────────────────────────────
	// The same five blocks for every family, so eleven pages are one page read
	// eleven times: what it is for, the live example under the chips, the one line
	// Make would need, what draws it, and the family itself.
	content(){
		this.lede();
		this.paging();
		this.made();
		this.machinery();
		this.members();
	}

	/* THE ONE-LINE SPEC. `Make` builds a real page from one line of text
	   (`Title: style content mechanism`); this is the line this family would need.
	   Some of these words do not exist yet — `family.gap` says which, and
	   doc/templates.md is the proposal for the persistence/Make work. */
	made(){
		h3("Make a page from this");

		md(this.family.make);

		code.js(this.family.spec);

		md(this.family.gap
			? "**" + this.family.gap + "** The exact words Make would need are written up as a proposal: [doc/templates.md](/imagine/paging/doc/templates.md)."
			: "Every word on that line is already in Make's vocabulary — [type it in](/imagine/paging/make/).");
	}

	// WHICH CLASS DRAWS THE EXAMPLE, AND WHERE IT LIVES. The claim this whole realm
	// makes is that nothing here is a mock-up, so every row is a link you can open
	// and read the source of.
	machinery(){
		h3("What draws it");

		md("Nothing above is a picture or a copy. Each row is the real module, imported read-only from where it lives — open one and you are reading the code that just ran.");

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

/* THE TYPE CHIPS. `Paging.Toolbar` reads its values off a table private to
   `paging.js`, so a new axis needs one override — this one — and inherits the
   press/keyboard/`aria-pressed` half unchanged. */
Template.Toolbar = class TemplateToolbar extends Paging.Toolbar {

	group(axis){
		if (axis !== "type") return super.group(axis);

		div.c("paging-group", () => {
			span.c("paging-axis", "typography");
			TYPE.forEach(value => this.chip(axis, value));
		});
	}
};

/* A FAMILY CARD — the hub's unit, and the only place the iconic example is drawn
   small. Title, the one sentence, the live example, the way in. */
export const card = family => div.c("templates-card", () => {
	h3.c("templates-card-head", () => {
		icon(family.icon).ac("templates-card-icon");
		span(family.title);
	});

	div.c("templates-stage", () => { family.example(null, false); });

	md(family.card_line).ac("templates-card-say");

	a.c("page-link templates-card-more", family.title + " as a page template →").href("/imagine/paging/templates/" + family.name + "/");
});

export default Template;
