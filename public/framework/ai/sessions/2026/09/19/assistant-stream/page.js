import { Page, View, div, h1, p, span, button, textarea, pre } from "/app.js";
import Dictate from "/framework/ux/Dictate/Dictate.js";
import { stream, typewriter } from "/framework/ext/Ask/stream.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";

View.stylesheet(import.meta, "demo.css");

/* THE STREAM, shown rather than told — ai/2026-09-19/assistant-stream/requirements.md.
 * Two live boxes for one reply: the LEFT one fills from `ask_chunk`, the rpc straight to
 * this tab (`ext/Ask/stream.js`); the RIGHT one fills from tailing `scratch-board.jsonl`,
 * the shared log any tab, the mastermind or a minion can write to (the coordinator's
 * addition to this task, 2026-09-19) — the file this private proof server points at
 * instead of the real board, via `ASSISTANT_BOARD` (see `Server/plugins/Assistant.js`).
 * Comparing when each box's first real word appears is exactly "first chunk via the rpc
 * vs first chunk via the tailed file" from that addition. */

class Board extends JSONL {
	static verbs = [...JSONL.verbs, "card", "chunk"];
	cards = new Map();
	card(v){ this.cards.set(v.id, { ...this.cards.get(v.id), ...v }); }
	chunk(v){ this.cards.set(v.id, { ...this.cards.get(v.id), text: (this.cards.get(v.id)?.text ?? "") + v.text }); }
	reset(){ this.cards = new Map(); return super.reset(); }
}

// Measured 2026-09-19, tiny prompts ("is the dev server on port 80 running?", one short
// sentence), --effort low, three runs per row — full numbers and the decision this
// picked are in this task's own log (Decisions tab).
const TIMING_ROWS = [
	["Sonnet, system prompt, fresh session", "3528 / 4162 / 2132", "≈3274", "≈14114 (two long replies)"],
	["Haiku, system prompt, fresh session", "6729 / 9165 / 5456", "≈7117", "≈7787"],
	["Sonnet, persona as the first message, fresh", "3514 / 3437 / 2343", "≈3098", "≈4199"],
	["Sonnet, system prompt, RESUMED session", "2350 / 3546 / 3417", "≈3104", "≈5572"],
];

