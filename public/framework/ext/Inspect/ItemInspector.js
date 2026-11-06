import Item from "/framework/core/Item/Item.js";
import View, { div, h4, span, a, details, summary } from "/framework/core/View/View.js";

// Own, callable method names of a class's own prototype (functions only, minus `constructor`).
// Same walk as live/design/ui/MethodMap.js's own_methods(); kept here too rather than importing
// it, since MethodMap lives under /live/ and this module must work for any Item, not just Page.
function own_methods(Class){
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

// What one Item is made of: given {item}, three sections — Inside (its own lists, each member a
// row with id/type/title, linked where the member has a url), Methods (own class first, then each
// parent up to Item, collapsed), Fields (its saved data keys, short). Read-only; nothing is written.
export default class ItemInspector extends View {
	render(){
		const { item } = this;
		div.c("item-inspector-section", () => {
			h4("Inside");
			const lists = item.lists ? item.lists() : {};
			const names = Object.keys(lists);
			if (!names.length) span.c("muted", "Nothing listed.");
			names.forEach(name => {
				const list = lists[name];
				if (!list.length) return;
				div.c("item-inspector-list", () => {
					span.c("item-inspector-list-name", `${name} (${list.length})`);
					list.items.forEach(kid => {
						const url = kid.url ?? (typeof item.link_url === "function" && kid.get?.("path") ? item.link_url(kid.get("path")) : null);
						const title = kid.title ?? kid.get?.("title");
						const label = kid.id + (title ? ` — ${title}` : "");
						div.c("item-inspector-row", () => {
							url ? a(label).href(url) : span(label);
							span.c("item-inspector-type muted", kid.constructor?.name ?? "?");
						});
					});
				});
			});
		});
		div.c("item-inspector-section", () => {
			h4("Methods");
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
			h4("Fields");
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
