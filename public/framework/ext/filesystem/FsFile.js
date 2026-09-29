import { file_link } from "./file_link.js";
import item from "../../ui/item/item.js";

/**
 * class FsFile — one real file on disk, as a plain data structure: a path, a name, an
 * extension, its parent `FsDir` (or `null` at the root), plus the operations the owner
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
	// ⚠ A DIRECTORY still draws its own row by hand (`FsDir.render()`) — `ui/item`'s
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

	// Dev server only — reuses the same socket `write` rpc `ext/Saver/FileSaver.js`
	// uses, but writes the RAW text handed in rather than JSON-stringifying an object
	// (FileSaver is for saved documents; this is for source files).
	//
	// ⚠ `edit()` and `Socket` are imported HERE, not at the top of the file — every
	// row in every file tree on the site builds an `FsFile` just to call `render()`,
	// and `edit()` alone pulls in a `LocalStorageSaver`. Loading that for a row
	// nobody will ever write to was a real, measured cost (`node Server/review.mjs`),
	// so it's paid only by the one call that actually writes.
	async write(text){
		const [{ edit }, { default: Socket }] = await Promise.all([
			import("../Ask/edit.js"),
			import("../../dev/Socket/Socket.js"),
		]);

		if (!edit()){
			if (!FsFile.warned){
				FsFile.warned = true;
				console.warn("FsFile: no dev socket, so nothing is being written.");
			}
			return false;
		}

		const socket = Socket.singleton();
		const reply = await socket.async_rpc("write", this.url, text);
		if (reply?.response === "write failed"){
			console.warn(`FsFile: the server refused to write ${this.url}.`);
			return false;
		}
		return true;
	}
}

FsFile.warned = false;
