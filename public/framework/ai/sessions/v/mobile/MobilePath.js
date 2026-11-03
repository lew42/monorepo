import { Page } from "/app.js";
import MobileHome from "./MobileHome.js";

/* `2026/` and `2026/10/` are not pages, only the way to `2026/10/22/`: each step hands on to the next, the third is the day list. */
export default class MobilePath extends Page {

	constructor(...args){ super({ title: "", width: "fill" }, ...args); }

	route(name){
		if (!/^\d{1,2}$/.test(name)) return;
		const segs = [...this.segs, name];
		return segs.length === 3 ? new MobileHome({ day: segs.join("/") }) : new MobilePath({ segs, home: this.home });
	}
}
