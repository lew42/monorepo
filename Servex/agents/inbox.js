import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { page_path } from "./Layers.js";

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
/* Local time with its offset and milliseconds, as Sessions.js writes it (not imported:
 * Sessions.js pulls in the agent SDK, and this file must load on its own). */
const now_ms = () => {
	const d = new Date(), off = -d.getTimezoneOffset(), pad = n => String(Math.abs(n)).padStart(2, "0");
	return new Date(d.getTime() + off * 60000).toISOString().slice(0, 23) + (off < 0 ? "-" : "+") + pad(Math.trunc(off / 60)) + ":" + pad(off % 60);
};
const bad = (why, status = 400) => Object.assign(new Error(why), { status });

/* EVERY PAGE HAS AN INBOX (page-inbox, 2026-09-30; Servex/doc/inbox.md).
 *
 * Anyone, an agent or the owner, can leave a note on any page. The note is one line
 * in that page's own AI log, `<page dir>/ai/log.jsonl` (the file the drawer and the
 * voice sessions already use), never in page.jsonl, which is the page's content:
 *
 *   {"inbox":   {"id": "n-…", "from": "<agent id | owner>", "text": "…", "at": "<local ISO>"}}
 *   {"cleared": {"id": "n-…", "by": "<who>", "at": "…"}}
 *
 * Append only: a note is open until a `cleared` line names its id. Servex is the only
 * writer (the `drop` and `clear` tools, and `POST /api/inbox/drop|clear` for a page's
 * form), so two drops never tear a line. The drawer reads the file as a static file,
 * so the inbox shows on a static host too; only writing needs Servex. */
export class Inbox {

