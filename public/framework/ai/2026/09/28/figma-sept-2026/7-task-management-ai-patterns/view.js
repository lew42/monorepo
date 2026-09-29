import { View, div, span, p, h2, icon } from "/app.js";
// AI 2 never imports the ui/ tier, so `.ui-avatar` has no rules there unless
// this file loads them itself (mastermind finding, 2026-09-28) — that
// missing CSS, not a font/sizing bug, is why the avatars rendered unstyled.
import "/framework/ui/avatar/avatar.js";
import "/framework/ui/scale/scale.js";

View.stylesheet(import.meta, "view.css");

// The first part of the Figma "Task Management & AI Patterns" section, drawn as
// live site markup instead of a screenshot: the plain intro, then TWO separate
// rounded panels — "Task cards and progress" and "Timeline preview" — matching
// how the Figma frame itself draws them as two distinct grey bands.
//
// The card column is only ~400px, a third of the Figma frame's own 856px, so
// this keeps the Figma's LAYOUT (two-up cards, a three-up progress row, a real
// time grid) by SCALING instead of re-flowing, via the shared `ui/scale`
// component (review finding 8): one font-size for the whole thing (16px at
// 856px container width, shrinking below that), and every spacing inside is
// `em` off that one number — never the site's own `--gap`/`--pad`/flow
// tokens, which are sized for a full page, not a 400px card.
//
// Two sibling views ("Details and priority" and "AI feedback patterns") draw
// the rest of this same card, each its own panel; a separate figma.js (placed
// last) shows the Figma png for comparison, so the picture is not duplicated
// three times.
export default class Default extends View {

	render(){
		div.c("ui-scale", () => {
			div.c("ui-scale-body figma-tasks-root", () => {

				// Section introduction (node 78:13556) — no panel, plain.
				div.c("figma-tasks-intro", () => {
					h2("Task management");
					p.c("muted", "Reusable patterns for planning, tracking, prioritizing, and collaborating with agents.");
				});

				// Panel A: task cards and progress (node 78:13559)
				div.c("figma-tasks-panel darken-1", () => {
					span.c("figma-tasks-chip", "TASK CARDS");

					div.c("figma-tasks-cards", () => {
						this.simple_card();
						this.complex_card();
					});

					div.c("figma-tasks-group", () => {
						div.c("figma-tasks-label muted", "PROGRESS TREATMENTS");
						div.c("figma-tasks-progress-row", () => {
							this.step_progress();
							this.linear_progress();
							this.milestone_progress();
						});
					});
				});

				// Panel B: timeline preview (node 78:13653) — same light panel.
				this.timeline_preview();
			});
		}).style("--scale-width", "53.5");
	}

	simple_card(){
		div.c("figma-tasks-card-col", () => {
			div.c("figma-tasks-label muted", "SIMPLE · DESCRIPTION ONLY");
			div.c("figma-tasks-card-box", () => {
				div.c("figma-tasks-row", () => {
					span.c("figma-tasks-badge accent", "TODAY");
					icon("more_horiz").ac("muted");
				});
				p.c("figma-tasks-desc", "Update release notes with the final accessibility fixes.");
				div.c("figma-tasks-row", () => {
					span.c("figma-tasks-path muted", () => {
						icon("account_tree");
						span("tasks/release-notes#a18f");
					});
					div.c("figma-tasks-avatars", () => {
						span.c("ui-avatar figma-tasks-avatar-purple", "AK");
						span.c("ui-avatar figma-tasks-avatar-green", "AI");
					});
				});
			});
		});
	}

	complex_card(){
		const subtasks = [
			["Map keyboard shortcuts", true],
			["Build command search", true],
			["Add recent actions", false],
			["Run accessibility pass", false],
		];

		div.c("figma-tasks-card-col figma-tasks-card-col-wide", () => {
			div.c("figma-tasks-label muted", "COMPLEX · SUB-TASKS");
			div.c("figma-tasks-card-box", () => {
				div.c("figma-tasks-row", () => {
					div.c("figma-tasks-row-tight", () => {
						span.c("figma-tasks-badge feature", "FEATURE");
						span.c("figma-tasks-card-title", "Ship command palette");
					});
					span.c("figma-tasks-label muted", "2/4");
				});
				p.c("figma-tasks-desc", "Unify navigation, search, and common actions behind one keyboard-first surface.");
				div.c("figma-tasks-sub-tasks", () => {
					subtasks.forEach(([label, done]) => div.c("figma-tasks-row-tight", () => {
						span.c(done ? "figma-tasks-marker done" : "figma-tasks-marker");
						span.c(done ? "figma-tasks-done-label" : "", label);
					}));
				});
				div.c("figma-tasks-row", () => {
					span.c("figma-tasks-path muted", () => {
						icon("account_tree");
						span("feature/command-menu#c04b");
					});
					div.c("figma-tasks-avatars", () => {
						span.c("ui-avatar figma-tasks-avatar-orange", "MC");
						span.c("ui-avatar figma-tasks-avatar-green", "AI");
						span.c("ui-avatar figma-tasks-avatar-blue", "JD");
					});
				});
			});
		});
	}

