import { Page, div, p, h2 } from "/app.js";
import { View } from "../../core/View/View.js";
import { usage_rail } from "../AITask/usage.js";
import UsagePace from "./UsagePace.js";

View.stylesheet(import.meta, "usage.css");

/* The existing meter, then three pace-relative variants of the SAME limits, so you compare them on one screen. Doc: readme.md. */
export default class UsagePage extends Page {
	static DATA = new URL("../usage.json", import.meta.url);

	content(){
		const $box = div.c("block wide");   // captured now, filled after the fetch (no DOM after an await)
		fetch(UsagePage.DATA).then(r => r.json()).catch(() => null).then(u => $box.append(() => {
			const limits = u?.utilization?.limits;
			if (!limits?.length) return p("No usage.json yet.");
			const nums = limits.map(l => UsagePace.of(l));
			h2("Today's meter (unchanged)");
			p("The bar is spend; the ▼ is the clock. Early in a window the bar is a few pixels wide, so being ahead or behind is hard to see.");
			usage_rail(u);
			h2("A. Used ÷ pace");
			p("The bar is how far ahead of the clock you are. The line in the middle is on pace; empty is idle, full is double pace.");
			div.c("up-set", () => nums.forEach(n => UsagePace.ratio(n)));
			h2("B. The gap from pace");
			p("The bar grows left of the line when you are under pace and right of it when you are over. Its scale zooms to the gap, so a small gap is still visible.");
			div.c("up-set", () => nums.forEach(n => UsagePace.gap(n)));
			h2("C. One word");
			p("No bar, only the answer.");
			div.c("up-set", () => nums.forEach(n => UsagePace.chip(n)));
		}));
	}
}
