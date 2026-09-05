import { md } from "/app.js";
import { Paging, STYLES } from "../paging.js";

/* Container: a column in /imagine/'s row. Size: `large`. Own layout: prose then
   the stage (toolbar, sample, five rows). Regions: one. Preview: core's card.

   The chips restyle THIS page; the rows open the same five surfaces at urls of
   their own, so a look you like is a link you can send. */

export default new Paging({
	meta: import.meta,
	title: "Styles",
	description: "Five surfaces a page can wear — plain, card, tint, prim, dark — switched live or opened at a url.",
	icon: "palette",
	width: "large",
	axes: "style content mech",

	takeaway: "**A style is what the page's own surface looks like, and it is one word.** There are five, they are all built from the theme's tokens, and any of them can be opened by any of the four mechanisms — the two choices are independent.",
	children: STYLES.join(" "),

	content(){
		this.lede();

		md("**Five surfaces, one class each, all of them tokens.** `plain` is the ambient floor with no frame · `card` is white and padded with a drop shadow, and the nav rows inside it go light grey so they still read · `tint` is one subtle step off the parent · `prim` is a prim-tinted surface · `dark` is a **colour-scheme island**, which is one declaration and not a second palette: every `light-dark()` token below it flips, including the fill the rows are painted with.");

		md("Each row below opens that surface at its own url. Switch the **mechanism** chip first and the same five rows launch beside this page, expand under it, swap into it, or take the row — a style and a mechanism are independent choices, which is why there are two axes and not one. [Code](/imagine/paging/styles/code/).");

		this.paging();
	},
});
