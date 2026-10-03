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
 * appended to that page's own `page.jsonl` (the owner, 2026-09-30: "append to that
 * module's page.jsonl and it just goes into its inbox"). A card is already a page.jsonl,
 * so every card has an inbox too. Every line uses the ONE key `inbox`, so a page.jsonl
 * reader (core/Page/Log.js, ai2/fold.js) only ever sees one data key it can ignore:
 *
 *   {"inbox": {"id": "n-…", "from": "<agent id | owner>", "text": "…", "at": "<local ISO>"}}
 *   {"inbox": {"id": "n-…", "cleared": {"by": "<who>", "at": "…"}}}
 *   {"inbox": {"coordinator": {"agent", "task", "topic", "event"}, "at": "…"}}
 *
 * ⚠ A page.jsonl whose line 1 is not a `file` line makes its folder a jsonl PAGE (the
 * loader and Server/plugins/PageFiles.js both read it that way). A folder with a page.js
 * is safe: it is always listed and loaded by its page.js. A plain public folder with
 * neither is not, so `folder()` walks a site path up to the nearest real page.
 *
 * COORDINATION, NOT CHAT (the owner, 2026-09-30). Work on one module is coordinated by one
 * mastermind: the one holding a `claim_topic` on it (topic = the module path, `core/Page`).
 * A drop on a path inside a claimed module goes straight to that coordinator
 * (`agents.send`), and its line lands in the MODULE's page.jsonl marked `routed_to`;
 * only when nobody coordinates the module does it sit in the page's inbox. Taking or
 * releasing a claim writes `{"coordinator": {agent, task, topic, event, at}}` there too
 * (claims.js calls `coordinator()` below).
 *
 * Append only: a note is open until a `cleared` line names its id. Servex is the only
 * writer (the `drop` and `clear` tools, and `POST /api/inbox/drop|clear` for a page's
 * form), so two drops never tear a line. The drawer reads the file as a static file,
 * so the inbox shows on a static host too; only writing needs Servex. */
export class Inbox {