	constructor(...args){ this.assign({ repo: REPO }, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* A folder as `{disk, name}`: a site path (`/framework/core/Page/`, served from
	 * `public/`), or a repo folder (`Servex/agents`). It must exist: a note on a page
	 * that isn't there would be read by nobody. */
	folder(where){
		const raw = String(where ?? "").trim().replace(/\\/g, "/");
		if (!raw) throw bad("path is required: a site path like /framework/core/Page/ or a repo folder like Servex/agents");
		const site = page_path(raw.replace(/^\/?public\//, "/"));
		if (raw.startsWith("/") && site){
			const disk = path.join(this.repo, "public", ...site.split("/").filter(Boolean));
			if (this.is_dir(disk)) return { disk, name: site };
		}
		const rel = raw.replace(/^\/+|\/+$/g, ""), disk = path.resolve(this.repo, rel);
		if (rel && !path.relative(path.resolve(this.repo), disk).startsWith("..") && this.is_dir(disk)) return { disk, name: rel + "/" };
		throw bad(`"${where}" is not a folder of the site (/framework/core/Page/) or the repo (Servex/agents)`, 404);
	}
	is_dir(disk){ try { return fs.statSync(disk).isDirectory(); } catch { return false; } }
	file(at){ return path.join(at.disk, "ai", "log.jsonl"); }

	append(file, line){
		fs.mkdirSync(path.dirname(file), { recursive: true });
		let lead = "";
		try { const size = fs.statSync(file).size; if (size){ const fd = fs.openSync(file, "r"), b = Buffer.alloc(1); fs.readSync(fd, b, 0, 1, size - 1); fs.closeSync(fd); if (b[0] !== 10) lead = "\n"; } } catch {}
		fs.appendFileSync(file, lead + JSON.stringify(line) + "\n");
	}

	id(){ return "n-" + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 5); }

	/* Leave a note. `from` is the caller Servex stamped, never a field the model typed. */
	drop({ path: where, text, from = "owner" } = {}){
		text = String(text ?? "").trim();
		if (!text) throw bad("text is required");
		if (text.length > 4000) throw bad(`text is ${text.length} characters; at most 4000`);
		const at = this.folder(where);
		const line = { inbox: { id: this.id(), from: String(from || "owner"), text, at: now_ms() } };
		this.append(this.file(at), line);
		return { ok: true, file: `${at.name}ai/log.jsonl`, ...line.inbox };
	}

	/* Clear a note: one `cleared` line, nothing rewritten. Clearing a note that is not
	 * open (unknown, or already cleared) is refused, so a typo'd id says so. */
	clear({ path: where, id, by = "owner" } = {}){
		if (!id) throw bad("id is required: the note's id, as drop answered or list shows it");
		const at = this.folder(where);
		if (!this.open(at).some(n => n.id === id)) throw bad(`no open note "${id}" on ${at.name}`, 404);
		const line = { cleared: { id: String(id), by: String(by || "owner"), at: now_ms() } };
		this.append(this.file(at), line);
		return { ok: true, file: `${at.name}ai/log.jsonl`, ...line.cleared };
	}

	/* The open notes on one page, newest first. */
	open(at){
		let lines = [];
		try { lines = fs.readFileSync(this.file(at), "utf8").split("\n"); } catch {}
		const notes = new Map();
		for (const l of lines){
			let j; try { j = JSON.parse(l); } catch { continue; }
			if (j?.inbox?.id) notes.set(j.inbox.id, j.inbox);
			else if (j?.cleared?.id) notes.delete(j.cleared.id);
		}
		return [...notes.values()].reverse();
	}
	list({ path: where } = {}){ const at = this.folder(where); return { ok: true, path: at.name, open: this.open(at) }; }

	/* The MCP tools, in `mcp.tool()`'s shape. A tab (no caller) is the owner. */
	tools(){
		const who = ctx => ctx?.caller ?? "owner";
		const json = f => (args = {}, ctx) => { try { return JSON.stringify(f(args, ctx)); } catch (e){ return JSON.stringify({ ok: false, why: e.message }); } };
		const PATH = { type: "string", description: "The page: a site path like `/framework/core/Page/`, or a repo folder like `Servex/agents`." };
		const schema = (properties, required) => ({ type: "object", required, properties });
		return [
			{ name: "drop", description: "Leave a note in any page's inbox: \"leave a note here\" for that path. It shows at the top of the page's AI tab until someone clears it."
				+ " Written as one line in `<page>/ai/log.jsonl`; `from` is you. Returns the note's id.",
				inputSchema: schema({ path: PATH, text: { type: "string", description: "The note, in plain words." } }, ["path", "text"]),
				handler: json((a, ctx) => this.drop({ path: a.path, text: a.text, from: who(ctx) })) },
			{ name: "clear", description: "Clear one note from a page's inbox, by the id `drop` gave (or `inbox` lists). Appends a `cleared` line; nothing is rewritten.",
				inputSchema: schema({ path: PATH, id: { type: "string", description: "The note's id, `n-…`." } }, ["path", "id"]),
				handler: json((a, ctx) => this.clear({ path: a.path, id: a.id, by: who(ctx) })) },
			{ name: "inbox", description: "The open notes in one page's inbox, newest first.",
				inputSchema: schema({ path: PATH }, ["path"]),
				handler: json(a => this.list({ path: a.path })) }
		];
	}

	/* `POST /api/inbox/drop {path, text}` and `POST /api/inbox/clear {path, id}`, for a
	 * page's own form. A browser is the owner; `from` may name an agent that posts. */
	routes(router, cors, json){
		const send = (res, f) => { try { res.json(f()); } catch (e){ res.status(e.status || 500).json({ ok: false, why: e.message }); } };
		for (const verb of ["drop", "clear"]) router.options(`/api/inbox/${verb}`, cors, (req, res) => res.status(204).end());
		router.post("/api/inbox/drop", cors, json, (req, res) => send(res, () => this.drop({ path: req.body?.path, text: req.body?.text, from: req.body?.from || "owner" })));
		router.post("/api/inbox/clear", cors, json, (req, res) => send(res, () => this.clear({ path: req.body?.path, id: req.body?.id, by: req.body?.by || "owner" })));
		router.get("/api/inbox", cors, (req, res) => send(res, () => this.list({ path: req.query?.path })));
	}
}

export default Inbox;
