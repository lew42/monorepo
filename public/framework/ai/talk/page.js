import { Page, View, div, p, span, button, a } from "/app.js";
import Dictate from "/framework/ux/Dictate/Dictate.js";
import { prompt_stream } from "/framework/ai/v/3/prompts.js";

View.stylesheet(import.meta, "talk.css");

/**
 * TALK — press the mic, talk, see your words, in one card that never jumps.
 *
 * The owner's own words (2026-09-22): "I push the microphone button and I talk
 * and I see my words on the screen… I want a new card on my AI dashboard where
 * I can talk to it and then see that card updating in real time. Without shit
 * jumping around."
 *
 * So there are exactly two things on this page. A big microphone button at the
 * top, and under it one card. You talk; the card fills. Nothing else moves.
 *
 * **Where the words come from.** `ux/Dictate` is the microphone — it records,
 * re-sends the growing sentence to whisper running on this machine about twice
 * a second, and hands back two kinds of text: a GUESS that is still changing
 * (`draw_caption()`), and a FINISHED sentence (`on_text`). `TalkMic` below is a
 * four-line subclass that redirects the guess into this page's card instead of
 * Dictate's own little caption strip. Dictate itself is never edited.
 *
 * **Where the heading and the chips come from.** Every finished sentence is
 * also posted to Servex's prompt log, and within about two seconds the fast
 * assistant answers it with a `card` line (a title for the idea) and `name`
 * lines (the things you named). This page listens to that same live stream
 * `v/3/prompts.js` already opens — one connection, shared — and puts the title
 * in the card's heading and the names in the chips under the text, IN PLACE.
 *
 * **Why nothing jumps** — the one requirement, and the reason for the shape:
 *   - the head is a FIXED-HEIGHT box and the microphone inside it is taken out
 *     of flow (`talk.css`), so Dictate saying "listening…", naming an engine,
 *     or printing a two-line error can never push the card down;
 *   - the heading and the chip row are drawn EMPTY from the very first frame
 *     and hold their own height, so the assistant's answer arriving later fills
 *     them instead of inserting them;
 *   - the heading is held to one line, so a long title cannot wrap and grow;
 *   - text only ever APPENDS, below what is already there, and this page never
 *     scrolls the reader on its own.
 * Measured five times during a live dictation: the card's top edge sat at the
 * same y every time — `doc/no-jump.md`.
 */

/** Two pieces of text are "the same sentence" when they say the same words —
 *  whisper's own punctuation and leading space drift between the copy this page
 *  committed and the copy Servex logged, so a raw `===` would miss the match. */
