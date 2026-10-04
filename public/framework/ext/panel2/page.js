import { Doc, md, code, demo, div, button, p, iframe } from "/app.js";
import Panel2 from "./Panel2.js";

// `?view=phone` is this exact page, asked to draw ONE small thing instead of
// everything — see `phone_demo()` below for why: a real narrow viewport is the
// only way to prove the drawer, and the cheapest real narrow viewport is this
// same page loaded again inside its own iframe.
const phone_only = new URLSearchParams(location.search).get("view") === "phone";

export default new Doc({
	meta: import.meta,
	title: "Panel2",
	description: "The standard UI area: a header toolbar, a main region, an optional footer, and a sidebar on either side that becomes a drawer on a narrow screen.",
	icon: "view_column",

	files: "Panel2.js panel2.css page.js readme.md",
	notes: "decisions preview-levels",

	content(){

		if (phone_only){
			phone_demo();
			return;
		}

		md("**Panel2 is the site's standard UI area.** It always has a header (a slim toolbar) and a main region; it can also have a footer, and a sidebar on either side of main that slides over it like a drawer once the screen gets narrow. Everything below is a real, live `Panel2` — not a picture of one.");

		code.js(`import Panel2 from "/framework/ext/panel2/Panel2.js";

const notes = new Panel2({ title: "Notes" });
notes.header.append(button("＋"));   // the header IS a toolbar — mount straight into it
notes.main.append(() => p("Whatever you want here."));`);

		md("**The plainest shape: a header and a main region, nothing else.**");

		demo(() => {
			const notes = new Panel2({ title: "Notes" });
			notes.main.append(() => p("No `start`, no `end`, no `footer` — just header + main."));
		}, "No sides, no footer — `new Panel2({ title })` on its own.");

		md("**Two Panel2s, a grip between them.** Drag the seam: it resizes the left panel, and the right one always takes whatever is left — the exact relationship a sidebar has with the page beside it (`ext/grip`, reused as-is). Each header is its own real toolbar: the buttons below are plain `button()` views, mounted with the same `panel.header.append()` call shown above.");

		demo(() => {
			const outline = new Panel2({ title: "Outline" });
			outline.header.append(button("＋"), button("⋯"));
			outline.main.append(() => p("Drag the seam to the right of this panel."));

			const preview = new Panel2({ title: "Preview" });
			preview.header.append(button("Refresh"));
			preview.main.append(() => p("This panel takes whatever's left."));

			Panel2.split(outline, preview);
		}, "Two panels, one grip (`Panel2.split(a, b)`). `{ axis: \"y\" }` stacks them instead and drags the height.");

		md("**Several panels, one grid class: `.panel2-grid`.** Drag the stage's own handle (or try `mobile`, bottom right) — the grid fits as many as comfortably sit in a row, down to one column on a phone, with zero breakpoints written anywhere. The readme explains how, in plain words.");

		demo(() => {
			div.c("grid auto gap panel2-grid", () => {
				["A", "B", "C"].forEach(name => {
					const panel = new Panel2({ title: "Panel " + name });
					panel.main.append(() => p("Panel " + name + "'s own content."));
				});
			});
		}, "`class=\"grid auto gap panel2-grid\"` on the wrapping box — nothing else.");

		phone_section();

		md("Four things this module deliberately does **not** build yet — a fixed-width ↔ fluid-width switch, a third independent grip, the owner's \"sprawl\" layout word, and letting a split panel's height fill instead of hug — are written up, with why, under **Open questions** in the Readme just below.");

		md.details(import.meta, "readme.md", "Readme");
	},
});

// The phone-width proof. A `@media (width < 34em)` rule — panel2.css's side-
// becomes-drawer rule included — answers the REAL browser window, never a
// simulated width (the demo stage above only `zoom`s a box; it does not
// actually shrink the viewport a media query reads). An iframe's content,
// though, gets its own real, independent viewport — so loading this exact
// page again inside one, at a genuinely narrow width, is a real phone-width
// proof instead of a screenshot, for one line of guard code.
function phone_section(){
	md("**On an actual phone — or this window under 34em — a side becomes a drawer**, opened by the button Panel2 added to the header. The frame below is this same page, loaded again at a genuinely narrow width — a real viewport, not a simulation. Tap its ☰ to open the drawer.");

	iframe()
		.attr("src", location.pathname + "?view=phone")
		.attr("title", "Panel2 at phone width")
		.attr("loading", "lazy")
		.style({ width: "22em", height: "26em", border: "1px solid var(--line)", borderRadius: "var(--radius)" });
}

// What `?view=phone` draws instead of the whole page above: one panel with a
// start side, small enough that 22em is already a real phone width for it.
function phone_demo(){
	const inbox = new Panel2({ title: "Inbox", start: true });

	inbox.start.append(() => {
		p("Nav");
		p("Drafts");
		p("Sent");
	});

	inbox.main.append(() => p("Tap ☰ above to open the drawer."));
}
