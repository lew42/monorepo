import Events from "/framework/core/Events/Events.js";
import { View, div, span } from "/framework/core/View/View.js";

// The one base for every lab view. A lab class (WorkerHost, NotificationManager, ...) is an
// Events object with a `change` event; its static View extends this and writes only draw().
// When the item emits "change" the view empties itself and draws again, so what you see is
// always the object's state.
// Base of every lab object: events, plus `view` built from the class's own static View.
export class Lab extends Events() {
	get view(){ return this._view ??= new this.constructor.View({ item: this }); }
}

export default class LiveView extends View {
	render(){
		this.item.on("change", () => this.redraw());
		this.draw();
	}
	redraw(){ this.empty(() => this.draw()); }
	draw(){}
}

// A "name: value" line used by every lab view. Call it inside draw() (capturing).
export function row(name, value, cls = ""){
	return div.c("lab-row " + cls, () => {
		span.c("lab-k", name);
		span.c("lab-v", String(value));
	});
}
