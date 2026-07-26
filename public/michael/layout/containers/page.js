import { Page2, p, div, style, code } from "/app.js";

// inject the demo's @container rules once (idempotent across re-renders)
let injected = false;
function inject(){
	if (injected) return;
	injected = true;
	style(`
		.cq-card { display: flex; flex-direction: column; gap: 1em;
		           border: 1px solid rgba(0,0,0,0.15); border-radius: 0.5em; padding: 1em; }
		.cq-card .cq-media { flex: 0 0 auto; background: var(--prim); color: #fff;
		                     padding: 2em; border-radius: 0.3em; text-align: center; }
		.cq-card .cq-body { flex: 1; }
		/* col is the container name set on .col-body in Page2.css */
		@container col (min-width: 34em) {
			.cq-card { flex-direction: row; align-items: center; }
			.cq-card .cq-media { flex-basis: 12em; }
		}
	`);
}

export default new Page2({
	meta: import.meta,
	title: "Containers",
	description: "Container queries — respond to the parent's width, not the viewport.",
	content(){
		inject();

		p("Media queries ask how wide the *screen* is. Container queries ask how wide the *parent* is — so one component adapts anywhere you drop it. Each column body here is a query container (`container-type: inline-size; container-name: col` in `Page2.css`).");

		p("The card below is `flex-direction: column` until its container passes `34em`, then it becomes a row. The proof: this exact card looks different in the wide column vs. the narrow one beside it, at the same instant — because it reads its container, not the window.");

		div.c("cq-card", () => {
			div.c("cq-media", "media");
			div.c("cq-body", () => {
				p("Resize the window, or open this page's siblings so it shares space with a narrow column. When the column crosses 34em, the layout flips — no window media query involved.");
			});
		});

		p("The rule that does it:");

		div.c("card", () => {
			code("@container col (min-width: 34em) { .cq-card { flex-direction: row } }");
		});
	}
});
