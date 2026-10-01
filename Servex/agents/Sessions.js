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
/* A pause marker's `phase` (one-dictation, item 2): the mic going off ("start") or coming back
 * on ("end") — ext/Session/Session.js's `pause()`/`report_pause()`. */
export const PAUSE_PHASES = ["start", "end"];
/* What the chat is told about one picked element (ext/drawer/select.js's `item()`):
 * `{kind, label, text, selector}`. Used to prefix the words sent to the assistants
 * (`selected_prefix()` below) the same way Layers.js's `heard()` already does for a card chip. */
/* A selection is kept small: its text is trimmed so a big selected block does not land on every line. */
const trim_sel = sel => sel && typeof sel === "object"
	? { ...sel, ...(typeof sel.text === "string" && sel.text.length > 500 ? { text: sel.text.slice(0, 500) + "…" } : {}) } : null;
const selected_prefix = sel => sel && typeof sel === "object"
	? `[Selected: ${sel.label ?? sel.kind ?? "element"} (${sel.selector ?? "?"})] ` : "";

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

/* A REACTION (ai/2026-09-30/chat-reactions): an SMS tap-back on one line of the
 * session, its own line in the file, never an edit of the line it marks:
 *   {"react": {at, session, re, emoji, from: {kind, id?}}}
 * `re` is the marked line's `at`; the newest reaction from a sender for a line wins,
 * and an empty `emoji` takes it off. An assistant reacts by making its WHOLE reply
 * one emoji (`LONE_EMOJI`): that reply becomes a reaction on the owner's line
 * instead of a bubble. */
