import { View, button } from "../../core/View/View.js";
import Widget from "./Widget.js";
import floor from "./floor.js";
import * as Session from "/framework/ext/Session/Session.js";

/**
 * ONE chat box, one conversation, every surface. `chat(el, {path, card, placeholder})`
 * draws a `Widget` into `el` and wires it to the global voice session
 * (`ext/Session/Session.js`). Every caller — the ✦ sheet, the ☰ drawer's AI tab, a
 * card's sidebar — calls this one function; none of them hold their own session logic.
 * The call, why a reopened chat never loses old messages, `nav(path, card)`'s exact
 * rules, `keep: false`'s page-local session, the shared `new_session_button()`, and
 * every older version still kept reachable:
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

/* THE CONTROLLER FACTORY (item 2, one-dictation: `keep`). Everything this file used to
 * do with one module-level singleton now lives here instead, so it can be built TWICE:
 * once, here below, as `GLOBAL` — the one conversation per browser tab, shared by every
 * `chat()` call made with `keep: true` (the default) — and once PER MOUNT, fresh, never
 * saved anywhere, for a call made with `keep: false`. A `persist: false` controller never
 * touches `sessionStorage`, so it can never be read back by a later mount — which is
 * exactly "coming back starts fresh" (the owner's own words, `owner-words.md`). Nothing
 * about the SHAPE of a controller changes between the two; only whether it reads/writes
 * the shared storage key. */
function create_controller({ persist }){
	const ctl = {
		session: null,
		file: null,
		starting: null,   // a pending Session.start() promise — two mounts' first sentence at once share ONE session
		nav_path: null,   // the path last actually reported to the session (report_nav's own dedupe)
		nav_card: null,   // the card last actually reported alongside it (item 1, one-dictation)
		selection: null,  // the reader's last picked element, `{kind, label, text, selector}` or null (item 6) — GLOBAL only, see below
	};

	function sync_from_storage(){
		if (!persist || ctl.session) return;
		const saved = read_saved();
		if (saved?.session && saved?.file){ ctl.session = saved.session; ctl.file = saved.file; }
	}
	sync_from_storage();

	// Every live mount's own re-sync — called whenever THIS controller's session changes
	// (a first start, a resume, a reset), so every open mount sharing it notices, not just
	// the one that caused the change. A `keep: false` controller usually has only one mount
	// listening (its own), but the shape costs nothing to share.
	const listeners = new Set();
	function subscribe(fn){ listeners.add(fn); return () => listeners.delete(fn); }
	function broadcast(){ for (const fn of listeners) fn(); }

	// The ONE real navigation report, whoever calls it — deduped against `ctl.nav_path` so
	// the rail's own `navigated()` hook AND a fresh mount noticing a new path never both
	// send the same move twice. `card` (item 1, one-dictation) is the card selected right
	// now, or undefined for none — it travels with every nav report so a refinement
	// written later can be attributed to the right card even after the owner has since
	// moved on (`doc/sessions.md`'s "Refinement goes to the card selected at the time").
	function report_nav(path, card){
		if (!ctl.session){ ctl.nav_path = path; ctl.nav_card = card; return; }
		if (path === ctl.nav_path && card === ctl.nav_card) return;
		const from = ctl.nav_path;
		ctl.nav_path = path; ctl.nav_card = card;
		Session.nav({ session: ctl.session, from, to: path, card }).catch(() => {});
	}

	// The first sentence, from any mount sharing THIS controller, starts (or silently
	// resumes, inside `Session.start()` itself) the one session it will ever use until a
	// reset. For a `keep: false` controller this really does call the server and really
	// does start two real agents (`rail.js`'s own note on `start()`) — a page-local
	// session is still a REAL session, just not a remembered one.
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
	// the fast assistant's held reply lands. One watcher per controller, not one per mount.
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
	// click on a past voice session. Every open mount sharing this controller hears about it.
	async function resume_to(session){
		const made = await Session.resume(session);
		ctl.session = made.session; ctl.file = made.file;
		write_saved({ session: made.session, file: made.file });
		broadcast();
	}

	// "New session" — drops this controller's own session id; the NEXT sentence said, from
	// whichever mount it comes from, starts a fresh one. For `keep: false` there is nothing
	// saved to drop — this just clears the in-memory id, same effect.
	function reset(){
		ctl.session = null; ctl.file = null; ctl.starting = null;
		write_saved(null);
		broadcast();
	}

	function current(){ return ctl.session; }

	return { ctl, persist, subscribe, broadcast, report_nav, ensure, watch_floor, resume_to, reset, current, sync_from_storage };
}

