import { View, div, span, input, icon } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";

View.stylesheet(import.meta, "Omnibox.css");

const PAD = 8;    // clear of the viewport edge
const GAP = 4;    // clear of the field itself
const LIMIT = 8;  // results shown — enough to scan, few enough to redraw every keystroke
const ESCAPE_RE = /[.*+?^${}()|[\]\\]/g;
const escape_re = s => s.replace(ESCAPE_RE, "\\$&");

/**
 * Omnibox — one keyboard-first search field, always visible, that ranks the
 * whole site: the current topic's subtree first, then everywhere else.
 *
 *   new Omnibox({ app: this.app, page: this });
 *
 * Open from anywhere: `/` (nothing else focused) or Ctrl/Cmd+K. Esc closes.
 * Arrows move, Enter navigates, Tab completes the top match. A Space on an
 * EMPTY box switches search → command. The interaction-model verdicts,
 * including the one Space gets wrong, are in doc/decisions.md.
 */
export class Omnibox extends View {

	render(){
		this.query = "";
		this.mode = "search";       // "search" | "command"
		this.matches = [];
		this.active = -1;
		this.preview_token = 0;

		this.field();
		this.panel();

		// ⚠ Never removed — this box is meant to be reachable from anywhere on the
		// site for as long as the page lives, the same lifetime as the shell itself.
		this.opener = e => this.maybe_open(e);
		document.addEventListener("keydown", this.opener);

		this.ready = this.constructor.Index.build(this.source).then(index => {
			index.rows = this.constructor.Index.overlay(index.rows, this.app?.root);
			this.index = index;
			this.built?.(index);
			console.log(`omnibox: index built — ${index.rows.length} urls in ${index.ms.toFixed(1)}ms`);
		});
	}

	// ---- the always-visible field ------------------------------------------

	field(){
		return this.$field = div.c("omnibox-field surface flex v-center gap", () => {
			icon("search");
			this.$input = input().ac("omnibox-input flex-1")
				.attr("type", "text")
				.attr("aria-label", "Search the site")
				.attr("placeholder", this.placeholder())
				.on("keydown", e => this.keys(e))
				.on("input", e => this.type(e.target.value));
			this.$hint = span.c("omnibox-hint muted", "/  ·  Ctrl K");
		});
	}

	placeholder(){
		return this.mode === "command" ? "Type a command…" : "Search the site — / or Ctrl K";
	}

	// One key from ANYWHERE. `/` only when nothing editable already has focus —
	// once the box itself is focused this simply no-ops and the input types a
	// literal "/", which is correct: a url fragment may contain one.
	maybe_open(e){
		const el = document.activeElement;
		const editing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

		if (e.key === "/" && !editing) e.preventDefault();
		else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") e.preventDefault();
		else return;

		this.$input.el.focus();
		this.$input.el.select();
	}

	// ---- the results, in the top layer so no column or panel can clip them ----

	panel(){
		return this.$panel = div.c("omnibox-results")
			.attr("popover", "auto")
			.append(() => {
				this.$list = div.c("omnibox-list");
				this.$preview = div.c("omnibox-preview");
			});
	}

	// Measured off the field, exactly Dropdown's recipe: below unless there is no
	// room, clamped to the viewport either way. doc/decisions.md — why borrowed.
	place(){
		const s = this.$panel.el.style;
		s.left = s.top = "0px";
		s.inlineSize = this.$field.el.getBoundingClientRect().width + "px";

		const t = this.$field.el.getBoundingClientRect();
		const r = this.$panel.el.getBoundingClientRect();
		const fits = t.bottom + r.height + GAP + PAD <= innerHeight;

		s.left = Math.max(PAD, Math.min(t.left, innerWidth - r.width - PAD)) + "px";
		s.top = Math.max(PAD, Math.min(fits ? t.bottom + GAP : t.top - r.height - GAP, innerHeight - r.height - PAD)) + "px";
	}

	// ---- typing, ranking, drawing ------------------------------------------

	type(value){
		this.query = value;
		if (this.$input.el.value !== value) this.$input.el.value = value;
		this.active = this.matches.length ? 0 : -1;
		this.search();
	}

