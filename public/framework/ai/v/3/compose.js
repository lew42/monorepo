import { View, div, textarea, button, small } from "/app.js";
import { stream } from "/framework/ext/Ask/stream.js";
import { edit } from "/framework/ext/Ask/edit.js";
import Dictate from "/framework/ux/Dictate/Dictate.js";

View.stylesheet(import.meta, "compose.css");

/**
 * composer() — the ONE box, type or dictate, that talks to the assistant.
 * Reused wherever a reply should show up live: the dev bar's mastermind log
 * (`dev/DevBar/says.js`) and the V3 Now view (`page.js`), which is why it
 * lives here rather than inside either caller.
 *
 * It only SENDS. It never renders the reply itself — `ai/2026-09-19/
 * assistant-stream/`'s own server writes the owner's words and the growing
 * reply straight onto `board.jsonl` (`card`/`chunk` lines), so whichever
 * board reader is on screen (the log, the Now view) already shows it typing
 * itself out with no extra wiring here. A `.card` reader is the one true
 * place "what was said" lives; a second copy in this box would just be one
 * more place for the two to disagree.
 *
 * Renders nothing when `edit()` is off (no dev socket, or the rail's edit
 * knob is off) — same rule every other editor control on the site follows
 * (`ext/Ask/edit.js`), and the reason a caller can just call `composer()` as
 * a bare statement: nothing to append, nothing to guard, when it can't send.
 */
export function composer({ placeholder = "talk to the assistant…" } = {}) {
	if (!edit()) return null;

	let $input, $note;
	const NOTE = "sends to the assistant — the reply types itself out above.";

	const $view = div.c("v3-compose flex v", () => {
		div.c("v3-compose-row flex v-center gap", () => {
			$input = textarea.c("v3-compose-input").attr("rows", "2").attr("placeholder", placeholder);
			new Dictate({ $input: () => $input, on_error: e => note(String(e?.message ?? e)) });
			button.c("v3-compose-send prim").attr("type", "button").text("Send").click(send);
		});
		$note = small.c("muted", NOTE);
	});

	$input.on("keydown", e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); });

	function send() {
		const msg = $input.el.value.trim();
		if (!msg) return;
		$input.el.value = "";
		note("sending…");
		stream({
			preset: "assistant",
			prompt: msg,
			on_done: e => note(e?.error ? "something went wrong — " + e.error
				: `replied in ${((e?.ms_to_first_chunk ?? 0) / 1000).toFixed(1)}s.`),
			on_error: e => note(String(e?.message ?? e)),
		});
	}

	function note(text) {
		$note.text(text);
		setTimeout(() => $note.el.isConnected && $note.text(NOTE), 4000);
	}

	return $view;
}

export default composer;
