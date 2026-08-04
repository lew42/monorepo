/* THE BUDGET — what a route is allowed to cost, and why.
 *
 * Every ceiling below is derived from a measurement at /perf/, and every one
 * carries the reason it sits where it does. A budget with no reason attached is
 * a number someone will argue with; a budget with a measurement behind it is a
 * number someone has to beat.
 *
 * The ceilings are deliberately loose. A budget that fails on a good page gets
 * switched off within a week, so each one sits well above the worst thing the
 * site does today and still well below the point where a reader would feel it.
 */
export const BUDGET = [
	{
		/* DISTINCT urls, not total fetches. A page that re-fetches its own source
		 * asks for a page.js twice, which inflated this count and made one cause
		 * raise two alarms. Each ceiling measures one thing: this one counts what
		 * was IMPORTED, `duplicates` counts what was asked for twice. */
		key: "distinct", label: "page.js modules, cold", limit: route => route.depth + 2,
		reason: "Laziness is the whole design: a cold load fetches its own chain and nothing else. "
			+ "Measured across 20 sections, every route fetched exactly its depth. The +2 admits a "
			+ "page that declares a child eagerly; anything beyond that imported a sibling.",
	},
	{
		key: "duplicates", label: "the same page.js fetched twice", limit: () => 0,
		reason: "A second fetch of a file the module map already holds. Measured: 32 files do this "
			+ "today, one round trip each, to display their own source. /budget/source/ prices the "
			+ "four ways to avoid it.",
	},
	{
		key: "requests", label: "js requests, cold registry", limit: () => 30, guard: true,
		reason: "A REQUEST COUNT, not a byte count, and that is deliberate: an iframe shares the "
			+ "parent's HTTP cache, so transferSize reads 0 and decodedBodySize is unreliable for "
			+ "cache hits. Request counts are recorded either way. Measured 9–25 across sections; "
			+ "the 25 is a section carrying ext/highlight, which is 8 requests on its own. "
			+ "Byte weight cannot be measured honestly from a page — take it from a cold profile.",
	},
	{
		key: "nodes", label: "DOM nodes in the document", limit: () => 1500, guard: true,
		reason: "Measured 78–710 across every section. 1500 is about twice the heaviest page here. "
			+ "It is also the line an unbounded route() crosses at roughly 260 visited urls, which "
			+ "is the failure this ceiling exists to catch.",
	},
	{
		key: "anchors", label: "anchors in $app", limit: () => 500, guard: true,
		reason: "mark_links() is linear in anchors at about 2.2 µs each, because .origin and "
			+ ".pathname are URL parses. 500 keeps the marking pass under ~1.1 ms — a fraction of "
			+ "one 60 fps frame — on every navigation.",
	},
	{
		key: "boot", label: "ms to app.ready, warm cache", limit: () => 250, guard: true,
		reason: "The iframe has a fresh module registry but a WARM HTTP CACHE, so this measures "
			+ "parse, execute, walk and render — the app, not the network. Measured 15–90 ms across "
			+ "sections; 250 catches a runaway without failing a heavy page. Network cost is a "
			+ "different question and lives at /budget/ladder/: RTT + 16 ms per url segment.",
	},
	{
		key: "overflow", label: "horizontal overflow", limit: () => 0,
		reason: "Not a performance number, but the one layout failure that is objective and that "
			+ "every seat has agreed to. Checked at the frame's width.",
	},
];

/* Load a route in an iframe and measure it COLD.
 *
 * An iframe is a real document with its own module registry, its own resource
 * timing and its own app — which is the only way a page that is already loaded
 * can measure a cold load of anything. No server, no CI, no build step: this
 * runs in the browser a contributor already has open.
 *
 * Sequential by construction. Two of these at once would measure contention.
 */
