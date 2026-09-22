import { div } from "/app.js";
import { Blog } from "../Blog.js";
import { lead, rest } from "../posts.js";

/* Container: the app region, whole viewport. Size: a 15em nav rail, an 18em topics
   rail, and everything between split hero | wall above 60em of PAPER. Own layout:
   the one blogx grid outside, a two-track grid inside. Regions: four. Preview: the
   default card, with the verdict as its description.

   THE MAGAZINE ANSWER TO 3440: four vertical bands, and the widest of them is a wall
   whose cells are 19em — so the extra 1500px a wide monitor brings buys MORE POSTS,
   not a wider paragraph. Nothing here is over 42em. */

export default new Blog({
	meta: import.meta,
	title: "Magazine front",
	description: "Hero + wall + two rails. The extra width of a wide monitor buys more posts, never a wider one.",
	icon: "newspaper",

	rail(){ return this.sections_rail(); },
	aside(){ return this.topics_rail(); },

	content(){
		div.c("blogx-front", () => {
			this.hero(lead);
			this.wall(rest);
		});
	},

	finding: "the strongest overview above the fold - at 3440 the first screen is the lead plus seven linked posts, every topic and every series, with nothing scrolled and no measure over 42em.",
});
