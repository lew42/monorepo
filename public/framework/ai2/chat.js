import { div, p, span } from "/app.js";

/**
 * EVERY CARD IS A CHAT ROOM (the owner, 2026-09-23: "each page is a chat room,
 * with a log, by default"). The footer at the bottom of a card's page shows its
 * own log, `cards/<slug>`, as a conversation: your words, every agent's reply,
 * and — on the Live card — each update, one quiet line.
 *
 * APPEND, NEVER REWRITE. A line is drawn once and never moves: `seen` is every
 * entry already on screen, so `sync()` can be called as often as anything
 * changes. Your own words appear the instant the microphone settles them
 * (`echo()`), and the copy Servex logs back a second later is matched on the
 * WORDS and skipped — whisper re-guesses punctuation, so `===` would show every
 * sentence twice.
 *
 * `source()` is the entries to show, asked fresh each time; `keep(e)` says
 * which of them belong here — a card shows its own lines, a sub-card only the
 * ones spoken into it.
 */
const norm = t => String(t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const WHO = { owner: "you", "assistant-fast": "assistant", "master-assistant-master": "master assistant" };
const key = e => [e.type, e.id, e.at, e.ref, e.text].join("|");

export function chat({ source, keep = () => true }){
	let $script, $partial;
	const seen = new Set(), echoes = [];

	const view = div.c("ai2-script", $s => {
		$script = $s;
		$partial = p.c("ai2-said-partial muted");
	});

	function add(cls, who, text){
		if (!text) return;
		$script.append(() => {
			p.c("ai2-chat " + cls, () => {
				if (who) span.c("ai2-chat-who").text(who);
				span.c("ai2-chat-text").text(text);
			});
		});
		// `appendChild` MOVES the grey guess back to the end, under the new line.
		$script.el.appendChild($partial.el);
		$script.el.scrollTop = $script.el.scrollHeight;
	}

	function draw(e){
		if (e.type === "prompt"){
			const text = (e.sentences ?? [e.text]).filter(Boolean).join(" ");
			const i = echoes.indexOf(norm(text));
			if (i >= 0) return void echoes.splice(i, 1);
			return add("ai2-chat-you", "you", text);
		}
		if (e.type === "reply") return add("ai2-chat-reply", WHO[e.by] ?? e.by ?? "agent", e.text);
		if (e.type === "update") return add("ai2-chat-update", "", e.text);
		if (e.type === "task") return add("ai2-chat-update", "task", `${e.title ?? e.id}: ${e.state}${e.now ? " — " + e.now : ""}`);
		if (e.type === "clear") return add("ai2-chat-update", "", `${WHO[e.by] ?? e.by ?? "someone"} cleared ${e.ref}`);
	}

	return {
		view,
		/** Your words, the instant they exist — before Servex has logged them. */
		echo(text){
			const t = String(text ?? "").trim();
			if (!t) return;
			echoes.push(norm(t));
			add("ai2-chat-you", "you", t);
		},
		/** The still-moving guess, grey, rewritten in place so it adds no line. */
		partial(text){
			$partial.text(text ?? "");
			$script.el.scrollTop = $script.el.scrollHeight;
		},
		sync(){
			const fresh = source().filter(e => {
				const k = key(e);
				if (seen.has(k)) return false;
				seen.add(k);
				return keep(e);
			});
			fresh.sort((a, b) => Date.parse(a.at ?? 0) - Date.parse(b.at ?? 0)).forEach(draw);
		},
	};
}

export default chat;
