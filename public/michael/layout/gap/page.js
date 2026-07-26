import { Page2, p, div } from "/app.js";

function boxes(n = 4){
	for (let i = 1; i <= n; i++)
		div(String(i));
}

export default new Page2({
	meta: import.meta,
	title: "Gap",
	description: "gap and gap-2em — spacing without margins.",
	content(){
		p("`gap` adds `1em` of space between flex/grid children — no margin hacks, no `:last-child` exceptions. `gap-2em` doubles it.");

		div.c("demo-label", ".flex (no gap)");
		div.c("demo flex", () => boxes());

		div.c("demo-label", ".flex .gap");
		div.c("demo flex gap", () => boxes());

		div.c("demo-label", ".flex .gap-2em");
		div.c("demo flex gap-2em", () => boxes());

		p("`gap` works identically on grid:");

		div.c("demo-label", ".grid .auto .gap");
		div.c("demo grid auto gap", () => boxes(6));
	}
});
