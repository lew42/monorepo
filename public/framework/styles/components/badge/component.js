import { div, span } from "/app.js";
import { pill } from "../parts.js";

const dot = { width: "0.5em", height: "0.5em", borderRadius: "999px", background: "var(--prim)" };

export default () => div.c("flex wrap v-center", () => {
	span.c("h4", "default").style(pill);
	span.c("h4", "accent").style({ ...pill, background: "var(--prim)", color: "white" });
	span.c("h4", "dark").style({ ...pill, background: "var(--bg)", color: "white" });
	span.c("h4", "outline").style({ ...pill, background: "none", border: "1px solid var(--line)" });

	span.c("h4 flex v-center", () => {
		span().style(dot);
		span("live");
	}).style({ ...pill, gap: "0.4em" });

	span.c("h4", "7").style({ ...pill, background: "var(--prim)", color: "white", padding: "0.15em 0.5em" });
}).style("gap", "0.4em");
