import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { place, HOME } from "../home.js";
import LogLine from "../../Server/LogLine.mjs";
import { slugify } from "../../Server/session-migrate.mjs";
import { model as tier_model } from "./tiers.js";
import Usage from "../Usage.js";
import { page_path } from "./Layers.js";
import Cards from "../cards/Cards.js";
import { session_facts } from "./Agents.js";
import { has_key, spend_guard } from "../ext/openrouter/provider.js";
import { clean } from "../../public/framework/ext/Refine/engine.js";
import { structure } from "../../public/framework/ext/Refine/structure.js";
import WakePolicy from "./WakePolicy.js";
import * as PromptLines from "./PromptLines.js";

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

/* A REACTION (ai/sessions/2026/09/30/chat-reactions): an SMS tap-back on one line of the
 * session, its own line in the file, never an edit of the line it marks:
 *   {"react": {at, session, re, emoji, from: {kind, id?}}}
 * `re` is the marked line's `at`; the newest reaction from a sender for a line wins,
 * and an empty `emoji` takes it off. An assistant reacts by making its WHOLE reply
 * one emoji (`LONE_EMOJI`): that reply becomes a reaction on the owner's line
 * instead of a bubble. */
export const FAST_NAMED = /(?:^|\n|\]\s)\W*fast\b|\bfast assistant\b(?![\x27\u2019]s)/i;   // addressed: a line that starts with "fast", or "fast assistant" not as a possessive
export const LONE_EMOJI = /^\p{Extended_Pictographic}[\uFE0F\u{1F3FB}-\u{1F3FF}]*(\u200D\p{Extended_Pictographic}\uFE0F?)*$/u;

const env = (name, dflt) => { const n = Number(process.env[name]); return process.env[name] != null && process.env[name] !== "" && Number.isFinite(n) ? n : dflt; };

/* WHO SITS IN THE FAST SEAT (voice-assistant-plan, 2026-10-17; ux/Dictate/doc/voice-assistant.md): `voice` = the
 * voice-assistant role, woken per sentence to write one {place} line (the default since 2026-10-17: the owner, "drop the
 * fast assistant for now"); `fast` = the old session-fast chatter, kept as the escape hatch. Read once at boot, first match wins:
 *   1. %LOCALAPPDATA%\lew42\servex\session-assistant.txt (HOME/session-assistant.txt): the word fast or voice. This is the
 *      switch that survives a restart, because sustain.mjs relaunches Servex through WMI and pins only SERVEX_HOME and
 *      SERVEX_API_PORT, so an env var never reaches the new process (same pattern as session-backend.txt below).
 *   2. the env var SERVEX_SESSION_ASSISTANT (a hand-started Servex or a private test one).
 *   3. `voice`.
 * To go back to fast: write `fast` into the file and restart Servex. */
export const ASSISTANTS = ["fast", "voice"];
const pick_assistant = v => { const w = String(v ?? "").trim().toLowerCase(); return ASSISTANTS.includes(w) ? w : null; };
export function session_assistant(home = HOME){
	let file = null;
	try { file = pick_assistant(fs.readFileSync(path.join(home, "session-assistant.txt"), "utf8")); } catch {}   // no file yet, or an unreadable one: fall through
	return file ?? pick_assistant(process.env.SERVEX_SESSION_ASSISTANT) ?? "voice";
}

/* IS A LINE WORTH A MODEL CALL? (review finding 5, 2026-10-03): a real voice session writes
 * one owner line per sentence or two, not per paragraph -- the owner's own evidence file had
 * 20 lines in 4 minutes, several of them just "Hello." or "Can you hear me?". Running `refine()`
 * (below) on every one of those would be a `clean()` + `structure()` pair -- two real model
 * calls -- for a fragment with nothing to structure. A line only earns a refine once it has at
 * least two sentences or 15 words; `floor: "speaking"` (the owner is still mid-thought,
 * `ext/Chat/doc/floor.md`) is skipped outright no matter its length, because a longer, finished
 * line for the same thought is coming once the owner actually stops. Exported, and kept a pure
 * function of the one line, so `refine.test.mjs` can check it directly -- no model, no session,
 * nothing else running. */
export function worth_refining(line){
	const text = String(line?.text ?? "").trim();
	if (!text || line?.floor === "speaking") return false;
	const words = text.split(/\s+/).filter(Boolean).length;
	const sentences_n = text.split(/(?<=[.!?])\s+/).filter(Boolean).length;
	return sentences_n >= 2 || words >= 15;
}

/* Local time with its offset AND milliseconds — `2026-09-29T19:30:12.345-05:00`.
 * The milliseconds matter: a reply's `re` names the owner line it answers by its
 * `at`, so two lines said in the same second must not share one. */
export const now_ms = () => {
	const d = new Date(), off = -d.getTimezoneOffset(), pad = n => String(Math.abs(n)).padStart(2, "0");
	return new Date(d.getTime() + off * 60000).toISOString().slice(0, 23) + (off < 0 ? "-" : "+") + pad(Math.trunc(off / 60)) + ":" + pad(off % 60);
};

/* VOICE SESSIONS (ai/sessions/2026/09/30/voice-sessions/voice-sessions/design.md).
 *
 * One ✦ press is one SESSION: it remembers the page it started on (its home),
 * follows the owner from page to page, and is answered by its own pair of
 * agents, a FAST one (one short line, within seconds) and a SMART one (the
 * thinking, the decisions, the masterminds). Everything is one file,
 * `public<home>ai/sessions/YYYY/MM/DD/<session>/session.jsonl` (older: flat `ai/<session>.jsonl`), that the browser polls:
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
 * title and summary themselves are `session.summary.json` beside the session file (older: `<home>ai/<session>.summary.json`).
 *
 * LIFE (memory first): /new and resume spawn NOTHING. The first say spawns the FAST
 * agent and sends it the line at once; the SMART one is spawned on the next tick and
 * loads its big context while the fast one answers. A pair that hears nothing for 30
 * minutes is stopped (`SERVEX_SESSION_IDLE_MS`; was 5, raised 2026-10-25 so the owner's mastermind seat stays up through a working session); the next say resumes it by its backing
 * session id. At most 2 pairs are live machine-wide (`SERVEX_SESSION_MAX_PAIRS`): a
 * third stops the oldest idle one first. A /new on a page whose session spoke in the
 * last hour returns THAT session (`SERVEX_SESSION_RESUME_MS`).
 *
 * REPLIES need no tool: each agent's final text for a turn is read off its event
 * stream (the host's `watch()` seam) and written here as its chat line, `re` = the
 * newest owner line it had been sent. Plain code; its only memory is
 * `sessions.json` in Servex's home, so a restart still finds a session's file. */
/* THE SESSION MODEL SWITCH (dictate-without-claude, 2026-10-04 — the owner: "we're facing a
 * Claude shutdown... I have to rely entirely on the website and whether the voice dictation
 * system works"). ONE setting decides what BOTH session agents spawn on:
 *   - "claude" (default, unchanged): fast on Sonnet, smart on tier voice_smart (Sonnet; tiers.js), Sonnet only while the week is over pace.
 *   - "openrouter": both on FALLBACK_MODEL. Picked from the new-brain eval
 *     (ai/sessions/2026/10/04/new-brain/new-brain/eval-results.json): openai/gpt-6-luna tied the BEST score on
 *     level c (the real job — refine a raw owner prompt into numbered sentences, 10/10, same
 *     as deepseek-v4.1-flash) while being the FASTEST paid model tested (45s/18 questions,
 *     3x faster than deepseek) and 20x cheaper than Claude Haiku ($0.0022 vs $0.044 for the
 *     same 18-question run) — see Servex/agents/readme.md.
 *   - "local": the FAST assistant only (it already runs with `tools: []`) moves to the local
 *     GPU model instead — free, no network. The smart one needs real tool calls
 *     (spawn_agent, quick_fix, dir_log, session_summary), and the new-brain facts say the
 *     local model is weak at those, so it stays on FALLBACK_MODEL even under "local".
 *
 * READ FROM A FILE FIRST, THEN THE ENV (review finding 8): an env var needs a Servex
 * RESTART to change — exactly the thing the owner says they may not be able to do once
 * Claude cuts off ("I have to rely entirely on the website"). `SESSION_BACKEND_PATH` is a
 * plain text file the SMART assistant can flip with its own Bash tool, from the website,
 * no restart: `echo openrouter > "<path>"` (Windows) takes effect on that session's very
 * next wake. The env var stays as the boot-time default (and for a `SERVEX_NO_ASSISTANT`
 * box with no agent to ask), same two-tier pattern `openrouter-burst.json` already uses
 * next door in provider.js.
 *
 * This is a PACE, not a wall, and a caller never has to touch it directly: AUTOMATIC
 * FALLBACK (`woken()` below) flips one session's one role to FALLBACK_MODEL the moment
 * Claude itself refuses it for usage limits, no setting change needed. That refusal is the
 * whole point of this switch: Dictate keeps answering even once Claude is cut off. */
