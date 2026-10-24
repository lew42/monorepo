import View, { div } from "../../../View/View.js";

/* A tiny part-view module. The part hands it { page, item, ...data }, and a View puts those on `this`. */
export default class Meter extends View {
	render(){
		const value = this.value ?? 0;
		div.c("types-meter card", () => {
			div.c("types-meter-label", `${this.label ?? "Value"}: ${value}%`);
			div.c("types-meter-bar").style("width", value + "%").style("height", "0.75em").style("background", "currentColor");
		});
	}
}