const norm = t => String(t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** **What a Servex line is answering**, always as a list. The `re` back-pointer
 *  is a bare id on a `name` line and an ARRAY of ids on a `card` line (the
 *  assistant can title one idea it read across several sentences at once) —
 *  measured on the live log, 2026-09-22, and reading it as a bare string alone
 *  silently dropped every title. Both shapes flatten to the same list here, so
 *  nothing downstream has to know which kind of line it is holding. */
const refs = e => (Array.isArray(e?.re) ? e.re : e?.re ? [e.re] : []);

/**
 * ONE CARD — a session's worth of talking. It is a plain `.card`, so it is
 * already padded, already spaced, already has an edge; everything below is only
 * the four regions and how text gets into them.
 */
class TalkCard extends View {

	render() {
		this.ac("card");
		this.ids = new Set();     // the Servex prompt ids the sentences in this card became
		this.said = [];           // every finished sentence, in order
		this.last_commit = 0;     // when the newest one landed — the stream fallback reads it
		this.card_id = null;      // the assistant's own id for this idea — what a `task` line's `re` points at

		// Drawn empty and holding its own height from the first frame: the
		// assistant's title arrives a second or two later and FILLS this, so
		// nothing below it ever moves down to make room.
		this.$title = div.c("talk-title muted").text(this.waiting);
		// Hidden until a `task` line exists at all — a card nobody asked to be
		// built shows no strip, not an empty one.
		this.$task = div.c("talk-task").hide();
		this.$said = div.c("talk-said flex v gap-25");
		this.$partial = p.c("talk-partial muted");
		this.$chips = div.c("talk-chips flex wrap gap-25");
	}

	/** The still-changing guess, in grey, under the finished sentences. Empty
	 *  text collapses the line (`talk.css`), so an idle card shows no stray row. */
	partial(text) { this.$partial.text(text ?? ""); }

	/** One finished sentence, in the page's own ink, appended below the last. */
	commit(text) {
		if (!text) return;
		this.said.push(text);
		this.last_commit = Date.now();
		this.$said.append(() => { p.c("talk-line").text(text); });
	}

	/** Did this card say that? — how an arriving Servex `prompt` line finds the
	 *  card whose sentence it is, so its answers land in the right place. */
	owns(text) { return this.said.some(s => norm(s) === norm(text)); }

	/** The assistant's title for what was said becomes this card's heading —
	 *  in place, never a second card. Held to one line by `talk.css`; the whole
	 *  title is still readable on hover. */
	headline(e) {
		this.card_id = e.id ?? this.card_id;
		const title = e.title ?? "";
		if (!title) return;
		// `.md()` so a page mention the assistant wrapped in a link
		// (`[AI 2](/framework/ai2/)`) renders as a real, clickable link.
		this.$title.rc("muted").md(title).attr("title", title);
	}

	/** One thing the assistant heard you name, as a chip under the text. */
	chip(e) {
		const name = e.name ?? e.id;
		if (!name || this.chips_shown?.has(name)) return;
		(this.chips_shown ??= new Set()).add(name);
		this.$chips.append(() => {
			span.c("talk-chip", () => {
				span.c("talk-chip-name").text(name);
				if (e.kind) span.c("talk-chip-kind muted").text(e.kind);
			});
		});
	}

	/** THE STATUS STRIP — a mastermind took this card and is running with it.
	 *  `e.state` is `queued`, `working`, `blocked` or `landed`; `e.now` is its
	 *  one-line progress, and once landed that line names the page's own url,
	 *  which this pulls out and turns into a real link. Redrawn in place every
	 *  time a new `task` line for the same id arrives — never a second strip. */
	task(e) {
		const state = e.state ?? "queued";
		["queued", "working", "blocked", "landed"].forEach(s =>
			this.$task.el.classList.toggle("talk-task-" + s, s === state));
		this.$task.show().empty(() => {
			span.c("talk-task-dot");
			const now = e.now ?? "";
			const url = state === "landed" && now.match(/https?:\/\/\S+|\/[a-z0-9][\w-]*(?:\/[a-z0-9][\w-]*)+\/?/i)?.[0];
			span.c("talk-task-label").text(this.task_label(state, now, url));
			if (url) a.c("talk-task-link").href(url).text(url);
		});
	}

	task_label(state, now, url) {
		if (state === "queued") return "queued — waiting for a free mastermind";
		if (state === "working") return now || "a mastermind is working on it…";
		if (state === "blocked") return "blocked — " + (now || "stuck");
		return "landed" + (url ? " —" : now ? " — " + now : "");   // the url prints as its own link, next to this
	}
}

TalkCard.prototype.waiting = "listening…";

/**
 * THE MICROPHONE, unchanged except for where its words go. `ux/Dictate` draws
 * its own caption strip under the button; on this page the words belong in the
 * card, so `draw_caption()` — the one method Dictate calls every time the guess
 * changes — is redirected and Dictate's own strip simply stays empty.
 */
class TalkMic extends Dictate {
	draw_caption() { this.on_partial?.(this.partial_text); }
}
TalkMic.prototype.mode = "open";   // the live open mic: stays on, no box to write into anyway

/**
 * THE PAGE. `card` is always the one being talked into; pressing "New card"
 * finishes it (it stays exactly where it is) and starts a fresh one underneath.
 */
function talk(page) {
	const cards = [];
	let $cards, card;

	const fresh = () => {
		$cards.append(() => { card = new TalkCard(); });
		cards.push(card);
	};

	div.c("talk-page", () => {
		// FIXED HEIGHT, and the microphone inside it is out of flow — see
		// `talk.css`. This box is the whole reason the card below never moves.
		div.c("talk-head", () => {
			new TalkMic({
				on_partial: text => card.partial(text),
				on_text: text => card.commit(text),
			});
			button.c("talk-new").attr("type", "button")
				.attr("title", "Finish this card and start a fresh one below it — nothing already said is ever removed")
				.text("New card")
				.click(() => fresh());
		});
		$cards = div.c("talk-cards flex v gap");
	});

	fresh();
	from_assistant(cards);
}

/**
 * WHAT THE ASSISTANT MADE OF IT, live. `prompt_stream()` is `v/3/prompts.js`'s
 * own single shared connection to Servex — subscribing here opens no second
 * socket — and `stream.on()` fires only for lines that arrive from now on,
 * which is exactly what this page wants: it answers what you say while you are
 * on it, never the backlog.
 *
 * Four kinds of line matter, and they arrive in this order:
 *   1. `prompt` — your own sentence coming back with the id Servex gave it.
 *      The card that said it claims that id (matched on the words themselves).
 *   2. `card` — the assistant's title for the idea, pointing back at that id.
 *   3. `name` — one thing you named, pointing back the same way.
 *   4. `task` — only when the card asked for something built. It points back
 *      at the CARD's own id, not the prompt's, because a task hangs off the
 *      idea, not the sentence — matched on `card_id`, which `headline()`
 *      remembers the moment the card's title arrives.
 * All four point back through `re`, but not in the same shape — `refs()`
 * above is the one place that knows it.
 *
 * If Servex is not running at all, `stream.ready` still resolves and nothing
 * here ever fires — the microphone and the card go on working exactly as they
 * do now, which is the whole point of keeping the two halves separate.
 */
function from_assistant(cards) {
	const stream = prompt_stream();
	stream.ready.then(() => stream.on(e => {
		if (e?.type === "prompt") return claim(cards, e);
		const answering = refs(e);
		if (e.type === "task") return cards.find(c => c.card_id && answering.includes(c.card_id))?.task(e);
		const card = answering.length && cards.find(c => answering.some(id => c.ids.has(id)));
		if (!card) return;
		if (e.type === "card") card.headline(e);
		else if (e.type === "name") card.chip(e);
	}));
}

/* Which card said this? The words, normally. The fallback is for the one case
   that bites: Servex logging a sentence back in a form `norm()` cannot match
   (a word whisper re-guessed between this page's copy and the log's). A
   dictated line that arrives within half a minute of a commit and belongs to no
   card by text goes to the card that just spoke — worst case a chip lands on
   the newest card instead of a card 30 seconds older, which is never wrong on a
   page you are talking into right now. */
function claim(cards, e) {
	const by_text = cards.find(c => c.owns(e.text));
	const recent = e.via === "whisper" && cards.find(c => Date.now() - c.last_commit < 30000);
	(by_text || recent || null)?.ids.add(e.id);
}

export default new Page({
	meta: import.meta,
	title: "Talk",
	icon: "mic",
	description: "Press the mic, talk, and watch one card fill with your words.",
	content() { talk(this); },
});

// Named on purpose so a proof can build one card and drive `.task()` through
// every state with no microphone in the way — the mic and the live stream
// are a different thing to prove than "does the strip render right".
export { TalkCard };
