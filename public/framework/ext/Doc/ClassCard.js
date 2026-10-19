import { View, div, span, details, summary } from "../../core/View/View.js";
import item from "../../ui/item/item.js";
import { build_row } from "../Mention/Mention.js";
import refs from "../Mention/maps/refs.js";

// The API tab's home for a class: shape, weights and the inheritance rule are in doc/class-card.md
export class ClassCard extends View {

	// A class page's whole API on one screen. `doc` is the Doc whose `subject` is a class.
	//   new ClassCard({ doc })
	render(){
		const doc = this.doc;
		const groups = ClassCard.chain(doc);
		const [own, ...bases] = groups;
		const core = ClassCard.core(doc, own);

		div.c("class-card-title", () => {
			// the same card the `#Class` mention draws (ext/Mention), only bigger
			div.c("class-card-name").append(build_row(doc.title, { icon: doc.icon ?? "data_object", url: doc.url, kind: "class", class_card: true }, "mention"));
			if (doc.description) span.c("class-card-gist", doc.description);
		});

		if (core.length) this.section("Core API", () => this.rows(core, doc));

		const rest = own.members.filter(m => !core.includes(m));
		if (rest.length) this.section(core.length ? `Also on ${own.name}` : `On ${own.name}`, () => this.rows(rest, doc));

		bases.forEach(group => this.inherited(group));
	}

	// One labelled block; `title` is text, or a function that draws it (the header may hold a mention).
	section(title, body){
		return div.c("class-card-group", () => {
			div.c("class-card-head", typeof title === "function" ? title : () => span(title));
			body();
		});
	}

	// The unboxed rows: members with a page first, in one grid; the rest (no page yet) fold into one "no page yet" disclosure.
	rows(members, doc, linked = name => doc.has_member?.(name) ?? false){
		const paged = members.filter(m => linked(m.name)), bare = members.filter(m => !linked(m.name));
		const grid = list => div.c("class-card-items", () => list.forEach(m => this.row(m, doc, linked)));

		return div.c("class-card-rows", () => {
			if (paged.length) grid(paged);
			if (!bare.length) return;
			details.c("class-card-more", () => {
				summary(paged.length ? `${bare.length} more, no page yet` : `${bare.length} members, no page yet`);
				grid(bare);
			});
		});
	}

	row(member, doc, linked){
		const row = item({ icon: member.kind === "method" ? "play_arrow" : "label", name: member.label, href: linked(member.name) ? `${doc.url}api/${member.name}/` : undefined })
			.ac("class-card-item").ac(member.kind);
		if (member.weight !== undefined) row.attr("title", `weight ${member.weight}`);
		return row;
	}

	// A base class: its group header is its own `#Class` mention; its members link to its API tab once its Doc is known.
	inherited(group){
		const entry = group.name ? refs[group.name] : undefined;
		this.section(() => {
			span("Inherited from");
			if (group.name) span.c("class-card-base").append(build_row(group.name, { icon: entry?.icon ?? "data_object", url: entry?.url, kind: "class", class_card: true }));
			else span("a mixin");   // a class built by a function (Events) has no name to mention
		}, () => {
			const box = div.c("class-card-box");
			const fill = base => box.empty(() => this.rows(group.members, base ?? { url: entry?.url }, name => !!base?.has_member(name)));
			fill();
			ClassCard.doc_of(group.klass).then(fill);   // no DOM here after the await: `box` was captured above
		});
	}

	// Own group first, then one group per base class, read off the live prototype chain. Each group: { klass, name, members }.
	// A member is { name, label, kind, weight? }. Order inside a group: weighted (high first), declared, then the rest as the class holds them.
	static chain(doc){
		const groups = [];
		const weights = ClassCard.weights(doc.core);
		const declared_methods = Doc_names(doc.methods), declared_props = Doc_names(doc.properties);

		for (let proto = doc.subject.prototype, first = true; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto), first = false){
			const klass = proto.constructor;
			const members = [];
			const taken = new Set();

			for (const name of Object.getOwnPropertyNames(proto)){
				if (name === "constructor" || name.startsWith("_")) continue;
				const d = Object.getOwnPropertyDescriptor(proto, name);
				taken.add(name);
				if (typeof d.value === "function") members.push({ name, label: name + ClassCard.params(d.value), kind: "method" });
				else members.push({ name, label: name, kind: "property" });
			}

			// Declared properties are instance fields: they leave nothing on the prototype, so the subject adopts them.
			if (first) declared_props.filter(name => !taken.has(name)).forEach(name => members.push({ name, label: name, kind: "property" }));

			if (first) members.forEach(m => { m.weight = weights.get(m.name); });
			members.forEach(m => { m.declared = first ? [...declared_methods, ...declared_props].indexOf(m.name) : -1; });

			const rank = m => m.weight !== undefined ? 0 : m.declared >= 0 ? 1 : 2;
			members.sort((a, b) => rank(a) - rank(b) || (rank(a) === 0 ? b.weight - a.weight : rank(a) === 1 ? a.declared - b.declared : 0));

			if (members.length || first) groups.push({ klass, name: klass.name, members });
		}

		return groups;
	}

	// The 5 to 7 heaviest members of the subject's own group; empty when the Doc gave no `core:` weights.
	static core(doc, own){
		return own.members.filter(m => m.weight !== undefined).slice(0, 7);
	}

	// "child:10 add:9 render" → Map { child → 10, add → 9, render → 1 }. A bare name weighs 1.
	static weights(core){
		return new Map(Doc_names(core).map(entry => {
			const [name, weight] = entry.split(":");
			return [name, weight === undefined ? 1 : Number(weight)];
		}));
	}

	// "(name, levels)" from the function's own source, cut short; accessors and odd shapes give "".
	static params(fn){
		const text = String(fn).replace(/^(async\s+)?(static\s+)?\*?\s*[\w$]*\s*/, "");
		const match = text.match(/^\(([^)]*)\)/);
		if (!match) return "";
		const list = match[1].replace(/\{[^}]*\}?/g, "{…}").replace(/\s*=[^,]*/g, "").replace(/\s+/g, " ").trim();   // names only, no defaults
		return list ? `(${list.length > 28 ? list.slice(0, 27) + "…" : list})` : "()";
	}

	// The Doc that documents `klass`: one already loaded, else the one its `#Class` url imports. Resolves null when neither exists.
	static async doc_of(klass){
		const known = ClassCard.registry.get(klass);
		if (known) return known;

		const url = refs[klass.name]?.url;
		if (!url) return null;
		try { await import(url + "page.js"); } catch { return null; }
		return ClassCard.registry.get(klass) ?? null;
	}
}

// Doc.names, without importing Doc (Doc imports this file).
const Doc_names = names => (names ?? "").trim().split(/\s+/).filter(Boolean);

ClassCard.prototype.classes = "class-card";

// subject class → its Doc, filled by Doc.register() as each Doc is built
ClassCard.registry = new Map();

export default ClassCard;
