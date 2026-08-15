import { View, div, h1, code } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";
import { member, patched, dedent } from "../../util/source/source.js";
import md from "../markdown/md.js";
import files from "../files/files.js";
import "../tabs/tabs.js";      // this.tabs() — ext leaning on ext, the allowed direction
import "../catalog/catalog.js";   // this.catalog() — the Overview section is one

/* css: .doc-page, .doc-well, .doc-title, .doc-section — all emitted below.
   Also .tab-bar (../tabs), .files (../files) and .page-catalog-pages / .page-intro /
   .page-title (../catalog and core/Page) — every emitter is imported above. */
View.stylesheet(import.meta, "doc.css");

/**
 * Doc — a module documented as a page: its files, its members, its notes.
 *
 *   export default new Doc({ meta: import.meta, title: "View", subject: View,
 *       methods: "append ac", properties: "el", notes: "capturing",
 *       files: "View.js View.css", overview: demos, content(){ … } });
 *
 * Overview | …declared children… | API | Docs | Files, derived — a call site lists
 * members and never says "tab". `subject` is whatever owns those members: a class,
 * a function with properties (`md`, `demo`), a namespace object, or nothing at all.
 *
 * Every part is a method, so a module with a different shape subclasses rather than
 * grows an option. Design record: ext/doc/readme.md.
 */
export class Doc extends Page {

	// ⚠ Runs inside the Page constructor, BEFORE load_all_children() — which is what
	// settles the sections added here as well as the declared children. And AFTER
	// assign(), so `this.methods`, `this.notes` and the rest are already here.
	// ⚠ No class fields anywhere in this file: they initialize after super() returns,
	// which is after this has run.
	initialize(){ this.sections(); }

	sections(){
		this.overview_section();
		this.api_section();
		this.docs_section();
		this.files_section();
		return this;
	}

	// A top tab: a page whose own children are a left rail. Two levels of real pages,
	// so a member is /View/api/append/ and every tab is a url.
	section(name, label, config){
		return this.add(name, {
			label,
			title: `${this.title} ${label}`,
			render(){
				return this.view ??= div.c("page doc-section", () => this.tabs().ac("vertical"))
					.ac("page-" + this.name);
			},
			...config,
		});
	}

	// The Overview is a CATALOG: the demos as a rail of live cards, and catalog() makes
	// `content` the rail's first card — the intro, wearing my title, label and icon — so
	// a module with demos and one without are the same shape. `overview:` hands the demos
	// in as child configs (an array) or names sibling directories (a string).
	overview_section(){
		return this.section("overview", "Overview", {
			title: this.title,
			icon: this.icon,
			content: this.content,
			children: Array.isArray(this.overview) ? this.overview : Doc.names(this.overview),
			initialize(){ this.catalog(); },
			render(){
				return this.view ??= div.c("page doc-section", () => this.content())
					.ac("page-" + this.name);
			},
		});
	}

	// An empty section has no tab: no members, no API; no notes, no Docs.
	api_section(){
		if (!Doc.names(`${this.properties ?? ""} ${this.methods ?? ""}`).length) return;

		return this.section("api", "API", { initialize(){ this.parent.api(this); } });
	}

	docs_section(){
		if (!Doc.names(this.notes).length) return;

		return this.section("docs", "Docs", { initialize(){ this.parent.docs(this); } });
	}

	// One view, not a rail — so it declares its own render rather than taking section()'s.
	files_section(){
		if (!Doc.names(this.files).length) return;

		const doc = this;

		return this.section("files", "Files", {
			render(){
				return this.view ??= div.c("page doc-section doc-files", () => doc.browser())
					.ac("page-files");
			},
		});
	}

	// The module's real files, each with the `.md` you wrote about it beside the source.
	browser(){
		return files(this.meta, this.files, {
			about: path => md.file(this.meta, `doc/file/${path}.md`, { h1: false }),
		});
	}

	// Properties first, then methods — what a thing IS before what it DOES.
	api(section){
		Doc.names(this.properties).forEach(name => this.member_page(section, name, {
			source: Doc.declaration(this.subject, name),
			call: `${name}: …`,
			file: `doc/property/${name}.md`,
		}));

		Doc.names(this.methods).forEach(name => {
			const fn = this.subject && member(this.subject, name);

			// ⚠ Names the App trap: /app.js's default export is the app INSTANCE, and an
			// instance carries no prototype, so every member page would come up empty.
			if (!fn) return console.warn(`Doc: ${Doc.label(this.subject)} has no member "${name}" — nothing added. ` +
				`If the subject is an instance, pass its class: import { App } from "/app.js", not the default export.`);

			this.member_page(section, name, {
				source: dedent(String(fn)),
				call: `${name}(){ … }`,
				banner: patched(fn, name) &&
					`> Replaced at runtime — an ext has patched \`${Doc.label(this.subject)}.${name}\`, and what you see below is the replacement. That is what actually runs.`,
				file: `doc/method/${name}.md`,
			});
		});

		return section;
	}

