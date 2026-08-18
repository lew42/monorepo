import { View, div } from "/app.js";

/* css: .preview */
View.stylesheet(import.meta, "layouts.css");

/* shape(classes, regions, column) — the ARRANGEMENT and nothing else: a frame, one
 * washed box per region, no content. This is what a layout word's card shows
 * (`word.js`), and what `preview()` below puts a name under.
 *
 *     shape("flex gap", ["basis", "flex-1"]);
 *     shape("grid gap auto", n(8), "2.5em");
 *
 * `regions` is one class per box ("" for a plain one), so the picture is built out
 * of the same words you would type.
 *
 * `column` is the shape's own `--column`, scaled to a THUMB — the frame is a few em
 * wide, so the real `14em` would make every wall one column. It is an argument
 * rather than a `.style()` on the way out because the box declares it, and a
 * declaration on the box beats anything the caller inherits down.
 */
export function shape(classes, regions, column = "4em"){
	return div.c("preview " + classes)
		.style({ height: "7em", "--column": column, "--gap": "0.5em", "--pad": "0.9em 1.4em" })
		.append(() => regions.forEach(region => div.c("pad wash").ac(region)));
}

export default shape;
