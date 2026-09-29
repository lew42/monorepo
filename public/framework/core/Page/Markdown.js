import { Page } from "./Page.class.js";
import { div, h2, p, ul, li, a } from "../View/View.js";

/* EVERY PAGE HAS AN `md/` — its markdown files, as pages. Nothing to write.

       /framework/ext/Panel/md/                 every .md in ext/Panel, as a list
       /framework/ext/Panel/md/readme/          ext/Panel/readme.md, rendered
       /framework/ext/Panel/md/doc/decisions/   ext/Panel/doc/decisions.md, rendered

   `md` is a path segment, not a file, so the SPA fallback hands it to the app; the
   `.md` url itself still serves the raw file. The cost: no page can have a real
   child named `md`. Page.child() makes the first one; this class makes the rest.
   doc/markdown.md. */
export default class PageMarkdown extends Page {

	// `folder` is the real directory this page lists, e.g. "/framework/ext/Panel/doc/".
	async child(name, levels){
		const known = this.children.get(name);
		if (known) return known.assign({ app: this.app }).load_all_children(levels);

		// The file list answers first, so no folder is fetched as `<folder>.md` and 404s.
		// With no list (production), try the file, and a miss is taken as a folder.
		const { dir, md } = await this.constructor.where(this.folder, name);

		const file = dir !== true && md !== false && await Page.file(this.folder + name + ".md");
		if (file) return this.add(name, { ...file, folder: this.folder }).load_all_children(levels);

		if (dir === false) return null;
		return this.add(name, new this.constructor({ folder: this.folder + name + "/" })).load_all_children(levels);
	}

	// In columns, a doc in my folder is my own child — the next column, no second md/.
	open_link(link){
		const file = Page.md_file(link);
		if (file && this.column_host() && file.startsWith(this.folder))
			return this.url + file.slice(this.folder.length).replace(/\.md$/i, "/");
		return super.open_link(link);
	}

	// First paint is this folder's own files (one request); the sub-folders, each its
	// own page.jsonl, fill in after. A phone never waits on the fan-out to see a list.
	content(){
		div.c("page-md-index", $box => {
			const draw = files => $box.empty(() => { this.list(files); });
			this.constructor.files(this.folder, 1).then(first => {
				draw(first);
				if (first) this.constructor.files(this.folder).then(all => { if (all.length > first.length) draw(all); });
			});
		});
	}

	// One list per folder, the folder's own files first.
	list(files){
		if (!files) return this.no_list();
		if (!files.length) return void p.c("muted", "No markdown files here.");

		const folders = Map.groupBy(files, file => file.replace(/[^/]*$/, ""));

		folders.forEach((names, folder) => {
			if (folder) h2(folder);
			ul(() => names.forEach(file => li(() => { a(file.slice(folder.length, -3)).href(this.url + file.slice(0, -3) + "/"); })));
		});
	}

	// Production has no file list (directory.json is written by the dev server), so the
	// readme stands in: it is the module's own index, and its links lead here anyway.
	no_list(){
		p.c("muted", "This server has no file list, so here is the readme.");
		div.c("page-md-readme", $readme => {
			Page.file(this.folder + "readme.md").then(file => { if (file) $readme.append(file.content()); });
		});
	}

	// ════ THE FILE LIST — each folder's own page.jsonl (Page.listing()) ════════

	// Is `name` in `folder` a folder, a `.md` file, or unknown (undefined)? The listing
	// answers. A name it does not know may be newer than the list, so the list is read
	// once more before the answer is "neither" — a stale list never hides a real page.
	static async where(folder, name){
		const has = listing => listing.folder(name) || listing.files.includes(name + ".md");
		let listing = await Page.listing(folder);
		if (listing && !has(listing)) listing = await Page.listing(folder, true);
		if (listing) return { dir: listing.folder(name), md: listing.files.includes(name + ".md") };

		const [dir, md] = await Promise.all([name + "/", name + ".md"].map(path => this.node(folder + path)));
		return { dir: dir === undefined ? undefined : dir?.type === "dir", md: md === undefined ? undefined : md !== null };
	}

	// Every .md under `dir`, as paths relative to it. A folder that is a page is
	// another page, with its own md/ — so it is not listed here.
	static async files(dir, depth){
		const found = await this.walk(dir, { keep: name => name.endsWith(".md"), depth });
		return found && found.sort((x, y) => x.split("/").length - y.split("/").length || x.localeCompare(y));
	}

