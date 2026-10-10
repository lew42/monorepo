import { Page, View, div, p, h1, h4, button, input, textarea } from "/app.js";

View.stylesheet(import.meta, "controls.css");

const PRIME25 = "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff";

export default new Page({
	meta: import.meta,
	title: "Controls",
	icon: "toggle_on",
	width: "full",
	description: "Forms, buttons, toggles, chips, badges and progress bars on each base.",
	content() {
		div.c("ctl-card", () => {
			div.c("ctl-header", () => {
				h1("CONTROLS");
				p.c("ctl-tagline", "Forms, buttons, toggles, chips, badges — each base demonstrated.");
			});

			// Row 1: Form White | Toggles/Chips/Badges (Prime bg) | Form Dark
			div.c("ctl-row", () => {
				// Column 1: Form White
				div.c("ctl-column ctl-white", () => {
					p.c("ctl-title", "Form - White").style("color", "#72c4ff");

					// Full Name field
					div.c("ctl-field", () => {
						p.c("ctl-label", "FULL NAME").style("color", "rgba(0,0,0,.8)");
						input.c("ctl-input").style("background", "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff").style("color", "rgba(0,0,0,.8)").style("border", "1px solid rgba(0,0,0,.1)").attr("value", "Jane Cooper");
					});

					// Email field
					div.c("ctl-field", () => {
						p.c("ctl-label", "EMAIL").style("color", "rgba(0,0,0,.8)");
						input.c("ctl-input").style("background", "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff").style("color", "rgba(0,0,0,.55)").style("border", "1px solid rgba(0,0,0,.1)").attr("placeholder", "you@example.com");
					});

					// Message field
					div.c("ctl-field", () => {
						p.c("ctl-label", "MESSAGE").style("color", "rgba(0,0,0,.8)");
						textarea.c("ctl-input").style("background", "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff").style("color", "rgba(0,0,0,.55)").style("border", "1px solid rgba(0,0,0,.1)").style("min-height", "80px").attr("placeholder", "Tell us about your project...");
					});

					// Buttons
					div.c("ctl-button-row", () => {
						button.c("ctl-button ctl-submit", "SUBMIT").style("background", PRIME25).style("color", "#fff");
						button.c("ctl-button ctl-cancel", "CANCEL").style("background", "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff").style("color", "rgba(0,0,0,.8)").style("border", "1px solid rgba(0,0,0,.1)");
					});
				}).style("background", "#fff").style("border", "1px solid rgba(0,0,0,.1)");

				// Column 2: Toggles/Chips/Badges on Prime
				div.c("ctl-column ctl-prime", () => {
					// Toggles
					p.c("ctl-label", "TOGGLES · WHITE").style("color", "rgba(0,0,0,.8)");
					[
						{ label: "Dark mode", checked: false },
						{ label: "Notifications", checked: true },
						{ label: "Auto-save", checked: false },
					].forEach(toggle => {
						div.c("ctl-toggle-row", () => {
							div.c("ctl-switch " + (toggle.checked ? "ctl-on" : "ctl-off")).style("width", "44px").style("height", "24px");
							p.c("ctl-toggle-label", toggle.label).style("color", "rgba(0,0,0,.8)");
						});
					});

					// Chips
					p.c("ctl-label", "TAGS & CHIPS").style("color", "rgba(0,0,0,.8)");
					div.c("ctl-chips", () => {
						["Design", "Tokens", "Variables", "Themes", "Adaptive"].forEach((chip, idx) => {
							const isPrime = [0, 2, 4].includes(idx);
							p.c("ctl-chip", chip).style("background", isPrime ? PRIME25 : "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff").style("color", isPrime ? "#fff" : "rgba(0,0,0,.8)").style("border", isPrime ? "none" : "1px solid rgba(0,0,0,.1)");
						});
					});

					// Badges
					p.c("ctl-label", "BADGES & COUNTERS").style("color", "#72c4ff");
					div.c("ctl-badges", () => {
						[
							{ label: "Inbox", count: "12" },
							{ label: "Updates", count: "3" },
							{ label: "Tasks", count: "28" },
						].forEach(badge => {
							div.c("ctl-badge", () => {
								p.c("ctl-badge-label", badge.label).style("color", "rgba(0,0,0,.8)");
								div.c("ctl-counter", badge.count).style("background", PRIME25).style("color", "#fff");
							}).style("background", "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff").style("border", "1px solid rgba(0,0,0,.1)");
						});
					});
				}).style("background", "#72c4ff");

				// Column 3: Form Dark
				div.c("ctl-column ctl-dark", () => {
					p.c("ctl-label", "FORM · DARK").style("color", "#72c4ff");

					div.c("ctl-field", () => {
						p.c("ctl-label", "FULL NAME").style("color", "#fff");
						input.c("ctl-input").style("background", "linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.1)), #675f56").style("color", "#fff").style("border", "1px solid rgba(255,255,255,.1)").attr("value", "Jane Cooper");
					});

					div.c("ctl-field", () => {
						p.c("ctl-label", "EMAIL").style("color", "#fff");
						input.c("ctl-input").style("background", "linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.1)), #675f56").style("color", "rgba(255,255,255,.7)").style("border", "1px solid rgba(255,255,255,.1)").attr("placeholder", "you@example.com");
					});

					div.c("ctl-field", () => {
						p.c("ctl-label", "MESSAGE").style("color", "#fff");
						textarea.c("ctl-input").style("background", "linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.1)), #675f56").style("color", "rgba(255,255,255,.7)").style("border", "1px solid rgba(255,255,255,.1)").style("min-height", "80px").attr("placeholder", "Tell us about your project...");
					});

					div.c("ctl-button-row", () => {
						button.c("ctl-button ctl-submit", "SUBMIT").style("background", PRIME25).style("color", "#fff");
						button.c("ctl-button ctl-cancel", "CANCEL").style("background", "rgba(255,255,255,.1)").style("color", "#fff").style("border", "1px solid rgba(255,255,255,.1)");
					});
				}).style("background", "#675f56");
			});

			// Row 2: Progress bars on White | Dark | Prime
			div.c("ctl-row", () => {
				[
					{ bg: "#fff", bgBorder: "1px solid rgba(0,0,0,.1)", label: "PROGRESS · WHITE", labelColor: "#72c4ff", textColor: "rgba(0,0,0,.8)", trackBg: "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff", fillBg: PRIME25 },
					{ bg: "#675f56", bgBorder: "none", label: "PROGRESS · DARK", labelColor: "#72c4ff", textColor: "#fff", trackBg: "linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.1)), #675f56", fillBg: PRIME25 },
					{ bg: PRIME25, bgBorder: "none", label: "PROGRESS · PRIME", labelColor: "#fff", textColor: "#fff", trackBg: "#72c4ff", fillBg: "#fff" },
				].forEach(prog => {
					div.c("ctl-column ctl-progress", () => {
						p.c("ctl-label", prog.label).style("color", prog.labelColor);

						[
							{ name: "Upload", pct: 72 },
							{ name: "Processing", pct: 45 },
						].forEach(item => {
							div.c("ctl-progress-item", () => {
								div.c("ctl-progress-header", () => {
									p.c("ctl-progress-name", item.name).style("color", prog.textColor);
									p.c("ctl-progress-pct", `${item.pct}%`).style("color", prog.textColor);
								});
								div.c("ctl-progress-track", () => {
									div.c("ctl-progress-fill").style("width", `${item.pct}%`).style("background", prog.fillBg);
								}).style("background", prog.trackBg);
							});
						});
					}).style("background", prog.bg).style("border", prog.bgBorder);
				});
			});
		});
	},
});
