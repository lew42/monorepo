import { Page, p, h4, div, demo } from "/app.js";

// The four grounds: an empty class name means "the default" (plain `.card`).
const GROUNDS = [
	{ cls: "",          name: "Default",    token: "var(--surface)" },
	{ cls: "card-gray", name: "Light gray", token: "var(--darken-1)" },
	{ cls: "card-dark", name: "Dark",       token: "var(--bg)" },
	{ cls: "card-prim", name: "Strong hue", token: "var(--prim)" },
];

export default new Page({
	meta: import.meta,
	title: "Grounds",
	description: "Four backgrounds a card can sit on — default, light gray, dark, and the primary hue — and what happens when one sits on another.",
	icon: "palette",

	content(){
		p("Four grounds, reusing framework.css's own tokens — nothing here is a new colour. \"Dark\" and \"strong hue\" each force a `color-scheme` (the same one-line mechanism `styles/sections/tone.js` already uses for a full band): every token underneath flips, so the text stays readable without picking a special colour for it — \"Dark\" flips to `color-scheme: dark` (a dark ground wants light ink), and \"strong hue\" flips to `color-scheme: light` instead, because light ink on this particular orange reads too faint (dark ink measures far better there). `card.css` has the four class names.");

		h4("Each ground, on its own");
		demo(() => {
			div.c("grid auto gap", () => GROUNDS.forEach(g =>
				div.c(`card ${g.cls}`.trim(), () => {
					h4(g.name);
					p(g.token);
				})));
		}, "The four, side by side — reload this page in dark mode too; nothing here is hand-tinted for either mode.");

		h4("Each ground, ON each ground");
		p("A plain default card loses all contrast sitting on another plain default card — so a `.card` directly inside a `.card` switches its OWN ground automatically (default ↔ light gray), the same rule `ux/Content`'s icon cards already use for exactly this. A dark or strong-hue card already reads against anything, so those two are left alone when nested.");
		demo(() => {
			div.c("grid auto gap", () => GROUNDS.forEach(outer =>
				div.c(`card ${outer.cls}`.trim(), () => {
					h4(outer.name + ", holding:");
					div.c("card", () => p("a plain .card — no ground class of its own"));
				})));
		}, "Every outer ground, each holding a PLAIN nested card — watch it switch to stay readable, never invisible.");
	},
});
