import { View, div, textarea, button, small } from "/app.js";
import { ComposerMic, SETTINGS, CLEAN_CHANGED_EVENT } from "./Mic.js";

View.stylesheet(import.meta, "Chat.css");

/**
 * ONE LINE. A box you type in, the microphone beside it, Send after it, and
 * everything else folded behind a `⋯` (the owner, 2026-09-22: "the area on top
 * with the text input is massive… it's taking a third of my screen").
 *
 * IT NEVER GROWS BEYOND A CEILING, and that is a requirement, not a detail: rows
 * sit under it, so a composer that gains a line pushes everything down. What
 * `ux/Dictate` draws that does not shrink — its engine name, its status, its
 * "stop after a pause" checkbox — lives in a popover positioned OUT OF FLOW.
 *
 *     composer({ deliver: async entry => (await post(entry)).ok, re: () => "card-1" })
 *
 * `deliver(entry)` is how a message leaves — the entry is
 * `{ at, type: "prompt", by: "owner", text, via, re?, selected? }` and the answer
 * is true when it went. `re()` is asked fresh on every send, never captured, so
 * the target can change under a composer that stays put. `on_text(text)` is how
 * a caller shows the words the instant they exist, before anything has logged
 * them. `mic: false` makes a typed-only box. `autostart` opens the mic after a
 * quarter second.
 */
const MAX_PROMPT = 20000;   // one message is never legitimately longer; a runaway box is refused, not sent

export function composer({
	deliver, re = () => null, on_text, mic: with_mic = true, autostart, max = MAX_PROMPT,
	placeholder = "say something", hint = "", sent = "sent", failed = "nothing was sent",
	revise = false,   // "clean" | "edit" | "summary" | false (default) — forwarded to `ux/Dictate`'s own option, ai/2026-09-29/audio/
} = {}){
	let $box, $input, $note, $raw_btn, mic;

	const view = div.c("chatbox-compose", () => {
		div.c("chatbox-field", $f => {
			$box = $f;
			// `.auto` = `field-sizing: content` (framework.css, util layer): the box grows with the text.
			$input = textarea().attr("rows", "2").ac("auto chatbox-compose-input").attr("placeholder", placeholder);

			if (with_mic) mic = new ComposerMic({
				re,
				deliver,
				on_text: text => on_text?.(text),
				revise,
				field: $input,
				on_error: e => note(String(e?.message ?? e)),
				// Deliverable 2 - "if Servex/tidy fails, send raw and say so in the hint line":
				// ComposerMic calls this at most ONCE per send (`notify_if_failed()` - review
				// finding 5, a string of failed chunks used to repeat this line once each,
				// before anything had actually gone out), right before the message leaves -
				// "will send raw", not "sent raw".
				on_clean_failed: why => note("clean-up isn't answering - will send raw (" + why + ")"),
			}).ac("chatbox-mic");
		});

		button.c("chatbox-compose-send prim").attr("type", "button").text("Send").click(send);

		// Everything that does not fit on one line. `.open` is toggled here and
		// the popover is positioned out of flow, so opening it moves nothing.
		if (with_mic) button.c("chatbox-compose-more").attr("type", "button").attr("title", "engine, microphone and status")
			.text("⋯").click(() => view.el.classList.toggle("open"));
		if (with_mic) button.c("chatbox-compose-more").attr("type", "button").attr("title", "dictation settings")
			.text("⚙").click(() => mic?.gear?.());
		// Deliverable 3 - "dig back": one small toggle shows exactly what Whisper produced,
		// in place of the clean-up, for whatever is currently in the box. Only worth showing
		// on a composer that asked for a revise: level at all - a plain box has no raw/clean
		// split to dig into. Review finding 7: it must also HIDE the instant the gear's
		// "clean" kill switch is off, since toggling it then would show raw = clean (nothing
		// to dig into, nothing to show) - `SETTINGS.clean` decides its hidden state, both up
		// front and live, via `CLEAN_CHANGED_EVENT` (the one way a plain DOM node outside the
		// mic hears that ONE setting change - `Mic.js`'s own settings_panel() fires it).
		if (with_mic && revise) $raw_btn = button.c("chatbox-compose-more chatbox-compose-raw").attr("type", "button")
			.attr("title", "show exactly what Whisper heard, before the clean-up")
			.text("raw").click(() => $raw_btn.el.classList.toggle("active", mic?.toggle_raw()));
		if ($raw_btn){
			$raw_btn.el.hidden = !SETTINGS.clean;
			document.addEventListener(CLEAN_CHANGED_EVENT, function on_clean_changed(e){
				if (!$raw_btn.el.isConnected) return document.removeEventListener(CLEAN_CHANGED_EVENT, on_clean_changed);
				$raw_btn.el.hidden = !e.detail;
				if (!e.detail) $raw_btn.el.classList.remove("active");
			});
		}

		$note = small.c("chatbox-compose-note muted").text(hint);
	});

	/* The popover IS Dictate's own info block — the engine, the status and the
	   "stop after a pause" box — MOVED out of the one-line row rather than hidden
	   or copied. One node, so it cannot disagree with the microphone it describes. */
	const $info = mic?.el.querySelector(".ux-dictate-info");
	if ($info) view.el.appendChild($info);

	if (mic) view.el.appendChild(mic.settings_panel());
	$input.on("keydown", e => { if (e.key === "Enter" && !e.shiftKey){ e.preventDefault(); send(); } });

	async function send(){
		const msg = $input.el.value.trim();
		// The box is everything on screen, the moving guess included; an empty box says so, never a silent nothing.
		if (!msg) return note("nothing to send — the box is empty");
		if (msg.length > max) return note("That is " + msg.length + " characters — over the " + max + " limit, so nothing was sent. Trim it and press Send again.");
		mic?.consume_sent();
		$input.el.value = "";
		const entry = { at: new Date().toISOString(), type: "prompt", by: "owner", text: msg, via: "typed" };
		const target = re();
		if (target){ entry.re = target; entry.selected = target; }
		on_text?.(msg);
		note("sending…");
		let ok = false;
		try { ok = await deliver?.(entry); } catch (e){ console.error("chat: Send failed", e); }
		note(ok ? sent : failed);
	}

	/* ⚠ The status goes in the PLACEHOLDER as well as the folded note, because a
	   note nobody can see is not feedback. The placeholder is inside a
	   fixed-height box, so saying something there cannot move anything. */
	function note(text){
		$note.text(text);
		$input.attr("placeholder", text);
		setTimeout(() => {
			if (!$input.el.isConnected) return;
			$input.attr("placeholder", placeholder);
		}, 4000);
	}

	// A new target opens listening, unless the caller turned that off.
	if (autostart && mic) setTimeout(() => { try { mic.toggle(); } catch (e){ note(String(e?.message ?? e)); } }, 250);

	return Object.assign(view, { mic, $input });
}

export default composer;