	step_progress(){
		div.c("figma-tasks-card-box", () => {
			div.c("figma-tasks-row", () => {
				span.c("figma-tasks-card-title", "Five-step rollout");
				span.c("figma-tasks-label muted", "STEP 3");
			});
			div.c("figma-tasks-segments", () => {
				["green", "green", "accent", "", ""].forEach(tone => div.c(tone ? `figma-tasks-segment on-${tone}` : "figma-tasks-segment"));
			});
			p.c("figma-tasks-caption muted", "Review in progress");
		});
	}

	linear_progress(){
		div.c("figma-tasks-card-box", () => {
			div.c("figma-tasks-row", () => {
				span.c("figma-tasks-card-title", "Migration");
				span.c("figma-tasks-label muted", "68%");
			});
			div.c("figma-tasks-track", () => { div.c("figma-tasks-track-fill").style("width", "68%"); });
			p.c("figma-tasks-caption muted", "17 of 25 modules");
		});
	}

	milestone_progress(){
		const steps = [true, true, true, false];

		div.c("figma-tasks-card-box", () => {
			span.c("figma-tasks-card-title", "Milestones");
			div.c("figma-tasks-milestones", () => {
				steps.forEach((done, i) => {
					span.c(done ? "figma-tasks-milestone on" : "figma-tasks-milestone");
					if (i < steps.length - 1) div.c(done ? "figma-tasks-connector on" : "figma-tasks-connector");
				});
			});
			p.c("figma-tasks-caption muted", "QA is the final gate");
		});
	}

	// A day's worth of quarter-hour rows (09:00–11:00, the Figma's own range) with
	// three scheduled-task cards placed by time (top/height) AND by column
	// (left/width, from the Figma's own x/width in its 792px-wide track) —
	// the frame's own proportions, not its pixels. `tone` is an
	// agent-identity colour, not a token: the design system has one accent,
	// so these fixed hues just tell concurrent agents apart, the same job
	// the source file's own dot colours do.
	timeline_preview(){
		const START = 9 * 60, END = 11 * 60;
		const top = minutes => ((minutes - START) / (END - START)) * 100;
		const clock = minutes => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

		const tasks = [
			{ start: 9 * 60 + 10, end: 9 * 60 + 40, title: "Triage launch blockers", path: "ops/launch#91d2", who: "MC", tone: "orange", left: 12, width: 29 },
			{ start: 9 * 60 + 30, end: 10 * 60 + 15, title: "Review command palette", path: "feature/cmd-menu#c04b", who: "AI", tone: "purple", left: 43, width: 31 },
			{ start: 10 * 60 + 20, end: 10 * 60 + 50, title: "Publish release notes", path: "tasks/notes#a18f", who: "AK", tone: "green", left: 22, width: 32 },
		];

		div.c("figma-tasks-panel darken-1", () => {
			div.c("figma-tasks-row", () => {
				span.c("figma-tasks-chip", "TIMELINE PREVIEW");
				span.c("figma-tasks-path muted", () => {
					icon("calendar_today");
					span("Tuesday · 24 Sep");
				});
			});

			div.c("figma-tasks-timeline-inner", () => {
				div.c("figma-tasks-timeline", () => {
					div.c("figma-tasks-timeline-grid", () => {
						for (let m = START; m <= END; m += 15) div.c("figma-tasks-timeline-row", () => {
							span.c("figma-tasks-label figma-tasks-time-label muted", clock(m));
						});
					});

					div.c("figma-tasks-timeline-track", () => {
						tasks.forEach(task => div.c(`figma-tasks-timeline-card ${task.tone}`, () => {
							span.c(`figma-tasks-time-range ${task.tone}`, `${clock(task.start)}–${clock(task.end)}`);
							span.c("figma-tasks-card-title", task.title);
							div.c("figma-tasks-path muted", () => {
								icon("account_tree");
								span(task.path);
							});
							span.c(`ui-avatar figma-tasks-avatar-${task.tone === "orange" ? "orange" : task.tone === "purple" ? "purple" : "green"} figma-tasks-timeline-avatar`, task.who);
						}).style({
							top: top(task.start) + "%",
							height: (top(task.end) - top(task.start)) + "%",
							insetInlineStart: task.left + "%",
							width: task.width + "%",
						}));

						div.c("figma-tasks-now-line").style("top", top(10 * 60 + 7) + "%");
					});
				});
			});

			p.c("figma-tasks-timeline-note muted", "Fifteen-minute increments reveal sequencing, overlap, and handoff windows at a glance.");
		});
	}
}