export async function check(route, width = 1200){
	const frame = document.createElement("iframe");
	frame.setAttribute("aria-hidden", "true");
	frame.style.cssText = `position:absolute;left:-99999px;top:0;width:${width}px;height:900px;border:0;`;

	const loaded = new Promise(resolve => frame.addEventListener("load", resolve, { once: true }));
	frame.src = route;
	document.body.appendChild(frame);

	try {
		await loaded;
		const win = frame.contentWindow;

		// the app inside the frame boots asynchronously after the document loads
		const app = await ready(win);
		if (!app) return { route, failed: "no app.ready inside the frame" };

		const boot = win.performance.now();

		/* Then WAIT FOR QUIET before counting. A page that fetches its own source
		 * does it after render and never awaits it, so sampling at app.ready
		 * reported zero duplicates for a route measured elsewhere to have four —
		 * the checker was blind to the exact violation it exists to catch. */
		await settled(win);

		const res = win.performance.getEntriesByType("resource");
		const js = res.filter(e => /\.js(\?|$)/.test(e.name));
		const pages = js.filter(e => /page\.js(\?|$)/.test(e.name));

		const seen = new Map();
		for (const entry of pages){
			const path = new URL(entry.name).pathname;
			seen.set(path, (seen.get(path) ?? 0) + 1);
		}

		return {
			route,
			depth: route.split("/").filter(Boolean).length,
			modules: pages.length,
			distinct: seen.size,
			duplicates: [...seen.values()].reduce((n, hits) => n + hits - 1, 0),
			requests: js.length,
			nodes: win.document.getElementsByTagName("*").length,
			anchors: win.document.querySelectorAll("a[href]").length,
			boot,
			overflow: win.document.documentElement.scrollWidth > width + 1 ? 1 : 0,
		};
	}
	finally { frame.remove(); }
}

// app.ready is a promise on the frame's window, but the frame's scripts run
// after its load event — so poll briefly for the global, then await it.
async function ready(win, tries = 400){
	for (let i = 0; i < tries; i++){
		if (win.app?.ready){ await win.app.ready; return win.app; }
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	return null;
}

// Quiet = no new resource entry for `calm` ms. Everything a page fetches after
// render — its own source, a late stylesheet, a lazy image — lands in here.
async function settled(win, calm = 300, cap = 4000){
	const started = win.performance.now();
	let count = win.performance.getEntriesByType("resource").length, quiet_since = win.performance.now();

	while (win.performance.now() - quiet_since < calm && win.performance.now() - started < cap){
		await new Promise(resolve => setTimeout(resolve, 50));
		const now = win.performance.getEntriesByType("resource").length;
		if (now !== count){ count = now; quiet_since = win.performance.now(); }
	}
}

/* EXEMPTIONS — a route that breaks a ceiling ON PURPOSE, with the reason.
 *
 * A budget with no exemption mechanism gets switched off the first time it is
 * wrong, and it is wrong the moment a page's whole point is to be expensive.
 * Both entries below were found by running the checker, not predicted:
 * /motion/head-start/slow/ has a deliberate 700 ms top-level await, and the
 * page IS the demonstration.
 *
 * The rule for adding one: name the route, name the ceiling, and write why in
 * a sentence someone can disagree with. An exemption with no reason is a budget
 * quietly getting smaller.
 */
export const EXEMPT = {
	"/motion/head-start/slow/": {
		boot: "a deliberate 700 ms top-level await — this route exists to be slow",
	},
};

/* A row passes only if every ceiling holds. Returns the failures BY NAME, so the
 * table can say which one broke rather than just "fail", and exemptions
 * separately, so a waived ceiling is visible rather than silently missing.
 */
export function grade(row){
	if (row.failed) return { pass: false, broke: ["did not load"], waived: [] };

	const over = BUDGET
		.filter(rule => row[rule.key] !== undefined && row[rule.key] > rule.limit(row))
		.map(rule => rule.key);

	const exempt = EXEMPT[row.route] ?? {};
	const waived = over.filter(key => key in exempt);
	const broke = over.filter(key => !(key in exempt));

	return { pass: !broke.length, broke, waived };
}
