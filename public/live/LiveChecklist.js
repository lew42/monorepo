import Item from "/framework/core/Item/Item.js";
import List from "/framework/core/List/List.js";
import View, { div, h4, label, input, span } from "/framework/core/View/View.js";

/* {"type":"live-checklist","title":"Today","items":[{"id":"milk","text":"Buy milk"},{"id":"eggs","text":"Eggs","done":true}]}
 * A checklist card: `items` is its own List of plain Items, each {text, done}. Tick one with
 * {"content":{"<id>":{"items":{"milk":{"done":true}}}}}, add one with {"content":{"<id>":{"items":{"add":{"id":"tea","text":"Tea"}}}}}.
 * A tap on a row sets `done` the same way, so the line it saves is the line voice would send. */
export default class LiveChecklist extends Item {
	static example = { id: "today", title: "Today", items: [{ id: "milk", text: "Buy milk", done: false }] };   // what the item tool's help shows
	static callable = { ...Item.callable, check: "{\"check\": \"<entry id>\"} flips one entry; add: {\"items\": {\"add\": {id, text}}}." };
	constructor(...args){
		super(...args);
		this.items ??= new List({ owner: this, name: "items" });
	}

	// {"content":{"<id>":{"check":"milk"}}} — flip one entry by id (the tap does the same through set).
	check(id){
		const entry = this.items.find(id);
		entry?.set({ done: !entry.get("done") });
	}
}

LiveChecklist.View = class LiveChecklistView extends View {
	render(){
		const list = this.item;
		return div.c("live-checklist", () => {
			h4.c("live-card-title").bind(list, "title", function(t){ this.tc("is-empty", !t).text(t ?? ""); });
			const $rows = div.c("live-checklist-rows");
			const draw = () => $rows.empty(() => { list.items.forEach(entry => this.row(entry)); });   // a block: forEach's return value would be drawn
			["add", "remove", "move", "order", "clear"].forEach(verb => list.items.on(verb, draw));
			list.on("change", (key) => { if (key === "done" || key === "text") View.frame(draw); });   // an entry's change bubbles up here
			draw();
		});
	}

	row(entry){
		label.c("live-check" + (entry.get("done") ? " is-done" : ""), () => {
			const $box = input().attr("type", "checkbox").on("change", e => entry.set({ done: e.target.checked }));
			$box.el.checked = !!entry.get("done");
			span(entry.get("text") ?? entry.id);
		});
	}
};
Item.register(LiveChecklist, "live-checklist");
