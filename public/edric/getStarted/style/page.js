import { Page, h2, md, a, div } from "/app.js";

const colors = {
	colors: "#5a57ff",
	typography: "#e8590c",
	layout: "#2f9e44",
	spacing: "#1971c2",
	forms: "#e64980",
	buttons: "#f08c00",
	media: "#ae3ec9",
	utilities: "#42404B",
};

export default new Page({
	meta: import.meta,
	title: "Style",
	description: "framework.css, grouped the way a style guide usually is.",

	children: "colors typography layout spacing forms buttons media utilities example css tailwind layouts",

	// Labels for the un-loaded (lazy) children — nav_for() falls back to the raw
	// name otherwise, and "colors" reads worse than "Colors".
	nav: {
		colors: "Colors", typography: "Typography", layout: "Layout", spacing: "Spacing",
		forms: "Forms", buttons: "Buttons", media: "Media", utilities: "Utilities",
		example: "Example", css: "Normal CSS", tailwind: "Tailwind", layouts: "Layouts",
	},

	// Same reasoning as framework/page.js: I'm nested under the sidebar's "Get
	// Started" dropdown, so landing here should force it open.
	activated(){
		this.app.$app.el.querySelector(".sidebar-group")?.setAttribute("open", "");
	},

	content(){
		div.c("flex gap wrap mb", () => {
			Object.keys(colors).forEach(name => {
				const nav = this.nav_for(name);
				a.c("btn", nav.label).href(nav.url).style({ background: colors[name], color: "white" });
			});
		});
		md("Everything above comes from `framework.css`, grouped the way a style guide usually is: colors, type, layout, spacing, forms, buttons, media, and a few small utilities.").ac("mb");

		h2("More ways to see it").ac("mb");
		md(`Or see them [${this.nav_for("example").label}](${this.nav_for("example").url}) all together in one card, [${this.nav_for("css").label}](${this.nav_for("css").url}) to write your own plain CSS instead, or [${this.nav_for("tailwind").label}](${this.nav_for("tailwind").url}) if you'd rather use that.`).ac("mb");

		md(`Categories are one class each. Whole-page arrangements, header/sidebar/main, a card wall, a split screen, live under [${this.nav_for("layouts").label}](${this.nav_for("layouts").url}).`).ac("mb");

		md("Next: [Custom Components](/edric/getStarted/components/), sixteen UI components, fourteen with no stylesheet at all.");
	}
});