export const SESSION_BACKENDS = ["auto", "claude", "openrouter", "local"];
/* VOICE MODEL POLICY (the owner, 2026-10-12, 2026-10-25): Claude is the default (see claude_model). OpenRouter runs a voice seat only when session-backend.txt says `openrouter`, or when Claude refuses that session (usage limit, logged out: the automatic fallback in woken()). */
export const FALLBACK_MODEL = "openai/gpt-6-luna";
/* Overridable (review finding 6) so a test can point this at a throwaway file instead of the
 * real one every live Servex reads — `prove-fallback.mjs` sets this before importing. */
export const SESSION_BACKEND_PATH = process.env.SERVEX_SESSION_BACKEND_PATH || path.join(
	process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
	"lew42", "servex", "session-backend.txt"
);
export function session_backend(){
	try {
		const file = fs.readFileSync(SESSION_BACKEND_PATH, "utf8").trim().toLowerCase();
		if (SESSION_BACKENDS.includes(file)) return file;
	} catch {}   // no file yet, or an unreadable one: fall through to the env var
	const b = String(process.env.SERVEX_SESSION_BACKEND ?? "auto").trim().toLowerCase();
	return SESSION_BACKENDS.includes(b) ? b : "auto";
}
/* The one usage-limit refusal text Claude's own CLI/SDK gives ("Claude AI usage limit
 * reached…", a 429, a rate- or quota-refusal) — matched loosely on purpose: a false POSITIVE
 * here only means a session that was going to need the fallback anyway gets it a turn early;
 * a false NEGATIVE means the owner is stuck with a silent session, the exact failure this
 * whole task exists to avoid. Checked ONLY against an `error:`-kind wake (review finding 3):
 * `wake_parent`'s `done:` text is the agent's own last WORDS, which can legitimately mention
 * "usage limit" while just answering a question about one — only `error:` is Claude itself
 * refusing the call. */
/* No bare "exceeded" (review finding 4): it alone also matches an unrelated refusal like
 * "context length exceeded", which would permanently move every future session off Claude
 * for the wrong reason. Each word left requires its own usage/rate/quota/billing context. */
export const USAGE_LIMIT_WORDS = /(usage.?limit|rate.?limit|quota|\b429\b|billing.?error)/i;
/* THE WAKE TEXT ALONE MOSTLY MISSES A REAL REFUSAL (review round 7, finding 1): a session
 * agent is never `one_shot`, so `Agents.js`'s `wake_parent()` only ever sends `error:` for a
 * session-level crash (rare) — an ordinary refused TURN still wakes as `done: <last_text>`,
 * where `last_text` is whatever the agent said BEFORE it got refused, not the refusal itself.
 * The real reason lives on the live agent's own `last_error` (`Agents.js`'s `result()`,
 * `message.is_error` → `this.last_error`), so `woken()` below checks BOTH: an actual `error:`
 * wake (kept, for the rare session-crash case) matched against the FULL word list, or
 * `last_error` (never spoken content, so no `^error:` anchor needed — it can't accidentally
 * match the owner asking about usage limits) matched the same way. */
export const USAGE_LIMIT_RE = new RegExp(`^error:.*${USAGE_LIMIT_WORDS.source}`, "i");

/* AUTH FAILURE fallback (auth-fallback, 2026-10-05 — the owner: "the smart mastermind kept
 * saying failure to log in ... I'm not sure why Claude kicked us out ... we don't want
 * roadblocks"). A login/token failure (an expired OAuth token, an invalid API key, a 401, the
 * CLI's own "please run /login") is a different refusal than a usage limit, but the owner
 * wants the exact same thing to happen: switch to OpenRouter at once instead of going silent.
 * Matched the same loose way as USAGE_LIMIT_WORDS and for the same reason — a false positive
 * only moves a session to OpenRouter a turn early; a false negative is the silent session this
 * whole mechanism exists to avoid. */
export const AUTH_FAIL_WORDS = /(invalid.?api.?key|not authenticated|unauthorized|\b401\b|oauth.?token|please run.{0,12}\/?login|failed to log.?in|logged out|authentication.?error|invalid.?x-api-key)/i;
export const AUTH_FAIL_RE = new RegExp(`^error:.*${AUTH_FAIL_WORDS.source}`, "i");

export default class Sessions {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	defaults(){
		/* fast_wait_ms: the fast assistant's reply waits this long after the owner spoke,
		 * so that, when the smart one answers (or reacts) first, only ONE acknowledgement
		 * goes out (the owner, 2026-09-30). `hold_fast()` below. */
		return { repo: REPO, file: process.env.SERVEX_SESSIONS_FILE || null, assistant: session_assistant(), quiet_ms: env("SERVEX_SESSION_QUIET_MS", 1500),
			/* 1500, was 8000 (first-reply, 2026-10-13): the smart one never answered inside 8 s, so the wait only delayed
			 * the first reply; ai/.../first-reply/ and ux/Dictate/doc/latency.md. Set the env to 8000 for the old pace. */
			fast_wait_ms: env("SERVEX_SESSION_FAST_WAIT_MS", 1500), prewarm: env("SERVEX_SESSION_PREWARM", 1),
			idle_ms: env("SERVEX_SESSION_IDLE_MS", 30 * 60000), resume_ms: env("SERVEX_SESSION_RESUME_MS", 60 * 60000),
			max_pairs: env("SERVEX_SESSION_MAX_PAIRS", 2), floor_wait_ms: env("SERVEX_SESSION_FLOOR_WAIT_MS", 8000),
			/* THE THOUGHT (dictation-stream, 2026-09-30): a spoken line is held from BOTH assistants until the
			 * owner has been quiet `answer_quiet_ms` (the browser's `quiet` event, ux/Dictate/floor.js's
			 * mark), or `hold_max_ms` passed with no such event (the browser engine has no level meter).
			 * `thoughts` holds those lines; `held` (below, the floor) holds a fast REPLY. */
			answer_quiet_ms: env("SERVEX_SESSION_ANSWER_QUIET_MS", 2500), hold_max_ms: env("SERVEX_SESSION_HOLD_MAX_MS", 8000),
			/* GROUPING (the owner, 2026-10-25: "my chat logs are coming in very quickly"): a spoken Prompt (one bubble)
			 * stays open for `prompt_close_ms` of quiet after the thought is handed to the seats, so the next sentences
			 * join it as one paragraph instead of a new bubble every 2.5 s; it also closes the moment an assistant
			 * replies (`prompt_close_on_reply`, env 0 turns that off). Typed lines close at once. */
			prompt_close_ms: env("SERVEX_SESSION_PROMPT_CLOSE_MS", 8000), prompt_close_on_reply: env("SERVEX_SESSION_PROMPT_CLOSE_ON_REPLY", 1) !== 0,
			prompt_timers: new Map(),
			map: {}, by_agent: new Map(), held: new Map(), floor_timers: new Map(),
			thoughts: new Map(), clients: new Map(), buffers: new Map() };
	}

	/* THE SMART SEAT'S WAKE GATE (dictation-wake, 2026-10-25): every smart-seat prompt that carries the owner's words goes through
	 * here (WakePolicy.js, ux/Dictate/doc/wake-policy.md): one batch per pause, question, name or N sentences, never per sentence.
	 * The knobs, gap_ms and every, live per session in sessions.json (`wake`); defaults and env overrides are in WakePolicy.js. */
	get waker(){
		return this._waker ??= new WakePolicy({ flush: (id, lines, why, info) => this.feed_smart(id, lines, why, info),
			stored: id => this.map[id]?.wake,
			defaults: { ...(process.env.SERVEX_SESSION_WAKE_GAP_MS ? { gap_ms: env("SERVEX_SESSION_WAKE_GAP_MS", 6000) } : {}),
				...(process.env.SERVEX_SESSION_WAKE_EVERY ? { every: env("SERVEX_SESSION_WAKE_EVERY", 1) } : {}) } });
	}

