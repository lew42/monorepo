// report.js — the page talks to the assistants too (chat-shape.md "Two more"): a UI error or an opt-in click posts
// down the REAL dictation path, POST /api/session/say (Sessions.js's `say()`), tagged `kind` so it is filed as a
// `log` line (error) or queued as context for the smart seat's next turn (click/context) instead of being read as
// a spoken line -- round 2 of this build moved `kind` here from Servex.js's unrelated `/api/voice` (that route
// belongs to the Live-Refine demo and was reverted). Lives on SERVEX, not the dev server: a bare relative fetch
// would hit the site's own origin and never arrive, so this goes through the shared `servex_url()` helper every
// other caller already uses. Never touches ux/Dictate (another agent's fence); whoever wires a live voice session
// into a page calls `init(session)` once that session id is known.
import { servex_url } from "/framework/dev/servex_url.js";

function post(session, kind, text){
	if (!session) return;
	fetch(servex_url("/api/session/say"), { method: "POST", headers: { "content-type": "application/json" },
		body: JSON.stringify({ session, kind, text: String(text ?? "").slice(0, 2000) }) }).catch(() => {});   // best-effort: a report that fails to report is not worth a retry loop
}

let current_session = null;
let installed = false;

function on_error(e){ post(current_session, "error", `${e.message ?? e.reason ?? e}${e.filename ? ` (${e.filename}:${e.lineno ?? "?"})` : ""}`); }

/** Call once a voice session id is known (or changes). `window.onerror`/`unhandledrejection` are wired the first time; later calls just update which session they report to. */
export function init(session){
	current_session = session || null;
	if (installed) return;
	installed = true;
	window.addEventListener("error", e => on_error(e));
	window.addEventListener("unhandledrejection", e => on_error(e));
}

/** Opt-in: a click the caller decides is worth telling the smart assistant about (not every click — the caller picks). `label` is what to say, e.g. the element's text or a selector. */
export function click(label){ post(current_session, "click", label); }

/** Opt-in: any other page context worth a mention ("the drawer is now open", a page's own state). */
export function context(text){ post(current_session, "context", text); }
/** The plain sentence for a `Recite.on_read` event (audio/Recite's `cancel_unheard()`, cutting in 2026-11-03):
 *  pure, so it is testable with no fetch and no session — `read(ev)` below posts what this returns. */
export function read_note(ev){
	// "about": Recite.heard_words() is the cut sentence's own first few words, not where the audio really stopped
	// (no word timer exists) — review finding 11, 2026-11-03.
	return ev.heard === "cut"
		? `(cut off about "${ev.words}"; in the sentence starting there, the rest was not heard — treat it as unsaid)`
		: `(a reply was skipped, never heard: it queued behind a reply you then cancelled)`;
}
/** A reply was cut short or skipped before it was heard: filed as `context`, same as `context()` above — a note
 *  for the assistant's next turn, never a prompt and never read back aloud. Wired to `Recite.shared.on_read` in
 *  `ux/Dictate/chat.js` (never the other way: this file never imports `ux/Dictate`). */
export function read(ev){ post(current_session, "context", read_note(ev)); }
/** A diagnostic line filed in the session record as a `log` line (the error path), never read as speech: "recite: loaded …". */
export function diag(text){ post(current_session, "error", text); }
