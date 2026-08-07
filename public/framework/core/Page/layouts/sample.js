import { div, a, span, icon } from "/app.js";

/* The preview markup Page.cards() emits, built by hand — so a demo can show the
 * arrangement without needing four real child pages per example. Class names must
 * track Page.css (`.page-preview*`), which is the cost of the hand-roll and the
 * reason there is exactly one copy of it. */
const card = (label, name, cls) =>
	a.c("page-preview").ac(cls).href("#").append(() => {
		if (name) icon(name);
		span.c("page-preview-title", label);
	});

export default {
	wall(){
		div.c("grid gap auto", () => {
			["Start", "Core", "Extensions", "Styles", "Utilities", "Dev server"]
				.forEach(t => card(t, "description"));
		});
	},

	dashboard(){
		div.c("grid gap auto", () => {
			card("Big — spans two by two", "dashboard", "big");
			card("Wide", "view_week", "wide");
			card("Ordinary", "description");
			card("Tall", "view_day", "tall");
			card("Ordinary", "description");
			card("Ordinary", "description");
		}).style("--column", "13em");
	},
};