	/* The ONE place the owner's words reach the smart seat (a model turn). `why` is the cue it is told.
	 * CHAT V2 (round 2 §2): each line already carries which Prompt it belongs to (`line.prompt`, set in `say()`), so
	 * the smart seat is told it here, the same `(prompt p-…)` tail `voice_say` gives the fast seat -- the only place
	 * either seat is ever told, since neither has another way to learn an id `say()` just minted. */
	feed_smart(id, lines, why){
		const s = this.map[id];
		if (!s) return;
		const moves = (s.moves ?? []).splice(0);
		const nav = moves.length ? `(now on ${moves[moves.length - 1]})\n` : "";
		const prompt = lines[lines.length - 1]?.prompt;
		s.smart_re = lines[lines.length - 1].at;
		this.save();
		const fresh = this.wake(s, "smart");
		this.mark_sent(s, "smart", lines);
		const tailing = s.tail ? this.tail_log(s) : false;
		if (tailing && !fresh) return;   // awake and tailing its own file: Follow already delivers these lines raw
		this.send(s, "smart", nav + lines.map(l => `${selected_prefix(l.selection)}[on ${l.path} at ${l.at}] ${l.text}`).join("\n") + `\n(${why})` + (prompt ? `\n(prompt ${prompt})` : ""));
	}

	/* TAIL MODE (opt-in, `s.tail`, 2026-10-25): the smart seat follows its OWN session.jsonl through Servex/Follow.js and hears the
	 * owner's raw lines as they land, instead of a prompt built from them. `skip_by` keeps its own writes (and the fast seat's) out, so
	 * its replies never wake it. Follow drops the row when the agent stops; the next feed_smart (the wake gate still revives a sleeping
	 * seat) subscribes again. Returns true when the subscription is in place. */
	tail_log(s){
		const follow = this.servex.follow, agent = s.smart;
		if (!follow || !agent || !s.file) return false;
		const rel = path.relative(process.cwd(), this.disk(s.file)).split(path.sep).join("/");
		if (follow.list(agent).some(f => f.path === rel)) return true;
		try {
			follow.follow({ agent, path: rel, gather_ms: s.tail_ms ?? 1500, heard: true, skip_by: [agent] });
			return true;
		} catch (e){ console.error(`sessions: tail ${s.id}: ${e.message}`); return false; }
	}

	/* The knobs of one session (dictation widget settings panel): POST /api/session/settings {session, gap_ms?, every?, tail?};
	 * null drops a knob back to the default; `tail: true` makes the smart seat follow its own session.jsonl (`tail_log`). Returns the knobs now in force. */
	settings({ session, gap_ms, every, tail } = {}){
		const s = this.get(session);
		if (tail !== undefined){ tail ? s.tail = true : delete s.tail; }
		const patch = {};
		if (gap_ms !== undefined) patch.gap_ms = gap_ms;
		if (every !== undefined) patch.every = every;
		const next = this.waker.checked(s.id, patch);
		Object.keys(next).length ? s.wake = next : delete s.wake;
		this.save();
		return { ok: true, ...this.waker.knobs(s.id), ...(s.tail ? { tail: true } : {}) };
	}

	install(){
		this.file ??= place("sessions.json");
		this.load();
		this.backfill();
		this.unanswered();
		this.hire();
		this.listen();
		this.route();
		this.sweeper = setInterval(() => this.sweep(), Math.min(60000, Math.max(1000, this.idle_ms / 4)));
		this.sweeper.unref?.();
		return this;
	}

	/* A fake "parent" agent, same trick as Dispatcher.hire() (Dispatcher.js): sitting in the
	 * very same `live` map real agents do, so `Agents.wake_parent()` can reach it with nothing
	 * more than a `.send()` at `child.parent`. `spawn()` below gives every session-fast and
	 * session-smart agent `parent: "sessions"`, so a turn's end or error is one message here —
	 * never polled, never missed — instead of silence. */
	hire(){
		const agent = {
			id: "sessions", role: "sessions", name: null, topics: null, page: null,
			state: "idle", visibility: "team", session_id: null, parent: null,
			started_at: new Date().toISOString(),
			card(){ return { id: this.id, role: this.role, model: null, state: this.state,
				visibility: this.visibility, started_at: this.started_at, turns: 0,
				session_id: this.session_id, cost: 0, parent: this.parent }; },
			send: (text, note) => this.woken(text, note)
		};
		this.servex.agents.live.set(agent.id, agent);
		this.servex.agents.register(agent);
	}

	/* AUTOMATIC FALLBACK (dictate-without-claude, 2026-10-04; extended to auth failures by
	 * auth-fallback, 2026-10-05): every session-fast/session-smart turn's end or error reaches
	 * here (see `hire()`), as `${kind}: <the agent's own last words, first 300 chars>` — most
	 * are "done: …" and ignored at once. One that matches USAGE_LIMIT_RE or AUTH_FAIL_RE is
	 * Claude refusing that one agent, either for usage or because its login failed; `note.from`
	 * is its id, which `by_agent`
	 * (kept current in `wake()`) maps back to `{id: session id, role}`. Flips just that ROLE of
	 * just that SESSION to FALLBACK_MODEL and tells the owner in plain words, in the session
	 * itself — the one place they're already looking. Does nothing when the backend is already
	 * off "claude" for this role: nothing to fall back FROM (`session_model()` covers "local",
	 * which already keeps smart off Claude too).
	 *
	 * Once ANY session hits this, every FUTURE ✦ press writes `openrouter` to
	 * `SESSION_BACKEND_PATH` too (review finding 6) — otherwise, after a real cutoff, each new
	 * session would have to get refused once, fresh, before it also falls back; one refusal is
	 * enough to know Claude is down for everyone, not just this one session.
	 *
	 * Runs SYNCHRONOUSLY inside the very `emit()` call that is still finishing the refused
	 * agent's OWN "error" event (review finding 4) — `stop()` + a fresh `wake()` from inside
	 * that stack worked in the live proof (`prove-fallback.mjs`), but `setImmediate` lets that
	 * call stack unwind first anyway, cheaply, rather than relying on it always being safe. */
	woken(text, note){
		const from = this.by_agent.get(note?.from);
		if (!from) return;
		/* BOTH signals, not just the wake text (review round 7, finding 1) — see
		 * USAGE_LIMIT_WORDS's own comment above for why `last_error` is the one that actually
		 * fires on a real refusal. Auth failures are checked the same way, against the same
		 * two signals, for the same reason. */
		const last_error = this.servex.agents.live.get(note.from)?.last_error;
		const is_usage = USAGE_LIMIT_RE.test(String(text ?? "")) || USAGE_LIMIT_WORDS.test(String(last_error ?? ""));
		const is_auth = AUTH_FAIL_RE.test(String(text ?? "")) || AUTH_FAIL_WORDS.test(String(last_error ?? ""));
		if (!is_usage && !is_auth) return;
		const s = this.map[from.id];
		/* Check THIS ROLE'S OWN current model, not the global setting (review finding 1): once
		 * one session's refusal has already flipped `session-backend.txt` to "openrouter", a
		 * SECOND session still live on an old Claude agent would otherwise hit an early return
		 * here forever — `session_backend() !== "claude"` is true for it too, even though this
		 * particular agent is the one that just got refused and needs replacing right now. */
		const current_model = s?.backing_model?.[from.role] ?? this.session_model(s ?? {}, from.role);
		if (!s || !String(current_model).startsWith("claude") || s.fallback?.[from.role]) return;
		(s.fallback ??= {})[from.role] = true;
		(s.backing ??= {})[from.role] = null;   // never resume a Claude session id under a different model
		this.write(s, { chat: { at: now_ms(), session: s.id, path: s.path, from: { kind: "system", id: "servex" }, via: "text",
			text: is_auth
				? `Claude logged out; switched the ${from.role} assistant to ${FALLBACK_MODEL} (OpenRouter).`
				: `Claude refused the ${from.role} assistant for usage limits; switched it to ${FALLBACK_MODEL} (OpenRouter).` } });
		try { fs.mkdirSync(path.dirname(SESSION_BACKEND_PATH), { recursive: true }); fs.writeFileSync(SESSION_BACKEND_PATH, "openrouter"); } catch {}
		/* One card, the first time this process sees an auth failure — not one per call, and
		 * not one per session (several sessions can fail in the same burst; the owner needs to
		 * hear it once). `auth_card_posted` is a plain instance flag, not a file, because this is
		 * a one-time NOTICE, not a persisted setting like `SESSION_BACKEND_PATH` above. */
		if (is_auth && !this.auth_card_posted){
			this.auth_card_posted = true;
			this.servex.cards?.create({ title: "Claude logged out — answering on OpenRouter", type: "note", by: "sessions", tags: ["auth"] })
				.then(card => card?.id && this.servex.cards.append(card.id,
					{ message: { by: "sessions", kind: "update",
						text: "Claude's login failed mid-session, so every voice session switched to OpenRouter automatically. Fix: log Claude back in (`claude /login`)." } }))
				.catch(() => {});
		}
		const last_owner = this.last_owner_line(s);   // the line Claude refused to answer — read now, before anything respawns
		setImmediate(() => {
			try { this.servex.agents.stop(s[from.role]); } catch {}
			/* `wake()` gives the fresh agent the session's tail as CONTEXT, but context alone
			 * starts no new turn, so without this the owner hears nothing until they speak
			 * again, to an agent that never actually answered them (review finding 4). Re-send
			 * it, to this one role only. Not gated by the wake policy: a recovery, not a new thought. */
			try {
					this.wake(s, from.role);
					if (last_owner) from.role === "fast" && this.voice_seat() ? this.voice_say(s, [last_owner]) : this.send(s, from.role, last_owner.text);
				}
			catch (e){ console.error(`sessions: fallback respawn failed: ${e.message}`); }
		});
	}

