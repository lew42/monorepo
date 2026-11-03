import { View, div, h4, input, textarea, button } from "/app.js";
import { compare } from "../compare.js";

View.stylesheet(import.meta, "view.css");

/* Figma "Form Elements" section (metadata.xml, frame 43:12819): one rounded
 * darken panel holding an eyebrow label, three stacked fields — a text input,
 * an email input, a message textarea — and a two-button row (Submit /
 * Cancel). Every control is the site's own <input>/<textarea>/<button>;
 * view.css only adds the panel's own padding and the tight label/field
 * spacing and small uppercase buttons Figma draws, which framework.css's
 * general-purpose rhythm does not give for free. "Submit" and "Cancel" work
 * locally — a status line and a real reset — but nothing persists.
 *
 * `classify()` (core/View/View.js) already stamps this instance's own
 * element with `.figma-form-elements` from the class name — view.css hangs
 * off that directly (its name already carries this card's `figma-form-`
 * prefix), so render() only adds `darken-2` for the panel fill (measured
 * against the Figma png: its panel is ~14% black on white, which
 * `darken-2`'s 16% is closer to than `darken-1`'s 8%). */
export default class FigmaFormElementsView extends View {

	render(){
		this.ac("darken-2");

		h4("Form Elements").ac("figma-form-chip").style("color", "var(--prim)");

		this.name_input = this.field("Full Name", () => input().attr("type", "text").attr("value", "Jane Cooper"));
		this.email_input = this.field("Email", () => input().attr("type", "email").attr("placeholder", "you@example.com"));
		this.message_input = this.field("Message", () => textarea().attr("placeholder", "Tell us about your project...").attr("rows", "3"));

		div.c("figma-form-actions", () => {
			button.c("prim", "Submit").click(() => this.submit());
			button("Cancel").click(() => this.reset());
		});

		this.$status = div.c("h4 muted figma-form-status", "");

		compare(new URL("figma.png", import.meta.url).href, "Figma: Form Elements section");
	}

	// One label above one control — the shape ui/field's own template uses,
	// just without the wrapping <label> (three separate fields, not one).
	field(text, build){
		var made;
		div.c("figma-form-field", () => { h4.c("figma-form-field-label muted", text); made = build(); });
		return made;
	}

	submit(){
		const name = this.name_input.el.value.trim() || "(no name)";
		this.$status.text(`Submitted — ${name}. This demo does not save anything.`);
	}

	reset(){
		this.name_input.el.value = "Jane Cooper";
		this.email_input.el.value = "";
		this.message_input.el.value = "";
		this.$status.text("");
	}
}
