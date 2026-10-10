import { Page, View, div, p, h1, h2, h4, md } from "/app.js";

View.stylesheet(import.meta, "palette.css");

const description = "Three solid bases with approved tints and their text layers.";

const columnSpecs = [
	{
		name: "white",
		baseLabel: "WHITE BASE",
		baseTitle: "White",
		baseBodies: [
			{ text: "Primary text on white.", color: "rgba(0,0,0,.8)" },
			{ text: "Secondary text on white.", color: "rgba(0,0,0,.55)" },
		],
		finalLabel: "PRIME TEXT ON WHITE",
		insets: [
			{
				bg: "rgba(0,0,0,.1)",
				label: "↳ 10% BLACK INSET",
				bodies: [
					{ text: "Primary text on 10% black inset.", color: "rgba(0,0,0,.8)" },
					{ text: "Secondary text on inset.", color: "rgba(0,0,0,.55)" },
				],
			},
		],
	},
	{
		name: "prime",
		baseLabel: "PRIME BASE",
		baseTitle: "Prime",
		baseBodies: [
			{ text: "Primary text on the approved prime tint.", color: "#fff" },
		],
		insets: [
			{
				bg: "rgba(0,0,0,.25)",
				label: "↳ 25% BLACK INSET",
				bodies: [{ text: "Primary text on 25% black inset.", color: "#fff" }],
			},
		],
	},
	{
		name: "dark",
		baseLabel: "DARK BASE",
		baseTitle: "Dark",
		baseBodies: [
			{ text: "Primary text on dark brown.", color: "#fff" },
			{ text: "Secondary text on dark brown.", color: "rgba(255,255,255,.7)" },
		],
		finalLabel: "PRIME TEXT ON DARK",
		insets: [
			{
				bg: "rgba(0,0,0,.1)",
				label: "↳ 10% BLACK INSET",
				bodies: [
					{ text: "Primary on 10% black inset.", color: "#fff" },
					{ text: "Secondary on 10% black inset.", color: "rgba(255,255,255,.7)" },
				],
			},
			{
				bg: "rgba(255,255,255,.1)",
				label: "↳ 10% WHITE INSET",
				bodies: [
					{ text: "Primary on 10% white inset.", color: "#fff" },
					{ text: "Secondary on 10% white inset.", color: "rgba(255,255,255,.7)" },
				],
			},
			{
				bg: "rgba(0,0,0,.5)",
				label: "↳ 50% BLACK PANEL",
				bodies: [
					{ text: "Primary text on 50% black panel.", color: "#fff" },
					{ text: "Secondary text on 50% black panel.", color: "rgba(255,255,255,.7)" },
				],
				nested: {
					bg: "rgba(255,255,255,.1)",
					label: "↳↳ 10% WHITE NESTED",
					bodies: [
						{ text: "Primary in nested 10% white.", color: "#fff" },
						{ text: "Secondary in nested 10% white.", color: "rgba(255,255,255,.7)" },
					],
				},
			},
		],
	},
];

export default new Page({
	meta: import.meta,
	title: "The Approved Schemes",
	icon: "palette",
	width: "full",
	description,
	content() {
		div.c("pal-card", () => {
			div.c("pal-header", () => {
				div.c("pal-square");
				h1("THE PALETTE");
				p.c("pal-tagline", "Three solid bases. A fixed set of approved tints. Every stack is explicit.");
			});
			div.c("pal-columns", () => {
				columnSpecs.forEach(spec => {
					div.c(`pal-column pal-${spec.name}`, () => {
						// Base block
						div.c("pal-block", () => {
							h4.c("pal-label", spec.baseLabel);
							h2.c("pal-title", spec.baseTitle);
							spec.baseBodies.forEach(({ text, color }) => {
								p.c("pal-body", text).style("color", color);
							});
							if (spec.finalLabel) {
								h4.c("pal-label", spec.finalLabel);
							}
						});
						// Inset blocks
						spec.insets.forEach(inset => {
							div.c("pal-inset", () => {
								h4.c("pal-label", inset.label);
								inset.bodies.forEach(({ text, color }) => {
									p.c("pal-body", text).style("color", color);
								});
								if (inset.nested) {
									div.c("pal-nested", () => {
										h4.c("pal-label", inset.nested.label);
										inset.nested.bodies.forEach(({ text, color }) => {
											p.c("pal-body", text).style("color", color);
										});
									}).style("background", inset.nested.bg);
								}
							}).style("background", inset.bg);
						});
					});
				});
			});
		});
	},
});
