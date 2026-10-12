import { Page, View, div, p, button } from "/app.js";

View.stylesheet(import.meta, "collab.css");

// Pill: a small accent badge
function Pill(text) {
	p.c("h4 bg-prime col-pill", text);
}

// Soft button: a low-emphasis control, one step down from its ground
function SoftButton(text) {
	button.c("bg-darken col-chip", text);
}

// Prime button: the one high-emphasis control
function PrimeButton(text) {
	button.c("prim col-chip", text);
}

// Composer: the text box the owner dictates or types into, plus its footer
function Composer() {
	div.c("card col-composer", () => {
		p("Ask about this task, request a revision, or dictate feedback…");
		div.c("flex split v-center", () => {
			SoftButton("dictate");
			button.c("prim col-send-btn", "↑");
		});
	});
}

// Avatar: a round initial, on whichever ground the message asks for
function Avatar(text, ground) {
	div.c(`col-avatar ${ground}`.trim(), text);
}

export default new Page({
	meta: import.meta,
	title: "AI Collaboration",
	icon: "forum",
	width: "full",
	description: "Compact footer, expanded composer and a full review conversation.",
	content() {
		div.c("card col-page", () => {
			// Header
			div.c("col-header", () => {
				p.c("h1", "AI COLLABORATION");
				p.c("muted", "Compact footer, expanded composer, and full review conversation.");
			});

			// Row 1: Compact footer + Expanded composer
			div.c("flex gap", () => {
				// Left column: Compact footer
				div.c("flex v gap col-col-left", () => {
					p.c("h4", "COMPACT FOOTER");
					div.c("card col-footer-card", () => {
						Pill("IN REVIEW");
						p("Review retry policy for background jobs");
						p.c("muted", "infra/retries#61af");
						div.c("flex split v-center", () => {
							SoftButton("ask ai");
							p.c("muted", "⋯");
						});
					});
				});

				// Right column: Expanded composer
				div.c("flex v gap flex-1", () => {
					p.c("h4", "EXPANDED COMPOSER");
					Composer();
				});
			});

			// Row 2: Conversation panel
			div.c("card col-conv-panel", () => {
				// Header
				div.c("flex gap v-center", () => {
					p.c("col-accent", "✦");
					p.c("h4", "Release readiness");
				});

				// Messages area
				div.c("flex v gap", () => {
					// Message 1: AI
					div.c("flex gap", () => {
						Avatar("✦", "bg-darken");
						div.c("card bg-darken col-bubble", () => {
							div.c("flex split", () => {
								p.c("h4", "AI");
								p.c("muted", "10:42");
							});
							p("Before I begin: should retries stop after three attempts, or inherit the workspace maximum?");
							div.c("flex gap col-actions", () => {
								SoftButton("cancel");
								PrimeButton("begin");
							});
						});
					});

					// Message 2: You
					div.c("flex gap", () => {
						Avatar("YOU", "bg-prime");
						div.c("card col-bubble col-bubble-you", () => {
							div.c("flex split", () => {
								p.c("h4", "You");
								p.c("muted", "10:44");
							});
							p("Cap this path at three attempts, preserve cancellation, and keep the workspace default everywhere else.");
							div.c("card col-code-block", () => {
								div.c("flex split v-center", () => {
									p.c("h4", "TYPESCRIPT");
									p.c("h4", "Copy");
								});
								p("const retries = Math.min(config.retries ?? 3, 5)");
								p("return withBackoff(runTask, { retries, signal })");
							});
						});
					});

					// Message 3: AI
					div.c("flex gap", () => {
						Avatar("✦", "bg-darken");
						div.c("card bg-darken col-bubble", () => {
							div.c("flex split", () => {
								p.c("h4", "AI");
								p.c("muted", "10:42");
							});
							div.c("flex split v-center", () => {
								p("Ready for review");
								Pill("TESTS PASS");
							});
							p.c("muted", "Cancellation now exits before the timer is registered. The original retry task remains unchanged outside this worktree.");
							div.c("flex gap col-actions", () => {
								SoftButton("improve");
								PrimeButton("approve");
							});
						});
					});
				});

				// Footer
				Composer();
			});
		});
	},
});
