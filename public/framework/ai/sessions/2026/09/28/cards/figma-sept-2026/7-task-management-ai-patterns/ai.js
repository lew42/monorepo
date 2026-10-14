import { View, div, span, p, small, button, textarea, pre, code, a, icon, highlight } from "/app.js";

View.stylesheet(import.meta, "ai.css");

// AI 2 never imports the `ui/` tier itself, so `.ui-avatar`'s own CSS (the
// 2.5em circle, the accent/wash fills) would never load without this —
// every avatar in the gutter rendered as a bare, unstyled inline span.
import "/framework/ui/avatar/avatar.js";
import "/framework/ui/scale/scale.js";

/* Figma "Sept 2026" → section 7 "Task Management & AI Patterns" → the bottom
   band, frame "AI feedback patterns" (node 78:13866): the compact/expanded
   composer pair, then a full AI conversation with code blocks and a reply
   composer. sections/7-task-management-ai-patterns.png is the picture; the
   view.js/details.js siblings in this same folder draw everything above it —
   this file draws only what is inside that one frame.

   Reused as-is: `ui-avatar` (framework/ui/avatar) for every circle, `surface
   pad flex v gap` (framework/ui/card) for the compact task card. Everything
   else — every chip, bubble, button and code block, none of which match an
   existing `ui-badge` variant closely enough after the mastermind's judging
   pass — is `figma-ai-*`, one `@layer site` block in ai.css. */

const CODE = "const retries = Math.min(config.retries ?? 3, 5)\nreturn withBackoff(runTask, { retries, signal })";

// The dark-ink eyebrow chip — only the "AI FEEDBACK" section label uses this one.
const eyebrow_chip = text => span.c("figma-ai-eyebrow h4", text);

// A solid accent pill — "IN REVIEW".
const status_chip = text => span.c("figma-ai-status h4", text);

// A round avatar. `kind`: "ai" (dark circle, sparkle icon — the message rail),
// "bot" (green circle, "AI" letters — a compact card's own avatar), "mate"
// (purple circle, initials — a second agent on a task) or plain initials
// (accent circle — "You").
const face = (kind, initials) => span.c(`ui-avatar figma-ai-face-${kind}`, () => {
	kind === "ai" ? icon("auto_awesome").style("fontSize", "0.9em") : span(initials);
});

// An icon, optionally with a label — the small, boxless actions in a toolbar row.
const iconlink = (glyph, label) => span.c("figma-ai-icon-btn flex v-center gap", () => {
	icon(glyph);
	if (label) small(label);
}).style("--gap", "0.3em");

// A small, bold, uppercase action button — every button in an action row
// (Cancel/Begin, Reject/Improve/Approve) is this shape, one CSS class away
// from the framework's plain `button()`.
const action_btn = (label, glyph, extra = "") => button.c(`figma-ai-action ${extra} flex v-center gap`, () => {
	if (glyph) icon(glyph).style("fontSize", "0.85em");
	small(label);
}).style("--gap", "0.3em");

export default class AiFeedback extends View {

	// ═══ the compact/expanded pair — the SAME composer at its two sizes ═══
	// (this is the whole point of the section: a task's AI action starts as
	// one button in a card's footer and grows into a full composer).
	compact_example(){
		return div.c("flex v gap", () => {
			small.c("figma-ai-state-label h4 muted", "Compact footer");

			div.c("surface pad flex v gap", () => {
				status_chip("In review");
				p.c("figma-ai-strong", "Review retry policy for background jobs");
				div.c("flex v-center split muted figma-ai-meta", () => {
					iconlink("call_split", "infra/retries#61af");
					face("bot", "AI");
				});

				div.c("figma-ai-compact-footer flex v-center split", () => {
					iconlink("auto_awesome", "Ask AI").ac("figma-ai-strong");
					div.c("flex v-center gap", () => {
						iconlink("chat_bubble_outline");
						iconlink("attach_file");
						iconlink("more_horiz");
					}).style("--gap", "0.6em");
				});
			}).style("--gap", "0.5em");
		});
	}

