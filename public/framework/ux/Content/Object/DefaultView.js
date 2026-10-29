import View, { div, span, a, summary, icon } from "../../../core/View/View.js";

View.stylesheet(import.meta, "DefaultView.css");

const is_list = x => !!x && Array.isArray(x.items) && typeof x.find === "function";
const is_object = x => x !== null && typeof x === "object";
const is_item = x => typeof x?.lists === "function" && is_object(x.data);   // an Item: its fields live in `data`
const ONE = { entries: "entry", items: "item", methods: "method" };
const plural = (n, word) => `${n} ${n === 1 ? ONE[word] ?? word.replace(/s$/, "") : word}`;

// Every live view of an object (ask 33: one object can show in two places at once). An Item keeps its own
// `item.views` (core/Item/Item.js); any other object with on()/emit() gets a list here instead.
const others = new WeakMap();
const hooked = new WeakSet();
export const views_of = x => x.views ?? (others.has(x) ? others.get(x) : others.set(x, []).get(x));

/**
 * class DefaultView extends View — the one default view for any object: an Item, a List, a class, a plain
 * object or an array. It is a `<details>`: closed, it is ONE row; open, it lists the object's data by type.
 *
 *   view(item)                       // the usual way in (bottom of this file)
 *   view(item, { open: 3 })          // three levels open from the start
 *   view(obj, { properties: "title state" })   // only these, in this order
 *
 * **The row:** the class's `static icon` (else "data_object"), the id, the title when it says more than the id,
 * the class name as a small label, and counts ("3 items", one per List the object owns).
 *
 * **Open:** a string or number is written out; an Item or List the object owns nests its OWN default view,
 * built only when it is opened; an object it does not own (`parent`, a `store`, anything already open above)
 * is a reference: one row saying where it points, and a click flashes every view of that object.
 *
 * **Live:** the view joins the object's `views`, and ONE "delta" listener per object walks them. A change
 * rewrites only the row it touched (a `set` line), or adds, moves and removes member rows (a List verb), and
 * flashes what changed. A view whose element has left the page is dropped from `views` on the next change.
 *
 * A class with its own look declares `static View` (a DefaultView subclass, or any View taking `subject`);
 * `view()` picks it. Nested rows always use the default view, because a class's own `View` (PageText.View,
 * Task.View) takes other options.
 */
export default class DefaultView extends View {

	// One class, never View's name-derived ones ("default" means something else on a page).
	classify(){ this.ac("ux-content-defaultview item-node"); }

	render(){
		const s = this.subject;
		this.path ??= new Set();
		this.levels = this.open === true ? 1 : Number(this.open) || 0;
		this.rows = new Map();   // property name -> its row's element
		this.kids = new Map();   // member -> its view (a List subject)

		if (!is_object(s) && typeof s !== "function") return this.leaf();

		this.$head = summary.c("item", () => this.head());
		this.$body = div.c("item-children");
		if (this.levels > 0){ this.el.open = true; this.build(); }
		this.el.addEventListener("toggle", () => this.el.open && this.build());
		this.watch();
	}

	// A primitive handed straight to view(): no row to open, just the value.
	leaf(){
		const el = document.createElement("span");
		el.className = "ux-content-defaultview-leaf";
		el.textContent = this.describe(this.subject);
		this.el.replaceWith(el);
		this.el = el;
	}

	klass(){ const s = this.subject; return typeof s === "function" ? s : s?.constructor; }

	// ---- the row ----

	head(){
		const s = this.subject, K = this.klass();
		span.c("item-caret", "▸");
		icon(K?.icon ?? "data_object").ac("item-icon");
		if (this.key != null) span.c("ux-content-defaultview-key", "." + this.key);
		this.$name = span.c("item-name", () => this.name_parts());
		span.c("ux-content-defaultview-class", typeof s === "function" ? "class" : (K?.name ?? "Object"));
		this.$counts = span.c("item-end muted", this.counts());
	}

