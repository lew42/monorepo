import { AITask, md, div, h2 } from "/app.js";

/* OO census, 2026-10-09: which lowercase function files to turn into classes first. Every number is
   computed live from census.json (function-bag-census.mjs --repo) and top10.json (the picks). */
const url = f => new URL(f, import.meta.url);

export default new AITask({
	meta: import.meta,

	extra(){
		md("**311 lowercase files export loose functions instead of one class.** The ten below are imported most and gain most from a class; each is now a queued task with its own brief. No code was converted.");
		const $box = div.c("flow");
		Promise.all([
			fetch(url("census.json")).then(r => r.json()),
			fetch(url("top10.json")).then(r => r.json()),
		]).then(([census, picks]) => this.census_report($box, census, picks));
	},

	census_report($box, census, picks){
		const imp = f => census.rows.find(r => r.file === f)?.imp ?? 0;
		const area = f => f.startsWith("public/framework/") ? f.split("/").slice(0, 3).join("/") : f.split("/")[0] === "public" ? "public (sites, imagine)" : f.split("/")[0];
		const by = {};
		for (const r of census.rows) by[area(r.file)] = (by[area(r.file)] ?? 0) + 1;
		$box.append(() => {
			h2("The ten to do first");
			md([
				"| # | File(s) | Imported by | Becomes | Queued task |",
				"|---|---|---|---|---|",
				...picks.map((p, i) => `| ${i + 1} | ${p.files.map(f => "`" + f.replace(/^public\/framework\//, "") + "`").join("<br>")} | ${p.files.reduce((s, f) => s + imp(f), 0)} | \`${p.class}\` | [${p.slug}](${p.slug}/requirements.md) |`),
			].join("\n"));
			md("Skipped on purpose: `core/new/1/site/` (38 files, a self-contained teaching site whose `ui.js` has 177 importers, all inside it: one task if that site stays), and the 126 `page.js` files that hold loose functions (each becomes a `Page` subclass when someone next works on it).");
			h2("Where the 311 are");
			md(Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, n]) => `\`${k}\` ${n}`).join(" · "));
			md("The census: `node public/framework/code/patterns/function-bag-census.mjs --repo` ([code/patterns](/framework/code/patterns/)). The rule it serves is in the `code` skill, section \"The hierarchy explains the module\": one class per file, one manager class, the architecture written first, decisions in `doc/architecture.md`. The ten briefs were written by [queue.mjs](queue.mjs) from [top10.json](top10.json).");
		});
	},
});
