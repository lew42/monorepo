import { div, button, p, small } from "/app.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { edit } from "/framework/ext/Ask/edit.js";

/**
 * `ask_controls()` — a prompt card's own Yes/No (or option-card) buttons, wired
 * to the server and back.
 *
 * COPIED HERE, not imported from a task dir (2026-09-19, `v3-timeline`, item 4):
 * this is `ai/2026-09-19/card-replies/ask.js`, byte-for-byte, moved into `v/3/`
 * — its own task log says "the smallest render ... which the V3 minion can lift
 * straight into the real dashboard cards." A dated task folder is a throwaway
 * demo dir (this whole realm's own convention — scratch boards, one-off shots,
 * proof scripts), not somewhere a live page should import from for the rest of
 * its life; a future cleanup of that folder would 404 this page's own JS. `v/3/`
 * is this feature's real, permanent home, the same reason `compose.js` lives
 * here instead of inside whichever task first built it.
 *
 * The one thing this depends on that lives OUTSIDE this file: the server side,
 * `Server/plugins/CardAnswer.js` (out of this task's fence, already landed and
 * wired into `Server/run.js` by `card-replies`) — its own `card_answer {id,
 * answer}` rpc appends the answer onto the SAME card id, relays a line to the
 * mastermind's inbox, and rings the session named on the card (`ask_to`), all
 * before this function's own promise resolves once (the rpc ack) and again once
 * (the ring's own outcome, pushed back as `card_rung`).
 *
 * `card` is one line off a board file: `{id, ask, ask_to, …}` — `ask` is either
 * a flat list of short words (`["yes","no"]`, plain buttons) or a list of
 * `{label, note}` (small `.card`s, `say.mjs`'s own `--ask "Label|note;…"` form).
 */
const ring_listeners = new Map();
Socket.prototype.card_rung = function(e){ ring_listeners.get(e.id)?.(e); ring_listeners.delete(e.id); };

export function ask_controls(card, on_answer){
	const options = (card.ask || []).map(o => typeof o === "string" ? { label: o } : o);
	const flat = options.every(o => o.note === undefined);
	let $box;

	const $view = div.c("v3-ask" + (flat ? "" : " v3-ask-options"), $b => {
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
