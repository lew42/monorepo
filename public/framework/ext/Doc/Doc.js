import { View, div, h1, code, span, a, icon, is } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";
import PageWork from "../../core/Page/ai/PageWork.js";
import PageInbox from "../../core/Page/PageInbox.js";
import { member, patched, dedent } from "../../util/source/source.js";
import md from "../markdown/md.js";
import files, { nest } from "../files/files.js";
import { decision_menu } from "./decisions.js";
import ClassCard from "./ClassCard.js";
import "../tabs/tabs.js";      // this.tabs() — ext leaning on ext, the allowed direction
import "../catalog/catalog.js";   // this.catalog() — the Overview section is one

// CSS classes in Doc.css (see readme.md for style layers and exported names)
View.stylesheet(import.meta, "Doc.css");

// History and reasons: doc/Doc-notes.md
export class Doc extends Page {

	// ⚠ Runs inside the Page constructor, BEFORE load_all_children() — which is what
	// settles the sections added here as well as the declared children. And AFTER
	// assign(), so `this.methods`, `this.notes` and the rest are already here.
	// ⚠ No class fields anywhere in this file: they initialize after super() returns,
	// which is after this has run.
	initialize(){ if (Doc.is_class(this.subject)) ClassCard.registry.set(this.subject, this); this.sections(); }

	sections(){
		this.overview_section();
		this.api_section();
		this.docs_section();
		this.files_section();
		this.tasks_section();
		this.inbox_section();
		return this;
	}

	// See doc/Doc-notes.md for nav()
	nav(){ return { ...super.nav(), class_card: Doc.is_class(this.subject) }; }

	// ⚠ Redirect "docs" to "doc" (see doc/Doc-notes.md); replaceState not pushState.
	// ⚠ Only runs when this Doc instance is asked for "docs", not on plain Pages.
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

	// ⚠ `nav: true` pins derived tabs without a fetch (see doc/Doc-notes.md).
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

	// ⚠ Bind content to Doc, not section (doc/Doc-notes.md).
	overview_section(){
		return this.section("overview", "Overview", {
			title: this.title,
			icon: this.icon,
			content: is.fn(this.content.value) ? this.content.value.bind(this) : this.content.value,
			children: Array.isArray(this.overview) ? this.overview : Doc.names(this.overview),
			initialize(){ this.catalog(); },
			render(){
				return this.view ??= div.c("page doc-section", () => this.content.render())
					.ac("page--" + this.name);
			},
		});
	}

	// An empty section has no tab: no members, no API; no notes, no Docs.
	api_section(){
		if (!Doc.names(`${this.properties ?? ""} ${this.methods ?? ""}`).length) return;

		// A class's API tab opens on its ClassCard (doc/class-card.md); members stay pages at api/<name>/.
		const doc = this, card = Doc.is_class(this.subject);

		return this.section("api", "API", {
			initialize(){ this.parent.api(this); },
			render(){
				return this.view ??= div.c("page doc-section", () => {
					const tabs = this.tabs(undefined, card ? { home: () => new ClassCard({ doc }) } : undefined).ac("vertical");
					if (card) tabs.ac("class-api");
				}).ac("page--" + this.name);
			},
		});
	}

	// Has a member page: listed in `methods:` or `properties:`.
	has_member(name){ return Doc.names(`${this.properties ?? ""} ${this.methods ?? ""}`).includes(name); }

