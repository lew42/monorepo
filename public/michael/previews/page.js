import { Page, md, div, a, code } from "/app.js";
import card, { wall } from "/framework/styles/gallery/gallery.js";
import index from "/framework/ui/page.js";
import { renders } from "/framework/ui/renders.js";

/* Three scales of the SAME components — the real gallery, the real
 * cells, three sets of numbers. A scale is exactly two things: the tokens the
 * wall reads, and the classes the render lays out under. Nothing else changes,
 * which is the point of the comparison.
 *
 *   --column     how wide a card is; the wall counts its own columns from it
 *   --thumb-min  the floor, so a one-line component isn't a sliver
 *   --thumb-max  the ceiling, which evens the rows and does the cropping
 *   stage        the zoom: a lower zoom lays the render out WIDER and paints it
 *                smaller, so it is the "how much of it do I see" knob, not size
 */
const SCALES = {
	small: {
		title: "Small",
		note: "13em cards, laid out at double width and painted back down. Six columns of icon — you read the shape, never the words.",
		tokens: { "--column": "13em", "--gap": "1em", "--thumb-min": "2.5em", "--thumb-max": "10em" },
		stage: "zoom-50 pad",
	},
	medium: {
		title: "Medium",
		note: "18em cards at three-quarter zoom. Labels inside a render become readable here, and this is the first scale where the table, the toolbar and the tiles are recognisable as themselves.",
		tokens: { "--column": "18em", "--gap": "1.25em", "--thumb-min": "3.5em", "--thumb-max": "15em" },
		stage: "zoom-75 pad",
	},
	large: {
		title: "Large",
		note: "24em cards at 1:1 — no zoom at all, so every cell is the component at the size you would actually ship it. Two columns on most screens, and the wall gets long.",
		tokens: { "--column": "24em", "--gap": "1.5em", "--thumb-min": "4em", "--thumb-max": "18em" },
		stage: "zoom-100 pad",
	},
};

// The three links, on every view — the whole point is clicking between them.
const switcher = here => div.c("flex gap wrap v-center", () => {
	Object.entries(SCALES).forEach(([name, s]) => {
		const $a = a.c("page-link").href("/michael/previews/" + name + "/").append(s.title);
		if (name === here) $a.ac("active");
	});
});

/* The wall, placed synchronously and refilled when the component pages land — the
 * labels and icons come from those pages, not from a list here, so this comparison
 * cannot disagree with the real gallery. Same shape as framework/ui/page.js. */
const scale_wall = s => wall($wall => {
	const cells = () => Object.keys(renders).forEach(name =>
		card(index.nav_for(name), renders[name], s.stage));

	cells();
	index.loading?.then(() => $wall.empty(cells));
}).style(s.tokens);

export default new Page({
	meta: import.meta,
	title: "Previews",
	description: "The same components at three gallery scales — small, medium, large.",
	icon: "photo_size_select_large",
	classes: "grid",

	/* Three urls, no directories — the shape styles/sections/ uses. A scale is
	   four numbers and a class string, so a folder each would have said the same
	   thing three times. */
	route(name){
		const s = SCALES[name];

		if (!s) return;

		return {
			title: s.title,
			classes: "grid",

			content(){
				switcher(name).ac("wide");
				scale_wall(s);
				md(s.note);

				// The whole difference between the three views, verbatim.
				code.js(`wall(cells).style({\n${Object.entries(s.tokens)
					.map(([k, v]) => `\t"${k}": "${v}",`).join("\n")}\n});\n\ncard(nav, render, "${s.stage}");`);
				a.c("page-link", "← All three").href("/michael/previews/");
			},
		};
	},

	content(){
		switcher().ac("wide");

		md("**The same components, three sizes of wall.** Click a scale above — nothing changes between them except four tokens and the zoom class, so what you are comparing really is the scale.");

		md("## What is the same in all three");

		md("A cell is **as tall as what it shows**, between `--thumb-min` and `--thumb-max`. No page declares a height: the two-line breadcrumb is a two-line card and the timeline is a timeline. Two pages on the whole wall declare anything — `timeline` asks for `tall` (double the ceiling) and `stats` asks for `wide` (a tile strip is one row of four), and both are visible in their own `page.js`.");

		md("Before this, every cell was `aspect-ratio: 16 / 10` and four pages had declared `card: \"tall\"` to buy a second row of the same wrong box — which is how alerts ended up two rows tall to show something 1.1 rows high.");

		md("## The numbers");

		md(`| | small | medium | large |\n| --- | --- | --- | --- |\n| \`--column\` | 13em | **18em** | 24em |\n| \`--thumb-min\` | 2.5em | **3.5em** | 4em |\n| \`--thumb-max\` | 10em | **15em** | 18em |\n| zoom | 50% | **75%** | 100% |\n| stage width at 1600px | ~32em | ~26em | ~24em |\n| columns at 1600px | 4 | **3** | 2 |\n\n**Medium is what [UI](/framework/ui/) ships.** Small is an index you scan; large is a page you read one card at a time, and at two columns the wall stops being a wall.`);

		md("Then: [UI](/framework/ui/), the real one.");
	},
});
