import { file_link } from "./file_link.js";
import item from "../../ui/item/item.js";
import Item from "../../core/Item/Item.js";

/**
 * class FsFile — one real file on disk, as a plain data structure: a path, a name, an
 * extension, its parent `Dir` (or `null` at the root), plus the operations the owner
 * asked for (read, write, render, the two kinds of link). `ext/filesystem/tree.js` builds
 * every `FsFile` from `/directory.json`; nothing else constructs one by hand.
 *
 *   file.name          "FsFile.js"
 *   file.extension     "js"
 *   file.url           "/framework/ext/filesystem/FsFile.js"   (fetchable, site-root path)
 *   await file.read()  the text on disk
 *   file.render()      the default row: an icon and the name — what ext/files draws today
 *
 * Named `FsFile`, not `File` — the browser's own `File` (a real upload picks one) lives
 * in the same global scope, and shadowing it silently would bite the first feature that
 * needs both in one file. doc/decisions.md.
 */
export default class FsFile {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	get extension(){
		const dot = this.name.lastIndexOf(".");
		return dot > 0 ? this.name.slice(dot + 1) : "";
	}

	// The fetchable, site-root path — leading slash, e.g. "/framework/ext/filesystem/FsFile.js".
	get url(){ return "/" + this.path.replace(/^\/+/, ""); }

	// The ONE `Item.Store` for this file, if it's a `.jsonl` — `Item.Store.for(url)`
	// caches one instance per url (core/Item/Store.js), so every `FsFile` built for the
	// same path (a tree walk builds a fresh instance per row) still shares the one
	// writer and its one echo-skip list. A plain file (not `.jsonl`) has no store at all.
	get store(){ return /\.jsonl$/.test(this.path) ? Item.Store.for(this.url) : undefined; }

	// The text on disk. `fetch()` is the same call under the name the brief also asks
	// for — callers reach for either word.
	async read(){
		const response = await fetch(this.url);
		if (!response.ok) throw new Error(`FsFile: ${this.url} failed to load (${response.status}).`);
		return response.text();
	}
	fetch(){ return this.read(); }

	// The default view: `ui/item`'s row (an icon, then the name) — one place owning
	// "what a file looks like" for every caller. `.ac("file-name")` keeps the class
	// `ext/files/files.js`'s click delegate and `.selected` styling already key off;
	// `data-path` is what that delegate reads to know which file was clicked.
	//
	// ⚠ A DIRECTORY still draws its own row by hand (`Dir.render()`) — `ui/item`'s
	// tree mode makes the browser own open/shut via `<details>`, and `ext/files`'
	// folders build their rows LAZILY on first click, a behavior `rows()` owns and
	// `ui/item` doesn't offer a hook for. Swapping folders too is a real rewrite of
	// that click-routing, not a class change — `ui/item/doc/reuse.md` found the same
	// thing independently. Left as `.file-dir-name`, unchanged.
	render(){
		return item({ icon: "description", name: this.name }).ac("file-name").attr("data-path", this.path);
	}

	// A plain link to the raw file — "Open raw" in the right-click menu.
	raw_url(){ return this.url; }

	// A link to this file inside the `/fs/` browser, its folder already open to it.
	fs_url(line){ return file_link(this.path, line); }

	// ── The ONE file API ────────────────────────────────────────────────────────
	// Nothing else on the site calls the dev socket's `write` or `append` RPC: every
	// writer goes through `write()`, `append()` or an Item's store, and
	// `Server/review.mjs` fails a branch that adds a raw call anywhere else
	// (readme.md, "One file API"). Off localhost there is no socket: each call warns
	// once and returns false, so a caller never has to check for itself.
	//
	// ⚠ `Socket` is imported INSIDE these methods, not at the top of the file — every
	// row in every file tree builds an `FsFile` just to call `render()`, and loading
	// the socket for a row nobody writes to was a real, measured cost.

	// The socket, or null (with one warning) when there isn't a live one.
	static async socket(){
		const { default: Socket } = await import("../../dev/Socket/Socket.js");
		const socket = Socket.singleton();
		if (!socket.disabled) return socket;
		if (!FsFile.warned){
			FsFile.warned = true;
			console.warn("FsFile: no dev socket, so nothing is being written.");
		}
		return null;
	}

	// Shorthands for a caller that only has a path.
	static append(path, lines){ return new FsFile({ path }).append(lines); }
	static write(path, text){ return new FsFile({ path }).write(text); }

	// The whole file, replaced — for source edits, uploads and saved JSON only. A
	// `.jsonl` is a log: rewriting it loses every line another writer added since you
	// read it (Server/plugins/SocketServer/Append.js says why), so it is refused.
	async write(text){
		if (/\.jsonl$/.test(this.path)){
			console.warn(`FsFile.write: ${this.url} is a log — use append(line) instead of rewriting it.`);
			return false;
		}
		const socket = await FsFile.socket();
		if (!socket) return false;

		const reply = await socket.async_rpc("write", this.url, text);
		if (reply?.response === "write failed"){
			console.warn(`FsFile: the server refused to write ${this.url}.`);
			return false;
		}
		return true;
	}

	// Empty a log back to zero bytes — the ONE whole-file operation a `.jsonl` allows,
	// for compaction (fold the log into its snapshot first, then clear it). Nothing
	// else rewrites a log.
	static clear(path){ return new FsFile({ path }).clear(); }
	async clear(){
		const socket = await FsFile.socket();
		if (!socket) return false;
		const reply = await socket.async_rpc("write", this.url, "");
		return reply?.response === "write successful";
	}

	// One line, or several, added to the end of a `.jsonl` file. A line is a plain
	// object — the shape every `.jsonl` line on this site already is. Several lines
	// still go in ONE socket call. Returns true once the server has them.
	//
	// When an Item is attached to this file's store (`file.store.host`), the lines go
	// through that store instead, so the file keeps ONE writer and ONE echo-skip list;
	// the store sends them, batched, a microtask later.
	async append(lines){
		const list = [lines].flat();
		const plain = line => !!line && typeof line === "object" && !Array.isArray(line);
		if (!list.length || !list.every(plain)){
			console.warn("FsFile.append: each line must be a plain object —", lines);
			return false;
		}
		if (!/\.jsonl$/.test(this.path)){
			console.warn(`FsFile.append: ${this.path} is not a .jsonl file.`);
			return false;
		}

		const store = this.store;
		if (store?.host){
			list.forEach(line => store.append(line));
			return true;
		}
		return this.send(list);
	}

	// The raw append: an array of objects, one RPC, no store. `Item.Store`'s own
	// batched flush ends here; nothing else should need it.
	async send(lines){
		const socket = await FsFile.socket();
		if (!socket) return false;

		const reply = await socket.async_rpc("append", this.url, lines).catch(() => null);
		if (reply?.response !== "append successful"){
			console.warn(`FsFile: the server refused to append to ${this.url} (${reply?.response ?? "no reply"}).`);
			return false;
		}
		return true;
	}
}

FsFile.warned = false;
