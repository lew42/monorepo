import Item from "/framework/core/Item/Item.js";
import View, { div, span } from "/framework/core/View/View.js";

/* {"type":"live-light","label":"Build","on":true,"color":"green"} — a status light card: a dot, on or off, any CSS colour.
 * Change it with {"content":{"<id>":{"on":false}}} or {"color":"red"}. The header's own light (LivePage `light`) is drawn by
 * the same LiveLight.paint(), so the two always look alike. */
export default class LiveLight extends Item {
	static example = { id: "build", label: "Build", on: true, color: "green" };   // what the item tool's help shows; change it with {"<id>":{"color":"red"}}


	// Paint one dot from a light value: true / false, or {on, color}. Off is gray; on glows in its colour (green by default).
	static paint($dot, value){
		const { on, color } = value && typeof value === "object" ? value : { on: !!value };
		$dot.tc("is-on", !!on).attr("title", on ? "On" : "Off");
		$dot.el.style.setProperty("--live-light", on ? color || "#22c55e" : "");
		return $dot;
	}
}

LiveLight.View = class LiveLightView extends View {
	render(){
		const item = this.item;
		return div.c("live-light-card", () => {
			const $dot = span.c("live-dot");
			const paint = () => LiveLight.paint($dot, { on: item.get("on"), color: item.get("color") });
			$dot.bind(item, "on", paint);
			$dot.bind(item, "color", paint);
			span.c("live-light-label").bind(item, "label", function(t){ this.text(t ?? ""); });
		});
	}
};
Item.register(LiveLight, "live-light");
