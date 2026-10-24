import fs from "fs";
import path from "path";

/* FolderNames — GET /api/folder-names?dir=/framework/ai/sessions/2026/10/20/
 * answers {names:[...]}: the entry names of ONE folder under `public/`, always a 200
 * (a missing folder is `[]`). The router walk (ai/AITask `has()`) asks it once per
 * folder instead of probing `session.jsonl`, `task.jsonl`, `page.js` and
 * `requirements.md` with a HEAD each, where every miss was a 404 in the console and
 * in the smoke. Dev server only, like the rest of `Server/`. Only names are shown, and
 * only for folders the static server already serves, so there is no loopback guard.
 */

const PUBLIC = path.resolve(process.cwd(), "public");

const denied = name => name.startsWith(".") || name === "node_modules";

export default class FolderNames {

	static setup(server){ new FolderNames(server); }

	constructor(server){
		server.on("express", () => this.route(server));
	}

	route(server){
		server.router.get("/api/folder-names", (req, res) => {
			const segments = String(req.query.dir ?? "").split("/").filter(Boolean);
			if (segments.some(denied)) return res.status(403).end();

			const abs = path.resolve(PUBLIC, ...segments);
			if (abs !== PUBLIC && !abs.startsWith(PUBLIC + path.sep)) return res.status(403).end();

			fs.readdir(abs, (error, names) => {
				res.set("Cache-Control", "no-store").json({ names: error ? [] : names });
			});
		});
	}
}
