import { md } from "/app.js";
import { PagingNavSub } from "../../screen.js";

export default new PagingNavSub({
	meta: import.meta,
	title: "Activity",
	icon: "timeline",
	description: "A deliberately long panel.",

	content(){
		md("**This panel is much longer than the other two, on purpose.** In a stack that sizes itself to its content, arriving here would have grown the box and moved everything under it. Here it does not: the box is the same rectangle it was, and the extra length simply scrolls inside it.");

		md("Scroll down, then click **Settings** in the rail and come back. The rail never moved while you did that.");

		for (let i = 1; i <= 14; i++)
			md(`**Entry ${i}** — a line of the log, so this panel is genuinely taller than the window and there is really something to scroll.`);
	},
});
