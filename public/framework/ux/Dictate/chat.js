import View from "../../core/View/View.js";
import Widget from "./Widget.js";
import floor from "./floor.js";
import * as Session from "/framework/ext/Session/Session.js";

/**
 * **ONE chat, everywhere** (`ai/2026-09-30/one-dictation/`, the owner: "we want to have
 * one set of code… one system that works the same everywhere, whether it's the mobile
 * rail or the right sidebar"). `chat(el, {path, card, placeholder})` draws a `Widget`
 * into `el` and wires it to the fast/smart voice-session pair (`ext/Session/Session.js`).
 * Every caller — the mobile ✦ sheet (`ext/drawer/rail.js`), the desktop ☰ drawer's AI
 * tab (`ext/drawer/tabs/ai.js`), the Dictate page — calls this ONE function; none of
 * them hold any session logic of their own any more.
 *
 *     const chat_handle = chat(el, { path: "/framework/", placeholder: "say something" });
 *     chat_handle.panel;      // the Widget, if a caller needs it directly
 *     chat_handle.session();  // the live global session id, or null
 *     chat_handle.nav("/framework/other/");  // this mount moved to a new page — see below
 *     chat_handle.remove();   // this ONE mount is gone; the session and its watch live on
 *
 * **THE SESSION IS GLOBAL** (the owner, 2026-09-30: "we're not doing per directory
 * assistants any more… we're doing global dictation assistance… you don't want to cut
 * off the user's transcription just because they clicked on a link"). One browser tab
 * has at most ONE voice session, in `sessionStorage["lew42-voice-session"]` — the exact
 * key `ext/Session/Session.js`'s own docs name. It is never looked up a second time by
 * card or page: whichever mount first says something calls `Session.start()`, and every
 * later mount — a different card, a different page, a second surface open at once — just
 * picks that same session back up. `card` is only a HINT for that very first sentence
 * (it becomes the session's home folder, `ext/Session/Session.js`'s own doc); `path` is
 * sent fresh with every single `say()`, never frozen at mount time.
 *
 * **THE BUG THIS REPLACES** (`ai/2026-09-30/one-dictation/minion-chat/requirements.md`):
 * `rail.js`'s card branch and this tab both used to start watching the session file only
 * *inside* `deliver` — the moment a sentence was sent. A widget rebuilt by a card switch,
 * a tab reopen, or a page reload never called `deliver`, so it sat empty until the owner
 * spoke again, even though the conversation was still there on disk. Every mount here
 * calls `Session.watch()` itself, on the way up (`attach()`, below) — `watch()` always
 * starts reading a file from its first line, so a brand new `Widget` gets the WHOLE
 * conversation at once, not just whatever is said after it appears. Several mounts open
 * at once (the sheet and the drawer, say) each run their own `watch()`/`stream()` pair
 * and so each draw the exact same full history — cheap, since a session's file is small,
 * and far simpler than one shared cursor several widgets would have to fight over.
 *
 * **Sending de-dupes itself.** A mount that just said something already drew its own
 * bubble (`Widget.submit()`, optimistic) before the server even answered; once it does,
 * this file's `own_ats` — one `Set` per MOUNT, not shared — remembers the real `at` so
 * that mount's own `watch()` doesn't draw the very same line a second time when it reads
 * it back off disk a moment later. A mount that did NOT send it never had a local bubble
 * to begin with, so it just draws the line once, normally, the first time `watch()` sees it.
 *
 * **Reactions and threads** (`ext/Chat` + `ext/Session`'s "chat-reactions" work, merged
 * 2026-09-30): every `Widget` this file builds gets `threads: true` and a live `react`
 * handler wired to `Session.react()`, same as `rail.js`'s pair used to wire by hand —
 * `Widget` itself does not draw reaction UI yet (`readme.md` names the gap), but the data
 * path is real today so nothing has to change here once it does.
 *
 * **`nav(path)` is not in this task's own three-member list** (`{remove, panel, session}`)
 * but is real and necessary: the ✦ sheet is the ONE surface that stays mounted across a
 * real page navigation (the desktop AI tab and the Dictate page both get a brand new
 * `chat()` call on every open instead), so its caller has to tell this module a
 * navigation happened. `report_nav()` (below) is the single place `Session.nav()` is
 * ever actually called, compared against the controller's own last-reported path — so
 * two different callers noticing the same real navigation (the rail's own `navigated()`
 * and a fresh mount's own path) still only send ONE `nav` event, never two.
 */

