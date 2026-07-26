import { Page2, p, div } from "/app.js";

// three labelled boxes, reused across every demo
function boxes(n = 3){
	for (let i = 1; i <= n; i++)
		div(String(i));
}

// a demo row: a monospace label + a bordered box running the classes
function demo(classes, n){
	div.c("demo-label", "." + classes.split(" ").join(" ."));
	div.c("demo " + classes, () => boxes(n));
}

export default new Page2({
	meta: import.meta,
	title: "Flex",
	description: "flex and its modifiers: wrap, auto, three, v, split, centering.",
	content(){
		p("`.flex` is the workhorse. Add modifiers to change direction, wrapping, distribution and alignment. All from `framework.css`, no new CSS here.");

		demo("flex gap", 3);
		demo("flex gap all-1", 3);       // every child flex:1 — equal widths
		demo("flex gap auto", 5);        // children flex 1 1 var(--column), wrap
		demo("flex gap three", 3);       // 3-up until too narrow, then stack
		demo("flex gap split", 2);       // space-between
		demo("flex gap v-center", 3);    // vertical centering
		demo("flex gap reverse", 3);     // row-reverse
		demo("flex gap v", 3);           // column direction

		p("Because these are just classes, the exact same `.flex.gap.auto` reflows correctly whether it's the full page width or squeezed into a card:");

		div.c("card", () => {
			div.c("demo-label", ".flex .gap .auto (inside a narrow card)");
			div.c("demo flex gap auto", () => boxes(5));
		});
	}
});
