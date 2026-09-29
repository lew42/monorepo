/* The layout decision questions: ONE copy, read by the page (/layouts/decide/) and written out
   as questions.md for Server/ask-each.mjs. The same list, in prose, sits in the `layout` skill
   under "Choosing a layout". Change one, change all three.

   Each question is a judgement, worded with examples, never a do/don't rule: the owner
   (2026-09-28, 11:15 PM) warned that a rule gets followed too literally. The answers are the
   usual ones, not a closed set. */
export const QUESTIONS = [
	{
		id: "room",
		icon: "aspect_ratio",
		ask: "How much room is there?",
		why: "Work it out top down. The site's nav, a rail or a table of contents are already known before this page draws, so what is left is known too. A phone always gets one column; that is the floor, not the design.",
		answers: ["A phone: one column, always", "One reading column, about 40em", "A wide main beside a sidebar", "Most of a 3440 screen"],
		example: "[/framework/servex/](/framework/servex/) sits beside the site nav, so at 3440 it has roughly 3000px to spend.",
	},
	{
		id: "amount",
		icon: "inventory_2",
		ask: "How much content is there?",
		why: "Match the layout to the amount. A little content wants a small, tight box; a lot of content wants structure a reader can steer by, and not one endless column.",
		answers: ["A little: a preview card, a few lines", "About one screen", "A lot: many sections, wants tabs or a left nav"],
		example: "[A module's preview](/layouts/decide/amount/) on its parent is a little; its full class doc, with methods and demos, is a lot.",
	},
	{
		id: "outline",
		icon: "format_list_numbered",
		ask: "Is it outlined yet?",
		why: "A layout chosen before you know what the page says is a guess. Write the outline first: the sections in order, which demos, which tabs. Then the layout usually picks itself.",
		answers: ["Yes: sections, order and demos are written down", "No: write the outline now, then come back"],
		example: "For a class doc page, the outline says whether it needs Overview, Methods and Demos tabs before any column is drawn.",
	},
	{
		id: "fill",
		icon: "view_column",
		ask: "How will the content fill the width?",
		why: "On a wide screen the answer is nearly always to fill it, so the question is how. Columns side by side work best when their content is roughly equal in height. When one column is naturally short, like a title, centring it vertically lets it carry weight instead of leaving a hole.",
		answers: ["Columns side by side, equal in height", "A short title column, centred, beside the rest", "A wall of cards", "A nav column beside a centred main", "Tabs or a left nav for a lot", "One small box, and the space left on purpose"],
		example: "The demos below: [equal columns](/layouts/decide/equal/), [one short column](/layouts/decide/short/), and [the fix](/layouts/decide/centred/).",
	},
	{
		id: "which",
		icon: "verified",
		ask: "Which approved layout fits?",
		why: "Start from a layout the owner has already approved; it has been proven at 400 and at 3440. If none fits, build the new one as a proposal and say it is new. Each layout the owner approves makes the next choice more certain.",
		answers: ["Standard: one column", "Split: two columns, any proportion", "Columns: three or more", "Tile wall", "Rail + content", "Docs three-region", "None fits: a proposal"],
		example: "[The approved set, with pictures](/layouts/doc/studies/approved/).",
	},
];
