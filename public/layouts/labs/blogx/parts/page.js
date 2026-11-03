import { Page, div, p, demo, md } from "/app.js";
import { Blog } from "../Blog.js";
import { lead, when } from "../posts.js";

/* Container: the app region, whole viewport. Size: the paper is a columns row — a
   `small` post rail, then one 40em column per part, each opening to the RIGHT of the
   one before it. Own layout: core's column row. Regions: two. Preview: default card.

   THE ANSWER TO "A NARROW COLUMN WASTES MY 3440". It does — one of them does. Four of
   them do not: at 3440 this row is 252 + 4 x 720 = 3132px of live text, and not one
   column is over the 40em measure. The wide screen is filled with MORE COLUMNS, which
   is the only move core/Page/doc/columns.md found that does not trade a readable line
   for a full screen.

   ⚠ The parts are NESTED, not siblings: part two is a CHILD of part one. Siblings in
     a columns row REPLACE each other — that is the swap treatment, next door — so a
     chain is what makes them stack. It is also true: part two follows part one. */

const chain = (parts, i = 0) => {
	const part = parts[i];
	if (!part) return undefined;

	const next = chain(parts, i + 1);

	return new Page({
		title: part.title,
		label: (i + 1) + ". " + part.title,
		content(){
			md("*" + part.dek + "*");
			md(part.body);
		},
		children: next ? [next] : [],
	});
};

const post = new Page({
	title: lead.title,
	initialize(){ this.columns(); },

	content(){
		p.c("blogx-note", when(lead.date) + " · " + lead.read + " min · " + lead.parts.length + " parts");
	},

	children: [chain(lead.parts)],
});

const deepest = page => page.children.size ? deepest([...page.children.values()][0]) : page;

export default new Blog({
	meta: import.meta,
	title: "Parts as columns",
	description: "A four-part post read side by side — part two opens to the right of part one, and 3440 holds all four.",
	icon: "view_week",

	rail(){ return this.sections_rail(); },

	// ⚠ Opened at the DEEPEST part, not at the root. `show()` activates the whole
	//   chain, so every ancestor is a column too and the row arrives showing all four
	//   — which is the thing this candidate exists to show. Opened at the root it
	//   would arrive as one rail beside an empty row (measured at 80–93% grey,
	//   core/Page/doc/columns.md), and DemoApp.mark() strips any `.default` that is
	//   not in the shown page's own chain, so a mark could not have fixed it either.
	main(){
		return div.c("blogx-main blogx-stage", () => {
			demo.app(deepest(post)).ac("blogx-app");
		});
	},

	finding: "right when the parts are COMPARED - four 40em columns fill 3440 with nothing over the measure, you can see part one while reading part four, and below about 1600px the row starts scrolling sideways and the same layout becomes worse than the swap.",
});
