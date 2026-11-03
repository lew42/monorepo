import { Page, p } from "/app.js";

/**
 * SANDBOX — scratch pages that exist only so some other system has something real to practice
 * on (today: `quick-fix`, for the fixer's own end-to-end proof, Servex/doc/fixer.md). Nothing
 * here is meant to be browsed for its own sake.
 */
export default new Page({
	meta: import.meta,
	title: "Sandbox",
	icon: "science",
	description: "Scratch pages other systems use to practice on.",
	leaf: true,
	children: "quick-fix",

	content(){
		p("Scratch pages other systems practice on — not meant to be browsed for their own sake.");
	},
});
