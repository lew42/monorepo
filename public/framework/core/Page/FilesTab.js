import { View, div, span, small, p, a, button, input, icon } from "../View/View.js";
import Reader from "./Reader.js";

View.stylesheet(import.meta, "FilesTab.css");

/* PAGEFILESTAB — one page's Files tab: this folder's own entries, one level, names only.
 * Data: Page.Listing.live (the folder's files.jsonl, or page.jsonl for a jsonl page). On the dev server the list is tailed
 * through the socket, so a file made in an editor appears with no reload; on a static host it is the committed list, read once.
 * Writes (dev server only): "+ Page", drop or choose files, set a row aside, rename a row, move a row ("Move to…" picker, or drag it onto a folder row).
 * Each is one socket message to Server/plugins/SocketServer/Files.js;
 * the tab never edits its own list: the disk changes, PageFiles writes the list line, and the tail redraws every open tab.
 * Design, the phases and what is not built yet: core/Page/doc/files.md. */
export default class PageFilesTab {

	// Set by Page.class.js (importing Page here would be a cycle).
	static Page = null;

	static MAX_BYTES = 25 * 1024 * 1024;   // the server's cap too (Files.MAX_BYTES)
	static DRAG = "application/x-lew42-files-row";   // what a dragged row carries (a desktop file drag carries "Files")
	static CHUNK = 192 * 1024;            // raw bytes per socket message (a multiple of 3, so every part is clean base64)