	/* The text of the most recent owner chat line in this session's file — what a freshly
	 * respawned agent (`woken()` above) needs re-sent, since its own context tail is history,
	 * not a live turn. */
	last_owner_line(s){
		try {
			const lines = fs.readFileSync(this.disk(s.file), "utf8").split("\n");
			for (let i = lines.length - 1; i >= 0; i--){
				if (!lines[i].trim()) continue;
				let j; try { j = JSON.parse(lines[i]); } catch { continue; }
				if (j.chat?.from?.kind === "owner") return j.chat;
			}
		} catch {}
		return null;
	}

	/* THE VOICE SEAT: is this session's `fast` agent the voice assistant? */
	voice_seat(){ return this.assistant === "voice"; }

	/* Every owner sentence of the session so far, oldest first, as `{at, text, selection?}` (a refined line is the
	 * assistant's, so only `from.kind === "owner"` lines count). */
	owner_lines(s){
		const out = [];
		try {
			for (const l of fs.readFileSync(this.disk(s.file), "utf8").split("\n")){
				if (!l.trim()) continue;
				let j; try { j = JSON.parse(l); } catch { continue; }
				if (j.chat?.from?.kind === "owner") out.push(j.chat);
			}
		} catch {}
		return out;
	}

	/* WAKE THE VOICE ASSISTANT (voice-assistant-plan): the whole prompt so far (each owner line with its `at`), then the
	 * new sentence(s), then the session file to write into. It answers by writing one {"place"} line per new sentence
	 * with the item tool; it writes no chat reply (`heard()` drops its text).
	 *
	 * CHAT V2 (round 2, §1-2): this is also called with the LAST OWNER LINE AGAIN on a fallback respawn (`woken()`
	 * below) -- re-sending an already-logged line to a fresh model, never a new utterance. The Prompt itself is
	 * written in `say()`, at the moment each line is first heard, exactly once; `voice_say` only ever builds text
	 * for the fast seat, so a respawn can never write a second Prompt for the same words. `fresh` lines already
	 * carry which Prompt they belong to (`l.prompt`, set in `say()`) -- told to the fast seat the same way
	 * `feed_smart` tells the smart one, so either seat can be asked about a Prompt it was never separately handed. */
	voice_say(s, fresh){
		const news = new Set(fresh.map(l => l.at));
		const said = l => `[${l.at}] ${selected_prefix(l.selection)}${l.text}`;
		const before = this.owner_lines(s).filter(l => !news.has(l.at));
		const prompt = fresh[fresh.length - 1]?.prompt;
		const text = (before.length ? `The prompt so far:\n${before.map(said).join("\n")}\n\n` : "The prompt so far: (nothing yet)\n\n")
			+ `New sentence${fresh.length === 1 ? "" : "s"} to place (one {place} line each, \`re\` = its \`at\`):\n${fresh.map(said).join("\n")}\n\n`
			+ `Session file: ${s.file}` + (prompt ? `\n(prompt ${prompt})` : "");
		this.send(s, "fast", text);
	}

	/* CHAT V2 (Option C, chat-shape.md; round 2 §1): the Prompt THIS owner line belongs to -- every owner line, any
	 * seat, never gated on `voice_seat()` (finding 4). `s.prompt` is the thought still open: a line that continues
	 * one pushes its raw words and grows the one paragraph "a" in place, live, as it is said -- never waiting for
	 * the pause (findings 2, 3). The Prompt closes (`s.prompt` cleared) `prompt_close_ms` after the thought is handed to the seats, or when an
	 * assistant replies and the owner is not mid-thought (typed lines close it at once), so a later, unrelated line is
	 * never wrongly merged into a Prompt that is already done. Returns the Prompt's
	 * id, written onto the chat line itself (`line.prompt`) so either seat can be told which Prompt it is answering
	 * (`feed_smart`/`voice_say`, which have no other way to learn an id `say()` just minted). */
	assign_prompt(s, { text, raw }){
		clearTimeout(this.prompt_timers.get(s.id));
		if (s.prompt){
			this.write(s, PromptLines.push_raw(s.prompt, raw ?? text));
			this.write(s, PromptLines.append_paragraph(s.prompt, { para_id: "a", text: " " + text }));
			return s.prompt;
		}
		const id = PromptLines.prompt_id();
		this.write(s, PromptLines.add_prompt({ id, raw: raw ?? text, text }));
		s.prompt = id;
		return id;
	}

	// ── state ────────────────────────────────────────────────────────────────

	load(){
		try { this.map = JSON.parse(fs.readFileSync(this.file, "utf8")); } catch { this.map = {}; }
		let moved = 0;
		for (const [id, s] of Object.entries(this.map)){
			if (this.relocate(s)) moved++;
			delete s.floor;   // a floor from before a restart is stale: nobody is still talking into it
			delete s.prompt;  // the held thought (this.thoughts) is in memory only, so an open Prompt from before a restart is closed: the next line starts a fresh one
			for (const role of ["fast", "smart"]) if (s[role]) this.by_agent.set(s[role], { id, role });
		}
		if (moved){ console.log(`sessions: ${moved} session${moved === 1 ? "" : "s"} repointed to the dated store`); this.save(); }
	}

