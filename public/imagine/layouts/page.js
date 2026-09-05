import { Page, View, div, span, a, p, pre, h2, md, icon } from "/app.js";
import { apply, spell, THREE, STACK_RULES, DIVISIONS, NUMBERS, of_number, name_of } from "./system.js";
import { press } from "./LayoutsCard.js";

View.stylesheet(import.meta, "layouts.css");

/* ── /imagine/layouts/ — the numbered layout system ────────────────────────────
   Container: a column in `/imagine/`'s columns host, so there is no page grid here
   — content sits in `.page-column-prose` and only `bleed` reaches the edge. Size:
   `large` (28–64em), because this page is prose plus one demo and its children are
   the wide ones. Own layout: the column's plain flow. Regions: one. Preview: the
   default card.

   WHAT THIS PAGE IS FOR. One idea, then a numbered index of everywhere it goes. The
   idea is that there are exactly two ways to arrange anything — let it stack, or
   divide an area — and every layout on this site is one of them or both.           */

/* ── THE OPENING DEMO — a stack and a split, side by side, holding the same three
   boxes. The toggle marks one side and swaps the explanation under the pair; both
   frames stay live the whole time, because the comparison IS the lesson.

   ⚠ Named `LayoutsIdea`, not `LayoutsPair`: `View.classify()` stamps one class per
     constructor in the chain, so a view called `LayoutsPair` wears `.layouts-pair` —
     the two-track flex row it BUILDS — and its toggle, its pair and its explanation
     each became a 50% track of it. Nothing threw; the demo simply laid out sideways
     (measured 2026-09-05, 1280). A part's class name is a CSS class. */
class LayoutsIdea extends View {

	side(){ return this.chosen ??= "stack"; }

	division(){ return this.divided ??= DIVISIONS[3]; }   // fr tracks, the one to reach for

	choose(word){ this.chosen = word; return this.redraw(); }

	divide(id){ this.divided = DIVISIONS.find(kind => kind.id === id); return this.redraw(); }

	redraw(){ return this.empty(() => this.render()); }

	render(){
		div.c("layouts-group", () => {
			span.c("layouts-axis", "which one am I looking at");
			["stack", "split"].forEach(word => {
				const on = this.side() === word;
				press(span.c("layouts-chip", word).ac(on && "on")
					.attr("aria-pressed", String(on))
					.attr("data-axis", "side").attr("data-value", word), () => this.choose(word));
			});
		});

		div.c("layouts-pair", () => {
			this.stack();
			this.split();
		});

		this.answer();
	}

	stack(){
		div.c("layouts-side").ac(this.side() === "stack" && "on").attr("data-side", "stack").append(() => {
			div.c("layouts-side-head", () => {
				span.c("layouts-side-title", "Stack");
				span.c("layouts-side-sub", "what a div already does");
			});

			this.frame(STACK_RULES, { margin: true });
		});
	}

	split(){
		const kind = this.division();

		div.c("layouts-side").ac(this.side() === "split" && "on").attr("data-side", "split").append(() => {
			div.c("layouts-side-head", () => {
				span.c("layouts-side-title", "Split");
				span.c("layouts-side-sub", kind.title);
			});

			this.frame(kind.rules, { weights: kind.weights });

			div.c("layouts-group", () => {
				span.c("layouts-axis", "how it divides");
				DIVISIONS.forEach(one => {
					const on = kind.id === one.id;
					press(span.c("layouts-chip", one.id).ac(on && "on")
						.attr("aria-pressed", String(on))
						.attr("data-axis", "division").attr("data-value", one.id), () => this.divide(one.id));
				});
			});
		});
	}

	// The same three boxes, both sides, every time — one frame builder, so the only
	// difference a reader can see is the arrangement.
	frame(rules, opts = {}){
		return div.c("layouts-frame layouts-tint", () => {
			apply(div.c("layouts-layout"), rules).append(() => THREE.forEach((box, i) => {
				const $box = div.c("layouts-box");

				if (opts.weights) $box.el.style.setProperty("flex", opts.weights[i]);
				if (opts.margin && i < THREE.length - 1) $box.el.style.setProperty("margin-bottom", "var(--gap, var(--gap-default))");

				$box.append(() => {
					span.c("layouts-box-label", box.label);
					span.c("layouts-box-note", box.note);
				});
			}));
		});
	}

