import View from "../../core/View/View.js";
import Widget from "./Widget.js";
import floor from "./floor.js";
import * as Session from "/framework/ext/Session/Session.js";

/**
 * ONE chat box, one conversation, every surface. `chat(el, {path, card, placeholder})`
 * draws a `Widget` into `el` and wires it to the global voice session
 * (`ext/Session/Session.js`). Every caller — the ✦ sheet, the ☰ drawer's AI tab, a
 * card's sidebar — calls this one function; none of them hold their own session logic.
 * The call, why a reopened chat never loses old messages, `nav(path, card)`'s exact
 * rules, and every older version still kept reachable:
 * [`doc/chat.md`](/framework/ux/Dictate/doc/chat/).
 */

// The font fix for a drawer mounted before `.app` exists lives in `ext/drawer/drawer.js`
// now, not here — see `doc/chat.md`.
const SESSION_KEY = "lew42-voice-session";
const RESUME_OFFER_MS = 60 * 60 * 1000;   // matches Servex's own SERVEX_SESSION_RESUME_MS default

// A rough "how long ago" — "1 day ago", never a bare timestamp. THE one copy (review
// fix #9, 2026-09-30): `ext/drawer/rail.js` and `ext/drawer/tabs/sessions.js` used to
// each carry their own identical copy of this function — both now import it from here.
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

/* THE CONTROLLER — one per browser tab, module-level (ES modules are singletons, so
 * every importer of this file shares this one object). `session`/`file` are read from
 * `sessionStorage` lazily, not just once at import time: a proof script (or a caller)
 * can seed that key AFTER this module has already loaded, and `sync_from_storage()`
 * (called at the top of every mount and every send) re-checks it as long as no session
 * is known yet, so a late-seeded key is still picked up on the very next open. */
const ctl = {
	session: null,
	file: null,
	starting: null,   // a pending Session.start() promise — two mounts' first sentence at once share ONE session
	nav_path: null,   // the path last actually reported to the session (report_nav's own dedupe)
	nav_card: null,   // the card last actually reported alongside it (item 1, one-dictation)
	selection: null,  // the reader's last picked element, `{kind, label, text, selector}` or null (item 6)
};
sync_from_storage();

function sync_from_storage(){
	if (ctl.session) return;
	const saved = read_saved();
	if (saved?.session && saved?.file){ ctl.session = saved.session; ctl.file = saved.file; }
}

// Every live mount's own re-sync — called whenever the controller's session changes
// (a first start, a resume, a reset), so EVERY open mount notices, not just the one
// that caused the change.
const listeners = new Set();
function subscribe(fn){ listeners.add(fn); return () => listeners.delete(fn); }
function broadcast(){ for (const fn of listeners) fn(); }

// The ONE real navigation report, whoever calls it — deduped against `ctl.nav_path` so
// the rail's own `navigated()` hook AND a fresh mount noticing a new path never both
// send the same move twice ("A route change… sends Session.nav() once, from the
// controller, not per mount" — this task's own brief). `card` (item 1, one-dictation) is
// the card selected right now, or undefined for none — it travels with every nav report
// so a refinement written later can be attributed to the right card even after the owner
// has since moved on (`doc/sessions.md`'s "Refinement goes to the card selected at the
// time"; `Servex/agents/Sessions.js`'s `nav()` + `card_at()` do the actual attribution).
function report_nav(path, card){
	if (!ctl.session){ ctl.nav_path = path; ctl.nav_card = card; return; }
	if (path === ctl.nav_path && card === ctl.nav_card) return;
	const from = ctl.nav_path;
	ctl.nav_path = path; ctl.nav_card = card;
	Session.nav({ session: ctl.session, from, to: path, card }).catch(() => {});
}

// THE PAGE SELECTION (item 6, one-dictation: task-mastermind-selection's own
// `ext/drawer/select.js`, `selection-change` on `window`, detail `{kind, label, text,
// selector, url}` or null). That file is still mid-merge elsewhere, so this never imports
// it — it only listens for the plain DOM event any version of it can dispatch. Kept at
// the controller level, not per mount, since one browser tab has only one selection.
// Reported the moment it changes (an invisible `select` line, same shape `nav` takes)
// AND kept on `ctl.selection` so the next `say()` can stamp it onto that sentence too.
window.addEventListener("selection-change", e => {
	ctl.selection = e.detail ?? null;
	if (ctl.session) Session.select({ session: ctl.session, selection: ctl.selection }).catch(() => {});
});

// The first sentence, from ANY mount, starts (or silently resumes, inside `Session.
// start()` itself) the one session this browser tab will ever use until a reset.
async function ensure(target){
	sync_from_storage();
	if (ctl.session) return;
	if (!ctl.starting){
		ctl.starting = Session.start({ path: target.path, card: target.card }).then(made => {
			ctl.session = made.session; ctl.file = made.file;
			write_saved({ session: made.session, file: made.file });
			broadcast();
		}).finally(() => { ctl.starting = null; });
	}
	return ctl.starting;
}

// The mic held a sentence back while the owner kept talking (`entry.floor ===
// "speaking"`) — watch the mic's OWN floor state until it settles, then say so once, so
// the fast assistant's held reply lands. One watcher for the whole tab, not one per
// mount: a second sentence, from any mount, just restarts the same 30s window.
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

// Continue an OLDER session by id — the resume-offer's own "yes", and `tabs/sessions.js`'s
// click on a past voice session. Every open mount hears about it through `broadcast()`.
async function resume_to(session){
	const made = await Session.resume(session);
	ctl.session = made.session; ctl.file = made.file;
	write_saved({ session: made.session, file: made.file });
	broadcast();
}