	/* A record that voice-backfill.mjs moved into the dated store (/framework/ai/sessions/YYYY/MM/DD/<id>/) is found there by its
	 * id and day, and `s.file` is repointed to it, so sessions.json is never edited by hand. */
	relocate(s){
		if (!s.file || /^\/framework\/ai\/sessions\/\d{4}\/\d{2}\/\d{2}\//.test(s.file) || !Number.isFinite(+new Date(s.at))) return false;
		const file = Sessions.session_path(s.home, s.id, new Date(s.at));
		if (!fs.existsSync(this.disk(file))) return false;
		s.file = file; return true;
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

	disk(site){
		const card = /^\/?framework\/ai\/(\d{4}(?:\/.*)?)$/.exec(site);   // a card address: its folder is in the sessions store (one tree, 2026-10-13)
		if (card) return Cards.path(card[1], path.join(this.repo, "public", "framework", "ai"));
		return path.join(this.repo, "public", ...site.split("/").filter(Boolean));
	}
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

	/* A `{sent}` line: these owner lines have just been handed to the `to` seat ("fast" | "smart"). `delay_ms` is the time from the
	 * words leaving the owner's draft (`said_at`, else arrival) to now. The chat draws it beside each line (ux/Dictate/Widget.js `Thread.sent`). */
	mark_sent(s, to, lines){
		try {
			const ls = (lines ?? []).filter(l => l?.at);
			if (!ls.length) return;
			const last = ls[ls.length - 1], at = now_ms(), from = Date.parse(last.said_at ?? last.at);
			this.write(s, { sent: { to, at, re: ls.map(l => l.at), ...(Number.isNaN(from) ? {} : { delay_ms: Math.max(0, Date.parse(at) - from) }) } });
		} catch (e){ console.error(`sessions: could not mark a line sent: ${e.message}`); }
	}

	write(s, line){
		this.append(this.disk(s.file), line);
		s.last_at = now_ms();
		this.save();
		this.push(s.id, { kind: "line", line });
	}

	/* THE FAST ASSISTANT'S REFINEMENT (one-dictation, minion-voice-refine, 2026-10-03): a
	 * FINISHED owner line (see `worth_refining()` just below) that the owner's own `say()`
	 * just wrote (above) runs through the SAME shared Refine engine `Echo.js` already drives
	 * for VS Code prompts -- `clean()` (`ext/Refine/engine.js`) then `structure()`
	 * (`ext/Refine/structure.js`) -- never a second engine (law 6). Its own markdown parser
	 * (`parse_sections`/`sections_with_ids`) is reused too, straight off the live Echo
	 * instance -- no copy of those three functions kept here any more (review finding 1:
	 * Echo.js has them as plain methods, so there was never a reason to duplicate them). This
	 * runs AFTER the line is written and the fast assistant is already woken, and `say()`
	 * never awaits it: a slow or down model must never delay the owner's own turn. Model
	 * calls go through `servex.echo.call()`, not a bare `askOnce` -- Echo.js already wraps
	 * that call with its own loop guard (`machine`/`inflight`, see Echo.js's "THE ECHO LOOP"
	 * comment), so every session this spawns is one Echo itself already knows is a machine
	 * call, never mistaken for a fresh owner prompt. One result line lands once both calls
	 * finish: `{refined: {at, re, sentences, sections, flags, cost_usd}}`, `re` = the owner
	 * line's own `at`. `cost_usd` sums `total_cost_usd` off every model call this one
	 * utterance made (`AskEach.mjs`'s own `askOnce` return). Returns the promise so a test
	 * can await it directly with a stubbed `servex.echo.call`; `say()` itself only logs a
	 * failure (no model, Servex down) and otherwise lets go -- the raw bubble already stands
	 * on its own with nothing refined underneath it. */
	refine(s, line){
		const echo = this.servex?.echo;
		if (!echo || !worth_refining(line)) return Promise.resolve();
		let cost_usd = 0;
		const call = async (prompt, opts) => {
			const r = await echo.call(prompt, opts);
			cost_usd += Number(r?.cost_usd) || 0;
			return r;
		};
		return (async () => {
			const { sentences, flags } = await clean(line.text, { call });
			if (!sentences.length) return;
			const built = await structure(sentences, { call });
			const sections = built.md ? echo.sections_with_ids(echo.parse_sections(built.md)) : [];
			this.write(s, { refined: { at: now_ms(), re: line.at, sentences, sections, flags, cost_usd } });
		})();
	}

	/* The last `n` lines of a session's file, as text: the context a FRESH agent gets
	 * when its old Claude session cannot be resumed. */
	tail(s, n = 40){
		try { return fs.readFileSync(this.disk(s.file), "utf8").split("\n").filter(l => l.trim()).slice(-n).join("\n"); }
		catch { return ""; }
	}

	/* The ONE place the new-session file shape lives: the CENTRAL store
	 * `/framework/ai/sessions/YYYY/MM/DD/<id>/session.jsonl` (local date); `home` stays only a field of the session.
	 * Old sessions keep the `file` stored in sessions.json (`<home>ai/<id>.jsonl`). */
	static session_path(home, id, date = new Date()){
		const p = n => String(n).padStart(2, "0");
		const day = `${date.getFullYear()}/${p(date.getMonth() + 1)}/${p(date.getDate())}`;
		// Alternative (per-directory, undecided): return `${home}ai/sessions/${day}/${id}/session.jsonl`;
		return `/framework/ai/sessions/${day}/${id}/session.jsonl`;
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
		LogLine.append(path.join(at.disk, "ai", "log.jsonl"), checked);
		return { ok: true, file: `${at.name}ai/log.jsonl`, line: checked };
	}

	// ── the fast path: quick_fix / quick_fix_landed (fixer, 2026-10-01) ────────

	/* `public/framework/ai/quick-fix/page.jsonl` — its own page, "data lives with its page".
	 * One line per request (`quick_fix`, below) and one more per landing (`quick_fix_landed`),
	 * both sharing the same `quickfix.asked_at` so the page can fold them into one row. */
	quickfix_file(){ return path.join(this.disk("/framework/ai/quick-fix/"), "page.jsonl"); }

	/* THE HOT-PATH DOOR (quick_fix tool, tools.js): a small, concrete page change goes straight
	 * to the standing fixer, `fixer-1` — no spawn, nothing new made. Writes the `asked` line
	 * itself, here, in node (CLAUDE.md law 7: measured, never recalled — the fixer is never asked
	 * to state when IT was asked, because it would have to recall that, not compute it), then
	 * hands the request on. `session` is optional: a test, or a direct `send_to_agent`, has none. */
	quick_fix({ page, selection, text, session } = {}){
		if (!String(page ?? "").trim()) throw Object.assign(new Error("quick_fix needs `page`, the site path being edited"), { status: 400 });
		if (!String(text ?? "").trim()) throw Object.assign(new Error("quick_fix needs `text`, what to change"), { status: 400 });
		const fixer = this.servex?.fixer;
		if (!fixer) throw Object.assign(new Error("the fixer is not running in this Servex (SERVEX_NO_FIXER, or SERVEX_NO_POOL?)"), { status: 503 });
		const sel = selection && typeof selection === "object" ? trim_sel(selection) : null;
		const asked_at = now_ms();
		this.append(this.quickfix_file(), { quickfix: { asked_at, page, selection: sel, text, session: session ?? null, fixer: fixer.id } });

		let agent;
		try { agent = fixer.ensure(); }
		catch (e){ return { ok: false, asked_at, why: `logged, but the fixer could not be reached: ${e.message || e}` }; }

		// mid a fix already -> this one queues behind it, and the caller is told how far back;
		// otherwise (idle, or just starting) it cuts in at once — nothing real to interrupt.
		const ahead = agent.state === "working" ? (agent.queued ?? 0) + 1 : 0;
		const note = `[quick fix${session ? `, session ${session}` : ""}] page: ${page}\n${selected_prefix(sel)}${text}`
			+ `\n\n(asked_at: ${asked_at} — pass this back, exactly, to quick_fix_landed)`;
		this.servex.agents.send(fixer.id, note, { from: session ?? "voice",
			...(session ? { reply_to: `session ${session}` } : {}), ...(ahead ? {} : { priority: "now" }) });

		return { ok: true, fixer: fixer.id, asked_at, ahead, note: ahead ? `fixer busy, ${ahead} ahead` : "sent to the fixer" };
	}

	/* THE FIXER CALLS THIS ONCE ITS OWN `merge.mjs` HAS ACTUALLY LANDED THE FIX. `ms` is computed
	 * here, from the real `asked_at` this same class logged above — never something the model
	 * states, because an agent's own sense of elapsed wall-clock time is a guess, not a
	 * measurement (CLAUDE.md law 7, fixer.md step 8). Everything else (`sha`, `files`, `lines`,
	 * `width`, `shot`) is real tool output the fixer is only relaying, not inventing. */
	quick_fix_landed({ asked_at, sha, files, lines, width, shot } = {}){
		if (!String(asked_at ?? "").trim()) throw Object.assign(new Error("quick_fix_landed needs the `asked_at` quick_fix gave you"), { status: 400 });
		if (!String(sha ?? "").trim()) throw Object.assign(new Error("quick_fix_landed needs `sha`, merge.mjs's own commit"), { status: 400 });
		const landed_at = now_ms();
		const ms = Date.parse(landed_at) - Date.parse(asked_at);
		if (!Number.isFinite(ms)) throw Object.assign(new Error(`"${asked_at}" is not a time quick_fix could have given you`), { status: 400 });
		this.append(this.quickfix_file(), { quickfix: { asked_at, landed_at, sha,
			files: files ?? null, lines: lines ?? null, width: width ?? null, shot: shot ?? null, ms } });
		return { ok: true, ms, seconds: Math.round(ms / 100) / 10 };
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
	 * so its folder-index lines land there. Its own file is in the dated store like every voice session (`session_path()`), not beside the card.
	 * `path` is still kept as where the owner actually stood (unchanged: it is `asked` below). */
	create({ path: at, card, host = null, fresh = false } = {}){
		const asked = page_path(at);
		if (!asked) throw Object.assign(new Error(`"${at}" is not a page path`), { status: 400 });
		let home = this.nearest(asked);
		if (card != null && card !== ""){
			home = this.card_home(card);
			if (!home) throw Object.assign(new Error(`"${card}" is not a known card (no page.jsonl in its folder, ai/sessions/<day>/cards/<slug>/)`), { status: 400 });
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
		const file = Sessions.session_path(home, id);
		/* No agents yet: the first say spawns them (wake). */
		const s = { id, home, file, kind: "voice", at: now_ms(), project, host, path: asked, visited: [], fast: null, smart: null,
			backing: { fast: null, smart: null }, ...(card ? { card } : {}) };
		this.map[id] = s;
		this.write(s, { session: { id, home, kind: "voice", at: s.at, project, host, ...(card ? { card } : {}), fast: null, smart: null, backing: s.backing } });
		this.point(s, home);
		this.save();
		this.prewarm_fast(s);
		const previous = last ? { session: last.session, title: last.title, summary: last.summary, at: last.last_at } : null;
		return { ok: true, session: id, home, file, resumed: false, previous };
	}

	/* PRE-WARM (first-reply, 2026-10-13): opening the drawer starts the FAST agent now, so the first sentence meets a live
	 * process, not a cold spawn. The smart one still waits for the first say. The idle sweep stops it after idle_ms. */
	prewarm_fast(s){
		if (!this.prewarm) return;
		setImmediate(() => { try { this.wake(s, "fast"); this.save(); } catch (e){ console.error(`sessions: prewarm: ${e.message}`); } });
	}

	/* Continue any session by id. The fast agent pre-warms (above); the smart one spawns at the next say. */
	resume({ session } = {}){
		const s = this.get(session);
		const { title = null, summary = null } = this.summary_of(s);
		this.prewarm_fast(s);
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
		/* RENAME ON TITLE CHANGE (owner, 2026-10-25): a title set the usual way renames the
		 * session's own folder too, with no second call — never fatal to the title write itself. */
		if (changed) try { this.rename(s, title); } catch (e){ console.error(`sessions: rename on title change: ${e.message}`); }
		this.save();
		return { ok: true, session: s.id, title, summary, at };
	}

	/* RENAME (owner, 2026-10-25): the session's own folder name tracks its title, so the same
	 * name reads in the Switch-session dropdown and on disk (`ai/sessions/YYYY/MM/DD/<name>/`).
	 * The session's id NEVER moves — it stays the key of `this.map` and the only thing any
	 * reader resolves by; only the directory and `s.file` change, in this one Servex-owned step
	 * (never a find-and-replace across JSONL: an old line keeps whatever path it was written
	 * with, and every reader goes by id). Servex is the single writer for both the in-memory
	 * state and the files, so this is the one place a rename happens, and it emits one `renamed`
	 * event on the session's own live stream so an open client redraws the title from it instead
	 * of tracking the path itself. A no-op when the title doesn't change the slug (same name, or
	 * no good slug to make). Best-effort: a `follow()` on the session's OLD file path is pointed
	 * at the new one if Servex's `Follow` instance is reachable; nothing else is chased down —
	 * CLAUDE.md law 6 leaves a general move-with-reference-update to the Item system later, not
	 * built here (see public/framework/core/Item's own note). */
	rename(s, title){
		const slug = slugify(title);
		const old_rel = path.posix.dirname(s.file), day_rel = path.posix.dirname(old_rel), base = path.posix.basename(old_rel);
		if (!slug || slug === base) return { renamed: false };
		const day_disk = this.disk(day_rel);
		let name = slug, n = 2;
		while (name !== base && fs.existsSync(path.join(day_disk, name))) name = `${slug}-${n++}`;
		if (name === base) return { renamed: false };
		const old_disk = this.disk(old_rel), new_disk = path.join(day_disk, name);
		fs.mkdirSync(day_disk, { recursive: true });
		let tracked = "";
		try { tracked = execFileSync("git", ["-C", this.repo, "ls-files", old_disk], { windowsHide: true }).toString().trim(); } catch {}
		if (tracked) execFileSync("git", ["-C", this.repo, "mv", old_disk, new_disk], { windowsHide: true });
		else fs.renameSync(old_disk, new_disk);
		const old_file = s.file, new_rel = `${day_rel}/${name}`;
		s.file = old_file.replace(old_rel, new_rel);
		this.save();
		try {
			const subs = this.servex?.follow?.subs ?? [];
			const old_path = old_file.replace(/^\/+/, ""), new_path = s.file.replace(/^\/+/, "");
			for (const sub of subs) if (sub.path === old_path) sub.path = new_path;
		} catch {}
		this.push(s.id, { kind: "renamed", title, file: s.file });
		return { renamed: true, from: old_rel, to: new_rel };
	}

	/* The tool-facing wrapper (tools.js's `rename_session`): looks the session up by id, which
	 * never changes, then renames it as above. */
	rename_session({ session, title } = {}){
		const s = this.get(session);
		title = String(title ?? "").trim();
		if (!title) throw Object.assign(new Error("rename_session needs `title`, the name to rename to"), { status: 400 });
		const r = this.rename(s, title);   // mutates s.file; read it back AFTER, or this returns the stale pre-rename path
		return { ok: true, session: s.id, file: s.file, ...r };
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
		if (!level) this.reply_closes_prompt(s);
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
	/* CHAT V2 (round 2, requirements-2.md §3): `kind` other than "speech" is the page reporting something, not the
	 * owner speaking -- it never wakes a seat, never touches a Prompt, and never runs through the speech logic
	 * below at all (an early return). `session` must be an OWN key of `this.map` (`Object.hasOwn`, never a bare
	 * `this.map[session]`, which a name like "constructor" would resolve to a prototype value and crash past this
	 * guard) -- this is the real dictation path (`/api/session/say`), the one the page's own error/click reports
	 * now travel down too, so the same hardening the speech branch already gets from `this.get()` is given here
	 * explicitly. `error` is filed as a `log` line (ISO `at`, like every other log line in this repo); `click`/
	 * `context` are queued onto the smart seat's `notes`, the same way `nav()`/`react()` already tell it something
	 * happened without starting a new thought -- read on its next turn. */
	say({ session, path: at, text, via = "text", raw, floor, cues, quiet_ms, re, thread, selection, kind = "speech", said_at } = {}){
		if (!["speech", "error", "click", "context"].includes(kind)) throw Object.assign(new Error("kind is speech, error, click or context"), { status: 400 });
		if (!String(text ?? "").trim()) throw Object.assign(new Error("text is required"), { status: 400 });
		if (kind !== "speech"){
			if (!Object.hasOwn(this.map, session)) throw Object.assign(new Error(`no session "${session}"`), { status: 404 });
			const s = this.map[session];
			if (kind === "error") this.write(s, { log: { at: now_ms(), msg: String(text).slice(0, 2000) } });
			else { ((s.notes ??= {}).smart ??= []).push(`(the page reports a ${kind}: ${String(text).slice(0, 500)})`); this.save(); }
			return { ok: true };
		}
		const s = this.get(session);
		if (floor != null && !FLOORS.includes(floor)) throw Object.assign(new Error(`floor is ${FLOORS.join(" or ")}`), { status: 400 });
		const site = page_path(at) ?? s.path;
		if (site !== s.path) this.nav({ session, from: s.path, to: site });
		/* CHAT V2 (round 2, §1): the Prompt this line belongs to -- the one already open (`s.prompt`), grown live, or
		 * a fresh one otherwise. The Prompt is closed by `release_thought` (after `prompt_close_ms` of quiet; at once for typed) or by an
		 * assistant reply, so a LATER line (continuing or not) is never wrongly merged into a Prompt that is already done. */
		const prompt = this.assign_prompt(s, { text, raw });
		const line = { at: now_ms(), session, path: site, from: { kind: "owner" }, via, text, prompt,
			...(said_at && !Number.isNaN(Date.parse(said_at)) ? { said_at: String(said_at) } : {}),
			...(raw && String(raw).trim() && raw !== text ? { raw: String(raw) } : {}),
			...(floor ? { floor } : {}), ...(cues && typeof cues === "object" ? { cues } : {}),
			...(thread && re ? { re: String(re), thread: true } : {}),
			...(selection && typeof selection === "object" ? { selection: trim_sel(selection) } : {}) };
		this.write(s, { chat: line });
		this.refine(s, line).catch(e => this.servex?.say?.(`sessions: could not refine an utterance: ${e.message || e}`));
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
			if (floor !== "speaking" && (q == null || q >= this.answer_quiet_ms)) this.release_thought(s, q == null ? "the mic is off" : `quiet for ${(q / 1000).toFixed(1)} s`, q == null ? { mic_off: true } : { quiet: q });
		} else if (this.thoughts.get(s.id)?.lines.length){
			/* Typed while spoken words are still held: they all go together, in order (review note 4). */
			this.hold_thought(s, line);
			this.release_thought(s, "then typed this", { typed: true });
		} else {
			s.fast_re = s.fast_thought_at = line.at;
			s.fast_heard = text;
			if (this.voice_seat()) this.voice_say(s, [line]);
			else this.send(s, "fast", `${selected_prefix(selection)}[on ${site}] ${text}\n(prompt ${prompt})`);
			this.mark_sent(s, "fast", [line]);
			this.gather(s, line);
			s.prompt = null;   // CHAT V2 (round 2, §1): handed to a seat already, with nothing more coming -- done
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
	 * newest one only) and the smart seat's pause timer (WakePolicy.hold) stops; "done" writes the held reply and starts it again.
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
		if (floor !== "speaking"){ this.waker.resume(s.id); return this.release(s); }
		this.waker.hold(s.id);   // the owner is talking, so no pause is running: the smart seat's pause timer stops until the floor is "done"
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
			this.waker.flush(s.id, "asked: a reaction");   // what they said before it goes first, so the explanation lands in context
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

	/* The smart assistant hears a thought, not its fragments: a TYPED line (or a spoken one from a page that reports no floor)
	 * joins the wake gate with the short `quiet_ms` as its hold, since pressing send is deliberate. */
	gather(s, line){
		this.waker.add(s.id, line, { hold_ms: this.quiet_ms });
	}

	close_prompt(s){
		clearTimeout(this.prompt_timers.get(s.id));
		this.prompt_timers.delete(s.id);
		s.prompt = null;
	}

	close_prompt_later(s){
		clearTimeout(this.prompt_timers.get(s.id));
		if (!s.prompt) return;
		const t = setTimeout(() => this.close_prompt(s), this.prompt_close_ms);
		t.unref?.();
		this.prompt_timers.set(s.id, t);
	}

	/* An assistant answered: the Prompt it answered is done (when `prompt_close_on_reply`), unless the owner is still
	 * mid-thought (a held thought): with the smart seat woken per sentence, replies land mid-dictation and closing then
	 * would split one dictation into many bubbles. The thought's release then starts the normal quiet close. */
	reply_closes_prompt(s){
		if (this.prompt_close_on_reply && s.prompt && !this.thoughts.get(s.id)?.lines.length) this.close_prompt(s);
	}

	/* HELD until the owner stops (the floor): every spoken line waits here; both assistants hear
	 * the whole thought at once on release, with how it ended as the last line. */
	hold_thought(s, line){
		const h = this.thoughts.get(s.id) ?? { lines: [] };
		h.lines.push(line);
		clearTimeout(h.timer);
		// No quiet event for hold_max_ms means no line arrived in that time, so it counts as that much silence: a guess, since this engine has no level meter.
		h.timer = setTimeout(() => { try { this.release_thought(s, `no quiet event for ${Math.round(this.hold_max_ms / 1000)} s`, { quiet: this.hold_max_ms }); } catch (e){ console.error(`sessions: ${e.message}`); } }, this.hold_max_ms);
		h.timer.unref?.();
		this.thoughts.set(s.id, h);
	}

	/* The FAST seat hears the thought now; the SMART seat's copy goes through the wake gate (waker): `mic_off` flushes it at
	 * once (the dictation ended), `quiet` counts real silence toward the gap, `typed` gives it the short typed hold. */
	release_thought(s, why, { mic_off = false, quiet = null, typed = false } = {}){
		const h = this.thoughts.get(s.id);
		if (!h?.lines.length) return false;
		clearTimeout(h.timer);
		this.thoughts.delete(s.id);
		typed ? this.close_prompt(s) : this.close_prompt_later(s);   // CHAT V2 (round 2 §1): the thought is done; the Prompt closes after `prompt_close_ms` of quiet (typed: now), the next line then starts a fresh one
		const said = h.lines.map(l => `${selected_prefix(l.selection)}[on ${l.path}] ${l.text}`).join("\n");
		const prompt = h.lines[h.lines.length - 1]?.prompt;
		const tail = `\n(the owner has stopped: ${why})` + (prompt ? `\n(prompt ${prompt})` : "");
		s.fast_re = h.lines[h.lines.length - 1].at;
		s.fast_heard = said;
		s.fast_thought_at = h.lines[0].at;   // the FIRST owner line of this thought — a `(new paragraph)` marker's `re`
		this.save();
		this.wake(s, "fast");
		if (this.voice_seat()) this.voice_say(s, h.lines);
		else this.send(s, "fast", said + tail);
		this.mark_sent(s, "fast", h.lines);
		this.waker.add(s.id, h.lines, typed ? { hold_ms: this.quiet_ms } : { elapsed_ms: quiet ?? 0 });
		if (mic_off) this.waker.flush(s.id, "the mic went off");
		else if (quiet != null) this.waker.silence(s.id, quiet);
		return true;
	}

	/* THE SILENCE EVENT (the owner, 2026-09-30: "an invisible message that my UI sends into the chat,
	 * but to the LLM"): written as a `{quiet}` line nobody draws, and it releases what was held. */
	quiet({ session, ms, mic_off = false, path: at } = {}){
		const s = this.get(session);
		const n = Math.max(0, Math.round(Number(ms) || 0));
		this.write(s, { quiet: { at: now_ms(), ms: n, ...(mic_off ? { mic_off: true } : {}), path: page_path(at) ?? s.path } });
		const released = (mic_off || n >= this.answer_quiet_ms)
			&& this.release_thought(s, mic_off ? "the mic went off" : `quiet for ${(n / 1000).toFixed(1)} s`, mic_off ? { mic_off: true } : { quiet: n });
		if (mic_off) this.waker.flush(s.id, "the mic went off");   // the thought may have been released earlier; its batch still waits
		else this.waker.silence(s.id, n);
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

	/* The voice assistant's whole system text: the `voice-assistant` skill, minus its front matter. */
	voice_brief(){
		const file = [this.repo, REPO].map(r => path.join(r, ".claude", "skills", "voice-assistant", "SKILL.md")).find(f => fs.existsSync(f));
		if (!file) throw new Error("the voice-assistant skill (.claude/skills/voice-assistant/SKILL.md) is missing");
		return fs.readFileSync(file, "utf8").replace(/^---[\s\S]*?\n---\s*/, "").trim();
	}

	/* The model one ROLE of one SESSION spawns on: the setting (`session_backend()`), unless
	 * this session's own `fallback` map already says Claude refused it (`woken()` above) —
	 * that always wins, session by session, until the pair is stopped for good. */
	session_model(s, role){
		const backend = s.fallback?.[role] ? "openrouter" : session_backend();
		if (backend === "openrouter") return FALLBACK_MODEL;
		if (backend === "local") return role === "fast" ? "local/qwen2.5-coder" : FALLBACK_MODEL;
		return this.claude_model(role);
	}

	claude_model(role){ return role === "fast" ? tier_model("fast") : Usage.over_pace(this.repo) ? tier_model("manager") : tier_model("voice_smart"); }

	/* OpenRouter usable right now? A key, and the spend guard (cached, never a network call here) says yes. */
	or_ready(){ try { return has_key() && spend_guard().ok; } catch { return false; } }

	/* Held open with no prompt: each one's first turn is the owner's first line. */
	spawn(s, role, { resume = null, context = "" } = {}){
		const where = `\n\nThis session is ${s.id}. Its home page is ${s.home}; the owner pressed ✦ on ${s.path}.`
			+ (role === "smart" ? `\n\nYour session's page (the item tool's \`path\`): ${path.posix.dirname(s.file)}/` : "")
			+ (!s.card ? "" : role === "fast" ? `\n\nThis session is about card ${s.card}.`
				: `\n\nThis session is about card ${s.card}. Its record is public${s.home}page.jsonl; read that file first for the card's history.`)
			+ (context ? `\n\nThis session ran before you; its last lines follow (the whole record is public${s.file}):\n${context}` : "");
		const voice = role === "fast" && this.voice_seat();
		const spec = voice ? {
			/* THE VOICE ASSISTANT in the fast seat: same lean process (no settings, no memory, no built-in tools) but WITH Servex's
			 * door, because its one job is the item tool (`mcp__local__item`). `name: s.id` makes Agents.name() mint
			 * `voice-assistant-<session>`; the id is then kept in `s.fast` and reused, so it never respawns per sentence. */
			role: "voice-assistant", name: s.id, model: this.session_model(s, "fast"), effort: "low", urgent: true,
			permission_mode: "bypassPermissions", cwd: this.repo, setting_sources: [],
			system: this.voice_brief() + where,
			env: { ENABLE_CLAUDEAI_MCP_SERVERS: "false", CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" },
			sdk: { tools: [] },
			parent: "sessions", parent_session: s.id
		} : role === "fast" ? {
			/* LEAN like the Layers page assistant: no settings, no connectors, no memory,
			 * no tools, and no Servex door (`mcp_url: ""`). Its brief is its whole system prompt. */
			role: "session-fast", name: s.id, model: this.session_model(s, "fast"), effort: "low", urgent: true,
			permission_mode: "bypassPermissions", cwd: this.repo, mcp_url: "", setting_sources: [],
			system: this.brief("fast") + where,
			/* TOP-LEVEL `env`, NEVER `sdk.env` — see Agents.js's `options()`/`door()` for why
			 * (review finding 1/2/8, dictate-without-claude, 2026-10-04: `sdk.env` used to let a
			 * caller silently replace the provider's own credentials instead of adding to them). */
			env: { ENABLE_CLAUDEAI_MCP_SERVERS: "false", CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" },
			sdk: { tools: [] },
			parent: "sessions", parent_session: s.id
		} : {
			/* The whole Claude Code preset (tools, CLAUDE.md, skills, Servex's MCP door), its brief appended. */
			role: "session-smart", name: s.id, model: this.session_model(s, "smart"), effort: "medium", urgent: true,
			permission_mode: "bypassPermissions", cwd: this.repo,
			/* LEAN (dictate-next-4): no user/project settings (CLAUDE.md, skills, memory), no claude.ai connectors; the brief is the prompt. */
			setting_sources: [], env: { ENABLE_CLAUDEAI_MCP_SERVERS: "false", CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" },
			system: { type: "preset", preset: "claude_code", append: this.brief("smart") + where },
			parent: "sessions", parent_session: s.id
		};
		const go = (sp, r) => this.servex.agents.spawn({ ...sp, ...(s[role] ? { id: s[role] } : {}), ...(r ? { resume: r } : {}) });
		try { return go(spec, resume); }
		catch (e){
			/* OpenRouter refused or is down: answer on Claude instead of going silent, and say so in the session. */
			if (!String(spec.model).includes("/") || !/openrouter/i.test(e.message) || session_backend() !== "auto") throw e;
			const model = this.claude_model(role);
			(s.backing_model ??= {})[role] = model;
			this.write(s, { chat: { at: now_ms(), session: s.id, path: s.path, from: { kind: "system", id: "servex" }, via: "text",
				text: `OpenRouter is unavailable (${e.message.slice(0, 120)}); the ${role} assistant answers on ${model} for now.` } });
			return go({ ...spec, model }, null);
		}
	}

	// ── sleep and wake ───────────────────────────────────────────────────────

	awake(s, role){
		const a = this.servex.agents.live.get(s[role]);
		return !!a && a.state !== "stopped";
	}

	/* Spawn one agent of the pair if it is not live: RESUME its Claude session when that
	 * session's file still exists AND it's still on the SAME model (review finding 6 —
	 * flipping the backend for a session that already has a Claude `backing` id must not
	 * resume that Claude session under an OpenRouter model); else start fresh, with the
	 * session file's last 40 lines as context whenever there IS a history to give it
	 * (review finding 3/4 — this used to skip the tail whenever `old` was falsy, which is
	 * exactly the case right after a fallback deliberately clears it). A new pair first
	 * makes room (max_pairs). Each spawn writes a `backing` line (the latest one wins). */
	wake(s, role){
		if (this.awake(s, role)) return false;
		if (!this.awake(s, "fast") && !this.awake(s, "smart")) this.room(s);
		const target_model = this.session_model(s, role);
		/* A change of WHO SITS in the fast seat (SERVEX_SESSION_ASSISTANT flipped across a restart): the old agent's id and Claude
		 * session belong to the other role, so drop both. The fresh voice agent gets a name from Agents.name(), plus the tail. */
		const seat = role === "fast" ? (this.voice_seat() ? "voice" : "fast") : null;
		const reseat = !!(seat && (s.fast || s.backing?.fast) && (s.fast_seat ?? "fast") !== seat);
		if (reseat){ s.fast = null; (s.backing ??= {}).fast = null; }
		const old = s.backing?.[role];
		/* Only a change of PROVIDER forces a fresh spawn (review finding 5): the default Claude
		 * path already switches `smart` between Opus and Sonnet on its own (`Usage.over_pace()`,
		 * weekly pace) — a Claude session id can resume under either, so that alone must not
		 * restart the agent fresh and lose its 40-line tail. Only Claude <-> OpenRouter/local
		 * (or OpenRouter <-> local) actually can't resume. */
		const same_claude_family = m => String(m).startsWith("claude");
		const model_changed = s.backing_model?.[role] && s.backing_model[role] !== target_model
			&& !(same_claude_family(s.backing_model[role]) && same_claude_family(target_model));
		const can = !!(old && !model_changed && session_facts(old).cwd);
		const how = can ? "resume" : old ? "fresh" : "new";
		/* A tail only when there's actual history to hand over — `old` (abandoning a real
		 * Claude session) or `fallback` (review finding 7: both get nulled by `woken()` before
		 * this runs, so `old` alone would miss the fallback case). A true brand-new session has
		 * no tail: the owner's first line is about to be sent as the real prompt by `say()`
		 * right after this returns, and a tail that already quoted it would show it twice. */
		const give_context = old || s.fallback?.[role] || reseat;
		let agent;
		try { agent = this.spawn(s, role, can ? { resume: old } : { context: give_context ? this.tail(s, 40) : "" }); }
		catch (e){ this.sleep(s, "failed revive"); throw e; }
		s[role] = agent.id;
		if (seat) s.fast_seat = seat;
		this.by_agent.set(agent.id, { id: s.id, role });
		(s.backing ??= {})[role] = agent.session_id ?? null;
		(s.backing_model ??= {})[role] = agent.model ?? target_model;
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
		/* The voice assistant answers with a {place} line (item tool), never in chat: whatever text its turn ends on is dropped. */
		if (who.role === "fast" && s.fast_seat === "voice") return;
		let text = String(event.text ?? agent.last_text ?? "").trim();
		if (!text) return;
		const re = s[`${who.role}_re`];
		/* A NEW PARAGRAPH (one-dictation, the `para` marker, merge 9): the fast assistant decided
		 * the thought it just heard starts a new topic, not a continuation of the one before it
		 * (`session-fast.md`'s own rule). `(new paragraph)` at the very start of its reply is
		 * stripped off here and written as an invisible `{para: {at, re}}` marker instead — `re` is
		 * the `at` of the FIRST owner line of that thought (`s.fast_thought_at`, stamped wherever a
		 * thought is sent to the fast assistant, above). Never a bubble itself: same category as
		 * `nav`/`pause`/`select` (`ext/Session/doc/markers.md`) — `ext/Session/Session.js`'s
		 * `entry()` passes it through for `ux/Dictate/Widget.js`'s `Thread` to act on, splitting
		 * that paragraph (and everything merged in after it) into a new bubble of its own. Whatever
		 * text is left after the marker (usually nothing) falls straight through to the filler
		 * check below, same as any other fast reply. */
		if (who.role === "fast" && NEW_PARAGRAPH.test(text)){
			this.write(s, { para: { at: now_ms(), re: s.fast_thought_at ?? re } });
			text = text.replace(NEW_PARAGRAPH, "").trim();
		}
		/* NO FILLER (the owner, 2026-09-30: "you don't need to say, keep going, I'm listening, noted...
		 * most of the time just listening"): the fast one's `(listening)`, or a filler line, is kept
		 * as an invisible `{skip}` line and never drawn. */
		/* ADDRESSED BY NAME ONLY (the owner, requirements-5 ask 2): the fast one replies only when the sentence it heard says "fast". */
		if (who.role === "fast" && !is_filler(text) && !FAST_NAMED.test(s.fast_heard ?? "")) return this.write(s, { skip: { at: now_ms(), role: who.role, text, why: "not addressed", ...(re ? { re } : {}) } });
		if (who.role === "fast" && is_filler(text)) return this.write(s, { skip: { at: now_ms(), role: who.role, text, ...(re ? { re } : {}) } });
		const from = { kind: "assistant", id: who.role, agent: agent.id };
		// An answer to a threaded owner line goes into the same thread.
		const threaded = re && s.threaded?.includes(re) ? { thread: true } : {};
		const line = () => LONE_EMOJI.test(text) && re
			? { react: { at: now_ms(), session: s.id, re, emoji: text, from } }
			: { chat: { at: now_ms(), session: s.id, path: s.path, from, via: "text", text, ...(re ? { re } : {}), ...threaded } };
		if (who.role === "smart"){
			s.smart_said_re = re ?? now_ms();
			const written = this.write(s, line());
			this.reply_closes_prompt(s);
			return written;
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
			try { this.write(s, line()); this.reply_closes_prompt(s); } catch (e){ console.error(`sessions: ${e.message}`); }
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
		for (const [verb, fn] of [["new", "create"], ["say", "say"], ["nav", "nav"], ["resume", "resume"], ["floor", "floor"], ["quiet", "quiet"], ["react", "react"], ["pause", "pause"], ["select", "select"], ["settings", "settings"]]){
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

/* The fast assistant's "this is a new topic" marker (`session-fast.md`): always the first
 * thing in its reply, stripped off by `heard()` above before anything else reads the text. */
const NEW_PARAGRAPH = /^\(new paragraph\)\s*/i;

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
