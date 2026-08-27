import { Page, md, h2, demo, div, form, fieldset, legend, label, input, select, option, textarea, button } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Forms",
	description: "Inputs, selects, textareas, and the button classes.",
	icon: "edit_note",

	content(){

		demo(() => {
			div.c("flex gap", () => {
				button("Plain");
				button.c("prim", "Primary");
				button.c("bg", "Background");
			});
		}, "`button` and `.btn` are padded with a pointer cursor. `.prim` is the accent colour, `.bg` the dark background. `.btn` lets any element — an `a`, say — look like a button.");

		h2("A whole form");

		demo(() => {
			form(() => {
				fieldset(() => {
					legend("Sign up");

					label("Name").attr("for", "signup-name");
					input().attr("id", "signup-name").attr("type", "text").attr("placeholder", "Peter Parker");

					label("Role").attr("for", "signup-role").style("display", "block").style("margin-top", "0.75em");
					select(() => {
						option("Newbie");
						option("Pro");
					}).attr("id", "signup-role");

					label("About").attr("for", "signup-about").style("display", "block").style("margin-top", "0.75em");
					textarea.c("auto").attr("id", "signup-about").attr("placeholder", "A few words...");

					div.c("flex gap", () => {
						button.c("prim", "Submit");
						button("Cancel");
					}).style("margin-top", "1em");
				});
			});
		}, "Wrap fields in a `fieldset` for a grouped, bordered block. Inputs, selects and textareas fill the width automatically.");

		h2("Auto-growing textarea");

		md("`textarea.c(\"auto\")` grows to fit its content as you type — that is the About field above.");

		md("Next: [Flex](/alex/styles/flex/) — arranging what you just built.");
	},
});
