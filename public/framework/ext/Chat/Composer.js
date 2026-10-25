import { View, div, textarea, button, small } from "/app.js";
import { ComposerMic, SETTINGS, CLEAN_CHANGED_EVENT } from "./Mic.js";

View.stylesheet(import.meta, "Chat.css");

// history and reasons: doc/Composer-notes.md
const MAX_PROMPT = 20000;   // one message is never legitimately longer; a runaway box is refused, not sent
const GEAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.47.47 0 0 0-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>';

export function composer({
	deliver, re = () => null, on_text, mic: with_mic = true, autostart, max = MAX_PROMPT,
	placeholder = "say something", hint = "", sent = "sent", failed = "nothing was sent",
	revise = false,   // "clean" | "edit" | "summary" | false (default) — forwarded to `ux/Dictate`'s own option, ai/sessions/2026/09/29/audio/audio/
	on_revised,        // (text, {raw, level}) => … — forwarded the same way, straight from `ux/Dictate`; does nothing unset
	try_command,       // (text) => boolean — an HITL command ("rename this") the box swallows instead of sending; true = handled
	on_live,           // ({text, settled, guess, sent}) => … — dictation goes into a growing chat bubble, not the box (Mic.js SETTINGS.into)
	on_out,            // ({text, raw, at}) => … — dictated words just left the bubble or box to be sent: draw them in the chat NOW, at `at`;
	                    // the send (`deliver`) follows with the same `at`, after any clean-up wait (ComposerMic.take_out, ux/Dictate/doc/flicker.md)
	on_send_start,     // (raw_text) => … — a send just started, BEFORE the clean-up wait (deliverable 3: instant feedback); forwarded to ComposerMic
	on_meter,          // (level) => … — forwarded straight to `ComposerMic`/`Dictate`'s own `on_meter`: a caller's own bigger level bar
	                    // beside the mic button (`ux/Dictate/Widget.js`'s `level: true` option, one-dictation review finding 4).
	device_id,         // forwarded straight to `Dictate`'s own `device_id` — a caller that already picked one mic by hand. Unset, every
	                    // `Dictate` reads `remembered_device()` on its own, which a caller's own device PICKER (not built here — this
	                    // composer has no UI for choosing a mic) writes to through `remember_device()`, `ux/Dictate/Dictate.js`.
	session,           // this mount's own session id (a string, or a function read fresh) — forwarded to `ComposerMic`'s live-refine
	                    // calls (`Mic.js`'s `refine_tick`/`refine_final`) so the outline lands under `/framework/ai/sessions/<id>/`
	                    // same as every other stage (`contract.md`). Unset is fine — the live call just has no session to attach to.
	per_sentence,      // true: every finished sentence leaves the box at once while the next is still being transcribed (`ComposerMic.sentences_per_send`, Mic.js); unset follows the gear setting
	on_refine_live,    // (answer) => … — forwarded straight to `ComposerMic`'s own `on_refine_live`: the live `/api/refine/live`
	                    // answer (`{ md, outline, slots, … }`), the instant one arrives, for a host that draws the growing outline
	                    // (the Refine demo feeds `answer.md`/`outline` into its own `Prompt.View`).
} = {}){
	let $box, $input, $note, $raw_btn, mic;

	const view = div.c("chatbox-compose", () => {
		div.c("chatbox-field", $f => {
			$box = $f;
			$input = textarea().attr("rows", "1").ac("auto chatbox-compose-input").attr("placeholder", placeholder);
		});

		div.c("chatbox-compose-row", () => {
			if (with_mic) mic = new ComposerMic({
				re,
				deliver,
				on_text: text => on_text?.(text),
				revise,
				on_clean: on_revised,   // NOT `on_revised:` — that name would shadow ComposerMic's own method (Mic.js, on_revised)
				on_live,
				on_out,
				on_send_start,
				on_meter, device_id,
				on_refine_live,
				sentences_per_send: per_sentence ? 1 : undefined,
				refine_session_id: typeof session === "function" ? session : () => session,
				field: $input,
				on_error: e => console.warn("[dictate] composer:", e),
				on_clean_failed: why => note("clean-up isn't answering - will send raw (" + why + ")"),
			}).ac("chatbox-mic");

			if (with_mic){
				const $menu_btn = button.c("chatbox-compose-more chatbox-compose-menu").attr("type", "button")
					.attr("title", "dictation settings").attr("aria-label", "dictation settings").click(() => open_menu());
				$menu_btn.el.innerHTML = GEAR;
			}
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

	const $info = mic?.el.querySelector(".ux-dictate-info");
	const $diag = mic?.el.querySelector(".ux-dictate-diag");
	if ($diag){ $diag.classList.add("chatbox-compose-diag"); $note.el.before($diag); }
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
		if (!msg && mic?.live_active?.() && mic.box()?.value.trim()) return mic.send_screen();
		if (!msg) return note("nothing to send — the box is empty");
		if (try_command?.(msg)){ if (!mic?.live_active?.()) mic?.consume_sent(); $input.el.value = ""; return note("renaming…"); }
		if (msg.length > max) return note("That is " + msg.length + " characters — over the " + max + " limit, so nothing was sent. Trim it and press Send again.");
		if (!mic?.live_active?.()) mic?.consume_sent();   // dictating into the chat: the typed box is separate, the bubble keeps growing
		$input.el.value = "";
		const entry = { at: new Date().toISOString(), type: "prompt", by: "owner", text: msg, via: "typed" };
		const target = re();
		if (target){ entry.re = target; entry.selected = target; }
		on_text?.(msg);
		on_send_start?.(msg);   // instant feedback, same seam as the mic's own auto-send
		note("sending…");
		let ok = false;
		try { ok = await deliver?.(entry); } catch (e){ console.error("chat: Send failed", e); }
		note(ok ? sent : failed);
	}

	let note_timer;
	function note(text){
		$note.text(text);
		$input.attr("placeholder", text);
		clearTimeout(note_timer);
		note_timer = setTimeout(() => {
			if (!$input.el.isConnected) return;
			$input.attr("placeholder", placeholder);
			$note.text(hint);
		}, 4000);
	}

	// A new target opens listening, unless the caller turned that off.
	if (autostart && mic) setTimeout(() => { try { mic.toggle(); } catch (e){ note(String(e?.message ?? e)); } }, 250);

	return Object.assign(view, { mic, $input });
}

export default composer;
