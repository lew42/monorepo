import { View, div, textarea, button, small } from "/app.js";
import { ComposerMic, SETTINGS, CLEAN_CHANGED_EVENT } from "./Mic.js";

View.stylesheet(import.meta, "Chat.css");

/**
 * ONE BOX ON TOP, FULL WIDTH; the mic, Send and one ⚙ menu button sit in ONE ROW
 * below it (one-dictation, 2026-10-01 — the owner, on a phone: "the text area was
 * kind of partial width and would grow really tall and then create this big void
 * of empty space… if the text area is gonna grow, it needs to be like full
 * width… the send button could be below it"). This is the SAME layout
 * `ux/Dictate/Widget.js`'s own composer already used — every caller of this one
 * function gets it now, not just the Dictate widget.
 *
 * IT NEVER GROWS BEYOND A CEILING, and that is a requirement, not a detail: rows
 * sit under it, so a composer that gains a line pushes everything down (`Chat.css`'s
 * `max-height` on the box itself now, not a row that has to match it). What
 * `ux/Dictate` draws that does not shrink — its engine name, its status, its
 * "stop after a pause" checkbox — USED to live in one small popover, and the
 * settings grid in a second, separate one behind its own gear button (two
 * buttons, two popovers). **Merged into ONE ⚙ button that opens ONE full-screen
 * menu** (chat-menu-merge, 2026-10-01 — the owner, looking at both: "I think the
 * gear and that more button should be merged together into one menu… it maybe
 * should swap out the entire UI, right? Like full screen") — see `build_menu()`
 * below, same full-screen shape as `Drill.js`'s own `.chatbox-drill`.
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
const GEAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.47.47 0 0 0-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>';

export function composer({
	deliver, re = () => null, on_text, mic: with_mic = true, autostart, max = MAX_PROMPT,
	placeholder = "say something", hint = "", sent = "sent", failed = "nothing was sent",
	revise = false,   // "clean" | "edit" | "summary" | false (default) — forwarded to `ux/Dictate`'s own option, ai/2026-09-29/audio/
	on_revised,        // (text, {raw, level}) => … — forwarded the same way, straight from `ux/Dictate`; does nothing unset
	try_command,       // (text) => boolean — an HITL command ("rename this") the box swallows instead of sending; true = handled
	on_live,           // ({text, settled, guess, sent}) => … — dictation goes into a growing chat bubble, not the box (Mic.js SETTINGS.into)
	on_meter,          // (level) => … — forwarded straight to `ComposerMic`/`Dictate`'s own `on_meter`: a caller's own bigger level bar
	                    // beside the mic button (`ux/Dictate/Widget.js`'s `level: true` option, one-dictation review finding 4).
	device_id,         // forwarded straight to `Dictate`'s own `device_id` — a caller that already picked one mic by hand. Unset, every
	                    // `Dictate` reads `remembered_device()` on its own, which a caller's own device PICKER (not built here — this
	                    // composer has no UI for choosing a mic) writes to through `remember_device()`, `ux/Dictate/Dictate.js`.
} = {}){
	let $box, $input, $note, $raw_btn, mic;

	const view = div.c("chatbox-compose", () => {
		div.c("chatbox-field", $f => {
			$box = $f;
			// `.auto` = `field-sizing: content` (framework.css, util layer): the box grows with the
			// text, full width, up to `Chat.css`'s own ceiling (`.chatbox-compose-input`'s `max-height`).
			$input = textarea().attr("rows", "2").ac("auto chatbox-compose-input").attr("placeholder", placeholder);
		});

		// ONE ROW, UNDER THE BOX: mic on the left, the gear next to it, Send pinned to the
		// right — same edges as the box above it (drawer-chat, one-dictation, 2026-10-02 —
		// the owner: "the microphone and send and settings buttons are kind of just
		// floating awkwardly down there"). The row used to read mic, Send, gear — Send sat
		// in the middle, at neither edge. `Chat.css`'s own `.chatbox-compose-send`
		// (`margin-inline-start: auto`) is what actually pushes it to the row's far end,
		// past whatever else is in the row (the gear, and the "raw" toggle when it shows).
		div.c("chatbox-compose-row", () => {
			if (with_mic) mic = new ComposerMic({
				re,
				deliver,
				on_text: text => on_text?.(text),
				revise,
				on_clean: on_revised,   // NOT `on_revised:` — that name would shadow ComposerMic's own method (Mic.js, on_revised)
				on_live,
				on_meter, device_id,
				field: $input,
				on_error: e => note(String(e?.message ?? e)),
				// Deliverable 2 - "if Servex/tidy fails, send raw and say so in the hint line":
				// ComposerMic calls this at most ONCE per send (`notify_if_failed()` - review
				// finding 5, a string of failed chunks used to repeat this line once each,
				// before anything had actually gone out), right before the message leaves -
				// "will send raw", not "sent raw".
				on_clean_failed: why => note("clean-up isn't answering - will send raw (" + why + ")"),
			}).ac("chatbox-mic");

			// ONE MENU BUTTON (chat-menu-merge, 2026-10-01) — used to be TWO buttons here,
			// `⋯` (engine, microphone and status) and a separate gear (settings); see
			// `build_menu()` below for the one full-screen panel this now opens. A real
			// gear (an SVG), not the ⚙ character: on a phone that glyph drew as a ship's
			// wheel (the owner, 2026-09-30).
			if (with_mic){
				const $menu_btn = button.c("chatbox-compose-more chatbox-compose-menu").attr("type", "button")
					.attr("title", "dictation settings").attr("aria-label", "dictation settings").click(() => open_menu());
				$menu_btn.el.innerHTML = GEAR;
			}
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

			button.c("chatbox-compose-send prim").attr("type", "button").text("Send").click(send);
		});

		$note = small.c("chatbox-compose-note muted").text(hint);
	});

	/* ONE FULL-SCREEN MENU (chat-menu-merge, 2026-10-01 — the owner, looking at the
	   gear and the `⋯` button side by side: "I think the gear and that more button
	   should be merged together into one menu... it maybe should swap out the
	   entire UI, right? Like full screen"). It holds BOTH halves that used to be
	   two separate small popovers:
	     - Dictate's own info block — the engine, the status, the "stop after a
	       pause" box. One node, moved here bodily (not copied), so it can never
	       disagree with the microphone it describes.
	     - The settings grid, `Mic.js`'s own `settings_panel()` — it used to
	       position ITSELF as a small floating popover with inline styles; now it
	       is a plain in-flow grid (`Chat.css`'s `.chatbox-mic-settings`) and this
	       full-screen panel decides where it sits.
	   Built once, on first open, and appended to <body> — the same full-screen
	   shape `Drill.js`'s own `.chatbox-drill` uses for its own full-screen shell,
	   so there is one way a chat surface goes full screen, not two. */
	const $info = mic?.el.querySelector(".ux-dictate-info");
	let $menu;
	function build_menu(){
		const box = document.createElement("div");
		box.className = "chatbox-compose-menu-panel";
		box.hidden = true;
		box.setAttribute("role", "dialog");
		box.setAttribute("aria-label", "dictation settings");
		const head = document.createElement("div");
		head.className = "chatbox-compose-menu-head";
		const title = document.createElement("div");
		title.className = "chatbox-compose-menu-title";
		title.textContent = "Dictation settings";
		const close = document.createElement("button");
		close.type = "button";
		close.className = "chatbox-compose-menu-close";
		close.textContent = "✕ Close";
		close.addEventListener("click", close_menu);
		head.append(title, close);
		const body = document.createElement("div");
		body.className = "chatbox-compose-menu-body";
		if ($info) body.append($info);
		if (mic) body.append(mic.settings_panel());
		box.append(head, body);
		box.addEventListener("keydown", e => { if (e.key === "Escape") close_menu(); });
		document.body.append(box);
		return box;
	}
	function open_menu(){
		$menu ??= build_menu();
		$menu.hidden = false;
		$menu.querySelector(".chatbox-compose-menu-close")?.focus({ preventScroll: true });
	}
	function close_menu(){ if ($menu) $menu.hidden = true; }

	$input.on("keydown", e => { if (e.key === "Enter" && !e.shiftKey){ e.preventDefault(); send(); } });

	async function send(){
		const msg = $input.el.value.trim();
		// Dictating into the chat: an empty box + Send sends the growing bubble now, without waiting for the pause.
		if (!msg && mic?.live_active?.() && mic.box()?.value.trim()) return mic.send_screen();
		// The box is everything on screen, the moving guess included; an empty box says so, never a silent nothing.
		if (!msg) return note("nothing to send — the box is empty");
		// "rename this" on a selected card is a COMMAND, not a message (requirements.md
		// deliverable 3: "itself must not also be sent as a chat message"). `try_command`
		// only swallows it when it actually did something (something was selected) — with
		// nothing selected, "rename this" has no target, so it falls through and sends
		// as a plain line, same as any other typo'd command would.
		if (try_command?.(msg)){ if (!mic?.live_active?.()) mic?.consume_sent(); $input.el.value = ""; return note("renaming…"); }
		if (msg.length > max) return note("That is " + msg.length + " characters — over the " + max + " limit, so nothing was sent. Trim it and press Send again.");
		if (!mic?.live_active?.()) mic?.consume_sent();   // dictating into the chat: the typed box is separate, the bubble keeps growing
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

	/* ⚠ The status goes in the PLACEHOLDER as well as the small note under the row
	   (`$note`, a plain line now — chat-menu-merge, 2026-10-01 — it used to be
	   folded out of sight behind the `⋯` button, which is gone), because a note
	   nobody can see is not feedback. The placeholder is inside a fixed-height
	   box, so saying something there cannot move anything. */
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
