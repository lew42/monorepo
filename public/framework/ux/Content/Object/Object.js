import View, { div, span, a, ul, li } from "../../../core/View/View.js";

/**
 * class ObjectCard extends View — a small card that shows what a real object IS instead
 * of explaining it in words: its class name, its instance name when it has one, its
 * properties as `name = value`, and its methods as names.
 *
 *   object(page)                          // an instance — header shows its name too
 *   object(Page)                          // a class itself — no instance name
 *   object(Page, { doc: "/framework/core/Page/" })   // methods link to their doc pages
 *   object(plain, { inline: true })       // the compact, inline-width look
 *
 * `doc` is the module's own Doc base url (the page that owns `doc/method/<name>.md`);
 * without it the method names still show, just as plain text instead of links — this
 * card cannot guess where another module's docs live.
 * `properties` overrides which property names to show; the default is every own
 * enumerable property of the subject, minus functions and DOM/View nodes.
 */
export default class ObjectCard extends View {

	/* The class behind the subject: itself, when the subject IS a class. */
	klass(){ return typeof this.subject === "function" ? this.subject : this.subject?.constructor; }

	/* Properties live on the subject itself (assign-based OOP puts every field there,
	 * on the instance) — a bare class function has none of its own to show, only statics,
	 * which is exactly what Object.entries(a function) already gives us. */
	own_properties(){
		if (this.properties) return this.properties;

		return Object.keys(this.subject ?? {}).filter(key => {
			const value = this.subject[key];
			return typeof value !== "function" && !(value?.el || value instanceof Node);
		});
	}

	/* Method names live on the prototype: the instance's, or — for a bare class — its own. */
	own_methods(){
		const proto = typeof this.subject === "function" ? this.subject.prototype : Object.getPrototypeOf(this.subject ?? {});
		if (!proto) return [];

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
		if (props.length) ul.c("ux-content-object-properties", () => props.forEach(name => this.property_row(name)));

		const methods = this.own_methods();
		if (methods.length) ul.c("ux-content-object-methods", () => methods.forEach(name => this.method_row(name)));
	}

	property_row(name){
		return li.c("ux-content-object-property", () => {
			span.c("ux-content-object-name", name);
			span.c("ux-content-object-eq", "=");
			span.c("ux-content-object-value").attr("title", this.describe(this.subject[name], true)).append(this.describe(this.subject[name]));
		});
	}

	method_row(name){
		return li.c("ux-content-object-method", () => {
			if (this.doc) a.c("ux-content-object-link").attr("href", `${this.doc}doc/method/${name}/`).append(name);
			else span.c("ux-content-object-link", name);
		});
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
