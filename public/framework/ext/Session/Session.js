import { servex_url } from "/framework/dev/servex_url.js";

/* VOICE SESSIONS, the browser half (Servex/agents/Sessions.js is the other).
 *
 *     const { session, file } = await start({ path: location.pathname });
 *     await say({ session, path: location.pathname, text: "can you hear me?", via: "voice" });
 *     await nav({ session, from: "/a/", to: "/b/" });
 *     const stop = watch(file, line => console.log(line));   // every line, old and new
 *
 * One ✦ press is one session. Its whole conversation is one file under the page it
 * started on, `<home>ai/<session>.jsonl`, and `watch()` polls that file. */

async function post(verb, body){
	const res = await fetch(servex_url(`/api/session/${verb}`), { method: "POST",
		headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
	const out = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
	if (!out.ok) throw new Error(out.error ?? `session/${verb} failed`);
	return out;
}

/** A new session homed on `path`. Resolves `{session, home, file}`. */
export const start = ({ path = location.pathname, host = location.host } = {}) => post("new", { path, host });

/** One owner line into the session; both assistants are sent it at once. */
export const say = ({ session, path = location.pathname, text, via = "text" }) => post("say", { session, path, text, via });

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
		return { type: "reply", by: c.from?.id ? `${c.from.id} assistant` : "servex", id, at: c.at, text: c.text };
	}
	if (line.nav) return { type: "update", at: line.nav.at, text: `moved to ${line.nav.to}` };
	if (line.session) return { type: "update", at: line.session.at, text: `session ${line.session.id} started on ${line.session.home}` };
	return null;
}

export default { start, say, nav, watch, entry };
