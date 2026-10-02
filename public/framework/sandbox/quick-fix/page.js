import { Page, h1, p } from "/app.js";

/**
 * THE QUICK-FIX SANDBOX — a tiny scratch page that exists for exactly one reason: something
 * real for the fixer (Servex/agents/Fixer.js) to practice on, so a proof run never touches a
 * page a real reader is looking at. Routed (under `sandbox/`, Page requires an unbroken
 * `children:` chain to resolve a url at all) but not meant to be found by browsing — nothing
 * links here on purpose.
 */
export default new Page({
	meta: import.meta,
	title: "Quick-fix sandbox",
	icon: "science",
	description: "A scratch page for proving the quick-fix path actually works end to end.",
	leaf: true,

	content(){
		h1("Quick-fix sandbox").style("font-weight", "bold");
		p("This heading exists so a quick-fix proof has something small and real to change.");
	},
});
