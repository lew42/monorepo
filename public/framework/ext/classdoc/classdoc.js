import { View, div, code } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";
import { member, patched, dedent } from "../../util/source/source.js";
import md from "../markdown/md.js";
import "../tabs/tabs.js";   // this.tabs() below — ext leaning on ext, the allowed direction

/* css: .classdoc, .classdoc-group, .page-overview — all emitted below. */
View.stylesheet(import.meta, "classdoc.css");

/**
 * classdoc — a class's members as pages: real source plus prose from a sibling file.
 *
 *   classdoc.page({ meta: import.meta, title: "View", Class: View,
 *       methods: "append ac", properties: "el", notes: "capturing",
 *       overview: "demos", content(){ … } });
 *
 * Overview | …declared children… | API | Docs, derived — a call site never says "tab".
 * Design record: ext/classdoc/readme.md.
 */
export function classdoc(page, Class, meta, names){
	names = classdoc.names(names);
	if (!names.length) return page;

	if (typeof Class !== "function" || !Class.prototype)
		return console.warn(`classdoc: expected a class, got ${typeof Class}. ` +
			`If this is App — import { App } from "/app.js", not the default export.`), page;

	names.forEach(name => {
		const fn = member(Class, name);

		if (!fn)
			return console.warn(`classdoc: ${Class.name} has no member "${name}" — nothing added`);

		const src = dedent(String(fn));
		const note = patched(fn, name) && `> Replaced at runtime — an ext has patched \`${Class.name}.${name}\`, and what you see below is the replacement. That is what actually runs.`;

		page.add(name, {
			title: name,
			classes: "method",
			content(){
				if (note) md(note);

				(code.js ?? code)(src);   // highlighted if ext/highlight is loaded

				// ⚠ Returned, not called: md.file gives a promise, and append_promise
				// places it in a view that was captured synchronously.
				return md.file(meta, `doc/method/${name}.md`, { h1: false });
			},
		});
	});

	return page;
}

classdoc.names = names => (names ?? "").trim().split(/\s+/).filter(Boolean);

// A page per property. Most have no honest declaration to show — an instance field
// assigned in the constructor leaves nothing on the prototype — so the prose IS it.
classdoc.properties = function(page, Class, meta, names){
	classdoc.names(names).forEach(name => {
		const src = classdoc.declaration(Class, name);

		page.add(name, {
			title: name,
			classes: "property",
			content(){
				if (src) (code.js ?? code)(src);
				return md.file(meta, `doc/property/${name}.md`, { h1: false });
			},
		});
	});

	return page;
};

// ⚠ Descriptor, never `Class.prototype[name]` — reading an accessor off the
// prototype EXECUTES it.
classdoc.declaration = function(Class, name){
	if (typeof Class !== "function" || !Class.prototype) return null;

	// ⚠ EVERY function owns `name`, `length` and `prototype`, so the static fallback
	// answered `name = "View"` for a documented instance property called `name`.
	const own = Object.getOwnPropertyDescriptor(Class.prototype, name)
	         ?? (/^(name|length|prototype|caller|arguments)$/.test(name) ? null
	             : Object.getOwnPropertyDescriptor(Class, name));

	if (!own) return null;
	if (own.get || own.set) return dedent(String(own.get ?? own.set));

	const value = own.value;
	return value !== null && ["object", "function"].includes(typeof value)
		? null : `${name} = ${JSON.stringify(value)}`;
};

// A page per note, the whole page being `doc/<name>.md` — the same file the readme
// cites. No source pane: a note is prose that earned a url.
classdoc.notes = function(page, meta, names){
	classdoc.names(names).forEach(name => {
		if (page.children.has(name))
			return console.warn(`classdoc: note "${name}" collides with an existing page — rename the note`);

		page.add(name, {
			title: name.replaceAll("-", " "),
			classes: "note",
			content(){ return md.file(meta, `doc/${name}.md`, { h1: false }); },
		});
	});

	return page;
};

// A tab in the top bar: a page whose own children are a vertical rail. Two levels of
// real pages, so a member is /View/api/append/ and every tab is a url.
classdoc.group = function(page, name, label, config){
	return page.add(name, {
		label,
		title: `${page.title} ${label}`,
		render(){
			return this.view ??= div.c("page classdoc-group", () => this.tabs().ac("vertical"))
				.ac("page-" + this.name);
		},
		...config,
	});
};

// The whole class page in one call: Overview | …declared children… | API | Docs.
// The grouping is derived — a call site lists members, never tabs.
classdoc.page = function({ Class, methods = "", properties = "", notes = "", overview = "", content, ...options }){
	const bar = ["overview", ...classdoc.names(options.children ?? ""), "api", "docs"];

	return new Page(options, {

		// ⚠ Runs inside the Page constructor, BEFORE it calls load_all_children() —
		// which is what settles the groups added here as well as the declared children.
		initialize(){
			const meta = this.meta;

			// The overview is a child of its own group, so a set with sub pages and a
			// set without are one shape. Titled after the class: one h1 in the panel.
			classdoc.group(this, "overview", "Overview", {
				title: this.title,
				children: [{ name: "overview", title: this.title, content }, ...classdoc.names(overview)],
			});

			if (classdoc.names(`${properties} ${methods}`).length)
				classdoc.group(this, "api", "API", {
					initialize(){
						classdoc.properties(this, Class, meta, properties);
						classdoc(this, Class, meta, methods);
					},
				});

			if (classdoc.names(notes).length)
				classdoc.group(this, "docs", "Docs", {
					initialize(){ classdoc.notes(this, meta, notes); },
				});
		},

		render(){
			return this.view ??= div.c("page classdoc", () =>
				this.tabs(bar.filter(name => this.children.has(name)).join(" ")))
				.ac("page-" + this.name)
				.ac(this.classes);
		},
	});
};

export default classdoc;