	expanded_example(){
		return div.c("flex v gap", () => {
			small.c("figma-ai-state-label h4 muted", "Expanded composer");
			this.composer("Ask about this task, request a revision, or dictate feedback…");
		});
	}

	// ═══ the composer — the standalone example above, and the live reply box
	// below the transcript, are the SAME call. `on_send` is what makes the
	// second one real: typing and hitting send appends a message, locally. ═══
	composer(placeholder, on_send){
		return div.c("figma-ai-composer pad flex v gap", () => {
			const $ta = textarea().attr("rows", "2").attr("placeholder", placeholder);

			div.c("flex v-center split", () => {
				div.c("flex v-center gap", () => {
					span.c("figma-ai-dictate flex v-center gap", () => {
						icon("mic").style("fontSize", "0.85em");
						small("Dictate");
					}).style("--gap", "0.3em");
					iconlink("attach_file");
				}).style("--gap", "0.5em");

				button.c("figma-ai-send", () => icon("arrow_upward").style("fontSize", "1em")).click(() => {
					const text = $ta.el.value.trim();
					if (!text) return;
					on_send?.(text);
					$ta.el.value = "";
				});
			});
		}).style("--gap", "0.6em");
	}

	// ═══ one chat message — an avatar OUTSIDE the bubble, then the bubble
	// itself: "who · time" at its top, then whatever body() draws. ═══
	message({ ai, who, time, body }){
		return div.c("figma-ai-message flex gap", () => {
			ai ? face("ai") : face("you", "YOU");
			div.c(`figma-ai-bubble ${ai ? "" : "figma-ai-bubble-you"} flex v gap`, () => {
				div.c("flex v-center split muted figma-ai-meta", () => {
					span(ai ? "AI" : who);
					span(time);
				});
				body();
			}).style("--gap", "0.5em");
		}).style("--gap", "0.6em");
	}

	// A linked reference — underlined bold text with a small check icon, not
	// a bordered chip (the mastermind's correction: these read as LINKS).
	task_link(text){
		return span.c("figma-ai-task-link figma-ai-meta flex v-center gap", () => {
			icon("check_box").style("fontSize", "0.9em");
			small(text);
		}).style("--gap", "0.3em");
	}

	// A code block: a header (language + copy button), a dark body (the snippet).
	// `highlight()` (ext/highlight) lights up every `pre > code.language-*` under
	// the card in one pass, at the end of render() — not per block, per its own doc.
	code_block(){
		return div.c("figma-ai-code", () => {
			div.c("figma-ai-code-head flex v-center split", () => {
				small.c("figma-ai-code-lang", "typescript");
				const $copy = button.c("figma-ai-copy flex v-center gap", () => {
					icon("content_copy").style("fontSize", "0.9em");
					small("Copy");
				}).style("--gap", "0.3em");

				$copy.click(() => {
					navigator.clipboard?.writeText(CODE).catch(() => {});
					$copy.empty(() => { icon("check").style("fontSize", "0.9em"); small("Copied"); });
					setTimeout(() => $copy.empty(() => {
						icon("content_copy").style("fontSize", "0.9em"); small("Copy");
					}), 1200);
				});
			});

			pre(() => code.c("language-typescript", CODE));
		});
	}

