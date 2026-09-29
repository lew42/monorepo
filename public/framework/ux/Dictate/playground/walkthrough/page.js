import { Page, div, p, a, img } from "/app.js";
import { Wizard } from "/framework/ux/Wizard/Wizard.js";

/* THE DICTATION PLAYGROUND, SIX CLICKS — press Next when ready. One real screenshot
 * per step, one sentence under it, a link to open the live page. The step lives in the
 * address (`#3`), so a reload or Back lands on the same step. Shape copied from
 * `ai/2026-09-25/ai2-lead/page.js` — see that file's own comment for why. */
const shot = name => new URL("shots/" + name, import.meta.url).href;

const STEPS = [
	{ title: "Where it is", pic: "1-where.png", open: "/framework/ux/Dictate/",
		say: "It's right at the top of the plain Dictate page — click UX → Dictate in the rail, and the playground is the first thing you see, no extra click to a separate page." },
	{ title: "Audio source", pic: "2-audio.png", open: "/framework/ux/Dictate/",
		say: "Which microphone is picked, and a bar that fills while it hears you talk — the same level the mic button's own tiny bar shows, just bigger and always visible." },
	{ title: "Raw Whisper", pic: "3-raw.png", open: "/framework/ux/Dictate/playground/",
		say: "Every chunk Whisper settles on gets its own line; a long pause gets a blank line, like a new paragraph; and the sentence it's still guessing at sits grey at the bottom until it settles too." },
	{ title: "Corrections", pic: "4-corrections.png", open: "/framework/ux/Dictate/playground/",
		say: "The fast assistant reads each chunk and marks what it would change — struck red for out, added green for in — fixing typos, capitals and filler words like \"um\" without changing a single thing you meant to say." },
	{ title: "Live", pic: "5-live-fading.png", after: "5-live-clean.png", open: "/framework/ux/Dictate/playground/",
		say: "In the Live tab those same red/green marks dissolve over about five seconds (top: mid-fade) and leave just the clean sentence behind (bottom) — no diff to read, just the corrected text." },
	{ title: "Later: structured text", pic: "5-live-clean.png", open: "/framework/ai/2026/09/28/structured-content-icon-cards-outlines-b/",
		say: "A further pass — turning a long dictation into headings and sections — is designed but not built yet; it waits on the structured-content card linked here. For now, the clean text above is the end of the pipeline." },
];

const from_hash = () => Math.max(0, Math.min(STEPS.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));

export default new Page({
	meta: import.meta,
	title: "Dictation playground, step by step",
	description: "Six real screenshots: press the mic, watch Whisper's raw words, the fast assistant's corrections, and the clean live text — click Next through the whole pipeline.",
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
