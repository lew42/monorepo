import { View, div, h2, h3, p, span, a, code, icon, details, summary, is } from "../../core/View/View.js";
import Item from "../../core/Item/Item.js";
import md from "../markdown/md.js";
import { view } from "../../ux/Content/Object/DefaultView.js";
import { Doc } from "./Doc.js";

View.stylesheet(import.meta, "ClassDoc.css");

/**
 * class ClassDoc extends Doc — a class's page that shows before it tells (doc/class-doc.md). Its Overview is,
 * top to bottom: the class line, a live instance, its life cycle in one picture, its core test drawn step by
 * step, and its methods. Each method is a page at `methods/<name>/`, built by `route(name)`, never a page.js.
 *
 *   new ClassDoc({
 *     meta: import.meta, title: "Item", subject: Item,
 *     holds: "an id, a data bag, a parent",      // the class line
 *     example: () => new Box({ title: "Milk" }), // drawn live with view()
 *     life: { who: [...], path: [...] },         // Item.life.js
 *     steps,                                     // Item.steps.js: [{title, code, note, run, check, show}]
 *     run_steps,                                 // the runner the node test uses too
 *     method_list: { set: {job, example}, … },   // Item.methods.js
 *     method_notes: "set get toJSON",            // doc/method/<name>.md, only these
 *     method_setup: "// shop(): …",              // a comment shown above every example, for a helper they share
 *     content(){ … },                            // anything else, drawn after
 *   })
 *
 * Everything a Doc takes still works (notes, files, children). With a `method_list` the API tab is replaced by
 * Methods; the old `api/<name>/` urls route to the same method pages.
 */
export class ClassDoc extends Doc {

	// The Overview: the drawing first, then the page's own content(), if any.
	overview_section(){
		const doc = this, own = this.content.value;
		return this.section("overview", "Overview", {
			title: this.title,
			icon: this.icon,
			content(){ doc.draw_class(); if (is.fn(own)) return own.call(doc); },
			children: Array.isArray(this.overview) ? this.overview : Doc.names(this.overview),
			initialize(){ this.catalog(); },
			render(){
				return this.view ??= div.c("page doc-section", () => this.content.render()).ac("page--" + this.name);
			},
		});
	}

	draw_class(){
		div.c("doc-class wide", () => {
			this.class_line();
			div.c("doc-class-top", () => {
				if (this.example) this.class_box("A live one", "visibility", () => view(this.example(), { open: 2 }));
				if (this.life) this.class_box("How a change is saved", "sync_alt", () => this.life_picture());
			});
			if (this.steps) this.steps_view();
			if (this.method_list) this.class_box("Methods", "functions", () => this.method_wall());
		});
	}

	class_box(title, symbol, body){
		return div.c("doc-class-box", () => {
			h3.c("doc-class-head", () => { icon(symbol); span(title); });
			body();
		});
	}

	// `Item` extends `Events` · holds: an id, a data bag, a parent
	class_line(){
		const parent = Object.getPrototypeOf(this.subject);
		const base = this.extends ?? (parent === Function.prototype ? null : parent.name || "a mixin");
		p.c("doc-class-line", () => {
			code(this.subject.name);
			if (base) { span(" extends "); code(base); }
			if (this.holds) { span.c("doc-class-sep", " · holds "); span(this.holds); }
		});
	}

	// Who makes or changes one → the hops to the file → every other tab.
	life_picture(){
		const hop = (one, n) => div.c("doc-class-hop", () => {
			icon(one.icon);
			div(() => {
				div.c("doc-class-hop-name", (n ? n + ". " : "") + one.name);
				code(one.code);
				div.c("doc-class-hop-says", one.says);
			});
		}).attr("title", one.src ?? "");

		div.c("doc-class-life", () => {
			div.c("doc-class-who", () => this.life.who.forEach(one => hop(one)));
			div.c("doc-class-arrow", () => icon("arrow_forward"));
			div.c("doc-class-path", () => this.life.path.forEach((one, i) => hop(one, i + 1)));
		});
	}

