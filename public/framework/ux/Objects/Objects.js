import View, { span, a, button, icon } from "../../core/View/View.js";
import Tree from "../Tree/Tree.js";

View.stylesheet(import.meta, "Objects.css");

/**
 * class Objects extends Tree
 *
 * Walks a live object:
 * - A property holding a class instance becomes a row (`name: Class ×n`)
 * - A Map, Set, or Array becomes a count that opens lazily
 * - The class name links to its module page
 * - A module may export `objects()` in its page.js for rows the walk cannot see (a state dot, `new`)
 * - "+ New" appears only where declared, making a demo instance that is never saved
 */
export default class Objects extends Tree {

	initialize(){
		this.ac("ux-objects");   // classify() already ran, so a `classes` field is too late
		super.initialize();   // View.initialize runs render(); without it the tree never draws
	}

	/**
	 * Objects.of(target, opts)
	 * Factory creating an Objects inspector Tree for a live target object.
	 */
	static of(target, opts = {}){
		const nodes = Objects.walk(target, opts);
		return new Objects({ nodes, ...opts });
	}

	/**
	 * Walk an object structure and produce Tree nodes.
	 */
	static walk(target, opts = {}, depth = 0, seen = new WeakSet()){
		if (!target || typeof target !== "object") return [];
		if (seen.has(target)) return [{ text: "circular ref", icon: "sync" }];
		seen.add(target);

		// If input is server objects payload ({type: "Servex", objects: {...}})
		if (target.objects && typeof target.objects === "object" && !Array.isArray(target.objects) && typeof target.objects !== "function"){
			return Objects.walk(target.objects, opts, depth, seen);
		}

		// If module exports custom objects()
		if (typeof target.objects === "function"){
			try {
				const custom = target.objects();
				if (Array.isArray(custom)) return custom;
			} catch {}
		}

		const nodes = [];

		// If input node has {type, count, items, state, children} descriptor format from /api/objects
		for (const key of Object.keys(target)){
			if (key.startsWith("_") && !opts.all) continue;
			const val = target[key];
			if (val === undefined || typeof val === "function") continue;

			if (val && typeof val === "object" && typeof val.type === "string" && (val.count !== undefined || val.state !== undefined)){
				const countStr = val.count !== undefined ? ` (${val.count})` : "";
				const stateStr = val.state ? ` [${val.state}]` : "";
				nodes.push({
					text: `${key}: ${val.type}${countStr}${stateStr}`,
					icon: val.type === "Array" ? "list" : (val.type === "Map" || val.type === "Set") ? "folder" : "category",
					className: val.type !== "Object" && val.type !== "Array" && val.type !== "Map" && val.type !== "Set" ? val.type : null,
					children: (val.items || val.children) ? () => {
						if (Array.isArray(val.items)) return val.items.map(it => ({ text: String(it), icon: "data_object" }));
						if (val.children) return Objects.walk(val.children, opts, depth + 1, seen);
						return [];
					} : undefined
				});
				continue;
			}

			// Map or Set
			if (val instanceof Map || val instanceof Set){
				const count = val.size;
				const className = val.constructor.name;
				nodes.push({
					text: `${key}: ${className} (${count})`,
					icon: "folder",
					children: count > 0 ? () => {
						const entries = [];
						let i = 0;
						for (const item of val){
							if (i++ > 50) { entries.push({ text: `... and ${count - 50} more`, icon: "more_horiz" }); break; }
							if (val instanceof Map){
								const [k, v] = item;
								entries.push({
									text: `${String(k)}: ${Objects.label_of(v)}`,
									icon: Objects.icon_of(v),
									children: (v && typeof v === "object") ? () => Objects.walk(v, opts, depth + 1, seen) : undefined
								});
							} else {
								entries.push({
									text: Objects.label_of(item),
									icon: Objects.icon_of(item),
									children: (item && typeof item === "object") ? () => Objects.walk(item, opts, depth + 1, seen) : undefined
								});
							}
						}
						return entries;
					} : undefined
				});
				continue;
			}

			// Array
			if (Array.isArray(val)){
				const count = val.length;
				nodes.push({
					text: `${key}: Array (${count})`,
					icon: "list",
					children: count > 0 ? () => {
						return val.slice(0, 50).map((item, idx) => ({
							text: `[${idx}]: ${Objects.label_of(item)}`,
							icon: Objects.icon_of(item),
							children: (item && typeof item === "object") ? () => Objects.walk(item, opts, depth + 1, seen) : undefined
						}));
					} : undefined
				});
				continue;
			}

			// Class instance or Plain Object
			if (val && typeof val === "object"){
				const className = val.constructor?.name ?? "Object";
				const isInstance = className !== "Object";
				const count = Object.keys(val).length;
				const node = {
					text: `${key}: ${className}${count ? ` ×${count}` : ""}`,
					icon: isInstance ? "category" : "folder",
					className: isInstance ? className : null,
					children: count > 0 ? () => Objects.walk(val, opts, depth + 1, seen) : undefined
				};
				nodes.push(node);
				continue;
			}

			// Primitive property
			nodes.push({
				text: `${key}: ${String(val)}`,
				icon: "data_object"
			});
		}

		return nodes;
	}

	static label_of(val){
		if (val == null) return String(val);
		if (typeof val !== "object") return String(val);
		const name = val.constructor?.name;
		return (name && name !== "Object") ? `${name}` : JSON.stringify(val).slice(0, 40);
	}

	static icon_of(val){
		if (val == null) return "code";
		if (typeof val !== "object") return "data_object";
		if (val.constructor?.name && val.constructor.name !== "Object") return "category";
		return "folder";
	}
}

/**
 * Custom Tree.Row to support linking class names and "+ New" demo creation.
 */
Objects.Row = class ObjectsRow extends Tree.Row {
	render(){
		super.render();
		if (this.node.className){
			this.$className = a.c("ux-objects-class page-link")
				.href(`/framework/code/objects/#${this.node.className}`)
				.text(this.node.className);
		}
	}
};
