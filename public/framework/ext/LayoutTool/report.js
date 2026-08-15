import { View, div, p, h3, h4, span, code, ul, li, button } from "/app.js";
import mirror from "./mirror.js";
import { defer, deferrable } from "./defer.js";

View.stylesheet(import.meta, "LayoutTool.css");

const SEV = { high: "error", med: "warn", low: "subtle" };

/* A report as a view. `report(data)` is the whole panel; `report.card(data)` is
 * the one-line verdict a gallery or an audit row shows instead. */
export default function report(data, { limit = 6 } = {}){
	return div.c("lt-report flex v gap").append(() => {
		report.card(data);
		metrics(data.metrics);
		issues(data, limit);
	});
}

report.card = (data, label) => div.c("lt-card flex gap v-center").append(() => {
	span(data.grade).ac(`lt-grade lt-${band(data.score)}`);
	div.c("flex v").append(() => {
		span(label ?? data.url ?? data.root).ac("lt-where");
		span(`${data.counts.high} high · ${data.counts.med} medium · ${data.counts.low} low`).ac("muted");
	});
	span(String(data.score)).ac("lt-score");
});

report.badge = data => span(`${data.grade} ${data.score}`).ac(`lt-badge lt-${band(data.score)}`);

function metrics(m){
	if (!m) return;

	const cells = [
		["measure", m.measure === null ? "—" : `${m.measure} ch`, "characters per line, median text block"],
		["frame gap", m.pad_em === null ? "—" : `${m.pad_em}× fs`, "text to frame, as a multiple of its font size"],
		["frame gap", m.pad_pct === null ? "—" : `${m.pad_pct}%`, "the same gap as a percentage of box width"],
		["width used", m.width_used === null ? "—" : `${m.width_used}%`, "content span across the viewport"],
		["nodes", String(m.nodes), `${m.depth} levels deep`],
	];

	div.c("lt-metrics grid auto gap").append(() => cells.forEach(([name, value, why]) =>
		div.c("lt-metric flex v").append(() => {
			span(value).ac("lt-metric-value");
			span(name).ac("lt-metric-name");
			span(why).ac("lt-metric-why muted");
		})));
}

function issues(data, limit){
	if (!data.issues.length) return void p("No issues — every rule passed.").ac("muted");

	const by_rule = new Map();
	data.issues.forEach(i => by_rule.set(i.rule, [...(by_rule.get(i.rule) ?? []), i]));

	const ranked = [...by_rule.entries()]
		.sort((a, b) => weight(b[1]) - weight(a[1]));

	div.c("lt-issues flex v gap").append(() => ranked.forEach(([rule, list]) => {
		const worst = list.reduce((a, b) => (rank(b.sev) > rank(a.sev) ? b : a));

		div.c("lt-issue flex v").append(() => {
			div.c("flex gap v-center wrap").append(() => {
				span(worst.sev).ac(`lt-sev lt-sev-${SEV[worst.sev]}`);
				h4(worst.title);
				span(`${list.length}×`).ac("muted");
				span(rule).ac("lt-rule muted");
			});

			ul.c("lt-instances").append(() => list.slice(0, limit).forEach(i =>
				li(() => {
					code(i.sel).ac("lt-sel");
					span(` — ${i.detail}`);
				})));

			if (list.length > limit) p(`…and ${list.length - limit} more`).ac("muted");
			if (worst.fix) fix(worst.fix);

			div.c("lt-actions flex gap v-center wrap").append($slot => {
				// The element itself, broken beside fixed — built on demand,
				// because each one costs a page load in a hidden frame.
				if (data.url) button("Show me this element, before and after")
					.on("click", ev => {
						ev.target.remove();
						$slot.append(() => mirror(data.url, worst, data.viewport?.w ?? 1280, data.root_path));
					});

				if (deferrable(worst)) button("Not a problem here")
					.on("click", ev => {
						defer(data.url, worst);
						ev.target.textContent = "Deferred — re-run to see the score without it";
						ev.target.disabled = true;
					});
			});
		});
	}));
}

function fix(f){
	div.c("lt-fix flex gap v-center wrap").append(() => {
		span("proposed").ac("muted");
		code(f.sel).ac("lt-sel");
		code(`{ ${f.decl} }`).ac("lt-decl");
	});
}

const rank = sev => ({ high: 3, med: 2, low: 1 })[sev] ?? 0;
const weight = list => list.reduce((sum, i) => sum + rank(i.sev), 0);
const band = score => (score >= 90 ? "ok" : score >= 70 ? "warn" : "bad");
