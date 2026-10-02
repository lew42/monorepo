import { Page, View, md, div, span, small, h3, button, icon, details, summary } from "/app.js";

View.stylesheet(import.meta, "Card.css");

/* THE SHAPE ONE CARD ALWAYS HAS (show, don't tell): a head (icon, title, a state word, the
   "Reviewed ✓" control), an outline — what was asked and what came of it — and one row in
   the Live card's own style, so a reader sees the three pieces this file actually styles
   without opening `ai2/card.js` at all. Plain markup, no class, no log: the real card reads
   its folder's `page.jsonl`; this is only its look. */
export default new Page({
	meta: import.meta,
	title: "Card",
	description: "The look of an AI card's own page — its head, its outline, a Live-card row — the same CSS whether the card opens under /framework/ai/ or /framework/ai2/.",
	icon: "dashboard",

	content(){
		md("A card's own page, opened at [/framework/ai2/](/framework/ai2/) or [/framework/ai/](/framework/ai/), is always this shape: a head, then an outline of what was asked, then its chat column. This page shows the look alone — no log, no agent, nothing to click.");

		// Not the real `.page.ai2-card-page` grid — that expects the AI 2 shell's own
		// height, which this plain doc page does not give it (it would just collapse to
		// 0px here). A `.card` box holding `.ai2-full-card` alone shows the same look.
		div.c("card", () => {
			div.c("ai2-full", () => {
				div.c("ai2-full-card", () => {
					div.c("ai2-full-head flex v-center gap-25", () => {
						icon("bolt");
						div.c("ai2-full-name", () => {
							span.c("ai2-full-title").text("Fix the sidebar jump");
							small.c("ai2-state live").append(() => { span.c("ai2-state-dot").text("●"); span("in progress"); });
						});
						button.c("ai2-reviewed").attr("type", "button").text("Reviewed ✓");
					});

					div.c("ai2-ol", () => {
						div.c("ai2-ol-grid", () => {
							div.c("ai2-ol-count on", () => { span.c("ai2-ol-n").text("1"); span.c("ai2-ol-name").text("To do"); });
							div.c("ai2-ol-count", () => { span.c("ai2-ol-n").text("2"); span.c("ai2-ol-name").text("Delivered"); });
							div.c("ai2-ol-count", () => { span.c("ai2-ol-n").text("3"); span.c("ai2-ol-name").text("All"); });
						});
						div.c("ai2-ol-list", () => {
							div.c("ai2-ol-row done", () => { span.c("ai2-ol-mark").text("✓"); span.c("ai2-ol-title").text("Pin the rail's width while dragging"); small.c("ai2-ol-time muted").text("2h ago"); });
							div.c("ai2-ol-row done", () => { span.c("ai2-ol-mark").text("✓"); span.c("ai2-ol-title").text("Keep the chat column on its own width"); small.c("ai2-ol-time muted").text("1h ago"); });
							div.c("ai2-ol-row live", () => { span.c("ai2-ol-mark").text("☐"); span.c("ai2-ol-title").text("Stop the sidebar jumping on card switch"); small.c("ai2-ol-time muted").text("now"); });
						});
					});

					h3.c("muted").text("A Live-card row, the same style");
					div.c("ai2-live-item", () => {
						small.c("ai2-live-state ai2-live-working").text("working");
						span.c("ai2-live-name").text("minion-sidebar-fix");
						small.c("ai2-live-line muted").text("pid 47356 · 118 MB");
					});
				});
			});
		});

		details.c("ai2-more", () => {
			summary.c("ai2-more-head muted").text("Where each piece comes from");
			md("The head, the outline and the grid are [`ai2/card.js`](/framework/ai2/card.js)'s own markup; this demo copies the classes by hand so the look can be seen with no real card to open. The Live row is the same `.ai2-live-item` every row in [the Live card](/framework/ai2/live/) wears.");
		});

		md("The whole look, as CSS alone: [`Card.css`](/framework/ux/Card/Card.css).");

		md.details(import.meta, "readme.md", "Readme");
	},
});
