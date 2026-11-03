import { Page, md, div, a, code } from "/app.js";
import index from "/framework/ui/page.js";

/* Three scales of the SAME wall — /framework/ui/'s own `previews()`, drawn by the
 * same nineteen pages, three sets of numbers. A scale is four tokens and nothing
 * else, which is the point of the comparison.
 *
 *   --column     how wide a card is; the wall counts its own columns from it
 *   --gap        the space between them
 *   --thumb-min  the floor, so a one-line component isn't a sliver
 *   --thumb-max  the ceiling, which evens the rows and does the cropping
 */
const SCALES = {
	small: {
		title: "Small",
		note: "13em cards under a 10em ceiling — the most columns and the most cropping. You read the shape of a component here, never its words.",
		tokens: { "--column": "13em", "--gap": "1em", "--thumb-min": "2.5em", "--thumb-max": "10em" },
	},
	medium: {
		title: "Medium",
		note: "18em cards, 15em ceiling. Labels inside a render become readable here, and this is the first scale where the table, the toolbar and the tiles are recognisable as themselves.",
		tokens: { "--column": "18em", "--gap": "1.25em", "--thumb-min": "3.5em", "--thumb-max": "15em" },
	},
	large: {
		title: "Large",
		note: "24em cards, 18em ceiling — whole renders, almost nothing cropped. Two columns on most screens, and the wall gets long.",
		tokens: { "--column": "24em", "--gap": "1.5em", "--thumb-min": "4em", "--thumb-max": "18em" },
	},
};

// The three links, on every view — the whole point is clicking between them.
const switcher = here => div.c("flex gap wrap v-center", () => {
	Object.entries(SCALES).forEach(([name, s]) => {
		const $a = a.c("page-link").href("/michael/previews/" + name + "/").append(s.title);
		if (name === here) $a.ac("active");
	});
});

/* The wall is the real one — `index.previews()`, so this comparison cannot
 * disagree with /framework/ui/. Placed synchronously and redrawn when that page's
 * children land, because they are still importing while this one renders. */
const scale_wall = s => div.c("wide", $box => {
	const wall = () => index.previews().style(s.tokens);

	wall();
	index.loading?.then(() => $box.empty(wall));
});

export default new Page({
	meta: import.meta,
	title: "Previews",
	description: "The same components at three wall scales — small, medium, large.",
	icon: "photo_size_select_large",
	classes: "standard",

	/* ⚠ Named `previews`, so render() stamps `page-previews` — the card-wall class
	   Page.css styles, whose gap/align/dense would otherwise land on this page. */
	activated(){ this.view.rc("page-previews"); },

	/* Three urls, no directories. A scale is four numbers, so a folder each would
	   have said the same thing three times. */
	route(name){
		const s = SCALES[name];

		if (!s) return;

		return {
			title: s.title,
			classes: "standard",

			content(){
				switcher(name).ac("wide");
				scale_wall(s);
				md(s.note);

				// The whole difference between the three views, verbatim.
				code.js(`index.previews().style({\n${Object.entries(s.tokens)
					.map(([k, v]) => `\t"${k}": "${v}",`).join("\n")}\n});`);
				a.c("page-link", "← All three").href("/michael/previews/");
			},
		};
	},

	content(){
		switcher().ac("wide");

		md("**The same components, three sizes of wall.** Click a scale above — nothing changes between them except four tokens, so what you are comparing really is the scale.");

		md("## What is the same in all three");

		md("A cell is **as tall as what it shows**, between `--thumb-min` and `--thumb-max`. No page declares a height: the two-line breadcrumb is a two-line card and the timeline is a timeline. Two pages on the whole wall declare anything — `timeline` asks for `tall` (double the ceiling) and `stats` asks for `wide` (a tile strip is one row of four), and both are visible in their own `page.js`.");

		md("Before this, every cell was `aspect-ratio: 16 / 10` and four pages had declared `card: \"tall\"` to buy a second row of the same wrong box — which is how alerts ended up two rows tall to show something 1.1 rows high.");

		md("The zoom is **not** a knob here: each component page hard-codes `zoom-75` inside its own `preview()`, so the render is the page's and only the box around it changes.");

		md("## The numbers");

		md(`| | small | medium | large |\n| --- | --- | --- | --- |\n| \`--column\` | 13em | **18em** | 24em |\n| \`--gap\` | 1em | **1.25em** | 1.5em |\n| \`--thumb-min\` | 2.5em | **3.5em** | 4em |\n| \`--thumb-max\` | 10em | **15em** | 18em |\n| columns at 1600px | 4 | **3** | 2 |\n\n**Medium is what [UI](/framework/ui/) ships.** Small is an index you scan; large is a page you read one card at a time, and at two columns the wall stops being a wall.`);

		md("Then: [UI](/framework/ui/), the real one.");
	},
});
