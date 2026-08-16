import { View, div, p, span, code } from "/app.js";
import { analyze } from "./LayoutTool.js";
import { aim, locate } from "./highlight.js";

View.stylesheet(import.meta, "LayoutTool.css");

/* A score that follows the handle. Drag the window and the verdict changes with
 * it, because that is the only way to see WHERE a layout stops working.
 *
 * ⚠ Once the drag STOPS, never during it. A resize fires dozens of times a
 * second and the analysis is ~47ms on a 1900-node page, so a run per frame
 * spends the whole gesture measuring states nobody asked about. `SETTLE`
 * restarts on every event, so the cost of a drag is one analysis.
 *
 * ⚠ The panel marks itself `data-layout-ignore`, or it measures itself
 * measuring itself: the readout is text in a framed box, so it would report its
 * own padding and its own line lengths and then change them by doing so. */
const SETTLE = 200;

export default function live(target, { label = "This layout", root } = {}){
	return div.c("lt-live-panel flex v gap").attr("data-layout-ignore", "").append($panel => {
		const $head = div.c("lt-live-head flex v");
		const $body = div.c("lt-live-body flex v gap");

		let timer, seen;

		/* ⚠ It observes `documentElement`, which never goes away — so nothing will
		 * ever tell this observer that the panel it writes to has left the DOM. It
		 * has to ask, on every run, about BOTH ends: the box it measures and the
		 * panel it reports into. A navigation away from a page holding one of these
		 * otherwise leaves it measuring, and re-measuring, forever. */
		const watch = new ResizeObserver(() => {
			clearTimeout(timer);
			timer = setTimeout(measure, SETTLE);
		});

		/* ⚠ "Not in the document YET" and "gone" are the same test, and only one of
		 * them means stop. `live()` is called from a page's `content()`, so the first
		 * run can easily beat the render that attaches the page — and a panel that
		 * gives up there measures nothing, ever, with an empty box and no error.
		 * Observing $panel is the wake-up: it fires the moment the panel has a size. */
		function measure(){
			const el = (root ? document.querySelector(root) : null) ?? target?.el ?? target;
			if (!$panel.el?.isConnected || !el?.isConnected) return void (seen && watch.disconnect());

			if (!seen) watch.unobserve($panel.el);      // ...and never again: it reports into itself
			seen = true;

			const t0 = performance.now();
			const data = analyze(el);
			const ms = performance.now() - t0;

			$head.empty(() => head(data, label, ms, el));
			$body.empty(() => body(data, el));
		}

		watch.observe(document.documentElement);
		watch.observe($panel.el);
		if (target?.el) watch.observe(target.el);

		requestAnimationFrame(measure);
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

function body(data, el){
	const { high, med, low } = data.counts;

	span(`${high} high · ${med} medium · ${low} low`).ac(high ? "lt-sev-error" : "muted");

	if (!data.issues.length) return void p("Nothing fires at this width.").ac("muted");

	// Each finding points at the element it is about — `el` is the root its path
	// was walked from, and resolving against any other one finds the wrong box.
	data.leading.slice(0, 4).forEach(i => aim(div.c("lt-live-issue flex v").append(() => {
		div.c("flex gap v-center wrap").append(() => {
			span(i.sev).ac(`lt-sev lt-sev-${SEV[i.sev]}`);
			code(i.rule).ac("lt-rule");
		});
		span(i.detail).ac("lt-live-detail");
	}), () => locate(el, i.path), i.sel));

	const m = data.metrics;
	span(`measure ${m.measure ?? "–"}ch · frame gap ${m.pad_em ?? "–"}× · used ${m.width_used ?? "–"}%`)
		.ac("lt-live-meta muted");
}

const SEV = { high: "error", med: "warn", low: "subtle" };
const band = s => (s >= 90 ? "ok" : s >= 70 ? "warn" : "bad");
