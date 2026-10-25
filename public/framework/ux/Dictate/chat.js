import { View, button } from "../../core/View/View.js";
import Widget from "./Widget.js";
import floor from "./floor.js";
import * as Session from "/framework/ext/Session/Session.js";
import DictateHealth from "./DictateHealth.js";

// One chat box, every surface: doc/chat-notes.md
const SESSION_KEY = "lew42-voice-session";
const RESUME_OFFER_MS = 60 * 60 * 1000;

// THE one copy (review fix #9): reused, not duplicated in rail.js/sessions.js
function ago(at){
	const ms = Date.now() - Date.parse(at ?? 0);
	if (!Number.isFinite(ms) || ms < 0) return "";
	const mins = Math.round(ms / 60000);
	if (mins < 60) return mins <= 1 ? "just now" : mins + " minutes ago";
	const hours = Math.round(mins / 60);
	if (hours < 24) return hours === 1 ? "1 hour ago" : hours + " hours ago";
	const days = Math.round(hours / 24);
	return days === 1 ? "1 day ago" : days + " days ago";
}

function read_saved(){
	try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
	catch { return null; }
}
function write_saved(v){
	try { v ? sessionStorage.setItem(SESSION_KEY, JSON.stringify(v)) : sessionStorage.removeItem(SESSION_KEY); }
	catch {}
}

// Controller factory: doc/chat-notes.md. Built GLOBAL (per-tab) or per-mount
function create_controller({ persist }){
	const ctl = {
		session: null,
		file: null,
		fresh: false,     // true after New session until the next session starts: Session.start({fresh})
		starting: null,   // a pending Session.start() promise — two mounts' first sentence at once share ONE session
		nav_path: null,   // the path last actually reported to the session (report_nav's own dedupe)
		nav_card: null,   // the card last actually reported alongside it (item 1, one-dictation)
		selection: null,  // the reader's last picked element, `{kind, label, text, selector}` or null (item 6) — GLOBAL only, see below
	};

	function sync_from_storage(){
		if (!persist || ctl.session) return;
		const saved = read_saved();
		if (saved?.session && saved?.file){ ctl.session = saved.session; ctl.file = saved.file; }
		else if (saved?.fresh) ctl.fresh = true;   // New session was pressed (this tab, maybe before a reload)
	}
	sync_from_storage();

	const listeners = new Set();
	function subscribe(fn){ listeners.add(fn); return () => listeners.delete(fn); }
	function broadcast(){ for (const fn of listeners) fn(); }

	// ONE nav report, deduped; card travels with it for refinement attribution
	function report_nav(path, card){
		if (!ctl.session){ ctl.nav_path = path; ctl.nav_card = card; return; }
		if (path === ctl.nav_path && card === ctl.nav_card) return;
		const from = ctl.nav_path;
		ctl.nav_path = path; ctl.nav_card = card;
		Session.nav({ session: ctl.session, from, to: path, card }).catch(() => {});
	}

	// First sentence starts (or resumes) the one session until reset
	async function ensure(target){
		sync_from_storage();
		if (ctl.session) return;
		if (!ctl.starting){
			// fresh: after New session, never resume the last hour's session on this page (doc/chat.md#new-session-and-the-mic-indicator)
			ctl.starting = Session.start({ path: target.path, card: target.card, fresh: ctl.fresh }).then(made => {
				ctl.session = made.session; ctl.file = made.file; ctl.fresh = false;
				if (persist) write_saved({ session: made.session, file: made.file });
				broadcast();
			}).finally(() => { ctl.starting = null; });
		}
		return ctl.starting;
	}

	let floor_watch = null;
	function watch_floor(){
		clearInterval(floor_watch);
		const session = ctl.session, started = Date.now();
		floor_watch = setInterval(() => {
			if (session !== ctl.session || Date.now() - started > 30000) return clearInterval(floor_watch);
			if (floor.state() !== "done") return;
			clearInterval(floor_watch);
			Session.floor({ session, floor: "done" }).catch(() => {});
		}, 250);
	}

	async function resume_to(session){
		const made = await Session.resume(session);
		ctl.session = made.session; ctl.file = made.file;
		if (persist) write_saved({ session: made.session, file: made.file });
		broadcast();
	}

	function reset(){
		ctl.session = null; ctl.file = null; ctl.starting = null; ctl.fresh = true;
		if (persist) write_saved({ fresh: true });   // a keep:false demo must not overwrite the global key
		broadcast();
	}

	function current(){ return ctl.session; }

	return { ctl, persist, subscribe, broadcast, report_nav, ensure, watch_floor, resume_to, reset, current, sync_from_storage };
}

