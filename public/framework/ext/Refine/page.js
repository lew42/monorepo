import { Page, p, md } from "/app.js";
import refine from "./Refine.js";

export default new Page({
	meta: import.meta,
	title: "Refine",
	description: "One dictation, shown as a ladder: raw → clean → structured → brief, with a coverage table proving nothing was lost.",
	icon: "fact_check",

	content(){
		p("`Server/refine.mjs` turns a long, rambling dictation into a numbered brief a mastermind can act on — and keeps every step, so you can always ask \"wait, what did I actually say?\" Click an ask below, or a bullet in Structured, and its source sentences light up in Clean and Raw.");

		// Run C (the harness dictation) is the longest of the four and the only
		// one with a dropped sentence AND a thin citation both present, so the
		// FIRST screen anyone lands on already shows what "dropped" looks like —
		// runs/sample has zero, and a first screen with nothing dropped reads as
		// "this never happens".
		const DEFAULT_RUN = "/framework/ai/2026-09-29/prompt-refine/runs/c/";
		refine(import.meta, { run: new URLSearchParams(location.search).get("run") || DEFAULT_RUN }).ac("wide");

		md(`This page shows a real \`Server/refine.mjs\` run — run C, the harness and research dictation — on one of the owner's own 09-29 dictations. \`?run=\` picks any other run directory — the [card](/framework/ai2/2026/09/29/from-dictation-to-a-brief-with-nothing-l/) has a picker for sample / a / b / c. There's also a small hand-built [fixture](?run=${new URL("fixture/", import.meta.url).pathname}) this view was first built against, in the exact file shape \`refine.mjs\` writes.`);
	},
});
