import fs from "fs";
import path from "path";

/* PageIndex: GET /api/index?dir=/framework/&depth=2
 * answers one JSON object for a folder's children, so a page learns its children's titles
 * (and their children's) in ONE request instead of one files.jsonl each (core/Page/doc/index-jsonl.md):
 *
 *   { "dir": "/framework/",
 *     "children": { "core": { "kind": "js", "nav": {title,icon,description}, "children": { "View": { … } } },
 *                   "readme.md": { "kind": "file" } } }
 *
 * `kind` is "js" | "jsonl" | "dir" | "file", from each entry's latest log line. `children` appears
 * only at depth 2 and only for a folder that has its own log. Read from the folder's files.jsonl,
 * or its page.jsonl when that is a jsonl page's own list, and cached per folder until that log's
 * mtime changes. Dev server only, like FolderNames; only listings the static server already serves. */

const PUBLIC = path.resolve(process.cwd(), "public");
const denied = name => name.startsWith(".") || name === "node_modules";
const CHILD = /^([^/]+)\/page\.(jsonl|js)$/;

export default class PageIndex {

	static setup(server){ new PageIndex(server); }

	cache = new Map();   // log path -> { mtime, entries }

	constructor(server){
		server.on("express", () => this.route(server));
	}

	// The latest line per name, read from whichever log the folder has: { name: {kind, nav?} }
	entries(abs){
		for (const file of ["files.jsonl", "page.jsonl"]){
			const log = path.join(abs, file);
			let stat; try { stat = fs.statSync(log); } catch { continue; }
			const hit = this.cache.get(log);
			if (hit?.mtime === stat.mtimeMs) return hit.entries;

			const latest = new Map();
			for (const line of fs.readFileSync(log, "utf8").split("\n")){
				if (!line.trim()) continue;
				let obj; try { obj = JSON.parse(line); } catch { continue; }
				if (typeof obj?.file !== "string") continue;
				const key = obj.file.split("/")[0];
				obj.gone ? latest.delete(key) : latest.set(key, obj);
			}
			if (file === "page.jsonl" && !latest.size) continue;

			const entries = {};
			latest.forEach((obj, key) => {
				const kind = obj.file.match(CHILD)?.[2] ?? (obj.file.includes("/") ? "dir" : "file");
				entries[key] = obj.nav ? { kind, nav: obj.nav } : { kind };
			});
			this.cache.set(log, { mtime: stat.mtimeMs, entries });
			return entries;
		}
		return null;
	}

	build(segments, depth){
		const abs = path.resolve(PUBLIC, ...segments);
		const entries = this.entries(abs);
		if (!entries) return null;
		if (depth < 2) return entries;

		const out = {};
		for (const [name, entry] of Object.entries(entries)){
			const kids = entry.kind === "file" || denied(name) ? null : this.entries(path.join(abs, name));
			out[name] = kids ? { ...entry, children: kids } : entry;
		}
		return out;
	}

	route(server){
		server.router.get("/api/index", (req, res) => {
			const segments = String(req.query.dir ?? "").split("/").filter(Boolean);
			if (segments.some(denied)) return res.status(403).end();

			const abs = path.resolve(PUBLIC, ...segments);
			if (abs !== PUBLIC && !abs.startsWith(PUBLIC + path.sep)) return res.status(403).end();

			const depth = Math.min(Number(req.query.depth) || 1, 2);
			res.set("Cache-Control", "no-store").json({ dir: req.query.dir, children: this.build(segments, depth) ?? {} });
		});
	}
}
