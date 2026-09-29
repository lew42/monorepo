import { Doc, md, div, p, button } from "/app.js";
import classify, { STYLES } from "./Classify.js";

export default new Doc({
	meta: import.meta,
	title: "Classify",
	description: "A light overlay that outlines a container's columns and names the CSS classes that build them.",
	icon: "grid_view",
	files: "Classify.js Classify.css page.js readme.md",

	content(){
		md("Press **Alt+L** on any page to classify every layout on it. Four outline styles, pick one:");

		div.c("flex wrap gap", () => {
			for (const [name, line] of Object.entries(STYLES)){
				div.c("card flex v gap", () => {
					const box = div.c("flex gap classify-sample", () => {
						for (const w of ["one", "two", "three"]) div.c("card", w).style("flex", "1");
					});
					box.el.dataset.sample = name;
					md(`**${name}** — ${line}`);
					button("Use this style").on("click", () => classify.style(name));
				}).style("flex", "1 1 16em");
			}
		});

		// Each sample gets its own tiny overlay by drawing inside its own layer copy.
		setTimeout(() => {
			document.querySelectorAll(".classify-sample").forEach(s => classify(s));
		}, 50);
	},
});
