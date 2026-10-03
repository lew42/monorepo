import { View, div, h1, code, span, a, icon } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";
import { member, patched, dedent } from "../../util/source/source.js";
import md from "../markdown/md.js";
import files, { nest } from "../files/files.js";
import { decision_menu } from "./decisions.js";
import "../tabs/tabs.js";      // this.tabs() — ext leaning on ext, the allowed direction
import "../catalog/catalog.js";   // this.catalog() — the Overview section is one

/* css: .doc-page, .doc-well, .doc-title, .doc-section, .doc-decision(-wrap|-btn|-pop|-link)
   — all emitted below. Also .tab-bar (../tabs), .files (../files) and .page-catalog-pages /
   .page--intro / .page-title (../catalog and core/Page) — every emitter is imported above. */
View.stylesheet(import.meta, "Doc.css");

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
 * grows an option. Design record: ext/Doc/readme.md.
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

	// One flag, read everywhere a preview card is drawn (Page.preview_card(), the sidebar
	// tree, a future Mention chip): does this module's page document a real ES CLASS, or a
	// plain function/namespace (`md`, `demo`) that merely has members? `Doc.is_class()`
	// already answered this for the Overrides note below — this is the same fact, exposed
	// through the one method every card-drawing caller already calls (`nav_for()` →
	// `child.nav()`), so nothing has to ask `instanceof Doc` or re-derive it a second way.
	nav(){ return { ...super.nav(), class_card: Doc.is_class(this.subject) }; }

	// "docs/" is not a real page anywhere — the convention is `doc/`, everywhere (75
	// modules use it) — but someone will type "docs" out of habit (it happened once
	// already), so make it resolve instead of 404ing, with no Router change. Router.js
	// never parses a whole url: it just asks each page for `child(name)`, one segment
	// at a time (Router.js:77-88). So catching the ONE segment "docs" here is enough —
	// `docs/method/foo/` keeps walking correctly afterward, because the page this
	// returns already carries the real `.../doc/` url, and every later hop calls
	// `.child()` on THAT page object, never on a re-parsed url.
	//
	// ⚠ `history.replaceState`, never `pushState`: for an in-app click, Router's own
	// `go()` calls `load()` (which is what reaches here) BEFORE `history.pushState(...)`
	// — a `pushState` made here would just be overwritten a moment later by that later
	// call. Typing the url directly — this feature's real case — never runs `go()` at
	// all, so the fix made here is the only write to history and it sticks. Because it
	// REPLACES the current entry instead of pushing a new one, Back leaves one entry to
	// undo, not two.
	//
	// ⚠ Only ever fires when *I* (the page asked for "docs") am a Doc instance. The two
	// real pages named "docs" today (styles/layouts/docs/, core/Page/overview/docs/)
	// are children of a plain Page — a `new Page({...})` module and a `section()`-built
	// tab, respectively, never a Doc — so this override never runs for them at all.
	async child(name, levels){
		if (name !== "docs") return super.child(name, levels);

		if (this.child_source) await this.source_children();
		if (this.children.get("docs")) return super.child(name, levels);   // a real "docs" child wins

		const page = await super.child("doc", levels);
		// ⚠ Anchored on the segment, with an optional trailing slash — a plain
		// `.replace("/docs/", "/doc/")` left `.../Doc/docs` (no trailing slash) uncorrected.
		if (page) history.replaceState(history.state, "", location.pathname.replace(/\/docs(\/|$)/, "/doc$1") + location.search + location.hash);

		return page;
	}

	// A top tab: a page whose own children are a left rail. Two levels of real pages,
	// so a member is /View/api/append/ and every tab is a url.
	//
	// ⚠ 2026-09-29 fix round, finding 3: `nav: true` here PINS this tab always-shown,
	// with no fetch — Overview/API/Docs/Files are this class's own derived chrome,
	// never a real page anyone's `settings.jsonl` describes, and `this.url + name +
	// "/"` could, for an unlucky name, collide with a REAL folder somewhere that
	// does have one (core/Page/'s own "overview/" folder, for one). `tab_visible()`
	// (core/Page/Log.js) treats an explicit `nav: true` the same way it already
	// treats `nav: false` — it wins outright, no page_settings() lookup at all.
	section(name, label, config){
		this.tab({ name, nav: true });

		return this.add(name, {
			label,
			title: `${this.title} ${label}`,
			render(){
				return this.view ??= div.c("page doc-section", () => this.tabs().ac("vertical"))
					.ac("page--" + this.name);
			},
			...config,
		});
	}

	// The Overview is a CATALOG: the demos as a rail of live cards, and catalog() makes
	// `content` the rail's first card — the intro, wearing my title, label and icon — so
	// a module with demos and one without are the same shape. `overview:` hands the demos
	// in as child configs (an array) or names sibling directories (a string).
	// ⚠ `content` is BOUND to me, not to the section. catalog() makes it the intro
	// child's and would otherwise call it with the section as `this` — but it was
	// written as a method of THIS config, beside the helpers it calls, so `this.look()`
	// has to mean what the author typed. Two audit agents wrote exactly that and both
	// pages threw; the binding was the bug, not the pages.
	overview_section(){
		return this.section("overview", "Overview", {
			title: this.title,
			icon: this.icon,
			content: typeof this.content === "function" ? this.content.bind(this) : this.content,
			children: Array.isArray(this.overview) ? this.overview : Doc.names(this.overview),
			initialize(){ this.catalog(); },
			render(){
				return this.view ??= div.c("page doc-section", () => this.content())
					.ac("page--" + this.name);
			},
		});
	}

	// An empty section has no tab: no members, no API; no notes, no Docs.
	api_section(){
		if (!Doc.names(`${this.properties ?? ""} ${this.methods ?? ""}`).length) return;

		return this.section("api", "API", { initialize(){ this.parent.api(this); } });
	}

	// The "Docs" tab, PLUS a second door every member gets at the same time: whatever
	// api() (above) just built landed in `member_index` by kind, and member_group()
	// below answers `doc/method/<name>/` / `doc/property/<name>/` from it — the address
	// where the `.md` itself actually sits (declaring.md), same as a note's own
	// `doc/<name>/`. A module with members but no notes still gets this node; render()
	// only ever lists real notes, and bar() only shows the tab when one exists, so
	// nothing looks different until you go looking for the second door.
	// ⚠ Order matters: api_section() (above) runs first, so `member_index` is already
	// filled by the time this checks it — sections() calls them in that order.
	docs_section(){
		const has_notes = Doc.names(this.notes).length > 0;
		const has_members = [...(this.member_index?.values() ?? [])].some(names => names.size);

		if (!has_notes && !has_members) return;

		const doc = this;

		return this.section("doc", "Docs", {
			initialize(){ if (has_notes) doc.docs(this); },
			// A flat list (no "/" in any name) renders exactly as it always has: a
			// vertical tab bar. Only when a name NESTS ("guide/setup") does this switch
			// to note_tree() below — same classes either way, so the ~75 flat-list
			// modules see zero change.
			render(){
				const names = Doc.names(doc.notes);
				const nested = names.some(name => name.includes("/"));

				return this.view ??= div.c("page doc-section", () => {
					if (!names.length) return;
					if (nested) note_tree(this.url, names);
					else this.tabs(names.join(" ")).ac("vertical");
				})
					.ac("page--" + this.name);
			},
			route(name){ return (name === "method" || name === "property") && doc.member_group(name); },
		});
	}

	// One container per kind, answering `doc/<kind>/<name>/` from whatever api() (via
	// member_page()) actually recorded — so a second, prefixed subject
	// (`members(section, History, { prefix: "History." })`, readme.md's own example)
	// aliases exactly like the first, with nothing here naming it specially.
	member_group(kind){
		const doc = this;
		const names = this.member_index?.get(kind) ?? new Map();

		return { title: `${this.title} ${kind}s`, route(name){ return names.has(name) && doc.member_page_config(name, names.get(name), kind); } };
	}

	// One view, not a rail — so it declares its own render rather than taking section()'s.
	files_section(){
		if (!Doc.names(this.files).length) return;

		const doc = this;

		return this.section("files", "Files", {
			render(){
				return this.view ??= div.c("page doc-section doc-files", () => {
					// `.doc-files` itself is a flex ROW (Doc.css) built for exactly ONE
					// child, `doc.browser()`'s tree|about|source panels — so a second
					// child (the link) needs its OWN box, one that stacks the two
					// vertically, rather than becoming a squeezed fourth column in that
					// same row. Inline styles only: Doc.css is outside this fence.
					div.c("doc-files-body", () => {
						// This tab's own box is small — nested in the tab panel, the page
						// padding and the site sidebar — so a reader who wants the real
						// size gets the module's own full-screen `fs/` route instead.
						// core/Page/Page.class.js's fs_folder() seam; ext/files/fs.js.
						div.c("doc-files-head", () => {
							a.c("doc-files-fs", () => { icon("open_in_full"); span("Open full screen"); })
								.href(doc.url + "fs/")
								.style({ display: "inline-flex", alignItems: "center", gap: "0.3em", fontSize: "0.85em", color: "var(--subtle)", textDecoration: "none" });
						}).style({ flex: "0 0 auto" });

						doc.browser().style({ flex: "1 1 auto", minHeight: "0" });
					}).style({ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: "0", width: "100%" });
				}).ac("page--files");
			},
		});
	}

	// The module's real files, each with the `.md` you wrote about it beside the source.
	browser(){
		return files(this.meta, this.files, {
			about: path => md.file(this.meta, `doc/file/${path}.md`, { h1: false }),
		});
	}

	// What fills the API tab. One subject is the whole job for most modules; a module
	// with a SECOND class overrides this and calls members() again — the seam this
	// class exists for. `prefix` keeps the two sets from colliding, in the url and in
	// the filename both:
	//
	//   api(section){
	//       super.api(section);
	//       this.members(section, History, { methods: "push undo", prefix: "History." });
	//   }
	api(section){
		return this.members(section, this.subject, { properties: this.properties, methods: this.methods });
	}

	// Every listed member of ONE subject, as pages. Properties first, then methods —
	// what a thing IS before what it DOES.
	members(section, subject, { properties = "", methods = "", prefix = "" } = {}){
		Doc.names(properties).forEach(name => this.member_page(section, prefix + name, {
			source: Doc.declaration(subject, name),
			subject,
			call: `${name}: …`,
			file: `doc/property/${prefix}${name}.md`,
		}, "property"));

		Doc.names(methods).forEach(name => {
			const fn = subject && member(subject, name);

			// ⚠ Names the App trap: /app.js's default export is the app INSTANCE, and an
			// instance carries no prototype, so every member page would come up empty.
			if (!fn) return console.warn(`Doc: ${Doc.label(subject)} has no member "${name}" — nothing added. ` +
				`If the subject is an instance, pass its class: import { App } from "/app.js", not the default export.`);

			this.member_page(section, prefix + name, {
				source: dedent(String(fn)),
				subject,
				call: `${name}(){ … }`,
				banner: Doc.declared(subject, name) && patched(fn, name) &&
					`> Replaced at runtime — an ext has patched \`${Doc.label(subject)}.${name}\`, and what you see below is the replacement. That is what actually runs.`,
				file: `doc/method/${prefix}${name}.md`,
			}, "method");
		});

		return section;
	}

	// A note is prose that earned a url — the whole page is `doc/<name>.md`, the same
	// file the readme cites. No source pane, and no `call`: there is nothing to override.
	// A name may NEST ("guide/setup") — declare_note() below is where that is handled;
	// a flat name (no "/") goes through it too and comes out exactly as before.
	docs(section){
		Doc.names(this.notes).forEach(name => this.declare_note(section, name));
		return section;
	}

	// One plain pass-through page per segment before the last — its only job is to hold
	// the next segment's children, the same one-level trick member_group() (above)
	// plays for "method"/"property", generalized here to any depth. `guide/setup` and
	// `guide/config` share one real "guide" page, built the first time either is seen
	// and reused the second time. The LAST segment gets the real note page, the exact
	// shape a flat note always got — `doc/${name}.md`, slashes and all, is already the
	// right file, because the whole name IS the path.
	declare_note(section, name){
		const segments = name.split("/"), leaf = segments.pop();
		const parent = segments.reduce((page, seg) => page.children.get(seg) ?? page.add(seg, {
			title: seg.replaceAll("-", " "),
			content(){ return this.previews(); },   // a small wall of cards, one per child note
		}), section);

		if (parent.children.has(leaf))
			return console.warn(`Doc: note "${name}" collides with an existing page — rename the note`);

		this.member_page(parent, leaf, { title: leaf.replaceAll("-", " "), file: `doc/${name}.md` });
	}

	// The one member page shape: an optional banner, an optional source pane, the prose.
	// `kind` ("method" | "property") is the ONLY thing that makes a member open a
	// second way — recorded here into `member_index`, read back by member_group()
	// above. A note (docs(), no kind) keeps its one address, `doc/<name>/`.
	member_page(section, name, config, kind){
		if (kind) this.remember_member(kind, name, config);
		return section.add(name, this.member_page_config(name, config, kind));
	}

	// Framework-relative module path this page documents — "ext/Saver" for a page whose
	// `this.url` is "/framework/ext/Saver/" — matched against the shared decisions.jsonl's
	// own `module` field (Server/collab.mjs's `target.module`, a collab.json's own words).
	module(){ return this.url?.replace(/^\/framework\//, "").replace(/\/$/, ""); }

	remember_member(kind, name, config){
		this.member_index ??= new Map();
		if (!this.member_index.has(kind)) this.member_index.set(kind, new Map());
		this.member_index.get(kind).set(name, config);
	}

	// Pulled out of member_page() so member_group() can build the SAME page a second
	// time, at a second address, without member_page() growing a second job.
	// `kind` ("method" | "property") is also what turns on the ⋯ menu below — a note
	// (docs(), no kind) never gets one, because nothing wires a collab decision to a name
	// that isn't a real class member.
	member_page_config(name, { title = name, source, subject, call, banner, file }, kind){
		const doc = this;

		return {
			title,
			content(){
				// The owner's want (file-explorer-fs/owner-words.md, first half): a method's own
				// page shows the ⋯ the moment a design collab named it, with no AI having to
				// remember to wire the link. decision_menu() is a promise: append() places it
				// once Collab.Decisions.for() resolves, and does nothing when it resolves empty.
				if (kind && doc.module()) span.c("doc-decision-wrap").append(decision_menu(doc.module(), name));
				if (banner) md(banner);
				if (source) (code.js ?? code)(source);   // highlighted if ext/highlight is loaded
				if (call) doc.overrides(subject, name, call);

				// ⚠ Returned, not called: md.file gives a promise, and append_promise
				// places it in a view that was captured synchronously.
				return md.file(doc.meta, file, { h1: false });
			},
		};
	}

	// The framework's own override lever, and the only one a member page can name from
	// what it knows: every constructor here is Object.assign-based, so an assigned member
	// shadows the prototype's. A static has no instance to assign to, so it gets no line —
	// and a subject that is not a class has no constructor to speak of at all.
	overrides(subject, name, call){
		if (!Doc.is_class(subject)) return;

		// ⚠ Every function owns `name`, `length` and `prototype` — Doc.intrinsic's trap.
		if (!Object.hasOwn(subject, name) || Object.hasOwn(subject.prototype, name) || Doc.intrinsic.test(name))
			md(`**Overrides:** \`new ${subject.name}({ ${call} })\` — an assigned member shadows the prototype's, for that instance only. A subclass changes it for every instance.`);
	}

	// Overview first and the reference sections last, whatever order they were added in;
	// a declared child sits between. Filtered, because an empty section was never added
	// — except "doc", which docs_section() now also builds for a module with members and
	// no notes (so `doc/method/<name>/` has a node to live under): that one shows only
	// when there is a real NOTE to read, so a module gains no tab it did not have before.
	// ⚠ 2026-09-29, page-system task: a declared child can carry a `tab` line
	//   (core/Page/Log.js's `tab()`) — `tab_visible()`/`tab_order()` read it. Neither
	//   finds anything for a page that never wrote one, so this is a no-op for every
	//   Doc page that doesn't use the new lines.
	bar(){
		const middle = [...this.children.keys()]
			.filter(name => !Doc.SECTIONS.includes(name))
			.filter(name => this.tab_visible(name))
			.sort((a, b) => this.tab_order(a) - this.tab_order(b));

		return ["overview", ...middle, "api", "doc", "files"]
			.filter(name => name === "doc" ? Doc.names(this.notes).length > 0 : this.children.has(name));
	}

	// My declared children as a wall, WITHOUT the sections I derived — those are the tab
	// strip, and a module previewing them on its own Overview is previewing its own
	// chrome. `/framework/ui/` drew four extra cards that way.
	wall(){
		return this.previews(new Map([...this.children].filter(([name]) => !Doc.SECTIONS.includes(name))));
	}

	// The title and the tab strip share one row in a full-bleed band. See readme.md.
	well(){ return div.c("doc-well", () => h1.c("doc-title h2", this.title)); }

	// True once an ANCESTOR is another Doc — I am rendering inside its `.tab-panel`.
	// Two `--well` bands stacked over `--wash` read as broken alternating stripes
	// (ux/*, 2026-08-26): the fix is the shape ext/Panel/Workspace/page.js already
	// hand-wrote — no well, no second `.doc-page`, just a left rail like Doc's own
	// api/doc/files sections. render() below picks it automatically.
	nested_in_doc(){
		for (let page = this.parent; page; page = page.parent)
			if (page instanceof Doc) return true;
		return false;
	}

	render(){
		const nested = this.nested_in_doc();

		return this.view ??= div.c(`page ${nested ? "doc-section" : "doc-page"}`, () => {
			if (!nested) this.well();
			this.tabs(this.bar().join(" ")).ac(nested ? "vertical" : "block");
		})
			.ac(this.name && "page--" + this.name)
			.ac(this.classes);
	}
}

// The Docs tab as a TREE, once any note nests — reusing ext/files' own nest() for the
// grouping and its CSS classes for the look (folder icon, indent, .file-tree/.file-dir/
// .file-name — files.css), so this inherits the styling rather than forking it. The one
// real difference from ext/files' own rows(): each leaf here is a REAL routed link to
// the note's own page (`a().href(...)`), because a note has a bookmarkable url — ext/
// files draws a click handler that swaps a query param instead, right for browsing a
// file selection, wrong for a note that is its own page.
function note_tree(base, names){
	return div.c("file-tree", () => note_rows(nest(names, 0), base));
}

function note_rows(node, base){
	for (const [seg, child] of Object.entries(node)){
		if (typeof child === "string")
			a.c("file-name", () => { icon("description"); span.c("file-label", seg.replaceAll("-", " ")); })
				.href(base + child + "/");
		else
			div.c("file-dir", () => {
				div.c("file-dir-name", () => { icon("folder"); span.c("file-label", seg.replaceAll("-", " ")); });
				div.c("file-dir-body", () => note_rows(child, base));
			});
	}
}

// The sections this class derives, as opposed to the children a call site declared.
// One list, two readers: `bar()` orders the strip by it, `wall()` subtracts it.
Doc.SECTIONS = ["overview", "api", "doc", "files"];

Doc.names = names => (names ?? "").trim().split(/\s+/).filter(Boolean);

// ⚠ `||`, never `??`: a factory built as `fns[tag] = function(){}` has `name === ""`,
// which `??` happily accepts — so the warning named nothing at all.
Doc.label = subject => subject?.name || "the subject";

// ⚠ Not `typeof subject === "function"`: `md` and `demo` are functions too, and every
// function owns a `prototype`. Only a real class has instances for an assigned member
// to shadow, which is the one thing overrides() claims.
Doc.is_class = subject => typeof subject === "function" && /^class[\s{]/.test(String(subject));

Doc.intrinsic = /^(name|length|prototype|caller|arguments)$/;

/**
 * Was this member DECLARED in a class body? Which is the only case where an empty
 * `fn.name` means "an ext replaced it".
 *
 * ⚠ Without this, every method of a function-with-properties subject claimed to be
 * patched. `md.file = async function(){}` is a member-expression assignment, so
 * `md.file.name` is `""` natively — the exact signal patched() reads. Every page
 * under `subject: md` carried a false "Replaced at runtime" banner.
 */
Doc.declared = function(subject, name){
	return !!subject?.prototype && Object.hasOwn(subject.prototype, name);
};

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
