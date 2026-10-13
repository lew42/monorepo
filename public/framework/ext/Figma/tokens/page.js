import { Page, View, div, p, h3, h4, button } from "/app.js";
View.stylesheet(import.meta, "tokens.css");
View.stylesheet(import.meta, "page.css");

// The opt-in --fig-* tokens generated from the Figma variables; why: ../doc/token-sync.md
const schemes = [["fig-white", "White"], ["fig-gray", "Light gray"], ["fig-dark", "Dark"]];
const modes = [["fig-mobile", "Mobile"], ["fig-default", "Default"], ["fig-mega", "Mega"]];

function sample(scheme) {
	div.c(`fig-mobile ${scheme} fig-section fig-stack fig-tokens-phone`, () => {
		h3("Discard changes?");
		p.c("fig-muted", "Your edits to this card are not saved.");
		div.c("flex gap fig-tokens-bar", () => {
			button.c("fig-btn fig-btn-secondary", "Keep");
			button.c("fig-btn fig-btn-primary", "Discard");
		});
	});
}

export default new Page({
	meta: import.meta,
	title: "Figma tokens",
	icon: "tune",
	width: "full",
	description: "The Figma file's variables as opt-in --fig-* CSS: the same schemes, modes and spacing, coded.",
	content() {
		p("Generated from the Figma variables by FigmaTokens.mjs. Nothing else on the site loads it; a page opts in. The numbers and the plan: doc/token-sync.md.");
		h3("Schemes");
		div.c("grid auto gap", () => {
			for (const [cls, name] of schemes) div.c(`${cls} fig-card fig-stack`, () => {
				h4.c("fig-accent", name.toUpperCase());
				p("Primary text.");
				p.c("fig-muted", "Secondary text.");
				div.c("fig-inset fig-card", () => p("A 10% inset."));
			});
		});
		h3("Modes");
		div.c("grid auto gap", () => {
			for (const [cls, name] of modes) div.c(`${cls} fig-white fig-card fig-stack`, () => {
				h4.c("fig-accent", name.toUpperCase());
				p.c("fig-muted", "Card padding, gap and radius from this mode.");
			});
		});
		h3("A Figma sample, coded (DS · 2.1 Buttons → Button bar)");
		div.c("flex wrap gap", () => { sample("fig-white"); sample("fig-dark"); });
	},
});
