import { Page, View, div, p, span, pre } from "/app.js";
import TestResults from "./TestResults.js";

/* The latest result per test file, failures first. Written by TestRunner.mjs (see readme.md). */
export default new Page({
	meta: import.meta,
	title: "Test",
	icon: "fact_check",
	description: "Is it passing? The latest run of every node test, failures first.",

	content(){
		const $box = div.c("pad");
		const results = new TestResults({ url: new URL("./results.jsonl", import.meta.url).pathname });
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
		results.live(draw).then(draw);
	},
});