	// The outer `ui-scale` div opens the container-query context (shared
	// `ui/scale` component, review finding 8); the inner `ui-scale-body` is
	// sized off ITS width, so everything below — all written in `em` —
	// scales as one piece instead of reflowing. See the note at
	// `.figma-ai-band` in ai.css.
	render(){
		div.c("ui-scale", () => { div.c("ui-scale-body figma-ai-band flex v gap", () => {

			eyebrow_chip("AI feedback").style("width", "fit-content");

			div.c("figma-ai-states grid gap auto", () => {
				this.compact_example();
				this.expanded_example();
			});

			div.c("figma-ai-conversation flex v", () => {
				div.c("figma-ai-conv-header flex v-center split", () => {
					div.c("flex v-center gap", () => {
						icon("auto_awesome").style("fontSize", "1.1em");
						span.c("figma-ai-strong", "Release readiness");
						icon("expand_more").style("fontSize", "1.1em");

						// Real: a fresh session — the transcript really clears.
						button.c("figma-ai-new-session", () => icon("add").style("fontSize", "1em"))
							.attr("title", "start a new session")
							.click(() => this.$messages.empty());
					}).style("--gap", "0.5em");

					iconlink("close");
				});

				this.$messages = div.c("figma-ai-messages flex v");

				this.$messages.append(() => {
					this.message({ ai: true, time: "10:42", body: () => {
						p("Before I begin: should retries stop after three attempts, or inherit the workspace maximum?");
						div.c("flex wrap gap", () => {
							this.task_link("Retry policy · #61af");
							this.task_link("Worker backoff · #942e");
						}).style("--gap", "1em");
						div.c("figma-ai-action-row flex gap", () => {
							action_btn("Cancel");
							action_btn("Begin", "play_arrow", "figma-ai-action-prim");
						}).style("--gap", "0.5em");
					}});

					this.message({ who: "You", time: "10:44", body: () => {
						p("Cap this path at three attempts, preserve cancellation, and keep the workspace default everywhere else.");
						this.code_block();
					}});

					this.message({ ai: true, time: "10:42", body: () => {
						p("Implemented the cap. I also found an edge case: an aborted job can enter the next backoff cycle. I can track that as a separate task.");
						div.c("figma-ai-task-embed flex v-center split", () => {
							div.c("flex v-center gap", () => {
								icon("check_box_outline_blank").ac("muted");
								div.c("flex v", () => {
									span.c("figma-ai-strong", "Add abort handling to retry helper");
									small.c("muted flex v-center gap", () => {
										icon("call_split").style("fontSize", "0.9em");
										span("fix/retry-signal#7dd1");
									}).style("--gap", "0.3em");
								});
							}).style("--gap", "0.6em");
							div.c("flex v-center gap", () => {
								face("bot", "AI");
								face("mate", "AK");
								a.c("figma-ai-icon-btn").href("#").append(() => icon("north_east"));
							}).style("--gap", "0.3em");
						});
					}});

					this.message({ who: "You", time: "10:44", body: () => {
						p("Create the follow-up and improve the guard so the signal is checked before scheduling.");
					}});

					this.message({ ai: true, time: "10:42", body: () => {
						div.c("flex v-center split", () => {
							p.c("figma-ai-strong", "Ready for review");
							span.c("figma-ai-tests-pass h4", "Tests pass");
						});
						this.code_block();
						p.c("muted", "Cancellation now exits before the timer is registered. The original retry task remains unchanged outside this worktree.");
						div.c("figma-ai-action-row flex gap", $row => {
							// Capture the returned button VIEW and call `.ac()` on it
							// directly (review finding 6) — reliable regardless of how
							// `click()`'s own callback `this` binding works.
							const pick = (label, glyph, extra) => {
								const $btn = action_btn(label, glyph, extra);
								$btn.click(() => {
									$row.el.querySelectorAll(".figma-ai-action").forEach(b => b.classList.remove("chosen"));
									$btn.ac("chosen");
								});
							};

							pick("Reject", "close", "figma-ai-action-reject");
							pick("Improve", "auto_fix_high");
							pick("Approve", "check", "figma-ai-action-approve");
						}).style("--gap", "0.5em");
					}});
				});

				div.c("figma-ai-conv-footer", () => this.composer(
					"Ask about this task, request a revision, or dictate feedback…",
					text => this.$messages.append(() => this.message({ who: "You", time: "now", body: () => p(text) }))
				));
			});

		}); }).style("--scale-width", "53.5");

		highlight(this.el);
	}
}
