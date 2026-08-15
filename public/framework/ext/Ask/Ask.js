import Socket from "/framework/dev/Socket/Socket.js";

const listeners = new Map();

/* ⚠ Called BY the dev server, through Socket.message()'s method lookup — a grep
   for callers in public/ finds none. Same live path as Socket.reload(). */
Socket.prototype.ask_event = function(e){ listeners.get(e.id)?.(e); };

export function available(){ return !Socket.singleton().disabled; }

/**
 * One turn of a Claude Code session, from the browser.
 *
 *     const { text } = await ask("Name the three widest elements on this page.");
 *
 * `resume` continues a session; `from` forks one, inheriting its whole context
 * without touching the transcript a human may still have open; neither starts a
 * fresh one. `task` is a thread's path under `public/` — `framework/styles/ai/rhythm`
 * beside a page, or `framework/ai/2026-08-14/browser-cli-bridge` — and files the
 * exchange in that thread's log. `on` receives `{text}` / `{tool}` as the turn streams.
 *
 * `shot` hands the turn a picture of one element to look at — a selector on this
 * page, or `{url, selector, width, height}` for any other:
 *
 *     await ask("What is wrong with this card's layout?", { shot: ".preview-card" });
 *
 * ⚠ Rejects off localhost — there is no dev server to spawn anything. Guard with
 * `available()` and render the fallback; never let a page depend on this.
 */
export async function ask(prompt, opts = {}){
	const socket = Socket.singleton();
	if (socket.disabled) throw new Error("ask(): no dev server — the bridge is localhost only.");

	if (typeof opts.shot === "string") opts = { ...opts, shot: { url: location.href, selector: opts.shot } };

	const id = crypto.randomUUID();
	if (opts.on) listeners.set(id, opts.on);

	try {
		const reply = await socket.request({ method: "ask", args: [{ ...opts, on: undefined, id, prompt }] });
		if (reply?.error) throw new Error(reply.error);
		return reply;
	} finally {
		listeners.delete(id);
	}
}

/**
 * Open a thread beside a page — `<page>ai/<slug>/task.jsonl`, one line, and no
 * process. `task` is the thread's path under `public/`; opening one that already
 * exists replies `{existed: true}` rather than failing.
 *
 *     await thread("framework/styles/layouts/ai/rhythm");
 *
 * The chat that follows is an ordinary `ask()` with that `task`, so the exchange
 * lands in the log and survives the reload. `start()` below is the other door —
 * a task that wants a whole session working it, not a conversation.
 *
 * ⚠ Rejects off localhost, the same as `ask()`.
 */
export async function thread(task, opts = {}){
	const socket = Socket.singleton();
	if (socket.disabled) throw new Error("thread(): no dev server — the bridge is localhost only.");

	const reply = await socket.request({ method: "thread", args: [{ ...opts, task }] });
	if (reply?.error) throw new Error(reply.error);
	return reply;
}

/**
 * Start a NEW task from the browser — the dev server scaffolds
 * `ai/<date>/<slug>/` (brief + opened log, exactly what the `new-task` skill
 * writes) and spawns a session to work it. Resolves `{task, slug, session_id,
 * url}` as soon as the process is away, NOT when the work is done: a task runs
 * for an hour, so its own log is the progress channel and the board follows it.
 *
 *     const { url } = await start("fix the audit page's severity sort", { group: "layout" });
 *
 * ⚠ Rejects off localhost, the same as `ask()`.
 */
export async function start(prompt, opts = {}){
	const socket = Socket.singleton();
	if (socket.disabled) throw new Error("start(): no dev server — the bridge is localhost only.");

	const reply = await socket.request({ method: "start", args: [{ ...opts, prompt }] });
	if (reply?.error) throw new Error(reply.error);
	return reply;
}

export default ask;