/**
 * **THE FONT GUARD** (requirement 5: "the chat must show the site's Montserrat on
 * every surface… its CSS says `font: inherit`, so fix it by mounting inside the
 * element that sets the font"). Every widget bubble, input and button already says
 * `font: inherit` (framework.css's own UA-control reset, plus `Widget.css`'s
 * composer) — it is only WRONG when the element it inherits from is. That IS true
 * for the mobile ✦ sheet's mount (`rail.js`, built through the normal View captor
 * chain, correctly nested under the real themed `.app` root) — the font there is
 * already right, confirmed live, and this function is a no-op on it.
 *
 * It is NOT true for the desktop drawer (`ext/drawer/drawer.js`'s `.drawer`, the
 * root `tabs/ai.js` and `tabs/sessions.js` build into): confirmed live, by
 * instrumenting it directly, `drawer.js`'s own `build()` runs `document.
 * querySelector(".app")` while `document.readyState` is still `"interactive"` —
 * BEFORE `core/App/App.js`'s `inject()` has attached the real, themed `.app` div to
 * the document at all — so that query returns `null`, falls back to `document.
 * body`, and a module-level guard (`if ($rail) return`) CACHES that wrong parent
 * for the rest of the page's life. Every tab in that drawer inherits the wrong font
 * because of it, not just this widget; the fix belongs in `drawer.js`, which is
 * outside this task's fence (`requirements.md`'s own file list) — flagged in this
 * task's own log for the parent to route onward, not silently worked around by
 * editing a file outside the fence.
 *
 * What THIS file can still do, inside its own fence, with no literal font name
 * anywhere in the code: read the real theme's OWN resolved font straight off the
 * one real `.theme-lew42` element (there is always exactly one, correctly parented,
 * regardless of where THIS mount ends up) and set it, once, on this one mount's own
 * root — right wherever the mount is already correctly nested, and a real fix
 * wherever it is not. */
function fix_font(el){
	const themed = document.querySelector(".theme-lew42");
	if (!themed) return;
	const want = getComputedStyle(themed).fontFamily;
	if (want && getComputedStyle(el).fontFamily !== want) el.style.fontFamily = want;
}

const SESSION_KEY = "lew42-voice-session";
const RESUME_OFFER_MS = 60 * 60 * 1000;   // matches Servex's own SERVEX_SESSION_RESUME_MS default

// A rough "how long ago" — "1 day ago", never a bare timestamp. Small enough to keep
// local rather than import (`ext/drawer/rail.js` and `tabs/sessions.js` each need their
// own copy too — this module cannot import UPWARD into `ext/`).
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
// controller, not per mount" — this task's own brief).
function report_nav(path){
	if (!ctl.session){ ctl.nav_path = path; return; }
	if (path === ctl.nav_path) return;
	const from = ctl.nav_path;
	ctl.nav_path = path;
	Session.nav({ session: ctl.session, from, to: path }).catch(() => {});
}

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

	fix_font(el);

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
						via, raw: entry.raw, floor: entry.floor, cues: entry.cues, ...thread });
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
	report_nav(target.path);
	const unsubscribe = subscribe(attach);

	return {
		panel,
		session: () => ctl.session,
		// Told by the caller on a real in-app navigation — see this file's own class doc.
		nav(path){ target.path = path; report_nav(path); },
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

export { current, resume_to as resume, reset };
