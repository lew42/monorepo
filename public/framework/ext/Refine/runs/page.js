import { Page, md } from "/app.js";

/** One row per day the refiner was run on the owner's past prompts (written by `Server/refine-days.mjs`). */
export default new Page({
	meta: import.meta,
	title: "Refine runs by day",
	description: "The owner's past prompts, refined day by day in reverse, each ask scored on the 0.5 = not sure scale.",
	icon: "history",

	async content(){
		md(`Each day's words went through \`Server/refine.mjs\` (Haiku) and came out as a brief. Each ask then got two confidences: **ask** (do we know what was requested?) and **outcome** (do we know what done looks like?). **0.5 means not sure**, under 0.3 is probably wrong, over 0.7 needs evidence. The scale: [confidence.md](/framework/ext/Refine/md/doc/confidence/).

Each day is a **sample**: at most 20,000 characters of that day's \`requirements.md\` files and owner chat lines, the owner's own words first, so much of it is agent-written briefs.`);
		const rows = await fetch(new URL("index.json", import.meta.url)).then(r => r.ok ? r.json() : []).catch(() => []);
		const link = (r, f) => `[${f}](/framework/ext/Refine/md/runs/${r.day}/${f}/)`;
		md(rows.length
			? "| Day | Asks | Mean ask | Mean outcome | Files |\n|---|---|---|---|---|\n" + rows.map(r => r.asks
				? `| ${r.day} | ${r.asks}${r.truncated ? " (sample)" : ""} | ${r.ask_clear} | ${r.outcome_clear} | ${link(r, "brief")} · ${link(r, "coverage")} |`
				: `| ${r.day} | 0 | | | ${r.note ?? "not run"} |`).join("\n")
			: "No runs yet: `node Server/refine-days.mjs`");
	},
});
