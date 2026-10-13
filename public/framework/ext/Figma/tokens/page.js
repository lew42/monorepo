import { Page, View, div, p, h3, h4, button, span, input, details, summary } from "/app.js";
View.stylesheet(import.meta, "tokens.css");
View.stylesheet(import.meta, "page.css");

// Material Symbols Rounded for .fig-icon (the site itself loads Material Icons; same ligature names)
if (!document.querySelector("meta[name=fig-symbols]")) document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:FILL@0..1" }), Object.assign(document.createElement("meta"), { name: "fig-symbols" }));

// The opt-in --fig-* tokens generated from the Figma variables; why: ../doc/token-sync.md
const schemes = [["fig-white", "White"], ["fig-gray", "Light gray"], ["fig-dark", "Dark"]];
const dom = (view, props) => (Object.assign(view.el, props), view);   // DOM properties (checked, open) that attributes cannot set
const icon = (name, size = 24) => span.c(`fig-icon fig-icon-${size}`, name);
const toggle = (label, on, dis) => div.c("fig-toggle", () => { span(label); dom(input().attr("type", "checkbox"), { checked: !!on, disabled: !!dis }); });
const check = (label, on, mixed) => div.c("fig-check", () => { dom(input().attr("type", "checkbox"), { checked: !!on, indeterminate: !!mixed }); span(label); });
const radio = (label, on, name) => div.c("fig-radio", () => { dom(input().attr("type", "radio").attr("name", name), { checked: !!on }); span(label); });
const select = (value, rows, open) => {
	const d = details.c("fig-select", () => {
	summary(span(value));
	div.c("fig-select-panel", () => rows.forEach(r => div.c("fig-select-row", () => { span(r); if (r === value) icon("check", 20); }).attr("aria-selected", r === value)));
});
	dom(d, { open: !!open });
	return d;
};
let uid = 0;
function controls(scheme) {
	div.c(`${scheme} fig-card fig-stack fig-controls-box`, () => {
		h4.c("fig-accent", scheme.replace("fig-", "").toUpperCase());
		toggle("Notifications", true); toggle("Dark mode", false); toggle("Disabled", true, true);
		check("Checked", true); check("Unchecked", false); check("Indeterminate", false, true);
		const g = "r" + uid++;
		radio("Monthly", true, g); radio("Yearly", false, g);
		div.c("flex gap", () => [16, 20, 24, 32, 48].forEach(n => icon("settings", n)));
		select("Country", ["Country", "Canada", "Mexico", "United States"]);
	});
}
function settings(scheme) {
	div.c(`fig-mobile ${scheme} fig-section fig-stack fig-tokens-phone`, () => {
		h3("Settings");
		toggle("Push notifications", true); toggle("Email digest", false); toggle("Location", true);
		div.c("fig-select-label fig-muted", "Language");
		select("English", ["English", "Español", "Français"]);
		check("Remember me", true);
		const g = "p" + uid++;
		radio("Free", false, g); radio("Plus", true, g);
	});
}
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
		h3("A Figma sample, coded (DS Â· 2.1 Buttons â†’ Button bar)");
		div.c("flex wrap gap", () => { sample("fig-white"); sample("fig-dark"); });
		h3("Controls (DS 2.6 dropdowns, 2.7 toggles, 1.1 icons)");
		p("Toggle, checkbox and radio are native inputs; the select is a details element; icons are Material Symbols Rounded. Opt-in classes: fig-toggle, fig-check, fig-radio, fig-select, fig-icon-16 to fig-icon-48. Details: doc/controls.md.");
		div.c("grid auto gap", () => schemes.forEach(([cls]) => controls(cls)));
		h3("Open dropdown");
		div.c("flex wrap gap", () => schemes.forEach(([cls]) => div.c(`${cls} fig-card fig-controls-box fig-controls-open`, () => select("Canada", ["Country", "Canada", "Mexico", "United States"], true))));
		h3("The settings screen (DS 2.7, In action)");
		div.c("flex wrap gap", () => schemes.forEach(([cls]) => settings(cls)));
	},
});
