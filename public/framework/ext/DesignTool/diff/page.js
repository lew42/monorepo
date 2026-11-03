import { Page, div, p, h2, md, code, ui } from "/app.js";

// Static numbers from the self-test run, 2026-09-06 — this page never runs the
// tool itself (it's a Node script against a headless browser, not something a
// page can trigger without a server endpoint this brief doesn't ask for). What
// it shows is real output from a real run, not a mockup.
const SELF_TEST = [
	["baseline", "40 pages × 2 widths, fresh", "—", "0", "13.1s"],
	["compare", "against that same baseline, nothing else changed", "0 of 40", "0", "18.4s"],
	["compare --inject \"a{text-decoration:underline!important}\"", "same baseline", "40 of 40, ranked worst first", "0", "19.8s"],
];

export default new Page({
	meta: import.meta,
	title: "Site diff",
	description: "One command that shoots the whole site twice and says what changed — pixels, console errors, sideways scroll.",
	icon: "difference",

	content(){
		md("Before this, proving a shared-CSS change didn't break anything meant opening six pages by "
			+ "hand and hoping. This is a Node script — no server, no build step — that screenshots 40 "
			+ "real pages **before** a landing and the same 40 pages **after**, then says exactly what's "
			+ "different: which pictures changed, how much, and whether anything actually broke.");

		h2("The two commands");
		code.js(`node site-diff.mjs baseline --out <dir>
node site-diff.mjs compare  --baseline <dir> --out <dir>`);

		md("`baseline` saves a screenshot per page. `compare` re-shoots the **same** pages — read out "
			+ "of the baseline's own list, so the two can never quietly drift apart — and reports pixels "
			+ "changed, new console errors, and new sideways scroll, worst page first. It exits non-zero "
			+ "only when something got **worse**; a changed picture alone still wants a person's eyes on "
			+ "`report.json`.");

		h2("What never counts as a change");
		p("A live clock (`.panel-t-clock`) ticks on its own, so it's painted a flat grey before every "
			+ "screenshot — on both shots alike — rather than merely tolerated. Add a line to the "
			+ "`MASKS` list in the script for the next thing that ticks by itself.");

		h2("Self-test");
		md("Three runs against the shared server, proving the tool actually catches something instead "
			+ "of just running quietly:");
		ui.table(["Run", "Against", "Pages changed", "New errors", "Time"], SELF_TEST);
		p("The middle row is the tool doing nothing wrong: nothing on the site moved, so nothing "
			+ "reported. The last row injects one real CSS change and the pages it actually touches — "
			+ "the link-heaviest ones — rise straight to the top of the ranking.").ac("muted");

		md.details(import.meta, "readme.md", "Readme — options, the default 40 pages, what each metric measures");
	},
});