	// A note is prose that earned a url — the whole page is `doc/<name>.md`, the same
	// file the readme cites. No source pane, and no `call`: there is nothing to override.
	docs(section){
		Doc.names(this.notes).forEach(name => {
			if (section.children.has(name))
				return console.warn(`Doc: note "${name}" collides with an existing page — rename the note`);

			this.member_page(section, name, { title: name.replaceAll("-", " "), file: `doc/${name}.md` });
		});

		return section;
	}

	// The one member page shape: an optional banner, an optional source pane, the prose.
	member_page(section, name, { title = name, source, call, banner, file }){
		const doc = this;

		return section.add(name, {
			title,
			content(){
				if (banner) md(banner);
				if (source) (code.js ?? code)(source);   // highlighted if ext/highlight is loaded
				if (call) doc.overrides(name, call);

				// ⚠ Returned, not called: md.file gives a promise, and append_promise
				// places it in a view that was captured synchronously.
				return md.file(doc.meta, file, { h1: false });
			},
		});
	}

	// The framework's own override lever, and the only one a member page can name from
	// what it knows: every constructor here is Object.assign-based, so an assigned member
	// shadows the prototype's. A static has no instance to assign to, so it gets no line —
	// and a subject that is not a class has no constructor to speak of at all.
	overrides(name, call){
		const subject = this.subject;
		if (!Doc.is_class(subject)) return;

		// ⚠ Every function owns `name`, `length` and `prototype` — Doc.intrinsic's trap.
		if (!Object.hasOwn(subject, name) || Object.hasOwn(subject.prototype, name) || Doc.intrinsic.test(name))
			md(`**Overrides:** \`new ${subject.name}({ ${call} })\` — an assigned member shadows the prototype's, for that instance only. A subclass changes it for every instance.`);
	}

	// Overview first and the reference sections last, whatever order they were added in;
	// a declared child sits between. Filtered, because an empty section was never added.
	bar(){
		const ends = ["overview", "api", "docs", "files"];

		return ["overview", ...[...this.children.keys()].filter(name => !ends.includes(name)), "api", "docs", "files"]
			.filter(name => this.children.has(name));
	}

	// The title and the tab strip share one row in a full-bleed band. See readme.md.
	well(){ return div.c("doc-well", () => h1.c("doc-title h2", this.title)); }

	render(){
		return this.view ??= div.c("page doc-page", () => {
			this.well();
			this.tabs(this.bar().join(" ")).ac("block");
		})
			.ac(this.name && "page-" + this.name)
			.ac(this.classes);
	}
}

Doc.names = names => (names ?? "").trim().split(/\s+/).filter(Boolean);

Doc.label = subject => subject?.name ?? "the subject";

// ⚠ Not `typeof subject === "function"`: `md` and `demo` are functions too, and every
// function owns a `prototype`. Only a real class has instances for an assigned member
// to shadow, which is the one thing overrides() claims.
Doc.is_class = subject => typeof subject === "function" && /^class[\s{]/.test(String(subject));

Doc.intrinsic = /^(name|length|prototype|caller|arguments)$/;

/**
 * What can be shown of a property without RUNNING anything. Most have no honest
 * declaration — an instance field assigned in the constructor leaves nothing behind —
 * so the prose is the whole page, which is the honest answer.
 *
 * ⚠ A descriptor, never `subject[name]` — reading an accessor EXECUTES it.
 * ⚠ Intrinsics skip the fallback: `Function.name` answered `name = "View"` for a
 *   documented instance property called `name`, and it read as a real declaration.
 */
Doc.declaration = function(subject, name){
	if (!subject) return null;

	const own = (subject.prototype && Object.getOwnPropertyDescriptor(subject.prototype, name))
	         ?? (Doc.intrinsic.test(name) ? null : Object.getOwnPropertyDescriptor(subject, name));

	if (!own) return null;
	if (own.get || own.set) return dedent(String(own.get ?? own.set));

	const value = own.value;
	return value !== null && ["object", "function"].includes(typeof value)
		? null : `${name} = ${JSON.stringify(value)}`;
};

export default Doc;
