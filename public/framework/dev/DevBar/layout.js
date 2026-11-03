import { div, span, button, code } from "../../core/View/View.js";

/* The `layout` tab: DesignTool's verdict on whatever you are looking at — `.app`,
 * or the ext/Panel you last clicked. One screen, one permanent control. Record:
 * readme.md, doc/measuring.md, doc/file/layout.js.md.
 *
 * ⚠ Imported on DEMAND, and the TAB is the gate on running it at all: this rail
 * ships to every visitor of the built site and DesignTool is ~45KB. */
const tool = () => import("../../ext/DesignTool/DesignTool.js");
const spot = () => import("../../ext/DesignTool/highlight.js");
const waive = () => import("../../ext/DesignTool/defer.js");

const SETTLE = 400;
const RESIZE = 200;

// ⚠ A focused panel on a page the router has HIDDEN is not a target — an inactive
// page keeps its DOM, so a selection outlives the navigation away from it.
function target(){
	const panel = document.querySelector(".panel.focus");
	return panel?.getClientRects().length ? panel : document.querySelector(".app");
}

const unfocus = () => document.dispatchEvent(new CustomEvent("panel-unfocus"));

export default function layout(){
	div.c("dev-layout flex v", readout);
}

// ⚠ Only the NEWEST readout measures, and only while it is still in the rail —
// `closest()` rather than `isConnected`, because the rail is built detached.
let latest = 0;

function readout(){
	const mine = ++latest;
	const watched = new Set();
	const fresh = new Set();
	let root, timer;

	const $where = div.c("dev-target flex v-center gap");
	const $out = div.c("dev-layout-out flex wrap", () => span.c("dev-val off", "measuring…"));
	const stale = () => mine !== latest || !$out.el.closest(".dev-body");

	// The one permanent control, and it is here because the readout is a snapshot.
	div.c("dev-layout-acts flex wrap", () =>
		button("measure").attr("title", "Measure again — the readout is a snapshot").click(measure));

	/* ⚠ AN INITIAL OBSERVATION IS NOT A CHANGE. `observe()` re-delivers the box it was
	   just handed and the run that observed it has already measured it — unfiltered,
	   the readout redrew 200ms after appearing and threw away anything selected. */
	const watch = new ResizeObserver(entries => {
		if (stale()) return watch.disconnect();
		if (entries.every(e => fresh.delete(e.target))) return;
		clearTimeout(timer);
		timer = setTimeout(measure, RESIZE);
	});

	// ⚠ On a TIMER: the rail renders during App.render() and refreshes from
	// navigated(), both while the page it is about is still arriving.
	setTimeout(measure, SETTLE);

	// Clicking a panel is a measurement of it, deselecting is a measurement of the page.
	document.addEventListener("panel-focus", function hear(){
		if (stale()) return document.removeEventListener("panel-focus", hear);
		measure();
	});

	function measure(){
		if (stale()) return;
		root = target();
		if (!root) return;

		// ⚠ Once per element, never per run: re-observing what a run just measured
		// is a loop at 5Hz.
		if (!watched.has(root)){
			watched.add(root);
			fresh.add(root);
			watch.observe(root);
		}

		// ⚠ Everything after this lands inside `empty(fn)`, which re-establishes the
		// captor — a factory call in the `then` would append to the page.
		Promise.all([tool(), waive()]).then(([{ analyze, rate }, waiver]) => {
			if (stale()) return;
			const at = performance.now();

			// Two questions, one pass: what is BROKEN, and how GOOD it is.
			const data = analyze(root);
			const good = rate(root);
			const ms = performance.now() - at;

			$where.empty(() => where(data, root));
			$out.empty(() => verdict({ data, good, ms, root, waiver }));
		});
	}
}

// ⚠ The one legitimate whole-page ring, because this is the TARGET and not a
// finding. The way back asks ext/Panel rather than reaching into it.
function where(data, el){
	span.c("dev-glyph", "⌖");
	const $val = span.c("dev-val", data.root);
	spot().then(({ aim }) => aim($val, () => el, data.root));

	if (el.classList.contains("panel"))
		button("⟲").attr("title", "Measure the whole page again (Escape)").click(unfocus);
}

// Two blocks, so a rail dragged wide puts them side by side (devbar.css).
function verdict({ data, good, ms, root, waiver }){
	div.c("dev-stats flex v", () => stats(data, good, ms));
	div.c("dev-findings flex v", () => findings(data, root, waiver));
}

function stats(data, good, ms){
	const { high, med, low } = data.counts;
	const m = data.metrics;

	div.c("dev-verdict flex wrap v-center", () => {
		span.c("dev-val " + (high ? "bad" : med ? "warn" : "ok"), `${high} high · ${med} med · ${low} low`);
		span.c("dev-val " + (good.score == null ? "off" : band(good.grade)),
			good.score == null ? "unrated" : `taste ${good.grade} ${good.score}`);
	});

	div.c("dev-val off", () => {
		span("weakest ");
		(good.weakest ?? []).forEach((b, n) =>
			suspect(span(`${n ? " · " : ""}${b.id} ${Math.round(b.credit * 100)}%`), b.caveat));
	});

	div.c("dev-val", () => {
		suspect(span(`measure ${unit(m.measure, "ch")}`), caveat(good, "measure"));
		span(` · gap ${unit(m.pad_em, "×")} · used ${unit(round(m.width_used), "%")}`);
	});

	span.c("dev-val off", `${m.nodes} nodes · ${Math.round(ms)}ms`);
}

/* ⚠ `.dev-more` IS BUILT ON EVERY ROW AND SHOWN ON ONE. `dt-aimed` is
 * ext/DesignTool's class, set by the same click that holds the ring, so the
 * selection cannot disagree with what is ringed — devbar.css reveals this off it. */
function findings(data, root, waiver){
	if (!data.issues.length) return void span.c("dev-val ok", "Nothing fires at this width.");

	data.leading.slice(0, 3).forEach(i => {
		const $issue = div.c("dev-issue flex v", () => {
			span.c("dev-val " + SEV[i.sev], `${i.sev} · ${i.rule}`);
			span.c("dev-val off", i.detail);

			div.c("dev-more", () => {
				if (i.fix) code.c("dev-fix", `${i.fix.sel} { ${i.fix.decl} }`);

				if (waiver.deferrable(i)) button("not a problem").click(function(){
					waiver.defer(data.url, i);
					this.attr("disabled", "").text("deferred — measure again");
				});
			});
		});

		spot().then(({ point }) => point($issue, root, i));
	});
}

// ⚠ The sentence lives on the BAND (`taste/ranges.js`), never here: a list of
// uncalibrated band names in the UI stops agreeing the day one is fixed.
const suspect = ($val, note) => (note ? $val.ac("dev-suspect").attr("title", note) : $val);
const caveat = (good, id) => good.bands?.find(b => b.id === id)?.caveat;

// ⚠ A dash takes its unit with it, or a null metric renders `gap —×`.
const unit = (value, u) => (value == null ? "—" : value + u);
const round = value => (value == null ? null : Math.round(value));

const SEV = { high: "bad", med: "warn", low: "off" };

// ⚠ Off the GRADE `rate()` computed, never a second copy of score.js's thresholds —
// this rail rendered `undefined · undefined` for exactly that reason.
const band = grade => ({ A: "ok", B: "warn", C: "warn" })[grade] ?? "bad";

export { layout };
