import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { place } from "../home.js";
import Usage from "../Usage.js";
import { page_path } from "./Layers.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "../..");
const env = (name, dflt) => { const n = Number(process.env[name]); return process.env[name] != null && process.env[name] !== "" && Number.isFinite(n) ? n : dflt; };

/* Local time with its offset AND milliseconds — `2026-09-29T19:30:12.345-05:00`.
 * The milliseconds matter: a reply's `re` names the owner line it answers by its
 * `at`, so two lines said in the same second must not share one. */
export const now_ms = () => {
	const d = new Date(), off = -d.getTimezoneOffset(), pad = n => String(Math.abs(n)).padStart(2, "0");
	return new Date(d.getTime() + off * 60000).toISOString().slice(0, 23) + (off < 0 ? "-" : "+") + pad(Math.trunc(off / 60)) + ":" + pad(off % 60);
};

/* VOICE SESSIONS (ai/2026-09-29/voice-sessions/design.md).
 *
 * One ✦ press is one SESSION: it remembers the page it started on (its home),
 * follows the owner from page to page, and is answered by its own pair of
 * agents, a FAST one (one short line, within seconds) and a SMART one (the
 * thinking, the decisions, the masterminds). Everything is one file,
 * `public<home>ai/<session>.jsonl`, that the browser polls:
 *
 *   line 1   {"session": {id, home, at, host, fast, smart, backing: {fast, smart}}}
 *   then     {"chat": {at, session, path, from: {kind, id, agent?}, via, text, re?}}
 *            {"nav":  {at, from, to}}
 *
 * Every page the session touches gets ONE pointer line in its own `page.jsonl`:
 * `{"session": {id, file, at}}`.
 *
 * REPLIES need no tool: each agent's final text for a turn is read off its event
 * stream (the host's `watch()` seam) and written here as its chat line, `re` = the
 * newest owner line it had been sent. Plain code; its only memory is
 * `sessions.json` in Servex's home, so a restart still finds a session's file. */
export default class Sessions {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	defaults(){
		return { repo: REPO, file: process.env.SERVEX_SESSIONS_FILE || null, quiet_ms: env("SERVEX_SESSION_QUIET_MS", 1500),
			map: {}, by_agent: new Map(), waiting: new Map() };
	}

	install(){
		this.file ??= place("sessions.json");
		this.load();
		this.listen();
		this.route();
		return this;
	}

	// ── state ────────────────────────────────────────────────────────────────

	load(){
		try { this.map = JSON.parse(fs.readFileSync(this.file, "utf8")); } catch { this.map = {}; }
		for (const [id, s] of Object.entries(this.map)){ this.by_agent.set(s.fast, { id, role: "fast" }); this.by_agent.set(s.smart, { id, role: "smart" }); }
	}

	save(){
		fs.mkdirSync(path.dirname(this.file), { recursive: true });
		fs.writeFileSync(this.file, JSON.stringify(this.map, null, 2));
	}

	get(id){
		const s = this.map[id];
		if (!s) throw Object.assign(new Error(`no session "${id}"`), { status: 404 });
		return s;
	}

	// ── files ────────────────────────────────────────────────────────────────

	disk(site){ return path.join(this.repo, "public", ...site.split("/").filter(Boolean)); }
	is_dir(site){ try { return fs.statSync(this.disk(site)).isDirectory(); } catch { return false; } }

	/* The nearest page that exists on disk, walking up: a route with no folder of its own
	 * (a query view, a typo) still gets a home, never a 404. */
	nearest(site){
		let p = site;
		while (p !== "/" && !this.is_dir(p)) p = p.replace(/[^/]+\/$/, "");
		return p;
	}

