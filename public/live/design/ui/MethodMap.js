import Item from "/framework/core/Item/Item.js";
import View, { div, span, button } from "/framework/core/View/View.js";
import Page from "/framework/core/Page/Page.class.js";
import LivePage from "/live/LivePage.js";
import PageUI from "../PageUI.js";

// page.ui.methods — "150 methods in one bag", shown: `mode` is "today" (three flat blocks) or "grouped" (Page's own
// methods regrouped by the pattern table in core/Page/doc/namespaces.md, "The shape" — a proposal, not built).
// ⚠ The brief named this field `view`, but Item.prototype already has a `view` getter/setter of its own (the
// item's lazily-built icon view, Item.js:576) — Item.set_one's old bare-call check reads `this[key]` BEFORE
// deciding what to do with it, so a data key literally named "view" builds a View there and then, which throws
// in node (`document is not defined`, hit while extending PageUI.test.mjs below). Named `mode` instead; logged
// as a skill-improvement-worthy trap, not something this fence can fix in core/Item/Item.js.
// A name-pattern -> group map, matching that table's "Was (examples)" column.
const GROUPS = [
	["columns", /column/i],
	["previews", /preview|wall/i],
	["tabs", /^tab(_|$)/i],
	["log", /^(file|gone|child_file|link_child|unlink_child|take_words|overlay|log_|draw_(folder|placed|md|module)|listing|report_unknown)/i],
	["links", /^(open_link|swap_link|swap_url|md_files)$/i],
	["prefs", /pref/i],
];

// A method whose body hands the call straight on: ONE statement, `[return] this.<x>(…)[.<y>(…)…]`, nothing else
// (page_tools's own forwarders — `file(name){ return this._helper("Jsonl").file(name); }` — are exactly this shape).
function is_forwarder(fn){
	const src = fn.toString();
	const open = src.indexOf("{"), close = src.lastIndexOf("}");
	if (open < 0 || close < 0) return false;
	let body = src.slice(open + 1, close).trim();
	if (body.endsWith(";")) body = body.slice(0, -1).trim();
	if (!body || body.includes(";") || body.includes("{")) return false;   // more than one statement, or a block of its own
	return /^(return\s+)?this\.[a-zA-Z_$][\w$]*\(.*\)(\.[a-zA-Z_$][\w$]*\(.*\))*$/.test(body);
}

// Own, callable method names of a class's own prototype (functions only — a getter is never counted — minus `constructor`).
function own_methods(Class){
	return Object.getOwnPropertyNames(Class.prototype)
		.filter(name => name !== "constructor")
		.filter(name => typeof Object.getOwnPropertyDescriptor(Class.prototype, name).value === "function")
		.map(name => ({ name, forwarder: is_forwarder(Class.prototype[name]) }));
}

const group_of = name => GROUPS.find(([, pattern]) => pattern.test(name))?.[0] ?? "page";

export default class MethodMap extends Item {
	static example = { mode: "today" };

	// { Item: [{name, forwarder}, …], Page: […], LivePage: […] } — computed fresh, never typed by hand (CLAUDE.md law 7).
	static census(){ return { Item: own_methods(Item), Page: own_methods(Page), LivePage: own_methods(LivePage) }; }

	// Page's own methods, bucketed by GROUPS; everything no pattern matched stays in "page".
	static grouped(){
		const groups = { columns: [], previews: [], tabs: [], log: [], links: [], prefs: [], page: [] };
		for (const m of own_methods(Page)) groups[group_of(m.name)].push(m);
		return groups;
	}
}

MethodMap.View = class MethodMapView extends View {
	render(){
		const item = this.item;
		return div.c("method-map", () => {
			div.c("method-map-switch", () => {
				const $today = button.c("method-map-btn", "Today").on("click", () => item.set({ mode: "today" }));
				const $grouped = button.c("method-map-btn", "Grouped").on("click", () => item.set({ mode: "grouped" }));
				const paint = mode => { $today.tc("is-selected", mode !== "grouped"); $grouped.tc("is-selected", mode === "grouped"); };
				$today.bind(item, "mode", paint);
			});
			const $body = div.c("method-map-body");
			$body.bind(item, "mode", mode => $body.empty(() => (mode === "grouped" ? this.draw_grouped() : this.draw_today())));
		});
	}

	block(title, methods){
		const forwarders = methods.filter(m => m.forwarder).length;
		div.c("method-map-block", () => {
			span.c("method-map-block-title", `${title} ${methods.length}${forwarders ? ` · ${forwarders} forward` : ""}`);
			div.c("method-map-chips", () => methods.forEach(m => {
				span.c("method-chip", m.name).tc("is-forwarder", m.forwarder).attr("title", `${title}.prototype.${m.name}`);
			}));
		});
	}

	draw_today(){
		const census = MethodMap.census();
		this.block("Item", census.Item);
		this.block("Page", census.Page);
		this.block("LivePage", census.LivePage);
	}

	draw_grouped(){
		const groups = MethodMap.grouped();
		const titles = { columns: "page.columns", previews: "page.previews", tabs: "page.tabs", log: "page.log", links: "page.links", prefs: "page.prefs", page: "page (stays on page)" };
		for (const name of ["columns", "previews", "tabs", "log", "links", "prefs", "page"]) this.block(titles[name], groups[name]);
	}
};
PageUI.add("methods", MethodMap);
