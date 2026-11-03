import { Page, View, div, p, h1, h2, h3, h4, a } from "/app.js";
View.stylesheet(import.meta, "../../scheme.css");

View.stylesheet(import.meta, "typography.css");

const bases = [
	{ ground: "bg-white", chip: "WHITE", links: 3, inset: false },
	{ ground: "bg-prime", chip: "PRIME", links: 0, inset: true },
	{ ground: "bg-dark", chip: "DARK", links: 2, inset: false },
];

// The six type styles, in order: h1..h4, body, muted body, accent.
function Specimen() {
	h1("Heading One");
	h2("Heading Two");
	h3("Heading Three");
	h4("Heading Four");
	p("Body text uses the scheme's primary text token. Adapts automatically to each approved base.");
	p.c("muted", "Muted body text for secondary information and supporting copy.");
	p.c("typ-accent", "PRIME ACCENT TEXT");
}

export default new Page({
	meta: import.meta,
	classes: "figma-scheme",
	title: "Typography",
	icon: "text_fields",
	width: "full",
	description: "The six type styles on the three approved bases.",
	content() {
		div.c("card bleed typ-card", () => {
			div.c("typ-header", () => {
				h1("TYPOGRAPHY");
				p.c("muted", "All six styles. Three bases. No exceptions.");
			});

			div.c("grid auto gap typ-columns", () => {
				bases.forEach(base => {
					div.c(`card ${base.ground} typ-column`, () => {
						h4.c("bg-darken typ-chip", base.chip);
						Specimen();

						if (base.inset) {
							div.c("darken-2 typ-inset", () => {
								h4("16% INSET");
								p("Primary only inside the darker inset on prime.");
							});
						}

						if (base.links) {
							div.c("typ-links", () => {
								["Learn more", "Documentation", "Get started"].slice(0, base.links).forEach(text => {
									a.c("typ-link", text);
								});
							});
						}
					});
				});
			});
		});
	},
});
