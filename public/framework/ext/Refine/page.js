import { Page, p } from "/app.js";
import refine from "./Refine.js";

export default new Page({
	meta: import.meta,
	title: "Refine",
	description: "One dictation, shown as a ladder: raw → clean → structured → brief, with a coverage table proving nothing was lost.",
	icon: "fact_check",

	content(){
		p("`Server/refine.mjs` turns a long, rambling dictation into a numbered brief a mastermind can act on — and keeps every step, so you can always ask *\"wait, what did I actually say?\"* Click an ask below, or a bullet in Structured, and its source sentences light up in Clean and Raw.");

		refine(import.meta, { run: new URLSearchParams(location.search).get("run") || new URL("fixture/", import.meta.url).pathname });

		p("This page shows the small hand-built fixture at `fixture/` until a real `Server/refine.mjs` run exists to point at — `?run=/framework/ai/2026-09-29/prompt-refine/runs/b/` (or any other run directory) overrides it.");
	},
});
