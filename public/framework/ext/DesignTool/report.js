import { View, div, p, h3, h4, span, code, ul, li, button } from "/app.js";
import mirror from "./mirror.js";
import { point } from "./highlight.js";
import { defer, deferrable } from "./defer.js";
import { census as tally, severity } from "./score.js";

View.stylesheet(import.meta, "DesignTool.css");

const SEV = { high: "error", med: "warn", low: "subtle" };

/* A report as a view. `report(data)` is the whole panel; `report.card(data)` is
 * the one-line verdict a gallery or an audit row shows instead.
 *
 * ⚠ TWO CHIPS, AND THEY MEAN DIFFERENT THINGS. `report.census()` is this tier's
 * finding count, coloured by the worst severity in it — no grade, no number out of
 * 100, because `score.js` no longer computes one. `report.badge()` is a real GRADED
 * score and only `taste/` has one to show. Handing a badge a findings row is the
 * mistake this split exists to make visible. */
export default function report(data, { limit = 6, root } = {}){
	return div.c("dt-report flex v gap").append(() => {
		report.card(data);
		metrics(data.metrics);
		issues(data, limit, root);
	});
}

report.card = (data, label) => div.c("dt-card flex gap v-center").append(() => {
	const c = data.counts;
	span(c.high ? "high" : c.med ? "med" : c.low ? "low" : "clean").ac(`dt-worst dt-${severity(c)}`);
	div.c("flex v").append(() => {
		span(label ?? data.url ?? data.root).ac("dt-where");
		span(tally(data.counts)).ac("muted");
	});
	span(String(data.counts.total)).ac("dt-score");
});

report.census = data => span(tally(data.counts)).ac(`dt-badge dt-${severity(data.counts)}`);

report.badge = data => span(`${data.grade} ${data.score}`).ac(`dt-badge dt-${band(data.score)}`);

function metrics(m){
	if (!m) return;

	const cells = [
		["measure", m.measure === null ? "—" : `${m.measure} ch`, "characters per line, median text block in the content region"],
		["frame gap", m.pad_em === null ? "—" : `${m.pad_em}× fs`, "text to frame, as a multiple of its font size"],
		["frame gap", m.pad_pct === null ? "—" : `${m.pad_pct}%`, "the same gap as a percentage of box width"],
		["width used", m.width_used === null ? "—" : `${m.width_used}%`, "share of the frame's width content covers — a gutter is what is left"],
		["content", `${m.text} ch`, "text in the content region — a dead url reads under 128"],
		["nodes", String(m.nodes), `${m.depth} levels deep`],
	];

	div.c("dt-metrics grid auto gap").append(() => cells.forEach(([name, value, why]) =>
		div.c("dt-metric flex v").append(() => {
			span(value).ac("dt-metric-value");
			span(name).ac("dt-metric-name");
			span(why).ac("dt-metric-why muted");
		})));
}

function issues(data, limit, root){
	if (!data.issues.length) return void p("No issues — every rule passed.").ac("muted");

	const by_rule = new Map();
	data.issues.forEach(i => by_rule.set(i.rule, [...(by_rule.get(i.rule) ?? []), i]));

	const ranked = [...by_rule.entries()]
		.sort((a, b) => weight(b[1]) - weight(a[1]));

	div.c("dt-issues flex v gap").append(() => ranked.forEach(([rule, list]) => {
		const worst = list.reduce((a, b) => (rank(b.sev) > rank(a.sev) ? b : a));

		div.c("dt-issue flex v").append(() => {
			/* Every line that names an element points at it: hover rings it, a click
			 * keeps the ring. ⚠ Only with a live `root` — a path is exact relative to
			 * the root it was walked from, and the audit page's is a frame long gone.
			 *
			 * ⚠ AND ONLY IF THERE IS SOMETHING TO RING. `point()` is the one place that
			 * decides (highlight.js): a page-level finding has no element, and neither
			 * has a path that no longer resolves — both used to leave a pointer cursor
			 * promising a location. */
			const at = ($view, i) => (root ? point($view, root, i) : $view);

			at(div.c("flex gap v-center wrap").append(() => {
				span(worst.sev).ac(`dt-sev dt-sev-${SEV[worst.sev]}`);
				h4(worst.title);
				span(`${list.reduce((n, i) => n + (i.count ?? 1), 0)}×`).ac("muted");
				span(rule).ac("dt-rule muted");
			}), worst);

			ul.c("dt-instances").append(() => list.slice(0, limit).forEach(i =>
				at(li(() => {
					code(i.sel).ac("dt-sel");
					span(` — ${i.detail}`);
				}), i)));

			if (list.length > limit) p(`…and ${list.length - limit} more`).ac("muted");
			if (worst.fix) fix(worst.fix);

			div.c("dt-actions flex gap v-center wrap").append($slot => {
				// The element itself, broken beside fixed — built on demand, because
				// without a live `root` each one costs a page load in a hidden frame.
				if (data.url || root) button("Show me this element, before and after")
					.on("click", ev => {
						ev.target.remove();
						$slot.append(() => mirror(worst, {
							url: data.url, width: data.viewport?.w ?? 1280,
							root_path: data.root_path, root,
						}));
					});

				if (deferrable(worst)) button("Not a problem here")
					.on("click", ev => {
						defer(data.url, worst);
						ev.target.textContent = "Deferred — re-run to see the census without it";
						ev.target.disabled = true;
					});
			});
		});
	}));
}

function fix(f){
	div.c("dt-fix flex gap v-center wrap").append(() => {
		span("proposed").ac("muted");
		code(f.sel).ac("dt-sel");
		code(`{ ${f.decl} }`).ac("dt-decl");
	});
}

const rank = sev => ({ high: 3, med: 2, low: 1 })[sev] ?? 0;
const weight = list => list.reduce((sum, i) => sum + rank(i.sev), 0);
const band = score => (score >= 90 ? "ok" : score >= 70 ? "warn" : "bad");