	/* How many folders one walk reads by their own page.jsonl before the rest come
	   from ONE directory.json read. On a phone every request waits a round trip:
	   /framework/fs/ was 2,351 page.jsonl requests uncapped (measured 09-29). */
	static budget = 40;

	/* Every file under `dir` that `keep` wants, relative to `dir`. Breadth-first:
	   each level's folders are read in parallel, one page.jsonl each, until `budget`
	   folders are read; the folders left over, and any folder with no page.jsonl, are
	   read from the old directory.json instead. `pages: true` walks into child pages
	   too (ext/files' /fs/). `depth: 1` is this folder only: one request. Undefined
	   when there is no file list at all (production).
	   ⚠ A `kid/page.jsonl` line may be a plain folder whose log is only a listing, so
	     it is looked into, and skipped only if its log turns out to be a page. */
	static async walk(dir, { keep = () => true, pages = false, depth = Infinity, budget = this.budget } = {}){
		const found = [], unread = [], missing = [];
		let level = [{ dir: dir.replace(/\/?$/, "/"), rel: "" }], read = 0;

		for (let d = 1; level.length; d++){
			const now = level.slice(0, Math.max(0, budget - read));
			unread.push(...level.slice(now.length));
			read += now.length;

			const listings = await Promise.all(now.map(folder => Page.listing(folder.dir)));
			level = [];
			now.forEach((folder, i) => {
				const listing = listings[i];
				if (!listing) return void missing.push(folder);
				if (folder.rel && !pages && listing.page) return;

				// The log itself is never one of its own lines, but it is a real file here.
				[...listing.files, "page.jsonl"].filter(keep).forEach(name => found.push(folder.rel + name));
				if (d < depth) this.folders(listing, pages).forEach(name => level.push({ dir: folder.dir + name + "/", rel: folder.rel + name + "/" }));
			});
		}

		return this.walk_rest(found, unread, missing, { keep, pages });
	}

	// The sub-folders a walk goes into: plain folders, and child pages when `pages`
	// (a jsonl one always: it may be a plain folder's listing, see walk()).
	static folders(listing, pages){
		return [...listing.dirs, ...[...listing.pages].filter(([, kind]) => pages || kind === "jsonl").map(([name]) => name)];
	}

	// What the budget left, and the folders with no log: from directory.json. With no
	// directory.json (production), the unread folders are read by their logs after all.
	static async walk_rest(found, unread, missing, { keep, pages }){
		if (!unread.length && !missing.length) return found;

		const tree = await this.tree();
		if (!tree){
			if (missing.some(folder => !folder.rel)) return undefined;   // not even the top folder has a log
			const more = await Promise.all(unread.map(folder => this.walk(folder.dir, { keep, pages, budget: Infinity })));
			unread.forEach((folder, i) => (more[i] ?? []).forEach(name => found.push(folder.rel + name)));
			return found;
		}

		for (const folder of [...unread, ...missing])
			found.push(...this.walk_tree(await this.node(folder.dir), { keep, pages, rel: folder.rel }) ?? []);
		return found;
	}

	// ════ THE FALLBACK — the dev server's directory.json, the whole site in one file ══
	// `priority: "low"` — this file is big (public/directory.json is ~4MB); a page's own
	// small requests should win the browser's limited connections when both are in
	// flight (ai/2026-09-29/slow-card-fix/ has the reasoning and the measurement).
	static tree(){ return PageMarkdown.reading ??= Page.read_json("/directory.json", { priority: "low" }); }

	static async node(dir){
		const tree = await this.tree();
		if (!tree) return undefined;

		let node = { children: tree.files };
		for (const part of dir.split("/").filter(Boolean))
			if (!(node = node.children?.find(child => child.name === part))) return null;
		return node;
	}

	static walk_tree(node, { keep, pages, rel }){
		if (node === undefined) return undefined;

		const found = [];
		const walk = (node, rel) => (node?.children ?? []).forEach(child => {
			if (child.type === "file" && keep(child.name)) found.push(rel + child.name);
			else if (child.type === "dir" && (pages || !child.children?.some(c => c.name === "page.js"))) walk(child, rel + child.name + "/");
		});
		walk(node, rel);
		return found;
	}
}

// My content IS the list of my children, so a column draws no second rail of them.
PageMarkdown.prototype.index = true;
