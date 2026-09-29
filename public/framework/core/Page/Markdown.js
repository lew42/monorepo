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

	content(){
		div.c("page-md-index", $box => {
			this.constructor.files(this.folder).then(files => $box.append(() => { this.list(files); }));
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
	// answers; a name it does not know may still be a new .md, so the file is tried.
	static async where(folder, name){
		const listing = await Page.listing(folder);
		if (listing) return { dir: listing.folder(name), md: listing.files.includes(name + ".md") || undefined };

		const [dir, md] = await Promise.all([name + "/", name + ".md"].map(path => this.node(folder + path)));
		return { dir: dir === undefined ? undefined : dir?.type === "dir", md: md === undefined ? undefined : md !== null };
	}

	// Every .md under `dir`, as paths relative to it. A folder that is a page is
	// another page, with its own md/ — so it is not listed here.
	static async files(dir){
		const found = await this.walk(dir, { keep: name => name.endsWith(".md") });
		return found && found.sort((x, y) => x.split("/").length - y.split("/").length || x.localeCompare(y));
	}

	/* Every file under `dir` that `keep` wants, relative to `dir`: one page.jsonl per
	   folder, each level's folders fetched in parallel. `pages: true` walks into child
	   pages too (ext/files' /fs/). A folder with no page.jsonl is read from the old
	   directory.json instead. Undefined when neither exists (production).
	   ⚠ A `kid/page.jsonl` line may be a plain folder whose log is only a listing, so
	     it is looked into, and skipped only if its log turns out to be a page. */
	static async walk(dir, { keep = () => true, pages = false, rel = "" } = {}){
		dir = dir.replace(/\/?$/, "/");
		const listing = await Page.listing(dir);
		if (!listing) return this.walk_tree(await this.node(dir), { keep, pages, rel });
		if (rel && !pages && listing.page) return [];

		const into = [...listing.dirs, ...[...listing.pages].filter(([, kind]) => pages || kind === "jsonl").map(([name]) => name)];
		const deeper = await Promise.all(into.map(name => this.walk(dir + name + "/", { keep, pages, rel: rel + name + "/" })));
		return [...listing.files.filter(keep).map(name => rel + name), ...deeper.flatMap(found => found ?? [])];
	}

	// ════ THE FALLBACK — the dev server's directory.json, the whole site in one file ══
	static tree(){ return PageMarkdown.reading ??= Page.read_json("/directory.json"); }

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
