import { div, input, button, small } from "/app.js";
import Socket from "/framework/dev/Socket/Socket.js";
import Dictate, { post_prompt } from "/framework/ux/Dictate/Dictate.js";
import { servex_base, is_folder_id, card_prompt, cards_ready } from "./inbox.js";

/**
 * ONE LINE. A box you type in, the microphone inside its right end, Send beside
 * it, and everything else folded behind a `⋯` (the owner, 2026-09-22: "the area
 * on top with the text input is massive… the microphone at the end of the text
 * area like normal… it's taking a third of my screen").
 *
 * IT NEVER GROWS, and that is a requirement, not a detail: the rail's rows sit
 * under it, so a composer that gains a line pushes every card down. The box is
 * a single-line `<input>` (a textarea can be dragged taller), and the things
 * `ux/Dictate` draws that do not shrink — its engine name, its status, its
 * "stop after a pause" checkbox — live in a popover that is positioned OUT OF
 * FLOW. See `ai2.css`.
 *
 * The same factory builds both composers on this page: the one at the top of
 * the rail, which starts a new card, and the one in a card's transcript footer,
 * which talks INTO that card. The only difference is `re`.
 */

/**
 * THE MICROPHONE, with two methods redirected and `ux/Dictate` itself untouched.
 *
 * ⚠ `log_prompt()` — Dictate posts every finished utterance to Servex ON ITS
 * OWN. A composer that also posted from its `on_text` callback would log every
 * dictated sentence twice; overriding the one method that builds the entry is
 * how a sentence carries `re: <card id>` instead.
 * ⚠ `draw_caption()` — Dictate's own grey caption strip is a row under the
 * button, which would grow the composer. Redirected into the card's transcript
 * footer, the strip stays empty and the words appear where they belong.
 */
class ComposerMic extends Dictate {
	draw_caption(){ this.on_partial?.(this.partial_text ?? ""); }

	// The same Servex the rest of this page talks to — `?servex=` included, so a
	// test page's microphone never posts into the real one.
	get log_url(){ return servex_base() + "/log/prompts"; }

	/* ONE MICROPHONE AT A TIME. A card's page stays mounted while a sub-card
	   opens beside it, so its mic never hears `deactivated()` — pressing the
	   sub-card's mic ran two at once, and every sentence was posted twice (the
	   owner, 2026-09-23). Starting any mic stops whichever one was on. */
	async start(){
		const other = ComposerMic.on;
		ComposerMic.on = this;
		if (other && other !== this) try { await other.stop(); } catch {}
		return super.start();
	}

	// No `at` sent to Servex — see Dictate.js's own `log_prompt` for why a
	// client clock must never override Servex's local-offset stamp.
	// Hold each finished segment; post them as ONE prompt once the owner has been quiet for send_after_ms.
	log_prompt(text){
		(this.held ??= []).push(text);
		clearTimeout(this.held_timer);
		this.held_timer = setTimeout(() => this.flush_when_quiet(), this.send_after_ms);
	}

	// Still talking? Wait out the rest of the quiet time instead of sending mid-sentence.
	flush_when_quiet(){
		const quiet = performance.now() - (this.last_loud_at ?? 0);
		if (this.state === "listening" && quiet < this.send_after_ms)
			return void (this.held_timer = setTimeout(() => this.flush_when_quiet(), this.send_after_ms - quiet));
		return this.flush_held();
	}

	// Stopping the mic never loses words: whatever is held goes out now.
	async stop(){
		try { return await super.stop(); }
		finally { this.flush_held(); }
	}

	flush_held(){
		clearTimeout(this.held_timer);
		const text = (this.held ?? []).join(" ").trim();
		this.held = [];
		if (text) return this.post_held(text);
	}

	async post_held(text){
		const entry = { type: "prompt", by: "owner", text, via: "whisper" };
		const re = this.re?.();
		// `re` still pins the sentence to the open card (unchanged); `selected`
		// says the same thing explicitly, so the fast assistant can read it as
		// the DEFAULT and still choose to file a sentence that plainly belongs
		// elsewhere under a different idea (assistant.md's routing rule).
		if (re){ entry.re = re; entry.selected = re; }
		const ok = await post_prompt(entry, this.log_url);
		// THE CARD'S OWN STORE (decision `card-storage`) — a second, small POST
		// beside the one above, never instead of it: `/log/prompts` is what the
		// fast assistant and the Dispatcher are actually watching (Assistant.js,
		// out of this task's fence), so it keeps working unchanged, while
		// `cards/<slug>` becomes the durable per-card file deliverable 1 built.
		// `re` on a sub-card is `<slug>/<sub>` — the log itself is still the
		// PARENT card's file; `<sub>` only ever lives inside the entry's own `re`.
		if (re) into_card(re, entry);
		if (ok) return;
		try { await Socket.singleton().async_rpc("append", this.log_fallback_file, { at: new Date().toISOString(), ...entry }); }
		catch (e){ console.warn("ai2: could not log this utterance", e); }
	}
}
ComposerMic.prototype.send_after_ms = 2500;   // quiet time before held segments post as one prompt
ComposerMic.prototype.mode = "open";   // the mic stays on; the box is single-line and never written into

