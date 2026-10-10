import { Page, div, p, a, img } from "/app.js";
import { Wizard } from "/framework/ux/Wizard/Wizard.js";

/* AI 2 IN SIX STEPS — press Next when you are ready. One picture of the real thing per
   step, one sentence under it, and a link to the live page. The step is in the address
   (`#3`), so a reload or Back lands on the same step. */
const shot = name => new URL("shots/" + name, import.meta.url).href;

const STEPS = [
	{ title: "What AI 2 is for", pic: "1-whole.png", open: "/framework/ai2/",
		say: "You talk; AI 2 turns what you said into cards, shows what came first and what is in flight, and what each thing cost." },
	{ title: "The rail: newest first", pic: "2-rail.png", open: "/framework/ai2/",
		say: "Down the left, one list, newest first: groups and cards together, each with the time it last changed. A topic you mention again rises to the top." },
	{ title: "A card: what's left, what's done", pic: "3-card.png", open: "/framework/ai2/2026/09/24/ai-dashboard/",
		say: "The three numbers are the filter: To do is on top, because what's still open matters most." },
	{ title: "Press Delivered", pic: "3-card-done.png", open: "/framework/ai2/2026/09/24/ai-dashboard/",
		say: "Each line says plainly what was done, and → open shows the work itself." },
	{ title: "Actions live in one menu", pic: "3-actions.png", open: "/framework/ai2/2026/09/24/ai-dashboard/",
		say: "Flag, archive and change-the-kind used to be three unlabelled controls; now each is a plain sentence under Actions." },
	{ title: "Live: what's running now", pic: "4-live.png", open: "/framework/ai2/live/",
		say: "Who is running, what they're working on, and what just landed. The assistant is one row; click it to talk." },
	{ title: "Make a card", pic: "5-make.png", open: "/framework/ai2/",
		say: "Type or say anything in the box at the top of the rail and it becomes a card. Ask for a new card and it opens on your screen by itself." },
	{ title: "What changed today", pic: "before-group-1920.png", after: "1-whole.png", open: "/framework/ai/2026-09-25/ai2-lead/audit.md",
		say: "Before (top): full-width bars, a “group” dropdown, two lists. After (bottom): short labelled bars, one menu, one filtered list. Every element and why: the audit." },
];

const from_hash = () => Math.max(0, Math.min(STEPS.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));

export default new Page({
	meta: import.meta,
	title: "AI 2, step by step",
	description: "A walkthrough of AI 2: the rail, a card, Live, making a card.",
	icon: "slideshow",

	content(){
		const w = new Wizard({
			index: from_hash(),
			steps: STEPS.map(s => ({ title: s.title, content(){
				div.c("flow", () => {
					p().style({ fontSize: "1.25em", maxWidth: "40em" }).text(s.say);
					img().style({ border: "1px solid var(--line)", borderRadius: "0.4em", maxHeight: "68vh", maxWidth: "100%", width: "auto" }).attr("src", shot(s.pic)).attr("alt", s.title);
					if (s.after) img().style({ border: "1px solid var(--line)", borderRadius: "0.4em", maxHeight: "68vh", maxWidth: "100%", width: "auto" }).attr("src", shot(s.after)).attr("alt", "after");
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
