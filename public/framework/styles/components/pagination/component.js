import { div, a, span } from "/app.js";
import { surface, btn } from "../parts.js";

const chip = { ...surface, ...btn };

const numbers = ["1", "2", "3", "…", "12"];
const current = "2";

export default () => div.c("flex wrap v-center", () => {
	a.c("btn", "‹ Prev").href("#").style(chip);

	numbers.forEach(n => n === "…"
		? span(n).style("color", "var(--subtle)")
		// `.prim` brings its own fill and a white label, so the current page takes
		// nothing from `chip` but the missing underline.
		: a.c("btn", n).ac(n === current && "prim").href("#")
			.style(n === current ? { textDecoration: "none" } : chip));

	a.c("btn", "Next ›").href("#").style(chip);
}).style("gap", "0.3em");
