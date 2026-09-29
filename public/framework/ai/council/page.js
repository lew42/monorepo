import { Page, md, div } from "/app.js";

/* The ask loop: your words → asks → built → council verdict → fixes. The list below is read
 * live from asks.jsonl (latest line per ask id wins); each council run appends to it. */
const ORDER = { "not done": 0, partly: 1, done: 2 };

export default new Page({
	meta: import.meta,
	title: "The ask loop",
	description: "Everything you ask, whether it was built, and what the council found.",
	icon: "published_with_changes",

	content(){
		md("![The ask loop](loop.svg)");
		const box = div.c("council-asks");
		fetch(new URL("asks.jsonl", import.meta.url)).then(r => r.text()).then(text => {
			const asks = new Map();
			for (const l of text.split("\n")) { try { const a = JSON.parse(l).ask; if (a) asks.set(a.id, a); } catch {} }
			const rows = [...asks.values()].sort((a, b) => (ORDER[a.verdict] ?? 1) - (ORDER[b.verdict] ?? 1));
			const n = v => rows.filter(a => a.verdict === v).length;
			const lines = rows.map(a => `- [${a.verdict === "done" ? "x" : " "}] **${String(a.t).replace(/\.$/, "")}**, ${a.verdict}${a.split ? " (split)" : ""}${a.verdict === "done" ? "" : ". Fix: " + (a.fix || "none named")}`);
			box.md(`**${rows.length} asks: ${n("done")} done, ${n("partly")} partly, ${n("not done")} not done.** From the last run, [${rows[0]?.run}](/framework/ai/${rows[0]?.run}/).\n\n${lines.join("\n")}`);
		});
		return md.file(import.meta, "readme.md", { h1: false });
	},
});
