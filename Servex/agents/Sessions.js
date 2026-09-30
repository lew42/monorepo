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
/* Is the owner still talking? Stamped by the composer (ext/Chat/doc/floor.md). */
export const FLOORS = ["speaking", "done"];

/* `<dir>/ai/log.jsonl`: a MINIMAL index of AI work in one folder, presence only, each line
 * pointing at its detail file. These three shapes and nothing else (voice-sessions item 8). */
export const DIR_LOG = {
	session:  { need: ["id", "event", "file"], may: ["title", "at"], event: ["started", "ended"] },
	task:     { need: ["dir", "event"], may: ["title", "at"], event: ["opened", "landed"] },
	decision: { need: ["text", "file"], may: ["at"] }
};

export function check_dir_line(line){
	const keys = Object.keys(line ?? {});
	if (keys.length !== 1 || !DIR_LOG[keys[0]]) throw Object.assign(new Error(`a log.jsonl line is ONE of ${Object.keys(DIR_LOG).join(", ")}`), { status: 400 });
	const kind = keys[0], rule = DIR_LOG[kind], body = line[kind];
	if (!body || typeof body !== "object") throw Object.assign(new Error(`${kind} must be an object`), { status: 400 });
	for (const k of rule.need) if (!String(body[k] ?? "").trim()) throw Object.assign(new Error(`${kind}.${k} is required`), { status: 400 });
	for (const k of Object.keys(body)) if (!rule.need.includes(k) && !rule.may.includes(k))
		throw Object.assign(new Error(`${kind}.${k} is not allowed; ${kind} takes ${[...rule.need, ...rule.may].join(", ")}`), { status: 400 });
	if (rule.event && !rule.event.includes(body.event)) throw Object.assign(new Error(`${kind}.event is ${rule.event.join(" or ")}`), { status: 400 });
	return { [kind]: { ...body, at: body.at ?? now_ms() } };
}

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
 *   line 1   {"session": {id, home, at, project, host, fast, smart, backing: {fast, smart}}}
 *   then     {"chat": {at, session, path, from: {kind, id, agent?}, via, text, re?, floor?, cues?}}
 *            {"nav":  {at, from, to}}
 *            {"backing": {at, fast, smart, how}}   (a respawn; the latest one wins)
 *
 * THE FOLDER INDEX: every folder the session reaches gets a presence line in its own
 * `ai/log.jsonl`, `{"session": {id, event: "started", title, file, at}}`; every one of
 * those folders gets `event: "ended"` (with the latest title) whenever the pair stops,
 * and the home a fresh `started` line whenever `session_summary` changes the title (the
 * latest line for an id wins). Both files are APPEND-ONLY: a follow() reader must never
 * be sent a line twice. Sessions are listed per PROJECT (project_of()), not per host.
 * Only presence goes there, never steps; `dir_log()` below validates every line. The
 * title and summary themselves are `<home>ai/<session>.summary.json`.
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
			max_pairs: env("SERVEX_SESSION_MAX_PAIRS", 2), floor_wait_ms: env("SERVEX_SESSION_FLOOR_WAIT_MS", 8000),
			map: {}, by_agent: new Map(), waiting: new Map(), held: new Map(), floor_timers: new Map() };
	}

	install(){
		this.file ??= place("sessions.json");
		this.load();
		this.backfill();
		this.unanswered();
		this.listen();
		this.route();
		this.sweeper = setInterval(() => this.sweep(), Math.min(60000, Math.max(1000, this.idle_ms / 4)));
		this.sweeper.unref?.();
		return this;
	}

	// ── state ────────────────────────────────────────────────────────────────

	load(){
		try { this.map = JSON.parse(fs.readFileSync(this.file, "utf8")); } catch { this.map = {}; }
		for (const [id, s] of Object.entries(this.map)){
			delete s.floor;   // a floor from before a restart is stale: nobody is still talking into it
			for (const role of ["fast", "smart"]) if (s[role]) this.by_agent.set(s[role], { id, role });
		}
	}

	/* Every folder a session belongs to: its home, then each page it passed through. */
	folders(s){ return [...new Set([s.home, ...(s.visited ?? [])].filter(Boolean))]; }

	ids_in(site){
		try {
			return new Set(fs.readFileSync(path.join(this.disk(site), "ai", "log.jsonl"), "utf8").split("\n")
				.map(l => { try { return JSON.parse(l).session?.id; } catch { return null; } }).filter(Boolean));
		} catch { return new Set(); }
	}

	/* ONCE, on install (review item 4): a session made before the folder index existed has no
	 * line in its folders' `ai/log.jsonl`. Append one `started` line for each; append only,
	 * never a rewrite (a follow() reader of that file must never be sent a line twice). */
	backfill(){
		let wrote = 0;
		for (const s of Object.values(this.map)) for (const site of this.folders(s)){
			if (!this.is_dir(site) || this.ids_in(site).has(s.id)) continue;
			this.append(path.join(this.disk(site), "ai", "log.jsonl"),
				{ session: { id: s.id, event: "started", title: this.summary_of(s).title, file: s.file, at: s.at ?? now_ms() } });
			wrote++;
		}
		console.log(`sessions: backfilled ${wrote} ai/log.jsonl line${wrote === 1 ? "" : "s"} from sessions.json`);
		return wrote;
	}

	/* On install (review item 9): a session whose last chat line is the owner's was cut off by
	 * the restart; say so in its file, so the owner sees it instead of waiting. */
	unanswered(){
		let n = 0;
		for (const s of Object.values(this.map)){
			let last = null;
			try {
				for (const l of fs.readFileSync(this.disk(s.file), "utf8").split("\n")){
					try { const j = JSON.parse(l); if (j.chat) last = j.chat; } catch {}
				}
			} catch { continue; }
			if (last?.from?.kind !== "owner") continue;
			this.append(this.disk(s.file), { chat: { at: now_ms(), session: s.id, path: s.path, from: { kind: "system", id: "servex" }, via: "text",
				text: "Servex restarted; this line wasn't answered. Say it again.", re: last.at } });
			n++;
		}
		if (n) console.log(`sessions: ${n} session${n === 1 ? "" : "s"} had an unanswered line at restart`);
		return n;
	}

	/* The PROJECT a browser host belongs to (review item 8), so the phone on
	 * `10.0.0.135:8481` and the PC on `monorepo.localhost` see the same sessions:
	 * `<name>.localhost` is that name; an ip:port is the Servex project serving that port;
	 * anything else is the project this repo is. */
	project_of(host){
		const h = String(host ?? "").trim().toLowerCase();
		const i = h.lastIndexOf(":"), name = i > 0 ? h.slice(0, i) : h, port = i > 0 ? h.slice(i + 1) : "";
		if (name.endsWith(".localhost")) return name.slice(0, -".localhost".length).split(".").pop();
		const projects = this.servex?.projects ?? [];
		const by_port = port && projects.find(p => String(p.port) === port);
		if (by_port) return by_port.name;
		const own = projects.find(p => p.dir && path.resolve(p.dir) === path.resolve(this.repo));
		return own?.name ?? path.basename(path.resolve(this.repo));
	}

	project(s){ return s.project ?? this.project_of(s.host); }

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

	/* A CARD id (voice-sessions, card sessions): a path under `/framework/ai/`, such as
	 * `2026/09/29/audio-a-library-of-audio-parts-transcrip`, naming an AI 2 card's own folder.
	 * `card_home()` turns it into that folder's site path, `/framework/ai/<card>/`, and returns
	 * null for anything unsafe (`..`, a backslash) or any id whose `page.jsonl` is not actually
	 * there — a card session's home must be a real card, never guessed. */
	card_home(card){
		const id = String(card ?? "").trim().replace(/^\/+|\/+$/g, "");
		if (!id || id.includes("..") || id.includes("\\") || id.includes("\0")) return null;
		const home = `/framework/ai/${id}/`;
		try { return fs.statSync(path.join(this.disk(home), "page.jsonl")).isFile() ? home : null; }
		catch { return null; }
	}

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

	/* A folder, as `{disk, name}`: a site path (`/framework/ext/`, served from `public/`), or
	 * any repo folder (`public/framework/ext`, `Servex/agents`), since much of what a session
	 * decides is about Servex itself (review item 6). */
	folder(dir){
		const raw = String(dir ?? "").trim().replace(/\\/g, "/");
		const site = raw.replace(/^\/?public\//, "/");
		if (site.startsWith("/")){
			const at = page_path(site.endsWith("/") ? site : site + "/");
			if (at && this.is_dir(at)) return { disk: this.disk(at), name: at };
		}
		const rel = raw.replace(/^\/+|\/+$/g, ""), disk = path.resolve(this.repo, rel);
		const inside = rel && !path.relative(path.resolve(this.repo), disk).startsWith("..");
		try { if (inside && fs.statSync(disk).isDirectory()) return { disk, name: rel + "/" }; } catch {}
		throw Object.assign(new Error(`"${dir}" is not a folder of the site (/framework/ext/) or the repo (Servex/agents)`), { status: 400 });
	}

	/* One validated line into `<dir>/ai/log.jsonl` (the dir_log tool). */
	dir_log({ dir, line } = {}){
		const at = this.folder(dir), checked = check_dir_line(typeof line === "string" ? JSON.parse(line) : line);
		this.append(path.join(at.disk, "ai", "log.jsonl"), checked);
		return { ok: true, file: `${at.name}ai/log.jsonl`, line: checked };
	}

	presence(s, site, event){
		this.append(path.join(this.disk(site), "ai", "log.jsonl"),
			{ session: { id: s.id, event, title: s.title ?? null, file: s.file, at: now_ms() } });
	}

	/* One `started` line per session per folder, never one per sentence — UNLESS the pair
	 * had stopped and is now waking (`s.ended`, voice-fixes review item 4): the latest line
	 * for an id wins, so a folder visited before the sleep must get a fresh `started` when
	 * the session passes through it again, or that folder keeps showing it as `ended`
	 * forever even while it is live there. `nav()` calls this before `wake()` clears
	 * `s.ended`, so this still sees it. */
	point(s, site){
		const page = this.nearest(site);
		const seen = (s.visited ??= []).includes(page);
		if (seen && !s.ended) return;
		if (!seen) s.visited.push(page);
		this.presence(s, page, "started");
		this.save();
	}

	// ── the three verbs ──────────────────────────────────────────────────────

	/* `card` (voice-sessions, card sessions, 2026-09-29): with a card id, the session's HOME is
	 * that card's own folder, `/framework/ai/<card>/`, instead of the nearest folder to `path` —
	 * so its file sits beside the card's `page.jsonl` and its folder-index lines land there too.
	 * `path` is still kept as where the owner actually stood (unchanged: it is `asked` below). */
	create({ path: at, card, host = null, fresh = false } = {}){
		const asked = page_path(at);
		if (!asked) throw Object.assign(new Error(`"${at}" is not a page path`), { status: 400 });
		let home = this.nearest(asked);
		if (card != null && card !== ""){
			home = this.card_home(card);
			if (!home) throw Object.assign(new Error(`"${card}" is not a known card (no public/framework/ai/${card}/page.jsonl)`), { status: 400 });
		}
		const project = this.project_of(host);
		/* Resume is per card when a card was given (same one-hour rule as a page): `recent()` on
		 * the card's own home only ever finds sessions of that card, since every one of them was
		 * homed there too. */
		const [last] = this.recent({ page: home, project, limit: 1 });
		/* `fresh: true` (voice-fixes review item 1, the "New session" button): always start over,
		 * even when a session on this page spoke within `resume_ms`. */
		if (!fresh && last && Date.now() - Date.parse(last.last_at) < this.resume_ms) return this.resume({ session: last.session });
		let id;
		do id = "v-" + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 5); while (this.map[id]);
		const file = `${home}ai/${id}.jsonl`;
		/* No agents yet: the first say spawns them (wake). */
		const s = { id, home, file, at: now_ms(), project, host, path: asked, visited: [], fast: null, smart: null,
			backing: { fast: null, smart: null }, ...(card ? { card } : {}) };
		this.map[id] = s;
		this.write(s, { session: { id, home, at: s.at, project, host, ...(card ? { card } : {}), fast: null, smart: null, backing: s.backing } });
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

	/* Sessions started on, or passing through, `page` (its nearest folder), newest first,
	 * from one PROJECT only (the phone and the PC share one; two sites never mix). The ids
	 * come from that folder's `ai/log.jsonl`, plus, as a fallback, every session whose
	 * `home` or `visited` in sessions.json names the folder. */
	recent({ page = "/", project, host = null, limit = 10 } = {}){
		const at = this.nearest(page_path(page) ?? "/");
		project ??= this.project_of(host);
		const ids = this.ids_in(at);
		for (const s of Object.values(this.map)) if (this.folders(s).includes(at)) ids.add(s.id);
		return [...ids].map(id => this.map[id]).filter(Boolean)
			.filter(s => this.project(s) === project)
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
		const at = now_ms(), changed = title !== s.title;
		Object.assign(s, { title, summary });
		fs.mkdirSync(path.dirname(this.summary_file(s)), { recursive: true });
		fs.writeFileSync(this.summary_file(s), JSON.stringify({ id: s.id, home: s.home, title, summary, at, visited: s.visited ?? [] }, null, 2));
		if (changed) this.presence(s, s.home, "started");
		this.save();
		return { ok: true, session: s.id, title, summary, at };
	}

	/* A line from the smart assistant. `re` alone: a reply to that owner line. `re` +
	 * `level`: a REFINED version of it, drawn under the raw words. */
	line({ session, text, re, level } = {}){
		const s = this.get(session);
		if (!String(text ?? "").trim()) throw Object.assign(new Error("text is required"), { status: 400 });
		if (level != null && !LEVELS.includes(level)) throw Object.assign(new Error(`level must be one of ${LEVELS.join(", ")}`), { status: 400 });
		/* Never guessed (review item 12): a refinement attached to the wrong owner line is worse than none. */
		if (level != null && !re) throw Object.assign(new Error("a refined line needs `re`, the `at` of the owner line it refines"), { status: 400 });
		const line = { at: now_ms(), session: s.id, path: s.path, from: { kind: "assistant", id: "smart", agent: s.smart }, via: "text", text,
			...(re ? { re } : {}), ...(level ? { level } : {}) };
		this.write(s, { chat: line });
		return { ok: true, at: line.at };
	}

	/* `floor` and `cues` (ext/Chat/doc/floor.md) are optional and stored on the owner's line;
	 * a say with no floor counts as "done", as before the floor existed. */
	say({ session, path: at, text, via = "text", floor, cues } = {}){
		const s = this.get(session);
		if (!String(text ?? "").trim()) throw Object.assign(new Error("text is required"), { status: 400 });
		if (floor != null && !FLOORS.includes(floor)) throw Object.assign(new Error(`floor is ${FLOORS.join(" or ")}`), { status: 400 });
		const site = page_path(at) ?? s.path;
		if (site !== s.path) this.nav({ session, from: s.path, to: site });
		const line = { at: now_ms(), session, path: site, from: { kind: "owner" }, via, text,
			...(floor ? { floor } : {}), ...(cues && typeof cues === "object" ? { cues } : {}) };
		this.write(s, { chat: line });
		this.set_floor(s, floor ?? "done");
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

	/* THE FLOOR (ext/Chat/doc/floor.md; the page assistant does the same in Assistant.heard()).
	 * While the latest floor is "speaking", the FAST reply is held in memory (`held`, the
	 * newest one only) and the smart quiet gap keeps restarting; "done" writes the held reply.
	 * Like Assistant's `floor_wait_ms`, 8 s of "speaking" with nothing new counts as "done",
	 * so a dropped mic never swallows a reply. */
	floor({ session, floor } = {}){
		const s = this.get(session);
		if (!FLOORS.includes(floor)) throw Object.assign(new Error(`floor is ${FLOORS.join(" or ")}`), { status: 400 });
		const released = this.set_floor(s, floor);
		return { ok: true, floor, released };
	}

	speaking(s){ return s.floor === "speaking"; }

	set_floor(s, floor){
		s.floor = floor;
		clearTimeout(this.floor_timers.get(s.id));
		if (floor !== "speaking") return this.release(s);
		const t = setTimeout(() => this.set_floor(s, "done"), this.floor_wait_ms);
		this.floor_timers.set(s.id, t);
		t.unref?.();
		return false;
	}

	release(s){
		const h = this.held.get(s.id);
		if (!h) return false;
		this.held.delete(s.id);
		this.write(s, { chat: { at: now_ms(), ...h } });
		return true;
	}

	/* The smart assistant hears a thought, not its fragments: lines gathered over a
	 * quiet gap (Layers.hear()'s pattern), with where the owner went since. The gap
	 * restarts while the owner still has the floor. */
	gather(s, line){
		const w = this.waiting.get(s.id) ?? { lines: [] };
		w.lines.push(line);
		clearTimeout(w.timer);
		const fire = () => {
			if (this.speaking(s)){ w.timer = setTimeout(fire, this.quiet_ms); return; }
			this.waiting.delete(s.id);
			const moves = (s.moves ?? []).splice(0);
			const nav = moves.length ? `(now on ${moves[moves.length - 1]})\n` : "";
			s.smart_re = w.lines[w.lines.length - 1].at;
			this.save();
			this.wake(s, "smart");
			this.send(s, "smart", nav + w.lines.map(l => `[on ${l.path} at ${l.at}] ${l.text}`).join("\n"));
		};
		w.timer = setTimeout(fire, this.quiet_ms);
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
			+ (!s.card ? "" : role === "fast" ? `\n\nThis session is about card ${s.card}.`
				: `\n\nThis session is about card ${s.card}. Its record is public${s.home}page.jsonl; read that file first for the card's history.`)
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
		let agent;
		try { agent = this.spawn(s, role, can ? { resume: old } : { context: old ? this.tail(s, 40) : "" }); }
		catch (e){ this.sleep(s, "failed revive"); throw e; }
		s[role] = agent.id;
		this.by_agent.set(agent.id, { id: s.id, role });
		(s.backing ??= {})[role] = agent.session_id ?? null;
		delete s.asleep_at;
		if (s.ended){ delete s.ended; this.presence(s, s.home, "started"); }
		this.write(s, { backing: { at: now_ms(), fast: s.backing.fast ?? null, smart: s.backing.smart ?? null, how: { [role]: how } } });
		return true;
	}

	/* Stop both agents of a session; their Claude sessions stay on disk for the next say. */
	sleep(s, why){
		for (const role of ["fast", "smart"]) if (this.awake(s, role)) try { this.servex.agents.stop(s[role]); } catch {}
		s.asleep_at = now_ms();
		s.asleep_why = why;
		/* `ended`, with the latest title, in EVERY folder the session reached, on every stop
		 * (idle, room(), a failed revive): no folder shows it untitled and running forever. */
		if (!s.ended){
			s.ended = true;
			s.title = this.summary_of(s).title ?? s.title ?? null;
			for (const site of this.folders(s)) if (this.is_dir(site)) this.presence(s, site, "ended");
		}
		this.save();
	}

	live_pairs(){ return Object.values(this.map).filter(x => this.awake(x, "fast") || this.awake(x, "smart")); }

	/* At most `max_pairs` live pairs machine-wide: stop the oldest IDLE one (neither agent
	 * mid-turn) until there is room. If every live pair is mid-turn, go over rather than cut one off. */
	room(s){
		for (;;){
			const live = this.live_pairs().filter(x => x !== s);
			if (live.length < this.max_pairs) return;
			const idle = live.filter(x => !this.busy(x))
				.sort((a, b) => Date.parse(a.last_at ?? a.at) - Date.parse(b.last_at ?? b.at));
			if (!idle.length) return console.error(`sessions: ${live.length} pairs live and all busy; ${s.id} goes over the cap`);
			this.sleep(idle[0], `room for ${s.id}`);
		}
	}

	busy(s){ return ["fast", "smart"].some(r => this.servex.agents.live.get(s[r])?.state === "working"); }

	/* A pair that heard nothing for `idle_ms` is stopped, unless one of its agents is
	 * mid-turn: a smart turn that reads, refines and spawns can outlast 5 minutes (review item 2). */
	sweep(){
		const t = Date.now();
		for (const s of this.live_pairs())
			if (t - Date.parse(s.last_at ?? s.at) >= this.idle_ms && !this.busy(s)) this.sleep(s, "idle");
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
		const chat = { session: s.id, path: s.path, from: { kind: "assistant", id: who.role, agent: agent.id }, via: "text", text, ...(re ? { re } : {}) };
		if (who.role === "fast" && this.speaking(s)) return void this.held.set(s.id, chat);   // the owner is still talking
		this.write(s, { chat: { at: now_ms(), ...chat } });
	}

	// ── routes ───────────────────────────────────────────────────────────────

	route(){
		const router = this.servex.dashboard?.router;
		if (!router) return;
		const cors = (req, res, next) => { res.set({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type" }); next(); };
		/* The browser's host: the dev server's proxy forwards it (x-forwarded-host); a page on
		 * localhost calls Servex directly, so there the body carries its own `location.host`. */
		const host_of = (req, b) => req.headers["x-forwarded-host"] ?? b.host ?? req.headers.host ?? null;
		for (const [verb, fn] of [["new", "create"], ["say", "say"], ["nav", "nav"], ["resume", "resume"], ["floor", "floor"]]){
			router.options(`/api/session/${verb}`, cors, (req, res) => res.status(204).end());
			router.post(`/api/session/${verb}`, cors, async (req, res) => {
				try { const b = await body(req); res.json(this[fn](verb === "new" ? { ...b, host: host_of(req, b) } : b)); }
				catch (e){ res.status(e.status ?? 500).json({ ok: false, error: String(e.message || e) }); }
			});
		}
		router.get("/api/sessions", cors, (req, res) => {
			try {
				let page = req.query.page ?? "/";
				if (req.query.card){
					page = this.card_home(req.query.card);
					if (!page) throw Object.assign(new Error(`"${req.query.card}" is not a known card`), { status: 400 });
				}
				res.json({ ok: true, sessions: this.recent({ page, limit: req.query.limit, project: this.project_of(host_of(req, { host: req.query.host })) }) });
			}
			catch (e){ res.status(e.status ?? 500).json({ ok: false, error: String(e.message || e) }); }
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
