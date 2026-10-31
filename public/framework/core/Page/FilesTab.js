import { View, div, span, small, p, a, button, input, icon } from "../View/View.js";
import Reader from "./Reader.js";

View.stylesheet(import.meta, "FilesTab.css");

/* PAGEFILESTAB — one page's Files tab: this folder's own entries, one level, names only.
 * Data: Page.Listing.live (the folder's files.jsonl, or page.jsonl for a jsonl page). On the dev server the list is tailed
 * through the socket, so a file made in an editor appears with no reload; on a static host it is the committed list, read once.
 * Writes (dev server only): "+ Page", drop or choose files, set a row aside. Each is one socket message to Server/plugins/SocketServer/Files.js;
 * the tab never edits its own list: the disk changes, PageFiles writes the list line, and the tail redraws every open tab.
 * Design, the phases and what is not built yet: core/Page/doc/files.md. */
export default class PageFilesTab {

	// Set by Page.class.js (importing Page here would be a cycle).
	static Page = null;

	static MAX_BYTES = 25 * 1024 * 1024;   // the server's cap too (Files.MAX_BYTES)
	static CHUNK = 192 * 1024;            // raw bytes per socket message (a multiple of 3, so every part is clean base64)

	constructor(...args){ this.assign({ rows_shown: 0, adding: false, draft: "", confirming: null, result: null }, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// Page-folders first, then plain folders, then files; `_removed/` (set aside by the UI later) always last.
	static order(listing){
		const sort = names => [...names].sort((x, y) => x.localeCompare(y));
		const [removed, folders] = [sort(listing.dirs).filter(n => n === "_removed"), sort(listing.dirs).filter(n => n !== "_removed")];
		return [
			...sort(listing.pages.keys()).map(name => ({ name, kind: "page" })),
			...folders.map(name => ({ name, kind: "folder" })),
			...sort(listing.files).map(name => ({ name, kind: "file" })),
			...removed.map(name => ({ name, kind: "folder", removed: true })),
		];
	}

	// "Trip Notes" -> "trip-notes": the folder name a page title becomes (the server accepts a-z, 0-9 and - only).
	static slug(title){ return String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

	static count(listing){ return listing ? listing.files.length + listing.dirs.length + listing.pages.size : 0; }

	// The built-in `files/` route every Page answers to (Page.child): a config for `add()`.
	static route(page){
		const tab = page.files_tab ??= new this({ page });
		return { title: "Files", no_inbox: true, no_files: true, render(){ return this.view ??= div.c("page standard page--folder-files", () => tab.view()); } };
	}

	// A small "Files · N" link for the end of a page, only when the folder lists something; undefined otherwise.
	static async chip(page){
		const listing = await this.Page.listing(page.url).catch(() => null);
		const n = this.count(listing);
		return n ? a(`Files · ${n}`).href(page.url + "files/") : undefined;
	}

	// The tab's view. The controls (`$bar`) are drawn only when they change, so typing a page name is never wiped by a tailed line;
	// the head and the rows (`$body`) are drawn at once ("Loading…"), then again with the list, and again on every tailed line.
	view(){
		this.$box = div.c("page-files flex v", () => {
			this.$bar = div.c("page-files-bar flex v");
			this.$body = div.c("page-files-body flex v");
		});
		this.draw = () => this.$body.empty(() => this.rows());
		this.draw_bar = () => this.$bar.empty(() => this.controls());
		this.draw_bar();
		this.draw();
		this.listen_for_drops();
		this.start();
		return this.$box;
	}

	start(){
		return this._started ??= (async () => {
			// Imported here, not at the top: core never statically imports ext, and ui/item draws at import (so plain node could not load this file).
			({ file_link: this.file_link } = await import("../../ext/filesystem/file_link.js"));
			({ default: this.item } = await import("../../ui/item/item.js"));
			await import("../../ui/icon/icon.js");   // the .ui-icon-btn look of the set-aside button
			this.live = await this.constructor.Page.Listing.live(this.constructor.Page, this.page.url, () => this.draw?.());
			this.draw?.();
		})().catch(e => { this.said = `Could not read this folder's file list: ${e.message}`; this.draw?.(); });
	}

	rows(){
		const url = this.page.url, here = url.replace(/^\/+/, "");
		div.c("page-files-head flex v-center", () => {
			span.c("page-files-count", this.live ? `Files in ${url} · ${this.constructor.count(this.live.listing)}` : "Loading…");
			a.c("page-files-code", "Open as code browser").href(url + "fs/");
		});
		if (this.said) return void small.c("page-files-said", this.said);
		if (!this.live) return;

		const entries = this.constructor.order(this.live.listing);
		if (!entries.length) p("No files yet. A file added to this folder shows up here by itself.");

		div.c("page-files-list flex v", () => {
			entries.forEach(({ name, kind, removed }) => {
				const item = this.item, end = Reader.dev && !removed ? () => this.set_aside_button(name) : undefined;
				const row = kind === "page" ? item({ icon: "article", name: name + "/", href: url + name + "/", end })
					: kind === "folder" ? item({ icon: "folder", name: name + "/", end })
					: item({ icon: "description", name, href: this.file_link(here + name), end });
				row.ac("page-files-row").ac(removed && "page-files-removed");
				if (this.confirming === name) this.confirm_row(name, kind);
			});
		});

		if (!Reader.dev) small.c("page-files-note muted", "This is the list as committed. Change files on the dev server and commit them.");
	}

	// ---- writes (dev server only) ----

	// The controls above the list: "+ Page" (its name form opens inline), the drop zone with its upload button, and the last result.
	controls(){
		if (!Reader.dev) return;
		div.c("page-files-actions flex v-center", () => {
			button.c("page-files-add", "+ Page").attr("type", "button").click(() => { this.adding = !this.adding; this.draw_bar(); if (this.adding) this.$bar.el.querySelector(".page-files-name")?.focus(); });
		});
		if (this.adding) this.new_page_form();
		div.c("page-files-drop flex v-center", () => {
			span("Drop files here, or");
			const $pick = input.c("page-files-pick").attr("type", "file").attr("multiple", "").attr("hidden", "");
			$pick.on("change", () => { const files = [...$pick.el.files]; $pick.el.value = ""; this.upload(files); });
			button.c("page-files-choose", "Choose files").attr("type", "button").click(() => $pick.el.click());
			small.c("muted", "up to 25 MB each");
		});
		if (this.result) div.c("page-files-result" + (this.result.bad ? " page-files-bad" : ""), () => {
			span(this.result.text + " ");
			if (this.result.href) a(this.result.label ?? this.result.href).href(this.result.href);
		}).attr("role", "status");
	}

	new_page_form(){
		div.c("page-files-form flex v", () => {
			div.c("flex v-center page-files-formrow", () => {
				const $name = input.c("page-files-name").attr("type", "text").attr("placeholder", "Page name, like Trip notes").attr("aria-label", "New page name").attr("autocomplete", "off");
				$name.el.value = this.draft;
				$name.on("input", () => { this.draft = $name.el.value; this.$slug.el.textContent = this.slug_line(); });
				$name.on("keydown", e => { if (e.key === "Enter") this.add_page(); if (e.key === "Escape") { this.adding = false; this.draw_bar(); } });
				button.c("page-files-create", "Create").attr("type", "button").click(() => this.add_page());
				button.c("page-files-cancel", "Cancel").attr("type", "button").click(() => { this.adding = false; this.draw_bar(); });
			});
			this.$slug = small.c("page-files-slug muted", this.slug_line());
		});
	}

	slug_line(){ const name = this.constructor.slug(this.draft); return name ? `It will be the folder ${name}/` : "Type a name; the folder name is made from it."; }

	// The row's set-aside button; a click only asks, the confirm row below it does the move.
	set_aside_button(name){
		div.c("item-end", () => {
			button.c("ui-icon-btn", () => icon("archive")).attr("type", "button").attr("title", "Set aside").attr("aria-label", `Set aside ${name}`)
				.click(e => { e.preventDefault(); e.stopPropagation(); this.confirming = name; this.draw(); });
		});
	}

	confirm_row(name, kind){
		div.c("page-files-confirm flex v-center", () => {
			span(`Move ${name}${kind === "file" ? "" : "/"} into _removed/? Nothing is deleted.`);
			button.c("page-files-yes", "Set aside").attr("type", "button").click(() => this.set_aside(name));
			button.c("page-files-no", "Cancel").attr("type", "button").click(() => { this.confirming = null; this.draw(); });
		});
	}

	say(text, extra = {}){ this.result = { text, ...extra }; this.draw_bar?.(); }

	// One socket message; always answers { ok, … } (a sentence in `reason` when not ok), never throws.
	async ask(method, ...args){
		try {
			const { default: Socket } = await import("../../dev/Socket/Socket.js");
			const reply = await Socket.singleton().async_rpc(method, this.page.url, ...args);
			if (!reply) return { ok: false, reason: "The dev server is not reachable, so nothing was changed." };
			if (reply.method === "refused") return { ok: false, reason: "The dev server only takes changes from the computer it runs on." };
			return reply.response ?? { ok: false, reason: "The dev server did not understand that." };
		} catch (e){ return { ok: false, reason: `Could not reach the dev server: ${e.message}` }; }
	}

	async add_page(){
		const title = this.draft.trim(), name = this.constructor.slug(title);
		if (!name) return this.say("Type a name first.", { bad: true });
		const done = await this.ask("page_add", name, title);
		if (!done.ok) return this.say(done.reason, { bad: true });
		this.adding = false; this.draft = "";
		this.say("Made the page", { href: this.page.url + name + "/", label: name + "/" });
	}

	async set_aside(name){
		this.confirming = null;
		const done = await this.ask("set_aside", name);
		this.say(done.ok ? `Set ${name} aside in _removed/` : done.reason, done.ok ? {} : { bad: true });
		this.draw();
	}

	// Files arrive from the Choose button or a drop anywhere on the tab; a folder cannot be sent (the browser gives no bytes for it).
	listen_for_drops(){
		if (!Reader.dev) return;
		const el = this.$box.el, has_files = e => [...(e.dataTransfer?.types ?? [])].includes("Files");
		let depth = 0;
		el.addEventListener("dragenter", e => { if (has_files(e)) { depth++; el.dataset.over = ""; } });
		el.addEventListener("dragleave", e => { if (has_files(e) && --depth <= 0) { depth = 0; delete el.dataset.over; } });
		el.addEventListener("dragover", e => { if (has_files(e)) e.preventDefault(); });
		el.addEventListener("drop", e => {
			if (!has_files(e)) return;
			e.preventDefault(); depth = 0; delete el.dataset.over;
			const items = [...(e.dataTransfer.items ?? [])].filter(i => i.kind === "file");
			const folders = items.filter(i => i.webkitGetAsEntry?.()?.isDirectory).length;
			const files = items.length ? items.filter(i => !i.webkitGetAsEntry?.()?.isDirectory).map(i => i.getAsFile()) : [...e.dataTransfer.files];
			if (folders) this.say("A folder cannot be dropped, only files. Make it with + Page, then drop its files.", { bad: true });
			if (files.length) this.upload(files);
		});
	}

	static base64(blob){
		return new Promise((done, fail) => { const reader = new FileReader(); reader.onload = () => done(String(reader.result).split(",")[1] ?? ""); reader.onerror = () => fail(reader.error); reader.readAsDataURL(blob); });
	}

	// One file at a time, in parts of CHUNK bytes; the answer to the last part names the saved file (it may differ on a name clash).
	async upload(files){
		const { MAX_BYTES, CHUNK, base64 } = this.constructor;
		for (const file of files){
			if (file.size > MAX_BYTES) { this.say(`${file.name} is bigger than ${MAX_BYTES / 1024 / 1024} MB, so it was not uploaded.`, { bad: true }); continue; }
			const parts = Math.max(1, Math.ceil(file.size / CHUNK));
			let done;
			for (let part = 0; part < parts; part++){
				this.say(`Uploading ${file.name}${parts > 1 ? ` (${part + 1} of ${parts})` : ""}…`);
				done = await this.ask("upload", file.name, await base64(file.slice(part * CHUNK, (part + 1) * CHUNK)), { part, of: parts });
				if (!done.ok) break;
			}
			this.say(!done.ok ? done.reason : done.kept_both ? `${file.name} was already here, so this one is saved as ${done.name}. Both are kept.` : `Uploaded ${done.name}`, done.ok ? {} : { bad: true });
		}
	}
}