// THE ONE GLOBAL CONTROLLER — one per browser tab, module-level (ES modules are
// singletons, so every importer of this file shares this one object). Built once, here,
// the moment this module first loads.
const GLOBAL = create_controller({ persist: true });

// THE PAGE SELECTION (item 6, one-dictation) is kept on the GLOBAL controller only — one
// browser tab has only one on-screen selection, regardless of how many `keep: false`
// mounts come and go, so a page-local session never needs its own copy. Reported the
// moment it changes (an invisible `select` line, same shape `nav` takes) AND kept on
// `GLOBAL.ctl.selection` so the next global `say()` can stamp it onto that sentence too.
window.addEventListener("selection-change", e => {
	GLOBAL.ctl.selection = e.detail ?? null;
	if (GLOBAL.ctl.session) Session.select({ session: GLOBAL.ctl.session, selection: GLOBAL.ctl.selection }).catch(() => {});
});

// Started once, here, for the GLOBAL session only — never one watcher per mount, and
// never one for a page-local session either: the mic itself is one thing per tab, and
// these report to whichever session is "the" conversation right now. A `keep: false`
// mount's own session is a deliberate gap here — see `doc/chat.md`.
Session.report_quiet(() => GLOBAL.ctl.session);
Session.report_pause(() => GLOBAL.ctl.session);

/**
 * Draw a chat `Widget` into `el` and wire it to a voice session. `path` is this mount's
 * page right now (every `say()` re-reads it live through `nav()`, below — see this
 * file's own doc for why `nav()` exists); `card` is only a hint for the very first
 * sentence ever said, from any mount SHARING this session; `placeholder` is passed
 * straight to `Widget`, as are `level`/`source`/`debug` (item 1, one-dictation — the
 * Dictate page's own demo wants its meter, mic picker and Debug bar, same as the bare
 * `new Widget(...)` it used to build directly).
 *
 * `mode` (item 1, "modes" — default `"dictate"`) is passed straight through to the `Widget`
 * this draws; see `Widget.js`'s own `MODES` table for what `"dictate"` and `"chat"` each mean.
 *
 * `keep` (item 2, one-dictation; default `true`) chooses which conversation this mount
 * joins:
 * - `keep: true` — today's one global session per browser tab, kept across every page
 *   (the ✦ rail's whole reason to exist: say something on one page, keep talking on the
 *   next).
 * - `keep: false` — this ONE mount gets its own session, remembered only for as long as
 *   the mount itself is alive. It is never written to `sessionStorage`, so a page reload,
 *   or simply building a NEW mount later (leaving this page and coming back), can never
 *   read it back — "coming back starts fresh" (the owner's own words). The global session
 *   is never touched by a `keep: false` mount: they are two entirely separate controllers,
 *   built by the same `create_controller()` above, one shared, one private.
 */
