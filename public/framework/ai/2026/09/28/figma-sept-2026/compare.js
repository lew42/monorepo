import { div, span, img } from "/app.js";

// Shared "Figma" comparison block — a small label and the reference screenshot,
// below the live recreation. Every card in this group used to build this same
// three-line block itself (review finding 8); this is the one copy.
//
// No stylesheet of its own: it is three lines of the site's own utility classes
// (`flex v gap`) plus one inline style, the same shape every card already used
// for it — nothing here needs a class that could collide with another card's.
export function compare(url, alt){
	div.c("flex v gap", () => {
		span.c("h4 muted", "Figma");
		img().attr("src", url).attr("alt", alt).style({ maxWidth: "100%", borderRadius: "var(--radius)" });
	}).style({ "--gap": "calc(var(--gap) * 0.3)", marginTop: "1em" });
}