	// The core test on screen: one card per step, placed now and filled as each step runs (no DOM after an await).
	steps_view(){
		let $tally;
		this.class_box("Its test, step by step", "checklist", () => {
			$tally = p.c("doc-class-tally", "Running…");
			const cards = new Map();
			div.c("doc-class-steps", () => this.steps.forEach((step, i) => cards.set(step, div.c("doc-class-step", () => {
				div.c("doc-class-step-head", () => { span.c("doc-class-step-n", String(i + 1)); span(step.title); });
				code(step.code);
			}))));

			this.run_steps(this.steps, (step, t, ok, error) => {
				const lines = t.lines;
				cards.get(step).ac(ok ? "is-pass" : "is-fail").append(() => {
					div.c("doc-class-step-verdict", () => { icon(ok ? "check_circle" : "cancel"); span(ok ? step.note : error?.message ?? "the check failed"); });
					div.c("doc-class-step-object", () => view(snapshot(step.show(t)), { open: 3 }));
					div.c("doc-class-step-lines", () => lines.length
						? lines.forEach(line => code(JSON.stringify(line)))
						: span.c("muted", "no line written"));
				});
			}).then(results => {
				const passed = results.filter(r => r.ok).length;
				$tally.text(`${passed} of ${results.length} steps pass here.` + (this.steps_test ? ` Node runs the same steps: ${this.steps_test}` : ""));
			});
		});
	}

	// ---- methods ----

	// Every method as a card: its call and its job; each links to its page.
	method_wall(){
		div.c("doc-class-methods", () => Object.entries(this.method_list).forEach(([name, one]) =>
			a.c("doc-class-method", () => {
				code(this.signature(name, one));
				span(one.job);
			}).href(this.url + "methods/" + name + "/")));
	}

	// `set(a, b)`, read off the class (`static: true`) or its prototype, default values dropped.
	signature(name, one){
		const fn = one.static ? this.subject[name] : this.subject.prototype[name];
		const params = String(fn ?? "").match(/^[^(]*\(([^)]*)\)/)?.[1] ?? "";
		const list = params.replace(/\{[^}]*\}?/g, "{…}").replace(/\s*=[^,]*/g, "").replace(/\s+/g, " ").trim();
		return `${one.static ? this.subject.name + "." : ""}${name}(${list})`;
	}

	// A routed method page: signature, job, the example's code and its live result, then its notes.
	method_page(name){
		const doc = this, one = this.method_list[name];
		if (!one) return;
		return {
			title: name,
			content(){
				a.c("class-card-back", () => { icon("arrow_back"); span(`${doc.title} methods`); }).href(doc.url + "methods/");
				div.c("doc-class-method-page", () => {
					code.c("doc-class-sig", doc.signature(name, one));
					p.c("doc-class-job", one.job);
					if (one.example) doc.class_box("Try it", "bolt", () => {
						(code.js ?? code)((doc.method_setup ? doc.method_setup + "\n" : "") + body(one.example));
						let result, error;
						try { result = one.example(); } catch (e){ error = e; }
						div.c("doc-class-result", () => error ? span.c("doc-class-error", error.message) : view(result, { open: 2 }));
					});
				});
				if (Doc.names(doc.method_notes).includes(name)) return md.file(doc.meta, `doc/method/${name}.md`, { h1: false });
			},
		};
	}

	// The Methods tab replaces API when there is a method list: a wall of cards, each routed below it.
	api_section(){
		if (!this.method_list) return super.api_section();
		const doc = this, names = Object.keys(this.method_list);
		return this.section("methods", "Methods", {
			route(name){ return doc.method_page(name); },
			render(){
				return this.view ??= div.c("page doc-section", () => this.tabs(names.join(" "), { home: () => doc.method_wall() }).ac("vertical"))
					.ac("page--methods");
			},
		});
	}

	// Old links to `api/<name>/` (ClassCard rows on other class pages, older docs) land on `methods/<name>/`, and the
	// address bar says so: the same shape as Doc's docs → doc redirect (Doc.child), replaceState so Back skips it.
	async child(name, levels){
		if (name !== "api" || !this.method_list || this.children.get("api")) return super.child(name, levels);
		const page = await super.child("methods", levels);
		const old = this.url + "api";
		if (page && location.pathname.startsWith(old)) history.replaceState(history.state, "", this.url + "methods" + location.pathname.slice(old.length) + location.search + location.hash);
		return page;
	}

	has_member(name){ return this.method_list ? name in this.method_list : super.has_member(name); }
}

// A copy of the object as it is now, so a later step cannot change what an earlier card shows.
function snapshot(x){ return x instanceof Item ? Item.hydrate(JSON.parse(JSON.stringify(x))) : x; }

// An example's body, one statement per line: what you would type.
function body(fn){
	const src = String(fn), inner = src.slice(src.indexOf("{") + 1, src.lastIndexOf("}")).trim();
	return inner.includes("\n")
		? inner.split("\n").map(line => line.replace(/^\t+/, "")).join("\n")
		: inner.split(/;\s+/).map(s => s.replace(/;$/, "")).join(";\n") + ";";
}

export default ClassDoc;