export const LONE_EMOJI = /^\p{Extended_Pictographic}[\uFE0F\u{1F3FB}-\u{1F3FF}]*(\u200D\p{Extended_Pictographic}\uFE0F?)*$/u;

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
 *            {"react": {at, session, re, emoji, from}}   (a tap-back on line `re`; see LONE_EMOJI)
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
		/* fast_wait_ms: the fast assistant's reply waits this long after the owner spoke,
		 * so that, when the smart one answers (or reacts) first, only ONE acknowledgement
		 * goes out (the owner, 2026-09-30). `hold_fast()` below. */
		return { repo: REPO, file: process.env.SERVEX_SESSIONS_FILE || null, quiet_ms: env("SERVEX_SESSION_QUIET_MS", 1500),
			fast_wait_ms: env("SERVEX_SESSION_FAST_WAIT_MS", 8000),
			idle_ms: env("SERVEX_SESSION_IDLE_MS", 5 * 60000), resume_ms: env("SERVEX_SESSION_RESUME_MS", 60 * 60000),
			max_pairs: env("SERVEX_SESSION_MAX_PAIRS", 2), floor_wait_ms: env("SERVEX_SESSION_FLOOR_WAIT_MS", 8000),
			/* THE THOUGHT (dictation-stream, 2026-09-30): a spoken line is held from BOTH assistants until the
			 * owner has been quiet `answer_quiet_ms` (the browser's `quiet` event, ux/Dictate/floor.js's
			 * mark), or `hold_max_ms` passed with no such event (the browser engine has no level meter).
			 * `thoughts` holds those lines; `held` (below, the floor) holds a fast REPLY. */
			answer_quiet_ms: env("SERVEX_SESSION_ANSWER_QUIET_MS", 2500), hold_max_ms: env("SERVEX_SESSION_HOLD_MAX_MS", 8000),
			map: {}, by_agent: new Map(), waiting: new Map(), held: new Map(), floor_timers: new Map(),
			thoughts: new Map(), clients: new Map(), buffers: new Map() };
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
		this.push(s.id, { kind: "line", line });
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

	/* EVERY session of one PROJECT, any page or card it ever touched, newest first — item 4
	 * (one-dictation): the real project-wide list. `recent()` above only ever answers for ONE
	 * folder (walking that folder's own `ai/log.jsonl` plus every session whose home/visited
	 * names it); this instead just filters the WHOLE map by project, which is the only way to
	 * be sure an older session that happened to pass through neither this page nor the root
	 * still surfaces (`ext/drawer/tabs/sessions.js`'s own `project_recent()` used to fake this
	 * with a two-query merge, which could still miss one). */
	recent_project({ project, host = null, limit = 10 } = {}){
		project ??= this.project_of(host);
		return Object.values(this.map)
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
	 * `level`: a REFINED version of it, drawn under the raw words.
	 *
	 * ITEM 3 (one-dictation): "refinement goes to the card selected at the time" — the session
	 * is GLOBAL now, so by the time the smart assistant gets around to writing a refinement the
	 * owner may well have navigated to a different card already. `s.path` (the session's CURRENT
	 * location) would attribute the line to wherever the owner is NOW, not where they were when
	 * they said it — so this reads the ORIGINAL owner line back (`find_line`) and uses ITS own
	 * `path`, plus whichever card `card_at()` finds was selected at that same moment, instead. */
	line({ session, text, re, level } = {}){
		const s = this.get(session);
		if (!String(text ?? "").trim()) throw Object.assign(new Error("text is required"), { status: 400 });
		if (level != null && !LEVELS.includes(level)) throw Object.assign(new Error(`level must be one of ${LEVELS.join(", ")}`), { status: 400 });
		/* Never guessed (review item 12): a refinement attached to the wrong owner line is worse than none. */
		if (level != null && !re) throw Object.assign(new Error("a refined line needs `re`, the `at` of the owner line it refines"), { status: 400 });
		const original = re ? this.find_line(s, re) : null;
		const path = original?.path ?? s.path;
		const card = this.card_at(s, original?.at ?? now_ms());
		const line = { at: now_ms(), session: s.id, path, ...(card ? { card } : {}),
			from: { kind: "assistant", id: "smart", agent: s.smart }, via: "text", text,
			...(re ? { re } : {}), ...(level ? { level } : {}) };
		this.write(s, { chat: line });
		/* One content model (inbox-ext item 9): a refined line also goes into its card's page.jsonl,
		 * the very same object, so the card draws it in page mode. Cards.append never throws. */
		if (card && level) this.servex?.cards?.append?.(card, { chat: line });
		return { ok: true, at: line.at };
	}

	/* THE CARD SELECTED AT A GIVEN MOMENT (item 3, above). A CARD SESSION never wanders — its
	 * home is that one card for its whole life — so there is nothing to look up. A GLOBAL
	 * session's card changes only through a `nav` line's own `card` field (item 1): the latest
	 * one at or before `at` wins; none yet found means no card was selected then. */
	card_at(s, at){
		let found = s.card ?? null;   // the card it started on, until a nav line says otherwise
		try {
			for (const l of fs.readFileSync(this.disk(s.file), "utf8").split("\n")){
				if (!l.trim()) continue;
				let j; try { j = JSON.parse(l); } catch { continue; }
				if (!j.nav || j.nav.at > at) continue;
				found = j.nav.card ?? null;
			}
			return found;
		} catch { return found; }
	}

	/* `floor` and `cues` (ext/Chat/doc/floor.md) are optional and stored on the owner's line;
	 * a say with no floor counts as "done", as before the floor existed. `raw` is what Whisper
	 * heard when the clean-up changed it; `quiet_ms` is how long the owner had been quiet.
	 * `selection` (item 6) is the element the reader had picked, `{kind, label, text, selector}`
	 * or omitted — kept on the line AND prefixed onto what the assistants are sent, below. */
	/* A THREADED reply (the owner pressed Reply on a bubble): `re` = that bubble's `at`,
	 * `thread: true`. It is kept on the owner's line, the assistants are told which line
	 * it answers, and their replies to it are threaded under the same bubble. */
	say({ session, path: at, text, via = "text", raw, floor, cues, quiet_ms, re, thread, selection } = {}){
		const s = this.get(session);
		if (!String(text ?? "").trim()) throw Object.assign(new Error("text is required"), { status: 400 });
		if (floor != null && !FLOORS.includes(floor)) throw Object.assign(new Error(`floor is ${FLOORS.join(" or ")}`), { status: 400 });
		const site = page_path(at) ?? s.path;
		if (site !== s.path) this.nav({ session, from: s.path, to: site });
		const line = { at: now_ms(), session, path: site, from: { kind: "owner" }, via, text,
			...(raw && String(raw).trim() && raw !== text ? { raw: String(raw) } : {}),
			...(floor ? { floor } : {}), ...(cues && typeof cues === "object" ? { cues } : {}),
			...(thread && re ? { re: String(re), thread: true } : {}),
			...(selection && typeof selection === "object" ? { selection: trim_sel(selection) } : {}) };
		this.write(s, { chat: line });
		if (line.thread){
			(s.threaded ??= []).push(line.at);
			if (s.threaded.length > 50) s.threaded.shift();
			const parent = this.find_line(s, line.re);
			const whose = !parent ? "an earlier line" : parent.from?.kind === "owner" ? "their own earlier line" : `the ${parent.from?.id ?? "assistant"} assistant's line`;
			const note = `(this is a reply to ${whose}${parent?.text ? ` "${String(parent.text).replace(/\s+/g, " ").slice(0, 120)}"` : ""})`;
			for (const role of ["fast", "smart"]) ((s.notes ??= {})[role] ??= []).push(note);
		}
		this.set_floor(s, floor ?? "done");
		this.wake(s, "fast");
		/* The smart one spawns on the NEXT tick, so the fast one's process starts first and alone. */
		setImmediate(() => { try { this.wake(s, "smart"); } catch (e){ console.error(`sessions: ${e.message}`); } });
		if (via === "voice" && floor){
			/* A spoken line from a page that reports the floor: held until the owner is quiet. */
			this.hold_thought(s, line);
			const q = quiet_ms == null ? null : Number(quiet_ms);
			if (floor !== "speaking" && (q == null || q >= this.answer_quiet_ms)) this.release_thought(s, q == null ? "the mic is off" : `quiet for ${(q / 1000).toFixed(1)} s`);
		} else if (this.thoughts.get(s.id)?.lines.length){
			/* Typed while spoken words are still held: they all go together, in order (review note 4). */
			this.hold_thought(s, line);
			this.release_thought(s, "then typed this");
		} else {
			s.fast_re = line.at;
			this.send(s, "fast", `${selected_prefix(selection)}[on ${site}] ${text}`);
			this.gather(s, line);
		}
		return { ok: true, at: line.at, answered_by: [
			{ kind: "assistant", id: "fast", agent: s.fast }, { kind: "assistant", id: "smart", agent: s.smart }] };
	}

	/* `card` (item 1, one-dictation): the card selected at this exact moment, or omitted for
	 * none. Written onto the `nav` line itself (so `card_at()`, above, can look it back up for a
	 * late-arriving refinement) AND pushed as an invisible note for the FAST assistant — before
	 * this, only the smart assistant's own `moves` batching (`gather`/`release_thought`, below)
	 * ever mentioned a move at all, so the fast one never learned of a navigation that came with
	 * no new words. */
	nav({ session, from, to, card } = {}){
		const s = this.get(session);
		const dest = page_path(to);
		if (!dest) throw Object.assign(new Error(`"${to}" is not a page path`), { status: 400 });
		const line = { at: now_ms(), from: page_path(from) ?? s.path, to: dest, ...(card ? { card } : {}) };
		this.write(s, { nav: line });
		(s.moves ??= []).push(dest);
		((s.notes ??= {}).fast ??= []).push(`(the owner moved to ${dest}${card ? `, card ${card}` : ""})`);
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
		this.hold_fast(s, h.re, h.line);   // still gives way to a smart answer, if one came
		return true;
	}

	/* A reaction on one line of the session. From the owner (the browser's default):
	 * both assistants are told in their next prompt (`notes`), and a ❓ on an
	 * assistant's line asks the smart one to explain, at once. */
	react({ session, re, emoji = "", at, from = { kind: "owner" } } = {}){
		const s = this.get(session);
		if (!re) throw Object.assign(new Error("re is required: the `at` of the line being reacted to"), { status: 400 });
		emoji = String(emoji ?? "").trim();
		if (emoji && !LONE_EMOJI.test(emoji)) throw Object.assign(new Error("emoji must be one emoji, or empty to take a reaction off"), { status: 400 });
		const when = at && !Number.isNaN(Date.parse(at)) ? at : now_ms();
		this.write(s, { react: { at: when, session: s.id, re, emoji, from } });
		if (from?.kind === "owner" && emoji) this.owner_reacted(s, re, emoji);
		return { ok: true, at: when };
	}

	/* What the owner's reaction means, told to the assistants in plain words. */
	owner_reacted(s, re, emoji){
		const line = this.find_line(s, re);
		const whose = !line ? "a line" : line.from?.kind === "owner" ? "their own line" : `the ${line.from?.id ?? "assistant"} assistant's line`;
		const quote = line?.text ? ` "${String(line.text).replace(/\s+/g, " ").slice(0, 120)}"` : "";
		const note = `(the owner reacted ${emoji} to ${whose}${quote})`;
		for (const role of ["fast", "smart"]) ((s.notes ??= {})[role] ??= []).push(note);
		this.save();
		if (emoji === "❓" && line && line.from?.kind !== "owner"){
			this.wake(s, "smart");
			this.send(s, "smart", "The owner wants more on that line: explain it in two or three plain sentences.");
		}
	}

	/* The chat line whose `at` is `re`, read back from the session file. */
	find_line(s, re){
		try {
			const lines = fs.readFileSync(this.disk(s.file), "utf8").split("\n");
			for (let i = lines.length - 1; i >= 0; i--){
				if (!lines[i].includes(re)) continue;
				try { const c = JSON.parse(lines[i]).chat; if (c?.at === re) return c; } catch {}
			}
		} catch {}
		return null;
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
			this.send(s, "smart", nav + w.lines.map(l => `${selected_prefix(l.selection)}[on ${l.path} at ${l.at}] ${l.text}`).join("\n"));
		};
		w.timer = setTimeout(fire, this.quiet_ms);
		this.waiting.set(s.id, w);
	}

	/* HELD until the owner stops (the floor): every spoken line waits here; both assistants hear
	 * the whole thought at once on release, with how it ended as the last line. */
	hold_thought(s, line){
		const h = this.thoughts.get(s.id) ?? { lines: [] };
		h.lines.push(line);
		clearTimeout(h.timer);
		h.timer = setTimeout(() => { try { this.release_thought(s, `no quiet event for ${Math.round(this.hold_max_ms / 1000)} s`); } catch (e){ console.error(`sessions: ${e.message}`); } }, this.hold_max_ms);
		h.timer.unref?.();
		this.thoughts.set(s.id, h);
	}

	release_thought(s, why){
		const h = this.thoughts.get(s.id);
		if (!h?.lines.length) return false;
		clearTimeout(h.timer);
		this.thoughts.delete(s.id);
		const moves = (s.moves ?? []).splice(0);
		const nav = moves.length ? `(now on ${moves[moves.length - 1]})\n` : "";
		const said = h.lines.map(l => `${selected_prefix(l.selection)}[on ${l.path}] ${l.text}`).join("\n");
		const tail = `\n(the owner has stopped: ${why})`;
		s.fast_re = s.smart_re = h.lines[h.lines.length - 1].at;
		this.save();
		this.wake(s, "fast");
		this.send(s, "fast", said + tail);
		this.wake(s, "smart");
		this.send(s, "smart", nav + said + tail);
		return true;
	}

	/* THE SILENCE EVENT (the owner, 2026-09-30: "an invisible message that my UI sends into the chat,
	 * but to the LLM"): written as a `{quiet}` line nobody draws, and it releases what was held. */
	quiet({ session, ms, mic_off = false, path: at } = {}){
		const s = this.get(session);
		const n = Math.max(0, Math.round(Number(ms) || 0));
		this.write(s, { quiet: { at: now_ms(), ms: n, ...(mic_off ? { mic_off: true } : {}), path: page_path(at) ?? s.path } });
		const released = (mic_off || n >= this.answer_quiet_ms)
			&& this.release_thought(s, mic_off ? "the mic went off" : `quiet for ${(n / 1000).toFixed(1)} s`);
		return { ok: true, released };
	}

	/* A PAUSE (item 2, one-dictation): the mic stopping altogether ("start") or picking back up
	 * ("end"), maybe minutes later — different from the ordinary mid-sentence quiet `quiet()`
	 * already reports. An invisible line, same category as `quiet`/`skip`: real context, never a
	 * bubble. `ext/Session/Session.js`'s `report_pause()` is what actually calls this. */
	pause({ session, phase } = {}){
		const s = this.get(session);
		if (!PAUSE_PHASES.includes(phase)) throw Object.assign(new Error(`phase is ${PAUSE_PHASES.join(" or ")}`), { status: 400 });
		this.write(s, { pause: { at: now_ms(), phase } });
		return { ok: true };
	}

	/* A SELECTION CHANGE (item 6, one-dictation): the element the reader picked on the page
	 * changed, or was cleared (`selection: null`) — written the moment it happens, not only at
	 * the next sentence, so a later reader can tell what was on screen at any past moment.
	 * Invisible, same as `nav`/`pause`/`quiet`. */
	select({ session, selection } = {}){
		const s = this.get(session);
		this.write(s, { select: { at: now_ms(), selection: trim_sel(selection) } });
		return { ok: true };
	}

	send(s, role, text){
		const notes = s.notes?.[role]?.splice(0) ?? [];
		if (notes.length){ text = notes.join("\n") + "\n" + text; this.save(); }
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
		const who = this.by_agent.get(agent.id), s = who && this.map[who.id];
		if (!s) return;
		if (event.type === "delta" && !event.nested) return this.streaming(s, who.role, agent.id, event.text);
		if (event.type === "tool" && !event.nested) return this.streaming(s, who.role, agent.id, null);   // text before a tool call was thinking aloud
		if (event.type !== "result") return;
		this.streaming(s, who.role, agent.id, null);
		if (event.stopped) return;
		const text = String(event.text ?? agent.last_text ?? "").trim();
		if (!text) return;
		const re = s[`${who.role}_re`];
		/* NO FILLER (the owner, 2026-09-30: "you don't need to say, keep going, I'm listening, noted...
		 * most of the time just listening"): the fast one's `(listening)`, or a filler line, is kept
		 * as an invisible `{skip}` line and never drawn. */
		if (who.role === "fast" && is_filler(text)) return this.write(s, { skip: { at: now_ms(), role: who.role, text, ...(re ? { re } : {}) } });
		const from = { kind: "assistant", id: who.role, agent: agent.id };
		// An answer to a threaded owner line goes into the same thread.
		const threaded = re && s.threaded?.includes(re) ? { thread: true } : {};
		const line = () => LONE_EMOJI.test(text) && re
			? { react: { at: now_ms(), session: s.id, re, emoji: text, from } }
			: { chat: { at: now_ms(), session: s.id, path: s.path, from, via: "text", text, ...(re ? { re } : {}), ...threaded } };
		if (who.role === "smart"){
			s.smart_said_re = re ?? now_ms();
			return this.write(s, line());
		}
		// The owner is still talking: hold the newest fast reply until the floor is "done" (release()).
		if (this.speaking(s)) return void this.held.set(s.id, { re, line });
		this.hold_fast(s, re, line);
	}

	/* ONE ACKNOWLEDGEMENT, NOT TWO (the owner, 2026-09-30: "the fast assistant could
	 * wait for the smart assistant"). The fast reply waits until `fast_wait_ms` after
	 * the owner spoke. If by then the smart one has answered or reacted to that line
	 * (or a later one), the fast reply is dropped; if not, it goes out as usual.
	 * A reply held by the floor (above) comes here when the floor is released. */
	hold_fast(s, re, line){
		const said = Date.parse(re ?? 0) || Date.now();
		const release = () => {
			if (s.smart_said_re && Date.parse(s.smart_said_re) >= said) return;   // the smart one already answered
			try { this.write(s, line()); } catch (e){ console.error(`sessions: ${e.message}`); }
		};
		const wait = said + this.fast_wait_ms - Date.now();
		if (wait <= 0) return release();
		setTimeout(release, wait).unref?.();
	}

	/* TOKEN BY TOKEN (the owner, 2026-09-30): a reply's text so far, per agent, pushed WHOLE to the
	 * session's live wire at most every 80 ms. `piece === null` ends it (a tool call, or the turn's end). */
	streaming(s, role, agent_id, piece){
		const b = this.buffers.get(agent_id) ?? { text: "", timer: null, session: s.id, role, shown: false };
		if (piece === null){
			clearTimeout(b.timer);
			this.buffers.delete(agent_id);
			if (b.shown) this.push(s.id, { kind: "stream", role, text: "" });
			return;
		}
		b.text += piece;
		this.buffers.set(agent_id, b);
		if (b.timer) return;
		b.timer = setTimeout(() => {
			b.timer = null;
			if (this.buffers.get(agent_id) !== b) return;
			// The fast reply is never streamed: it waits for the smart one and may be dropped
			// (hold_fast). A lone emoji is not streamed either: it becomes a reaction, not a bubble.
			if (role === "fast" || LONE_EMOJI.test(b.text.trim())) return;
			b.shown = true;
			this.push(s.id, { kind: "stream", role, text: b.text });
		}, 80);
	}

	/* THE LIVE WIRE per session (server-sent events): every line written, and every reply so far.
	 * A client that (re)connects is sent the replies in flight at once, so a reconnect loses nothing
	 * (the dev server's /servex proxy cuts a stream at 30 s; EventSource reconnects by itself). */
	push(id, msg){
		const set = this.clients.get(id);
		if (!set?.size) return;
		const data = `data: ${JSON.stringify(msg)}\n\n`;
		for (const res of set) try { res.write(data); } catch { set.delete(res); }
	}

	open_stream(req, res){
		const id = req.params.id;
		res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive",
			"X-Accel-Buffering": "no", "Access-Control-Allow-Origin": "*" });
		res.write("retry: 1000\n\n");
		const set = this.clients.get(id) ?? new Set();
		set.add(res);
		this.clients.set(id, set);
		for (const b of this.buffers.values()) if (b.session === id && b.shown) res.write(`data: ${JSON.stringify({ kind: "stream", role: b.role, text: b.text })}\n\n`);
		req.on("close", () => { set.delete(res); if (!set.size) this.clients.delete(id); });
	}

	// ── routes ───────────────────────────────────────────────────────────────

	route(){
		const router = this.servex.dashboard?.router;
		if (!router) return;
		const cors = (req, res, next) => { res.set({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type" }); next(); };
		/* The browser's host: the dev server's proxy forwards it (x-forwarded-host); a page on
		 * localhost calls Servex directly, so there the body carries its own `location.host`. */
		const host_of = (req, b) => req.headers["x-forwarded-host"] ?? b.host ?? req.headers.host ?? null;
		router.get("/api/session/:id/stream", (req, res) => this.open_stream(req, res));
		for (const [verb, fn] of [["new", "create"], ["say", "say"], ["nav", "nav"], ["resume", "resume"], ["floor", "floor"], ["quiet", "quiet"], ["react", "react"], ["pause", "pause"], ["select", "select"]]){
			router.options(`/api/session/${verb}`, cors, (req, res) => res.status(204).end());
			router.post(`/api/session/${verb}`, cors, async (req, res) => {
				try { const b = await body(req); res.json(this[fn](verb === "new" ? { ...b, host: host_of(req, b) } : verb === "react" ? { ...b, from: { kind: "owner" } } : b)); }
				catch (e){ res.status(e.status ?? 500).json({ ok: false, error: String(e.message || e) }); }
			});
		}
		router.get("/api/sessions", cors, (req, res) => {
			try {
				const project = this.project_of(host_of(req, { host: req.query.host }));
				// `?project=1` (item 4): every session of this project, any page or card —
				// `ext/Session/Session.js`'s `recent_project()`. Checked before `?card=`/`?page=`,
				// since a project-wide list names neither.
				if (req.query.project) return res.json({ ok: true, sessions: this.recent_project({ project, limit: req.query.limit }) });
				let page = req.query.page ?? "/";
				if (req.query.card){
					page = this.card_home(req.query.card);
					if (!page) throw Object.assign(new Error(`"${req.query.card}" is not a known card`), { status: 400 });
				}
				res.json({ ok: true, sessions: this.recent({ page, limit: req.query.limit, project }) });
			}
			catch (e){ res.status(e.status ?? 500).json({ ok: false, error: String(e.message || e) }); }
		});
		router.get("/api/session/:id", cors, (req, res) => {
			const s = this.map[req.params.id];
			s ? res.json({ ok: true, ...s }) : res.status(404).json({ ok: false, error: "no such session" });
		});
	}
}

/* A fast reply that says nothing: its brief's `(listening)`, or a short filler line ("Go ahead, listening."). */
const FILLER = /^(?:keep going|go (?:on|ahead)|i'?m (?:here|listening)|still (?:here|listening|with you)|noted|got it|take your time|mm-?hm+|ok(?:ay)?|listening|sure)\b[\s,.!-]*(?:(?:i'?m |i am )?(?:still )?(?:listening|here|with you)[\s,.!-]*)?$/i;
export const is_filler = text => { const t = String(text ?? "").trim(); return !t || /^\(listening\)/i.test(t) || (t.length <= 40 && FILLER.test(t)); };

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
