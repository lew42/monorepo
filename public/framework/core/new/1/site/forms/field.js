import { div, label, input, textarea } from "/app.js";

/* A labelled control, and nothing else.
 *
 * Returns the CONTROL, not the wrapper — every caller wants `.el.value`, and
 * `$note.el.value` beats `$note.control.el.value` thirty times over. The wrapper
 * is captured on the way past, so placement still reads normally.
 *
 * `name` becomes both the HTML name and a class, so the property that holds it
 * and the selector that finds it are the same word: `this.$essay` is
 * `.forms-input.essay`. That is what makes these measurable from outside.
 *
 * No look. A form that looked designed would have proven something about CSS.
 */
export function field(text, { name, type = "text", rows, value = "" } = {}){
	let control;

	div.c("forms-field", () => {
		label.c("forms-label", text);

		control = rows
			? textarea.c("forms-input " + name).attr("rows", rows)
			: input.c("forms-input " + name).attr("type", type);

		control.attr("name", name);

		/* `.el.value`, not `.attr("value")` and not `.text(value)` — the attribute
		 * is the DEFAULT value, and every measurement in this section is about the
		 * LIVE one. That is why this line stays even though the bug it once dodged
		 * is gone: View.text()/html()/html_unsafe() used to fall into their getter
		 * branch when the value was unchanged, so `.text("")` on an empty textarea
		 * returned a string and the next chained call threw. Fixed in core. */
		control.el.value = value;
	});

	return control;
}

export default field;
