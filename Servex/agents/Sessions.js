import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { place } from "../home.js";
import Usage from "../Usage.js";
import { page_path } from "./Layers.js";
import { session_facts } from "./Agents.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "../..");
/* A refined line's `level` (the audio task's format, 2026-09-29): `clean` = the owner's
 * words with the fillers gone, `edit` = rewritten for clarity, `summary` = the gist.
 * ext/Session/Session.js exports the same list as LEVELS. */
export const LEVELS = ["clean", "edit", "summary"];

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
 *            {"backing": {at, fast, smart, how}}   (a respawn; the latest one wins)
 *
 * Every page the session touches gets ONE pointer line in its own `page.jsonl`:
 * `{"session": {id, file, at}}`; `session_summary` appends a fresh one with the
 * title and summary (the latest pointer for an id wins). The title and summary
 * themselves are `<home>ai/<session>.summary.json`.
 *
 * LIFE (memory first): /new and resume spawn NOTHING. The first say spawns the FAST
 * agent and sends it the line at once; the SMART one is spawned on the next tick and
 * loads its big context while the fast one answers. A pair that hears nothing for 5
 * minutes is stopped (`SERVEX_SESSION_IDLE_MS`); the next say resumes it by its backing
 * session id. At most 2 pairs are live machine-wide (`SERVEX_SESSION_MAX_PAIRS`): a
 * third stops the oldest idle one first. A /new on a page whose session spoke in the
 * last hour returns THAT session (`SERVEX_SESSION_RESUME_MS`).
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
			idle_ms: env("SERVEX_SESSION_IDLE_MS", 5 * 60000), resume_ms: env("SERVEX_SESSION_RESUME_MS", 60 * 60000),
			max_pairs: env("SERVEX_SESSION_MAX_PAIRS", 2),
			map: {}, by_agent: new Map(), waiting: new Map() };
	}

	install(){
		this.file ??= place("sessions.json");
		this.load();
		this.listen();
		this.route();
		this.sweeper = setInterval(() => this.sweep(), Math.min(60000, Math.max(1000, this.idle_ms / 4)));
		this.sweeper.unref?.();
		return this;
	}

	// ── state ────────────────────────────────────────────────────────────────

	load(){
		try { this.map = JSON.parse(fs.readFileSync(this.file, "utf8")); } catch { this.map = {}; }
		for (const [id, s] of Object.entries(this.map)) for (const role of ["fast", "smart"]) if (s[role]) this.by_agent.set(s[role], { id, role });
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

	write(s, line){
		this.append(this.disk(s.file), line);
		s.last_at = now_ms();
		this.save();
	}

	/* The last `n` lines of a session's file, as text: the context a FRESH agent gets
	 * when its old Claude session cannot be resumed. */
	tail(s, n = 40){
		try { return fs.readFileSync(this.disk(s.file), "utf8").split("\n").filter(l => l.trim()).slice(-n).join("\n"); }
		catch { return ""; }
	}

	summary_file(s){ return this.disk(s.file.replace(/\.jsonl$/, ".summary.json")); }

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
		const [last] = this.recent({ page: home, host, limit: 1 });
		if (last && Date.now() - Date.parse(last.last_at) < this.resume_ms) return this.resume({ session: last.session });
		let id;
		do id = "v-" + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 5); while (this.map[id]);
		const file = `${home}ai/${id}.jsonl`;
		/* No agents yet: the first say spawns them (wake). */
		const s = { id, home, file, at: now_ms(), host, path: asked, visited: [], fast: null, smart: null, backing: { fast: null, smart: null } };
		this.map[id] = s;
		this.write(s, { session: { id, home, at: s.at, host, fast: null, smart: null, backing: s.backing } });
		this.point(s, home);
		this.save();
		const previous = last ? { session: last.session, title: last.title, summary: last.summary, at: last.last_at } : null;
		return { ok: true, session: id, home, file, resumed: false, previous };
	}

	/* Continue any session by id. Nothing spawns until the next say. */
	resume({ session } = {}){
		const s = this.get(session);
		const { title = null, summary = null } = this.summary_of(s);
		return { ok: true, session: s.id, home: s.home, file: s.file, resumed: true, title, summary, at: s.at, last_at: s.last_at ?? s.at };
	}

	/* Sessions started on, or passing through, `page` (its nearest folder), newest
	 * first, from one host only. A session's last line is `last_at`. */
	recent({ page = "/", host = null, limit = 10 } = {}){
		const at = this.nearest(page_path(page) ?? "/");
		return Object.values(this.map)
			.filter(s => (s.host ?? null) === (host ?? null) && (s.home === at || (s.visited ?? []).includes(at)))
			.map(s => ({ session: s.id, home: s.home, ...this.summary_of(s), at: s.at, last_at: s.last_at ?? s.at }))
			.sort((a, b) => Date.parse(b.last_at) - Date.parse(a.last_at))
			.slice(0, Math.max(1, Number(limit) || 10));
	}

	summary_of(s){
		try { const j = JSON.parse(fs.readFileSync(this.summary_file(s), "utf8")); return { title: j.title ?? null, summary: j.summary ?? null }; }
		catch { return { title: s.title ?? null, summary: s.summary ?? null }; }
	}

	// ── what the smart assistant writes (tools.js: session_summary, session_line) ──

	/* A title (at most 6 words) and a one-line summary: the index of a session. */
	summarize({ session, title, summary } = {}){
		const s = this.get(session);
		title = String(title ?? "").trim().replace(/\s+/g, " ");
		summary = String(summary ?? "").trim().replace(/\s+/g, " ");
		if (!title || !summary) throw Object.assign(new Error("title and summary are both required"), { status: 400 });
		const words = title.split(" ").length;
		if (words > 6) throw Object.assign(new Error(`the title is ${words} words; at most 6`), { status: 400 });
		const at = now_ms();
		Object.assign(s, { title, summary });
		fs.mkdirSync(path.dirname(this.summary_file(s)), { recursive: true });
		fs.writeFileSync(this.summary_file(s), JSON.stringify({ id: s.id, home: s.home, title, summary, at, visited: s.visited ?? [] }, null, 2));
		this.append(path.join(this.disk(s.home), "page.jsonl"), { session: { id: s.id, file: s.file, at, title, summary } });
		this.save();
		return { ok: true, session: s.id, title, summary, at };
	}

	/* A line from the smart assistant. `re` alone: a reply to that owner line. `re` +
	 * `level`: a REFINED version of it, drawn under the raw words. */
	line({ session, text, re, level } = {}){
		const s = this.get(session);
		if (!String(text ?? "").trim()) throw Object.assign(new Error("text is required"), { status: 400 });
		if (level != null && !LEVELS.includes(level)) throw Object.assign(new Error(`level must be one of ${LEVELS.join(", ")}`), { status: 400 });
		if (level != null && !re) throw Object.assign(new Error("a refined line needs `re`, the owner line's at"), { status: 400 });
		const line = { at: now_ms(), session: s.id, path: s.path, from: { kind: "assistant", id: "smart", agent: s.smart }, via: "text", text,
			...(re ? { re } : {}), ...(level ? { level } : {}) };
		this.write(s, { chat: line });
		return { ok: true, at: line.at };
	}

	say({ session, path: at, text, via = "text" } = {}){
		const s = this.get(session);
		if (!String(text ?? "").trim()) throw Object.assign(new Error("text is required"), { status: 400 });
		const site = page_path(at) ?? s.path;
		if (site !== s.path) this.nav({ session, from: s.path, to: site });
		const line = { at: now_ms(), session, path: site, from: { kind: "owner" }, via, text };
		this.write(s, { chat: line });
		s.fast_re = line.at;
		this.wake(s, "fast");
		this.send(s, "fast", `[on ${site}] ${text}`);
		/* The smart one spawns on the NEXT tick, so the fast one's process starts first and alone. */
		setImmediate(() => { try { this.wake(s, "smart"); } catch (e){ console.error(`sessions: ${e.message}`); } });
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
			this.wake(s, "smart");
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
	spawn(s, role, { resume = null, context = "" } = {}){
		const where = `\n\nThis session is ${s.id}. Its home page is ${s.home}; the owner pressed ✦ on ${s.path}.`
			+ (context ? `\n\nThis session ran before you; its last lines follow (the whole record is public${s.file}):\n${context}` : "");
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
		return this.servex.agents.spawn({ ...spec, ...(s[role] ? { id: s[role] } : {}), ...(resume ? { resume } : {}) });
	}

	// ── sleep and wake ───────────────────────────────────────────────────────

	awake(s, role){
		const a = this.servex.agents.live.get(s[role]);
		return !!a && a.state !== "stopped";
	}

	/* Spawn one agent of the pair if it is not live: RESUME its Claude session when that
	 * session's file still exists; else start fresh, given the session file's last 40
	 * lines when it had a session before. A new pair first makes room (max_pairs).
	 * Each spawn writes a `backing` line (the latest one wins). */
	wake(s, role){
		if (this.awake(s, role)) return false;
		if (!this.awake(s, "fast") && !this.awake(s, "smart")) this.room(s);
		const old = s.backing?.[role];
		const can = !!(old && session_facts(old).cwd);
		const how = can ? "resume" : old ? "fresh" : "new";
		const agent = this.spawn(s, role, can ? { resume: old } : { context: old ? this.tail(s, 40) : "" });
		s[role] = agent.id;
		this.by_agent.set(agent.id, { id: s.id, role });
		(s.backing ??= {})[role] = agent.session_id ?? null;
		delete s.asleep_at;
		this.write(s, { backing: { at: now_ms(), fast: s.backing.fast ?? null, smart: s.backing.smart ?? null, how: { [role]: how } } });
		return true;
	}

	/* Stop both agents of a session; their Claude sessions stay on disk for the next say. */
	sleep(s, why){
		for (const role of ["fast", "smart"]) if (this.awake(s, role)) try { this.servex.agents.stop(s[role]); } catch {}
		s.asleep_at = now_ms();
		s.asleep_why = why;
		this.save();
	}

	live_pairs(){ return Object.values(this.map).filter(x => this.awake(x, "fast") || this.awake(x, "smart")); }

	/* At most `max_pairs` live pairs machine-wide: stop the oldest IDLE one (neither agent
	 * mid-turn) until there is room. If every live pair is mid-turn, go over rather than cut one off. */
	room(s){
		for (;;){
			const live = this.live_pairs().filter(x => x !== s);
			if (live.length < this.max_pairs) return;
			const idle = live.filter(x => !["fast", "smart"].some(r => this.servex.agents.live.get(x[r])?.state === "working"))
				.sort((a, b) => Date.parse(a.last_at ?? a.at) - Date.parse(b.last_at ?? b.at));
			if (!idle.length) return console.error(`sessions: ${live.length} pairs live and all busy; ${s.id} goes over the cap`);
			this.sleep(idle[0], `room for ${s.id}`);
		}
	}

	/* A pair that heard nothing for `idle_ms` is stopped. */
	sweep(){
		const t = Date.now();
		for (const s of this.live_pairs())
			if (t - Date.parse(s.last_at ?? s.at) >= this.idle_ms) this.sleep(s, "idle");
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
		/* The browser's host: the dev server's proxy forwards it (x-forwarded-host); a page on
		 * localhost calls Servex directly, so there the body carries its own `location.host`. */
		const host_of = (req, b) => req.headers["x-forwarded-host"] ?? b.host ?? req.headers.host ?? null;
		for (const [verb, fn] of [["new", "create"], ["say", "say"], ["nav", "nav"], ["resume", "resume"]]){
			router.options(`/api/session/${verb}`, cors, (req, res) => res.status(204).end());
			router.post(`/api/session/${verb}`, cors, async (req, res) => {
				try { const b = await body(req); res.json(this[fn](verb === "new" ? { ...b, host: host_of(req, b) } : b)); }
				catch (e){ res.status(e.status ?? 500).json({ ok: false, error: String(e.message || e) }); }
			});
		}
		router.get("/api/sessions", cors, (req, res) => {
			try { res.json({ ok: true, sessions: this.recent({ page: req.query.page ?? "/", limit: req.query.limit, host: host_of(req, { host: req.query.host }) }) }); }
			catch (e){ res.status(500).json({ ok: false, error: String(e.message || e) }); }
		});
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
