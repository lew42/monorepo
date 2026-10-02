import View, { div, span, a, ul, li, details, summary, icon } from "../../../core/View/View.js";

/**
 * class ObjectCard extends View — a small card that shows what a real object IS instead
 * of explaining it in words: its icon, its class name, its instance name when it has
 * one, its properties as `name = value`, and its methods as names. The icon comes from
 * `static icon = "material-symbol-name"` on the class — any class may declare one;
 * absent, this card falls back to "data_object" (see `icon_name()` below). `Inspect.js`,
 * beside this file, is the bigger, recursive version of this same card for a separate
 * debug/inspector view (`inspect()`); this one stays the small, no-frills version.
 *
 *   object(page)                          // an instance — header shows its name too
 *   object(Page)                          // a class itself — no instance name
 *   object(Page, { doc: "/framework/core/Page/", properties: "title children url" })
 *   object(Page, { api: "/framework/core/Page/api/" })   // link the rail's own pages
 *   object(plain, { inline: true })       // the compact, inline-width look
 *
 * `doc` is the module's own Doc base url (the page that owns `doc/property/<name>.md`
 * and `doc/method/<name>.md`) — with it, every name links to its doc page; without it
 * the names still show, just as plain text, because this card cannot guess where
 * another module's docs live.
 *
 * `api` is for a card drawn ON a module's own API tab, beside the tab's own left rail —
 * pass the rail's own base url (`<module>/api/`) and every name links there instead, so
 * a method has ONE address on that screen, not a second one at `doc/method/<name>/`.
 * `api` wins over `doc` when both are given.
 *
 * `properties` and `methods` override which names to show — a space-separated string or
 * an array — for the case a bare class has no own values to discover (its properties
 * live per-instance): pass the same lists the module's own Doc `properties:`/`methods:`
 * already name, so every name shown is one that actually HAS a doc page to link to.
 * Left at the default, properties are every own enumerable value of the subject that
 * isn't a function, a DOM/View node, or `undefined`; methods are read off the prototype.
 *
 * Either list is capped at 12 rows, with the rest behind a native "+N more" disclosure —
 * a card is a few lines tall, not a wall.
 */
export default class ObjectCard extends View {

	/* The class behind the subject: itself, when the subject IS a class. */
	klass(){ return typeof this.subject === "function" ? this.subject : this.subject?.constructor; }

	/* The class's own icon — any class may declare `static icon = "material-symbol-name"`
	 * (a convention, not a new mechanism: nothing enforces it, a class just carries the
	 * name of its own icon the same way it carries any other static). Read off the
	 * subject's class when the subject is an instance, or the subject itself when it
	 * IS the class. Falls back to "data_object", the same default `DefaultView` already
	 * draws when a class says nothing — one shared fallback, not two. */
	icon_name(){
		const owner = typeof this.subject === "function" ? this.subject : this.klass();
		return owner?.icon ?? "data_object";
	}

	/* Explicit list wins (a class's own declared properties, named by the caller);
	 * otherwise every own enumerable value worth showing — skip functions, DOM/View
	 * nodes, and `undefined` (nothing to see there, just noise). */
	own_properties(){
		if (this.properties) return Array.isArray(this.properties) ? this.properties : String(this.properties).trim().split(/\s+/).filter(Boolean);

		return Object.keys(this.subject ?? {}).filter(key => {
			const value = this.subject[key];
			return value !== undefined && typeof value !== "function" && !(value?.el || value instanceof Node);
		});
	}

	/* A property's current value: on the subject itself first (an instance's own field,
	 * or a class's own static), else its prototype's default — assign-based OOP's own
	 * pattern (`Klass.prototype.field = default`) — else nothing to show. */
	value_for(name){
		if (this.subject && Object.prototype.hasOwnProperty.call(this.subject, name)) return this.subject[name];
		const proto = typeof this.subject === "function" ? this.subject.prototype : undefined;
		if (proto && Object.prototype.hasOwnProperty.call(proto, name)) return proto[name];
		return undefined;
	}