	append(file, line){
		fs.mkdirSync(path.dirname(file), { recursive: true });
		let lead = "";
		try { const size = fs.statSync(file).size; if (size){ const fd = fs.openSync(file, "r"), b = Buffer.alloc(1); fs.readSync(fd, b, 0, 1, size - 1); fs.closeSync(fd); if (b[0] !== 10) lead = "\n"; } } catch {}
		fs.appendFileSync(file, lead + JSON.stringify(line) + "\n");
	}

	write(s, line){ this.append(this.disk(s.file), line); }

	/* One pointer per session per page, never one per sentence. */
	point(s, site){
		const page = this.nearest(site);
		if ((s.visited ??= []).includes(page)) return;
		s.visited.push(page);
		this.append(path.join(this.disk(page), "page.jsonl"), { session: { id: s.id, file: s.file, at: now_ms() } });
		this.save();
	}

	// ── the three verbs ──────────────────────────────────────────────────────

	create({ path: at, host = null } = {}){
		const asked = page_path(at);
		if (!asked) throw Object.assign(new Error(`"${at}" is not a page path`), { status: 400 });
		const home = this.nearest(asked);
		let id;
		do id = "v-" + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 5); while (this.map[id]);
		const file = `${home}ai/${id}.jsonl`;
		const s = { id, home, file, at: now_ms(), host, path: asked, visited: [] };
		const fast = this.spawn(s, "fast"), smart = this.spawn(s, "smart");
		Object.assign(s, { fast: fast.id, smart: smart.id, backing: { fast: fast.session_id ?? null, smart: smart.session_id ?? null } });
		this.map[id] = s;
		this.by_agent.set(s.fast, { id, role: "fast" });
		this.by_agent.set(s.smart, { id, role: "smart" });
		this.write(s, { session: { id, home, at: s.at, host, fast: s.fast, smart: s.smart, backing: s.backing } });
		this.point(s, home);
		this.save();
		return { ok: true, session: id, home, file };
	}

	say({ session, path: at, text, via = "text" } = {}){
		const s = this.get(session);
		if (!String(text ?? "").trim()) throw Object.assign(new Error("text is required"), { status: 400 });
		const site = page_path(at) ?? s.path;
		if (site !== s.path) this.nav({ session, from: s.path, to: site });
		const line = { at: now_ms(), session, path: site, from: { kind: "owner" }, via, text };
		this.write(s, { chat: line });
		s.fast_re = line.at;
		this.send(s, "fast", `[on ${site}] ${text}`);
		this.gather(s, line);
		return { ok: true, at: line.at, answered_by: [
			{ kind: "assistant", id: "fast", agent: s.fast }, { kind: "assistant", id: "smart", agent: s.smart }] };
	}

	nav({ session, from, to } = {}){
		const s = this.get(session);
		const dest = page_path(to);
		if (!dest) throw Object.assign(new Error(`"${to}" is not a page path`), { status: 400 });
		const line = { at: now_ms(), from: page_path(from) ?? s.path, to: dest };
		this.write(s, { nav: line });
		(s.moves ??= []).push(dest);
		s.path = dest;
		this.point(s, dest);
		this.save();
		return { ok: true };
	}

	/* The smart assistant hears a thought, not its fragments: lines gathered over a
	 * quiet gap (Layers.hear()'s pattern), with where the owner went since. */
	gather(s, line){
		const w = this.waiting.get(s.id) ?? { lines: [] };
		w.lines.push(line);
		clearTimeout(w.timer);
		w.timer = setTimeout(() => {
			this.waiting.delete(s.id);
			const moves = (s.moves ?? []).splice(0);
			const nav = moves.length ? `(now on ${moves[moves.length - 1]})\n` : "";
			s.smart_re = w.lines[w.lines.length - 1].at;
			this.save();
			this.send(s, "smart", nav + w.lines.map(l => `[on ${l.path}] ${l.text}`).join("\n"));
		}, this.quiet_ms);
		this.waiting.set(s.id, w);
	}

	send(s, role, text){
		try { this.servex.agents.send(s[role], text, { from: "owner" }); }
		catch (e){ this.write(s, { chat: { at: now_ms(), session: s.id, path: s.path, from: { kind: "system", id: "servex" }, via: "text", text: `The ${role} assistant could not be reached: ${e.message}` } }); }
	}

	// ── the two agents ───────────────────────────────────────────────────────

	brief(role){ return fs.readFileSync(path.join(HERE, `session-${role}.md`), "utf8"); }

	/* Held open with no prompt: each one's first turn is the owner's first line. */
	spawn(s, role){
		const where = `\n\nThis session is ${s.id}. Its home page is ${s.home}; the owner pressed ✦ on ${s.path}.`;
		const spec = role === "fast" ? {
			/* LEAN like the Layers page assistant: no settings, no connectors, no memory,
			 * no tools, and no Servex door (`mcp_url: ""`). Its brief is its whole system prompt. */
			role: "session-fast", name: s.id, model: "claude-sonnet-5", effort: "low", urgent: true,
			permission_mode: "bypassPermissions", cwd: this.repo, mcp_url: "", setting_sources: [],
			system: this.brief("fast") + where,
			sdk: { tools: [], env: { ...process.env, ENABLE_CLAUDEAI_MCP_SERVERS: "false", CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" } }
		} : {
			/* The whole Claude Code preset (tools, CLAUDE.md, skills, Servex's MCP door), its brief appended. */
			role: "session-smart", name: s.id, model: Usage.pick("smart", this.repo), effort: "medium", urgent: true,
			permission_mode: "bypassPermissions", cwd: this.repo,
			system: { type: "preset", preset: "claude_code", append: this.brief("smart") + where }
		};
		return this.servex.agents.spawn(spec);
	}

	/* The host's watch() seam: a turn's end on one of our agents is its reply. */
	listen(){
		const agents = this.servex.agents, watch = agents.watch.bind(agents);
		agents.watch = (event, agent) => {
			watch(event, agent);
			try { this.heard(event, agent); } catch (e){ console.error(`sessions: ${e.message}`); }
		};
	}

	heard(event, agent){
		if (event.type !== "result" || event.stopped) return;
		const who = this.by_agent.get(agent.id), s = who && this.map[who.id];
		if (!s) return;
		const text = String(event.text ?? agent.last_text ?? "").trim();
		if (!text) return;
		const re = s[`${who.role}_re`];
		this.write(s, { chat: { at: now_ms(), session: s.id, path: s.path, from: { kind: "assistant", id: who.role, agent: agent.id }, via: "text", text, ...(re ? { re } : {}) } });
	}

	// ── routes ───────────────────────────────────────────────────────────────

	route(){
		const router = this.servex.dashboard?.router;
		if (!router) return;
		const cors = (req, res, next) => { res.set({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type" }); next(); };
		for (const [verb, fn] of [["new", "create"], ["say", "say"], ["nav", "nav"]]){
			router.options(`/api/session/${verb}`, cors, (req, res) => res.status(204).end());
			router.post(`/api/session/${verb}`, cors, async (req, res) => {
				try { res.json(this[fn](await body(req))); }
				catch (e){ res.status(e.status ?? 500).json({ ok: false, error: String(e.message || e) }); }
			});
		}
		router.get("/api/session/:id", cors, (req, res) => {
			const s = this.map[req.params.id];
			s ? res.json({ ok: true, ...s }) : res.status(404).json({ ok: false, error: "no such session" });
		});
	}
}

/* A JSON body: the one express already parsed, else read here (64 kB at most). Layers.js has the same. */
function body(req){
	if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
	return new Promise((resolve, reject) => {
		let text = "";
		req.on("data", chunk => { text += chunk; if (text.length > 65536){ reject(new Error("body over 64 kB")); req.destroy(); } });
		req.on("end", () => { try { resolve(text ? JSON.parse(text) : {}); } catch (e){ reject(e); } });
		req.on("error", reject);
	});
}
