import LiveView, { Lab } from "../LiveView/LiveView.js";
import { div, span, button } from "/framework/core/View/View.js";

// The shared event log. Every lab object writes here; the demo shows it live.
export default class EventLog extends Lab {
	entries = [];
	add(source, text, data){
		const entry = { at: new Date(), source, text, data };
		this.entries.unshift(entry);
		this.entries.length = Math.min(this.entries.length, 200);
		this.emit("change");
		return entry;
	}
	clear(){ this.entries = []; this.emit("change"); }

	static View = class extends LiveView {
		draw(){
			const log = this.item;
			div.c("flex gap v-center", () => {
				span.c("muted", `${log.entries.length} events (newest first)`);
				button.c("btn", "Clear").attr("type", "button").click(() => log.clear());
			});
			div.c("lab-log", () => {
				log.entries.forEach(e => div.c("lab-log-row", () => {
					span.c("muted", e.at.toLocaleTimeString([], { hour12: false }) + " ");
					span.c("lab-src", e.source + " ");
					span(e.text);
				}));
			});
		}
	};
}