	/* Method names live up the WHOLE prototype chain — the instance's class, then
	 * every class it extends — stopping before Object.prototype so a plain `{}` shows
	 * no Methods at all instead of hasOwnProperty / __defineGetter__ and the rest of
	 * the furniture nobody asked for. Nearest class first, so a reader sees what the
	 * subject itself adds before what it inherited. */
	own_methods(){
		if (this.methods) return Array.isArray(this.methods) ? this.methods : String(this.methods).trim().split(/\s+/).filter(Boolean);

		const start = typeof this.subject === "function" ? this.subject.prototype : Object.getPrototypeOf(this.subject ?? {});
		const names = new Set();
		for (let proto = start; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto))
			for (const name of Object.getOwnPropertyNames(proto))
				if (name !== "constructor" && typeof proto[name] === "function") names.add(name);

		return [...names];
	}

	render(){
		if (this.inline) this.ac("inline");

		const klass = this.klass();
		const label = typeof this.subject === "function" ? null : (this.subject?.name ?? this.subject?.path ?? this.subject?.url);

		div.c("ux-content-object-head", () => {
			icon(this.icon_name()).ac("ux-content-object-icon");
			span.c("ux-content-object-class", klass?.name ?? "Object");
			if (label) span.c("ux-content-object-label", String(label));
		});

		// A names-only list (almost nothing on it has a value worth reading — a bare
		// class, mostly, maybe one stray own field like a function's own `.name`) reads
		// better as a wrapping row of chips than 13 tall single-word rows.
		const props = this.own_properties();
		const with_value = props.filter(name => this.value_for(name) !== undefined).length;
		const bare = props.length && with_value / props.length <= .25;
		if (props.length) this.group("Properties", `ux-content-object-properties${bare ? " chips" : ""}`, props, name => this.property_row(name));

		const methods = this.own_methods();
		if (methods.length) this.group("Methods", "ux-content-object-methods", methods, name => this.method_row(name));
	}

	/* One labelled group (a list of rows), capped so the card stays short. */
	group(title, list_class, names, row){
		div.c("ux-content-object-group", () => {
			span.c("ux-content-object-label-row", title);
			ul.c(list_class, () => this.rows(names, list_class, row));
		});
	}

	rows(names, list_class, row, cap = 12){
		if (names.length <= cap) return names.forEach(row);

		names.slice(0, cap).forEach(row);
		li.c("ux-content-object-more", () => details(() => {
			summary(`+${names.length - cap} more`);
			ul.c(list_class, () => names.slice(cap).forEach(row));
		}));
	}

	property_row(name){
		const value = this.value_for(name);
		return li.c("ux-content-object-property", () => {
			this.name_span("ux-content-object-name", name, "property");
			if (value !== undefined){
				span.c("ux-content-object-eq", "=");
				span.c("ux-content-object-value").attr("title", this.describe(value, true)).append(this.describe(value));
			}
		});
	}

	method_row(name){
		return li.c("ux-content-object-method", () => this.name_span("ux-content-object-link", name, "method"));
	}

	/* A name, linked to wherever this card knows the member's real page lives: the
	 * rail's own address (`api`) when this card sits on that rail's own tab, else the
	 * module's Docs tab (`doc`), else nowhere — plain text. */
	name_span(cls, name, kind){
		const href = this.api ? `${this.api}${name}/` : this.doc ? `${this.doc}doc/${kind}/${name}/` : null;
		if (href) return a.c(cls).attr("href", href).append(name);
		return span.c(cls, name);
	}

	/* One line, however long the real value is — `full` skips the cut, for the title attr. */
	describe(value, full = false){
		if (value === undefined) return "undefined";
		if (value === null) return "null";
		if (typeof value === "string") return this.cut(JSON.stringify(value), full);
		if (typeof value === "number" || typeof value === "boolean") return String(value);
		if (Array.isArray(value)) return `Array(${value.length})`;
		if (typeof value === "object") return value.constructor && value.constructor !== Object ? `${value.constructor.name} {…}` : "{…}";
		return this.cut(String(value), full);
	}

	cut(text, full){ return full || text.length <= 40 ? text : text.slice(0, 37) + "…"; }
}

ObjectCard.prototype.classes = "ux-content-object";

/* The one call: `object(instance)` or `object(Class)`, matching how the other Content
 * modules render — one function, everything from one data object. */
export function object(subject, opts = {}){ return new ObjectCard({ subject, ...opts }); }

export { ObjectCard };
