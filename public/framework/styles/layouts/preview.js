import { View, div, span } from "/app.js";

/* css: .preview */
View.stylesheet(import.meta, "layouts.css");

/* preview(name, classes, regions, column) — the SHAPE of a layout and nothing
 * else.
 *
 *     preview("A fixed rail, a fluid rest", "flex gap", ["basis", "flex-1"]);
 *     preview("A strip of tiles", "grid gap auto", n(8), "2.5em");
 *
 * `regions` is one class per box ("" for a plain one), so the picture is built
 * out of the same words you would type. Nothing is coloured and nothing has
 * content: the arrangement is the subject, and anything else is something to
 * look past.
 *
 * `column` is the shape's own `--column`, scaled to a preview — the frame is a
 * few em wide, so the real `14em` would make every wall one column. It is an
 * argument rather than a `.style()` on the way out because the box declares it,
 * and a declaration on the box beats anything the caller inherits down.
 *
 * The class string is the `title`, not a caption. A wall of class strings is
 * what this section used to lead with, and it read as a reference rather than a
 * menu.
 */
export default function preview(name, classes, regions, column = "4em"){
	return div.c("flex v gap").style("--gap", "0.45em").append(() => {

		div.c("pad surface").style("--pad", "0.8em").append(() =>
			div.c("preview " + classes)
				.style({ height: "7em", "--column": column, "--gap": "0.5em", "--pad": "0.9em 1.4em" })
				.append(() => regions.forEach(region => div.c("pad wash").ac(region))));

		span.c("h4 muted", name).attr("title", label(classes, regions));
	});
}

const label = (classes, regions) => regions.filter(Boolean).length
	? `${classes} › ${[...new Set(regions.filter(Boolean))].join(" + ")}`
	: classes;

export { preview };
