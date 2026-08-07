import { View, div, pre, table, thead, tbody, tr, th, td, button } from "/app.js";
import { source } from "/framework/util/source/source.js";

// The module that EMITS these classes is the module that loads their styles, so
// any page importing this UI is styled — /budget/ uses it too. Module bodies run
// once, so the <link> is appended once no matter how many pages import this.
/* css: .measured, .measured-results, .metrics, .run, .claims */
View.stylesheet(import.meta, "perf.css");

/* Two ways to put a number on a page, and the NAME says which one the reader is
 * paying for. That is the whole of this file.
 *
 *     measured(fn)   runs on load     — microseconds, safe on every page view
 *     gated(fn)      runs on click    — seconds, or it mutates the DOM
 *
 * Both render `fn`'s real source above the numbers `fn` returned, so the method
 * is never invisible. Same one-source-of-truth trick as ext/demo's demo(fn) —
 * util/source is literally the same function — but a benchmark is async and
 * sometimes expensive, and those are the two things demo() cannot express.
 *
 * fn returns { head, rows } or just rows, or a promise of either.
 */
export function measured(fn, label){
	return frame(fn, label, (run, $results) => run($results));
}

export function gated(fn, label){
	return frame(fn, label, (run, $results) => $results.append(() => {
		button.c("run", "Run").click(function(){
			this.text("running…").attr("disabled", "");
			// two frames, so "running…" actually paints before a blocking benchmark
			requestAnimationFrame(() => requestAnimationFrame(() => run($results)));
		});
	}));
}

/* Placed synchronously, filled asynchronously — the box and $results exist and
 * are captured NOW, and every fill names $results. Nothing here touches the
 * ambient captor after an await, which is the rule this whole page rests on.
 */
function frame(fn, label, start){
	let $results;

	const $frame = div.c("code measured", () => {
		div.c("code-label", label ?? "the code that produced the numbers below");
		pre(source(fn));
		$results = div.c("measured-results");
	});

	start(async $into => {
		try {
			const result = await fn();
			$into.empty(() => grid(result));
		}
		catch (error){
			$into.empty(() => div.c("measured-error", String(error?.message ?? error)));
		}
	}, $results);

	return $frame;
}

function grid(result){
	const { head, rows } = Array.isArray(result) ? { rows: result } : result;

	return table.c("metrics", () => {
		if (head) thead(() => tr(() => head.forEach(h => th(String(h)))));
		tbody(() => rows.forEach(row => tr(() => row.forEach((cell, i) =>
			td.c(i && typeof cell === "number" ? "num" : "").text(fixed(cell))))));
	});
}

function fixed(cell){
	if (typeof cell !== "number") return String(cell);
	if (!isFinite(cell)) return "—";
	if (Number.isInteger(cell) || Math.abs(cell) >= 100) return String(Math.round(cell));
	return cell.toFixed(Math.abs(cell) >= 1 ? 2 : 3);
}

/* The only timer here, and it takes a median of n — never one sample, which on
 * a 28-thread desktop measures what else was running.
 *
 * It also times a BATCH and divides, because performance.now() is deliberately
 * clamped in a browser: timing one call of a fast function measures the clamp.
 */
export function per_call(rounds, calls, fn){
	const times = [];
	for (let round = 0; round < rounds; round++){
		const t0 = performance.now();
		for (let i = 0; i < calls; i++) fn(i);
		times.push((performance.now() - t0) / calls);
	}
	return summarise(times);
}

export function summarise(times){
	const s = [...times].sort((a, b) => a - b);
	const mid = s.length >> 1;
	return { n: s.length, min: s[0], med: s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2, max: s.at(-1) };
}

/* The one number a reader actually feels: how long the document stayed blank.
 *
 * App.instantiate() is config → render → await load() → initialize → inject, so
 * NOTHING is in <body> until every loader resolves. First-contentful-paint is
 * therefore a direct reading of inject(), not a proxy for it.
 */
export function boot_timing(){
	return paint().then(fcp => {
		const nav = performance.getEntriesByType("navigation")[0];
		const js = performance.getEntriesByType("resource").filter(e => /\.js(\?|$)/.test(e.name));
		const pages = js.filter(e => /page\.js(\?|$)/.test(e.name));

		return {
			head: ["this document", "ms / count"],
			rows: [
				["html responseEnd", nav?.responseEnd ?? NaN],
				["first contentful paint — inject()", fcp],
				["blank after html arrived", (fcp ?? NaN) - (nav?.responseEnd ?? NaN)],
				["js modules fetched", js.length],
				["…of which are page.js", pages.length],
				["js transferred, kB", js.reduce((sum, e) => sum + e.transferSize, 0) / 1024],
				["DOM nodes now", document.getElementsByTagName("*").length],
			],
		};
	});
}

// resolves with the first-contentful-paint timestamp, whether it already
// happened or is still a frame away
export function paint(){
	const seen = performance.getEntriesByName("first-contentful-paint")[0];
	if (seen) return Promise.resolve(seen.startTime);

	return new Promise(resolve => new PerformanceObserver((list, observer) => {
		const entry = list.getEntriesByName("first-contentful-paint")[0];
		if (entry){ observer.disconnect(); resolve(entry.startTime); }
	}).observe({ type: "paint", buffered: true }));
}

/* Laziness, read off the live tree rather than off the network.
 *
 * A `children` entry is a Page (imported) or null (still a name). Counting both
 * says exactly how much of the site this document has paid for — and unlike a
 * request count it keeps being true after the network panel has scrolled away.
 */
export function tree_census(root){
	let pages = 0, names = 0, views = 0, nodes = 0;

	(function walk(page){
		pages++;
		if (page.view){ views++; nodes += page.view.el.getElementsByTagName("*").length + 1; }
		page.children.forEach(child => child ? walk(child) : names++);
	})(root);

	return { pages, names, views, nodes };
}

/* What inject() was waiting for. App.load() awaits EVERY loader before the app
 * enters the document, so the last resource to finish before first paint is the
 * whole of the blank screen — whatever it happens to be.
 */
export function critical_path(){
	return paint().then(fcp => ({
		head: ["last to finish before first paint", "responseEnd ms", "kind"],
		rows: performance.getEntriesByType("resource")
			.filter(entry => entry.responseEnd <= fcp)
			.sort((a, b) => b.responseEnd - a.responseEnd)
			.slice(0, 6)
			.map(entry => [new URL(entry.name).pathname, entry.responseEnd, entry.initiatorType])
			.concat([["first contentful paint", fcp, "paint"]]),
	}));
}

/* Every page.js this document fetched, in the order the network saw them, with
 * the gap between one finishing and the next starting. That gap column IS the
 * serial walk — a parallel batch would show every row starting at once.
 *
 * Reads the browser's own resource timing, so it costs one array scan and can
 * never disagree with the network panel.
 */
export function module_waterfall(){
	const pages = performance.getEntriesByType("resource")
		.filter(entry => /page\.js(\?|$)/.test(entry.name))
		.sort((a, b) => a.startTime - b.startTime);

	if (!pages.length) return [["no page.js in resource timing — this document was navigated to, not reloaded", ""]];

	let done = 0;
	return {
		head: ["module", "start ms", "took ms", "waited ms"],
		rows: pages.map(entry => {
			const row = [new URL(entry.name).pathname, entry.startTime, entry.duration, entry.startTime - done];
			done = Math.max(done, entry.responseEnd);
			return row;
		}),
	};
}
