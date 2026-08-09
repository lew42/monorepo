import { div, code, md } from "/app.js";

const template = (parent, kids) => `div.c("${parent}", () => {\n`
	+ kids.map(kid => (kid ? `    div.c("${kid}", "…");\n` : `    div("…");\n`)).join("")
	+ `});`;

/* variant(parent, kids, note) — one class string, printed as a copy-paste
 * template and rendered live from the same two arguments, so the code and the
 * result cannot disagree.
 *
 *     variant("flex gap wrap", ["basis", "flex-1"], "A rail beside the reading.")
 *
 * Every rendered box also wears `pad wash` so you can see it. That is the only
 * difference between the template and what you are looking at.
 */
export default function variant(parent, kids, note){
	return div.c("pad flex v gap surface").style({ "--gap": "0.6em", "--pad": "0.9em" }).append(() => {
		code.js(template(parent, kids));

		div.c(parent).style("--pad", "0.5em").append(() =>
			kids.forEach(kid => div.c("pad wash " + kid, kid || "box")));

		if (note) md(note);
	});
}

export { variant };
