import { Page, p, a, h2, div, span } from "/app.js";

/** One row per day the refiner was run on the owner's past prompts (written by `Server/refine-days.mjs`). */
export default new Page({
	meta: import.meta,
	title: "Refine runs by day",
	description: "The owner's past prompts, refined day by day in reverse, each ask scored on the 0.5 = not sure scale.",
	icon: "history",

	async content(){
		p("Each day's owner words went through `Server/refine.mjs` (Haiku) and came out as a brief; each ask then got two confidences: **ask** (do we know what was requested?) and **outcome** (do we know what done looks like?). **0.5 means not sure**, under 0.3 probably wrong, over 0.7 only with evidence. The scale: [confidence.md](/framework/ext/Refine/md/doc/confidence/).");
		const box = div();
		const rows = await fetch(new URL("index.json", import.meta.url)).then(r => r.ok ? r.json() : []).catch(() => []);
		box.el.replaceChildren();
		rows.forEach(r => {
			const day = new URL(r.day + "/", import.meta.url).pathname;
			const md = f => `/framework/ext/Refine/md/runs/${r.day}/${f}/`;
			const line = document.createElement("p");
			line.innerHTML = `<b>${r.day}</b>: ${r.asks} asks`
				+ (r.asks ? `, mean ask ${r.ask_clear} · outcome ${r.outcome_clear}${r.truncated ? " (input capped)" : ""}. <a href="${md("brief")}">brief</a> · <a href="${md("coverage")}">coverage</a> · <a href="${day}confidence.json">confidence.json</a>` : ` (${r.note ?? "not run"})`);
			box.el.append(line);
		});
		if (!rows.length) box.el.textContent = "No runs yet: node Server/refine-days.mjs";
	},
});
