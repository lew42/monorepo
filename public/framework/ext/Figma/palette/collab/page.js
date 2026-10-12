import { Page, View, div, p } from "/app.js";

View.stylesheet(import.meta, "collab.css");

const PRIME25 = "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff";
const WHITE10 = "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff";
const INK = "rgba(0,0,0,.8)";
const SOFT = "rgba(0,0,0,.55)";
const LINE = "rgba(0,0,0,.1)";

// Pill: padding 4px 8px, radius 999, label text, align-self flex-start, width fit-content
function Pill(text, bgGradient, textColor) {
	p.c("col-pill", text)
		.style("background", bgGradient)
		.style("color", textColor)
		.style("align-self", "flex-start")
		.style("width", "fit-content");
}

// Soft button: padding, radius, bg WHITE10, label ink, hug
function SoftButton(text, padding = "6px 9px", radius = "5px") {
	div.c("col-soft-btn", () => {
		p.c("col-label", text).style("color", INK);
	})
		.style("padding", padding)
		.style("border-radius", radius)
		.style("background", WHITE10)
		.style("align-self", "flex-start")
		.style("width", "fit-content");
}

// Prime button: same shape, bg PRIME25, label white
function PrimeButton(text, padding = "8px 12px", radius = "4px") {
	div.c("col-prime-btn", () => {
		p.c("col-label", text).style("color", "#fff");
	})
		.style("padding", padding)
		.style("border-radius", radius)
		.style("background", PRIME25)
		.style("align-self", "flex-start")
		.style("width", "fit-content");
}

// Composer: bg #fff, border 1px #72c4ff, radius 8, padding 12, flex column, gap 10, full width
function Composer() {
	div.c("col-composer", () => {
		p.c("col-body", "Ask about this task, request a revision, or dictate feedback…").style("color", INK);
		div.c("col-composer-footer", () => {
			SoftButton("dictate", "6px 8px", "4px");
			div.c("col-send-btn", () => {
				p.c("col-label", "↑").style("color", "#fff");
			});
		});
	});
}

// Avatar: 30x30 round, label text centred
function Avatar(text, bgGradient, textColor) {
	div.c("col-avatar", text)
		.style("background", bgGradient)
		.style("color", textColor);
}

export default new Page({
	meta: import.meta,
	title: "AI Collaboration",
	icon: "forum",
	width: "full",
	description: "Compact footer, expanded composer and a full review conversation.",
	content() {
		div.c("col-card", () => {
			// Header
			div.c("col-header", () => {
				p.c("col-title", "AI COLLABORATION").style("color", INK);
				p.c("col-tagline", "Compact footer, expanded composer, and full review conversation.").style("color", INK);
			});

			// Row 1: Compact footer + Expanded composer
			div.c("col-row", () => {
				// Left column: Compact footer
				div.c("col-col-left", () => {
					p.c("col-label", "COMPACT FOOTER").style("color", INK);
					div.c("col-footer-card", () => {
						// Top part
						div.c("col-footer-top", () => {
							Pill("IN REVIEW", PRIME25, "#fff");
							p.c("col-body", "Review retry policy for background jobs").style("color", INK);
							p.c("col-body", "infra/retries#61af").style("color", SOFT);
						});
						// Bottom bar
						div.c("col-footer-bar", () => {
							SoftButton("ask ai", "6px 9px", "5px");
							p.c("col-label", "⋯").style("color", SOFT);
						});
					});
				});

				// Right column: Expanded composer
				div.c("col-col-right", () => {
					p.c("col-label", "EXPANDED COMPOSER").style("color", INK);
					Composer();
				});
			});

			// Row 2: Conversation panel
			div.c("col-conv-panel", () => {
				// Header
				div.c("col-conv-header", () => {
					p.c("col-label", "✦").style("color", "#72c4ff");
					p.c("col-label", "Release readiness").style("color", INK);
				});

				// Messages area
				div.c("col-messages", () => {
					// Message 1: AI
					div.c("col-msg-row", () => {
						Avatar("✦", WHITE10, INK);
						div.c("col-bubble", () => {
							div.c("col-msg-header", () => {
								p.c("col-label", "AI").style("color", INK);
								p.c("col-body", "10:42").style("color", SOFT);
							});
							p.c("col-body", "Before I begin: should retries stop after three attempts, or inherit the workspace maximum?").style("color", INK);
							div.c("col-actions", () => {
								SoftButton("cancel", "8px 12px", "4px");
								PrimeButton("begin", "8px 12px", "4px");
							});
						})
							.style("background", WHITE10)
							.style("border", "none");
					});

					// Message 2: You
					div.c("col-msg-row", () => {
						Avatar("YOU", PRIME25, "#fff");
						div.c("col-bubble", () => {
							div.c("col-msg-header", () => {
								p.c("col-label", "You").style("color", INK);
								p.c("col-body", "10:44").style("color", SOFT);
							});
							p.c("col-body", "Cap this path at three attempts, preserve cancellation, and keep the workspace default everywhere else.").style("color", INK);
							div.c("col-code-block", () => {
								div.c("col-code-header", () => {
									p.c("col-label", "TYPESCRIPT").style("color", INK);
									p.c("col-label", "Copy").style("color", INK);
								});
								div.c("col-code-area", () => {
									p.c("col-body", "const retries = Math.min(config.retries ?? 3, 5)").style("color", INK);
									p.c("col-body", "return withBackoff(runTask, { retries, signal })").style("color", INK);
								});
							});
						})
							.style("background", "#fff")
							.style("border", "1px solid #72c4ff");
					});

					// Message 3: AI
					div.c("col-msg-row", () => {
						Avatar("✦", WHITE10, INK);
						div.c("col-bubble", () => {
							div.c("col-msg-header", () => {
								p.c("col-label", "AI").style("color", INK);
								p.c("col-body", "10:42").style("color", SOFT);
							});
							div.c("col-result-header", () => {
								p.c("col-body", "Ready for review").style("color", INK);
								Pill("TESTS PASS", PRIME25, "#fff");
							});
							p.c("col-body", "Cancellation now exits before the timer is registered. The original retry task remains unchanged outside this worktree.").style("color", SOFT);
							div.c("col-actions", () => {
								SoftButton("improve", "8px 12px", "4px");
								PrimeButton("approve", "8px 12px", "4px");
							});
						})
							.style("background", WHITE10)
							.style("border", "none");
					});
				});

				// Footer
				div.c("col-conv-footer", () => {
					Composer();
				});
			});
		});
	},
});
