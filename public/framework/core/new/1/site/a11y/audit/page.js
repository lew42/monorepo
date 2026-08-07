import { Page, p, div, el, a } from "/app.js";
import { section } from "../../ui.js";
import { js, transcript, press } from "../ui.js";
import { sweep, contrast_failures, unnamed_scrollers } from "./audit.js";

export default new Page({
	meta: import.meta,
	title: "The sweep, live",
	classes: "a11y-page",

	content(){

		p("Six checks against the **live document**. Navigate anywhere, come back, and press the button — it reads whatever is on screen now. The ranked table in the report is this function, run once per section and sorted; nothing in it was typed by hand.").ac("note");

		// placed synchronously; filled after app.ready, because Router.mark() runs
		// after every content() in the entering slice
		div.c("row", () => {
			const $out = div.c("sweep-out");
			press("sweep this document", () => render_sweep($out, sweep()));
			press("sweep the sidebar only", () => render_sweep($out, sweep(this.app.$sidebar.el)));
			div.c("sweep-out-host", () => $out);
		});

		div.c("sweep-here", async $here => {
			await this.app.ready;
			render_sweep($here, sweep());
		});

		section("What each check is");

		transcript(`
contrast     every element with its OWN text, against the nearest painted
             ancestor. 4.5:1, or 3:1 for 24px / 18.66px-bold.
scrollers    a horizontally scrollable box is keyboard-operable in Chrome,
             so it is a tab stop — with no role and no name it is announced
             as its entire text.
targets      24×24 CSS px (SC 2.5.8).
nameless     a control with no text, no aria-label and no title.
landmarks    main/nav/region/banner — what a screen reader's jump key finds.
skips        h2 → h4 is a level a user thinks they missed.
reflow       scrollWidth > innerWidth (SC 1.4.10).`);

		section("The two that matter, in full");

		js(contrast_failures, "site/a11y/audit/audit.js");

		p("One row per colour-and-class pair, not per element: a page with forty `.note` paragraphs has one finding, not forty. And only elements with their **own** text — a wrapper inherits its children's text and would report a colour it never paints.").ac("note");

		js(unnamed_scrollers, "…and the one that found 41 tab stops nobody meant to create");

		section("Where the numbers live");

		p("The ranked per-section table, the root causes and the fixes are in the register: `agents/a11y/page.js`. This page is the instrument, not the reading.").ac("note");

		div.c("row", () => a.c("page-link", "← back to Access").href("/a11y/"));
	},
});

// one table, six sections, nothing rendered for a check that passes
function render_sweep($out, found){
	$out.empty(() => {
		const rows = [];
		found.contrast.forEach(c => rows.push(["contrast", `${c.ratio}:1 (needs ${c.needs})`, `${c.size}px  ${c.selector}`, c.text]));
		found.scrollers.forEach(s => rows.push(["scroller", `+${s.width}px`, s.tag, s.text]));
		found.small.forEach(s => rows.push(["target", s.size, "needs 24×24", s.text]));
		found.nameless.forEach(n => rows.push(["no name", n.tag, n.cls, n.html]));
		if (found.skips) rows.push(["heading", String(found.skips), "level skip(s)", ""]);
		if (found.reflow) rows.push(["reflow", "yes", "scrollWidth > innerWidth", ""]);

		el.c("p", "note", `${found.controls} controls · ${found.landmarks.length} landmark(s)`
			+ (found.landmarks.length ? ": " + found.landmarks.join(", ") : "")
			+ ` · ${rows.length} finding(s)`);

		if (!rows.length) return el.c("p", "pass", "Nothing to report on this document.");

		el.c("table", "grid", () => {
			el("tr", () => ["check", "measured", "where", "what"].forEach(head => el("th", head)));
			rows.forEach(row => el("tr", () => row.forEach((cell, i) =>
				el("td", cell).ac(i < 2 && "num").ac(i === 0 && "fail"))));
		});
	});
}
