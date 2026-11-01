import LabExample from "./LabExample.js";
import LabLayer from "./LabLayer.js";
import { div, span, b } from "../../View/View.js";

// Example 2: show, hide, toggle and drag a layer; and two tabs toggling at the same moment.
export default class LayerExample extends LabExample {

	static id = "layer";
	static tab = "Toggle and drag";
	static title = "Show, hide, toggle and drag a layer";
	static look = "Press **Another tab toggles too**, then **Reload the page**. Then drag the square and watch how many lines each log gets.";
	static hint = "“Another tab toggles too” means you and someone else both pressed Toggle at the same moment, both seeing it visible. Both meant “hide it”.";
	static Class = LabLayer;
	static check_meant = true;
	static first(){ return { id: "layer", visible: true, x: 24, y: 40 }; }
	static buttons = [
		{ label: "Show", verb: "show", meant: m => { m.visible = true; } },
		{ label: "Hide", verb: "hide", meant: m => { m.visible = false; } },
		{ label: "Toggle", verb: "toggle", meant: m => { m.visible = !m.visible; } },
		{ label: "Another tab toggles too", verb: "toggle", both: true, two: true, meant: m => { m.visible = !m.visible; } },
	];
	static keys = [
		{ key: "visible", label: "visible", read: l => l.visible, show: v => v ? "visible" : "hidden" },
		{ key: "x", label: "x", read: l => l.x },
		{ key: "y", label: "y", read: l => l.y },
	];

	// A drag step: the layer moves by (dx, dy) in every column.
	move(dx, dy){
		this.meant.x += dx;
		this.meant.y += dy;
		return Promise.all(Object.values(this.columns).map(c => c.press("move", { dx, dy })));
	}

	draw(item){
		div.c("core-item-replay-card", () => {
			div.c("core-item-replay-stage", () => {
				div.c("core-item-replay-layer" + (item.visible ? "" : " is-hidden"), item.visible ? "layer" : "hidden")
					.style({ left: `clamp(0px, ${item.x}px, calc(100% - 3.5rem))`, top: `clamp(0px, ${item.y}px, calc(100% - 3.5rem))` });   // kept in view; the data keeps the real numbers
			});
			div.c("core-item-replay-row", () => ["visible", "x", "y"].forEach(k => span.c("muted", k + " ", () => b(String(item[k])))));
		});
	}

	why(kind){
		const diffs = this.diffs(kind), off = this.off(kind);
		if (kind === "calls" && off.length) return "Two `toggle()` calls cancel out, so the layer is visible again though both people hid it. Even the live tab flips back: it runs the other tab's saved `toggle()` when it hears it. Save what they meant: `visible: false`.";
		if (diffs.length) return "";
		return kind === "changes"
			? "Each line holds the result, so a repeated or simultaneous line is harmless. A drag saves one line for every field that changed: up to two per mouse move."
			: "Same result. A drag saves one line per mouse move.";
	}
}