	// ⚠ Order matters: api_section() first, so member_index is filled (see doc/Doc-notes.md).
	docs_section(){
		const has_notes = Doc.names(this.notes).length > 0;
		const has_members = [...(this.member_index?.values() ?? [])].some(names => names.size);

		if (!has_notes && !has_members) return;

		const doc = this;

		return this.section("doc", "Docs", {
			initialize(){ if (has_notes) doc.docs(this); },
			// Flat names render as tab bar; nested names use note_tree() (see doc/Doc-notes.md).
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

	// See doc/Doc-notes.md for member_group aliasing logic.
	member_group(kind){
		const doc = this;
		const names = this.member_index?.get(kind) ?? new Map();

		return { title: `${this.title} ${kind}s`, route(name){ return names.has(name) && doc.member_page_config(name, names.get(name), kind); } };
	}

	// Every Doc page gets an Inbox tab; `no_inbox: true` opts out. The tab label carries the unread count.
	// ⚠ Stored as `mailbox`: `page.inbox` is already the array core/Page/ext/Inbox fills.
	inbox_section(){
		if (this.no_inbox) return;

		const mailbox = this.mailbox = new PageInbox({ page: this });
		const section = this.section("inbox", "Inbox", { render(){ return this.view ??= div.c("page doc-section", () => mailbox.view()).ac("page--inbox"); } });
		mailbox.section = section;
		return section;
	}

	// Every Doc page gets a Tasks tab: the module's own `tasks/task.jsonl` list Task (step 14a/14b), ranked by Task.rank.
	// `no_tasks: true` opts out. Built only when the tab opens (render() runs then), so no page load fetches it.
	tasks_section(){
		if (this.no_tasks) return;

		const doc = this;
		return this.section("tasks", "Tasks", {
			render(){
				return this.view ??= div.c("page doc-section doc-tasks", () => {
					const box = div.c("doc-tasks-list", "Loading tasks…");
					doc.tasks_into(box);
				}).ac("page--tasks");
			},
		});
	}

	// The tab draws what the module's tasks/ page draws: TasksPage.into (core/Task/TasksPage.js), imported when the tab opens.
	async tasks_into(box){
		const { default: TasksPage } = await import("../../core/Task/TasksPage.js");
		return TasksPage.into(box, this.url + "tasks/");
	}

	// See doc/Doc-notes.md for files_section layout (one view, custom render).
	files_section(){
		if (!Doc.names(this.files).length) return;

		const doc = this;

		return this.section("files", "Files", {
			render(){
				return this.view ??= div.c("page doc-section doc-files", () => {
					div.c("doc-files-body", () => {
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

	// See doc/Doc-notes.md for api() override pattern (prefix to avoid name collisions).
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

	// Notes are prose at doc/<name>.md; see doc/Doc-notes.md for nesting.
	docs(section){
		Doc.names(this.notes).forEach(name => this.declare_note(section, name));
		return section;
	}

	// See doc/Doc-notes.md for nested note page sharing logic.
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

	// See doc/Doc-notes.md; kind records member_index (method | property).
	member_page(section, name, config, kind){
		if (kind) this.remember_member(kind, name, config);
		return section.add(name, this.member_page_config(name, config, kind));
	}

	// Extract module path from url for decision.jsonl matching (see doc/Doc-notes.md).
	module(){ return this.url?.replace(/^\/framework\//, "").replace(/\/$/, ""); }

	remember_member(kind, name, config){
		this.member_index ??= new Map();
		if (!this.member_index.has(kind)) this.member_index.set(kind, new Map());
		this.member_index.get(kind).set(name, config);
	}

	// See doc/Doc-notes.md (member_page_config can build same address twice, kind-specific).
	member_page_config(name, { title = name, source, subject, call, banner, file }, kind){
		const doc = this;

		return {
			title,
			content(){
				// decision_menu() is a promise, appended when Collab.Decisions.for() resolves.
				if (kind && Doc.is_class(doc.subject)) a.c("class-card-back", () => { icon("arrow_back"); span(`${doc.title} API`); }).href(doc.url + "api/");
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

	// See doc/Doc-notes.md (only classes can have instance overrides).
	overrides(subject, name, call){
		if (!Doc.is_class(subject)) return;

		// ⚠ Every function owns `name`, `length` and `prototype` — Doc.intrinsic's trap.
		if (!Object.hasOwn(subject, name) || Object.hasOwn(subject.prototype, name) || Doc.intrinsic.test(name))
			md(`**Overrides:** \`new ${subject.name}({ ${call} })\` — an assigned member shadows the prototype's, for that instance only. A subclass changes it for every instance.`);
	}

	// ⚠ "doc" tab shows only when there are real notes (see doc/Doc-notes.md).
	bar(){
		const middle = [...this.children.keys()]
			.filter(name => !Doc.SECTIONS.includes(name))
			.filter(name => this.tab_visible(name))
			.sort((a, b) => this.tab_order(a) - this.tab_order(b));

		this.md_tab();

		return ["overview", ...middle, "api", "doc", "md", "files", "tasks", "inbox"]
			.filter(name => name === "doc" ? Doc.names(this.notes).length > 0 : name === "md" || this.children.has(name));
	}

	// The md tab (the Markdown Explorer, core/Page/doc/markdown.md): shown when the module has notes or a readme.md in its own file list.
	// It is always in the strip's list (ext/tabs fixes the list at the first draw) and its `nav` state says whether it shows: false
	// until the file list is read, then redrawn. Never on a module with neither.
	md_tab(){
		const has = Doc.names(this.notes).length > 0 || Page.loaded_listing(this.md_dir())?.files.includes("readme.md");
		const set = nav => (this.tabs_state ??= new Map()).set("md", { ...this.tabs_state.get("md"), nav });

		if (has || Page.loaded_listing(this.md_dir()) !== undefined) return void set(!!has);

		if (!this.tabs_state?.has("md")) {
			set(false);
			Page.listing(this.md_dir()).then(found => { if (found?.files.includes("readme.md")) { set(true); this.nav_redraw?.(); } });
		}
	}

	// See doc/Doc-notes.md (wall shows declared children, not derived sections).
	wall(){
		return this.previews(new Map([...this.children].filter(([name]) => !Doc.SECTIONS.includes(name))));
	}

	// See doc/Doc-notes.md (title + tab strip in one full-bleed band, with sidebar icon).
	well(){ return div.c("doc-well", () => h1.c("doc-title h2", () => { if (this.icon) icon(this.icon); span(this.title); })); }

	// See doc/Doc-notes.md (nested Doc renders as left rail, not stacked wells).
	nested_in_doc(){
		for (let page = this.parent; page; page = page.parent)
			if (page instanceof Doc) return true;
		return false;
	}

	render(){
		const nested = this.nested_in_doc();

		const fresh = !this.view;
		const view = this.view ??= div.c(`page ${nested ? "doc-section" : "doc-page"}`, () => {
			if (!nested) this.well();
			this.tabs(this.bar().join(" ")).ac(nested ? "vertical" : "block");
		})
			.ac(this.name && "page--" + this.name)
			.ac(this.classes);

		if (fresh) this.mailbox?.start();   // Streams page.jsonl for unread count in tab.
		if (fresh && this.url) view.append(() => { span.c("page-open").append(PageWork.line(this.url)); });
		return view;
	}
}

// See doc/Doc-notes.md (reuses ext/files styles for note tree, links not click handlers).
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

// See doc/Doc-notes.md (derived sections: read by bar() and wall()).
Doc.SECTIONS = ["overview", "api", "doc", "md", "files", "tasks", "inbox"];

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