/**
 * THE CARD'S OWN COPY of a sentence said into it. A folder card (`2026/09/24/x`)
 * gets ONE first-class `prompt` record through Servex's `POST /card/append` —
 * the owner's words kept as a quotation, verbatim (`Servex/cards/readme.md`).
 * An old board card still gets its line on the old per-card log. Either way it
 * is beside the `/log/prompts` post, never instead of it: that one is what the
 * fast assistant reads.
 */
async function into_card(re, entry){
	// A Servex not yet restarted onto the card code has no `/card/append`: a
	// folder card's words then go on the old log under its own slug (the last
	// segment), to be copied across once the card routes are live.
	if (is_folder_id(re) && await cards_ready()) return card_prompt(re, entry.text, entry.via).catch(() => null);
	const slug = is_folder_id(re) ? re.split("/").at(-1) : re.split("/")[0];
	return post_prompt(entry, servex_base() + "/log/cards/" + slug).catch(() => {});
}

/**
 * `re()` is asked fresh on every send, never captured — the card you are talking
 * into can change under a composer that stays put. `on_text` and `on_partial`
 * are how the footer shows the words the instant they exist, before Servex has
 * seen them, which is the whole of "I don't like that my words disappear".
 */
export function composer({ re = () => null, on_text, on_partial, placeholder, autostart, mic: with_mic = true } = {}){
	let $box, $input, $note, mic;

	const view = div.c("ai2-compose", () => {
		div.c("ai2-field", $f => {
			$box = $f;
			$input = input().attr("type", "text").ac("ai2-compose-input")
				.attr("placeholder", placeholder ?? "say anything — it becomes a card");

			// The rail's own top composer is typed-only (item 10): the mic lives on
			// the card's own page, one per card, never a second one talking into
			// whatever card happens to be open.
			if (with_mic) mic = new ComposerMic({
				re,
				on_text: text => on_text?.(text),
				on_partial: text => on_partial?.(text),
				on_error: e => note(String(e?.message ?? e)),
			}).ac("ai2-mic");
		});

		button.c("ai2-compose-send prim").attr("type", "button").text("Send").click(send);

		// Everything that does not fit on one line. `.open` is toggled here and
		// the popover is positioned out of flow, so opening it moves nothing.
		if (with_mic) button.c("ai2-compose-more").attr("type", "button").attr("title", "engine, microphone and status")
			.text("⋯").click(() => view.el.classList.toggle("open"));

		$note = small.c("ai2-compose-note muted").text("the fast assistant inside Servex · names in ~2 s");
	});

	/* The popover IS Dictate's own info block — the engine, the status and the
	   "stop after a pause" box — MOVED out of the one-line row rather than
	   hidden or copied. One node, so it cannot disagree with the microphone it
	   describes, and `ai2.css` takes it out of flow so opening it moves nothing. */
	const $info = mic?.el.querySelector(".ux-dictate-info");
	if ($info) view.el.appendChild($info);

	$input.on("keydown", e => { if (e.key === "Enter") send(); });

	async function send(){
		const msg = $input.el.value.trim();
		if (!msg) return;
		$input.el.value = "";
		const entry = { at: new Date().toISOString(), type: "prompt", by: "owner", text: msg, via: "typed" };
		const target = re();
		if (target){ entry.re = target; entry.selected = target; }
		on_text?.(msg);
		note("sending…");
		const ok = await post_prompt(entry, servex_base() + "/log/prompts");
		if (target) into_card(target, entry);
		note(ok ? "sent — the card is on its way" : "Servex is not answering, so nothing was sent");
	}

	/* ⚠ The status goes in the PLACEHOLDER as well as the folded note, because a
	   note nobody can see is not feedback. The placeholder is inside a
	   fixed-height box, so saying something there cannot move anything. */
	function note(text){
		$note.text(text);
		$input.attr("placeholder", text);
		setTimeout(() => {
			if (!$input.el.isConnected) return;
			$input.attr("placeholder", placeholder ?? "say anything — it becomes a card");
		}, 4000);
	}

	// A new card opens listening (item 18), unless the owner turned that off.
	if (autostart && mic) setTimeout(() => { try { mic.toggle(); } catch (e){ note(String(e?.message ?? e)); } }, 250);

	return Object.assign(view, { mic, $input });
}

export default composer;
