import { Page, p } from "/app.js";

/* A real page.js that has no url.
 *
 * Nothing declares "ghost" in /start/second/, so `child("ghost")` returns
 * undefined and the Router 404s — even though this file is right here and the
 * page above fetched it to show you.
 *
 * Add the word `ghost` to a `children:` string in ../page.js and this becomes
 * a url. That is the entire difference, and it is the point of step 2.
 */
export default new Page({
	meta: import.meta,
	title: "Ghost",

	content(){
		p("If you are reading this rendered, somebody declared me.");
	}
});
