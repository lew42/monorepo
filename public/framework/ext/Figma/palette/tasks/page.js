import { Page, View, div, p } from "/app.js";

View.stylesheet(import.meta, "tasks.css");

const PRIME25 = "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff";
const WHITE10 = "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff";
const INK = "rgba(0,0,0,.8)";
const SOFT = "rgba(0,0,0,.55)";
const LINE = "rgba(0,0,0,.1)";

// Pill: padding 4px 8px, radius 999, label text, align-self flex-start, width fit-content
function Pill(text, bgGradient, textColor) {
	p.c("tsk-pill", text)
		.style("background", bgGradient)
		.style("color", textColor)
		.style("align-self", "flex-start")
		.style("width", "fit-content");
}

// Avatar: 26x26 circle, border 2px white, label text white centred
function Avatar(initials, bgGradient) {
	div.c("tsk-avatar", initials)
		.style("background", bgGradient)
		.style("border", "2px solid #fff")
		.style("width", "26px")
		.style("height", "26px");
}

// Avatar Stack: flex row, avatars except last have margin-right -6px
function AvatarStack(avatars) {
	div.c("tsk-avatar-stack", () => {
		avatars.forEach((av, i) => {
			div.c("tsk-avatar-item", () => {
				Avatar(av.initials, av.bg);
			});
		});
	});
}

// Task Card Footer: flex, space-between, align center, full width
function TaskFooter(refLink, avatars) {
	div.c("tsk-footer", () => {
		p.c("tsk-footer-text", refLink).style("color", SOFT);
		AvatarStack(avatars);
	});
}

export default new Page({
	meta: import.meta,
	title: "Task Management",
	icon: "task_alt",
	width: "full",
	description: "Task cards, progress patterns and priority treatments.",
	children: "timeline",
	content() {
		div.c("tsk-card", () => {
			// Header
			div.c("tsk-header", () => {
				p.c("tsk-title", "TASK MANAGEMENT").style("color", INK);
				p.c("tsk-tagline", "Task cards, progress patterns, and priority treatments across approved bases.").style("color", INK);
			});

			// Row 1: Two Columns
			div.c("tsk-row", () => {
				// Left Column (380px)
				div.c("tsk-col-left", () => {
					p.c("tsk-label", "SIMPLE · DESCRIPTION ONLY").style("color", INK);

					div.c("tsk-task-card", () => {
						Pill("TODAY", PRIME25, "#fff");
						p.c("tsk-body", "Update release notes with the final accessibility fixes.").style("color", INK);
						TaskFooter("tasks/release-notes#a18f", [
							{ initials: "AK", bg: PRIME25 },
							{ initials: "AI", bg: PRIME25 }
						]);
					});
				});

				// Right Column (flex 1)
				div.c("tsk-col-right", () => {
					p.c("tsk-label", "COMPLEX · SUB-TASKS").style("color", INK);

					div.c("tsk-task-card", () => {
						// Header row
						div.c("tsk-task-header", () => {
							div.c("tsk-header-left", () => {
								Pill("FEATURE", "#675f56", "#fff");
								p.c("tsk-task-title", "Ship command palette").style("color", INK);
							});
							p.c("tsk-task-status", "2 / 4").style("color", SOFT);
						});

						// Body
						p.c("tsk-body", "Unify navigation, search, and common actions behind one keyboard-first surface.").style("color", SOFT);

						// Sub-task list
						div.c("tsk-subtasks", () => {
							[
								{ text: "Map keyboard shortcuts", done: true },
								{ text: "Build command search", done: true },
								{ text: "Add recent actions", done: false },
								{ text: "Run accessibility pass", done: false }
							].forEach(st => {
								div.c("tsk-subtask-row", () => {
									div.c(st.done ? "tsk-dot tsk-dot-done" : "tsk-dot tsk-dot-open");
									p.c("tsk-subtask-text", st.text).style("color", st.done ? SOFT : INK);
								});
							});
						});

						// Footer
						TaskFooter("feature/command-menu#c04b", [
							{ initials: "MC", bg: "#675f56" },
							{ initials: "AI", bg: PRIME25 },
							{ initials: "JD", bg: PRIME25 }
						]);
					});
				});
			});

			// Row 2: Three Progress Cards
			div.c("tsk-row", () => {
				// Five-step rollout
				div.c("tsk-progress-card", () => {
					div.c("tsk-progress-header", () => {
						p.c("tsk-label", "Five-step rollout").style("color", INK);
						p.c("tsk-label", "STEP 3").style("color", SOFT);
					});
					div.c("tsk-bars", () => {
						[1, 2, 3, 4, 5].forEach(i => {
							div.c("tsk-bar")
								.style("background", i <= 3 ? "#72c4ff" : "#000");
						});
					});
					p.c("tsk-body", "Review in progress").style("color", SOFT);
				});

				// Migration
				div.c("tsk-progress-card", () => {
					div.c("tsk-progress-header", () => {
						p.c("tsk-label", "Migration").style("color", INK);
						p.c("tsk-label", "68%").style("color", SOFT);
					});
					div.c("tsk-track", () => {
						div.c("tsk-fill").style("width", "68%");
					});
					p.c("tsk-body", "17 of 25 modules").style("color", SOFT);
				});

				// Milestones
				div.c("tsk-progress-card", () => {
					p.c("tsk-label", "Milestones").style("color", INK);
					div.c("tsk-milestone-row", () => {
						[1, 2, 3].forEach(i => {
							div.c("tsk-milestone-item", () => {
								div.c("tsk-milestone-circle", "✓")
									.style("background", "#72c4ff")
									.style("color", "#fff");
								div.c("tsk-milestone-line");
							});
						});
						div.c("tsk-milestone-final", () => {
							div.c("tsk-milestone-circle-hollow")
								.style("background", "#fff")
								.style("border", `2px solid ${LINE}`);
						});
					});
					p.c("tsk-body", "QA is the final gate").style("color", SOFT);
				});
			});

			// Row 3: Priority by scale title
			p.c("tsk-section-title", "Priority by scale").style("color", INK);

			// Row 4: Priority Cards
			div.c("tsk-row", () => {
				// P0 Card
				div.c("tsk-p0-card", () => {
					Pill("P0 · BLOCKER", PRIME25, "#72c4ff");
					p.c("tsk-priority-title", "Resolve release-blocking focus trap").style("color", INK);
					p.c("tsk-body", "Blocks the release candidate. Receives strongest visual weight.").style("color", SOFT);
					TaskFooter("fix/focus-trap#b912", [
						{ initials: "MC", bg: "#675f56" },
						{ initials: "AI", bg: PRIME25 }
					]);
				});

				// Right column with P1 and P2
				div.c("tsk-col-p-right", () => {
					// P1 Card
					div.c("tsk-p1-card", () => {
						Pill("P1 · HIGH", PRIME25, "#fff");
						p.c("tsk-priority-title", "Ship command palette").style("color", INK);
						p.c("tsk-body", "feature/cmd#c04b").style("color", SOFT);
					});

					// P2 Card
					div.c("tsk-p2-card", () => {
						Pill("P2", WHITE10, SOFT);
						p.c("tsk-body", "Update changelog").style("color", INK);
						p.c("tsk-body", "docs/changelog#ec21").style("color", SOFT);
					});
				});
			});
		});
	},
});
