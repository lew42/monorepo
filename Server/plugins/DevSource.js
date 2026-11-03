import fs from "fs";
import path from "path";
import { loopback } from "./MCP.js";

/* DevSource — read-only browsing of `Servex/` and `Server/`, the two folders that run
 * this site but are NOT under `public/`, so `Directory.js`'s `/directory.json` (and
 * every `ext/filesystem` tree built from it) never sees them. Dev server only: this
 * file lives under `Server/`, which production never runs at all, so there is no
 * matching route once the site is deployed — a `file_link()` to one of these paths
 * on production says "dev server only" instead of trying a fetch that can never work.
 *
 * ⚠ Loopback only (review, 2026-09-29 finding 14) — the same guard `MCP.js` keeps for
 * `/mcp`. The server binds `0.0.0.0`, so without this anyone on the LAN could read
 * every file these two folders hold. Checked on BOTH routes below.
 *
 * Two routes:
 *   GET /devsource.json     — the whole tree of both folders, `Directory.js`'s own
 *                              {name, path, type, full, children} shape (`full` is
 *                              the exact site-root-relative path, e.g.
 *                              "Servex/Servex.js" — no `/devsource/` prefix).
 *   GET /Servex/<path>,
 *   GET /Server/<path>      — one file's real text, at the SAME path `full` names —
 *                              real-looking, not a prefixed alias, because
 *                              `ext/files/explorer.js`'s `render()` always fetches a
 *                              path against `location.origin + "/"` and does not take
 *                              a different base url; nothing under `public/` is
 *                              named `Servex` or `Server`, so this claims no url any
 *                              real page already owns.
 *
 * `public/framework/servex/fs/page.js` is the one page that reads both.
 */

const ROOTS = ["Servex", "Server"];
const REPO = process.cwd();

// Never node_modules, a dotfile or dot-directory, `.env`, or anything key-shaped —
// checked on EVERY path segment, not just the last one, so `Server/.secrets/x.js`
// is refused by its directory name alone.
const denied = name =>
	name.startsWith(".") ||
	name === "node_modules" ||
	/\.(env|pem|key|pfx|p12)$/i.test(name) ||
	/secret|credential/i.test(name);

function build_dir(abs_dir, rel_path){
	let entries;
	try { entries = fs.readdirSync(abs_dir, { withFileTypes: true }); } catch { return []; }

	return entries.filter(e => !denied(e.name)).map(e => {
		const full = rel_path ? rel_path + "/" + e.name : e.name;
		const entry = { name: e.name, path: rel_path, type: e.isDirectory() ? "dir" : "file", full };
		if (e.isDirectory()) entry.children = build_dir(path.join(abs_dir, e.name), full);
		return entry;
	});
}

function listing(){
	return {
		files: ROOTS.map(root => ({
			name: root, path: "", type: "dir", full: root,
			children: build_dir(path.join(REPO, root), root),
		})),
	};
}

// A requested path (e.g. "Servex/Servex.js"), made safe: must start with one of
// ROOTS, no segment may be denied(), and the resolved absolute path must still be
// INSIDE that root — the `path.resolve` normalizes any "..", and the prefix check
// below catches anything it walked back out with. `null` means "refuse".
function resolve_safe(rel){
	const clean = String(rel ?? "").replace(/^\/+/, "");
	const segments = clean.split("/").filter(Boolean);
	const top = segments[0];
	if (!ROOTS.includes(top) || segments.some(denied)) return null;

	const abs = path.resolve(REPO, clean);
	const root_abs = path.resolve(REPO, top);
	if (abs !== root_abs && !abs.startsWith(root_abs + path.sep)) return null;

	return abs;
}

export default class DevSource {

	static setup(server){ new DevSource(server); }

	constructor(server){
		this.server = server;
		server.on("express", () => this.route());
	}

	route(){
		this.server.router.get("/devsource.json", (req, res) => {
			if (!loopback(req.socket.remoteAddress)){
				console.warn(`DevSource: REFUSED /devsource.json from ${req.socket.remoteAddress} — loopback only.`);
				return res.status(403).end();
			}
			res.json(listing());
		});

		// A regex route, not an Express 5 wildcard segment — `path-to-regexp`'s v5
		// syntax for "the rest of the path" (`{*name}`) is new and easy to get subtly
		// wrong; a plain capturing regex is the same feature and has not changed.
		this.server.router.get(/^\/(?:Servex|Server)\/.+$/, (req, res) => {
			if (!loopback(req.socket.remoteAddress)){
				console.warn(`DevSource: REFUSED ${req.path} from ${req.socket.remoteAddress} — loopback only.`);
				return res.status(403).end();
			}

			const abs = resolve_safe(decodeURIComponent(req.path.slice(1)));
			if (!abs) return res.status(403).end();

			fs.readFile(abs, "utf8", (error, text) => {
				if (error) return res.status(404).end();
				res.type("text/plain; charset=utf-8").send(text);
			});
		});
	}
}