	// What the chosen side actually means, with the CSS that makes it — so the
	// toggle changes something a reader can read, not just a border colour.
	answer(){
		const stack = this.side() === "stack";
		const kind = this.division();

		div.c("layouts-read", () => {
			div.c("layouts-read-head", stack ? "a stack, in full" : "a split, in full");

			p(stack
				? "Nothing is divided. Each box takes the whole width it was given and is as tall as its own content, so the container ends up as tall as everything in it added together. You write no CSS at all to get this — it is what a div does on its own."
				: kind.note);

			pre.c("layouts-code", stack ? spell(STACK_RULES) : spell(kind.rules)
				+ (kind.weights ? "\n\n/* on the children */\nflex: " + kind.weights.join(";\nflex: ") + ";" : ""));
		});
	}
}

export default new Page({
	meta: import.meta,
	title: "Layouts",
	description: "The numbered layout system: stacks, splits, and every distribution.",
	icon: "view_column",
	width: "large",

	// The wall of numbers below IS the list of children, so core leaves its rows out
	// (core/Page/doc/columns.md, `index`).
	index: true,

	children: ["1", "2", "3", "4"],

	content(){
		md("**A layout is how a page divides its room.** Every arrangement on this site — a docs page, a dashboard, a phone shell, this page — is built from exactly two moves, and this realm is the index of everywhere they go.");

		h2("The one idea: stacks and splits");

		md("**A STACK is what a `div` does on its own.** Put three boxes in a container and they follow each other down the page; each one is as wide as the container and as tall as its own content. You write nothing.\n\n" +
			"**A SPLIT divides a fixed or specified area into pieces.** You say how big the area is — or accept the one you were given — and then say how it is cut up: by percent, by fixed sizes, by `flex-grow` and `flex-basis`, or by `fr` tracks. The pieces are as tall as the area, not as tall as their content.\n\n" +
			"Here are the two, live, holding the same three boxes. Press a chip to read what the side you are looking at actually is, and change how the split divides.");

		new LayoutsIdea();

		md("That is the whole distinction, and it is worth being blunt about the consequence: **a stack's height comes from its content and a split's pieces come from its area.** Everything below is a split, except where it says otherwise.");

		h2("The numbering");

		md("**The number is how many columns the layout has at its widest; the word after the dot is how the room is divided.** So `1.*` is one column, `2.*` two, `3.*` three, `4.*` four or more — and `2.golden` is the two-column layout whose tracks are 61.8 / 38.2. The url is the same two parts: [/imagine/layouts/2/golden/](/imagine/layouts/2/golden/).");

		h2("The catalogue");

		md("Every entry is drawn with the same three-column card: a title and the chips on the left, the layout itself live in the middle, and its CSS, its measured track widths and its config line on the right. Four chips per card — **padding**, **surface**, **navigation** and the **viewport width** — so the permutations are something you press, not eighteen more pages.");

		div.c("layouts-numbers", () => NUMBERS.forEach(number => {
			a.c("layouts-number").href("/imagine/layouts/" + number.n + "/").append(() => {
				span.c("layouts-number-n", number.n + ".*");
				span.c("layouts-number-name", number.title);
				span.c("layouts-number-list", of_number(number.n).map(name_of).join(" · "));
			});
		}));

		h2("How this relates to the approved five");

		md("It is **the gate's catalogue, not a sixth layout.** [The approved set](/imagine/design/layout/approved/) is five whole-page shapes a page picks by name — rail + content, the docs three-region, a columns row, a tile wall, and solo. This realm is one level down: it names the ways an *area* is divided, which is what those five are built out of. Nothing here asks for a sixth approved layout, and every entry says which existing word it compiles to.\n\n" +
			"The same goes for [`styles/layouts/`](/framework/styles/layouts/), where the real arrangements live as class strings, and [`styles/layouts/cols/`](/framework/styles/layouts/cols/), which owns the two- and three-column distribution words. **This system organises them; it does not replace them.**");

		md("More: [the readme](/imagine/layouts/readme.md) · [why it is numbered, and why chips instead of pages](/imagine/layouts/doc/decisions.md) · the vocabulary this borrows from [/imagine/paging/](/imagine/paging/).");
	},
});
