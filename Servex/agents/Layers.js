import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { model } from "./tiers.js";
import { brief } from "./brief.js";
import { first_prompt } from "./readme-chain.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "../..");
/* SERVEX_LAYERS_FILE moves the state file: a private Servex (a proof, a test)
 * must never read or write the live one, which the live Servex rewrites. */
const STATE = process.env.SERVEX_LAYERS_FILE || path.join(process.env.LOCALAPPDATA || "", "lew42", "servex", "layers.json");
const env = (name, dflt) => { const n = Number(process.env[name]); return Number.isFinite(n) && process.env[name] !== "" && process.env[name] != null ? n : dflt; };
const MIN = 60 * 1000;

/* A card id is a path: `2026/09/24/fix-the-sidebar`, a sub-card deeper. The ROOT
 * card is the first four segments; anything shorter (a day's own page) has none. */
const root_of = id => { const parts = String(id ?? "").split("/"); return parts.length >= 4 ? parts.slice(0, 4).join("/") : null; };
const json = value => JSON.stringify(value);

/* A PAGE is a site path with a trailing slash: `/framework/ux/Dictate/`; `/` is
 * the root. Anything else (`..`, a backslash, no leading slash) is not a page. */
export const page_path = value => {
	let s = String(value ?? "").trim();
	try { s = decodeURIComponent(s.split(/[?#]/)[0]); } catch { return null; }
	if (!s.startsWith("/") || s.includes("\\") || s.includes("\0")) return null;
	s = s.replace(/\/+/g, "/");
	if (!s.endsWith("/")) s += "/";
	if (s.split("/").some(seg => seg === ".." || seg === ".")) return null;
	return s;
};
const is_page = key => String(key ?? "").startsWith("/");
/* Where cards live on the site: a card `2026/09/24/x` is the page `/framework/ai/2026/09/24/x/`. */
const CARDS_AT = "/framework/ai/";
const now_iso = () => {
	const d = new Date(), off = -d.getTimezoneOffset(), pad = n => String(Math.abs(n)).padStart(2, "0");
	return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off < 0 ? "-" : "+") + pad(Math.trunc(off / 60)) + ":" + pad(off % 60);
};

/* THE PAGE PAIRS — two agents on every page, and a card is a page (designs:
 * public/framework/ai/2026-09-24/assistant-layers/doc/design.md, then
 * public/framework/ai/2026-09-25/recursive-pairs/).
 *
 * A CONTEXT is a root card id (`2026/09/24/fix-the-sidebar`) or a page path
 * (`/framework/ux/Dictate/`); `/` is the root pair. Its ASSISTANT is fast and
 * small: it hears every owner prompt there and turns it into UI. Its MANAGER is
 * started by the assistant (`ask_manager`) the moment something needs doing.
 * Each context records its `parent`: the parent page's manager (a top-level
 * card's parent is `manager-root`).
 *
 * THE LIFECYCLE (the owner, 2026-09-28): an assistant is created on the first
 * prompt, never on page open; stopped after 5 idle minutes, and at most 4 run at
 * once (the least recently used is stopped first); on the next prompt it is
 * resumed when its context is under 30k tokens and it was used within the hour,
 * otherwise started fresh from the page's own log. A manager stops after 15
 * idle minutes. Past 40k (assistant) or 150k (manager) an agent is asked for one
 * checkpoint line and restarted fresh from it. Every number has an env override.
 *
 * Plain code, no Claude session of its own. Its only memory is one small file,
 * `layers.json`, which says which agent id and session id belong to which context.
 *
 * ⚠ Never `attach` these agents to their card: Cards forwards every new prompt
 * to attached agents, and `heard()` below already delivers it, so each prompt
 * would arrive twice. The context panel reads our state file instead. */
/* The spawn gate's stand-in for a held spawn: no id, `queued: true`, and its
 * state only through `card()`. Nothing else may be read off it. */
export const queued = agent => !!agent && (agent.queued === true || agent.card?.()?.state === "queued");

const ROLES = ["assistant", "manager"];
/* ONE ROOT ASSISTANT (recursive-pairs fix, 2026-09-29): the page `/` has no
 * `assistant-root` of its own. Its assistant IS Global.js's `master-assistant`,
 * on the architect tier; Global starts, stops and resumes it, never Layers. */
export const ROOT_ASSISTANT = "master-assistant";
/* The one assistant text every page's assistant reads (a card's included). */
export const ASSISTANT_TEXT = path.join(REPO, ".claude", "skills", "every-prompt", "page-assistant.md");

export default class Layers {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	defaults(){
		return { file: STATE, repo: REPO,
			idle_ms: env("SERVEX_ASSISTANT_IDLE_MS", env("SERVEX_CARD_IDLE_MS", 5 * MIN)),
			manager_idle_ms: env("SERVEX_MANAGER_IDLE_MS", 15 * MIN),
			max_assistants: env("SERVEX_MAX_ASSISTANTS", 4),
			resume_max_tokens: env("SERVEX_RESUME_MAX_TOKENS", 30000),
			resume_max_age_ms: env("SERVEX_RESUME_MAX_AGE_MS", 60 * MIN),
			fresh_at: { assistant: env("SERVEX_ASSISTANT_FRESH_AT", 40000), manager: env("SERVEX_MANAGER_FRESH_AT", 150000) },
			state: null, touched: new Map(), recycling: new Set(), checkpoint: new Map(), timer: null, pending: new Map() };
	}

	/* `features` says "this Servex has card agents": the card view shows its agent panel only then. */
	install(){
		this.load(); this.listen(); this.tools(); this.route(); this.watch();
		this.servex.agents.layers = this;   // policy.js reads a manager's recorded parent through this
		this.servex.on?.("admitted", (spec, agent) => this.admitted(spec, agent));
		this.wakes();
		this.servex.log?.append?.("features", { card_agents: 1, page_agents: 1 })?.catch?.(() => {});
		return this;
	}

	// ── state ────────────────────────────────────────────────────────────────

	load(){
		try { this.state = JSON.parse(fs.readFileSync(this.file, "utf8")); } catch { this.state = null; }
		this.state ??= {};
		this.state.cards ??= {};   // every context, cards and pages alike; the name is kept for the live file
		return this.state;
	}

	save(){
		fs.mkdirSync(path.dirname(this.file), { recursive: true });
		fs.writeFileSync(this.file, JSON.stringify(this.state, null, 2));
	}

	/* The context a card id, sub-card id or page path belongs to: a ROOT card id,
	 * or a page path. A card's own page (`/framework/ai/<card>/`) is that card. */
	context(target){
		const page = page_path(target);
		if (!page) return this.root(target);
		const card = this.card_of(page);
		return card ? root_of(card) : page;
	}

	/* `/framework/ai/2026/09/24/x/wider/` -> `2026/09/24/x/wider`, when that card exists. */
	card_of(page){
		if (!page?.startsWith(CARDS_AT)) return null;
		const id = page.slice(CARDS_AT.length).replace(/\/$/, "");
		const canonical = id && this.servex.cards.canonical(id);
		return canonical && root_of(canonical) ? canonical : null;
	}

	/* A target's site path: a page as it is, a card as `/framework/ai/<card>/`. */
	path_of(target){
		const page = page_path(target);
		if (page) return page;
		const card = this.servex.cards.canonical(target);
		return card ? `${CARDS_AT}${card}/` : null;
	}

	/* The ids' second half: a card's last segment, a page's last segment made
	 * lower-case and dashed, and `root` for `/`. */
	base_of(key){
		if (key === "/") return "root";
		if (!is_page(key)) return key.split("/").pop();
		return key.split("/").filter(Boolean).pop().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "page";
	}

	/* The parent page of a context: `/` for a card and for a top-level page. */
	parent_key(key){
		if (key === "/") return null;
		if (!is_page(key)) return "/";
		return key.replace(/[^/]+\/$/, "");
	}

	/* Ids are minted ONCE per context, from `base_of()`; a name already recorded
	 * for a different context takes `-2`, `-3`, and `root` belongs to `/` alone.
	 * The parent is recorded first, so the tree always exists up to `/`. A record
	 * written before pages existed gains its `parent` the first time it is read. */
	record(key){
		const cards = this.state.cards;
		if (cards[key]){
			if (cards[key].parent === undefined){ cards[key].parent = this.parent_id(key); this.save(); }
			/* A record written before the fix named the root's assistant `assistant-root`. */
			if (key === "/" && cards[key].assistant.id !== ROOT_ASSISTANT){ cards[key].assistant = { id: ROOT_ASSISTANT, session_id: null, cwd: this.repo }; this.save(); }
			return cards[key];
		}
		const parent = this.parent_id(key);
		const taken = new Set(Object.values(cards).flatMap(r => [r.assistant.id, r.manager.id]));
		const base = this.base_of(key);
		let n = 1, suffix = key !== "/" && base === "root" ? "-2" : "";
		if (suffix) n = 2;
		while (taken.has(`assistant-${base}${suffix}`) || taken.has(`manager-${base}${suffix}`)) suffix = `-${++n}`;
		cards[key] = {
			parent,
			assistant: { id: key === "/" ? ROOT_ASSISTANT : `assistant-${base}${suffix}`, session_id: null, cwd: this.repo },
			manager: { id: `manager-${base}${suffix}`, session_id: null, cwd: this.repo }
		};
		this.save();
		return cards[key];
	}

	parent_id(key){
		const up = this.parent_key(key);
		return up == null ? null : this.record(up).manager.id;
	}

	/* Which context and role an agent id belongs to — `{card, role, slot}` or null.
	 * `card` is the context key (a card id or a page path); the name is kept for callers. */
	owner(id){
		if (!id) return null;
		for (const [card, rec] of Object.entries(this.state.cards))
			for (const role of ROLES)
				if (rec[role].id === id) return { card, role, slot: rec[role] };
		return null;
	}

	/* Copy what a RUNNING agent knows into the file: its session id, its context
	 * size and when it was last used — what the resume-or-fresh rule reads after
	 * the process is gone. A stopped agent is never copied: a recycle has just
	 * forgotten its session on purpose. */
	sync(key){
		const rec = this.state.cards[key];
		if (!rec) return;
		let changed = false;
		for (const role of ROLES){
			const slot = rec[role], a = this.live(slot.id);
			if (!a) continue;
			if (a.session_id && a.session_id !== slot.session_id){ slot.session_id = a.session_id; changed = true; }
			if (a.context != null && a.context !== slot.context){ slot.context = a.context; changed = true; }
			const t = this.touched.get(slot.id);
			if (t && !(Date.parse(slot.used_at ?? "") >= t)){ slot.used_at = new Date(t).toISOString(); changed = true; }
		}
		if (changed) this.save();
	}

	root(id){ return root_of(this.servex.cards.canonical(id)); }

	live(id){ const a = this.servex.agents.live.get(id); return a && a.state !== "stopped" ? a : null; }

	touch(id){ this.touched.set(id, Date.now()); }

	where(key){ return key === "/" ? "the root page / (the whole repo)" : is_page(key) ? `page ${key}` : `card ${key}`; }
	reply_to(key, sub){ return is_page(key) ? `page ${key}` : `card ${sub ?? key}`; }

	// ── a page's own chat log ────────────────────────────────────────────────

	/* A plain page's chat: `public<page>ai/chat.jsonl`, the same lines as a card's
	 * page.jsonl (`{"prompt":…}` from the owner, `{"message":…}` from agents).
	 * Written only here: the page-ai route and `page_reply`. */
	chat_file(key){ return path.join(this.repo, "public", ...key.split("/").filter(Boolean), "ai", "chat.jsonl"); }

	page_exists(key){ try { return fs.statSync(path.join(this.repo, "public", ...key.split("/").filter(Boolean))).isDirectory(); } catch { return false; } }

	append_chat(key, line){
		const file = this.chat_file(key);
		fs.mkdirSync(path.dirname(file), { recursive: true });
		let lead = "";
		try { const size = fs.statSync(file).size; if (size){ const fd = fs.openSync(file, "r"), b = Buffer.alloc(1); fs.readSync(fd, b, 0, 1, size - 1); fs.closeSync(fd); if (b[0] !== 10) lead = "\n"; } } catch {}
		fs.appendFileSync(file, lead + JSON.stringify(line) + "\n");
		return { ok: true };
	}

	/* One line into a context's log: a card's page.jsonl, or a page's chat. */
	write(key, line, sub){
		if (is_page(key)) return this.append_chat(key, line);
		return this.servex.cards.append(this.servex.cards.canonical(sub ?? key) ?? key, line);
	}

	// ── hearing the owner ────────────────────────────────────────────────────

	/* Dictation arrives in fragments: one spoken thought can land as several
	 * prompt lines a second or two apart, and the assistant used to answer each
	 * one (2026-09-24, card layout-columns). So a context's prompts wait until the
	 * owner has been quiet for SERVEX_PROMPT_QUIET_MS (default 1.5 s), then go out
	 * joined as one. 0 sends each one at once, as before.
	 * ⚠ It was 4 s, and every reply started 4 s late (measured 2026-09-29, card
	 * new-card: prompt logged 00:00:59, the assistant heard it 00:01:03). Since
	 * 2026-09-25 the microphone itself joins a thought into one message before it
	 * sends (ext/Chat/Mic.js, `paragraph_pause_ms`), so this only has to catch the
	 * lines one send writes together — they land in the same second. */
	listen(){
		this.waiting = new Map();   // context → { prompt, texts, timer }
		this.servex.cards.on((id, line, info) => {
			if (!line?.prompt || !info?.fresh) return;
			/* One-dictation, 2026-09-30: only the OWNER'S OWN words move to the global
			 * session pair — an agent's or a manager's own prompt line (every other
			 * route into a card) still wakes assistant-<card> exactly as before. */
			if (line.prompt.by === "owner") return void this.card_prompt_session(id, line.prompt);
			const card = this.root(id);
			if (card) this.hear(card, line.prompt);
		});
	}

	/* THE OWNER'S WORDS ON A CARD (one-dictation, 2026-09-30): they used to wake
	 * assistant-<card>; now they feed the one global session, addressed at the
	 * card's AI 2 page (`/framework/ai2/<card id>/`, not the old `/framework/ai/`
	 * board page) so the pair knows which card the owner is talking about. */
	card_prompt_session(id, prompt){
		const path = `/framework/ai2/${id}/`;
		const said = this.selected_block(prompt.context) + String(prompt.text ?? prompt.raw ?? "").trim();
		const session = this.session_for({ path, card: id });
		this.servex.sessions.say({ session: session.session, path, text: said, via: "text" });
	}

	/* The card listener's own reach now: a non-owner prompt on a card (the owner's
	 * own goes to `card_prompt_session` above instead). `page_ai` used to come
	 * through here too, for a plain page; it now feeds the session pair directly. */
	hear(key, prompt){
		const quiet = env("SERVEX_PROMPT_QUIET_MS", 1500);
		if (!(quiet > 0)) return void this.heard(key, prompt);
		this.waiting ??= new Map();
		const w = this.waiting.get(key) ?? { prompt, texts: [] };
		w.texts.push(prompt.text ?? prompt.raw ?? "");
		clearTimeout(w.timer);
		w.timer = setTimeout(() => {
			this.waiting.delete(key);
			this.heard(key, { ...w.prompt, text: w.texts.join(" "), raw: undefined });
		}, quiet);
		this.waiting.set(key, w);
	}

	/* THE DRAWER'S CHIP, IN WORDS — the elements picked on the page before this
	 * prompt was sent (ext/drawer/select.js's `item()`: `{kind, label, text,
	 * selector}`), as one short labelled block per element. Without this the
	 * assistant sees only the sentence and not what it was about — the chip
	 * showed on screen, but the words alone reached here (2026-09-29). */
	selected_block(context){
		if (!Array.isArray(context) || !context.length) return "";
		return context.map(c => `[Selected: ${c.label ?? c.kind ?? "element"} (${c.selector ?? "?"})]\n${String(c.text ?? "").trim()}`).join("\n\n") + "\n\n";
	}

	/* A fresh assistant already read the prompt in its first message, so only a
	 * live or resumed one is sent it. A prompt spoken on a sub-card says which. */
	heard(key, prompt){
		const slot = this.record(key).assistant;
		const was = this.live(slot.id);
		const held = this.pending.has(slot.id);
		const agent = this.assistant(key);
		if (!was && !held && (agent.layers_fresh || (queued(agent) && this.pending.get(slot.id)?.fresh))) return agent;
		const on = prompt.on && prompt.on !== key ? `(on ${prompt.on}) ` : "";
		const selected = this.selected_block(prompt.context);
		this.deliver(slot.id, selected + on + (prompt.text ?? prompt.raw ?? ""), { from: "owner", reply_to: this.reply_to(key) });
		this.touch(slot.id);
		return agent;
	}

	/* ONE GLOBAL SESSION PER PROJECT (one-dictation, 2026-09-30: "we're not doing
	 * per directory assistants anymore. We're doing global dictation assistance…
	 * but they're contextually aware"). Whichever session of this project spoke
	 * most recently — wherever on the site or whatever card it started on — is
	 * resumed, as long as that was within Sessions' own `resume_ms`; otherwise a
	 * fresh one is created here. This reads only Sessions' own public state
	 * (`map`, `project`, `project_of`, `resume_ms`) and its own verbs (`resume`,
	 * `create`) — Sessions.js itself is never touched, so this never conflicts
	 * with the other task's uncommitted edits to it. */
	session_for({ path, card, host } = {}){
		const sessions = this.servex.sessions;
		const project = sessions.project_of(host);
		const [newest] = Object.values(sessions.map)
			.filter(s => sessions.project(s) === project)
			.sort((a, b) => Date.parse(b.last_at ?? b.at) - Date.parse(a.last_at ?? a.at));
		if (newest && Date.now() - Date.parse(newest.last_at ?? newest.at) < sessions.resume_ms) return sessions.resume({ session: newest.id });
		return sessions.create({ path, card, host });
	}

	/* THE DRAWER'S SEND (interface: ai/2026-09-25/recursive-pairs/interface.md;
	 * one-dictation, 2026-09-30: this used to write into the page's own chat and
	 * wake that page's own assistant — the per-directory assistant the owner
	 * asked to retire. It now feeds the one global session/project pair instead,
	 * the same `ext/Session` pair the ✦ sheet and the drawer's AI tab already
	 * use, so the drawer can watch the exact same file the ✦ sheet watches.
	 * Spawns nothing here: `session_for` resumes or creates the session, and
	 * `Sessions.say` spawns the fast/smart pair only on its own lifecycle rules. */
	page_ai({ page, text, context } = {}){
		const p = page_path(page);
		if (!p) return { ok: false, status: 400, error: `"${page}" is not a page path (a site path with a trailing slash; / is the root)` };
		if (!String(text ?? "").trim()) return { ok: false, status: 400, error: "text is required" };
		if (!this.page_exists(p)) return { ok: false, status: 404, error: `no page at ${p} (public${p} is not a directory)` };
		const said = this.selected_block(context) + String(text).trim();
		const session = this.session_for({ path: p });
		this.servex.sessions.say({ session: session.session, path: p, text: said, via: "text" });
		return { ok: true, page: p, session: session.session, file: session.file };
	}

	// ── the two agents ───────────────────────────────────────────────────────

	/* An assistant runs LEAN: no settings files (so no CLAUDE.md, memory, skills,
	 * hooks or user MCP servers in its context) and only the built-in tools a
	 * quick edit needs; its brief is its system prompt. The root's assistant is
	 * not spawned from here: it is Global's master-assistant, on the architect
	 * tier (the owner: "the root assistant runs on Opus"). */
	spec(key, role){
		const rec = this.record(key);
		if (role === "assistant"){
			/* Every tool schema rides in every request; a fresh assistant's whole context is
			 * mostly these (measured: Bash alone is about 5k tokens). Bash stays because a
			 * quick edit must commit, smoke-test and merge in its worktree; Grep and Glob go
			 * (Bash has rg). SERVEX_ASSISTANT_BASH=0 drops it too: no quick edits, ~5k fewer. */
			const bash = process.env.SERVEX_ASSISTANT_BASH !== "0";
			const builtin = ["Read", "Edit", "Write", ...(bash ? ["Bash"] : [])];
			const card_only = is_page(key) && key !== "/" ? [] : ["card_reply", "card_set", "add_item", "amend_bubble"];
			/* append_log: page-assistant.md's "a card the owner asked for opens on their screen" line. */
			const servex = [...card_only, "page_reply", "create_card", "ask_manager", "send_to_agent", "card_summary",
				"list_claims", "append_log", ...(bash ? ["take_worktree", "return_worktree"] : [])].map(t => `mcp__servex__${t}`);
			/* Every other Servex tool is DENIED, which takes it out of the tool list the
			 * model is sent: about 70 tool schemas it would carry in every request. */
			const deny = (this.servex.mcp?.tools ?? []).map(t => `mcp__servex__${t.name}`).filter(t => !servex.includes(t));
			return {
				role: "card-assistant", model: model("fast"), effort: "low", permission_mode: "bypassPermissions", urgent: true,
				system: this.system(),
				setting_sources: [],
				/* Measured 2026-09-28 (pairs/proof.txt): without these two a fresh assistant
				 * began at 60k tokens: the account's claude.ai connectors (Figma, Drive, Docs:
				 * about 40k) and the auto-memory file (about 4k) load even with no settings. */
				env: { ENABLE_CLAUDEAI_MCP_SERVERS: "false", CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" },
				sdk: { tools: builtin, ...(deny.length ? { disallowedTools: deny } : {}) },
				allowed_tools: [...builtin, ...servex]
			};
		}
		return { role: "card-manager", model: model("manager"), effort: "medium", permission_mode: "bypassPermissions", parent: rec.assistant.id };
	}

	/* A brief that throws must not stop the assistant starting; it starts without it. */
	system(){
		let screen = "";
		try { screen = brief(this.servex); } catch (e){ screen = `(the one-screen brief failed: ${e.message})`; }
		return fs.readFileSync(ASSISTANT_TEXT, "utf8") + "\n\n" + screen;
	}

	/* Who this agent is and how it answers, for a fresh start. A card assistant's
	 * brief already says it; a page's needs its tools named. */
	scope(key, role){
		const rec = this.record(key), slot = rec[role];
		const answer = is_page(key)
			? `Answer the owner with page_reply({page: "${key}", text}); it lands in ${path.relative(this.repo, this.chat_file(key)).replace(/\\/g, "/")}, the chat the owner reads. The page's files are under public${key}.`
			: `Answer the owner with card_reply({card: "${key}", text}).`;
		if (role === "assistant") return `You are ${slot.id}, the assistant of ${this.where(key)}. Your manager is ${rec.manager.id}: hand it work with ask_manager({card: "${key}", text}). ${answer}`;
		return `You are ${slot.id}, the manager of ${this.where(key)}.${rec.parent ? ` Your parent is ${rec.parent}: tell it, with send_to_agent, what crosses your page.` : ""} ${answer}`;
	}

	/* How far a slot may be from its last use and still be RESUMED (the owner,
	 * 2026-09-28): an assistant under 30k tokens and used within the hour; a
	 * manager under its 150k fresh line. Returns why it must start fresh, or null. */
	stale(role, slot, now = Date.now()){
		const tokens = slot.context ?? 0;
		if (role === "manager") return tokens >= this.fresh_at.manager ? `its context is ${tokens} tokens, at or over ${this.fresh_at.manager}` : null;
		if (tokens >= this.resume_max_tokens) return `its context is ${tokens} tokens, at or over ${this.resume_max_tokens}`;
		const used = Date.parse(slot.used_at ?? "");
		if (!(now - used < this.resume_max_age_ms)) return used ? `last used ${Math.round((now - used) / MIN)} minutes ago, over ${Math.round(this.resume_max_age_ms / MIN)}` : "no record of its last use";
		return null;
	}

	/* The live agent, else resume it under its kept id and cwd (held open, idle,
	 * no prompt) when `stale()` allows, else spawn it fresh with `prompt()` (by
	 * default `first()`: the context's log). A stopped corpse is cleared out of
	 * `live` first so the id is free to reuse. An assistant first makes room
	 * under the cap. */
	open(key, role, prompt){
		if (key === "/" && role === "assistant") return this.root_assistant();
		const slot = this.record(key)[role];
		const live = this.live(slot.id);
		if (live) return live;
		const waiting = this.pending.get(slot.id);
		if (waiting) return waiting.agent;   // already queued at the gate: never a second spawn
		this.servex.agents.live.delete(slot.id);
		if (slot.session_id && !this.session_exists(slot)) this.lost(key, slot);
		const why = slot.session_id && this.stale(role, slot);
		if (why) this.forget(key, slot, why);
		if (role === "assistant") this.make_room(slot.id);
		const how = slot.session_id ? { resume: slot.session_id } : { prompt: (prompt ?? (() => this.first(key, role)))() || this.first(key, role) };
		const spec = { ...this.spec(key, role), id: slot.id, cwd: slot.cwd, ...how };
		this.log_gate(slot.id, "start", how.resume ? "resume" : why ? `fresh: ${why}` : "fresh");
		const agent = this.servex.agents.spawn(spec);
		if (queued(agent)){
			/* THE SPAWN GATE held it (Servex.admission()): the caller got a stand-in
			 * with no session and no `.send`. Remember it by its spec OBJECT — that
			 * same object comes back on `admitted` — and deliver later words then. */
			this.pending.set(slot.id, { spec: agent.spec ?? spec, agent, card: key, role, fresh: !how.resume, texts: [] });
			this.log_gate(slot.id, "queued", agent.card?.().reason);
			return agent;
		}
		agent.layers_fresh = !how.resume;   // it read the context's log in its first message: nothing more to send it
		this.touch(slot.id);
		this.sync(key);
		return agent;
	}

	/* The root's assistant is Global's `master-assistant`: Global starts it (fresh
	 * once a day, else resumed) and reaps it; Layers only hands it words. Without
	 * Global (a bare host), `agents.get` is the generic wake. */
	root_assistant(){
		const global = this.servex.global;
		const agent = global?.master ? global.master() : this.servex.agents.get?.(ROOT_ASSISTANT);
		if (!agent) throw new Error(`${ROOT_ASSISTANT} is not running and nothing here can start it`);
		this.touch(ROOT_ASSISTANT);
		return agent;
	}

	is_root_assistant(id){ return id === ROOT_ASSISTANT; }

	/* A fresh start's first message: the context's log, then who it is. */
	first(key, role){
		if (role === "manager") return this.manager_prompt(key);
		return this.where_you_are(key) + "\n\n" + this.transcript(key) + "\n\n" + this.scope(key, "assistant") + " A message follows.";
	}

	/* Too old or too full to resume: its session is forgotten, its id kept. */
	forget(key, slot, why){
		try { this.servex.log?.append?.("servex", { type: "layers", event: "fresh", card: key, id: slot.id, session_id: slot.session_id, reason: why })?.catch?.(() => {}); } catch {}
		slot.session_id = null;
		slot.context = null;
		this.save();
	}

	/* THE CAP: at most `max_assistants` assistants run at once. Before one more
	 * starts, the least recently used idle ones are stopped (session kept). One
	 * that is mid-turn is never stopped; if all are, the cap is exceeded and logged. */
	make_room(except){
		const running = Object.values(this.state.cards).filter(r => !this.is_root_assistant(r.assistant.id))
			.map(r => this.live(r.assistant.id)).filter(a => a && a.id !== except);
		const over = running.length - (this.max_assistants - 1);
		if (over <= 0) return;
		const idle = running.filter(a => a.state !== "working" && a.state !== "starting")
			.sort((a, b) => (this.touched.get(a.id) ?? 0) - (this.touched.get(b.id) ?? 0));
		for (const a of idle.slice(0, over)){ this.log_gate(a.id, "lru-stop", `the cap is ${this.max_assistants} live assistants`); this.stop(a.id); }
		if (idle.length < over) this.log_gate(except, "over-cap", `${running.length + 1} assistants live, cap ${this.max_assistants}: the rest are mid-turn`);
	}

	/* The gate started a spec we were holding: the real agent is here now, so the
	 * words that arrived while it waited go to it, oldest first. */
	admitted(spec, agent){
		for (const [id, p] of this.pending){
			if (p.spec !== spec) continue;
			this.pending.delete(id);
			agent.layers_fresh = p.fresh;
			this.log_gate(id, "started");
			for (const { text, note } of p.texts) this.servex.agents.send(id, text, note);
			this.touch(id);
			this.sync(p.card);
			return agent;
		}
		return null;
	}

	log_gate(id, event, reason = null){
		try { this.servex.log?.append?.("servex", { type: "layers", event, id, reason })?.catch?.(() => {}); } catch {}
	}

	/* `Agents.send` to a stopped pair agent goes through `wake`, which reopens it
	 * through the gated spawn. For our own ids it goes through `open()` instead:
	 * resumed or fresh by the same rule as a prompt, and a held one is spawned
	 * once and its messages wait for `admitted`. */
	wakes(){
		const agents = this.servex.agents, wake = agents.wake?.bind(agents);
		if (!wake) return;
		agents.wake = id => {
			const who = this.owner(id);
			if (!who || this.live(id) || this.is_root_assistant(id)) return wake(id);
			const agent = this.open(who.card, who.role);
			return queued(agent) ? this.door(id) : agent;
		};
	}

	/* A held agent's stand-in, with a `send()` that keeps the words for `admitted`. */
	door(id){
		const p = this.pending.get(id);
		const door = { id, queued: true, card: () => p.agent.card(), send: (text, note) => { p.texts.push({ text, note }); return door; } };
		return door;
	}

	/* Send now, or keep it for when the gate starts this agent. */
	deliver(id, text, note){
		const p = this.pending.get(id);
		if (p) return void p.texts.push({ text, note });
		this.servex.agents.send(id, text, note);
	}

	/* Where the Claude CLI keeps a session: <config>/projects/<cwd, every
	 * non-alphanumeric a dash>/<session id>.jsonl. A resume of a missing file
	 * dies on its first message and takes that message with it. */
	session_file(slot){
		const home = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
		return path.join(home, "projects", String(slot.cwd).replace(/[^a-zA-Z0-9]/g, "-"), slot.session_id + ".jsonl");
	}

	session_exists(slot){ try { return fs.existsSync(this.session_file(slot)); } catch { return true; } }

	/* The session is gone (deleted, or another machine's): say so in the log and
	 * start the same id fresh from the context's log, never throw. */
	lost(key, slot){
		const entry = { type: "layers", event: "session-missing", card: key, id: slot.id, session_id: slot.session_id,
			file: this.session_file(slot), text: `${slot.id}'s session ${slot.session_id} is gone; starting it fresh from the log` };
		try { this.servex.log?.append?.("servex", entry)?.catch?.(() => {}); } catch {}
		slot.session_id = null;
		this.save();
	}

	/* A fresh assistant gets the readme chain for its context's own dir (`dir_of`:
	 * a card's `public/framework/ai/<card>`, the sub-mastermind convention that a
	 * card's dir IS its task dir; a page's `public<page>`) ahead of the transcript,
	 * so it knows where it is before it reads a word the owner said. A resumed one
	 * already has it — `open()`'s `prompt()` closure only runs on the fresh path. */
	assistant(key){
		return this.open(key, "assistant", () => this.where_you_are(key) + "\n\n" + this.transcript(key) + "\n\n" + this.scope(key, "assistant")
			+ " The owner's newest words are the last prompt line. Answer them.");
	}

	/* The directory a context's files live in, repo-relative: a card's task dir, or a page's own dir. */
	dir_of(key){
		if (!is_page(key)) return `public/framework/ai/${key}`;
		return ("public" + key).replace(/\/$/, "");
	}

	/* The readme chain (readme-chain.js) for a context's dir — the top of a fresh agent's first message. */
	where_you_are(key){
		return first_prompt(this.dir_of(key));
	}

	/* The context's log, from its LAST `summary` line onward when there is one —
	 * that is what a compacted or recycled agent restarts from. */
	transcript(key){
		const lines = this.log_text(key).split("\n");
		const at = lines.findLastIndex(l => { try { return !!JSON.parse(l).summary; } catch { return false; } });
		return (at > 0 ? lines.slice(at) : lines).join("\n");
	}

	/* The context's log as text, read SYNCHRONOUSLY. ⚠ `Cards.transcript()` is async
	 * and `open()` is not, so calling it here handed a fresh agent "[object Promise]"
	 * instead of the log (found by the layers proof, 2026-09-24). A card host with
	 * no `file`/`parse` (the unit test's fake) still answers through `transcript`. */
	log_text(key){
		if (is_page(key)){
			let lines = [];
			try { lines = fs.readFileSync(this.chat_file(key), "utf8").split("\n").filter(l => l.trim()); } catch {}
			return `Page ${key} — its chat log, ${lines.length} lines, oldest first:\n` + lines.join("\n");
		}
		const cards = this.servex.cards, id = cards.canonical(key);
		if (!id || !cards.file || !cards.parse) return String(cards.transcript(key) ?? "");
		const lines = cards.parse(fs.readFileSync(cards.file(id), "utf8"));
		return `Card ${id} — its whole log, ${lines.length} lines, oldest first:\n` + lines.map(l => JSON.stringify(l)).join("\n");
	}

	/* A fresh manager's first message. Same readme-chain treatment as the
	 * assistant: only the FRESH prompt() closure (or `first()`) runs it. */
	manager_prompt(key, request = ""){
		const rec = this.record(key), slot = rec.manager;
		return this.where_you_are(key) + "\n\n"
			+ `Load the \`sub-mastermind\` skill. You are ${slot.id}, the manager of ${this.where(key)}.`
			+ " Your session is kept for this context's whole life: every later request here comes to you, so keep what you learn."
			+ " First call `claim_topic({thing, change, card})`: `thing` is what you will change, as a short noun anyone would use (the site header, policy.js, the AI 2 rail), never the change itself."
			+ " If it is refused, message mastermind-servex instead of starting."
			+ ` Start minions with spawn_agent({parent: "${slot.id}"}). ${this.scope(key, "manager")} Keep your own turns short.\n\n`
			+ this.transcript(key) + (request ? "\n\n" + request : "");
	}

	/* The door to a context's manager, for the assistant's tool and for code (the
	 * Dispatcher). The first ask spawns it with the log; every later ask is a
	 * message into the same, recycled session. */
	ask_manager({ card, text, from = "owner", task }){
		const key = this.context(card);
		if (!key) throw new Error(`"${card}" is neither a card (at least four segments) nor a page path`);
		const sub = is_page(key) ? key : this.servex.cards.canonical(this.card_of(page_path(card)) ?? card) ?? card;
		const slot = this.record(key).manager;
		const was = this.live(slot.id), held = this.pending.has(slot.id);
		const request = `Request from ${from} on ${sub}${task ? ` (task ${task})` : ""}: ${text}`;
		const agent = this.open(key, "manager", () => this.manager_prompt(key, request));
		const note = { from, reply_to: this.reply_to(key, sub) };
		if (queued(agent)){
			// a fresh spec already carries this request in its prompt; a resume, or a later ask, is kept for `admitted`
			if (held || !this.pending.get(slot.id)?.fresh) this.deliver(slot.id, request, note);
			this.touch(slot.id);
			return { ok: true, manager: slot.id, state: "queued", reason: agent.card?.().reason ?? null };
		}
		if (was || !agent.layers_fresh) this.servex.agents.send(slot.id, request, note);
		this.touch(slot.id);
		return { ok: true, manager: slot.id, state: agent.state };
	}

	// ── idle stop, recycle, checkpoint ───────────────────────────────────────

	/* One cheap timer. A working agent is active. A quiet one past its limit (an
	 * assistant 5 minutes, a manager 15: an idle session holds about 300 MB) is
	 * stopped, session id kept, except an assistant whose manager is working.
	 * One past its fresh line is asked for a checkpoint, then recycled once that
	 * turn ends; one that called `card_summary` is recycled once its turn ends. */
	watch(){
		this.timer = setInterval(() => this.sweep(), Math.max(250, Math.min(2000, this.idle_ms / 4)));
		this.timer.unref?.();
	}

	sweep(now = Date.now()){
		for (const [key, rec] of Object.entries(this.state.cards)){
			this.sync(key);
			for (const role of ROLES){
				if (this.is_root_assistant(rec[role].id)) continue;   // Global's to stop and resume
				const agent = this.live(rec[role].id);
				if (!agent) continue;
				if (agent.state === "working" || agent.state === "starting"){ this.touched.set(agent.id, now); continue; }
				if (this.recycling.has(agent.id)){ this.recycle(agent.id); continue; }
				if (this.checkpoint.has(agent.id)){
					if ((agent.turns ?? 0) > this.checkpoint.get(agent.id)) this.recycle(agent.id);
					continue;
				}
				if ((agent.context ?? 0) >= this.fresh_at[role]){ this.ask_checkpoint(agent, role); continue; }
				if (role === "assistant" && this.live(rec.manager.id)?.state === "working") continue;
				if (!this.touched.has(agent.id)) this.touched.set(agent.id, now);
				if (now - this.touched.get(agent.id) >= (role === "manager" ? this.manager_idle_ms : this.idle_ms)) this.stop(agent.id);
			}
		}
	}

	/* FRESH, NOT COMPACTED (the owner): one checkpoint line, then the same id
	 * restarts fresh from it on its next use. */
	ask_checkpoint(agent, role){
		this.checkpoint.set(agent.id, agent.turns ?? 0);
		this.log_gate(agent.id, "checkpoint", `context ${agent.context} tokens, fresh line ${this.fresh_at[role]}`);
		this.deliver(agent.id, `Checkpoint: your context is ${agent.context} tokens, past this role's ${this.fresh_at[role]}, so you will restart fresh.`
			+ " Call card_summary once, with one line holding what is not already in the log: decisions, open questions, and what you were in the middle of. Then stop.",
			{ from: "servex", priority: "next" });
	}

	stop(id){
		const who = this.owner(id);
		if (who) this.sync(who.card);
		try { this.servex.agents.stop(id); } catch {}
		return { ok: true };
	}

	/* Stop it and forget its session; its id is kept, and it restarts fresh. */
	recycle(id){
		const who = this.owner(id);
		if (!who) return { ok: false, error: `${id} is not a page or card agent` };
		if (this.is_root_assistant(id)) return { ok: false, error: `${id} is started and stopped by Global.js (fresh once a day), not recycled here` };
		this.recycling.delete(id);
		this.checkpoint.delete(id);
		try { if (this.live(id)) this.servex.agents.stop(id); } catch {}
		who.slot.session_id = null;
		who.slot.context = null;
		this.save();
		this.log_gate(id, "recycled");
		return { ok: true };
	}

	/* Our own compaction: the agent logs what matters as a `summary` line, and
	 * `card_summary` marks it for recycling. A stopped agent is resumed first. */
	compact(id){
		const who = this.owner(id);
		if (!who) return { ok: false, error: `${id} is not a page or card agent` };
		if (!this.live(id) && !who.slot.session_id) return { ok: true, note: "not running and no session: nothing to compact" };
		if (!this.live(id)) this.open(who.card, who.role, () => "");
		this.deliver(id, "Compact now: call card_summary with everything important about this card that is not already in its log:"
			+ " decisions, open questions, and what you were in the middle of. Then stop.", { from: "owner", priority: "next" });
		this.touch(id);
		return { ok: true };
	}

	// ── tools ────────────────────────────────────────────────────────────────

	/* `ctx.caller` is the calling agent's id, stamped by Servex (null from a tab,
	 * which is the owner and may act anywhere). A pair agent acts only inside its
	 * own context: its card and sub-cards, or its page and the pages under it;
	 * the root pair acts anywhere. Returns the target's context key. */
	allowed(caller, target){
		const key = this.context(target);
		if (!caller) return key;
		const who = this.owner(caller);
		if (!key || !who || !this.inside(target, who.card)) throw new Error(`${caller} may act only on its own card or page and what is under it, not "${target}"`);
		return key;
	}

	inside(target, key){
		if (key === "/") return true;
		const at = this.path_of(target);
		if (!at) return false;
		return at.startsWith(is_page(key) ? key : `${CARDS_AT}${key}/`);
	}

	tools(){
		const str = { type: "string" };
		const tool = (name, description, properties, required, handler) => this.servex.mcp.tool({ name, description,
			inputSchema: { type: "object", properties, required },
			handler: async (args = {}, ctx = {}) => { try { return json(await handler(args, ctx.caller ?? null)); } catch (e){ return json({ ok: false, error: String(e.message || e) }); } } });

		tool("card_set", "Change a card's type, title, status or tags. Only your own card or one of its sub-cards.",
			{ card: str, type: str, title: str, status: str, tags: { type: "array", items: str } }, ["card"],
			({ card, ...fields }, caller) => {
				this.allowed(caller, card);
				const id = this.servex.cards.canonical(card);
				for (const key of ["type", "title", "status", "tags"]) if (fields[key] !== undefined) this.servex.cards.append(id, { [key]: fields[key] });
				return { ok: true, card: id };
			});

		tool("add_item", "Add one line to the card's outline, or update it: `title` is a short plain name for one thing the owner asked (never a cut-off prompt), `id` a short slug (the same id again updates the line: set `done` true and `proof` to a link when it is delivered). `asked_at` defaults to now. Only your own card or one of its sub-cards.",
			{ card: str, id: str, title: str, asked_at: str, done: { type: "boolean" }, proof: str }, ["card", "id", "title"],
			({ card, id: item, title, asked_at, done, proof }, caller) => {
				this.allowed(caller, card);
				const id = this.servex.cards.canonical(card);
				this.servex.cards.append(id, { item: { id: item, title, asked_at: asked_at ?? new Date().toISOString(), done: !!done, ...(proof ? { proof } : {}) } });
				return { ok: true, card: id };
			});

		tool("amend_bubble", "Amend a chat bubble as a light, lossless cleanup of the owner's raw prompt pieces. `of` = the prompt ids the bubble is merged from; `sections` = one per core concept: `## Title` then a `- [ ] item` checklist (`- [x]` when done or decided), each with the `from` ids it came from; optional `text` = the whole markdown. Nothing is dropped; the raw prompts stay in the log. Only your own card or one of its sub-cards.",
			{ card: str, of: { type: "array", items: str }, text: str,
				sections: { type: "array", items: { type: "object", properties: { text: str, from: { type: "array", items: str } }, required: ["text"] } } }, ["card", "of", "sections"],
			({ card, of, sections, text }, caller) => {
				this.allowed(caller, card);
				const id = this.servex.cards.canonical(card);
				if (!Array.isArray(of) || !of.length) throw new Error("`of` must list at least one prompt id");
				if (!Array.isArray(sections) || !sections.length) throw new Error("`sections` must hold at least one section");
				const raw = new Map();
				for (const l of this.log_text(id).split("\n")) { try { const p = JSON.parse(l).prompt; if (p?.id) raw.set(p.id, String(p.raw ?? p.text ?? "")); } catch {} }
				for (const p of of) if (!raw.has(p)) throw new Error(`"${p}" is not a prompt id on card ${id}`);
				sections.forEach((s, i) => {
					const from = s.from ?? [], body = String(s.text ?? "").trim();
					for (const p of from) if (!of.includes(p)) throw new Error(`section ${i + 1}: "${p}" is in \`from\` but not in \`of\``);
					if (!from.length) {
						if (body.split(/\s+/).filter(Boolean).length >= 8) throw new Error(`section ${i + 1} cites no \`from\` pieces; only a short heading (under 8 words) may`);
						return;
					}
					const size = from.reduce((n, p) => n + raw.get(p).trim().length, 0);
					if (body.length < size * 0.6) throw new Error(`section ${i + 1} is shorter than 60% of its raw pieces (${body.length} of ${size} characters): nothing may be dropped`);
				});
				const curated = text ?? sections.map(s => s.text).join("\n\n");
				this.servex.cards.append(id, { type: "refined", of, sections, text: curated, by: caller ?? "owner", at: new Date().toISOString() });
				return { ok: true, card: id };
			});

		tool("ask_manager", "Hand work to this card's or page's manager. On a card, make a request, question or task sub-card first with create_card, holding the owner's own words, and pass its id as `card`; on a page, pass the page path. Pass the path to the card's directory so the manager can read the whole chat, raw words included; your summary may follow, never replace it.",
			{ card: str, text: str }, ["card", "text"],
			({ card, text }, caller) => { this.allowed(caller, card); return this.ask_manager({ card, text, from: caller ?? "owner" }); });

		tool("page_reply", "Say something into a page's chat: the AI tab of the drawer on that page. `page` is the site path with a trailing slash (`/` is the root), or a card id; on a card it lands in the card. Two or three plain sentences. Only your own page or a page under it.",
			{ page: str, text: str }, ["page", "text"],
			({ page, text }, caller) => {
				const key = this.allowed(caller, page);
				if (!key) throw new Error(`"${page}" is not a page path`);
				const line = { message: { by: caller ?? "owner", text, at: now_iso(), kind: "reply" } };
				this.write(key, line, is_page(key) ? null : this.card_of(page_path(page)));
				return { ok: true, page: key };
			});

		tool("card_summary", "Write everything important about this card or page that is not already in its log as one summary line. You are restarted from it once this turn ends.",
			{ text: str }, ["text"],
			({ text }, caller) => {
				const who = this.owner(caller);
				if (!who) throw new Error("card_summary is only for a card's or page's assistant or manager");
				this.write(who.card, { summary: { by: caller, text, ...(is_page(who.card) ? { at: now_iso() } : {}) } });
				this.recycling.add(caller);
				return { ok: true, card: who.card };
			});
	}

	// ── routes ───────────────────────────────────────────────────────────────

	route(){
		const router = this.servex.dashboard?.router;
		if (!router) return;
		const cors = (req, res, next) => {
			res.set({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type" });
			next();
		};
		router.get("/api/card-agents", cors, (req, res) => res.json(this.agents_of(req.query.card)));
		router.get("/api/page-agents", cors, (req, res) => res.json(this.agents_of(page_path(req.query.page) ?? req.query.page)));
		router.options("/api/page-ai", cors, (req, res) => res.status(204).end());
		router.post("/api/page-ai", cors, async (req, res) => {
			try {
				const out = this.page_ai(await body(req));
				const { status, ...rest } = out;
				res.status(out.ok ? 200 : status ?? 400).json(rest);
			} catch (e){ res.status(500).json({ ok: false, error: String(e.message || e) }); }
		});
		router.options("/api/agent/:id/:verb", cors, (req, res) => res.status(204).end());
		for (const verb of ["compact", "recycle"])
			router.post(`/api/agent/:id/${verb}`, cors, (req, res) => {
				try { const out = this[verb](req.params.id); res.status(out.ok ? 200 : 404).json(out); }
				catch (e){ res.status(500).json({ ok: false, error: String(e.message || e) }); }
			});
	}

	/* What each of a context's agents holds: tokens in context and the share of
	 * its window. A context nobody has spoken in has no pair yet: `[]`. */
	agents_of(target){
		const key = target && this.context(target);
		const rec = key && this.state.cards[key];
		if (!rec) return [];
		this.sync(key);
		return ROLES.map(role => {
			const slot = rec[role], a = this.live(slot.id) ?? this.servex.agents.live.get(slot.id);
			const model_id = a?.model ?? null, context = a?.state === "stopped" ? slot.context ?? a.context ?? null : a?.context ?? slot.context ?? null;
			const window = String(model_id).includes("[1m]") ? 1000000 : 200000;
			return { id: slot.id, role, state: a?.state ?? (slot.session_id ? "stopped" : "none"), model: model_id,
				session_id: slot.session_id, context, window, pct: context == null ? null : Math.round(100 * context / window) };
		});
	}
}

/* A JSON body: the one express already parsed, else read here (64 kB at most). */
function body(req){
	if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
	return new Promise((resolve, reject) => {
		let text = "";
		req.on("data", chunk => { text += chunk; if (text.length > 65536){ reject(new Error("body over 64 kB")); req.destroy(); } });
		req.on("end", () => { try { resolve(text ? JSON.parse(text) : {}); } catch (e){ reject(e); } });
		req.on("error", reject);
	});
}
