import { View, div, p, span, code } from "/app.js";
import { analyze } from "./LayoutTool.js";

View.stylesheet(import.meta, "LayoutTool.css");

/* A score that follows the handle. Drag the window and the verdict changes with
 * it, because that is the only way to see WHERE a layout stops working.
 *
 * Affordable because the whole analysis is arithmetic: ~25µs per node, so a
 * demo case (≈240 nodes) costs ~4ms — a quarter of a frame. A 1900-node page is
 * ~47ms, which is why this coalesces to one run per frame and never queues.
 *
 * ⚠ The panel marks itself `data-layout-ignore`, or it measures itself
 * measuring itself: the readout is text in a framed box, so it would report its
 * own padding and its own line lengths and then change them by doing so. */
export default function live(target, { label = "This layout", root } = {}){
	return div.c("lt-live-panel flex v gap").attr("data-layout-ignore", "").append($panel => {
		const $head = div.c("lt-live-head flex v");
		const $body = div.c("lt-live-body flex v gap");

		let pending = false;
		let last = 0;

		const measure = () => {
			pending = false;
			const el = (root ? document.querySelector(root) : null) ?? target?.el ?? target;
			if (!el || !el.isConnected) return;

			const t0 = performance.now();
			const data = analyze(el);
			const ms = performance.now() - t0;

			$head.empty(() => head(data, label, ms, el));
			$body.empty(() => body(data));
			last = ms;
		};

		// One run per frame, coalesced — a resize fires dozens of times a second
		// and a queue would run every one of them a frame late, forever.
		const schedule = () => {
			if (pending) return;
			pending = true;
			requestAnimationFrame(measure);
		};

		const watch = new ResizeObserver(schedule);
		watch.observe(document.documentElement);
		if (target?.el) watch.observe(target.el);

		requestAnimationFrame(schedule);
	});
}

function head(data, label, ms, el){
	span(label).ac("lt-live-label");

	div.c("flex gap v-center").append(() => {
		span(data.grade).ac(`lt-grade lt-${band(data.score)}`);
		span(String(data.score)).ac("lt-score");
	});

	span(`${Math.round(el.getBoundingClientRect().width)}px wide · ${data.metrics.nodes} nodes · `
		+ `${ms.toFixed(1)}ms`).ac("lt-live-meta muted");
}

function body(data){
	const { high, med, low } = data.counts;

	span(`${high} high · ${med} medium · ${low} low`).ac(high ? "lt-sev-error" : "muted");

	if (!data.issues.length) return void p("Nothing fires at this width.").ac("muted");

	data.leading.slice(0, 4).forEach(i => div.c("lt-live-issue flex v").append(() => {
		div.c("flex gap v-center wrap").append(() => {
			span(i.sev).ac(`lt-sev lt-sev-${SEV[i.sev]}`);
			code(i.rule).ac("lt-rule");
		});
		span(i.detail).ac("lt-live-detail");
	}));

	const m = data.metrics;
	span(`measure ${m.measure ?? "–"}ch · frame gap ${m.pad_em ?? "–"}× · used ${m.width_used ?? "–"}%`)
		.ac("lt-live-meta muted");
}

const SEV = { high: "error", med: "warn", low: "subtle" };
const band = s => (s >= 90 ? "ok" : s >= 70 ? "warn" : "bad");
