import Socket from "/framework/dev/Socket/Socket.js";
import FileSaver from "/framework/ext/Saver/FileSaver.js";

/* ── WHERE THE PAGES YOU MAKE ARE KEPT ────────────────────────────────────────

   Make lets you create pages at runtime. This file is the only thing that decides
   WHERE they end up, and there are exactly two answers:

     FILES — the default. On localhost the dev socket is connected, so every page
             you make is a real directory with a real `page.json` in it, under
             `public/imagine/paging/made/`. Reload, close the browser, open a
             different one — they are still there, because they are files.

     THIS BROWSER — the fallback. On a static host (production) there is no server
             to write to, so the whole tree is kept in `localStorage` instead. Make
             says which store it is on, out loud, on the page.

   ⚠ NO NEW WRITER. The fs half is `ext/Saver`'s `FileSaver` — the dev socket's
     `rpc:write` / `rpc:rm`, the same writer the CMS editor, the page generator's
     Export and `ext/Panel` all use. The localStorage half is core's own `store()`,
     handed in by the page. This file only decides which one, and what to write.

   ── THE FILE FORMAT — a page, as pure JSON ───────────────────────────────────

       public/imagine/paging/made/page.json               the root: which pages exist
       public/imagine/paging/made/notes/page.json         a page
       public/imagine/paging/made/notes/today/page.json   its child

   ```json
   { "title": "Notes", "icon": "description",
     "mode": { "style": "card", "content": "m", "mech": "launch" },
     "children": ["today", "later"] }
   ```

   `children` is an ARRAY OF DIRECTORY NAMES, not nested objects. That is the same
   rule the rest of the site follows — nothing crawls, a page exists once its parent
   names it — and it is what lets the tree load with no server at all: fetch the
   root, fetch what it names, repeat. `doc/persistence.md` is the contract.        */

export const DIR = "/imagine/paging/made/";

/* How long a write waits before deciding there is nothing listening. ⚠ NEEDED, not
   defensive: `Socket.send()` awaits a `ready` promise that only ever resolves on a
   successful connect, so on localhost with the dev server DOWN a write waits for
   ever and Make would hang with no error. The same probe `export.js` pays. */
const PROBE = 2500;

// The pages Make ships with, and what "Back to the baseline" restores. They exist
// as real files in the repo too, so a fresh checkout opens straight onto them.
export const SEED = [
	{ name: "notes", title: "Notes", mode: { style: "card", content: "m", mech: "launch" }, children: [
		{ name: "today", title: "Today", mode: { style: "plain", content: "s", mech: "launch" }, children: [] },
		{ name: "later", title: "Later", mode: { style: "tint", content: "xs", mech: "expand" }, children: [] },
	] },
	{ name: "ideas", title: "Ideas", mode: { style: "tint", content: "l", mech: "swap" }, children: [] },
	{ name: "archive", title: "Archive", mode: { style: "dark", content: "m", mech: "takeover" }, children: [] },
];

export const DEFAULTS = { style: "card", content: "m", mech: "launch" };

export const clone = value => JSON.parse(JSON.stringify(value));

/* ── walking a tree ────────────────────────────────────────────────────────────
   A PATH is an array of names — `["notes", "today"]` — and it is both the address
   of a node in memory and the directory it lives in. One idea, two uses. */

// The node at a path, or undefined. `[]` is the whole tree's stand-in parent.
export const at = (tree, path) => path.reduce((node, name) => node?.children?.find(kid => kid.name === name), { children: tree });

// Every node as `[path, node]`, PARENTS FIRST — which is also the order they must
// be written in, so no page.json ever names a directory that is not there yet.
export function walk(tree = [], path = []){
	return tree.flatMap(node => {
		const here = [...path, node.name];
		return [[here, node], ...walk(node.children, here)];
	});
}

// A directory name no sibling already has. `Page.slug()` decides what a directory
// may be called; this decides which of those names is free.
export function name_for(title, siblings, slug){
	const base = slug(title) || "page";
	let name = base, n = 2;
	while (siblings.some(kid => kid.name === name)) name = base + "-" + n++;
	return name;
}

/* ── the two stores ────────────────────────────────────────────────────────────
   The same three methods, so the page never asks which one it is talking to:
   `load()` → the tree · `save(tree, was)` → true when it landed · `label(n)` → the
   sentence the page prints saying where its pages are. */

export class Store {
	constructor(...args){ Object.assign(this, ...args); }
	async load(){ return clone(SEED); }
	async save(){ return false; }
	label(){ return ""; }
}

/* FILES — the default. Every write is `FileSaver`, which is `rpc:write` with the
   "no dev socket → warn once, never throw" rule already inside it. */
export class FileStore extends Store {

	url(path){ return DIR + path.map(name => name + "/").join(""); }

	/* ⚠ A MISSING FILE ANSWERS 200 WITH `index.html`. The dev server's SPA fallback
	     means `res.ok` is not "the file is there" — the CONTENT-TYPE is the 404. The
	     same guard `cms/json`'s `Source.read()` carries, and without it a page tree
	     would try to parse a web page as a page. */
	async read(path){
		const res = await fetch(this.url(path) + "page.json", { cache: "no-cache" }).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
		return res.json().catch(() => null);
	}

