import { Page, h1, p } from "/app.js";

/**
 * THE QUICK-FIX SANDBOX — a tiny, unrouted scratch page that exists for exactly one reason:
 * something real for the fixer (Servex/agents/Fixer.js) to practice on. Never add this to any
 * page's `children:` — it is not meant to be found by browsing, only addressed directly by a
 * quick-fix proof. A real quick fix normally edits a page that is already live; this page is
 * just a safe stand-in so a proof run never touches anything a real reader is looking at.
 */
export default new Page({
	meta: import.meta,
	title: "Quick-fix sandbox",
	icon: "science",
	description: "A scratch page for proving the quick-fix path actually works end to end.",
	leaf: true,

	content(){
		h1("Quick-fix sandbox");
		p("This heading exists so a quick-fix proof has something small and real to change.");
	},
});
