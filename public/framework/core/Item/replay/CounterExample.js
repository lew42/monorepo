import LabExample from "./LabExample.js";
import LabCounter from "./LabCounter.js";
import { div, span } from "../../View/View.js";

// Example 3: +1 in two tabs at the same moment.
export default class CounterExample extends LabExample {

	static id = "counter";
	static tab = "+1 from two tabs";
	static title = "A like button pressed in two tabs at once";
	static look = "Press **+1 in two tabs at once**, then **Reload the page**. Here the calls win.";
	static hint = "Both tabs show the same number and both add one, so the right answer goes up by 2.";
	static Class = LabCounter;
	static check_meant = true;
	static first(){ return { id: "likes", count: 0 }; }
	static buttons = [
		{ label: "+1", verb: "increment", meant: m => { m.count += 1; } },
		{ label: "+1 in two tabs at once", verb: "increment", both: true, two: true, meant: m => { m.count += 2; } },
	];
	static keys = [{ key: "count", label: "count", read: c => c.count }];

	draw(item){
		div.c("core-item-replay-card", () => div.c("core-item-replay-row", () => { span.c("core-item-replay-big", String(item.count)); span.c("muted", "likes"); }));
	}

	why(kind){
		const off = this.off(kind);
		if (kind === "changes") return off.length
			? "Each tab computed “old value + 1” and saved the same number, so one click is lost: this tab and the reload both end up one short. Save the call instead."
			: "Right, because nobody pressed at the same moment as you.";
		return off.length ? "" : "Each call adds one, so both clicks count: each tab runs the other tab's saved `increment()` when it hears it. (A real server must still refuse a call it has already seen, by request id: D4.)";
	}
}
