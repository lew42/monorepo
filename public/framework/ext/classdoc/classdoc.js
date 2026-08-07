import { Page } from "../../core/Page/Page.class.js";
import { div, code } from "../../core/View/View.js";
import { member, patched, dedent } from "../../util/source/source.js";
import md from "../markdown/md.js";

/**
 * classdoc — a class's methods as pages: the real source, plus prose from a
 * sibling `.md` file. Documenting a method is *writing a file*.
 *
 *   export default classdoc.page({
 *       meta: import.meta,
 *       title: "View",
 *       Class: View,
 *       methods: "append ac on style stylesheet",
 *       content(){ … },                 // the overview — the first tab
 *   });
 *
 * Each name becomes a child page at `<url><name>/` rendering the source from
 * `member(Class, name)` and the notes from `doc/method/<name>.md`.
 *
 * Design record — why the list is typed rather than reflected, why a patched
 * method shows the patch, and the `import { App }` trap: ext/classdoc/readme.md.
 */
export function classdoc(page, Class, meta, names){

	if (typeof Class !== "function" || !Class.prototype)
		return console.warn(`classdoc: expected a class, got ${typeof Class}. ` +
			`If this is App — import { App } from "/app.js", not the default export.`), page;

	classdoc.names(names).forEach(name => {
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

classdoc.names = names => names.trim().split(/\s+/).filter(Boolean);

/**
 * classdoc.page(options) — the whole class page in one call.
 *
 * A left nav of members beside a panel they render into. It is `tabs()` turned on
 * its side, so the urls, the default, the `.active` marking and the labels are all
 * core's; this only arranges them. The overview is the first entry and owns the
 * page's own url.
 */
classdoc.page = function({ Class, methods = "", content, ...options }){
	const names = classdoc.names(methods);

	// Ordinary declared children join the rail too, between the overview and the
	// methods — a guide belongs beside the class it is a guide to, and putting it
	// anywhere else means a second nav for the same page. `children: "layouts flow"`
	// is read here exactly as Page.declare() reads it, so there is one spelling.
	const pages = classdoc.names(options.children ?? "");

	return new Page(options, {

		initialize(){
			// The overview is a child like any other, so `tabs()` can make it the
			// default. Titled after the class, so the panel has exactly one h1.
			this.nav = { overview: this.title, ...this.nav };
			this.add("overview", { title: this.title, description: this.description, content });

			classdoc(this, Class, this.meta, methods);

			// so the rail shows the guides' real titles rather than their url segments
			if (pages.length) this.load_all_children();
		},

		render(){
			return this.view ??= div.c("page classdoc", () =>
				this.tabs(["overview", ...pages, ...names].join(" ")).ac("vertical"))
				.ac("page-" + this.name)
				.ac(this.col)
				.ac(this.classes);
		},
	});
};

export default classdoc;