	search(){
		this.matches = this.mode === "command"
			? this.constructor.Index.commands(this.constructor.COMMANDS, this.query)
			: this.index ? this.constructor.Index.rank(this.index.rows, this.query, this.local_root(), LIMIT) : [];

		this.active = this.matches.length ? 0 : -1;
		this.draw();
	}

	// `nearest("topic")` when the current page has one; otherwise the current
	// page's own subtree. `this.page` may be a real Page or a lightweight stand-in
	// that only carries `.topic()`/`.url` — both work, nothing here needs more.
	local_root(){
		const topic = this.page?.topic?.();
		return (topic ?? this.page)?.url;
	}

	draw(){
		const open = this.mode === "command" || !!this.query.trim();

		if (!open){
			this.$panel.el.hidePopover?.();
			this.$list.empty();
			this.$preview.empty();
			return;
		}

		if (!this.matches.length){
			this.$list.empty(() => span.c("omnibox-empty muted", "No matches."));
			this.$preview.empty();
		}
		else {
			this.$list.empty(() => this.matches.forEach((row, i) => this.row(row, i)));
			this.preview();
		}

		if (!this.$panel.el.matches(":popover-open")) this.$panel.el.showPopover();
		this.place();
	}

	row(row, i){
		return div.c(`omnibox-row${i === this.active ? " active" : ""}`, () => {
			span.c("omnibox-row-title", row.title);
			if (row.kind !== "command") span.c("omnibox-row-url muted", row.url);
		}).click(() => this.go(row));
	}

	// The highlighted result's OWN preview() — never a card built here. A guard
	// token, because arrowing fast fires more than one import/fetch and only the
	// last one still matters (doc/decisions.md — the cost this accepts).
	async preview(){
		const row = this.matches[this.active];
		const token = ++this.preview_token;

		if (!row || row.kind === "command"){ this.$preview.empty(); return; }

		this.$preview.empty(() => span.c("omnibox-loading muted", "Loading preview…"));

		const page = await this.live(row);
		if (token !== this.preview_token) return;   // a newer highlight already landed

		this.$preview.empty(() => {
			if (page) page.preview(page.nav());
			else span.c("omnibox-loading muted", "No preview available.");
		});
	}

	// Memory first (free), then the same import doc/previews.md blesses for a
	// page.js, then the same fetch Page.file() itself makes for a `.md` route —
	// so every result's card is drawn by the real page, never a copy of it.
	async live(row){
		const known = this.constructor.Index.in_memory(row.url, this.app?.root);
		if (known) return known;

		if (row.kind === "page"){
			try {
				const mod = await import(row.url + "page.js");
				return mod.default instanceof Page ? mod.default : null;
			}
			catch { return null; }
		}

		const file = await Page.file(row.src);
		return file ? new Page({ ...file, url: row.url }) : null;
	}

	// ---- keyboard ------------------------------------------------------------

	keys(e){
		if (e.key === "Escape"){
			e.preventDefault();
			this.close();
			return;
		}

		// The cheapest version of the mode idea: Space on an EMPTY box only.
		// Typing "space invaders" from scratch collides with this — the one way
		// it is wrong, and it is real, not just theoretical. doc/decisions.md.
		if (e.key === " " && this.query === ""){
			e.preventDefault();
			this.mode = this.mode === "command" ? "search" : "command";
			this.$input.attr("placeholder", this.placeholder());
			this.$field.tc("command", this.mode === "command");
			this.search();
			return;
		}

		if (e.key === "ArrowDown" || e.key === "ArrowUp"){
			if (!this.matches.length) return;
			e.preventDefault();
			const dir = e.key === "ArrowDown" ? 1 : -1;
			this.active = (this.active + dir + this.matches.length) % this.matches.length;
			this.draw();
			return;
		}

		if (e.key === "Tab" && this.matches.length && this.mode !== "command"){
			e.preventDefault();
			this.complete();
			return;
		}

		if (e.key === "Enter"){
			const row = this.matches[this.active];
			if (!row) return;
			e.preventDefault();
			this.go(row);
		}
	}

	// Fills the box with the top match's title — never navigates by itself.
	complete(){
		const top = this.matches[0];
		if (!top) return;
		this.type(top.title);
		this.$input.el.setSelectionRange(top.title.length, top.title.length);
	}