	// The id (a uuid cut to 8), then the title when it says something the id does not.
	name_parts(){
		const s = this.subject;
		const id = this.name_of(s);
		const title = typeof s === "function" ? null : (s.data?.title ?? s.title ?? s.name);
		if (id && !(this.key != null && id === this.key)) span.c("ux-content-defaultview-id", id).attr("title", String(s.id ?? id));
		if (typeof title === "string" && title !== id) span.c("muted", ` ${this.cut(JSON.stringify(title), 40)}`);
	}

	name_of(s){
		if (typeof s === "function") return s.name;
		if (is_list(s)) return s.name ?? this.short(s.id);
		if (s.id != null) return this.short(String(s.id));
		const named = s.name ?? s.title ?? s.url;   // no id: whatever names it
		return typeof named === "string" ? named : "";
	}

	short(id){ return /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id) ? id.slice(0, 8) + "…" : id; }

	counts(){
		const s = this.subject;
		if (typeof s === "function") return plural(this.methods().length, "methods");
		if (is_list(s)) return plural(s.length, "items");
		if (Array.isArray(s)) return plural(s.length, "entries");
		if (s instanceof Map || s instanceof Set) return plural(s.size, "entries");
		const lists = Object.entries(s.lists?.() ?? {});
		if (lists.length) return lists.map(([name, list]) => plural(list.length, list.name ?? name)).join(" · ");
		return "";
	}

	refresh_head(){
		this.$name?.empty(() => this.name_parts());
		this.$counts?.text(this.counts());
	}

	// ---- open: the data, by type ----

	build(){
		if (this.built) return;
		this.built = true;
		this.$body.append(() => this.body());
	}

	body(){
		const s = this.subject;
		if (typeof s === "function") return this.class_body(s);
		if (is_list(s)) return [...s].forEach(m => this.kids.set(m, this.child(m)));
		if (Array.isArray(s)) return s.forEach((v, i) => this.row(String(i), v));
		if (s instanceof Map) return s.forEach((v, k) => this.row(String(k), v));
		if (s instanceof Set) return [...s].forEach((v, i) => this.row(String(i), v));

		// The lists by their own name (`pages`, not the `_pages` field Page keeps it in), which is also what a
		// change from one of them reports. With `properties` given, only the lists it names.
		this.lists = new Map(Object.values(s.lists?.() ?? {}).map(list => [list.name, list]));
		this.$rows = div.c("ux-content-defaultview-rows", () => {
			this.keys().forEach(k => this.row(k, this.lists.get(k) ?? this.value(k)));
			if (!this.properties) for (const [name, list] of this.lists) if (!this.rows.has(name)) this.row(name, list);
		});
	}

	// Which properties show, in order: `properties` (a list or a space-separated string) when given; else the
	// class's `static shown` first, then the rest, minus `static hidden`. An Item's `data` is read through: its
	// fields are the rows. Never: `_private`, functions, DOM or View nodes, `undefined`, and the lists (they nest).
	keys(){
		const s = this.subject, K = s.constructor;
		const asked = typeof this.properties === "string" ? this.properties.split(/\s+/).filter(Boolean) : this.properties;
		if (asked) return asked;

		const lists = new Set(Object.entries(s.lists?.() ?? {}).flatMap(([key, list]) => [key, list.name]));
		const item = is_item(s);
		const own = Object.keys(s).filter(k => !(item && (k === "data" || k === "id")) && !lists.has(k));
		const data = item ? Object.keys(s.data) : [];
		const all = [...new Set([...data, ...own])].filter(k => !k.startsWith("_") && !(K?.hidden ?? []).includes(k));
		const first = (K?.shown ?? []).filter(k => all.includes(k));
		return [...first, ...all.filter(k => !first.includes(k))];
	}

	value(k){
		const s = this.subject;
		return is_item(s) && k in s.data ? s.data[k] : s[k];
	}

	shown(value){
		return value !== undefined && typeof value !== "function" && !value?.el && !(typeof Node !== "undefined" && value instanceof Node);
	}

	// One property's row, filed by name so a later `set` of that name rewrites only it.
	row(k, value){
		if (!this.shown(value)) return;
		if (k === "parent" && this.path.has(value)) return;   // the row it sits in already says where it lives
		let made;
		if (!is_object(value) || this.empty(value)) made = this.plain(k, value);
		else if (this.is_reference(value)) made = this.reference(k, value);
		else made = this.child(value, k);
		this.rows.set(k, made.el);
		return made;
	}

	// Nothing inside to open: an empty List, array, Map or Set is a plain row with its count.
	empty(value){
		if (is_list(value)) return value.length === 0 && !this.is_reference(value);
		if (Array.isArray(value)) return value.length === 0;
		if (value instanceof Map || value instanceof Set) return value.size === 0;
		return false;
	}

	plain(k, value){
		return div.c("item ux-content-defaultview-row", () => {
			span.c("item-caret", "");
			span.c("ux-content-defaultview-key", "." + k);
			const text = this.describe(value);
			if (typeof value === "string" && /^(\/|https?:\/\/)\S+$/.test(value)) a.c("item-end", text).attr("href", value);
			else span.c("item-end muted", text).attr("title", typeof value === "string" ? value : null);
		});
	}

	// Not mine to draw: something already open above (a cycle), an object with its own parent elsewhere
	// (my `parent`, a sibling), or a store. It says where it points, and a click flashes every view of it.
	is_reference(value){
		const s = this.subject;
		if (this.path.has(value) || value === s) return true;
		for (let K = value.constructor; K && K !== Object; K = Object.getPrototypeOf(K)) if (K.name === "Store") return true;   // Item.Store and its subclasses
		if (is_list(value)) return value.owner !== s && value.owner !== undefined;
		if ("parent" in value || value.data) return value.parent !== s && !(is_list(s) && s.items.includes(value));
		return false;
	}

	reference(k, value){
		const K = value.constructor;
		const where = this.path.has(value) ? "↺ already open above" : `→ ${K?.name ?? "Object"} ${this.name_of(value) || value.url || ""}`.trim();
		return div.c("item ux-content-defaultview-row ux-content-defaultview-ref", $row => {
			span.c("item-caret", "");
			span.c("ux-content-defaultview-key", "." + k);
			span.c("item-end", where);
			$row.attr("title", "Click: flash every view of it");
			$row.el.addEventListener("click", () => DefaultView.point_at(value));
		});
	}

	// A nested object: its own default view, one level less open, with this object added to the path.
	child(value, key){
		return new this.constructor({ subject: value, key, open: this.levels - 1, path: new Set(this.path).add(this.subject) });
	}

	// A class: its listed properties (names only, it has no values), then its own methods.
	class_body(K){
		const asked = typeof this.properties === "string" ? this.properties.split(/\s+/).filter(Boolean) : this.properties ?? K.fields ?? [];
		asked.forEach(k => div.c("item ux-content-defaultview-row", () => { span.c("item-caret", ""); span.c("ux-content-defaultview-key", "." + k); }));
		this.methods().forEach(m => div.c("item ux-content-defaultview-row", () => { span.c("item-caret", ""); span.c("ux-content-defaultview-method", m + "()"); }));
	}

	methods(){
		const K = this.klass();
		if (Array.isArray(this.method_names)) return this.method_names;
		if (typeof this.method_names === "string") return this.method_names.split(/\s+/).filter(Boolean);
		return Object.getOwnPropertyNames(K?.prototype ?? {}).filter(n => n !== "constructor" && !n.startsWith("_")
			&& typeof Object.getOwnPropertyDescriptor(K.prototype, n).value === "function");
	}

	// ---- live ----

	watch(){
		const s = this.subject;
		if (typeof s?.on !== "function") return;
		views_of(s).push(this);
		if (hooked.has(s)) return;
		hooked.add(s);
		s.on("delta", (line, origin) => DefaultView.walk(s, line, origin));
	}

	// One listener per object, every view of it told. Deltas bubble up through `parent`, so an object hears
	// its descendants' changes too; each view acts only on its own (see changed()).
	static walk(s, line, origin){
		const list = views_of(s);
		for (const v of [...list]){
			if (v.el.isConnected) v.seen = true;
			else if (v.seen){ list.splice(list.indexOf(v), 1); continue; }
			v.changed(line, origin);
		}
	}

	changed(line, origin){
		const s = this.subject;
		if (origin === s){
			this.refresh_head();
			if (!this.built) return;
			if (is_list(s)) return this.reconcile();
			const keys = line?.set ? Object.keys(line.set) : this.keys();
			keys.forEach(k => this.update(k));
		} else if (is_list(origin) && origin.owner === s){
			this.refresh_head();   // one of my lists changed: its count
			DefaultView.flash(this.$counts?.el);
			// It went from empty to not (or back): its row changes kind, a plain count or a view that opens.
			const el = this.rows.get(origin.name);
			if (el && el.classList.contains("ux-content-defaultview-row") !== this.empty(origin)) this.update(origin.name);
		}
	}

	// Rewrite one property's row in place; a new name adds a row, a gone one removes it.
	update(k){
		if (!this.$rows) return;
		const old = this.rows.get(k);
		const holder = new View({ capture: false });
		holder.append(() => this.row(k, this.lists?.get(k) ?? this.value(k)));
		const made = holder.el.firstElementChild;
		if (!made){ old?.remove(); this.rows.delete(k); return; }
		old ? old.replaceWith(made) : this.$rows.el.append(made);
		DefaultView.flash(made.querySelector(":scope > summary") ?? made);   // a nested view flashes its row, not its insides
	}

	// A List's members, after any verb (add, remove, move, order, clear): keep each member's view, make the new
	// ones, drop the gone ones, and move only what is out of place, so nothing else redraws.
	reconcile(){
		const want = [...this.subject];
		for (const [m, v] of this.kids) if (!want.includes(m)){ v.el.remove(); this.kids.delete(m); }
		let prev = null;
		for (const m of want){
			let v = this.kids.get(m);
			if (!v){ v = new this.constructor({ subject: m, capture: false, open: this.levels - 1, path: new Set(this.path).add(this.subject) }); this.kids.set(m, v); DefaultView.flash(v.$head?.el ?? v.el); }
			const at = prev ? prev.nextSibling : this.$body.el.firstChild;
			if (at !== v.el) this.$body.el.insertBefore(v.el, at);
			prev = v.el;
		}
	}

	static flash(el){
		if (!el) return;
		el.classList.remove("ux-content-defaultview-flash");
		void el.offsetWidth;   // restart the animation
		el.classList.add("ux-content-defaultview-flash");
	}

	// A reference row's click: flash every view of what it points at, and bring the first into sight.
	static point_at(target){
		const shown = (target.views ?? others.get(target) ?? []).filter(v => v.el.isConnected);
		shown.forEach(v => DefaultView.flash(v.$head?.el ?? v.el));
		shown[0]?.el.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}

	// ---- one line for a value ----

	describe(value){
		if (value === undefined) return "undefined";
		if (value === null) return "null";
		if (typeof value === "string") return this.cut(JSON.stringify(value));
		if (typeof value === "number" || typeof value === "boolean") return String(value);
		if (is_list(value)) return plural(value.length, "items");
		if (Array.isArray(value)) return `Array(${value.length})`;
		if (value instanceof Map) return `Map(${value.size})`;
		if (value instanceof Set) return `Set(${value.size})`;
		if (typeof value === "object") return value.constructor && value.constructor !== Object ? `${value.constructor.name} {…}` : "{…}";
		return this.cut(String(value));
	}

	cut(text, max = 64){ return text.length <= max ? text : text.slice(0, max - 1) + "…"; }
}

DefaultView.prototype.tag = "details";

/* `view(thing, opts)` — the one call. It picks `thing.constructor.View` when that class (or one it extends)
 * declares a View, else the default view above. `opts` go to the view: `open`, `properties`.
 * ⚠ `Viewer.prototype instanceof View`, not just truthy: some other static named `View` must not be
 * instantiated as a subject-taking view. */
export function view(thing, opts = {}){
	const Viewer = thing?.constructor?.View;
	return Viewer?.prototype instanceof View ? new Viewer({ subject: thing, ...opts }) : new DefaultView({ subject: thing, ...opts });
}

export { DefaultView };
