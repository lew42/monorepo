import { Page, div, button, span, p as para } from "/app.js";
import { Property } from "./Property.js";

export default new Page({
	meta: import.meta,
	title: "Property",
	icon: "tune",
	description: "One live value. Two spans bound to it update together; unbinding drops the listener.",
	content(){
		para("A Property holds one value and tells everyone bound to it when it changes: `class Property extends Events(Object)` with get, set, bind and listeners. Press +1 and both spans follow; unbind one and the listener count drops.");
		const p = new Property(0), count = span();
		div.c("card flex gap v-center", () => {
			const spans = [span(), span()];
			const offs = spans.map(s => p.bind(v => s.text(`value ${v}`)));
			button("+1").on("click", () => p.set(p.get() + 1));
			button("unbind one").on("click", () => { offs.pop()?.(); count.text(`listeners: ${p.listeners()}`); });
			p.on("change", () => count.text(`listeners: ${p.listeners()}`));
			count.text(`listeners: ${p.listeners()}`);
		});
	},
});