	constructor(...args){ this.assign({ repo: REPO, servex: null }, ...args); }
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
			if (this.is_dir(disk)) return this.page_of({ disk, name: site });
		}
		const rel = raw.replace(/^\/+|\/+$/g, ""), disk = path.resolve(this.repo, rel);
		if (rel && !path.relative(path.resolve(this.repo), disk).startsWith("..") && this.is_dir(disk)) return { disk, name: rel + "/" };
		throw bad(`"${where}" is not a folder of the site (/framework/core/Page/) or the repo (Servex/agents)`, 404);
	}
	is_dir(disk){ try { return fs.statSync(disk).isDirectory(); } catch { return false; } }
	is_page(disk){ return fs.existsSync(path.join(disk, "page.js")) || fs.existsSync(path.join(disk, "page.jsonl")); }
	// A site folder that isn't a page (doc/, shots/) hands its notes to the nearest page above it.
	page_of(at){
		let { disk, name } = at;
		while (name !== "/" && !this.is_page(disk)){ disk = path.dirname(disk); name = name.replace(/[^/]+\/$/, ""); }
		return { disk, name };
	}
	file(at){ return path.join(at.disk, "page.jsonl"); }

	append(file, line){
		fs.mkdirSync(path.dirname(file), { recursive: true });
		let lead = "";
		try { const size = fs.statSync(file).size; if (size){ const fd = fs.openSync(file, "r"), b = Buffer.alloc(1); fs.readSync(fd, b, 0, 1, size - 1); fs.closeSync(fd); if (b[0] !== 10) lead = "\n"; } } catch {}
		fs.appendFileSync(file, lead + JSON.stringify(line) + "\n");
	}

	/* ── the module's coordinator ───────────────────────────────────────── */

	// "public/framework/core/Page/" and "core/Page" name the same module: compare them as "core/page".
	norm(x){ return String(x ?? "").trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "").replace(/^public\//, "").replace(/^framework\//, "").toLowerCase(); }

	claims(){ return this.servex?.claims ?? this.servex?.global?.claims?.() ?? null; }

	// The live claim whose topic contains this folder, the most specific one; null if none.
	coordinator_of(at){
		const here = this.norm(at.name);
		let best = null;
		for (const c of this.claims()?.list() ?? []){
			const t = this.norm(c.thing);
			if (c.stale || !t || c.agent === "owner" || !(here === t || here.startsWith(t + "/"))) continue;
			if (!best || t.length > this.norm(best.thing).length) best = c;
		}
		return best && { agent: best.agent, topic: best.thing };
	}

	// A claim's topic as a folder, if it names one (core/Page, framework/core/Page, Servex/agents).
	module_of(topic){
		const t = String(topic ?? "").trim().replace(/^\/+|\/+$/g, "");
		for (const p of [`/framework/${t}/`, `/${t}/`, t]) { try { return this.folder(p); } catch {} }
		return null;
	}

	/* A claim was taken or released (claims.js `on`): one coordinator line in the module's
	 * own page.jsonl, when the topic names a folder. The latest line for a topic wins. */
	coordinator(event, row){
		const at = this.module_of(row?.thing ?? row?.topic);
		if (!at) return null;
		const agents = this.servex?.agents;
		const task = agents?.task_dir_of?.(row.agent) ?? agents?.live?.get(row.agent)?.task?.dir ?? row.card ?? null;
		const line = { inbox: { coordinator: { agent: row.agent, task, topic: row.thing ?? row.topic, event }, at: now_ms() } };
		this.append(this.file(at), line);
		return line;
	}

	id(){ return "n-" + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 5); }

	/* Leave a note. `from` is the caller Servex stamped, never a field the model typed. */
	drop({ path: where, text, from = "owner" } = {}){
		text = String(text ?? "").trim();
		if (!text) throw bad("text is required");
		if (text.length > 4000) throw bad(`text is ${text.length} characters; at most 4000`);
		const at = this.folder(where), from_ = String(from || "owner");
		const boss = this.coordinator_of(at);
		if (boss && boss.agent !== from_){
			try {
				this.servex.agents.send(boss.agent, `A note for you, as the coordinator of ${boss.topic}, left on ${at.name} by ${from_}:

${text}`,
					{ from: from_, reply_to: `message ${from_}` });
				const home = this.module_of(boss.topic) ?? at;
				const line = { inbox: { id: this.id(), from: from_, text, at: now_ms(), path: at.name, routed_to: boss.agent } };
				this.append(this.file(home), line);
				return { ok: true, file: `${home.name}page.jsonl`, ...line.inbox };
			} catch (e){ /* the coordinator can't be reached: the note waits in the page's inbox instead */ }
		}
		const line = { inbox: { id: this.id(), from: from_, text, at: now_ms() } };
		this.append(this.file(at), line);
		return { ok: true, file: `${at.name}page.jsonl`, ...line.inbox, ...(boss ? { coordinator: boss.agent } : {}) };
	}

	/* page_note (2026-10-02, the owner via vscode-mastermind): a note written straight onto
	 * the page's own `note` line — `{"note": {id, from, to?, text, at}}` — instead of only
	 * the `{"inbox": {...}}` shape `drop()` writes above. The difference is on the READING
	 * side: `core/Page/ext/Inbox` collects `note` lines by tailing page.jsonl itself (the
	 * same live replay every page already does), so a page's inbox still shows them with
	 * Servex down — only the WAKE below needs Servex. `drop`/`clear`/`inbox` (the `inbox:`
	 * shape, read through `/api/inbox`) are UNCHANGED and keep working for one release;
	 * nothing here touches them. Dev-only, like the rest of this file (Servex and the dev
	 * server are both local-machine-only today). */
	note({ path: where, text, to, from = "owner" } = {}){
		text = String(text ?? "").trim();
		if (!text) throw bad("text is required");
		if (text.length > 4000) throw bad(`text is ${text.length} characters; at most 4000`);
		const at = this.folder(where);
		const id = this.id();
		from = String(from || "owner");
		const line = { note: { id, from, ...(to ? { to } : {}), text, at: now_ms() } };
		this.append(this.file(at), line);

		const woke = this.wake(at, { to, from });
		return { ok: true, file: `${at.name}page.jsonl`, ...line.note, ...(woke ? { woke } : {}) };
	}

	/* A short WAKE, never the note's own text — the text already sits in the file, so
	 * duplicating it into the message would be the second copy CLAUDE.md law 7 forbids.
	 * `to` wakes that agent directly, if Servex still has it registered; left out, it falls
	 * back to the module's own coordinator (the same `coordinator_of()` `drop()` uses).
	 * Nobody to wake (no `to`, no coordinator, Servex's agents not wired into this process)
	 * is not an error: the note still landed, for whoever opens the page next. */
	wake(at, { to, from }){
		const agents = this.servex?.agents;
		if (!agents) return null;
		const target = to ?? this.coordinator_of(at)?.agent;
		if (!target || target === from) return null;
		if (agents.registry_list && !agents.registry_list().some(r => r.id === target)) return null;
		try {
			agents.send(target, `A note on ${at.name} from ${from} — page_read it.`, { from, reply_to: `message ${from}` });
			return target;
		} catch { return null; }
	}

	/* Clear a note: one `cleared` line, nothing rewritten. Clearing a note that is not
	 * open (unknown, or already cleared) is refused, so a typo'd id says so. */
	clear({ path: where, id, by = "owner" } = {}){
		if (!id) throw bad("id is required: the note's id, as drop answered or list shows it");
		const at = this.folder(where);
		if (!this.open(at).some(n => n.id === id)) throw bad(`no open note "${id}" on ${at.name}`, 404);
		const line = { inbox: { id: String(id), cleared: { by: String(by || "owner"), at: now_ms() } } };
		this.append(this.file(at), line);
		return { ok: true, file: `${at.name}page.jsonl`, id: String(id), ...line.inbox.cleared };
	}

	/* The open notes on one page, newest first. */
	open(at){
		let lines = [];
		try { lines = fs.readFileSync(this.file(at), "utf8").split("\n"); } catch {}
		const notes = new Map();
		for (const l of lines){
			let j; try { j = JSON.parse(l); } catch { continue; }
			const n = j?.inbox;
			if (!n?.id) continue;                                   // a coordinator line, or not an inbox line at all
			if (n.cleared) notes.delete(n.id);
			else if (!n.routed_to && n.text) notes.set(n.id, n);    // a routed note went to its coordinator
		}
		return [...notes.values()].reverse();
	}
	list({ path: where } = {}){ const at = this.folder(where); return { ok: true, path: at.name, coordinator: this.coordinator_of(at), open: this.open(at) }; }

	/* The MCP tools, in `mcp.tool()`'s shape. A tab (no caller) is the owner. */
	tools(){
		const who = ctx => ctx?.caller ?? "owner";
		const json = f => (args = {}, ctx) => { try { return JSON.stringify(f(args, ctx)); } catch (e){ return JSON.stringify({ ok: false, why: e.message }); } };
		const PATH = { type: "string", description: "The page: a site path like `/framework/core/Page/`, or a repo folder like `Servex/agents`." };
		const schema = (properties, required) => ({ type: "object", required, properties });
		return [
			{ name: "drop", description: "Coordination, never chat: leave a note on any page, only when it is necessary (the owner asked you to tell another agent, a handoff)."
				+ " If a mastermind coordinates that page's module (holds a claim_topic on it), the note goes straight to that mastermind (`routed_to` in the answer)."
				+ " Otherwise it waits in the page's inbox, at the top of its AI tab, until someone clears it. One line in the page's `page.jsonl`; `from` is you.",
				inputSchema: schema({ path: PATH, text: { type: "string", description: "The note, in plain words." } }, ["path", "text"]),
				handler: json((a, ctx) => this.drop({ path: a.path, text: a.text, from: who(ctx) })) },
			{ name: "clear", description: "Clear one note from a page's inbox, by the id `drop` gave (or `inbox` lists). Appends a `cleared` line; nothing is rewritten.",
				inputSchema: schema({ path: PATH, id: { type: "string", description: "The note's id, `n-…`." } }, ["path", "id"]),
				handler: json((a, ctx) => this.clear({ path: a.path, id: a.id, by: who(ctx) })) },
			{ name: "inbox", description: "The open notes in one page's inbox, newest first.",
				inputSchema: schema({ path: PATH }, ["path"]),
				handler: json(a => this.list({ path: a.path })) },
			{ name: "page_note", description: "Leave a note for whoever reads this page next — a `note` line appended straight to its"
				+ " page.jsonl (id, from, to?, text, at). Unlike `drop`, this is read by the page's OWN Inbox"
				+ " (core/Page/ext/Inbox, tailing page.jsonl), so it still shows with Servex down. If `to` names a"
				+ " live agent, or the page's module has a coordinator (`claim_topic`), Servex also sends that agent"
				+ " a short WAKE — never the text itself, which already lives in the file; the agent reads it with"
				+ " `page_read`. The older `drop`/`inbox:` notes keep working too, for one release.",
				inputSchema: schema({ path: PATH, text: { type: "string", description: "The note, in plain words." },
					to: { type: "string", description: "An agent id to wake. Omit to wake the module's coordinator, if any — the note lands either way." } }, ["path", "text"]),
				handler: json((a, ctx) => this.note({ path: a.path, text: a.text, to: a.to, from: who(ctx) })) },
		];
	}

	/* `POST /api/inbox/drop {path, text}` and `POST /api/inbox/clear {path, id}`, for a
	 * page's own form. A browser is the owner; `from` may name an agent that posts. */
	routes(router, cors, json){
		const send = (res, f) => { try { res.json(f()); } catch (e){ res.status(e.status || 500).json({ ok: false, why: e.message }); } };
		for (const verb of ["drop", "clear"]) router.options(`/api/inbox/${verb}`, cors, (req, res) => res.status(204).end());
		router.post("/api/inbox/drop", cors, json, (req, res) => send(res, () => this.drop({ path: req.body?.path, text: req.body?.text, from: req.body?.from || "owner" })));
		router.post("/api/inbox/clear", cors, json, (req, res) => send(res, () => this.clear({ path: req.body?.path, id: req.body?.id, by: req.body?.by || "owner" })));
		/* A page with no folder of its own (a card, a query view) has an empty inbox, not a
		 * 404: the drawer asks on every open, and a 404 is a console error on the page. */
		router.options("/api/inbox", cors, (req, res) => res.status(204).end());
		router.get("/api/inbox", cors, (req, res) => send(res, () => {
			try { return this.list({ path: req.query?.path }); }
			catch (e){ if (e.status === 404) return { ok: true, path: req.query?.path ?? null, open: [], none: e.message }; throw e; }
		}));
	}
}

export default Inbox;
