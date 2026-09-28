import View, { div, span, a, ul, li, details, summary } from "../../../core/View/View.js";

/**
 * class ObjectCard extends View — a small card that shows what a real object IS instead
 * of explaining it in words: its class name, its instance name when it has one, its
 * properties as `name = value`, and its methods as names.
 *
 *   object(page)                          // an instance — header shows its name too
 *   object(Page)                          // a class itself — no instance name
 *   object(Page, { doc: "/framework/core/Page/", properties: "title children url" })
 *   object(plain, { inline: true })       // the compact, inline-width look
 *
 * `doc` is the module's own Doc base url (the page that owns `doc/property/<name>.md`
 * and `doc/method/<name>.md`) — with it, every name links to its doc page; without it
 * the names still show, just as plain text, because this card cannot guess where
 * another module's docs live.
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

	/* Method names live on the prototype: the instance's, or — for a bare class — its
	 * own. Stops at Object.prototype so a plain `{}` shows no Methods at all instead of
	 * hasOwnProperty / __defineGetter__ and the rest of the furniture nobody asked for. */
	own_methods(){
		if (this.methods) return Array.isArray(this.methods) ? this.methods : String(this.methods).trim().split(/\s+/).filter(Boolean);

		const proto = typeof this.subject === "function" ? this.subject.prototype : Object.getPrototypeOf(this.subject ?? {});
		if (!proto || proto === Object.prototype) return [];

		return Object.getOwnPropertyNames(proto).filter(name => name !== "constructor" && typeof proto[name] === "function");
	}

	render(){
		if (this.inline) this.ac("inline");

		const klass = this.klass();
		const label = typeof this.subject === "function" ? null : (this.subject?.name ?? this.subject?.path ?? this.subject?.url);

		div.c("ux-content-object-head", () => {
			span.c("ux-content-object-class", klass?.name ?? "Object");
			if (label) span.c("ux-content-object-label", String(label));
		});

		const props = this.own_properties();
		if (props.length) this.group("Properties", "ux-content-object-properties", props, name => this.property_row(name));

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

	/* A name, linked to its doc page when this card knows where the module's docs are. */
	name_span(cls, name, kind){
		if (this.doc) return a.c(cls).attr("href", `${this.doc}doc/${kind}/${name}/`).append(name);
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
