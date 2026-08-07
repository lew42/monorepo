import { Page, p, a, div } from "/app.js";
import { code, section } from "/ui.js";
import { gated } from "/perf/ui.js";              // also loads perf.css
import { BUDGET, check, grade } from "/budget/budget.js";

export default new Page({
	meta: import.meta,
	title: "Budget",
	children: "check ladder source",

	content(){
		code(BUDGET.map(rule =>
			`${rule.label.padEnd(30)} ${String(rule.limit({ depth: 3 })).padStart(6)}`).join("\n"),
			"the whole budget — one route, cold (limits shown for a 3-deep url)");

		p("`/perf/` measured what things cost. Nothing said what they are ALLOWED to cost. These are the ceilings, each one derived from a measurement and each one loose enough that a good page passes without thinking about it.").ac("note");

		section("This page, against the budget");

		// GATED, not measured: this boots a whole second app in an iframe, and
		// /budget/ is an ancestor of every page in this section — on load it would
		// tax every reader of every child page. Caught by the smoke test, which is
		// the second time I have made exactly this mistake.
		gated(async () => {
			await this.app.ready;
			const row = await check(this.url, 1200);
			const { pass, broke } = grade(row);

			return {
				head: ["dimension", "measured", "limit", ""],
				rows: BUDGET.map(rule => [
					rule.label,
					row[rule.key] ?? "—",
					rule.limit(row),
					broke.includes(rule.key) ? "OVER" : "ok",
				]).concat([["VERDICT", pass ? "PASS" : "FAIL", "", broke.join(" ") || "—"]]),
			};
		}, "this route, loaded cold in an iframe and graded");

		section("The whole site, graded");

		code(`
31 routes, one per section, each loaded cold in an iframe

PASS  24  (1 waived)        FAIL  7

FAIL duplicates  /nav/children/lazy/          3 page.js fetched twice
                 /compound/tabs-in-a-column/… 3
                 /compose/slots/fixed/        2
                 /start/tree/deep/            3
                 /forms/wizard/               2
                 /mutation/undo/              2
                 /content/blog/               1
                 all seven: source(import.meta) re-fetching a file the
                 module map already holds. One cause, seven sections.

WAIVED boot      /motion/head-start/slow/     746 ms — a deliberate 700 ms
                 top-level await. The page IS the demonstration.

ALSO SEEN, not a budget line: /sitemap/rule-one/ issues two real 404s
(/docs/v1.2 and /x/y.json) on purpose, to show the trailing-slash rule.
Deliberate, and it means "no console errors site-wide" is no longer true.`,
			"published run — press Run at /budget/check/ to reproduce it");

		p("One cause accounts for every real failure, which is the most useful shape a first run can have. `/budget/source/` prices it and proposes the fix: keep the mechanism, make it lazy.").ac("note");

		section("Tight ceilings and guards — not the same thing");

		code(`
TIGHT — routes sit AT these today, so they will catch a regression
  page.js modules      /nav/children/lazy/ and /tabs/api/ are exactly at limit
  duplicates           7 sections fail it right now
  horizontal overflow  objective, and every seat has agreed to it

GUARD — nothing is near these; they exist for a failure mode already measured
  DOM nodes            94–903 today, limit 1500. Catches route() with no
                       eviction, which crosses it at ~260 visited urls.
  anchors              48–138 today, limit 500. mark_links() is linear.
  js requests          9–27 today, limit 30.
  boot ms              13–56 today (one waived at 750), limit 250.

Saying which is which matters: an all-green run on the guards means nothing
has gone wrong yet, NOT that the budget is tight.`, "how to read a passing row");

		section("Exemptions");

		code(`
EXEMPT = {
    "/motion/head-start/slow/": {
        boot: "a deliberate 700 ms top-level await — this route exists to be slow",
    },
};`, "budget.js — the whole exemption list");

		p("A budget with no exemption mechanism gets switched off the first time it is wrong, and it is wrong the moment a page's whole point is to be expensive. The rule for adding one: name the route, name the ceiling, and write a reason someone can disagree with. This entry was found by running the checker, not predicted.").ac("note");

		section("Why each ceiling sits where it does");

		BUDGET.forEach(rule => {
			code(rule.reason.replace(/(.{1,84})(\s|$)/g, "$1\n").trim(),
				rule.label + (rule.guard ? "  — a guard, nothing is near it" : "  — tight"));
		});

		section("The regression story — honestly");

		code(`
no build step   -> nothing can run at commit time
no CI here      -> nothing runs on push
no test runner  -> there is no "npm test" to fail

So a budget enforced by tooling is a budget that does not exist in this repo.
The only enforcement available is A PAGE SOMEONE VISITS.`, "what cannot enforce this");

		p("That is not a workaround, it is the honest constraint. A budget nobody runs is decoration, so the deliverable is the runner: `/budget/check/` loads every section cold in an iframe and grades it. It needs no server, no install and no build — it runs in the browser a contributor already has open, against the site they just changed.").ac("note");

		code(`
BEFORE you open a pull request:
  1. run the dev server
  2. visit /budget/check/ and press Run
  3. paste the table into the PR

That is the whole process, and it is enforceable by one reviewer asking
"where is the table?" — which is the only enforcement mechanism a repo with
no CI has ever had.`, "the process, such as it is");

		p("An iframe is the trick that makes this possible at all: it is a real document with its own module registry and its own resource timing, so a page that is already loaded can measure a genuinely cold load of anything. No server-side logic, so it works identically on the static production host.").ac("note");

		section("What the checker cannot see");

		code(`
network latency   every number is localhost. The budget measures the APP,
                  not the connection. /budget/ladder/ is where latency lives.
real first paint  paint timing inside an iframe is unreliable, so the checker
                  reports ms-to-app.ready instead — a slight overshoot of
                  first paint, and stated as such rather than quietly swapped.
memory            heap readings are bucketed to 10 MB in a page without
                  cross-origin isolation. /perf/memo/ uses node counts instead.
warm navigation   needs a live app, not an iframe. Measured at /perf/memo/:
                  0.2 ms median over 500 navigations.`, "four things measured elsewhere, on purpose");

		div.c("row", () => {
			a.c("page-link", "run the checker →").href("/budget/check/");
			a.c("page-link", "the depth ladder →").href("/budget/ladder/");
			a.c("page-link", "showing your source →").href("/budget/source/");
		});
	},
});
