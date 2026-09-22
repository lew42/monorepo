import { div, h3, p } from "/app.js";

/* Live examples a card on the V3 board can show. A card names one:
     {"card": {"id": "…", "title": "…", "demo": "two_columns", "wide": true}}
   and the board runs it through `demo()`, which prints the function it ran — so the
   code on the screen IS the code that drew the example. Add one: export a function. */

export function two_columns(){
	div.c("v3-two", () => {
		div.c("card", () => { h3("Left");  p("The first column."); });
		div.c("card", () => { h3("Right"); p("The second column."); });
	});
}
