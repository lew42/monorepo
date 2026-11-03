import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "UI",
	description: "Buttons, toolbars, dropdowns, icons: states and targets.",
	icon: "smart_button",

	content(){
		md("**UI is everything the reader presses.** The built components live at [/framework/ui/](/framework/ui/); this page is the rules for using them.");
		md("- The glyph is always `icon(\"name\")` — fixed-width, 1em square.\n- Buttons: `.ui-icon-btn` flush or `.ui-icon-btn-bg` backed; toggle state is `aria-pressed`.\n- A widget keeps its core row on one line at every width; extras go on a line underneath.\n- A mode button shows its current mode on its own face, never a separate label.");
		md("Full rules: [doc/rules.md](/framework/design/ui/doc/rules.md).");
		md.details(import.meta, "readme.md", "Readme");
	},
});
