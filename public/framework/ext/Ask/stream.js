import Socket from "/framework/dev/Socket/Socket.js";
import { edit } from "./edit.js";

const listeners = new Map();

/* ⚠ Called BY the dev server, through `Socket.message()`'s method lookup — same live
   path as `Ask.js`'s own `ask_event` and `Socket.reload()`. A grep for callers in
   `public/` finds none. */
Socket.prototype.ask_chunk = function(e){ listeners.get(e.turn)?.on_chunk?.(e); };
Socket.prototype.ask_done = function(e){ listeners.get(e.turn)?.on_done?.(e); listeners.delete(e.turn); };

/**
 * One STREAMING turn of a Claude Code session — the same bridge `ask()` uses
 * (`ext/Ask/Ask.js`, `Server/plugins/Ask.js`), with one difference: the server adds
 * `--include-partial-messages` to the spawn, so the reply's text arrives a few words
 * at a time, as the model generates it, instead of all at once when the turn ends.
 *
 *     stream({
 *         preset: "assistant",
 *         prompt: "what's running right now?",
 *         on_chunk: e => append(e.text),                  // fires many times
 *         on_done:  e => finish(e.text, e.ms_to_first_chunk, e.ms_total),  // fires once
 *         on_error: e => show(e.message),                 // the bridge itself isn't there
 *     });
 *
 * `preset` names a server-side turn configuration — today just `"assistant"`: Sonnet,
 * the lowest effort the CLI offers, no tools, and its own persona, resumed as ONE
 * session per browser tab that the server remembers for you (nothing to pass back in
 * on the next call). Leave `preset` out and pass `model`/`tools`/`resume` yourself for
 * an ordinary streaming turn with no persona attached.
 *
 * `on_done`'s event carries the two numbers the demo page shows: `ms_to_first_chunk`
 * (send to the first word on screen) and `ms_total` (send to the whole reply done).
 *
 * ⚠ Rejects off localhost, or with edit mode off in the dev rail — same as `ask()`.
 * Guard with `edit()` (re-exported from `ext/Ask/edit.js`) and render the fallback;
 * never let a page depend on this.
 */
export async function stream({ preset, prompt, model, tools, resume, task, context, on_chunk, on_done, on_error } = {}){
	const turn = crypto.randomUUID();
	listeners.set(turn, { on_chunk, on_done });

	if (!edit()){
		listeners.delete(turn);
		on_error?.(new Error("stream(): no dev server, or edit mode is off — the bridge is localhost only."));
		return turn;
	}

	try {
		const socket = Socket.singleton();
		const reply = await socket.request({ method: "ask",
			args: [{ id: turn, preset, prompt, model, tools, resume, task, context, stream: true }] });
		// A turn-level failure (a bad model name, a spawn error) still resolves
		// normally and reaches `on_done` as `{error}` — this catch is only for the
		// request itself never coming back (the socket was never there at all).
		if (!reply) throw new Error("stream(): the dev socket did not answer.");
	} catch (e){
		listeners.delete(turn);
		on_error?.(e);
	}

	return turn;
}

/**
 * A tiny append-only view: text arrives one chunk at a time and is only ever ADDED,
 * never re-rendered — the screen-write effect the owner asked for, and the one shape
 * that is safe to update from a stream (nothing to diff, nothing to lose mid-word). A
 * blinking caret shows while the reply is still coming; `done()` removes it. The
 * blink itself lives in CSS behind `prefers-reduced-motion`, never in this file — so
 * on a reduced-motion system the caret just sits still, and either way the TEXT is
 * always simple appending, animated or not.
 *
 *     const view = typewriter($reply.el);
 *     stream({ prompt, on_chunk: e => view.chunk(e.text), on_done: () => view.done() });
 */
export function typewriter(el){
	el.textContent = "";
	const caret = document.createElement("span");
	caret.className = "ask-stream-caret";
	el.append(caret);

	return {
		chunk(text){ caret.before(document.createTextNode(text ?? "")); },
		done(){ caret.remove(); },
	};
}

export default stream;