export default function chat(el, { path = location.pathname, card, placeholder, keep = true, level, source, debug, revision, models, mode = "dictate" } = {}){
	const target = { path, card };
	const owner = keep ? GLOBAL : create_controller({ persist: false });
	let panel, stop_watch = null, stop_stream = null, own_ats = new Set(), watching = "unset";
	let resume_label = null, resume_session = null;
	// THE DUPLICATE-DRAW FIX (2026-10-01): `attach()` below wires up BOTH `Session.watch()`
	// (polling the session file every 1.5s) and `Session.stream()` (an SSE push the moment
	// Servex writes a line) to this SAME `draw()` function — on purpose, two separate jobs
	// (`Session.js`'s own doc comment on `stream()`: its "line" events exist so "a reply does
	// not wait for the next poll"; `watch()` is the full-history catch-up and the fallback for
	// a dropped connection). That means EVERY real line is expected to arrive twice, once from
	// each channel. `own_ats` already dedupes one case of this — the owner's own sent message,
	// echoed back once the file/stream reads it — but an assistant's reply was never covered,
	// so the fast and smart assistants' own replies each drew as two separate bubbles (the
	// owner: "both messages... added twice... four messages total"). `seen_chat` is the same
	// guard, widened to every chat line, keyed the same way `ext/Chat/Chat.js`'s own `chat()`
	// factory already dedupes its `source()` lines (`at` + whether it's a `fix` + the text).
	let seen_chat = new Set();

	new View({ el, capture: false }).append(() => {
		panel = new Widget({
			placeholder, level, source, debug, revision, models, mode,
			marks: true,
			deliver: async entry => {
				try {
					owner.sync_from_storage();
					await owner.ensure(target);
					if (!owner.ctl.session) return false;
					const via = entry.via === "typed" ? "text" : "voice";
					floor.stamp(entry);
					const thread = entry.thread ? { re: entry.thread, thread: true } : {};
					const r = await Session.say({ session: owner.ctl.session, path: target.path, text: entry.text,
						via, raw: entry.raw, floor: entry.floor, cues: entry.cues, selection: owner.ctl.selection, ...thread });
					own_ats.add(r.at);
					panel.retag(entry.at, r.at);
					if (entry.floor === "speaking") owner.watch_floor();
					return true;
				} catch { return false; }
			},
			answer: choice => {
				if (choice === resume_label) owner.resume_to(resume_session).catch(() => {});
			},
			react: r => owner.ctl.session
				? Session.react({ session: owner.ctl.session, ...r })
				: Promise.reject(new Error("no voice session yet, so the reaction is not saved")),
		});
	});

	// A line from the session file, or a reaction, or a live stream token — the exact
	// shape `Widget.say()` already reads (`ext/Chat/readme.md`'s universal chat line).
	function draw(line){
		if (line?.react) return void panel.say({ react: line.react });
		if (line?.para) return void panel.say({ para: line.para });   // the fast assistant split a bubble (doc/chat.md)
		if (!line?.chat) return;
		if (own_ats.has(line.chat.at)) return;   // this mount's own send, already drawn optimistically
		// `watch()` and `stream()` both call this for the SAME line (see the comment on
		// `seen_chat`, above) — a `fix` carries its own text, so a later correction at the
		// same `at` is still drawn, never swallowed as "already seen".
		const key = line.chat.at + (line.chat.fix ? "|fix|" + line.chat.text : "");
		if (seen_chat.has(key)) return;
		seen_chat.add(key);
		panel.say({ chat: line.chat });
	}

	// Before a word is said: the tab's newest OLDER session, offered as one tappable
	// line — same rule `rail.js` used to have (voice-fixes, 2026-09-29): a session that
	// spoke within the hour is picked up silently by `ensure()` itself; only an older
	// one is worth asking about. Never offered for a `keep: false` mount — there is
	// nothing saved for it to resume FROM; every one of its own sessions starts fresh.
	function maybe_offer(){
		if (!keep) return;
		Session.recent(target.path, { limit: 1 }).then(([row]) => {
			if (!row || owner.ctl.session) return;
			const at = row.at ?? row.last_at;
			if (Date.now() - Date.parse(at ?? 0) < RESUME_OFFER_MS) return;
			resume_label = `${row.title ?? "The last conversation"} · ${ago(at)}`;
			resume_session = row.session;
			panel.say({ type: "ask", heading: "Pick up where you left off?", choices: [resume_label], at: new Date().toISOString() });
		}).catch(() => {});
	}

	// THE FIX: every (re)appearance of a session — this mount's own first paint, or a
	// LATER start/resume/reset from any mount sharing this controller — redraws this
	// mount's thread whole, from the file's own first line, via a brand new
	// `Session.watch()` call (never a cursor carried over from before). See this file's
	// own class doc for the bug this replaces.
	function attach(){
		owner.sync_from_storage();
		if (owner.ctl.session === watching) return;
		watching = owner.ctl.session;
		stop_watch?.(); stop_watch = null;
		stop_stream?.(); stop_stream = null;
		own_ats = new Set();
		seen_chat = new Set();
		panel.reset();
		if (!owner.ctl.session){ maybe_offer(); return; }
		stop_watch = Session.watch(owner.ctl.file, draw);
		stop_stream = Session.stream(owner.ctl.session, ev => {
			if (ev.kind === "stream") panel.stream(ev.role, ev.text);
			else if (ev.kind === "line") draw(ev.line);
		});
	}

	attach();
	owner.report_nav(target.path, target.card);
	const unsubscribe = owner.subscribe(attach);

	return {
		panel,
		session: () => owner.ctl.session,
		// Told by the caller on a real in-app navigation — see this file's own class doc.
		// `card` is optional (item 1): a caller that only knows the new PATH (most of them)
		// can still call `nav(path)` alone, and whatever card this mount already had keeps
		// being reported; a caller that tracks its own card changing under an open mount
		// (`ext/drawer/rail.js`'s sheet, which can show a different card without rebuilding)
		// should pass the new one too, `nav(path, newCardId)`, so it is not lost.
		nav(path, card){ target.path = path; if (card !== undefined) target.card = card; owner.report_nav(path, target.card); },
		// Drop THIS mount's own conversation and start fresh on the next sentence — the
		// shared button below (item 3) calls this. For `keep: true` this is exactly
		// `chat.reset()`; for `keep: false` it only ever affected this one mount anyway.
		reset(){ owner.reset(); },
		// This ONE mount is gone; the session it was showing (global, or this mount's own
		// private one) stops being watched by it. A `keep: true` mount leaving changes
		// nothing else — the global session, and any OTHER open mount showing it, carry on
		// completely untouched. A `keep: false` mount leaving drops its OWN controller too
		// (nothing else holds a reference to it), which is what makes "coming back starts
		// fresh" true without this file doing anything further.
		remove(){
			unsubscribe();
			stop_watch?.(); stop_watch = null;
			stop_stream?.(); stop_stream = null;
		},
	};
}

