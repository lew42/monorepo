import { View, button } from "../../core/View/View.js";
import Widget from "./Widget.js";
import floor from "./floor.js";
import * as Session from "/framework/ext/Session/Session.js";
import DictateHealth from "./DictateHealth.js";
import * as report from "/framework/ext/Chat/v2/report.js";

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
	catch {}   // ignored on purpose: sessionStorage is off (private mode), so the session is just not remembered across a reload
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
		Session.nav({ session: ctl.session, from, to: path, card }).catch(e => quiet_note("the page change was not reported to the session", e));
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
			Session.floor({ session, floor: "done" }).catch(e => quiet_note("the floor change was not reported", e));
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
// A failure that loses nothing you said (a page change, a selection, the resume offer): a log line, no red light, so it cannot hide a real fault.
const quiet_note = (what, e) => DictateHealth.event("page", "wait", `${what}: ${e?.message ?? e}`, { error: String(e?.message ?? e), stack: e?.stack ?? null });
const secs = ms => (ms / 1000).toFixed(1) + " s";
let sent_at = 0;   // when the last sentence went out: the AI row times its answer from here
// The timing of each step (doc/flicker.md): the words were on screen at `t.out`, left for Servex after the clean-up and queue wait, Servex took them.
function health_sent(text, t){
	sent_at = Date.now();
	const timing = t ? `; on screen at once, sent ${secs(t.wait)} later (clean-up and queue), Servex took it in ${secs(t.say)}` : "";
	DictateHealth.set("sent", "ok", `sent ${quote(text)} at ${new Date().toLocaleTimeString()}${timing}`, { raw: { text, timing: t ?? null } });
	DictateHealth.set("llm", "wait", `waiting for an answer to ${quote(text)}`, { late_ms: ANSWER_MS,
		late: `no answer ${ANSWER_MS / 1000} s after ${quote(text)}: Servex took the sentence, but no assistant has written back. They may be asleep, busy or crashed: open the session log from the Debug tab.` });
}
function health_answer(line){
	const after = sent_at ? `, ${secs(Date.now() - sent_at)} after the send` : "";
	DictateHealth.set("llm", "ok", `${line.chat?.from?.id ?? "the assistant"} answered ${quote(line.chat?.text)}${after}`, { raw: line, always: true });
}

// Module-level GLOBAL: one per browser tab (ES module singleton)
const GLOBAL = create_controller({ persist: true });

// ONE on-screen selection per tab, on GLOBAL controller only
window.addEventListener("selection-change", e => {
	GLOBAL.ctl.selection = e.detail ?? null;
	if (GLOBAL.ctl.session) Session.select({ session: GLOBAL.ctl.session, selection: GLOBAL.ctl.selection }).catch(e => quiet_note("the selection was not reported", e));
});

Session.report_quiet(() => GLOBAL.ctl.session);
Session.report_pause(() => GLOBAL.ctl.session);

