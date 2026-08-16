import { div, span, button } from "../../core/View/View.js";
import { section, row, check } from "./parts.js";

/* The `layout` tab: LayoutTool's verdict on whatever you are looking at — `.app`,
 * or the ext/Panel you last clicked. Record: readme.md, doc/measuring.md.
 *
 * ⚠ Imported on DEMAND, and the TAB is the gate on running it at all. This rail
 * ships to every visitor of the built site, and LayoutTool is ~45KB nobody who
 * isn't measuring should download. (Measured: pages under /framework/ pull it
 * anyway — LayoutTool's own doc page is a declared child and imports it at module
 * scope. Everywhere else, this deferral is the only thing keeping it out.) */
const tool = () => import("../../ext/LayoutTool/LayoutTool.js");
const full = () => import("../../ext/LayoutTool/report.js");
const spot = () => import("../../ext/LayoutTool/highlight.js");

const LIVE = "dev-layout-live";
const SETTLE = 400;
const RESIZE = 200;
const html = document.documentElement;

/* ext/Panel announces its selection on the document and writes `.panel.focus`; this
 * reads both and imports nothing.
 *
 * ⚠ A focused panel on a page the router has HIDDEN is not a target — an inactive
 * page keeps its DOM, so a selection outlives the navigation away from it. */
function target(){
	const panel = document.querySelector(".panel.focus");
	return panel?.getClientRects().length ? panel : document.querySelector(".app");
}

const unfocus = () => document.dispatchEvent(new CustomEvent("panel-unfocus"));

export default function layout(){
	section("layout", () => {
		let $out;
		const paint = () => $out.empty(readout);

		check("follow the resize", LIVE, paint);
		$out = div.c("dev-layout flex v");
		paint();
	});
}

/* ⚠ Only the NEWEST readout measures, and only while it is still in the rail. A tab
 * switch or a redraw otherwise leaves the last one's timer, resize observer and
 * focus listener queued against a view nobody can see. `closest()` rather than
 * `isConnected`, because the rail is built detached and appended a promise later. */
let latest = 0;

function readout(){
	const mine = ++latest;
	const live = html.classList.contains(LIVE);
	const watched = new Set();
	let data, root, watch;

	const $where = div.c("dev-target flex v-center gap");
	const $out = div.c("dev-layout-out flex v", () => span.c("dev-val off", "measuring…"));
	const stale = () => mine !== latest || !$out.el.closest(".dev-body");

	div.c("dev-layout-acts flex wrap", () => {
		button("re-run").click(measure);
		button("full report").click(report);
	});

	// ⚠ On a TIMER: the rail renders during App.render() and refreshes from
	// navigated(), both while the page it is about is still arriving, and
	// `analyze()` reads geometry the moment it is called.
	setTimeout(() => {
		if (live) watch = follow(measure, stale);
		measure();
	}, live ? 0 : SETTLE);

	// Clicking a panel is a measurement of it, deselecting is a measurement of the page.
	document.addEventListener("panel-focus", function hear(){
		if (stale()) return document.removeEventListener("panel-focus", hear);
		measure();
	});

	function measure(){
		if (stale()) return;
		root = target();
		if (!root) return;

		// ⚠ Once per element, never per run: `observe()` re-delivers an initial
		// observation, so re-observing what a run just measured is a loop at 5Hz.
		if (watch && !watched.has(root)){
			watched.add(root);
			watch.observe(root);
		}

		// ⚠ Everything after this lands inside `empty(fn)`, which re-establishes
		// the captor — a factory call in the `then` would append to the page.
		tool().then(({ analyze, rate }) => {
			if (stale()) return;
			const at = performance.now();
			data = analyze(root);
			
			// Two questions, one pass: what is BROKEN, and how GOOD it is. Only the
			// second can tell two clean pages apart. ext/LayoutTool/taste/.
			const good = rate(root);
			const ms = performance.now() - at;

			$where.empty(() => where(data, root));
			$out.empty(() => verdict(data, good, ms, root));
		});
	}

	// ⚠ `root` travels with the data. A finding's address is a `:nth-child()` path
	// FROM the analysis root, and the rail measures the live document — without
	// the element the report reloads the url and resolves the path against a
	// second document, which is how before/after came back showing the sidebar.
	function report(){
		if (!data) return;
		$out.empty(() => {
			span.c("dev-val off", "building the full report…");
			full().then(m => $out.empty(() => m.default(data, { limit: 3, root })));
		});
	}
}

/* What is being measured — hover it to ring the box itself, since a panel carries no
 * mark of its own outside a workspace holding an inspector. The way back is beside
 * it: focus is ext/Panel's to clear, so this asks rather than reaches, which is
 * exactly what Escape asks. An empty path IS the root. */
function where(data, el){
	span.c("dev-key", "target");
	point(span.c("dev-val", data.root), el, { path: "", sel: data.root });

	if (el.classList.contains("panel"))
		button("page").attr("title", "Measure the whole page again (Escape)").click(unfocus);
}

/* The score follows the handle — but only once it STOPS. A drag fires dozens of
 * resize events a second and the analysis is ~47ms on a big page, so every event
 * restarts one timer and the whole gesture costs one run. `.app` is the observed
 * box, not the window: the rail's own drag and its four presets resize the PAGE. */
function follow(measure, stale){
	let timer;

	const watch = new ResizeObserver(() => {
		if (stale()) return watch.disconnect();
		clearTimeout(timer);
		timer = setTimeout(measure, RESIZE);
	});

	watch.observe(document.querySelector(".app") ?? html);
	return watch;
}

function verdict(data, good, ms, el){
	const m = data.metrics;
	const { high, med, low } = data.counts;

	row("grade", `${data.grade} · ${data.score}`, band(data.score));
	row("issues", `${high} high · ${med} med · ${low} low`, high ? "bad" : "off");

	// The second question. `grade` is whether anything is broken; this is how good it
	// is, and the two disagree often — a page with nothing wrong can still be dull.
	row("taste", `${good.grade} · ${good.score}`, band(good.score));
	span.c("dev-val off", good.weakest.map(b => `${b.id} ${Math.round(b.credit * 100)}%`).join(" · "));

	row("root", `${content_width(el)}px · ${m.nodes} nodes · ${Math.round(ms)}ms`);

	span.c("dev-val off", `measure ${m.measure ?? "—"}ch · gap ${m.pad_em ?? "—"}× · used ${m.width_used ?? "—"}%`);

	if (!data.issues.length) return void span.c("dev-val ok", "Nothing fires at this width.");

	data.leading.slice(0, 3).forEach(i => point(div.c("dev-issue flex v", () => {
		span.c("dev-val " + SEV[i.sev], `${i.sev} · ${i.rule}`);
		span.c("dev-val off", i.detail);
	}), el, i));
}

/* Hover a finding to ring the element on the page, click to keep the ring. The
 * overlay arrives on demand like the analysis — safe after an `await` only because
 * it builds no DOM of its own here: it adds a listener to a view already placed. */
const point = ($issue, root, i) =>
	spot().then(({ aim, locate }) => aim($issue, () => locate(root, i.path), i.sel));

/* ⚠ The CONTENT box, not the border box: `.app` reserves the rail as
 * padding-inline-end, so its rect reads the full window however far the page has
 * been squeezed. This number is the one the four presets promise. */
function content_width(el){
	const cs = getComputedStyle(el);
	return Math.round(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
}

const SEV = { high: "bad", med: "warn", low: "off" };
const band = score => (score >= 90 ? "ok" : score >= 70 ? "warn" : "bad");

export { layout };