/**
 * THE SHARED "NEW SESSION" BUTTON (item 3, one-dictation — "a New session button lives
 * in chat.js, so every surface gets the same one"). Pass the `mount` this call's own
 * `chat()` returned, OR a function that returns it (a caller like `ext/drawer/rail.js`'s
 * ✦ sheet builds this button before it has built its mount yet — `render()` runs before
 * `show()`'s own `ensure_mount()` — so it hands over `() => this.mount` instead of the
 * mount itself, read fresh on every click rather than captured too early as `undefined`).
 * A click calls that mount's `reset()` — the global conversation for a `keep: true`
 * mount, or just this one mount's own private session for a `keep: false` one, so the
 * exact same button works for both without the caller choosing which `reset` to wire up
 * itself. `ext/drawer/rail.js`'s ✦ sheet uses this now instead of building its own button
 * (one of everything, CLAUDE.md law 6); so does the Dictate page's own demo.
 */
export function new_session_button(mount, { label = "New session", title = "Clear this chat and start a fresh conversation" } = {}){
	return button.c("ux-dictate-chat-new-session", label).attr("type", "button")
		.attr("title", title)
		.click(() => (typeof mount === "function" ? mount() : mount)?.reset());
}

chat.current = () => GLOBAL.current();
chat.resume = session => GLOBAL.resume_to(session);
chat.reset = () => GLOBAL.reset();
chat.ago = ago;
chat.new_session_button = new_session_button;

// `ago()` (review fix #9, 2026-09-30): `ext/drawer/rail.js` and `ext/drawer/tabs/sessions.js`
// each carried their own copy of this exact function — this is now the one, imported by both.
export { ago };
export const current = chat.current;
export const resume = chat.resume;
export const reset = chat.reset;
