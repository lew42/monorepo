import { div, button, p, small } from "/app.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { edit } from "/framework/ext/Ask/edit.js";

// ⚠ Called BY the server — Server/plugins/CardAnswer.js pushes this once the ring (the
// headless SendMessage turn) finishes, win or lose, so a page can show how long the
// SECOND hop took, not just the rpc ack. Same live pattern as ext/Ask/stream.js's own
// ask_chunk/ask_done: a grep for callers in public/ finds none, because Socket.message()
// calls it by name off the wire.
const ring_listeners = new Map();
Socket.prototype.card_rung = function(e){ ring_listeners.get(e.id)?.(e); ring_listeners.delete(e.id); };

/**
 * ask_controls(card, on_answer) — the smallest render of a question card's buttons (or
 * option cards), wired to the server and back. `card` is one line off a board file:
 * `{id, ask, ...}` — `ask` is either a flat list of short words (`["yes","no"]`, drawn
 * as plain buttons) or a list of `{label, note}` (drawn as small `.card`s you click
 * anywhere on — say.mjs's `--ask "Label|note;Label|note"` form).
 *
 * A click sends `{id, answer}` over the dev socket's `card_answer` rpc — the server
 * appends the answer to the board, tells the mastermind's inbox, and rings the session
 * named on the card (`ask_to`) — then this swaps the buttons for "you answered: … · time".
 *
 * `on_answer(answer, timing)` fires TWICE per click: once the instant the rpc acks
 * (`timing: {ack_ms}`), and again once the ring itself finishes (`timing: {ack_ms,
 * ring_ms, ok}`) — a page that only cares about the answer can ignore the second call.
 *
 * This is the whole client side a real board reader needs — three lines, the same shape
 * as ext/Ask/stream.js's own doc comment:
 *
 *     import { ask_controls } from "…/ask.js";
 *     ask_controls(card, (answer, timing) => console.log(card.id, "->", answer, timing));
 */
export function ask_controls(card, on_answer){
	const options = (card.ask || []).map(o => typeof o === "string" ? { label: o } : o);
	const flat = options.every(o => o.note === undefined);
	let $box;

	const $view = div.c("card-replies-ask" + (flat ? "" : " card-replies-options"), $b => {
		$box = $b;
		options.forEach(draw);
	});

	function draw(opt){
		if (flat){
			button().attr("type", "button").text(opt.label).click(() => answer(opt.label));
		} else {
			div.c("card").attr("tabindex", "0").click(() => answer(opt.label)).append(() => {
				p(opt.label);
				if (opt.note) small(opt.note);
			});
		}
	}

	function answer(value){
		if (!edit()){ $box.append(p.c("muted", "dev socket is off — nothing to send this to.")); return; }

		const clicked = performance.now();
		Socket.singleton().request({ method: "card_answer", args: [{ id: card.id, answer: value }] })
			.then(reply => {
				const ack_ms = Math.round(performance.now() - clicked);
				done(value);
				on_answer?.(value, { ack_ms });
				ring_listeners.set(card.id, e => on_answer?.(value, { ack_ms, ring_ms: Math.round(performance.now() - clicked), ok: e.ok, error: e.error }));
			});
	}

	function done(value){
		const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
		$box.empty(() => { small(`you answered: ${value} · ${time}`); });
	}

	return $view;
}

export default ask_controls;
