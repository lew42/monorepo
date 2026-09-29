import { Page, div, p, a, img } from "/app.js";
import { Wizard } from "/framework/ux/Wizard/Wizard.js";

/* Sidebar variants, in nine steps — press Next when you are ready. One picture of the
   real thing per step, one plain sentence under it, and a link to the live page. The
   step is in the address (`#3`), so a reload or Back lands on the same step. */
const shot = name => new URL("../../../../ai/2026-09-28/section-variants/walkthrough/shots/" + name, import.meta.url).href;

const STEPS = [
	{ title: "The section element", pic: "section-1920.png", after: "section-hover-1920.png", open: "/framework/core/Sidebar/variants/",
		say: "A thin border marks each section. Hover one and it shows its class names, so browsing the page teaches you what to call things." },
	{ title: "Four ways to take the sidebar", pic: "variants-index.png", open: "/framework/core/Sidebar/variants/",
		say: "Four pages, each a real Sidebar, each taking over the left rail a different way." },
	{ title: "Variant A", pic: "variant-a.png", open: "/framework/core/Sidebar/variants/a/",
		say: "The logo and the word sit together at the top; the nav tree below is plain and quiet." },
	{ title: "Variant B", pic: "variant-b.png", open: "/framework/core/Sidebar/variants/b/",
		say: "The logo grows bigger and the word drops away; the nav tree carries more weight." },
	{ title: "Variant C", pic: "variant-c.png", open: "/framework/core/Sidebar/variants/c/",
		say: "The word runs long, so it wraps; the logo shrinks to make room for it." },
	{ title: "Variant D", pic: "variant-d.png", open: "/framework/core/Sidebar/variants/d/",
		say: "No word at all — just the logo, so the rail stays narrow and the nav tree gets the space." },
	{ title: "Variant B, narrow and wide", pic: "variant-b-1280.png", after: "variant-b-3440.png", open: "/framework/core/Sidebar/variants/b/",
		say: "Top: B at 1280px, a laptop width. Bottom: B at 3440px, the owner's own screen — the same rail, more room around it." },
	{ title: "Who owns the rail", pic: "variant-rail.png", open: "/framework/core/Sidebar/variants/rail/",
		say: "Either the app swaps one rail as pages change (E), or every page keeps its own rail and an `active` class hides the rest (F)." },
	{ title: "Which one?", open: "/framework/core/Sidebar/variants/",
		say: "None of this decides anything by itself — the choice among A–F lives on the task's card, as a Decision, for the owner." },
];

const from_hash = () => Math.max(0, Math.min(STEPS.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));

export default new Page({
	meta: import.meta,
	title: "Sidebar variants, step by step",
	description: "A walkthrough of the six sidebar variants: the section element, the index, A–D, B at two widths, and who owns the rail.",
	icon: "slideshow",

	content(){
		const w = new Wizard({
			index: from_hash(),
			steps: STEPS.map(s => ({ title: s.title, content(){
				div.c("flow", () => {
					p().style({ fontSize: "1.25em", maxWidth: "40em" }).text(s.say);
					if (s.pic) img().style({ border: "1px solid var(--line)", borderRadius: "0.4em", maxHeight: "68vh", maxWidth: "100%", width: "auto" }).attr("src", shot(s.pic)).attr("alt", s.title);
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
