import { View, div, span, small, p, a } from "../View/View.js";
import Reader from "./Reader.js";

View.stylesheet(import.meta, "FilesTab.css");

/* PAGEFILESTAB — one page's Files tab: this folder's own entries, one level, names only. Read only.
 * Data: Page.Listing.live (the folder's files.jsonl, or page.jsonl for a jsonl page). On the dev server the list is tailed
 * through the socket, so a file made in an editor appears with no reload; on a static host it is the committed list, read once.
 * Design, the phases and what is not built yet: core/Page/doc/files.md. */
export default class PageFilesTab {

	// Set by Page.class.js (importing Page here would be a cycle).
	static Page = null;

	constructor(...args){ this.assign({ rows_shown: 0 }, ...args); }
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

	static count(listing){ return listing ? listing.files.length + listing.dirs.length + listing.pages.size : 0; }

	// The built-in `files/` route every Page answers to (Page.child): a config for `add()`.
	static route(page){
		const tab = page.files_tab ??= new this({ page });
		return { title: "Files", no_inbox: true, no_files: true, render(){ return this.view ??= div.c("page standard page--files", () => tab.view()); } };
	}

	// A small "Files · N" link for the end of a page, only when the folder lists something; undefined otherwise.
	static async chip(page){
		const listing = await this.Page.listing(page.url).catch(() => null);
		const n = this.count(listing);
		return n ? a(`Files · ${n}`).href(page.url + "files/") : undefined;
	}

	// The tab's view: draws at once ("Loading…"), then again with the list, and again on every tailed line.
	view(){
		const $box = div.c("page-files flex v");
		this.draw = () => $box.empty(() => this.rows());
		this.draw();
		this.start();
		return $box;
	}

	start(){
		return this._started ??= (async () => {
			// Imported here, not at the top: core never statically imports ext, and ui/item draws at import (so plain node could not load this file).
			({ file_link: this.file_link } = await import("../../ext/filesystem/file_link.js"));
			({ default: this.item } = await import("../../ui/item/item.js"));
			this.live = await this.constructor.Page.Listing.live(this.constructor.Page, this.page.url, () => this.draw?.());
			this.draw?.();
		})().catch(e => { this.said = `Could not read this folder's file list: ${e.message}`; this.draw?.(); });
	}

	rows(){
		const url = this.page.url, here = url.replace(/^\/+/, "");
		div.c("page-files-head flex v-center", () => {
			span.c("page-files-count", this.live ? `${this.constructor.count(this.live.listing)} in this folder` : "Loading…");
			a.c("page-files-code", "Open as code browser").href(url + "fs/");
		});
		if (this.said) return void small.c("page-files-said", this.said);
		if (!this.live) return;

		const entries = this.constructor.order(this.live.listing);
		if (!entries.length) p("No files yet. A file added to this folder shows up here by itself.");

		div.c("page-files-list flex v", () => {
			entries.forEach(({ name, kind, removed }) => {
				const item = this.item, row = kind === "page" ? item({ icon: "article", name: name + "/", href: url + name + "/" })
					: kind === "folder" ? item({ icon: "folder", name: name + "/" })
					: item({ icon: "description", name, href: this.file_link(here + name) });
				row.ac("page-files-row").ac(removed && "page-files-removed");
			});
		});

		if (!Reader.dev) small.c("page-files-note muted", "This is the list as committed. Change files on the dev server and commit them.");
	}
}