	constructor(...args){ this.assign({ rows_shown: 0, adding: false, draft: "", confirming: null, result: null, renaming: null, plan: null, picking: null }, ...args); }
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
				if (this.renaming === name) return this.rename_row(name, kind);
				const item = this.item, end = Reader.dev && !removed ? () => this.row_buttons(name, kind) : undefined;
				const row = kind === "page" ? item({ icon: "article", name: name + "/", href: url + name + "/", end })
					: kind === "folder" ? item({ icon: "folder", name: name + "/", end })
					: item({ icon: "description", name, href: this.file_link(here + name), end });
				row.ac("page-files-row").ac(removed && "page-files-removed");
				if (Reader.dev && !removed) this.make_draggable(row, name, kind);
				if (Reader.dev && !removed && kind !== "file") this.make_drop_target(row, name);
				if (this.confirming === name) this.confirm_row(name, kind);
				if (this.plan?.name === name) this.plan_row();
				if (this.picking?.name === name) this.picker();
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
		if (this.result?.text) div.c("page-files-result" + (this.result.bad ? " page-files-bad" : ""), () => {
			span(this.result.text + " ");
			if (this.result.href) a(this.result.label ?? this.result.href).href(this.result.href);
			if (this.result.undo) button.c("page-files-undo", "Undo").attr("type", "button").click(() => this.undo_move(this.result.undo));
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

	// The row's buttons: rename, move to…, set aside. A click only opens the inline panel under (or in place of) the row.
	row_buttons(name, kind){
		div.c("item-end page-files-rowbtns", () => {
			const btn = (glyph, label, run) => button.c("ui-icon-btn", () => icon(glyph)).attr("type", "button").attr("title", label).attr("aria-label", `${label} ${name}`)
				.click(e => { e.preventDefault(); e.stopPropagation(); this.close_panels(); run(); this.draw(); });
			btn("edit", "Rename", () => { this.renaming = name; this.focus_rename = true; });
			btn("drive_file_move", "Move", () => this.start_picking(name, kind));
			btn("archive", "Set aside", () => { this.confirming = name; });
		});
	}

	close_panels(){ this.confirming = this.renaming = this.plan = this.picking = null; }

	confirm_row(name, kind){
		div.c("page-files-confirm flex v-center", () => {
			span(`Move ${name}${kind === "file" ? "" : "/"} into _removed/? Nothing is deleted.`);
			button.c("page-files-yes", "Set aside").attr("type", "button").click(() => this.set_aside(name));
			button.c("page-files-no", "Cancel").attr("type", "button").click(() => { this.confirming = null; this.draw(); });
		});
	}


	// ---- rename and move ----

	// The row, in place, while its name is being edited. Enter asks, Escape cancels. A file and a folder both show their plan first (how many links change), and can be undone.
	rename_row(name, kind){
		const $row = div.c("page-files-renamerow flex v-center", () => {
			icon(kind === "page" ? "article" : kind === "folder" ? "folder" : "description").ac("item-icon");
			const $name = input.c("page-files-rename").attr("type", "text").attr("aria-label", `New name for ${name}`).attr("autocomplete", "off");
			$name.el.value = name;
			$name.on("keydown", e => { if (e.key === "Enter") go(); if (e.key === "Escape") { this.renaming = null; this.draw(); } });
			const go = () => { const to = $name.el.value.trim(); this.renaming = null; if (!to || to === name) return this.draw(); this.propose(name, kind, this.page.url, to); };
			button.c("page-files-yes", "Rename").attr("type", "button").click(go);
			button.c("page-files-no", "Cancel").attr("type", "button").click(() => { this.renaming = null; this.draw(); });
		});
		if (this.focus_rename){
			this.focus_rename = false;
			const el = $row.el.querySelector(".page-files-rename");
			setTimeout(() => { el?.focus(); el?.setSelectionRange(0, kind === "file" && name.lastIndexOf(".") > 0 ? name.lastIndexOf(".") : name.length); });
		}
	}

	// Rename or move `name` into the folder `to_url` as `to_name`. A file and a folder both ask the server for a dry run first (links to them change).
	async propose(name, kind, to_url, to_name = name){
		this.close_panels();
		this.say(`Checking what ${name}${kind === "file" ? "" : "/"} touches…`);
		const plan = await this.ask("move_plan", name, to_url, to_name);
		if (!plan.ok) return this.say(plan.reason, { bad: true });
		this.plan = { name, to_url, to_name, ...plan };
		this.say("");
		this.draw();
	}

	// The inline plan: what moves, how many links in other files change, a few examples, then Move or Cancel.
	plan_row(){
		const plan = this.plan, rename = plan.to.replace(/[^/]+\/?$/, "") === plan.from.replace(/[^/]+\/?$/, "");
		div.c("page-files-plan flex v", () => {
			const links = plan.links === 1 ? "1 link" : `${plan.links} links`, files = plan.outside_files === 1 ? "1 other file" : `${plan.outside_files} other files`;
			p.c("page-files-plantext", `${rename ? "Rename" : "Move"} ${plan.from} to ${plan.to}? ` + (plan.links
				? `${links} in ${files} will be updated so they keep working.`
				: "No links to it need changing.") + " You can undo it.");
			if (plan.note) small.c("muted", plan.note);
			if (plan.sample?.length) div.c("page-files-sample flex v", () => plan.sample.slice(0, 4).forEach(s => small.c("muted", `${s.file}: ${s.from} → ${s.to}`)));
			div.c("flex v-center page-files-formrow", () => {
				button.c("page-files-yes", plan.working ? "Working…" : rename ? "Rename" : "Move").attr("type", "button").attr("disabled", plan.working ? "" : null).click(() => this.apply_move({ ...plan, working: true }));
				button.c("page-files-no", "Cancel").attr("type", "button").click(() => { this.plan = null; this.draw(); });
			});
		});
	}

	async apply_move({ name, kind, to_url, to_name }){
		if (this.plan){ this.plan.working = true; this.draw(); }
		const done = await this.ask("move_apply", name, to_url, to_name);
		this.plan = null;
		const shown = done.ok ? [`${done.from} is now ${done.to}.`, ...(done.warnings ?? [])].join(" ") : done.reason;   // a warning means the move worked; Undo stays
		this.say(shown, done.ok ? { undo: done.manifest } : { bad: true });
		this.draw();
	}

	async undo_move(manifest){
		const done = await this.send("move_undo", manifest);
		this.say(done.ok ? [`Put it back: ${done.to}`, ...(done.warnings ?? [])].join(" ") : done.reason, done.ok ? {} : { bad: true });
	}

	// "Move to…": a small browser of folders, starting here. Click a folder to look inside it; "Move here" picks the one you are looking at.
	async start_picking(name, kind){
		this.picking = { name, kind, url: this.page.url, folders: null };
		await this.look_in(this.page.url);
	}

	async look_in(url){
		const picking = this.picking;
		if (!picking) return;
		picking.url = url; picking.folders = null; this.draw();
		const there = await this.send("list_folders", url);
		if (this.picking !== picking) return;
		if (!there.ok){ this.picking = null; this.say(there.reason, { bad: true }); return this.draw(); }
		Object.assign(picking, { url: there.url, page: there.page, folders: there.folders.filter(f => !(there.url === this.page.url && f.name === picking.name)) });
		this.draw();
	}

	picker(){
		const pick = this.picking, up = pick.url.replace(/[^/]+\/$/, "");
		div.c("page-files-picker flex v", () => {
			div.c("flex v-center page-files-formrow", () => {
				button.c("ui-icon-btn", () => icon("arrow_upward")).attr("type", "button").attr("title", "Up one folder").attr("aria-label", "Up one folder").attr("disabled", pick.url === "/" ? "" : null).click(() => this.look_in(up || "/"));
				span.c("page-files-picked", `Move ${pick.name}${pick.kind === "file" ? "" : "/"} into ${pick.url}`);
			});
			if (!pick.folders) return void small.c("muted", "Looking…");
			div.c("page-files-pick-list flex v", () => {
				if (!pick.folders.length) small.c("muted", "No folders in here.");
				pick.folders.forEach(f => button.c("page-files-pick-folder" + (f.page ? "" : " muted"), () => { icon(f.page ? "article" : "folder"); span(f.name + "/"); })
					.attr("type", "button").click(() => this.look_in(pick.url + f.name + "/")));
			});
			const here = pick.url === this.page.url, blocked = pick.url === "/" || here || pick.url.startsWith(this.page.url + pick.name + "/");
			div.c("flex v-center page-files-formrow", () => {
				button.c("page-files-yes", "Move here").attr("type", "button").attr("disabled", blocked || !pick.folders ? "" : null)
					.attr("title", pick.url === "/" ? "Pick a folder first" : here ? "It is already in this folder" : null).click(() => this.propose(pick.name, pick.kind, pick.url));
				button.c("page-files-no", "Cancel").attr("type", "button").click(() => { this.picking = null; this.draw(); });
			});
		});
	}

	// Desktop: drag a row onto a folder row. The row carries its name in its own data type, so the tab's file-drop zone (which only wants "Files") ignores it.
	make_draggable(row, name, kind){
		row.el.setAttribute("draggable", "true");
		row.el.addEventListener("dragstart", e => {
			e.dataTransfer.clearData();
			e.dataTransfer.setData(this.constructor.DRAG, JSON.stringify({ name, kind, from: this.page.url }));
			e.dataTransfer.effectAllowed = "move";
			this.dragging = { name, kind };
			row.el.dataset.dragging = "";
		});
		row.el.addEventListener("dragend", () => { this.dragging = null; delete row.el.dataset.dragging; });
	}

	make_drop_target(row, target){
		const el = row.el, mine = e => [...(e.dataTransfer?.types ?? [])].includes(this.constructor.DRAG) && this.dragging && this.dragging.name !== target;
		let depth = 0;
		el.addEventListener("dragenter", e => { if (mine(e)) depth++; });
		el.addEventListener("dragover", e => { if (!mine(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = "move"; el.dataset.drop = ""; });
		el.addEventListener("dragleave", e => { if (mine(e) && --depth <= 0) { depth = 0; delete el.dataset.drop; } });
		el.addEventListener("drop", e => {
			if (!mine(e)) return;
			e.preventDefault(); e.stopPropagation(); depth = 0; delete el.dataset.drop;
			const { name, kind } = this.dragging;
			this.propose(name, kind, this.page.url + target + "/");
		});
	}

	say(text, extra = {}){ this.result = { text, ...extra }; this.draw_bar?.(); }

	// One socket message about THIS folder (its url goes first); always answers { ok, … } (a sentence in `reason` when not ok), never throws.
	ask(method, ...args){ return this.send(method, this.page.url, ...args); }

	// The same without the folder url first.
	async send(method, ...args){
		try {
			const { default: Socket } = await import("../../dev/Socket/Socket.js");
			const reply = await Socket.singleton().async_rpc(method, ...args);
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