// The Debug tab's two last layers (DictateHealth.js): the send to Servex, and the AI's answer.
const quote = t => "“" + (String(t ?? "").replace(/\s+/g, " ").trim().slice(0, 60) || "…") + "”";
export const ANSWER_MS = 60000;   // no answer this long after a sentence went out turns the AI layer red
export const LATE_ECHO_MS = 120000;   // after a timed-out send, how long its late echo still heals the bubble instead of drawing a copy
export const WIRE_GRACE_MS = 8000;   // a live-wire drop shorter than this is only an event, not a red row
function health_sent(text){
	DictateHealth.set("sent", "ok", `sent ${quote(text)} at ${new Date().toLocaleTimeString()}`);
	DictateHealth.set("llm", "wait", `waiting for an answer to ${quote(text)}`, { late_ms: ANSWER_MS,
		late: `no answer ${ANSWER_MS / 1000} s after ${quote(text)}: Servex took the sentence, but no assistant has written back. They may be asleep, busy or crashed: open the session log from the Debug tab.` });
}
function health_answer(line){
	DictateHealth.set("llm", "ok", `${line.chat?.from?.id ?? "the assistant"} answered ${quote(line.chat?.text)}`);
}

// Module-level GLOBAL: one per browser tab (ES module singleton)
const GLOBAL = create_controller({ persist: true });

// ONE on-screen selection per tab, on GLOBAL controller only
window.addEventListener("selection-change", e => {
	GLOBAL.ctl.selection = e.detail ?? null;
	if (GLOBAL.ctl.session) Session.select({ session: GLOBAL.ctl.session, selection: GLOBAL.ctl.selection }).catch(() => {});
});

Session.report_quiet(() => GLOBAL.ctl.session);
Session.report_pause(() => GLOBAL.ctl.session);

