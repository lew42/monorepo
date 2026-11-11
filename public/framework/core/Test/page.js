import { Page, View, div, p, span, pre, a } from "/app.js";
import TestResults from "./TestResults.js";

/* The latest result per test file, failures first. Written by TestRunner.mjs (see readme.md). */
export default new Page({
	meta: import.meta,
	title: "Test",
	icon: "fact_check",
	description: "Is it passing? The latest run of every node test, failures first.",
	children: "view",

	content(){
		p.c("pad", () => { a("Watch a test run").href("/framework/core/Test/view/"); span(": Item, List and Task step by step, every object drawn live, the same steps node runs."); });
		const $box = div.c("pad");
		/* One file a day (results/YYYY-MM-DD.jsonl), last 7 days: older days are loaded once, today's streams live. All share one rows map. */
		const rows_map = new Map(), days = Array.from({ length: 7 }, (_, i) => new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10));
		const readers = days.map(d => Object.assign(new TestResults({ url: new URL(`./results/${d}.jsonl`, import.meta.url).pathname }), { rows: rows_map }));
		const results = readers[readers.length - 1];
		const draw = () => $box.empty(() => {
			const rows = results.sorted, bad = rows.filter(r => !r.ok).length;
			if (!rows.length) return p("No runs yet. Run: node public/framework/core/Test/TestRunner.mjs");
			p(`${rows.length - bad} passing, ${bad} failing, ${rows.length} test files.`);
			for (const r of rows) {
				div.c("row", () => {
					span(`${r.ok ? "✅" : "❌"} ${r.file} · ${r.ms} ms · ${r.trigger ?? ""}`);
					if (!r.ok && r.tail) pre(r.tail);
				});
			}
		});
		Promise.all(readers.slice(0, -1).map(r => r.load())).then(draw);
		results.live(draw).then(draw);
	},
});
