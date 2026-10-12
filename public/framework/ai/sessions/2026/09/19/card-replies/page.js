import { Page, div, h2, p, small, pre } from "/app.js";
import { ask_controls } from "./ask.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";

/* CARDS THAT ASK YOU — shown, not told: ai/2026-09-19/card-replies/requirements.md.
 * The owner asked: if a card shows two buttons, or two option cards, and they pick
 * one, does the choice reach the right Claude session? This page is the answer, live —
 * press a button below and read what actually happened underneath it.
 *
 * Both cards are DATA, not markup: they come off scratch-board.jsonl, the same shape
 * say.mjs --ask writes onto the real dashboard (Server/plugins/Assistant.js's
 * ASSISTANT_BOARD override points a private test server at this file instead of the
 * real one). ask_to on this demo's two cards is a harmless made-up name, so pressing a
 * button here is always safe — the one REAL press, against the real running mastermind
 * session, was proved once by a headless script and is written up on the Docs tab. */

class Board extends JSONL {
	static verbs = [...JSONL.verbs, "card"];
	cards = new Map();
	card(v){ this.cards.set(v.id, { ...this.cards.get(v.id), ...v }); }
	reset(){ this.cards = new Map(); return super.reset(); }
}

function timing_line(answer, timing){
	if (timing.ring_ms == null) return `you answered "${answer}" — acked in ${timing.ack_ms}ms, ringing the session now…`;
	if (timing.ok === false) return `you answered "${answer}" — acked in ${timing.ack_ms}ms, but the ring failed after ${timing.ring_ms}ms (${timing.error || "no reason given"})`;
	return `you answered "${answer}" — acked in ${timing.ack_ms}ms, the session was rung ${timing.ring_ms}ms after the click`;
}

export default new Page({
	meta: import.meta,
	title: "Cards that ask you",
	description: "A dashboard card asks the owner a question with buttons, or two option cards — press one and watch the answer, the timing, and the ring all happen live.",
	icon: "touch_app",

	content(){
		p("Press a button on either card below. Each press does three things on the server, right away: it writes your answer back onto the card, it drops a line in the mastermind's inbox, and it rings a Claude session by name so a person doesn't have to notice the file changed. The small line under each card fills in with exactly how long that took.");

		div.c("card-replies-cards flow", async $cards => {
			const board = await new Board({ url: import.meta.resolve("./scratch-board.jsonl") }).load();
			const cards = [...board.cards.values()];

			$cards.append(() => {
				cards.forEach(card => {
					div.c("card", () => {
						h2(card.title);
						if (card.text) p(card.text);

						let $timing;
						ask_controls(card, (answer, timing) => $timing.text(timing_line(answer, timing)));
						$timing = small.c("muted");
					});
				});
				if (!cards.length) p.c("muted", "scratch-board.jsonl has no cards yet — nothing to press.");
			});
		});

		div.c("card-replies-reuse", () => {
			h2("Reusing this");
			p("This is the whole client side a real board reader needs — the same shape as `ext/Ask/stream.js`'s own doc comment:");
			pre(`import { ask_controls } from "…/ask.js";
ask_controls(card, (answer, timing) => console.log(card.id, "->", answer, timing));`);
			p("`card` is one line off a board file: `{id, ask, ask_to, …}`. The server side is one rpc, `card_answer {id, answer}` — `Server/plugins/CardAnswer.js`.");
		});
	},
});
