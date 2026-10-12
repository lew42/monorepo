import { Page, View, div, p } from "/app.js";

View.stylesheet(import.meta, "timeline.css");

const PRIME25 = "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff";
const WHITE10 = "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff";
const INK = "rgba(0,0,0,.8)";
const SOFT = "rgba(0,0,0,.55)";
const LINE = "rgba(0,0,0,.1)";

// Pill: padding 4px 8px, radius 999, label text, align-self flex-start, width fit-content
function Pill(text, bgGradient, textColor) {
	p.c("tln-pill", text)
		.style("background", bgGradient)
		.style("color", textColor)
		.style("align-self", "flex-start")
		.style("width", "fit-content");
}

// Avatar: 26x26 circle, border 2px white, label text white centred
function Avatar(initials, bgGradient) {
	div.c("tln-avatar", initials)
		.style("background", bgGradient)
		.style("border", "2px solid #fff")
		.style("width", "26px")
		.style("height", "26px");
}

// Avatar Stack: flex row, avatars except last have margin-right -6px
function AvatarStack(avatars) {
	div.c("tln-avatar-stack", () => {
		avatars.forEach((av, i) => {
			div.c("tln-avatar-item", () => {
				Avatar(av.initials, av.bg);
			});
		});
	});
}

export default new Page({
	meta: import.meta,
	title: "Timeline & Task Detail",
	icon: "schedule",
	width: "full",
	description: "A 15-minute timeline and a structured task detail card.",
	content() {
		div.c("tln-card", () => {
			// Header
			div.c("tln-header", () => {
				p.c("tln-title", "TIMELINE & TASK DETAIL").style("color", INK);
				p.c("tln-tagline", "15-minute scheduling and structured task detail views.").style("color", INK);
			});

			// Main row: two equal columns
			div.c("tln-row", () => {
				// LEFT column: Timeline
				div.c("tln-col", () => {
					// Header row: tag + date label
					div.c("tln-timeline-header", () => {
						div.c("tln-tag", () => {
							p.c("tln-label", "TIMELINE PREVIEW").style("color", INK);
						});
						p.c("tln-label", "Tuesday · 24 Sep").style("color", INK);
					});

					// Timeline box
					div.c("tln-timeline-box", () => {
						// 9 rows with time labels and lines
						const times = [
							{ label: "09:00", color: INK },
							{ label: "09:15", color: SOFT },
							{ label: "09:30", color: SOFT },
							{ label: "09:45", color: SOFT },
							{ label: "10:00", color: INK },
							{ label: "10:15", color: SOFT },
							{ label: "10:30", color: SOFT },
							{ label: "10:45", color: SOFT },
							{ label: "11:00", color: INK }
						];

						times.forEach(t => {
							div.c("tln-row-time", () => {
								p.c("tln-label", t.label).style("color", t.color);
								div.c("tln-line");
							});
						});

						// Event cards (absolutely positioned)
						// Card 1: 09:10–09:40
						div.c("tln-event-card", () => {
							div.c("tln-event-header", () => {
								p.c("tln-label", "09:10–09:40").style("color", "#72c4ff");
								Avatar("MC", PRIME25);
							});
							p.c("tln-event-title", "Triage launch blockers").style("color", INK);
							p.c("tln-event-ref", "ops/launch#91d2").style("color", SOFT);
						})
							.style("left", "91px")
							.style("top", "27px")
							.style("width", "230px")
							.style("height", "86px");

						// Card 2: 09:30–10:15
						div.c("tln-event-card", () => {
							div.c("tln-event-header", () => {
								p.c("tln-label", "09:30–10:15").style("color", "#72c4ff");
								Avatar("AI", PRIME25);
							});
							p.c("tln-event-title", "Review command palette").style("color", INK);
							p.c("tln-event-ref", "feature/cmd#c04b").style("color", SOFT);
						})
							.style("left", "341px")
							.style("top", "69px")
							.style("width", "244px")
							.style("height", "112px");

						// Card 3: 10:20–10:50
						div.c("tln-event-card", () => {
							div.c("tln-event-header", () => {
								p.c("tln-label", "10:20–10:50").style("color", "#72c4ff");
								Avatar("AK", PRIME25);
							});
							p.c("tln-event-title", "Publish release notes").style("color", INK);
							p.c("tln-event-ref", "tasks/notes#a18f").style("color", SOFT);
						})
							.style("left", "169px")
							.style("top", "223px")
							.style("width", "252px")
							.style("height", "92px");

						// Now line (absolutely positioned)
						div.c("tln-now-line", () => {
							div.c("tln-now-dot");
							div.c("tln-now-bar");
						})
							.style("left", "73px")
							.style("top", "201px")
							.style("width", "716px");
					});

					// Description
					p.c("tln-body", "Fifteen-minute increments reveal sequencing, overlap, and handoff windows at a glance.").style("color", SOFT);
				});

				// RIGHT column: Task detail
				div.c("tln-col", () => {
					p.c("tln-label", "TASK DETAIL · IN REVIEW").style("color", INK);

					// Detail card
					div.c("tln-detail-card", () => {
						// Pill
						Pill("IN REVIEW", PRIME25, "#fff");

						// Title
						p.c("tln-detail-title", "Update release notes with the final accessibility fixes.").style("color", INK);

						// Footer row
						div.c("tln-detail-footer", () => {
							p.c("tln-body", "tasks/release-notes#a18f").style("color", SOFT);
							AvatarStack([
								{ initials: "AK", bg: PRIME25 },
								{ initials: "AI", bg: PRIME25 }
							]);
						});

						// Divider
						div.c("tln-divider");

						// Facts block
						div.c("tln-facts", () => {
							const facts = [
								{ label: "DUE", value: "Today · 16:00" },
								{ label: "PRIORITY", value: "High" },
								{ label: "LABEL", value: "Documentation" }
							];

							facts.forEach(f => {
								div.c("tln-fact-row", () => {
									p.c("tln-label", f.label).style("color", SOFT);
									p.c("tln-body", f.value).style("color", INK);
								});
							});
						});

						// Activity box
						div.c("tln-activity-box", () => {
							p.c("tln-label", "Latest activity").style("color", SOFT);
							p.c("tln-body", "AI linked the keyboard-navigation fix and requested a final copy review.").style("color", INK);
						});
					});
				});
			});
		});
	},
});
