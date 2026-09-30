import { servex_url } from "/framework/dev/servex_url.js";

/* VOICE SESSIONS, the browser half (Servex/agents/Sessions.js is the other).
 *
 *     const { session, file, resumed, previous } = await start({ path: location.pathname });
 *     await resume(previous.session);                        // continue an older one
 *     const rows = await recent("/framework/");              // [{session, home, title, summary, at, last_at}]
 *     await say({ session, path: location.pathname, text: "can you hear me?", via: "voice", floor: "speaking" });
 *     await floor({ session, floor: "done" });               // the owner stopped talking: the held fast reply lands
 *     await nav({ session, from: "/a/", to: "/b/" });
 *     const stop = watch(file, line => console.log(line));   // every line, old and new
 *
 * One ✦ press is one session. Its whole conversation is one file under the page it
 * started on, `<home>ai/<session>.jsonl`, and `watch()` polls that file. A press on a
 * page whose session spoke in the last hour continues that session (`resumed: true`). */

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
 *  even when a session on this page spoke in the last hour. */
export const start = ({ path = location.pathname, host = location.host, fresh } = {}) =>
	post("new", { path, host, ...(fresh ? { fresh: true } : {}) });

/** Continue any session by id; its assistants wake if they slept. */
export const resume = session => post("resume", { session });

/** The sessions started on, or passing through, `page`, newest first. */
export async function recent(page = location.pathname, { limit = 10, host = location.host } = {}){
	const q = new URLSearchParams({ page, limit, host });
	const out = await (await fetch(servex_url(`/api/sessions?${q}`), { cache: "no-store" })).json();
	if (!out.ok) throw new Error(out.error ?? "sessions failed");
	return out.sessions;
}

/** One owner line into the session; both assistants are sent it at once. `floor` ("speaking" | "done")
 *  and `cues` are the composer's stamps (ext/Chat/doc/floor.md): while the floor is "speaking" the
 *  fast reply is held until it turns "done". No floor counts as "done". */
export const say = ({ session, path = location.pathname, text, via = "text", floor, cues }) =>
	post("say", { session, path, text, via, ...(floor ? { floor } : {}), ...(cues ? { cues } : {}) });

/** The floor changed with no new words (the owner stopped talking): "done" writes a held fast reply. */
export const floor = ({ session, floor }) => post("floor", { session, floor });

/** The owner moved from one page to another while the session is open. */
export const nav = ({ session, from, to }) => post("nav", { session, from, to });

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
	if (line.nav) return { type: "update", at: line.nav.at, text: `moved to ${line.nav.to}` };
	if (line.backing) return { type: "update", at: line.backing.at, text: "the assistants woke up" };
	if (line.session) return { type: "update", at: line.session.at, text: `session ${line.session.id} started on ${line.session.home}` };
	return null;
}

export default { start, resume, recent, say, floor, nav, watch, entry, LEVELS };
