import { div } from "/app.js";
import { region, statement, wall, list, stage, notes } from "./deck.js";

/* THE FOUR SLIDES BOTH DECKS SHOW.

   `persist/` and `swap/` are a controlled experiment: the same content, the same url
   shape, one difference — where the navigation lives. So the content is written ONCE,
   here, and each deck imports it. If the two decks drifted by a word the comparison
   would quietly be about the content instead.

   One slide per content kind, because the kinds are also what the verdict is about:
   which of them wants a rail that stays, and which wants the whole screen. */

export const KINDS = [
	{
		name: "statement",
		title: "Statement",
		blurb: "Display type. Wants the whole screen.",
		build(){
			region(100, () => statement("One kind of slide", "Say one thing",
				"A display statement is sized as a fraction of the block it composes into, so it is the same weight on a phone band and on a 3440 poster. It is the kind that most wants the whole screen — every pixel a rail keeps is a pixel this was going to use."));
		},
	},
	{
		name: "wall",
		title: "Wall",
		blurb: "Cards. Answers a wider region with more columns.",
		build(){
			region(100, () => wall([
				{ k: "one", name: "No build", note: "public/ runs as it is written. Imports are real .js urls." },
				{ k: "two", name: "No server", note: "Production is static files. Server/ is a dev convenience." },
				{ k: "three", name: "No dependencies", note: "npx and global tools, nothing installed into the site." },
				{ k: "four", name: "Pages are urls", note: "A page exists once its parent names it in children." },
				{ k: "five", name: "One row", note: "Every page under a columns host is a column in one row." },
				{ k: "six", name: "One accent", note: "A palette of tokens, one --prim, and a tone step for depth." },
			]));
		},
	},
	{
		name: "list",
		title: "List",
		blurb: "Rows. Caps itself; a share is wasted on it.",
		build(){
			region(100, () => {
				list([
					{ name: "small", note: "A fixed 14em track — rails, pickers, an index." },
					{ name: "hug", note: "As wide as its own rows, 6 to 24em." },
					{ name: "large", note: "28 to 64em — a grid, a table, wide content." },
					{ name: "fill", note: "Everything left over. The one page with something to spend it on." },
					{ name: "full", note: "The whole host. Every ancestor folds into the crumb strip." },
				]);

				notes(null, [
					"A list is the kind that **does not scale**, which is why it caps itself here at 26em however much region it is handed.",
				]);
			});
		},
	},
	{
		name: "stage",
		title: "Stage",
		blurb: "A figure. Takes whatever it is given.",
		build(){
			region(100, () => stage("An aspect box has no wrong width — the one kind you can put in any region of any cut.",
				() => div.c("decks-bars", () => [45, 72, 30, 88, 55, 66, 40, 80, 25, 60].forEach(h =>
					div.c("decks-bar").style("height", h + "%")))));
		},
	},
];

/* Both decks number their slides off ONE list, so a slide added here appears in both,
   in the same place, with the same neighbours. */
export const chapters = base => KINDS.map((kind, i) => ({
	...kind,
	to: base + kind.name + "/",
	prev: i ? base + KINDS[i - 1].name + "/" : null,
	next: KINDS[i + 1] ? base + KINDS[i + 1].name + "/" : null,
	label: (i + 1) + ". " + kind.title,
}));
