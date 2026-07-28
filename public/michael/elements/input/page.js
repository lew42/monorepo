import { Page, p, form, fieldset, legend, label, input, textarea, select, option, button } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Input",
	description: "Form controls — inputs, select, textarea, buttons.",
	content(){
		p("`framework.css` makes text inputs, selects and textareas full-width by default, with consistent padding and border. Checkboxes, radios and buttons stay intrinsic.");

		form(() => {
			fieldset(() => {
				legend("Sign up");

				p(() => { label("Name"); input().attr("type", "text").attr("placeholder", "full width by default"); });
				p(() => { label("Email"); input().attr("type", "email").attr("placeholder", "you@example.com"); });
				p(() => { label("Plan"); select(option("Free"), option("Pro"), option("Team")); });
				p(() => { label("Notes"); textarea().ac("auto").attr("placeholder", "textarea.auto grows with content"); });

				p(label(() => { input().attr("type", "checkbox"); }, " Subscribe to updates"));

				p(button.c("btn prim", "Submit").attr("type", "button"));
			});
		});
	}
});
