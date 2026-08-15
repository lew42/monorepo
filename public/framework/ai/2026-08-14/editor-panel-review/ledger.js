import { View, div, span, details, summary, md } from "/app.js";
import { pick } from "/framework/ext/layout/controls.js";
import FINDINGS from "./findings.js";

/* css: .review-row, .review-tag, .review-where, .review-title — review.css. */
View.stylesheet(import.meta, "review.css");

const RANK = { high: 0, med: 1, low: 2 };
const MODS = ["all", "editor", "Panel", "both"];
const KINDS = ["all", "defect", "gap", "debt", "open", "done"];

/* Two filters and a list. ⚠ `$list` is captured NOW and refilled through a callback —
   `paint()` runs from a click handler, long after the captor has moved on. */
export function ledger(){
	let mod = "all", kind = "all", $list, $count;

	const shown = () => FINDINGS
		.filter(f => (mod === "all" || f.mod === mod) && (kind === "all" || f.kind === kind))
		.sort((a, b) => RANK[a.sev] - RANK[b.sev]);

	const paint = () => {
		const list = shown();
		$count.text("showing " + list.length + " of " + FINDINGS.length);
		$list.empty(() => list.forEach(row));
	};

	/* ext/layout's own control, unmodified — the site has one set of chips and this is
	   it, the same way the panel bar reuses `pick` for alignment. ⚠ One row per filter:
	   run together, the last chip of one group reads as the first of the next. */
	const group = (name, words, choose) => div.c("review-group flex wrap gap v-center", () => {
		span.c("review-tag review-label", name);
		pick(words, choose, "all");
	});

	div.c("review-filters flex v gap", () => {
		group("module", MODS, word => { mod = word; paint(); });
		group("kind", KINDS, word => { kind = word; paint(); });
		$count = span.c("review-tag review-count");
	});

	$list = div.c("review-list flex v gap");
	paint();
	return $list;
}

const row = f => div.c("review-row flex v pad").ac(f.sev).append(() => {
	div.c("flex wrap gap v-center", () => {
		span.c("review-tag review-kind", f.kind);
		span.c("review-tag", f.mod);
		span.c("review-where flex-1", f.where);
	});

	div.c("review-title", f.title);

	details(() => {
		summary(f.fix === "—" ? "what it does" : "what, and the fix");
		md(f.what);
		if (f.fix !== "—") md("**Fix.** " + f.fix);
	});
});

export default ledger;
