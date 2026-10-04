import { div, span, icon } from "../../core/View/View.js";
import FsFile from "./FsFile.js";

/**
 * class Dir — one real directory: a path, a name, its parent `Dir` (or `null` at
 * the root), and `children` — an array of `FsFile` and `Dir` instances, in the order
 * `/directory.json` declared them. `ext/filesystem/tree.js` builds the whole tree once,
 * from the dev server's `/directory.json`, and everyone shares that one tree — nobody
 * fetches it twice. Off the dev server (a static, production host) there is no tree at
 * all; see `tree.js`'s `root()`.
 *
 *   dir.find("framework/ext/filesystem/FsFile.js")   the FsFile at that path, or null
 *   dir.walk()                     every descendant, files and dirs both, flattened
 *
 * Renamed from `FsDir` (2026-10-02) — `Dir` is the owner's own plain word, and
 * nothing on this site collides with a global `Directory`, unlike `FsFile`'s own
 * `File` problem (see FsFile.js's own note). `FsDir.js` stays as a one-line
 * re-export so an old import keeps working. doc/decisions.md.
 */
export default class Dir {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// A path relative to ME (no leading slash) → the FsFile or Dir at it, or `null`
	// if any segment along the way doesn't exist. Walks the tree already built in
	// memory — no second fetch, unlike `core/Page/Markdown.js`'s `node()`, which reads
	// straight off the raw JSON every time it's called.
	find(path){
		const parts = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
		let node = this;
		for (const part of parts){
			node = node.children?.find(child => child.name === part);
			if (!node) return null;
		}
		return node;
	}

	// Every descendant, files and directories both, flattened — depth-first,
	// declaration order. `ext/files/fs.js`'s `list()` filters this to `FsFile`s for a
	// flat path list; a caller that wants only the files or only the folders filters
	// with `instanceof`.
	walk(){
		const found = [];
		const recurse = dir => dir.children.forEach(child => {
			found.push(child);
			if (child instanceof Dir) recurse(child);
		});
		recurse(this);
		return found;
	}

	// The default view: an icon and the name, one row — same shape as `FsFile.render()`.
	// `ext/files/files.js`'s tree widget owns the open/close state and the recursion
	// into `children`; this only draws the directory's own row.
	render(){
		return div.c("file-dir-name", () => { icon("chevron_right"); span.c("file-label", this.name); });
	}
}
