import { Page, View, div, p, h1, h2, h4, a } from "/app.js";

View.stylesheet(import.meta, "typography.css");

const description = "The six type styles on the three approved bases.";

const columnSpecs = [
	{
		name: "white",
		chipLabel: "WHITE",
		chipBg: "rgba(0,0,0,.1)",
		columnBg: "#fff",
		columnBorder: "1px solid rgba(0,0,0,.1)",
		textColor: "rgba(0,0,0,.8)",
		textColorMuted: "rgba(0,0,0,.55)",
		accentColor: "#72c4ff",
		items: [
			{ tag: "h1", text: "Heading One", size: 48, weight: 900, lh: "normal" },
			{ tag: "h2", text: "Heading Two", size: 36, weight: 700, lh: 1.5 },
			{ tag: "h3", text: "Heading Three", size: 24, weight: 600, lh: 1.4 },
			{ tag: "h4", text: "HEADING FOUR", size: 14, weight: 700, lh: 1.4, uppercase: true, ls: ".07em" },
			{ tag: "body", text: "Body text uses the scheme's primary text token. Adapts automatically to each approved base.", size: 16, weight: 500, lh: 1.8 },
			{ tag: "body-muted", text: "Muted body text for secondary information and supporting copy.", size: 16, weight: 500, lh: 1.8, muted: true },
			{ tag: "accent", text: "PRIME ACCENT TEXT", size: 14, weight: 700, lh: 1.4, uppercase: true, ls: ".07em", color: "#72c4ff" },
		],
		links: [
			{ text: "Learn more" },
			{ text: "Documentation" },
			{ text: "Get started" },
		],
	},
	{
		name: "prime",
		chipLabel: "PRIME",
		chipBg: "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff",
		columnBg: "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff",
		textColor: "#fff",
		textColorMuted: "#fff",
		accentColor: "#fff",
		items: [
			{ tag: "h1", text: "Heading One", size: 48, weight: 900, lh: "normal" },
			{ tag: "h2", text: "Heading Two", size: 36, weight: 700, lh: 1.5 },
			{ tag: "h3", text: "Heading Three", size: 24, weight: 600, lh: 1.4 },
			{ tag: "h4", text: "HEADING FOUR", size: 14, weight: 700, lh: 1.4, uppercase: true, ls: ".07em" },
			{ tag: "body", text: "Body text on prime blue. One approved text role on this base.", size: 16, weight: 500, lh: 1.8 },
		],
		inset: {
			bg: "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff",
			label: "25% INSET",
			body: "Primary only inside the 25% black inset on prime.",
		},
	},
	{
		name: "dark",
		chipLabel: "DARK",
		chipBg: "rgba(255,255,255,.1)",
		columnBg: "#675f56",
		columnBgChip: "#675f56",
		textColor: "#fff",
		textColorMuted: "rgba(255,255,255,.7)",
		accentColor: "#72c4ff",
		items: [
			{ tag: "h1", text: "Heading One", size: 48, weight: 900, lh: "normal" },
			{ tag: "h2", text: "Heading Two", size: 36, weight: 700, lh: 1.5 },
			{ tag: "h3", text: "Heading Three", size: 24, weight: 600, lh: 1.4 },
			{ tag: "h4", text: "HEADING FOUR", size: 14, weight: 700, lh: 1.4, uppercase: true, ls: ".07em" },
			{ tag: "body", text: "Primary body on dark brown.", size: 16, weight: 500, lh: 1.8 },
			{ tag: "body-muted", text: "Muted / secondary body on dark brown.", size: 16, weight: 500, lh: 1.8, muted: true },
			{ tag: "accent", text: "PRIME ACCENT ON DARK", size: 14, weight: 700, lh: 1.4, uppercase: true, ls: ".07em", color: "#72c4ff" },
		],
		links: [
			{ text: "Learn more" },
			{ text: "Documentation" },
		],
	},
];

export default new Page({
	meta: import.meta,
	title: "Typography",
	icon: "text_fields",
	width: "full",
	children: "controls",
	description,
	content() {
		div.c("typ-card", () => {
			div.c("typ-header", () => {
				h1("TYPOGRAPHY");
				p.c("typ-tagline", "All six styles. Three bases. No exceptions.");
			});
			div.c("typ-columns", () => {
				columnSpecs.forEach(spec => {
					div.c(`typ-column typ-${spec.name}`, () => {
						// Chip
						div.c("typ-chip", spec.chipLabel).style("background", spec.chipBg);

						// Items
						spec.items.forEach(item => {
							const color = item.color || (item.muted ? spec.textColorMuted : spec.textColor);
							const text = item.text;
							const el = p.c("typ-item", text).style("color", color);
							if (item.size) el.style("font-size", `${item.size}px`);
							if (item.weight) el.style("font-weight", item.weight);
							if (item.lh !== undefined) el.style("line-height", typeof item.lh === "number" ? item.lh : item.lh);
							if (item.uppercase) el.style("text-transform", "uppercase");
							if (item.ls) el.style("letter-spacing", item.ls);
						});

						// Inset (prime only)
						if (spec.inset) {
							div.c("typ-inset", () => {
								h4.c("typ-inset-label", spec.inset.label).style("color", spec.textColor);
								p.c("typ-inset-body", spec.inset.body).style("color", spec.textColor);
							}).style("background", spec.inset.bg);
						}

						// Links
						if (spec.links) {
							div.c("typ-links", () => {
								spec.links.forEach(link => {
									a.c("typ-link", link.text);
								});
							});
						}
					}).style("background", spec.columnBg).style("border", spec.columnBorder || "none");
				});
			});
		});
	},
});
