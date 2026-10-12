import { Page, div, p, a, img } from "/app.js";
import { Wizard } from "/framework/ux/Wizard/Wizard.js";

/* THE REVIEW WALKTHROUGH, FOUR CLICKS — press Next when ready. One real screenshot
 * per step, one sentence under it, a link to open the live page. The step lives in the
 * address (`#3`), so a reload or Back lands on the same step. Shape copied from
 * `ext/drawer/walkthrough/page.js` (its own comment explains why). */
const shot = name => new URL("pics/" + name, import.meta.url).href;

const STEPS = [
	{ title: "Every system asks its questions", pic: "review-1920.png", open: "/framework/ai/review/",
		say: "The review questions for pages, navigation, layout, sizing, wrapping, spacing, colour, flow and words, on one page. Each comes from its skill's own questions.md, so a new rule brings its question with it." },
	{ title: "The same page on a phone", pic: "review-400.png", open: "/framework/ai/review/",
		say: "At 400 the systems stack into one column." },
	{ title: "Screenshots belong to the task", pic: "proof-sheet.png", open: "/framework/ai/2026-09-30/review/proof/",
		say: "Every review shoots the changed pages at 400, 1200, 1920 and 3440 into the task's own shots/ folder, with the measured numbers (tab rows, stacked padding, bands, wraps) beside them." },
	{ title: "One report answers every question", pic: "report.png", open: "/framework/ai/2026-09-30/review/proof/review/report.md",
		say: "A fresh reviewer loads the review skill and answers each question yes, no or n/a, with a shot or a number as proof. This proof run found 8 things on a task that had already landed." },
];

const from_hash = () => Math.max(0, Math.min(STEPS.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));

export default new Page({
	meta: import.meta,
	title: "The review, step by step",
	description: "Four real screenshots: the review questions page on desktop and phone, a task's own proof shots, and the one report that answers every question.",
	icon: "fact_check",

	content(){
		const w = new Wizard({
			index: from_hash(),
			steps: STEPS.map(s => ({ title: s.title, content(){
				div.c("flow", () => {
					p().style({ fontSize: "1.25em", maxWidth: "40em" }).text(s.say);
					img().style({ border: "1px solid var(--line)", borderRadius: "0.4em", maxHeight: "68vh", maxWidth: "100%", width: "auto" }).attr("src", shot(s.pic)).attr("alt", s.title);
					a.c("page-link").href(s.open).text("Open it live →");
				});
			} })),
			done(){ this.go(0); },
		});
		// The step is part of the address: Next and Back write it, a reload reads it.
		const go = w.go.bind(w);
		w.go = i => { const r = go(i); history.replaceState(null, "", "#" + (w.index + 1)); return r; };
		w.ac("wide");
		// The pictures are the point: the step body takes the room beside the step list,
		// not the reading measure the Wizard gives prose.
		w.$body.el.classList.remove("measure");
	},
});
