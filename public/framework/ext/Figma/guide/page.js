import { Page, View, div, p, h1, h2, h3, h4, a, pre } from "/app.js";
View.stylesheet(import.meta, "guide.css");

// Coded from the Sept-2026 "Claude test page", frame v2 (131:1062); the recipe is ../doc/use-figma.md.
const nav = [
	["The tool", [["use_figma", "../doc/use-figma.md"], ["Observations", "../doc/observations.md"], ["Capture", "../doc/capture.md"]]],
	["The tokens", [["Color schemes", "../colors/"], ["The palette", "../palette/"], ["Typography", "../palette/typography/"]]],
	["The layout", [["This guide", "./"], ["Auto layout", "../autolayout/"]]],
];

const steps = [
	["1 · Inspect", "Read the file first", "getLocalVariableCollectionsAsync()\ngetLocalTextStylesAsync()"],
	["2 · Bind", "Tokens, never hex", "setBoundVariableForPaint(p, \"color\", prime)\nf.setBoundVariable(\"itemSpacing\", gap)"],
	["3 · Mode", "A frame picks a mode", "setExplicitVariableModeForCollection(\n  Text, \"Dark BG\")   // or Resolution, \"Mega\""],
	["4 · Compose", "Auto layout, FILL after append", "f = figma.createAutoLayout(\"VERTICAL\")\nparent.appendChild(f)\nf.layoutSizingHorizontal = \"FILL\""],
];

// The three approved bases; each inset is one `.card` step (styles/doc/architecture.md).
const stacks = [
	["White", "bg-white", [["card", "↳ Inset"]]],
	["Prime", "bg-prime", [["card", "↳ Inset"]]],
	["Dark", "bg-dark", [["card", "↳ Darker inset"], ["card bg-lighten", "↳ Lighter inset"], ["card darken-3", "↳ Deep panel"]]],
];

const findings = [
	["Text modes flip ink", "Set Dark BG on a dark frame and every text/muted fill inside turns white."],
	["Mega is the 3440 mode", "Resolution Mega: pads 56/64, gap 32, section pad 80, h1 64."],
	["The code style is broken", "It uses Consolas, which Figma lacks; code there is Cousine Bold."],
	["3440×1440 is wide, not tall", "Stacked content overflowed the screen; side by side, it fits."],
];

export default new Page({
	meta: import.meta,
	title: "Figma guide",
	icon: "draw",
	width: "full",
	description: "How Claude draws in Figma with use_figma, coded from the 3440-wide design it drew.",
	content() {
		div.c("flex auto bleed fgd-layout", () => {
			div.c("bg-dark pad flex v gap fgd-side", () => {
				h3("lew42 · Figma");
				for (const [title, links] of nav) div.c("flex v fgd-nav", () => {
					h4.c("fgd-prime", title);
					for (const [label, href] of links) a.c(href === "./" ? "fgd-active" : "fgd-link", label).href(href);
				});
			});

			div.c("bg-white pad flex v gap fgd-doc", () => {
				h4.c("fgd-prime", "Figma MCP · Claude test page");
				h1("How Claude draws in Figma");
				p.c("muted", "One tool, use_figma, runs a JavaScript plugin script inside the Figma file. Every colour, size and gap in the design is a variable or text style from the file, not a typed number.");
				div.c("grid gap fgd-steps", () => {
					for (const [k, title, code] of steps) div.c("card flex v", () => {
						h4(k);
						h3(title);
						pre.c("bg-dark fgd-code", code);
					});
				});
			});

			div.c("bg-white pad flex v gap fgd-spec", () => {
				h4("The approved stacks");
				h2("Three bases and their insets");
				div.c("flex auto gap", () => {
					for (const [name, ground, insets] of stacks) div.c(`${ground} fgd-stack`, () => {
						div.c("pad", () => { h2(name); p("Primary text."); p.c("muted", "Secondary text."); });
						for (const [cls, label] of insets) div.c(`${cls} fgd-inset`, () => { h4(label); p("Primary text."); });
					});
				});
			});

			div.c("bg-dark pad flex v gap fgd-rail", () => {
				div.c("card bg-lighten", () => {
					h4.c("fgd-prime", "Text styles");
					h1("h1"); h2("h2"); h3("h3"); p("body");
				});
				h4.c("fgd-prime", "Findings");
				for (const [title, text] of findings) div.c("card bg-lighten", () => { h4(title); p.c("muted", text); });
			});
		});
	},
});
