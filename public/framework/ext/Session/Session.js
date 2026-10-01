import { servex_url } from "/framework/dev/servex_url.js";
import mic_floor from "/framework/ux/Dictate/floor.js";   // `floor` is the verb below

/* VOICE SESSIONS, the browser half (Servex/agents/Sessions.js is the other).
 *
 *     const { session, file, resumed, previous } = await start({ path: location.pathname });
 *     await resume(previous.session);                        // continue an older one
 *     const rows = await recent("/framework/");              // [{session, home, title, summary, at, last_at}]
 *     await say({ session, path: location.pathname, text: "can you hear me?", via: "voice", floor: "speaking" });
 *     await floor({ session, floor: "done" });               // the owner stopped talking: the held fast reply lands
 *     await nav({ session, from: "/a/", to: "/b/", card });   // `card` is the one selected right now, or omit it
 *     const unlive = stream(session, ev => ...);               // replies token by token, lines as written
 *     const unquiet = report_quiet(() => session);            // the owner's silences: when the assistants answer
 *     const unpause = report_pause(() => session);            // the mic stopping and starting again (not just a mid-sentence gap)
 *     await select({ session, selection });                    // the reader's picked element changed (or was cleared, null)
 *     const rows = await recent_project({ limit: 10 });        // every session of this project, any page or card
 *     const stop = watch(file, line => console.log(line));   // every line, old and new
 *
 * One ✦ press is one session. Its whole conversation is one file under the page it
 * started on, `<home>ai/<session>.jsonl`, and `watch()` polls that file. A press on a
 * page whose session spoke in the last hour continues that session (`resumed: true`).
 *
 * A CARD session: pass `card`, a card id like `2026/09/29/audio-a-library-of-…` (the id
 * `ai2/`'s pages already use), and the session's home becomes that card's own folder,
 * `/framework/ai/<card>/`, instead of the nearest folder to `path` — so its file sits
 * beside the card's `page.jsonl`, and the ✦ sheet can be the card's home page. `path` is
 * still kept as where the owner actually stood. See `doc/sessions.md` for the shape. */

/** A refined line's `level`: the owner's words cleaned, edited, or summed up. */
export const LEVELS = ["clean", "edit", "summary"];

