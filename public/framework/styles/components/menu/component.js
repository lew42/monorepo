import { View, details, summary, div, a, span, icon } from "/app.js";

/* The dropdown needs a stylesheet for tooltip's exact reason: the panel is
 * positioned against its summary (a relationship) and appears on open (a state),
 * and an inline style can say neither. Everything else is `.btn` and utilities. */
View.stylesheet(import.meta, "menu.css");

export const menu = (label, items) => details.c("menu", $menu => {
	// `.btn flex v-center`: the button look is rung 3, and display:flex is also
	// what removes the UA's disclosure triangle — one class doing both jobs.
	summary.c("btn flex v-center", () => {
		span(label);
		icon("arrow_drop_down");
	}).style("gap", "0.15em");

	div.c("menu-list flex v", () => items.forEach(item =>
		a.c("menu-item", item).href("#")
			.click(() => $menu.el.removeAttribute("open"))));
});

export default () => div.c("flex gap v-center wrap", () => {
	menu("Actions", ["Rename", "Duplicate", "Move to…", "Delete"]);
	menu("View", ["Compact", "Comfortable", "Spacious"]);
});