	go(row){
		this.app.router.go(row.url);
		this.close();
	}

	close(){
		this.$panel.el.hidePopover?.();
		this.$input.el.blur();
	}
}

Omnibox.prototype.page = null;
Omnibox.prototype.source = "/directory.json";

// A short, curated stand-in for a command surface — not a real one. doc/decisions.md.
Omnibox.COMMANDS = [
	{ title: "Go home", url: "/" },
	{ title: "Open Framework", url: "/framework/" },
	{ title: "Open Platform", url: "/imagine/platform/" },
];

// The index: built once from /directory.json, ranked fresh per keystroke.
Omnibox.Index = class OmniboxIndex {

	static async build(source){
		const t0 = performance.now();
		const res = await fetch(source);
		const data = await res.json();
		const rows = [];
		this.walk(data.files, rows);
		return { rows, ms: performance.now() - t0 };
	}

	// Dirs with a page.js, plus the `.md` files beside one — one level down, per
	// core/Page/doc/declaring.md's own rule, and no deeper. No crawl, no server:
	// this is the same generated file the dev server already writes to disk.
	static walk(nodes, rows){
		for (const node of nodes){
			if (node.type !== "dir") continue;

			const kids = node.children ?? [];
			const has_page = kids.some(k => k.type === "file" && k.name === "page.js");

			if (has_page){
				rows.push({ url: `/${node.full}/`, title: this.titleize(node.name), kind: "page" });

				kids.forEach(k => {
					if (k.type !== "file" || !k.name.endsWith(".md")) return;

					const base = k.name.slice(0, -3);

					// A same-named directory WITH its own page.js wins the url —
					// the exact precedence child() resolves in, memory before .md.
					const shadowed = kids.some(s => s.type === "dir" && s.name === base
						&& (s.children ?? []).some(g => g.type === "file" && g.name === "page.js"));
					if (shadowed) return;

					rows.push({ url: `/${node.full}/${base}/`, title: this.titleize(base), kind: "md", src: `/${node.full}/${k.name}` });
				});
			}

			this.walk(kids, rows);
		}
	}

	static titleize(name){
		return name.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
	}

	// A page already resolved in the live tree wins its real title/description —
	// one snapshot at build time, not re-checked per keystroke (doc/decisions.md).
	static overlay(rows, root){
		if (!root) return rows;

		return rows.map(row => {
			const page = this.in_memory(row.url, root);
			return page ? { ...row, title: page.title ?? row.title, description: page.description } : row;
		});
	}

	static in_memory(url, root){
		if (!root) return null;

		let page = root;
		for (const seg of url.split("/").filter(Boolean)){
			const next = page.children?.get(seg);
			if (!(next instanceof Page)) return null;
			page = next;
		}
		return page;
	}

	// Local subtree first, then global; prefix > word-start > substring; an
	// EXACT title match is "strong" and jumps ahead of everything, local or not —
	// the one escape hatch a local prefix match cannot outrank. doc/decisions.md.
	static rank(rows, query, local_root, limit){
		const needle = query.trim().toLowerCase();
		if (!needle) return [];

		const word_start = new RegExp("\\b" + escape_re(needle));
		const scored = [];

		for (const row of rows){
			const title = row.title.toLowerCase();
			let tier;

			if (title === needle) tier = 0;
			else if (title.startsWith(needle)) tier = 1;
			else if (word_start.test(title)) tier = 2;
			else if (title.includes(needle)) tier = 3;
			else continue;

			const local = !!local_root && (row.url === local_root || row.url.startsWith(local_root));
			const bucket = tier === 0 ? 0 : local ? 1 : 2;

			scored.push({ row, bucket, tier, len: title.length });
		}

		scored.sort((a, b) => a.bucket - b.bucket || a.tier - b.tier || a.len - b.len
			|| a.row.title.localeCompare(b.row.title));

		return scored.slice(0, limit).map(s => s.row);
	}

	static commands(commands, query){
		const needle = query.trim().toLowerCase();
		return commands.filter(c => c.title.toLowerCase().includes(needle))
			.map(c => ({ ...c, kind: "command" }));
	}
};

export default Omnibox;
