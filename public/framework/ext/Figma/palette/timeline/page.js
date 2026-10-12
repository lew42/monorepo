import { Page, View, div, p, h1, h2, h4 } from "/app.js";
View.stylesheet(import.meta, "../../scheme.css");

View.stylesheet(import.meta, "timeline.css");

// Pill: a small label painted with whatever ground class it's given.
function Pill(text, ground) {
	p.c(`tln-pill ${ground}`, text);
}

// Avatar: initials on a round badge, painted with whatever ground class it's given.
function Avatar(initials, ground) {
	div.c(`tln-avatar ${ground}`, initials);
}

// Avatar stack: overlapping circles, most recent last.
function AvatarStack(avatars) {
	div.c("tln-avatar-stack", () => {
		avatars.forEach(av => div.c("tln-avatar-item", () => Avatar(av.initials, av.ground)));
	});
}

export default new Page({
	meta: import.meta,
	classes: "figma-scheme",
	title: "Timeline & Task Detail",
	icon: "schedule",
	width: "full",
	description: "A 15-minute timeline and a structured task detail card.",
	content() {
		div.c("card bleed tln-card", () => {
			div.c("tln-header", () => {
				h1("TIMELINE & TASK DETAIL");
				p.c("muted tln-tagline", "15-minute scheduling and structured task detail views.");
			});

			div.c("tln-row", () => {
				// LEFT column: the timeline
				div.c("tln-col", () => {
					div.c("tln-timeline-header", () => {
						div.c("tln-tag bg-darken", () => h4("TIMELINE PREVIEW"));
						h4("Tuesday · 24 Sep");
					});

					div.c("surface tln-timeline-box", () => {
						const times = [
							{ label: "09:00" }, { label: "09:15", muted: true }, { label: "09:30", muted: true },
							{ label: "09:45", muted: true }, { label: "10:00" }, { label: "10:15", muted: true },
							{ label: "10:30", muted: true }, { label: "10:45", muted: true }, { label: "11:00" },
						];
						times.forEach(t => {
							div.c("tln-row-time", () => {
								p.c(t.muted ? "tln-label muted" : "tln-label", t.label);
								div.c("tln-line");
							});
						});

						// Event cards (absolutely positioned over the grid above)
						div.c("card tln-event-card", () => {
							div.c("tln-event-header", () => {
								p.c("tln-label tln-accent", "09:10–09:40");
								Avatar("MC", "bg-prime");
							});
							p("Triage launch blockers");
							p.c("muted", "ops/launch#91d2");
						}).style("--card-edge", "var(--prime)").style("left", "91px").style("top", "27px").style("width", "230px").style("height", "86px");

						div.c("card tln-event-card", () => {
							div.c("tln-event-header", () => {
								p.c("tln-label tln-accent", "09:30–10:15");
								Avatar("AI", "bg-prime");
							});
							p("Review command palette");
							p.c("muted", "feature/cmd#c04b");
						}).style("--card-edge", "var(--prime)").style("left", "341px").style("top", "69px").style("width", "244px").style("height", "112px");

						div.c("card tln-event-card", () => {
							div.c("tln-event-header", () => {
								p.c("tln-label tln-accent", "10:20–10:50");
								Avatar("AK", "bg-prime");
							});
							p("Publish release notes");
							p.c("muted", "tasks/notes#a18f");
						}).style("--card-edge", "var(--prime)").style("left", "169px").style("top", "223px").style("width", "252px").style("height", "92px");

						div.c("tln-now-line", () => {
							div.c("tln-now-dot");
							div.c("tln-now-bar");
						}).style("left", "73px").style("top", "201px").style("width", "716px");
					});

					p.c("muted", "Fifteen-minute increments reveal sequencing, overlap, and handoff windows at a glance.");
				});

				// RIGHT column: the task detail
				div.c("tln-col", () => {
					h4("TASK DETAIL · IN REVIEW");

					div.c("card tln-detail-card", () => {
						Pill("IN REVIEW", "bg-prime");
						h2("Update release notes with the final accessibility fixes.");

						div.c("tln-detail-footer", () => {
							p.c("muted", "tasks/release-notes#a18f");
							AvatarStack([
								{ initials: "AK", ground: "bg-prime" },
								{ initials: "AI", ground: "bg-prime" },
							]);
						});

						div.c("tln-divider");

						div.c("tln-facts", () => {
							[
								{ label: "DUE", value: "Today · 16:00" },
								{ label: "PRIORITY", value: "High" },
								{ label: "LABEL", value: "Documentation" },
							].forEach(f => {
								div.c("tln-fact-row", () => {
									p.c("tln-label muted", f.label);
									p(f.value);
								});
							});
						});

						div.c("bg-darken tln-activity-box", () => {
							p.c("tln-label muted", "Latest activity");
							p("AI linked the keyboard-navigation fix and requested a final copy review.");
						});
					});
				});
			});
		});
	},
});
