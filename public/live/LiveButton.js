import Item from "/framework/core/Item/Item.js";
import View, { button } from "/framework/core/View/View.js";

/* {"type":"live-button","label":"Flash red","method":"flash","args":"red"} — a button card. A tap, or voice sending
 * {"content":{"<id>":{"press":{}}}}, runs the page's method `method` with `args` (any method LivePage itself defines:
 * flash, alert, toggle, or one you add). A tap saves {"press()":{}} on the button, so every open tab sees the same press. */
export default class LiveButton extends Item {
	static example = { id: "b1", label: "Flash red", method: "flash", args: "red" };   // what the item tool's help shows; `method` is one of the page's callable verbs
	static callable = { ...Item.callable, press: "{\"press\": {}} runs its method, like a tap." };

	// Run the named method on the page that holds me, and count the press (the count is what makes a tap save one line).
	press(){
		this.set({ presses: (this.get("presses") ?? 0) + 1 });
		const method = this.get("method");
		let page = this.parent;
		while (page && !page.can_press) page = page.parent;   // the nearest page that says which methods a button may run
		if (page?.can_press(method)) page[method](this.get("args"));
	}
}

LiveButton.View = class LiveButtonView extends View {
	render(){
		const item = this.item;
		const $b = button.c("live-button").on("click", () => item.act("press"));
		$b.bind(item, "label", function(t){ this.text(t ?? item.get("method") ?? "Press"); });
		let first = true;   // bind runs once at once: no blink for the presses already in the log
		$b.bind(item, "presses", function(){ if (first) return void (first = false); this.rc("is-pressed"); void this.el.offsetWidth; this.ac("is-pressed"); });
		return $b;
	}
};
Item.register(LiveButton, "live-button");
