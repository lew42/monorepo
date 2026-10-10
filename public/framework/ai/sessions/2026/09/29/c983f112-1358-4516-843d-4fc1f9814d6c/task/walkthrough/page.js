import { Page, div, p, a, img } from "/app.js";
import { Wizard } from "/framework/ux/Wizard/Wizard.js";

/* THE LAYOUT EXPLORER, WALKED IN FOUR STEPS. Press Next. One picture of the real
   thing per step, one sentence under it, a link to the live page. The step is in
   the address (#3), so a reload or Back lands on the same step. Shape copied from
   `ai/2026-09-28/file-explorer-fs/walkthrough/page.js`. */
const shot = name => new URL("shots/" + name, import.meta.url).href;

const STEPS = [
	{ title: "The top level", pic: "1-top-1920.png", open: "/layouts/explorer/",
		say: "Left: the categories, most primitive first. Centre: the first one, One column, already large — no empty screen to start on. Right: its four variants — Flow, Centered, Rows, Bands." },
	{ title: "Two columns → Sidebar", pic: "2-sidebar-1920.png", open: "/layouts/explorer/two-columns/2-sidebar/",
		say: "Click a right-rail card and it becomes the centre — the old right rail slides in as the new left. The url moved with it: /layouts/explorer/two-columns/2-sidebar/, so reload or Back land exactly here." },
	{ title: "A real page, large", pic: "3-variant-a-1920.png", open: "/layouts/explorer/two-columns/2-sidebar/a/",
		say: "Not every centre is a drawing — Variant A is a real page (the actual Sidebar component, live), shrunk to fill the column. The Properties strip under it names the real address, /framework/core/Sidebar/variants/a/." },
	{ title: "At 400, the centre comes first", pic: "4-w400.png", open: "/layouts/explorer/two-columns/2-sidebar/a/",
		say: "On a phone the three regions stack, but not in DOM order — the centre (the actual answer) is first, then its children, then the list of siblings, so nothing useful sits under a screen of cards." },
];

const from_hash = () => Math.max(0, Math.min(STEPS.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));

export default new Page({
	meta: import.meta,
	title: "Layout explorer, walked",
	description: "A four-step walkthrough of /layouts/explorer/: the top level, a click down, a real page in the centre, and the phone order.",
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