async function post(verb, body){
	const res = await fetch(servex_url(`/api/session/${verb}`), { method: "POST",
		headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
	const out = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
	if (!out.ok) throw new Error(out.error ?? `session/${verb} failed`);
	return out;
}

/** A session for `path`: the one that spoke there in the last hour (`resumed: true`), else a new one
 *  with `previous` = the page's most recent older session `{session, title, summary, at}` or null.
 *  `fresh: true` (the "New session" button, voice-fixes review item 1) always starts a new one,
 *  even when a session on this page spoke in the last hour. `card` (a card id) makes the session's
 *  home that card's own folder instead — see the file header. */
export const start = ({ path = location.pathname, host = location.host, card, fresh } = {}) =>
	post("new", { path, host, ...(card ? { card } : {}), ...(fresh ? { fresh: true } : {}) });

/** Continue any session by id; its assistants wake if they slept. */
export const resume = session => post("resume", { session });

/** The sessions started on, or passing through, `page`, newest first. */
export async function recent(page = location.pathname, { limit = 10, host = location.host } = {}){
	const q = new URLSearchParams({ page, limit, host });
	const out = await (await fetch(servex_url(`/api/sessions?${q}`), { cache: "no-store" })).json();
	if (!out.ok) throw new Error(out.error ?? "sessions failed");
	return out.sessions;
}

/** One owner line into the session. `floor` ("speaking" | "done") and `cues` are the composer's
 *  stamps (ext/Chat/doc/floor.md); a spoken line with none is stamped here from the mic's live
 *  level meter, and also carries `quiet_ms` (how long the owner has been quiet). Servex holds a
 *  spoken line from both assistants until the owner has been quiet 2.5 s (see `quiet()`). `raw` is
 *  what Whisper heard, kept on the line when the clean-up changed it. No floor counts as "done".
 *  `selection` (one-dictation, item 6) is the element the reader last picked on the page — the
 *  same shape `ext/drawer/select.js`'s `item()` already builds, `{kind, label, text, selector}` —
 *  passed straight through to Servex, which prefixes `[Selected: …]` ahead of the words it sends
 *  the assistants, the way `Layers.js`'s `heard()` already does for a card's own chip. */
export const say = ({ session, path = location.pathname, text, via = "text", raw, floor: f, cues, re, thread, selection }) => {
	const spoken = via === "voice";
	f ??= spoken ? mic_floor.state() : undefined;
	return post("say", { session, path, text, via, ...(raw && raw !== text ? { raw } : {}),
		...(f ? { floor: f } : {}), ...(cues ? { cues } : {}), ...(spoken ? { quiet_ms: mic_floor.quiet_ms() } : {}),
		...(re && thread ? { re, thread: true } : {}), ...(selection ? { selection } : {}) });
};

/** The floor changed with no new words (the owner stopped talking): "done" writes a held fast reply. */
export const floor = ({ session, floor }) => post("floor", { session, floor });

/** The owner's reaction (👍 ✅ ❤️ 😂 ❓ 👎) on one line of the session, `re` = that line's `at`.
 *  An empty `emoji` takes the owner's reaction off. */
export const react = ({ session, re, emoji = "", at }) => post("react", { session, re, emoji, at });
/** THE SILENCE EVENT: the owner has been quiet for `ms` (or the mic went off). Servex writes it as an
 *  invisible `{quiet}` line, and it is what lets the held assistants answer. */
export const quiet = ({ session, ms, mic_off = false, path = location.pathname }) => post("quiet", { session, ms, mic_off, path });

/** Every silence mark of the mic's floor (`ux/Dictate/floor.js`, `on_quiet`), posted to `session()`
 *  (asked fresh each time; null = no session yet). Returns `stop()`. */
export const report_quiet = session => mic_floor.on_quiet((ms, { mic_off }) => {
	const id = session();
	if (id) quiet({ session: id, ms, mic_off }).catch(() => {});
});

/** THE MIC'S OWN PAUSE (one-dictation, item 2) — distinct from an ordinary mid-sentence quiet
 *  gap `report_quiet` already reports: the mic stopping altogether, and starting again later,
 *  maybe minutes apart. `phase: "start"` reuses the exact moment `report_quiet` already catches
 *  (`floor.js`'s own `mic_off`, which fires `on_quiet` with `mic_off: true` — nothing new is
 *  needed for that half). `phase: "end"` has no existing hook to reuse (nothing fires when the
 *  mic turns back ON), so this polls `floor.js`'s own public `owner` field at a light interval —
 *  a mic button is pressed by a person, never machine-gunned, so missing it by a few hundred ms
 *  is fine. Posted to `session()` (asked fresh each time; null = no session yet, and nothing is
 *  sent). Returns `stop()`. */
export function report_pause(session){
	let on = !!mic_floor.owner;
	const stop_quiet = mic_floor.on_quiet((ms, { mic_off }) => {
		if (!mic_off || !on) return;
		on = false;
		const id = session();
		if (id) pause({ session: id, phase: "start" }).catch(() => {});
	});
	const timer = setInterval(() => {
		const live = !!mic_floor.owner;
		if (!live || on) return;
		on = true;
		const id = session();
		if (id) pause({ session: id, phase: "end" }).catch(() => {});
	}, 400);
	return () => { stop_quiet(); clearInterval(timer); };
}

/** An invisible marker: the mic paused (`phase: "start"`) or picked back up (`phase: "end"`) —
 *  `report_pause()` above calls this; a caller with its own mic lifecycle can call it directly. */
export const pause = ({ session, phase }) => post("pause", { session, phase });

/** An invisible marker: the element the reader has selected on the page changed (or was cleared,
 *  `selection: null`) — `ext/drawer/select.js`'s own event, the same shape `say()`'s own
 *  `selection` takes. Written the moment it changes, even with nothing said yet, so the smart
 *  assistant can later tell what was on screen at any past moment, not only at the moment of
 *  the next sentence. */
export const select = ({ session, selection }) => post("select", { session, selection });

/** THE LIVE WIRE: `on_event` hears `{kind: "stream", role, text}` (a reply so far, whole, while it is
 *  written; `text: ""` when it ends) and `{kind: "line", line}` (every line the moment Servex writes
 *  it, so a reply does not wait for the next poll). Server-sent events; the browser reconnects by
 *  itself, and each stream event carries the whole text, so a reconnect loses nothing. Returns `stop()`. */
export function stream(session, on_event){
	if (typeof EventSource !== "function") return () => {};
	const src = new EventSource(servex_url(`/api/session/${session}/stream`));
	src.onmessage = e => { try { on_event(JSON.parse(e.data)); } catch {} };
	return () => src.close();
}

/** The owner moved from one page to another while the session is open. `card` (one-dictation,
 *  item 1) is the card selected AT THAT MOMENT, or omitted for none — it is what lets the smart
 *  assistant later work out which card a sentence was really about even after the owner has
 *  since moved on (`doc/sessions.md`'s "Refinement goes to the card selected at the time"). This
 *  line is invisible (`Session.entry()` never draws a `nav` line any more), but it is written
 *  into the session file Servex reads back as context, and into the fast assistant's own notes
 *  (`Servex/agents/Sessions.js`'s `nav()`) — before this, only the smart assistant's own
 *  thought-batching ever mentioned a move at all. */
export const nav = ({ session, from, to, card }) => post("nav", { session, from, to, ...(card ? { card } : {}) });

/** Every session of this PROJECT, any page or card it ever touched, newest first — item 4
 *  (one-dictation): the real project-wide list, replacing the old "ask this page's folder AND
 *  the site root and merge" workaround (`ext/drawer/tabs/sessions.js`'s own `project_recent()`,
 *  which could still miss an older session that passed through neither one). */
export async function recent_project({ limit = 10, host = location.host } = {}){
	const q = new URLSearchParams({ project: "1", limit, host });
	const out = await (await fetch(servex_url(`/api/sessions?${q}`), { cache: "no-store" })).json();
	if (!out.ok) throw new Error(out.error ?? "sessions failed");
	return out.sessions;
}

/** Poll `file` every 1.5 s (never cached) and hand each new line, parsed, to `on_line`.
 *  Returns `stop()`. A missing file (404) is just "nothing yet". */
export function watch(file, on_line, { every = 1500 } = {}){
	let seen = 0, timer = null, stopped = false;
	async function tick(){
		try {
			const res = await fetch(file, { cache: "no-store" });
			if (res.ok){
				const lines = (await res.text()).split("\n").filter(l => l.trim());
				for (; seen < lines.length; seen++){
					let line; try { line = JSON.parse(lines[seen]); } catch { continue; }
					on_line(line);
				}
			}
		} catch {}
		if (!stopped) timer = setTimeout(tick, every);
	}
	tick();
	return () => { stopped = true; clearTimeout(timer); };
}

/** A session line as an ext/Chat entry: owner lines are prompts, assistant lines replies, the rest updates. */
export function entry(line){
	if (line.chat){
		const c = line.chat, id = c.at + "|" + (c.from?.id ?? c.from?.kind);
		if (c.from?.kind === "owner") return { type: "prompt", by: "owner", id, at: c.at, text: c.text };
		const by = (c.from?.id ? `${c.from.id} assistant` : "servex") + (c.level ? ` · ${c.level}` : "");
		return { type: "reply", by, id: id + (c.level ? "|" + c.level : ""), at: c.at, text: c.text, re: c.re, level: c.level };
	}
	// `nav` is invisible now (one-dictation, item 1) — same category as `quiet`/`skip`/`pause`/
	// `select` below: real context Servex keeps, never a bubble the reader has to read past.
	// `para` (one-dictation, the 'para' marker) is the same — never a bubble of its own — but,
	// unlike those, it is PASSED THROUGH rather than dropped: `re` names a paragraph already on
	// screen, and `ux/Dictate/Widget.js`'s `Thread` needs this shape to split it, and everything
	// merged in after it, into a new bubble (`ext/Session/doc/markers.md`).
	if (line.para) return { type: "para", at: line.para.at, re: line.para.re };
	if (line.backing) return { type: "update", at: line.backing.at, text: "the assistants woke up" };
	if (line.session) return { type: "update", at: line.session.at, text: `session ${line.session.id} started on ${line.session.home}` };
	return null;
}

export default { start, resume, recent, recent_project, say, floor, quiet, report_quiet, report_pause, pause, select, stream, nav, react, watch, entry, LEVELS };