	// Fetch the root, fetch what it names, repeat. Nothing on disk yet → the seed,
	// unwritten: a first visit shows the five example pages without creating files
	// nobody asked for. A child that is missing is skipped, not fatal.
	async load(){
		const root = await this.read([]);
		if (!root) return clone(SEED);
		return this.grow(root.children ?? [], []);
	}

	async grow(names, path){
		const nodes = await Promise.all(names.map(async name => {
			const node = await this.read([...path, name]);
			if (!node) return null;
			return { ...node, name, children: await this.grow(node.children ?? [], [...path, name]) };
		}));

		return nodes.filter(Boolean);
	}

	// ONE NODE → ONE FILE. `children` becomes the array of directory names, which is
	// the only difference between the node in memory and the node on disk.
	file(node){
		return {
			title: node.title,
			icon: node.icon ?? "description",
			description: node.description ?? "A page you made.",
			mode: { ...DEFAULTS, ...node.mode },
			children: (node.children ?? []).map(kid => kid.name),
		};
	}

	/* ⚠ EVERY WRITE IS RACED. See `PROBE` above — an unanswered `rpc` never rejects,
	     it simply never settles, so without this a dead server is a frozen page.
	     A miss sets `failed`, and the page switches to the browser store and says so. */
	async raced(promise){
		const answer = await Promise.race([promise, new Promise(done => setTimeout(done, PROBE, null))]);
		if (!answer) this.failed = true;
		return !!answer;
	}

	put(path, body){ return this.raced(new FileSaver({ path: this.url(path) + "page.json" }).save(body)); }

	// The DIRECTORY, not the file — `rpc:rm` is recursive, so a page's children go
	// with it, exactly as deleting a directory of `page.js` files would.
	drop(path){ return this.raced(new FileSaver({ path: this.url(path) }).delete()); }

	/* THE ONE SEAM EVERY EDIT GOES THROUGH. The page hands over the tree it wants and
	   the tree it had; this works out the smallest set of writes that gets from one to
	   the other — so a chip click is ONE file written, not the whole tree. */
	async save(tree, was = []){
		const now = new Map(walk(tree).map(([path, node]) => [path.join("/"), node]));
		const before = new Map(walk(was).map(([path, node]) => [path.join("/"), node]));

		/* ⚠ ONLY THE TOPMOST REMOVAL IS DELETED. `rm` already took the children with
		     it, and a second `rm` on a path that is gone answers "rm failed" into the
		     console — so a node whose parent also went is left to its parent. */
		for (const key of before.keys()){
			if (now.has(key)) continue;
			const parent = key.split("/").slice(0, -1).join("/");
			if (parent && !now.has(parent)) continue;
			await this.drop(key.split("/"));
		}

		// The root is the only file that is not a page: it exists so the tree can be
		// found with no server, and its `children` is the list of top-level pages.
		// Written every time — it is 100 bytes, and the alternative is a class of bug.
		await this.put([], { title: "Made", icon: "add_circle_outline", children: tree.map(node => node.name) });

		for (const [key, node] of now){
			const body = this.file(node);
			const old = before.get(key);
			if (old && JSON.stringify(this.file(old)) === JSON.stringify(body)) continue;
			await this.put(key.split("/"), body);
		}

		return !this.failed;
	}

	label(count){
		return "**Saved to disk.** " + count + " page" + (count === 1 ? "" : "s") + " under `public" + DIR
			+ "` — one directory and one `page.json` each, real files you can open in an editor and commit.";
	}
}

/* THIS BROWSER — the fallback. Your own edits go in one record under the page's own
   key, which keeps the realm's one-key-per-page rule, so the hub's Reset still forgets
   them along with everything else in the realm.

   ⚠ IT STILL READS THE FILES. A `page.json` is a static asset: a browser with no dev
     server can fetch it perfectly well, it just cannot write one. So the fallback
     EXTENDS the file store and overrides only the writing half — which is why a
     production visitor sees the real committed pages rather than the seed, and only
     their own edits live in the browser. */
export class LocalStore extends FileStore {

	async load(){ return this.page.store().get({ tree: null }).tree ?? super.load(); }

	// ⚠ `patch`, never `set`: this page's own mode record lives under the same key,
	//   and a `set` would replace the whole record and drop it.
	async save(tree){ this.page.store().patch({ tree }); return true; }

	/* ⚠ TWO DIFFERENT TRUE SENTENCES, and saying the wrong one is a lie a reader can
	     check. Before you change anything, these pages came out of the committed FILES
	     and nothing is in your browser at all; after you change something, your version
	     is the one in `localStorage`. The label asks which. */
	label(count){
		const mine = this.page.store().get({ tree: null }).tree;

		return mine
			? "**Saved in this browser.** There is no dev server here, so nothing was written to disk — your "
				+ count + " page" + (count === 1 ? "" : "s") + " live in `localStorage` under this page's own address. "
				+ "[Reset](/imagine/paging/) puts the committed files back."
			: "**Read from the files, and not writable here.** These " + count + " pages came out of `page.json` files in the repo, "
				+ "but there is no dev server on this host — so anything you change is kept in this browser only, and never written to disk.";
	}
}

/* WHICH STORE. Files whenever a dev socket is reachable, this browser otherwise —
   "fs is the default" is this one line. `Socket.disabled` is set at construction on
   any host that is not localhost, so a production page never even tries. */
export function store_for(page){
	return Socket.singleton().disabled ? new LocalStore({ page }) : new FileStore({ page });
}

export default store_for;
