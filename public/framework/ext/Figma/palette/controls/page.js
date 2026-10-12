import { Page, View, div, p, h1, h4, button, input, textarea } from "/app.js";

View.stylesheet(import.meta, "controls.css");

export default new Page({
	meta: import.meta,
	title: "Controls",
	icon: "toggle_on",
	width: "full",
	description: "Forms, buttons, toggles, chips, badges and progress bars on each base.",
	content() {
		div.c("ctl-page", () => {
			div.c("ctl-header", () => {
				h1("CONTROLS");
				p.c("muted", "Forms, buttons, toggles, chips, badges — each base demonstrated.");
			});

			// Row 1: Form White | Toggles/Chips/Badges (Prime bg) | Form Dark
			div.c("grid gap auto", () => {
				// Column 1: Form White
				div.c("card", () => {
					h4.c("ctl-column-title", "Form · White");

					[
						{ label: "FULL NAME", value: "Jane Cooper" },
						{ label: "EMAIL", placeholder: "you@example.com" },
					].forEach(field => {
						div.c("ctl-field", () => {
							h4(field.label);
							input.c("ctl-input").attr("value", field.value || "").attr("placeholder", field.placeholder || "");
						});
					});

					div.c("ctl-field", () => {
						h4("MESSAGE");
						textarea.c("ctl-input").attr("placeholder", "Tell us about your project...");
					});

					div.c("flex gap wrap", () => {
						button.c("prim", "SUBMIT");
						button("CANCEL");
					});
				});

				// Column 2: Toggles/Chips/Badges on Prime
				div.c("card bg-prime", () => {
					h4.c("muted", "TOGGLES");
					div.c("flex v gap", () => {
						[
							{ label: "Dark mode", checked: false },
							{ label: "Notifications", checked: true },
							{ label: "Auto-save", checked: false },
						].forEach(toggle => {
							div.c("flex gap v-center", () => {
								div.c("ctl-switch" + (toggle.checked ? " ctl-on" : ""));
								p(toggle.label);
							});
						});
					});

					h4.c("muted", "TAGS & CHIPS");
					div.c("flex wrap gap", () => {
						["Design", "Tokens", "Variables", "Themes", "Adaptive"].forEach((chip, idx) => {
							const accent = [0, 2, 4].includes(idx);
							p.c("ctl-chip " + (accent ? "bg-darken" : "bg-lighten"), chip);
						});
					});

					h4.c("muted", "BADGES & COUNTERS");
					div.c("flex wrap gap", () => {
						[
							{ label: "Inbox", count: "12" },
							{ label: "Updates", count: "3" },
							{ label: "Tasks", count: "28" },
						].forEach(badge => {
							div.c("ctl-badge bg-lighten", () => {
								p(badge.label);
								div.c("ctl-counter bg-darken", badge.count);
							});
						});
					});
				});

				// Column 3: Form Dark
				div.c("card bg-dark", () => {
					h4.c("ctl-column-title", "Form · Dark");

					[
						{ label: "FULL NAME", value: "Jane Cooper" },
						{ label: "EMAIL", placeholder: "you@example.com" },
					].forEach(field => {
						div.c("ctl-field", () => {
							h4(field.label);
							input.c("ctl-input").attr("value", field.value || "").attr("placeholder", field.placeholder || "");
						});
					});

					div.c("ctl-field", () => {
						h4("MESSAGE");
						textarea.c("ctl-input").attr("placeholder", "Tell us about your project...");
					});

					div.c("flex gap wrap", () => {
						button.c("prim", "SUBMIT");
						button("CANCEL");
					});
				});
			});

			// Row 2: Progress bars on White | Dark | Prime
			div.c("grid gap auto", () => {
				[
					{ ground: "", title: "Progress · White" },
					{ ground: "bg-dark", title: "Progress · Dark" },
					{ ground: "bg-prime", title: "Progress · Prime" },
				].forEach(col => {
					div.c(("card " + col.ground).trim(), () => {
						h4.c("ctl-column-title", col.title);

						[
							{ name: "Upload", pct: 72 },
							{ name: "Processing", pct: 45 },
						].forEach(item => {
							div.c("ctl-progress-item", () => {
								div.c("flex split", () => {
									h4(item.name);
									h4(`${item.pct}%`);
								});
								div.c("ctl-progress-track bg-darken", () => {
									div.c("ctl-progress-fill").style("width", `${item.pct}%`);
								});
							});
						});
					});
				});
			});
		});
	},
});
