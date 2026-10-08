import { Page, div, p, a, img } from "/app.js";
import { Wizard } from "/framework/ux/Wizard/Wizard.js";

/* FILE EXPLORER, NO PANELS — press Next. One picture of the real thing per step, one
   sentence under it, a link to the live page. The step is in the address (#3), so a
   reload or Back lands on the same step. */
const shot = name => new URL("shots/" + name, import.meta.url).href;

const STEPS = [
	{ title: "The panels are gone", pic: "1-overview-1920.png", open: "/framework/ext/files/",
		say: "The old file explorer had two stacked toolbars (a mode switcher plus ext/Panel's whole editor chrome) on top of a tree that never closed. Both toolbars are gone — a plain tree, and one ext/grip seam to resize the columns." },
	{ title: "A real tree", pic: "1-overview-1920.png", open: "/framework/ext/files/",
		say: "Folders open and close on click. A folder past a few levels deep builds its rows only on first click, so this same tree can hand you thousands of files without choking." },
	{ title: "Any path, /fs, full screen", pic: "2-fs-fullscreen-1920.png", open: "/framework/ext/files/fs/",
		say: "Add /fs to any folder's url and its files open full screen — no sidebar, no page padding. No page.js anywhere on disk makes this work: it's one new route in core/Page, reused by every folder on the site." },
	{ title: "A link on every page", pic: "3-folder-link-1920.png", open: "/framework/start/",
		say: "A small “Folder” link under every page's title opens that page's own /fs/ view — one click from anywhere to the real files behind it." },
	{ title: "The Files tab still works", pic: "4-doc-files-tab-1920.png", open: "/framework/ext/files/files/",
		say: "Every module's Doc page keeps its Files tab exactly as before, now with an “Open full screen” link — for when the tab's own box (inside the page padding and sidebar) is too small." },
];

const from_hash = () => Math.max(0, Math.min(STEPS.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));

export default new Page({
	meta: import.meta,
	title: "File explorer, no panels",
	description: "A walkthrough of the file explorer after ext/Panel came out: a real tree, the full-screen /fs route, and the page link.",
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
		w.$body.el.classList.remove("measure");
	},
});