// "New session" — drops the tab's own saved session id; the NEXT sentence said, from
// whichever mount it comes from, starts a fresh one. Every open mount clears its own
// thread together, because there is only the one conversation now.
function reset(){
	ctl.session = null; ctl.file = null; ctl.starting = null;
	write_saved(null);
	broadcast();
}

// The tab's live session id, or null — `tabs/sessions.js` marks the matching row "live".
function current(){ return ctl.session; }

Session.report_quiet(() => ctl.session);   // started once, here — never one watcher per mount
Session.report_pause(() => ctl.session);   // the mic stopping and starting again (item 2, one-dictation)

/**
 * Draw a chat `Widget` into `el` and wire it to the ONE global session. `path` is this
 * mount's page right now (every `say()` re-reads it live through `nav()`, below — see
 * this file's own doc for why `nav()` exists); `card` is only a hint for the very first
 * sentence ever said, from any mount; `placeholder` is passed straight to `Widget`.
 */
export default function chat(el, { path = location.pathname, card, placeholder } = {}){
	const target = { path, card };
	let panel, stop_watch = null, stop_stream = null, own_ats = new Set(), watching = "unset";
	let resume_label = null, resume_session = null;

	new View({ el, capture: false }).append(() => {
		panel = new Widget({
			placeholder,
			marks: true,
			threads: true,
			answer: choice => {
				if (choice === resume_label) resume_to(resume_session).catch(() => {});
			},
			deliver: async entry => {
				try {
					sync_from_storage();
					await ensure(target);
					if (!ctl.session) return false;
					const via = entry.via === "typed" ? "text" : "voice";
					floor.stamp(entry);
					const thread = entry.thread ? { re: entry.thread, thread: true } : {};
					const r = await Session.say({ session: ctl.session, path: target.path, text: entry.text,
						via, raw: entry.raw, floor: entry.floor, cues: entry.cues, selection: ctl.selection, ...thread });
					own_ats.add(r.at);
					panel.retag(entry.at, r.at);
					if (entry.floor === "speaking") watch_floor();
					return true;
				} catch { return false; }
			},
			react: r => ctl.session
				? Session.react({ session: ctl.session, ...r })
				: Promise.reject(new Error("no voice session yet, so the reaction is not saved")),
		});
	});

	// A line from the session file, or a reaction, or a live stream token — the exact
	// shape `Widget.say()` already reads (`ext/Chat/readme.md`'s universal chat line).
	function draw(line){
		if (line?.react) return void panel.say({ react: line.react });
		if (!line?.chat) return;
		if (own_ats.has(line.chat.at)) return;   // this mount's own send, already drawn optimistically
		panel.say({ chat: line.chat });
	}

	// Before a word is said: the tab's newest OLDER session, offered as one tappable
	// line — same rule `rail.js` used to have (voice-fixes, 2026-09-29): a session that
	// spoke within the hour is picked up silently by `ensure()` itself; only an older
	// one is worth asking about.
	function maybe_offer(){
		Session.recent(target.path, { limit: 1 }).then(([row]) => {
			if (!row || ctl.session) return;
			const at = row.at ?? row.last_at;
			if (Date.now() - Date.parse(at ?? 0) < RESUME_OFFER_MS) return;
			resume_label = `${row.title ?? "The last conversation"} · ${ago(at)}`;
			resume_session = row.session;
			panel.say({ type: "ask", heading: "Pick up where you left off?", choices: [resume_label], at: new Date().toISOString() });
		}).catch(() => {});
	}

	// THE FIX: every (re)appearance of a session — this mount's own first paint, or a
	// LATER start/resume/reset from any mount — redraws this mount's thread whole, from
	// the file's own first line, via a brand new `Session.watch()` call (never a cursor
	// carried over from before). See this file's own class doc for the bug this replaces.
	function attach(){
		sync_from_storage();
		if (ctl.session === watching) return;
		watching = ctl.session;
		stop_watch?.(); stop_watch = null;
		stop_stream?.(); stop_stream = null;
		own_ats = new Set();
		panel.reset();
		if (!ctl.session){ maybe_offer(); return; }
		stop_watch = Session.watch(ctl.file, draw);
		stop_stream = Session.stream(ctl.session, ev => {
			if (ev.kind === "stream") panel.stream(ev.role, ev.text);
			else if (ev.kind === "line") draw(ev.line);
		});
	}

	attach();
	report_nav(target.path, target.card);
	const unsubscribe = subscribe(attach);

	return {
		panel,
		session: () => ctl.session,
		// Told by the caller on a real in-app navigation — see this file's own class doc.
		// `card` is optional (item 1): a caller that only knows the new PATH (most of them)
		// can still call `nav(path)` alone, and whatever card this mount already had keeps
		// being reported; a caller that tracks its own card changing under an open mount
		// (`ext/drawer/rail.js`'s sheet, which can show a different card without rebuilding)
		// should pass the new one too, `nav(path, newCardId)`, so it is not lost.
		nav(path, card){ target.path = path; if (card !== undefined) target.card = card; report_nav(path, target.card); },
		// This ONE mount is gone; the global session, its file and its watch (any OTHER
		// mount's own) all carry on untouched.
		remove(){
			unsubscribe();
			stop_watch?.(); stop_watch = null;
			stop_stream?.(); stop_stream = null;
		},
	};
}

chat.current = current;
chat.resume = resume_to;
chat.reset = reset;
chat.ago = ago;

// `ago()` (review fix #9, 2026-09-30): `ext/drawer/rail.js` and `ext/drawer/tabs/sessions.js`
// each carried their own copy of this exact function — this is now the one, imported by both.
export { current, resume_to as resume, reset, ago };
