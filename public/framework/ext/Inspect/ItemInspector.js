import Item from "/framework/core/Item/Item.js";
import View, { div, h4, span, a, details, summary } from "/framework/core/View/View.js";

View.stylesheet(import.meta, "Inspect.css");

// Own, callable method names of a class's own prototype (functions only, minus `constructor`). Exported so
// live/design/ui/MethodMap.js's own_methods() can build its {name, forwarder} shape on top of the same walk,
// rather than walking the prototype chain a second time (law 6, flagged in review 2026-11-06).
export function own_methods(Class){
	return Object.getOwnPropertyNames(Class.prototype)
		.filter(name => name !== "constructor")
		.filter(name => typeof Object.getOwnPropertyDescriptor(Class.prototype, name).value === "function");
}

// The chain from `Class` up to (and including) Item, each with its OWN methods only.
function method_chain(Class){
	const chain = [];
	for (let C = Class; C && C.prototype; C = Object.getPrototypeOf(C)){
		chain.push([C, own_methods(C)]);
		if (C === Item) break;
	}
	return chain;
}

// A value short enough to show on one line.
function short(value){
	if (value === undefined) return "undefined";
	if (value === null) return "null";
	if (typeof value === "string") return value.length > 80 ? JSON.stringify(value.slice(0, 77) + "…") : JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.length}]`;
	if (typeof value === "object") return "{…}";
	return String(value);
}

// What to call a list member by: its own title, else its text (a part-heading or part-text keeps its words there,
// not in `title`), cut short. Exported so DeltaHistory draws the same label for the same reason.
export function label_of(kid){
	const title = kid.title ?? kid.get?.("title");
	if (title) return String(title);
	const text = kid.get?.("text");
	return text ? String(text).replace(/\s+/g, " ").trim().slice(0, 60) : null;
}

// One row for a list member: id (and label, when it has one), its class, linked where it has a url. Exported so
// DeltaHistory's replayed-object summary draws identically to ItemInspector's own Inside section.
export function item_row(kid, owner){
	const url = kid.url ?? (owner && typeof owner.link_url === "function" && kid.get?.("path") ? owner.link_url(kid.get("path")) : null);
	const label = kid.id + (label_of(kid) ? ` — ${label_of(kid)}` : "");
	div.c("item-inspector-row", () => {
		url ? a(label).href(url) : span(label);
		span.c("item-inspector-type muted", kid.constructor?.name ?? "?");
	});
}

// One named list, framed like LivePage.Files: a heading ("name (n)") then its rows. Exported for the same reason.
export function item_list(name, list, owner){
	if (!list.length) return;
	div.c("item-inspector-list", () => {
		span.c("item-inspector-list-name", `${name} (${list.length})`);
		div.c("item-inspector-list-body", () => list.items.forEach(kid => item_row(kid, owner)));
	});
}

// What one Item is made of: given {item}, three sections — Inside (its own lists, each member a
// row with id/type/title, linked where the member has a url), Methods (own class first, then each
// parent up to Item, collapsed), Fields (its saved data keys, short). Read-only; nothing is written.
export default class ItemInspector extends View {
	render(){
		const { item } = this;
		div.c("item-inspector-section", () => {
			h4.c("item-inspector-heading", "Inside");
			const lists = item.lists ? item.lists() : {};
			// `_pages`, `_content`… are the backing fields lists() finds by walking own keys (Page.pages is a getter
			// over `this._pages`) — a leading underscore means "not a field meant to be read this way", so it is
			// skipped here, never shown as e.g. "_pages (1)" (review 2026-11-06, finding 7).
			const names = Object.keys(lists).filter(name => !name.startsWith("_") && lists[name].length);
			if (!names.length) span.c("muted", "Nothing listed.");
			names.forEach(name => item_list(name, lists[name], item));
		});
		div.c("item-inspector-section", () => {
			h4.c("item-inspector-heading", "Methods");
			method_chain(item.constructor).forEach(([Class, methods], i) => {
				if (!methods.length) return;
				const $d = details.c("item-inspector-methods", () => {
					summary(`${Class.name} (${methods.length})`);
					div.c("item-inspector-chips", () => methods.sort().forEach(name => span.c("item-inspector-chip", name)));
				});
				if (i === 0) $d.attr("open", "");
			});
		});
		div.c("item-inspector-section", () => {
			h4.c("item-inspector-heading", "Fields");
			const data = item.data ?? {};
			const keys = Object.keys(data);
			if (!keys.length) span.c("muted", "No saved fields.");
			keys.forEach(key => div.c("item-inspector-row", () => {
				span.c("item-inspector-id", key);
				span.c("item-inspector-value muted", short(data[key]));
			}));
		});
	}
}
