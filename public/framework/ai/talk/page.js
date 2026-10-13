// history and reasons: doc/talk-page-notes.md

import { Page, View, div, p, span, button, a } from "/app.js";
import Dictate from "/framework/ux/Dictate/Dictate.js";
import { Prompts } from "/framework/ai/v/3/Prompts.js";

View.stylesheet(import.meta, "talk.css");

const norm = t => String(t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const refs = e => (Array.isArray(e?.re) ? e.re : e?.re ? [e.re] : []);

class TalkCard extends View {

	render() {
		this.ac("card");
		this.ids = new Set();
		this.said = [];
		this.last_commit = 0;
		this.card_id = null;

		this.$title = div.c("talk-title muted").text(this.waiting);
		this.$task = div.c("talk-task").hide();
		this.$said = div.c("talk-said flex v gap-25");
		this.$partial = p.c("talk-partial muted");
		this.$chips = div.c("talk-chips flex wrap gap-25");
	}

	partial(text) { this.$partial.text(text ?? ""); }

	commit(text) {
		if (!text) return;
		this.said.push(text);
		this.last_commit = Date.now();
		this.$said.append(() => { p.c("talk-line").text(text); });
	}

	owns(text) { return this.said.some(s => norm(s) === norm(text)); }

	headline(e) {
		this.card_id = e.id ?? this.card_id;
		const title = e.title ?? "";
		if (!title) return;
		// .md() renders page links (e.g. [AI 2](/framework/ai2/)) as clickable links
		this.$title.rc("muted").md(title).attr("title", title);
	}

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
		return "landed" + (url ? " —" : now ? " — " + now : "");
	}
}

TalkCard.prototype.waiting = "listening…";

class TalkMic extends Dictate {
	draw_caption() { this.on_partial?.(this.partial_text); }
}
TalkMic.prototype.mode = "open";

function talk(page) {
	const cards = [];
	let $cards, card;

	const fresh = () => {
		$cards.append(() => { card = new TalkCard(); });
		cards.push(card);
	};

	div.c("talk-page", () => {
		// talk-head is FIXED HEIGHT with mic out of flow (talk.css) — prevents card below from shifting
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

function from_assistant(cards) {
	const stream = Prompts.stream();
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

// Fallback: if Servex log form differs from this page's copy (whisper re-guesses), match by recency
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
