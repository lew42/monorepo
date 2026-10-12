import { Page, View, div, p, h1, h2, h4 } from "/app.js";
View.stylesheet(import.meta, "../scheme.css");

View.stylesheet(import.meta, "palette.css");

const description = "Three solid bases with approved tints and their text layers.";

/* Figma Sept-2026, Page 7, frame "The Palette" (115:2340) picked the alpha by hand at
   every level (10/25/50% black or white). Our system has one step rule instead —
   `.card` inside `.card` is one notch darker, `bg-lighten`/`darken-3` the two other
   moves you reach for on purpose (styles/doc/architecture.md §1, §3) — so every inset
   below is a class, never a literal rgba. */
const columnSpecs = [
	{
		name: "white", ground: "bg-white",
		label: "WHITE BASE", title: "White",
		bodies: ["Primary text on white.", "Secondary text on white."],
		insets: [
			{ cls: "card", label: "↳ Nested card, one step darker",
				bodies: ["Primary text on the inset.", "Secondary text on the inset."] },
		],
	},
	{
		name: "prime", ground: "bg-prime",
		label: "PRIME BASE", title: "Prime",
		bodies: ["Primary text on the approved prime tint."],
		insets: [
			{ cls: "card", label: "↳ Nested card, one step darker",
				bodies: ["Primary text on the inset."] },
		],
	},
	{
		name: "dark", ground: "bg-dark",
		label: "DARK BASE", title: "Dark",
		bodies: ["Primary text on dark.", "Secondary text on dark."],
		insets: [
			{ cls: "card", label: "↳ Nested card, one step darker",
				bodies: ["Primary on the inset.", "Secondary on the inset."] },
			{ cls: "card bg-lighten", label: "↳ Nested card, one step lighter",
				bodies: ["Primary on the inset.", "Secondary on the inset."] },
			{ cls: "card darken-3", label: "↳ A deeper step, taken on purpose",
				bodies: ["Primary text on the panel.", "Secondary text on the panel."],
				nested: {
					cls: "card bg-lighten", label: "↳↳ Lighter again, nested inside that",
					bodies: ["Primary, nested lighter.", "Secondary, nested lighter."],
				},
			},
		],
	},
];

const body = (text, i) => i ? p.c("muted", text) : p(text);
const prime_line = ground => ground === "bg-prime" ? null : p.c("fs-prime-text", `Prime text on ${ground === "bg-dark" ? "dark" : "white"}`);

function inset(spec){
	div.c(spec.cls, () => {
		h4.c("muted", spec.label);
		spec.bodies.forEach(body);
		if (spec.nested) inset(spec.nested);
	});
}

export default new Page({
	meta: import.meta,
	classes: "figma-scheme",
	title: "The Approved Schemes",
	icon: "palette",
	width: "full",
	children: "typography controls features pricing tasks timeline collab hero",
	description,
	content() {
		div.c("card wide", () => {
			div.c("flex v gap v-center", () => {
				div.c("pal-square");
				h1("THE PALETTE");
				p("Three solid bases. A fixed set of approved tints. Every stack is explicit.");
			});
			div.c("grid gap auto", () => {
				columnSpecs.forEach(spec => {
					div.c(`card ${spec.ground}`, () => {
						h4.c("muted", spec.label);
						h2(spec.title);
						spec.bodies.forEach(body);
						prime_line(spec.ground);
						spec.insets.forEach(inset);
					});
				});
			}).style("--column", "16em");
		});
	},
});
