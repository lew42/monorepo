import { Page, View, div, p, h1, h2, h4 } from "/app.js";
View.stylesheet(import.meta, "../../scheme.css");

View.stylesheet(import.meta, "tasks.css");

// Pill: a small label painted with whatever ground class it's given.
function Pill(text, ground) {
	p.c(`tsk-pill ${ground}`, text);
}

// Avatar: initials on a round badge, painted with whatever ground class it's given.
function Avatar(initials, ground) {
	div.c(`tsk-avatar ${ground}`, initials);
}

function AvatarStack(avatars) {
	div.c("tsk-avatar-stack", () => {
		avatars.forEach(av => div.c("tsk-avatar-item", () => Avatar(av.initials, av.ground)));
	});
}

function TaskFooter(refLink, avatars) {
	div.c("tsk-footer", () => {
		p.c("muted", refLink);
		AvatarStack(avatars);
	});
}

export default new Page({
	meta: import.meta,
	classes: "figma-scheme",
	title: "Task Management",
	icon: "task_alt",
	width: "full",
	description: "Task cards, progress patterns and priority treatments.",
	content() {
		div.c("card bleed tsk-card", () => {
			div.c("tsk-header", () => {
				h1("TASK MANAGEMENT");
				p.c("muted tsk-tagline", "Task cards, progress patterns, and priority treatments across approved bases.");
			});

			// Row 1: two columns
			div.c("tsk-row", () => {
				div.c("tsk-col flex-1", () => {
					h4("SIMPLE · DESCRIPTION ONLY");
					div.c("card tsk-task-card", () => {
						Pill("TODAY", "bg-prime");
						p("Update release notes with the final accessibility fixes.");
						TaskFooter("tasks/release-notes#a18f", [
							{ initials: "AK", ground: "bg-prime" },
							{ initials: "AI", ground: "bg-prime" },
						]);
					});
				});

				div.c("tsk-col flex-1", () => {
					h4("COMPLEX · SUB-TASKS");
					div.c("card tsk-task-card", () => {
						div.c("tsk-task-header", () => {
							div.c("tsk-header-left", () => {
								Pill("FEATURE", "bg-dark");
								h2("Ship command palette");
							});
							p.c("tsk-label muted", "2 / 4");
						});
						p.c("muted", "Unify navigation, search, and common actions behind one keyboard-first surface.");
						div.c("tsk-subtasks", () => {
							[
								{ text: "Map keyboard shortcuts", done: true },
								{ text: "Build command search", done: true },
								{ text: "Add recent actions", done: false },
								{ text: "Run accessibility pass", done: false },
							].forEach(st => {
								div.c("tsk-subtask-row", () => {
									div.c(st.done ? "bg-prime tsk-dot" : "surface tsk-dot");
									p.c(st.done ? "muted" : "", st.text);
								});
							});
						});
						TaskFooter("feature/command-menu#c04b", [
							{ initials: "MC", ground: "bg-dark" },
							{ initials: "AI", ground: "bg-prime" },
							{ initials: "JD", ground: "bg-prime" },
						]);
					});
				});
			});

			// Row 2: three progress cards
			div.c("grid auto gap tsk-progress-row", () => {
				div.c("card tsk-progress-card", () => {
					div.c("tsk-progress-header", () => {
						h4("Five-step rollout");
						p.c("tsk-label muted", "STEP 3");
					});
					div.c("tsk-bars", () => {
						[1, 2, 3, 4, 5].forEach(i => div.c(i <= 3 ? "bg-prime tsk-bar" : "bg-darken tsk-bar"));
					});
					p.c("muted", "Review in progress");
				});

				div.c("card tsk-progress-card", () => {
					div.c("tsk-progress-header", () => {
						h4("Migration");
						p.c("tsk-label muted", "68%");
					});
					div.c("bg-darken tsk-track", () => {
						div.c("bg-prime tsk-fill").style("width", "68%");
					});
					p.c("muted", "17 of 25 modules");
				});

				div.c("card tsk-progress-card", () => {
					h4("Milestones");
					div.c("tsk-milestone-row", () => {
						[1, 2, 3].forEach(() => {
							div.c("tsk-milestone-item", () => {
								div.c("bg-prime tsk-milestone-circle", "✓");
								div.c("bg-prime tsk-milestone-line");
							});
						});
						div.c("tsk-milestone-final", () => {
							div.c("surface tsk-milestone-circle-hollow");
						});
					});
					p.c("muted", "QA is the final gate");
				});
			});

			// Row 3: priority by scale
			h2("Priority by scale");

			// Row 4: priority cards
			div.c("tsk-row", () => {
				div.c("card tsk-p0-card flex-1", () => {
					Pill("P0 · BLOCKER", "bg-prime");
					h2("Resolve release-blocking focus trap");
					p.c("muted", "Blocks the release candidate. Receives strongest visual weight.");
					TaskFooter("fix/focus-trap#b912", [
						{ initials: "MC", ground: "bg-dark" },
						{ initials: "AI", ground: "bg-prime" },
					]);
				});

				div.c("tsk-col-p-right flex-1", () => {
					div.c("card tsk-p1-card", () => {
						Pill("P1 · HIGH", "bg-prime");
						h2("Ship command palette");
						p.c("muted", "feature/cmd#c04b");
					});

					div.c("card tsk-p2-card", () => {
						Pill("P2", "bg-darken muted");
						p("Update changelog");
						p.c("muted", "docs/changelog#ec21");
					});
				});
			});
		});
	},
});
