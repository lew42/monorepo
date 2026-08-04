import { Page, p, a, div } from "/app.js";
import { code, section } from "/ui.js";
import { measured, gated, per_call } from "/perf/ui.js";

/* Every :has() rule the site has loaded, with the grouping rule that owns it —
 * they live inside `@layer theme { … }`, so the owner is a CSSLayerBlockRule and
 * not the sheet. Recorded so the benchmark can delete them and put them back.
 */
function has_rules(){
	const found = [];

	/* Test the selector FIRST, then recurse. Since CSS nesting shipped, every
	 * CSSStyleRule has a (usually empty) `cssRules`, so a `if (rule.cssRules)
	 * return scan(rule)` treats every ordinary rule as a group and inspects
	 * nothing. That bug made this benchmark delete zero rules and report the
	 * noise between two identical configurations as the cost of :has().
	 */
	const scan = group => [...group.cssRules].forEach((rule, index) => {
		if (rule.selectorText?.includes(":has(")) found.push({ group, index, text: rule.cssText });
		if (rule.cssRules?.length) scan(rule);
	});

	for (const sheet of document.styleSheets)
		try { scan(sheet); } catch { /* a sheet we may not read */ }

	return found;
}

// deleting shifts every later index, so drop from the bottom up
const drop_has = rules => [...rules].reverse().forEach(rule => rule.group.deleteRule(rule.index));
const restore_has = rules => rules.forEach(rule => rule.group.insertRule(rule.text, rule.index));

// A realistic subtree: pages that are ancestors, every fourth one holding a leaf.
function stage_pages(root, n){
	const stage = document.createElement("div");
	stage.className = "pages";
	// off-screen but genuinely rendered — display:none lets the engine skip
	// exactly the work being measured
	stage.style.cssText = "position:absolute;top:-20000px;left:0;width:800px;";

	for (let i = 0; i < n; i++){
		const page = document.createElement("div");
		page.className = "page active-ancestor";
		page.innerHTML = "<h1 class='page-title'>x</h1><p>y</p><div class='row'><a href='/x/'>z</a></div>"
			+ (i % 4 === 3 ? "<div class='page active-page'><p>leaf</p></div>" : "");
		stage.appendChild(page);
	}

	root.appendChild(stage);
	return { stage, clean: () => root.removeChild(stage) };
}

export default new Page({
	meta: import.meta,
	title: ":has() recalc",

	content(){
		code(`
.page.active-ancestor:has(.page.active-page)            { display: block; }
.tab-panel:not(:has(> .page.active-page)) > .default     { display: block; }
.tab-bar:not(:has(.tab.active)) > .tab:first-child       { … }`, "every :has() this site ships");

		p("Three rules carry four of the site's layout decisions, and they replaced a `holds` class every author had to remember. `:has()` is the selector people are told to fear — so measure it.").ac("note");

		section("The rules actually loaded");

		measured(async () => {
			await this.app.ready;
			const rules = has_rules();
			return {
				head: [":has() rules found in document.styleSheets"],
				rows: rules.length ? rules.map(rule => [rule.text]) : [["none found"]],
			};
		}, "walking the CSSOM, including inside @layer blocks");

		section("Selector matching — the cost :has() is feared for");

		measured(async () => {
			await this.app.ready;
			const n = document.querySelectorAll(".page").length;

			return [
				[".page elements in the document", n],
				["µs — querySelectorAll('.page.active-ancestor')",
					per_call(9, 500, () => document.querySelectorAll(".page.active-ancestor")).med * 1000],
				["µs — the same, with :has(.page.active-page)",
					per_call(9, 500, () => document.querySelectorAll(".page.active-ancestor:has(.page.active-page)")).med * 1000],
			];
		}, "the same selector with and without the :has(), on the real document");

		section("Style recalc, A/B, with the rules actually deleted");

		gated(async () => {
			await this.app.ready;
			const root = this.app.$app.el;
			const rules = has_rules();
			const rows = [];

			for (const n of [0, 100, 400, 1600]){
				const { stage, clean } = stage_pages(root, n);
				const leaf = stage.querySelector(".page.active-page") ?? stage;

				/* Toggling `active-page` deep in the tree is exactly what
				 * Router.mark() does on every navigation, and it is the worst case
				 * for :has() — the engine must walk UP to re-test every ancestor
				 * whose rule asks about its descendants. Reading offsetHeight
				 * forces the recalc to finish before the clock is read. */
				const force = () => { leaf.classList.toggle("active-page"); return document.body.offsetHeight; };

				const on = per_call(5, 200, force);
				drop_has(rules);
				const off = per_call(5, 200, force);
				restore_has(rules);

				clean();
				rows.push([n, on.med * 1000, off.med * 1000, (on.med - off.med) * 1000]);
			}

			return { head: ["extra .page nodes", "with :has() µs", "without :has() µs", "cost of :has() µs"], rows };
		}, "toggle .active-page deep in the tree, with the :has() rules present and deleted");

		p("Gated: it builds 2100 elements and edits the site's stylesheet in place. Both are undone before the numbers render — the rules go back at their original indices, so the cascade is byte-identical afterwards.").ac("note");

		section("For scale");

		measured(() => [
			["one 60fps frame, ms", 16.7],
			["recalcs a navigation triggers", 1],
			[".page elements on the largest page in this site", 20],
		], "what the numbers above have to fit inside");

		p("The fear is not earned here. `:has()` is tested only against elements matching the compound to its left, and this site has tens of those, not thousands. No change needed — and unlike most “no change needed”, this one had a real alternative that was tried and deleted, so the measurement is what keeps it deleted.").ac("note");

		div.c("row", () => {
			a.c("page-link", "mark()'s sweeps →").href("/perf/mark/");
			a.c("page-link", "costs nobody looked at →").href("/perf/hidden/");
		});
	},
});
