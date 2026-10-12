import { Page, View, div, p, button } from "/app.js";

View.stylesheet(import.meta, "features.css");

const PRIME25 = "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff";

export default new Page({
	meta: import.meta,
	title: "Feature Cards & Lists",
	icon: "view_agenda",
	width: "full",
	description: "Feature cards and lists on each of the three approved bases.",
	content() {
		div.c("fea-card", () => {
			// Header
			div.c("fea-header", () => {
				p.c("fea-title", "FEATURE CARDS & LISTS").style("color", "rgba(0,0,0,.8)");
				p.c("fea-tagline", "Building blocks demonstrated across all three approved bases.").style("color", "rgba(0,0,0,.8)");
			});

			// Row 1: Feature Cards (White | Dark | Prime)
			div.c("fea-row", () => {
				// White Card
				div.c("fea-feature-card fea-white", () => {
					// Eyebrow
					div.c("fea-eyebrow", () => {
						div.c("fea-dot").style("background", "#72c4ff");
						p.c("fea-eyebrow-text", "FEATURE · WHITE").style("color", "#72c4ff");
					});

					// Title
					p.c("fea-card-title", "Adaptive Tokens").style("color", "rgba(0,0,0,.8)");

					// Body
					p.c("fea-card-body", "Colors shift with context. One variable, many expressions.").style("color", "rgba(0,0,0,.55)");

					// Divider
					div.c("fea-divider");

					// Button
					button.c("fea-button", "LEARN MORE").style("color", "#fff");
				}).style("background", "#fff").style("border", "1px solid rgba(0,0,0,.1)");

				// Dark Card
				div.c("fea-feature-card fea-dark", () => {
					// Eyebrow
					div.c("fea-eyebrow", () => {
						div.c("fea-dot").style("background", "#72c4ff");
						p.c("fea-eyebrow-text", "FEATURE · DARK").style("color", "#72c4ff");
					});

					// Title
					p.c("fea-card-title", "Adaptive Tokens").style("color", "#fff");

					// Body
					p.c("fea-card-body", "Colors shift with context. One variable, many expressions.").style("color", "rgba(255,255,255,.7)");

					// Divider
					div.c("fea-divider");

					// Button
					button.c("fea-button", "LEARN MORE").style("color", "#fff");
				}).style("background", "#675f56");

				// Prime Card
				div.c("fea-feature-card fea-prime", () => {
					// Eyebrow
					div.c("fea-eyebrow", () => {
						div.c("fea-dot").style("background", "#fff");
						p.c("fea-eyebrow-text", "FEATURE · PRIME").style("color", "#fff");
					});

					// Title
					p.c("fea-card-title", "Adaptive Tokens").style("color", "#fff");

					// Body
					p.c("fea-card-body", "Colors shift with context. One variable, many expressions.").style("color", "#fff");

					// Divider
					div.c("fea-divider");

					// Button
					button.c("fea-button", "LEARN MORE").style("color", "#fff");
				}).style("background", PRIME25);
			});

			// Row 2: List Panels (Features | Steps | Features Dark)
			div.c("fea-row", () => {
				// FEATURES List
				div.c("fea-list-panel fea-white", () => {
					p.c("fea-list-heading", "FEATURES").style("color", "rgba(0,0,0,.8)");

					div.c("fea-list-items", () => {
						["Adaptive color schemes", "Three explicit solid bases", "Variable-bound tokens", "Approved tint stacks only"].forEach(item => {
							div.c("fea-list-row", () => {
								p.c("fea-marker", "●").style("color", "rgba(0,0,0,.8)");
								p.c("fea-list-text", item).style("color", "rgba(0,0,0,.8)");
							});
						});
					});
				}).style("background", "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff");

				// STEPS List
				div.c("fea-list-panel fea-white", () => {
					p.c("fea-list-heading", "STEPS").style("color", "rgba(0,0,0,.8)");

					div.c("fea-list-items", () => {
						["Pick an approved solid base", "Apply only approved tint insets", "Bind variables to layers", "Switch base — everything follows"].forEach((item, idx) => {
							div.c("fea-list-row", () => {
								p.c("fea-marker", String(idx + 1)).style("color", "rgba(0,0,0,.8)");
								p.c("fea-list-text", item).style("color", "rgba(0,0,0,.8)");
							});
						});
					});
				}).style("background", "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff");

				// FEATURES DARK List
				div.c("fea-list-panel fea-dark", () => {
					p.c("fea-list-heading", "FEATURES · DARK").style("color", "#72c4ff");

					div.c("fea-list-items", () => {
						const darkItems = [
							{ marker: "●", text: "Adaptive color schemes", textColor: "#fff" },
							{ marker: "●", text: "Three explicit solid bases", textColor: "#fff" },
							{ marker: "●", text: "Approved tint stacks only", textColor: "rgba(255,255,255,.7)" },
							{ marker: "PRIME LABEL ON DARK", text: "PRIME LABEL ON DARK", textColor: "#72c4ff", isPrime: true },
						];
						darkItems.forEach((item, idx) => {
							div.c("fea-list-row", () => {
								if (item.isPrime) {
																		p.c("fea-list-text fea-prime-text", item.text).style("color", "#72c4ff");
								} else {
									p.c("fea-marker", item.marker).style("color", "#72c4ff");
									p.c("fea-list-text", item.text).style("color", item.textColor);
								}
							});
						});
					});
				}).style("background", "#675f56");
			});
		});
	},
});