// One chat box per mount, wired to global or per-mount session: doc/chat-notes.md
export default function chat(el, { path = location.pathname, card, placeholder, keep = true, level, source, debug, revision, models, mode = "dictate" } = {}){
	const target = { path, card };
	const owner = keep ? GLOBAL : create_controller({ persist: false });
	let panel, stop_watch = null, stop_stream = null, own_ats = new Set(), watching = "unset";
	let resume_label = null, resume_session = null, watching_since = null, wire_timer = null;
	let link = { state: "open" };   // the live wire to Servex: "open" | "down" (Session.stream's on_state); the sheet's Reconnect button shows it
	const on_link = new Set();
	// Duplicate-draw fix: both watch() and stream() call draw(); dedupe by line: doc/chat-notes.md
	let seen_chat = new Set();
	// In-flight echo: stream pushes owner's line before say() resolves
	const sending = [];
	const flat = t => String(t ?? "").replace(/\s+/g, " ").trim();

	new View({ el, capture: false }).append(() => {
		panel = new Widget({
			placeholder, level, source, debug, revision, models, mode,
			marks: true,
			deliver: async entry => {
				try {
					DictateHealth.set("sent", "wait", `sending ${quote(entry.text)}…`);
					owner.sync_from_storage();
					await owner.ensure(target);
					if (!owner.ctl.session){ DictateHealth.set("sent", "bad", `not sent: Servex did not start a voice session for ${target.path}`); return false; }
					const via = entry.via === "typed" ? "text" : "voice";
					floor.stamp(entry);
					const thread = entry.thread ? { re: entry.thread, thread: true } : {};
					const mine = { text: flat(entry.text), at: entry.at }; sending.push(mine);
					let r;
					try {
						r = await Session.say({ session: owner.ctl.session, path: target.path, text: entry.text,
							via, raw: entry.raw, floor: entry.floor, cues: entry.cues, selection: owner.ctl.selection, ...thread });
					} catch (e){
						// Timed out is not refused: Servex may still write the line. Keep watching for its echo, which heals the bubble
						// ("not sent" off, no second copy) instead of drawing the sentence twice (Session.POST_MS, doc/debug-tab.md).
						if (/did not answer/.test(e?.message ?? "")){ mine.late = true; setTimeout(() => { const i = sending.indexOf(mine); if (i >= 0) sending.splice(i, 1); }, LATE_ECHO_MS); }
						throw e;
					} finally { if (!mine.late){ const i = sending.indexOf(mine); if (i >= 0) sending.splice(i, 1); } }
					own_ats.add(r.at);
					panel.retag(entry.at, r.at);
					if (entry.floor === "speaking") owner.watch_floor();
					health_sent(entry.text);
					return true;
				} catch (e) {
					Session.stream.log("say failed", { session: owner.ctl.session, error: String(e?.message ?? e) });
					DictateHealth.set("sent", "bad", `not sent ${quote(entry.text)}: ${e?.message ?? e}`);
					return false;
				}
			},
			answer: choice => {
				if (choice === resume_label) owner.resume_to(resume_session).catch(() => {});
			},
			react: r => owner.ctl.session
				? Session.react({ session: owner.ctl.session, ...r })
				: Promise.reject(new Error("no voice session yet, so the reaction is not saved")),
		});
	});

	function draw(line){
		if (line?.react) return void panel.say({ react: line.react });
		if (line?.para) return void panel.say({ para: line.para });
		if (line?.place) return void panel.say({ place: line.place });   // the voice assistant's placement (doc/voice-assistant.md)
		if (line?.summary) return void panel.say({ summary: line.summary });   // a card's summary swallows its raw lines (doc/voice-assistant.md#raw-and-refined)
		if (line?.refined) return void panel.say(Session.entry(line));
		if (!line?.chat) return;
		if (line.chat.from?.kind === "assistant" && Date.parse(line.chat.at) > (watching_since ?? 0)) health_answer(line);   // as times, never as text: Servex writes "…-05:00", the browser "…Z"
		const echo = line.chat.from?.kind === "owner" && sending.find(m => m.text === flat(line.chat.text) && panel.$thread?.lines?.has(m.at));
		if (echo){
			own_ats.add(line.chat.at); panel.retag(echo.at, line.chat.at);
			if (echo.late){   // the send timed out but Servex took it after all: one bubble, marked sent
				sending.splice(sending.indexOf(echo), 1);
				panel.$thread?.mark_sent?.(line.chat.at);
				DictateHealth.set("sent", "ok", `sent late: Servex took ${quote(line.chat.text)} after the ${Session.POST_MS / 1000} s limit (its words are also in the fallback log)`);
			}
			return;
		}
		if (own_ats.has(line.chat.at) && panel.$thread?.lines?.has(line.chat.at)) return;   // own line still drawn; a session start's reset() may have wiped it
		const key = line.chat.at + (line.chat.fix ? "|fix|" + line.chat.text : "");
		if (seen_chat.has(key)) return;
		seen_chat.add(key);
		panel.say({ chat: line.chat });
	}

	function maybe_offer(){
		if (!keep || owner.ctl.fresh) return;   // New session was pressed: do not offer the old one back
		Session.recent(target.path, { limit: 1 }).then(([row]) => {
			if (!row || owner.ctl.session) return;
			const at = row.at ?? row.last_at;
			if (Date.now() - Date.parse(at ?? 0) < RESUME_OFFER_MS) return;
			resume_label = `${row.title ?? "The last conversation"} · ${ago(at)}`;
			resume_session = row.session;
			panel.say({ type: "ask", heading: "Pick up where you left off?", choices: [resume_label], at: new Date().toISOString() });
		}).catch(() => {});
	}

	// Cold reload fix: every session appearance redraws from line 0: doc/chat-notes.md
	function attach(){
		owner.sync_from_storage();
		if (owner.ctl.session === watching) return;
		const was = watching;
		watching = owner.ctl.session;
		stop_watch?.(); stop_watch = null;
		stop_stream?.(); stop_stream = null;
		own_ats = new Set();
		seen_chat = new Set();
		// No session → the one this mount's first sentence just started: keep the screen. Only the owner's own lines are on it, and
		// wiping them lost a sentence whose send then failed (stall.mjs "refuse"); the file replay that follows is deduped by `at`.
		if (!(was === null && watching)) panel.reset();
		if (!owner.ctl.session){ maybe_offer(); return; }
		stop_watch = Session.watch(owner.ctl.file, draw);
		watching_since = Date.now();   // lines older than this are history, not an answer just now
		stop_stream = Session.stream(owner.ctl.session, ev => {
			if (ev.kind === "stream"){ panel.stream(ev.role, ev.text); if (ev.text) DictateHealth.set("llm", "ok", `${ev.role} is writing an answer…`, { quiet: true }); }
			else if (ev.kind === "line") draw(ev.line);
		}, { on_state: (s, why) => {
			link = { state: s, why }; for (const fn of on_link) fn(link);
			// The noise rule: the LAN proxy cuts the wire every 30 s and it is back in a second, so a drop is a failure only if it lasts WIRE_GRACE_MS.
			clearTimeout(wire_timer);
			if (s === "down"){
				DictateHealth.event("llm", "wait", `the live wire to Servex dropped (${why}); reconnecting`);
				wire_timer = setTimeout(() => DictateHealth.set("llm", "bad", `the live wire to Servex is down: ${why}. It retries by itself (1 s, doubling to 15 s); Reconnect tries now.`), WIRE_GRACE_MS);
			} else if (DictateHealth.layers.llm.state === "idle" || DictateHealth.layers.llm.why.startsWith("the live wire")) DictateHealth.set("llm", "ok", "connected to Servex; nothing asked yet");
		} });
	}

	attach();
	owner.report_nav(target.path, target.card);
	const unsubscribe = owner.subscribe(attach);

	return {
		panel,
		session: () => owner.ctl.session,
		nav(path, card){ target.path = path; if (card !== undefined) target.card = card; owner.report_nav(path, target.card); },
		file: () => owner.ctl.file,
		link: () => link,
		on_link(fn){ on_link.add(fn); fn(link); return () => on_link.delete(fn); },
		/** The Reconnect button: reopen the live wire now (it also retries by itself, 1 s doubling to 15 s). */
		reconnect(){ stop_stream?.reconnect?.(); },
		reset(){ owner.reset(); },
		remove(){
			unsubscribe();
			stop_watch?.(); stop_watch = null;
			stop_stream?.(); stop_stream = null;
		},
	};
}

// Shared button: one for all surfaces; one code path for keep:true/false
export function new_session_button(mount, { label = "New session", title = "Clear this chat and start a fresh conversation" } = {}){
	return button.c("ux-dictate-chat-new-session", label).attr("type", "button")
		.attr("title", title)
		.click(() => (typeof mount === "function" ? mount() : mount)?.reset());
}

chat.current = () => GLOBAL.current();
chat.file = () => GLOBAL.ctl.file;
chat.resume = session => GLOBAL.resume_to(session);
chat.reset = () => GLOBAL.reset();
chat.ago = ago;
chat.new_session_button = new_session_button;
// Notified when GLOBAL session changes (start/resume/reset)
chat.on_change = fn => GLOBAL.subscribe(fn);

// Reused by drawer; no longer duplicated
export { ago };
export const current = chat.current;
export const resume = chat.resume;
export const reset = chat.reset;
