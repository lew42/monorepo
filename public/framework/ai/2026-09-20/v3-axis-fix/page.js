import { Page, md, div, p, img, b } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure; the before/after shots claim wide.
   3 OWN LAYOUT headline number, then the strip fix's before/after pair (at
                two widths — the bug was worse on the phone), then the Live
                toggle's four states.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

const shot = name => new URL("shots/" + name + ".png", import.meta.url).pathname;

export default new Page({
	meta: import.meta,
	title: "V3 axis fix",
	description: "The pinned strip was eating 80% of the V3 timeline's left column. Now it's 17%, and Live visibly turns itself off when you take the wheel.",
	icon: "vertical_align_top",

	content(){

		md("## The sticky box was eating the timeline\n\nThe owner: \"it's a white box that says V3 axis sticky... it takes up like eighty percent of the column, so the whole timeline is being kind of blocked visually.\" The cause was already found before this task started: that box holds every card marked **needs-you** — and the real board has **23** of them, all wrapping onto more and more lines with no limit. Measured before any fix: **79.7%** of the column at 1920px wide, and worse on a phone — at 400px the box was **taller than the whole column**, so no timeline showed at all.").ac("wide");

		md("## Before and after, at 1920px").ac("wide");
		div.c("grid auto gap", () => {
			this.figure("before-1920", "Before — 23 needs-you cards wrap forever. Sticky box: 713px of an 895px column.", "80% of the column");
			this.figure("after-1920", "After — the strip shows the top 4, ranked by the same importance score the grid view uses, with a plain “+21 more”.", "17% of the column");
		}).style({ "--column": "26rem" }).ac("wide");

		md("## And at 400px, where it was worse\n\nOn a phone the same 23 cards left **zero** pixels of timeline visible — the strip's own height was 2.5× the whole column, so nothing below it could ever be reached by scrolling (it's `position: sticky`, permanently pinned to the top).").ac("wide");
		div.c("grid auto gap", () => {
			this.figure("before-400", "Before — the strip alone is 1169px tall in a 461px column. The timeline never appears.", "254% of the column");
			this.figure("after-400", "After — 4 rows, and real timeline cards underneath.", "39% of the column");
		}).style({ "--column": "18rem" }).ac("wide");

		md("## The fix: a small ranked list, plus a height cap that can't be un-fixed by a bigger backlog\n\n" +
			"Two independent limits, so a future night with 50 needs-you cards can't reopen this:\n\n" +
			"- **A visible cap.** The strip shows the top **4** cards, ranked by the same `weight()` score the grid view already uses (needs-you first, then how often a topic is mentioned, then how recent it is) — never just the 4 newest, so the ones that matter can't be bumped out by a stream of updates on something minor. A plain “+N more” reveals the rest.\n" +
			"- **A structural ceiling in the CSS.** `.v3-pinned` also carries `max-height: 9em; overflow-y: auto` regardless of the JS cap. Clicking “+21 more” (below) proves it: the box grows by only 62px and then scrolls internally — it can never again push the timeline down, even if the count-4 logic above were ever changed or removed.\n\n" +
			"Chose **4** over showing 3 (felt stingy at 1920) or a fixed pixel height alone (that would have silently hidden the newest urgent card, which is the one thing this strip exists to never do — see the log for the full reasoning).").ac("wide");

		this.figure2("pinned-expanded", "Clicking “+21 more”: all 25 pinned cards are reachable, but the box still stops at the same 9em ceiling and scrolls inside itself instead of growing.", "600px");

		md("## The Live toggle now reads as on or off at a glance, and turns itself off when you take the wheel\n\n" +
			"The owner: \"it should have a primary background when on and then like more like a disabled look when off... it should disable itself when you kind of scroll down and click on something, because the live mode might actually hijack your scroll.\"\n\n" +
			"**On** reuses the framework's own `.prim` button style (solid orange fill, white text — the same “primary action” look every other filled button on the site already has). **Off** dims toward a disabled look, without an actual `disabled` attribute, so it can still be clicked back on.").ac("wide");

		div.c("grid auto gap", () => {
			this.figure("live-on", "Live: on. Solid fill, white text — reads as armed.", "rgb(255,143,96) fill, opacity 1");
			this.figure("live-off", "Live: off (clicked). Grey wash, muted text, 0.6 opacity.", "rgb(242,242,242) fill, opacity 0.6");
		}).style({ "--column": "22rem" }).ac("wide");

		md("### Driven headless, not just described\n\nBoth self-disable rules were actually triggered, not just written:").ac("wide");
		div.c("grid auto gap", () => {
			this.figure("live-off-scroll", "Live was on; scrolling the inbox past 24px turned it off by itself (button reads “v3-live-btn” with no “on” class after the scroll).", "scroll → off, automatically");
			this.figure("live-off-click", "Live was on; clicking a card (“One page: start here”, now selected) turned it off by itself at the same moment.", "click → off, automatically");
		}).style({ "--column": "22rem" }).ac("wide");

		p.c("muted", "Every measurement above, the alternative caps considered, and the scratch board.jsonl/verdicts.jsonl copies this was proved against (the real files are untouched — hashed before and after) are in this task's task.jsonl.");
	},

	figure(name, caption, number){
		return div.c("surface pad flex v gap-25", () => {
			img().attr("src", shot(name)).attr("alt", caption).style({ width: "100%", borderRadius: "0.4em" });
			p.c("muted", caption);
			p.c("h4", number);
		});
	},

	// A single wide figure (the "+N more" expand proof) — same face as figure(),
	// just not paired with a sibling in a grid.
	figure2(name, caption, maxWidth){
		return div.c("surface pad flex v gap-25", () => {
			img().attr("src", shot(name)).attr("alt", caption).style({ width: "100%", maxWidth, borderRadius: "0.4em" });
			p.c("muted", caption);
		}).ac("wide");
	},
});
