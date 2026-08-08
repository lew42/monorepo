import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Styles",
	description: "The opt-in CSS: html reset, forms, flex, grid, and BEM naming.",
	icon: "palette",

	children: "html forms flex grid bem",

	nav: {
		html:  { label: "HTML",  icon: "html" },
		forms: { label: "Forms", icon: "edit_note" },
		flex:  { label: "Flex",  icon: "view_column" },
		grid:  { label: "Grid",  icon: "grid_view" },
		bem:   { label: "BEM",   icon: "style" },
	},

	content(){
		md("`framework.css` is deliberately small. It sets sensible defaults for raw HTML, then hands you a few opt-in utility classes.");

		md("Everything below is a layer you can reach for, each with live examples you can open and inspect:");

		this.previews();

		md("Write as little CSS as possible. Climb the ladder and **stop at the first rung that works**: nothing → a utility class → an existing component's class → your module's own stylesheet.");
	},
});