export default new Page({
	meta: import.meta,
	title: "The assistant, streaming",
	description: "The owner's words land the instant they're sent; the reply types itself out, word by word, as the model generates it — proved live on this page.",
	icon: "bolt",

	content(){
		p("This page proves one thing: a reply from Claude can appear on screen while it is still being written, instead of all at once when it finishes. Type or dictate something small below and press Send. Two boxes fill in — the left one straight from the server over the socket, the right one from a shared log file any of the mastermind, a minion, or this page can write lines to. Both should start typing within a couple of seconds.");

		let $ta, $sent, $reply_box, $first_ms, $total_ms, $tail_box, $tail_first_ms, $send_btn;

		div.c("as-sect", () => {
			h1.c("as-h2", "1. Talk or type");
			p("Press the mic and talk, or just type — either lands in the box below.");
			div.c("flex gap v-center wrap", () => {
				new Dictate({ $input: () => $ta });
				$ta = textarea.c("as-input").attr("rows", "2").attr("placeholder", "ask something small — this costs real tokens").attr("id", "as-ta");
			}).style("--gap", "0.6em");
			$send_btn = button.c("as-send prim", "Send").attr("type", "button").attr("id", "as-send").click(() => send());
		});

		div.c("as-sect", () => {
			h1.c("as-h2", "2. The reply, typed out — straight over the socket");
			p("This is `stream()` from `ext/Ask/stream.js`, talking to the same dev-server bridge `ask()` always has, with one new flag that makes the CLI hand back words as it writes them instead of all at once.");
			$sent = div.c("as-sent muted").attr("id", "as-sent");
			$reply_box = div.c("as-reply").attr("id", "as-reply-rpc");
			div.c("as-timing muted", () => {
				span("first chunk: "); $first_ms = span.c("as-num").attr("id", "as-first-ms").text("—");
				span(" · whole reply done: "); $total_ms = span.c("as-num").attr("id", "as-total-ms").text("—");
			});
		});

		div.c("as-sect", () => {
			h1.c("as-h2", "3. The same reply, from the shared log");
			p("The server ALSO writes the owner's words and the growing reply as lines on a shared board — the same file the mastermind, a minion, or the dev bar's own timeline can read live. This box is reading only that file, over a completely different path than box 2. Watch which one shows the first word first.");
			$tail_box = div.c("as-reply").attr("id", "as-reply-tail");
			div.c("as-timing muted", () => {
				span("first chunk via the tailed file: "); $tail_first_ms = span.c("as-num").attr("id", "as-tail-first-ms").text("—");
			});
		});

		div.c("as-sect", () => {
			h1.c("as-h2", "4. The numbers");
			p("Time from sending a message to the first word landing on screen, for four ways the CLI can be asked to run the assistant. Small sample (three tiny turns each) — enough to pick a default, not a scientific study.");
			div.c("as-table", () => {
				["configuration", "first chunk, 3 runs (ms)", "avg first chunk", "avg whole reply"].forEach(t => span.c("as-th", t));
				TIMING_ROWS.forEach(row => row.forEach(cell => span(cell)));
			});
			p.c("as-recommend", "Shipped default: Sonnet, the persona as a system prompt, ONE session resumed per browser tab — first-chunk speed is a tie with the alternatives, but a resumed session finished its WHOLE reply in 4–8.5s against 3–22s fresh (the CLI re-paying its own startup cost every time). That's what `Server/plugins/Assistant.js` does.");
		});

		div.c("as-sect", () => {
			h1.c("as-h2", "5. Can the assistant ring the mastermind directly?");
			p("Yes — tested once, live, against the real running mastermind session. A headless turn given only the `SendMessage` tool (`--tools SendMessage`) called it successfully: the tool answered `{success:true}` and the mastermind's own session received a message clearly marked as an automated capability test. So a headless turn CAN reach the mastermind directly and not only through the shared inbox file — but this preset does not do that by default, because the SERVER already writes the relay line at the end of every turn (see `Assistant.relay()`), which is simpler, cheaper (no extra tool call) and does not depend on the mastermind's session still being the one named — the doorbell works, the inbox line is what actually ships.");
		});

		div.c("as-sect", () => {
			h1.c("as-h2", "6. Wiring this into the dev bar's composer");
			p("Three lines for whoever builds the real composer (dev/DevBar/**, a sibling's own fence):");
			pre.c("as-code", `import { stream, typewriter } from "/framework/ext/Ask/stream.js";
const view = typewriter($replyBox.el);   // an element you already have on screen
stream({ preset: "assistant", prompt, on_chunk: e => view.chunk(e.text), on_done: e => view.done() });`);
			p("That's the whole client side — the owner's words and the reply are already landing on the shared board from the server, so the dev bar's own board reader (whatever renders `board.jsonl` today) shows the conversation with no other wiring.");
		});

		const board = new Board({ url: import.meta.resolve("./scratch-board.jsonl") });
		let watching_id = null, sent_at = 0, tail_seen = false;
		board.live(() => {
			if (!watching_id) return;
			const c = board.cards.get(watching_id);
			if (!c) return;
			$tail_box.text(c.text ?? "");
			if (c.text && !tail_seen){ tail_seen = true; $tail_first_ms.text(Math.round(performance.now() - sent_at) + "ms"); }
		});

		async function send(){
			const prompt = $ta.el.value.trim();
			if (!prompt || $send_btn.el.disabled) return;

			$ta.el.value = "";
			$send_btn.el.disabled = true;
			sent_at = performance.now();
			watching_id = null;
			tail_seen = false;

			$sent.text(prompt);   // the owner's words, on screen the instant Send is pressed
			$reply_box.text("");
			$tail_box.text("");
			$first_ms.text("—"); $total_ms.text("—"); $tail_first_ms.text("—");

			const view = typewriter($reply_box.el);

			await stream({
				preset: "assistant",
				prompt,
				on_chunk: e => { view.chunk(e.text); if (e.board_id) watching_id = e.board_id; },
				on_done: e => {
					view.done();
					if (e.board_id) watching_id = e.board_id;
					$first_ms.text(e.ms_to_first_chunk != null ? e.ms_to_first_chunk + "ms" : "—");
					$total_ms.text(e.ms_total != null ? e.ms_total + "ms" : "—");
					if (e.error) $reply_box.text("Something went wrong: " + e.error);
					$send_btn.el.disabled = false;
				},
				on_error: e => {
					view.done();
					$reply_box.text("Could not reach the bridge: " + e.message);
					$send_btn.el.disabled = false;
				},
			});
		}
	},
});
