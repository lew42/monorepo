import { Page, View, div, p, h3, h4, button, span, input, details, summary } from "/app.js";
import FigSelect from "./FigSelect.js";
FigSelect.install();
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

// DS 4.1 Foundational layouts: two uses of each, in two schemes; doc/layouts.md
const box = label => div.c("fig-media-box fig-muted", label);
const two = (a, b) => div.c("fig-stack", () => { h4(a); p.c("fig-muted", b); });
const layouts = [
	["Stack", "fig-white", () => div.c("fig-stack", () => { h4("Account"); p.c("fig-muted", "One column, the gap from the token."); button.c("fig-btn fig-btn-primary", "Save"); })],
	["Stack", "fig-dark", () => div.c("fig-stack", () => { h4("Welcome back"); p.c("fig-muted", "Pick up where you left off."); button.c("fig-btn fig-btn-secondary", "Continue"); })],
	["Two columns", "fig-white", () => div.c("fig-cols", () => { h4("Profile"); two("Name and photo", "Shown on your public page."); })],
	["Two columns", "fig-gray", () => div.c("fig-cols", () => { h4("Billing"); two("Plan and card", "Changes apply next cycle."); })],
	["Split 50/50", "fig-white", () => div.c("fig-split", () => { two("Before", "The old flow."); two("After", "The new flow."); })],
	["Split 50/50", "fig-dark", () => div.c("fig-split", () => { two("Monthly", "Pay as you go."); two("Yearly", "Two months free."); })],
	["Media + text", "fig-white", () => div.c("fig-media", () => { box("image"); two("Field notes", "A 160 px image, text beside it."); })],
	["Media + text", "fig-gray", () => div.c("fig-media fig-media-sm", () => { box("image"); two("Thumbnail row", "The 120 px image."); })],
	["Sidebar + content", "fig-white", () => div.c("fig-side", () => { div.c("fig-side-rail", () => ["Profile", "Notifications", "Billing"].forEach(t => button.c("fig-btn fig-btn-secondary", t))); two("Profile", "The 200 px rail becomes a top row on a phone."); })],
	["Sidebar + content", "fig-dark", () => div.c("fig-side", () => { div.c("fig-side-rail", () => ["Inbox", "Sent", "Drafts"].forEach(t => button.c("fig-btn fig-btn-secondary", t))); two("Inbox", "Mail with a folder rail."); })],
	["Three columns", "fig-white", () => div.c("fig-three", () => ["Free", "Plus", "Pro"].forEach(t => two(t, "Three equal columns.")))],
	["Three columns", "fig-gray", () => div.c("fig-three", () => ["Plan", "Build", "Ship"].forEach(t => two(t, "One step each.")))],
	["Header / body / footer", "fig-white", () => div.c("fig-bands", () => { h4.c("fig-head", "Header"); p.c("fig-body", "Full-width bands, no radius."); p.c("fig-foot fig-muted", "Footer"); })],
	["Header / body / footer", "fig-dark", () => div.c("fig-bands", () => { h4.c("fig-head", "Dashboard"); p.c("fig-body", "The body takes the rest."); p.c("fig-foot fig-muted", "Updated just now"); })],
];
function layoutsDemo() {
	for (const n of [...new Set(layouts.map(l => l[0]))]) {
		h4(n);
		div.c("flex wrap gap", () => layouts.filter(l => l[0] === n).forEach(([, scheme, build]) => div.c(`${scheme} fig-lay fig-layouts-box`, build)));
	}
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
		h3("Foundational layouts (DS 4.1)");
		p("Opt-in classes: fig-stack (reused), fig-cols, fig-split, fig-media, fig-side, fig-three, fig-bands. Each collapses to one column at 480 px of its own container. Details: doc/layouts.md.");
		layoutsDemo();
		h3("Layouts on a phone (390)");
		div.c("flex wrap gap", () => div.c("fig-white fig-lay fig-card fig-tokens-phone", () => div.c("fig-side", () => { div.c("fig-side-rail", () => ["Profile", "Billing"].forEach(t => button.c("fig-btn fig-btn-secondary", t))); div.c("fig-cols", () => { h4("Profile"); p.c("fig-muted", "Rail on top; label above content."); }); })));
		h3("The settings screen (DS 2.7, In action)");
		div.c("flex wrap gap", () => schemes.forEach(([cls]) => settings(cls)));
	},
});