// One chat box per mount, wired to global or per-mount session: doc/chat-notes.md
export default function chat(el, { path = location.pathname, card, placeholder, keep = true, level, source, debug, revision, models, mode = "dictate" } = {}){
	const target = { path, card };
	const owner = keep ? GLOBAL : create_controller({ persist: false });
	let panel, pushed_for = null, stop_watch = null, stop_stream = null, own_ats = new Set(), watching = "unset";
	let resume_label = null, resume_session = null, watching_since = null, wire_timer = null, link_why = null;
	let link = { state: "open" };   // the live wire to Servex: "open" | "down" {why, since}, down only past WIRE_GRACE_MS; the sheet's Reconnect button shows it
	const on_link = new Set();
	// Duplicate-draw fix: both watch() and stream() call draw(); dedupe by line: doc/chat-notes.md
	let seen_chat = new Set();
	// In-flight echo: stream pushes owner's line before say() resolves
	const sending = [];
	const flat = t => String(t ?? "").replace(/\s+/g, " ").trim();

	new View({ el, capture: false }).append(() => {
		panel = new Widget({
			placeholder, level, source, debug, revision, models, mode,
			session: () => owner.ctl.session,
			marks: true,
			deliver: async entry => {
				try {
					DictateHealth.set("sent", "wait", `sending ${quote(entry.text)}…`);
					owner.sync_from_storage();
					await owner.ensure(target);
					if (!owner.ctl.session){ DictateHealth.fail("sent", new Error(`Servex did not start a voice session for ${target.path}`), "not sent"); return false; }
					if (pushed_for !== owner.ctl.session){ pushed_for = owner.ctl.session; panel.dictate?.push_wake?.().catch(e => quiet_note("the smart assistant's batch settings were not sent", e)); }   // the saved batch knobs reach each new session once
					const via = entry.via === "typed" ? "text" : "voice";
					floor.stamp(entry);
					const thread = entry.thread ? { re: entry.thread, thread: true } : {};
					const mine = { text: flat(entry.text), at: entry.at }; sending.push(mine);
					let r;
					const t_say = Date.now(), t_out = Date.parse(entry.at) || t_say;
					try {
						r = await Session.say({ session: owner.ctl.session, path: target.path, text: entry.text, said_at: entry.at,
							via, raw: entry.raw, floor: entry.floor, cues: entry.cues, selection: owner.ctl.selection, ...thread });
					} catch (e){
						// Its line already came back (the poll or the live wire): it WAS sent, only the answer to the POST was slow.
						if (mine.echoed && /did not answer/.test(e?.message ?? "")){ health_sent(entry.text); return true; }
						// Timed out is not refused: Servex may still write the line. Keep watching for its echo, which heals the bubble
						// ("not sent" off, no second copy) instead of drawing the sentence twice (Session.POST_MS, doc/debug-tab.md).
						if (/did not answer/.test(e?.message ?? "")){ mine.late = true; setTimeout(() => { const i = sending.indexOf(mine); if (i >= 0) sending.splice(i, 1); }, LATE_ECHO_MS); }
						throw e;
					} finally { if (!mine.late){ const i = sending.indexOf(mine); if (i >= 0) sending.splice(i, 1); } }
					own_ats.add(r.at);
					panel.retag(entry.at, r.at);
					if (entry.floor === "speaking") owner.watch_floor();
					health_sent(entry.text, { wait: Math.max(0, t_say - t_out), say: Date.now() - t_say });
					return true;
				} catch (e) {
					Session.stream.log("say failed", { session: owner.ctl.session, error: String(e?.message ?? e) });
					DictateHealth.fail("sent", e, `not sent ${quote(entry.text)}`);
					return false;
				}
			},
			answer: choice => {
				if (choice === resume_label) owner.resume_to(resume_session).catch(e => DictateHealth.fail("page", e, "resuming the last conversation"));
			},
			react: r => owner.ctl.session
				? Session.react({ session: owner.ctl.session, ...r })
				: Promise.reject(new Error("no voice session yet, so the reaction is not saved")),
		});
	});

	// Drawing one line must never stop the lines after it: a throw lands on the Page light, with the raw error.
	function draw(line){
		try { draw_line(line); } catch (e){ DictateHealth.fail("page", e, "drawing a session line"); }
	}
	function draw_line(line){
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
			echo.echoed = true;   // a timeout after this is a slow answer, not a lost send (deliver's catch)
			if (echo.late){   // the send timed out but Servex took it after all: one bubble, marked sent
				sending.splice(sending.indexOf(echo), 1);
				panel.$thread?.mark_sent?.(line.chat.at);
				DictateHealth.set("sent", "ok", `sent late: Servex took ${quote(line.chat.text)} after the ${Session.POST_MS / 1000} s limit (its words are also in the fallback log)`, { raw: line, always: true });
			}
			return;
		}
		if (own_ats.has(line.chat.at) && panel.$thread?.lines?.has(line.chat.at)) return;   // own line still drawn; a session start's reset() may have wiped it
		const key = line.chat.at + (line.chat.fix ? "|fix|" + line.chat.text : "");
		if (seen_chat.has(key)) return;
		seen_chat.add(key);
		panel.say({ chat: line.chat, history: watching_since != null && Date.parse(line.chat.at) < watching_since });   // history: drawn, never re-marked
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
		}).catch(e => quiet_note("could not look up the last conversation to offer", e));
	}

	// Cold reload fix: every session appearance redraws from line 0: doc/chat-notes.md
	function attach(){
		owner.sync_from_storage();
		if (owner.ctl.session === watching) return;
		const was = watching;
		watching = owner.ctl.session;
		stop_watch?.(); stop_watch = null;
		stop_stream?.(); stop_stream = null;
		clearTimeout(wire_timer); wire_timer = null; link_why = null;
		if (link.state !== "open") set_link({ state: "open" });   // a new session's wire starts fresh
		own_ats = new Set();
		seen_chat = new Set();
		// No session → the one this mount's first sentence just started: keep the screen. Only the owner's own lines are on it, and
		// wiping them lost a sentence whose send then failed (stall.mjs "refuse"); the file replay that follows is deduped by `at`.
		if (!(was === null && watching)) panel.reset();
		if (!owner.ctl.session){ maybe_offer(); return; }
		watching_since = Date.now();   // lines older than this are history, not an answer just now
		report.init(owner.ctl.session);   // the page's own errors reach the assistants too (ext/Chat/v2/report.js): a log line, never a wake-up
		stop_watch = Session.watch(owner.ctl.file, draw, { on_history: lines => panel.$thread?.hold_history?.(lines, draw), on_status: (kind, d) => {
			// The poll reads the session file every 1.5 s; its trouble is the Wire light's, so a dead file cannot pass for "no answer yet".
			if (kind === "poll_failed") DictateHealth.set("wire", "bad", `poll of the session log failed: ${d.error?.message ?? d.error}`, { always: true, raw: { error: String(d.error?.message ?? d.error), status: d.status ?? null, file: owner.ctl.file } });
			else if (kind === "poll_ok") DictateHealth.set("wire", "ok", "polling the session log works again", { always: true, raw: { status: d.status } });
			else if (kind === "bad_line") DictateHealth.fail("wire", d.error, `line ${d.n} of the session log is not JSON`);
			else if (kind === "line_failed") DictateHealth.fail("page", d.error, `drawing line ${d.n} of the session log`);
		} });
		stop_stream = Session.stream(owner.ctl.session, ev => {
			if (ev.kind === "stream"){ panel.stream(ev.role, ev.text); if (ev.text) DictateHealth.set("llm", "ok", `${ev.role} is writing an answer…`, { quiet: true }); }
			else if (ev.kind === "line") draw(ev.line);
		}, { on_state: (s, why, { since } = {}) => {
			// The noise rule: the LAN proxy cuts the wire every 30 s and it is back in a second, so a drop counts
			// (a red row, the Reconnect button) only once it has lasted WIRE_GRACE_MS. Shorter: one event line.
			if (s === "down"){
				if (link.state === "down"){ set_link({ ...link, why }); return; }   // still down: a retry failed, keep the first `since`
				link_why = why;
				if (wire_timer) return;   // already counting this drop
				DictateHealth.event("wire", "wait", `the live wire to Servex dropped (${why}). It reconnects by itself.`);
				wire_timer = setTimeout(() => {
					wire_timer = null;
					set_link({ state: "down", why: link_why ?? why, since: since || Date.now() });
					DictateHealth.set("wire", "bad", `the live wire to Servex is down: ${link_why ?? why}. It retries by itself (1 s, doubling to 15 s); Reconnect tries now.`);
				}, WIRE_GRACE_MS);
				return;
			}
			clearTimeout(wire_timer); wire_timer = null; link_why = null;
			if (link.state !== "open") set_link({ state: "open" });
			if (DictateHealth.layers.wire.state === "idle" || DictateHealth.layers.wire.why.startsWith("the live wire")) DictateHealth.set("wire", "ok", "the live wire to Servex is open");
		} });
	}
	function set_link(next){ link = next; for (const fn of on_link) try { fn(link); } catch (e){ console.error("chat on_link:", e); } }

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
		/** The Reconnect button: reopen the live wire now (it also retries by itself, 1 s doubling to 15 s). Never throws; false = nothing to do. */
		reconnect(){ try { return !!stop_stream?.reconnect?.(); } catch (e){ console.error("chat reconnect:", e); return false; } },
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
