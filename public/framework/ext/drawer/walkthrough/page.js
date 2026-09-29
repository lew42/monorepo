import { Page, div, p, a, img } from "/app.js";
import { Wizard } from "/framework/ux/Wizard/Wizard.js";

/* THE DRAWER WALKTHROUGH, SEVEN CLICKS — press Next when ready. One real screenshot
 * per step, one sentence under it, a link to open the live page. The step lives in the
 * address (`#3`), so a reload or Back lands on the same step. Shape copied from
 * `ux/Dictate/playground/walkthrough/page.js` (its own comment explains why). */
const shot = name => new URL("shots/" + name, import.meta.url).href;

const STEPS = [
	{ title: "The ☰", pic: "menu-3440-devbar.png", open: "/framework/",
		say: "Every page has a ☰ at its top right. Click it and the drawer opens — one rail, for anything that needs a place beside the page." },
	{ title: "AI: chat and dictate", pic: "plain-ai-1920.png", open: "/framework/",
		say: "The AI tab talks or types, and a model picker at the top chooses who answers." },
	{ title: "Sessions", pic: "thread-resumed-1280.png", open: "/framework/",
		say: "Every thread you've had on this page, in one list — click one and you're back in it." },
	{ title: "A reload keeps the tab", pic: "reload-sessions.png", open: "/framework/?drawer=sessions",
		say: "The open tab lives in the url (`?drawer=sessions`), so a reload or a shared link lands on the same tab, not back at the start." },
	{ title: "Select anything", pic: "select-paragraph-properties-1920.png", open: "/framework/",
		say: "Click any paragraph or card on the page. It's selected, and its properties open on the Element tab." },
	{ title: "\"Ask about this\"", pic: "chip-in-input-1920.png", open: "/framework/",
		say: "With something selected, \"Ask about this\" drops it into the AI tab's input as a chip — it rides along as context for whatever you ask next." },
	{ title: "Dictation, Settings, Admin", pic: "tab-dictation-1280.png", open: "/framework/",
		say: "The rest of the drawer's tabs: Dictation for voice input, Settings and Admin for the rest." },
	{ title: "On a phone: ☰ is the page's nav", pic: "phone-nav-400.png", open: "/framework/",
		say: "On a phone, the ☰ at the top right opens this page's own navigation again — the home links on the home page, the framework sidebar under /framework/." },
	{ title: "On a phone: the bottom rail", pic: "phone-rail-400.png", open: "/framework/",
		say: "A small bar at the bottom of every page: ✦ AI to talk, ⋯ More for the drawer's tabs." },
	{ title: "✦ AI: say it, get a card", pic: "phone-sheet-cards-400.png", open: "/framework/",
		say: "Tap ✦ and a sheet slides up and listens. Each sentence you finish becomes its own small prompt card." },
	{ title: "When the mic can't start, it says why", pic: "phone-mic-error-400.png", open: "/framework/ux/Dictate/doc/https-lan/",
		say: "If the mic can't turn on — plain http on the Wi-Fi, permission denied, no mic, Whisper not answering — the sheet says so and how to fix it. The start sound only plays once the mic is really on." },
];

const from_hash = () => Math.max(0, Math.min(STEPS.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));

export default new Page({
	meta: import.meta,
	title: "The drawer, step by step",
	description: "Eleven real screenshots: the ☰, the AI tab, Sessions, a reload that keeps its tab, selecting content, \"Ask about this\", and the rest of the tabs on desktop — then on a phone, the ☰ navigation, the bottom rail, the ✦ AI sheet, and what happens when the mic can't start.",
	icon: "slideshow",

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
