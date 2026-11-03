import { Page, p, a, md, h2 } from "/app.js";
import refine from "../Refine.js";

/* The saved-run ladder, moved off the Refine page (owner feedback 2026-10-09: one workspace, nothing below the fold).
 * Same content as before: raw → clean → structured → brief on a finished long dictation. */
export default new Page({
	meta: import.meta,
	title: "Saved run (ladder)",
	description: "The same pipeline on a long, finished dictation: raw → clean → structured → brief, with a coverage table.",
	icon: "fact_check",

	content(){
		p("`Server/refine.mjs` turns a long, rambling dictation into a numbered brief a mastermind can act on, and keeps every step. Click an ask below, or a bullet in Structured, and its source sentences light up in Clean and Raw.");
		p(() => a("Back to the live Refine workspace").href("/framework/ext/Refine/"));
		const DEFAULT_RUN = "/framework/ai/sessions/2026/09/29/a918d03d-6afe-4958-b425-20e9eba998ef/prompt-refine/runs/c/";
		refine(import.meta, { run: new URLSearchParams(location.search).get("run") || DEFAULT_RUN }).ac("wide");
		md(`Run C, the harness and research dictation. \`?run=\` picks another run directory. A small hand-built [fixture](?run=${new URL("../fixture/", import.meta.url).pathname}) has the same file shape.`);
	},
});
