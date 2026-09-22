import Socket from "/framework/dev/Socket/Socket.js";
import { edit } from "./edit.js";
import { describe } from "./pick.js";

export { pick, context, describe, where, label } from "./pick.js";

const listeners = new Map();

/* ⚠ Called BY the dev server, through Socket.message()'s method lookup — a grep
   for callers in public/ finds none. Same live path as Socket.reload(). */
Socket.prototype.ask_event = function(e){ listeners.get(e.id)?.(e); };

// The one switch every editor control reads — ext/Ask/edit.js's doc/decisions.md.
export function available(){ return edit(); }

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
 * `context` is what the page is doing right now. A STRING is text about the page —
 * the dev rail sends what is selected — and the server appends it to the turn's
 * system prompt. An OBJECT is one picked element, the thing `pick()` resolves to:
 * the turn's prompt then opens with plain sentences saying what the element is,
 * which page it is on, and where that page's readme and decisions are, with both
 * files quoted, so the answer can cite them. See `describe()` in pick.js.
 *
 * The turn is **bound to this tab**: the server tells it this tab's id, and the `site`
 * MCP tools take that id, so a second window on the same page is never touched. It also
 * rings this tab for the length of the turn. See doc/decisions.md.
 *
 * `shot` hands the turn a picture of one element to look at — a selector on this
 * page, or `{url, selector, width, height}` for any other:
 *
 *     await ask("What is wrong with this card's layout?", { shot: ".preview-card" });
 *
 * ⚠ Rejects off localhost, or with edit mode off in the dev rail. Guard with
 * `available()` and render the fallback; never let a page depend on this.
 */
export async function ask(prompt, opts = {}){
	const socket = Socket.singleton();
	if (!edit()) throw new Error("ask(): no dev server, or edit mode is off — the bridge is localhost only.");

	if (typeof opts.shot === "string") opts = { ...opts, shot: { url: location.href, selector: opts.shot } };

	/* A picked element rides in the PROMPT, not in the system line: the server slices
	   `context` to 800 characters for the system prompt, and a readme is longer than
	   that. The system line keeps the one-sentence version, so the turn still knows
	   what is selected on the tab it is bound to. */
	const about = opts.context?.tag && describe(opts.context);
	if (about){
		prompt = about + "\n\n" + prompt;
		opts = { ...opts, context: `the element ${opts.context.selector}, on ${opts.context.home ?? opts.context.page}` };
	}

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
	if (!edit()) throw new Error("thread(): no dev server, or edit mode is off — the bridge is localhost only.");

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
	if (!edit()) throw new Error("start(): no dev server, or edit mode is off — the bridge is localhost only.");

	const reply = await socket.request({ method: "start", args: [{ ...opts, prompt }] });
	if (reply?.error) throw new Error(reply.error);
	return reply;
}

export default ask;
