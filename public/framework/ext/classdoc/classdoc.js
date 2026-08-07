import { Page } from "../../core/Page/Page.class.js";
import { div, code } from "../../core/View/View.js";
import { member, patched, dedent } from "../../util/source/source.js";
import md from "../markdown/md.js";

/**
 * classdoc — a class's members as pages: real source plus prose from a sibling
 * `.md` file. Documenting a member is *writing a file*.
 *
 *   export default classdoc.page({
 *       meta: import.meta,
 *       title: "View",
 *       Class: View,
 *       methods:    "append ac on style",   // source + doc/method/<name>.md
 *       properties: "el capture",           // declaration + doc/property/<name>.md
 *       notes:      "capturing",            // doc/<name>.md — prose alone
 *       content(){ … },                     // the overview — the first tab
 *   });
 *
 * A note reads the SAME file a readme cites as "see ./doc/<name>.md" — the
 * design record, written once and served as a page.
 *
 * Design record — why the lists are typed rather than reflected, why a patched
 * method shows the patch, and the `import { App }` trap: ext/classdoc/readme.md.
 */
export function classdoc(page, Class, meta, names){
	names = classdoc.names(names);
	if (!names.length) return page;

	if (typeof Class !== "function" || !Class.prototype)
		return console.warn(`classdoc: expected a class, got ${typeof Class}. ` +
			`If this is App — import { App } from "/app.js", not the default export.`), page;

	names.forEach(name => {
		const fn = member(Class, name);

		// Loud: a typo'd name is the likeliest error in this whole feature, and it
		// would otherwise be a page that silently isn't there.
		if (!fn)
			return console.warn(`classdoc: ${Class.name} has no member "${name}" — nothing added`);

		const src = dedent(String(fn));
		const note = patched(fn, name) && `> Replaced at runtime — an ext has patched \`${Class.name}.${name}\`, and what you see below is the replacement. That is what actually runs.`;

		page.add(name, {
			title: name,
			classes: "method",
			content(){
				// before the code, or a reader compares this against the class file
				// and concludes the docs are broken
				if (note) md(note);

				(code.js ?? code)(src);   // highlighted if ext/highlight is loaded

				// returned, not called: md.file gives a promise, and append_promise
				// places it in a view that was captured synchronously
				return md.file(meta, `doc/method/${name}.md`, { h1: false });
			},
		});
	});

	return page;
}

classdoc.names = names => (names ?? "").trim().split(/\s+/).filter(Boolean);

/**
 * classdoc.properties(page, Class, meta, "el capture") — a page per property:
 * prose from `doc/property/<name>.md`, over whatever declaration can be shown
 * honestly. Most properties have none — an instance field assigned in the
 * constructor leaves nothing on the prototype, and the prose IS the page.
 */
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
// prototype EXECUTES it (member() in util/source has the war story). An accessor
// shows its function; a primitive default shows `name = value`; anything else
// has no honest one-liner, so the page is prose alone.
classdoc.declaration = function(Class, name){
	if (typeof Class !== "function" || !Class.prototype) return null;

	const own = Object.getOwnPropertyDescriptor(Class.prototype, name)
	         ?? Object.getOwnPropertyDescriptor(Class, name);

	if (!own) return null;
	if (own.get || own.set) return dedent(String(own.get ?? own.set));

	const value = own.value;
	return value !== null && ["object", "function"].includes(typeof value)
		? null : `${name} = ${JSON.stringify(value)}`;
};

/**
 * classdoc.notes(page, meta, "capturing marking") — a page per note, the whole
 * page being `doc/<name>.md`. No source pane: a note is prose that earned a url —
 * a design record, a worked trap, a topic bigger than one member.
 */
classdoc.notes = function(page, meta, names){
	classdoc.names(names).forEach(name => {
		// a note named after a method would silently replace its page in the region
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

/**
 * classdoc.page(options) — the whole class page in one call.
 *
 * A left nav of members beside a panel they render into. It is `tabs()` turned on
 * its side, so the urls, the default, the `.active` marking and the labels are all
 * core's; this only arranges them. The overview is the first entry and owns the
 * page's own url. Rail order: overview, guides, properties, methods, notes.
 */
classdoc.page = function({ Class, methods = "", properties = "", notes = "", content, ...options }){
	// Ordinary declared children join the rail too, between the overview and the
	// members — a guide belongs beside the class it is a guide to, and putting it
	// anywhere else means a second nav for the same page. `children: "layouts flow"`
	// is read here exactly as Page.declare() reads it, so there is one spelling.
	const pages = classdoc.names(options.children ?? "");

	const rail = ["overview", ...pages, ...classdoc.names(properties),
		...classdoc.names(methods), ...classdoc.names(notes)];

	return new Page(options, {

		initialize(){
			// The overview is a child like any other, so `tabs()` can make it the
			// default. Titled after the class, so the panel has exactly one h1.
			this.nav = { overview: this.title, ...this.nav };
			this.add("overview", { title: this.title, description: this.description, content });

			classdoc.properties(this, Class, this.meta, properties);
			classdoc(this, Class, this.meta, methods);
			classdoc.notes(this, this.meta, notes);

			// Always: inline members resolve instantly, declared guides get their real
			// titles — and tabs() only reads titles once `loading` exists, so this is
			// also what makes a note labelled "chain diff" rather than "chain-diff".
			this.load_all_children();
		},

		render(){
			return this.view ??= div.c("page classdoc", () =>
				this.tabs(rail.join(" ")).ac("vertical"))
				.ac("page-" + this.name)
				.ac(this.col)
				.ac(this.classes);
		},
	});
};

export default classdoc;
