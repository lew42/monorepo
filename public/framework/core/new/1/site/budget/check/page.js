import { Page, p, a, div } from "/app.js";
import { source } from "/framework/util/source/source.js";
import { code, section } from "/ui.js";
import { gated, measured } from "/perf/ui.js";
import { BUDGET, check, grade } from "/budget/budget.js";

/* One route per section, chosen as the DEEPEST realistic url each seat built —
 * a section's index page is its cheapest page and would flatter it. Hand-listed
 * for the same reason the sidebar is: nothing crawls the filesystem at runtime.
 */
const ROUTES = [
	"/",
	"/replace/child/", "/columns/child/grandchild/", "/tabs/api/", "/dynamic/42/", "/full/left/deeper/",
	"/nav/children/lazy/", "/compound/tabs-in-a-column/what/deeper/", "/compose/slots/fixed/",
	"/deep/nesting/a/b/c/d/e/", "/deep/scale/", "/library/", "/chrome/topbar/",
	"/patterns/docs/guide/concepts/fan-out/", "/motion/head-start/slow/", "/a11y/tabs/",
	"/async/trap/", "/urls/schema/inverse/", "/content/blog/", "/forms/wizard/", "/versus/verdict/",
	"/council/versus/", "/start/tree/deep/", "/state/stores/", "/kit/", "/mutation/undo/",
	"/sitemap/rule-one/", "/perf/walk/a/b/c/d/e/", "/perf/hidden/", "/budget/", "/budget/ladder/",
];

export default new Page({
	meta: import.meta,
	title: "The checker",

	content(){
		code(source(check), "budget.js — check(route), read off the live function");

		p("An iframe is a real document: its own module registry, its own resource timing, its own app. That is what lets a page which is already loaded measure a genuinely COLD load of something else — no server, no CI, no build step.").ac("note");

		section("Run it");

		gated(async () => {
			const rows = [];

			// sequential on purpose: two iframes booting at once would measure
			// contention between them rather than either route
			for (const route of ROUTES){
				const row = await check(route, 1200);
				const { pass, broke, waived } = grade(row);
				rows.push([
					route,
					row.failed ? "—" : `${row.distinct}/${row.depth + 2}`,
					row.duplicates ?? "—",
					row.requests ?? "—",
					row.nodes ?? "—",
					row.anchors ?? "—",
					row.boot === undefined ? "—" : Math.round(row.boot),
					(pass ? "PASS" : "FAIL " + broke.join(" ")) + (waived.length ? ` (${waived.join(" ")} waived)` : ""),
				]);
			}

			const failed = rows.filter(row => String(row[7]).startsWith("FAIL")).length;
			rows.push(["", "", "", "", "", "", "", `${rows.length - failed}/${rows.length} pass`]);

			return { head: ["route", "modules/max", "dup", "js req", "nodes", "a", "boot ms", "verdict"], rows };
		}, `load all ${ROUTES.length} routes cold, in sequence, and grade each one`);

		p("Gated, and it is the most expensive thing on this site: it boots the whole app once per route. That is the point — it is a pre-flight check, not a page decoration. Expect it to take a while.").ac("note");

		section("What a failure means");

		code(`
modules   you imported a sibling. Find the eager import; make it a name.
dup       something fetched a file the module map already had — almost always
          a page showing its own source. See /budget/source/.
kB        a second heavy ext got pulled in. Check whether the section needs it.
nodes     usually route() with nothing evicting. See /perf/memo/.
a         a link-dense page; mark_links() is linear. Rarely a real problem.
boot      something is awaited that should not be, or the walk got deeper.
overflow  a <pre> or a table without a scroll container.`, "each ceiling, and what breaks it");

		section("The budget it grades against");

		measured(() => ({
			head: ["dimension", "limit for a 3-deep route"],
			rows: BUDGET.map(rule => [rule.label, rule.limit({ depth: 3 })]),
		}), "read straight off BUDGET — the table and the checker cannot disagree");

		p("The limits are read from the same array the grader uses, so this page cannot drift from what it enforces. Changing a ceiling is one edit in `budget.js` and both move together.").ac("note");

		div.c("row", () => {
			a.c("page-link", "← the budget").href("/budget/");
			a.c("page-link", "the depth ladder →").href("/budget/ladder/");
		});
	},
});
