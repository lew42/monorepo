import { Page, View, div, p, button } from "/app.js";
View.stylesheet(import.meta, "../../scheme.css");

View.stylesheet(import.meta, "features.css");

function featureCard(label, ground) {
	div.c(`card fea-feature-card ${ground}`.trim(), () => {
		div.c("flex gap v-center", () => {
			div.c("fea-dot");
			p.c("h4 fea-accent", `FEATURE · ${label}`);
		});
		p.c("h2", "Adaptive Tokens");
		p.c("muted", "Colors shift with context. One variable, many expressions.");
		div.c("fea-divider bg-darken");
		button.c("prim fea-button", "LEARN MORE");
	});
}

function listPanel(heading, items, ground = "") {
	div.c(`card ${ground}`.trim(), () => {
		p.c("h4", heading);
		div.c("flex v gap", () => {
			items.forEach(item => {
				div.c("flex gap v-center", () => {
					if (item.prime) {
						p.c("h4 fea-accent", item.text);
					} else {
						p.c("h4 fea-accent fea-marker", item.marker);
						p.c("flex-1", item.text);
					}
				});
			});
		});
	});
}

export default new Page({
	meta: import.meta,
	classes: "figma-scheme",
	title: "Feature Cards & Lists",
	icon: "view_agenda",
	width: "full",
	description: "Feature cards and lists on each of the three approved bases.",
	content() {
		div.c("card fea-page", () => {
			// Header
			div.c("fea-header", () => {
				p.c("h1", "FEATURE CARDS & LISTS");
				p.c("muted", "Building blocks demonstrated across all three approved bases.");
			});

			// Row 1: Feature Cards (White | Dark | Prime)
			div.c("grid auto gap", () => {
				featureCard("WHITE", "");
				featureCard("DARK", "bg-dark");
				featureCard("PRIME", "bg-prime");
			});

			// Row 2: List Panels (Features | Steps | Features Dark)
			div.c("grid auto gap", () => {
				listPanel("FEATURES", ["Adaptive color schemes", "Three explicit solid bases", "Variable-bound tokens", "Approved tint stacks only"].map(t => ({ marker: "●", text: t })));
				listPanel("STEPS", ["Pick an approved solid base", "Apply only approved tint insets", "Bind variables to layers", "Switch base — everything follows"].map((t, i) => ({ marker: String(i + 1), text: t })));
				listPanel("FEATURES · DARK", [
					{ marker: "●", text: "Adaptive color schemes" },
					{ marker: "●", text: "Three explicit solid bases" },
					{ marker: "●", text: "Approved tint stacks only" },
					{ marker: "PRIME LABEL ON DARK", text: "PRIME LABEL ON DARK", prime: true },
				], "bg-dark");
			});
		});
	},
});
