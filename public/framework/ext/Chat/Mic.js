import Socket from "/framework/dev/Socket/Socket.js";
import Dictate from "/framework/ux/Dictate/Dictate.js";

/**
 * THE MICROPHONE of a composer: `ux/Dictate` with a few methods redirected, and
 * `ux/Dictate` itself untouched. Speech goes into the composer's own text box
 * (`field`); when the speaker has been quiet long enough the words go out as ONE
 * message through `deliver(entry)`.
 *
 * ⚠ `log_prompt()` — Dictate posts every finished utterance on its own. A composer
 * that also posted from its `on_text` callback would log every dictated sentence
 * twice; overriding the one method that builds the entry is how a sentence carries
 * `re` instead.
 * ⚠ `draw_caption()` — Dictate's own grey caption strip is a row under the button,
 * which would grow the composer. It types into the box instead.
 */
/* The two sounds: a rising pair when the mic starts, a falling pair when it stops
   (any stop — a press, leaving the card, a dead device, an error). WebAudio
   only, no files; a browser that blocks sound just stays silent. */
/* EVERY KNOB OF THE WHISPER-TO-BOX FLOW lives in this one object (the owner, 2026-09-25); the gear on the
   composer edits it and remembers it in localStorage. Everything below reads it live, never a copy.
   DICTATION SENDS BY ITSELF, IN CHUNKS (the owner, 2026-09-25: no message per sentence): everything said since
   the last send goes out as ONE message at a natural pause (`paragraph_pause_ms` of quiet after a finished
   sentence); a long stretch is cut at a sentence end past `chunk_chars` or `chunk_ms`; whatever is left goes out
   after `pause_send_ms` of silence. `sentences_per_send` > 0 brings back one message per N sentences. */
export const SETTINGS = {
	send_mode: "pause",         // "pause" (sentences + the silence remainder) | "sentences" (no silence send) | "manual"
	sentences_per_send: 0,      // 0 = off; N = one message per N finished sentences (the old way)
	paragraph_pause_ms: 1500,   // quiet after a finished sentence that sends everything said so far as one message (was 2500: brought down with pause_send_ms, 2026-09-30, same proportion)
	chunk_chars: 1200,          // safety: a message this long is cut at the next sentence end
	chunk_ms: 60000,            // safety: words waiting this long are cut at the next sentence end
	pause_send_ms: 1500,        // quiet time before everything left on screen is sent (was 2500: the owner asked for a shorter delay, 2026-09-30; before that 4000, words without a closing full stop waited 4 s, the owner's "four or five seconds", 2026-09-29)
	break_pause_ms: 1500,       // quiet before a segment may start a new paragraph in the box
	guess_ms: 900,              // how often the growing sentence is re-sent to Whisper
	box_lines: 7,               // the box grows to this many lines, then scrolls
	fillers: "ah uh um er erm hmm mm",   // words that never reach the box
	clean: true,                // KILL SWITCH (ai/2026-09-29/audio/next-clean-transcription/a-clean-mode, deliverable 4):
	                            // on, a composer built with `revise:` set (`ai2/compose.js` turns it on by default)
	                            // actually runs the fast assistant's clean-up; off, every utterance stays raw, same
	                            // as before this task, with no model call at all. A composer that never asked for
	                            // `revise:` in the first place is unaffected either way.
	into: "chat",               // WHERE DICTATION APPEARS (the owner, 2026-09-30: "the live whisper transcription creating the
	                            // messages right in the chat window"): "chat" = a bubble in the chat log that grows as you speak
	                            // (only on a composer whose host can draw one, i.e. `on_live` is set: `ChatPanel`); "box" = the
	                            // text box first, the old way ("it's not a bad function to have"). Typing always uses the box.
};
const STORE = "chat.mic.settings.3";   // .3: the shorter 2026-09-30 defaults must not be shadowed by an old saved value
/* The gear saves EVERY key, so a box that ever saved a setting still holds an old default for
   `pause_send_ms` or `paragraph_pause_ms`. Nothing is saved yet under the new `.3` key the first
   time this loads, so the owner's other saved values are carried over from the old `.2` key — only
   the two stale defaults (4000 or 2500 for `pause_send_ms`, 2500 for `paragraph_pause_ms`) are
   dropped so the new defaults above reach them; any other saved value is the owner's own. */
try {
	const saved = JSON.parse(localStorage.getItem(STORE) ?? localStorage.getItem("chat.mic.settings.2") ?? "{}");
	if (saved.pause_send_ms === 4000 || saved.pause_send_ms === 2500) delete saved.pause_send_ms;
	if (saved.paragraph_pause_ms === 2500) delete saved.paragraph_pause_ms;
	Object.assign(SETTINGS, saved);
} catch {}
export const save_settings = () => { try { localStorage.setItem(STORE, JSON.stringify(SETTINGS)); } catch {} };
export const CHECK_MS = 250;
// Fired on `document` whenever the gear panel's "clean" checkbox changes (`detail` is the new
// value) — the one way a DOM node outside this mic (Composer.js's own "raw" chip) can react to
// the kill switch the instant it's flipped, review finding 7.
export const CLEAN_CHANGED_EVENT = "chat-mic-clean-changed";

let beep_ctx;
function beep(kind){
	try {
		beep_ctx ??= new AudioContext();
		beep_ctx.resume?.();
		const notes = kind === "start" ? [660, 990] : [660, 400], t0 = beep_ctx.currentTime;
		notes.forEach((hz, i) => {
			const osc = beep_ctx.createOscillator(), gain = beep_ctx.createGain(), at = t0 + i * 0.11;
			osc.frequency.value = hz;
			gain.gain.setValueAtTime(0.0001, at);
			gain.gain.exponentialRampToValueAtTime(0.15, at + 0.01);
			gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.1);
			osc.connect(gain).connect(beep_ctx.destination);
			osc.start(at); osc.stop(at + 0.11);
		});
	} catch {}
}

// A live reload waits while a mic is recording or has words not yet sent.
// It asks EVERY mic on the page, not just the last one started, and it counts the
// gaps a plain state check missed: the moment between the press and "listening"
// (engine check, permission prompt, a new card's 250 ms autostart), the 400 ms
// while a dead device is reopened, and the sentence still being posted.
const all_mics = new Set();
Socket.singleton().add_busy(() => [...all_mics].some(m => m.active()));
// The last net: ANY reload or navigation while a mic is live asks first.
addEventListener("beforeunload", e => { if ([...all_mics].some(m => m.active())){ e.preventDefault(); e.returnValue = ""; } });

/* FILLER WORDS never reach the box or the log: whole words only, any case, and
   the comma that hung on one goes with it ("Well, um, so" → "Well, so"). */
const filler_re = (flags, edge = "") => new RegExp(edge + String.raw`\b(?:` +SETTINGS.fillers.split(/[\s,]+/).filter(Boolean).map(w => w.slice(0, -1).replace(/[^\p{L}]/gu, "") + w.slice(-1) + "+").join("|") + String.raw`)\b` +(edge ? "" : ",?"), flags);
export function unfill(text){
	if (!SETTINGS.fillers.trim()) return text;
	const FILLER = filler_re("gi");
	if (!FILLER.test(text)) return text;
	FILLER.lastIndex = 0;
	const at_start = filler_re("i", String.raw`^\W*`).test(text);
	let t = text.replace(FILLER, "").replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").replace(/,\s*,/g, ",").replace(/^[\s,;:]+/, "").trim();
	if (at_start) t = t.charAt(0).toUpperCase() + t.slice(1);
	return t;
}

/* `text` without the words `sent` already covers at its start, compared word by word
   ignoring case and punctuation (Whisper's final often re-punctuates its own guess).
   If the two do not agree, nothing is removed. */
export function strip_words(text, sent){
	const norm = w => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
	const tw = text.split(/\s+/).filter(Boolean), sw = sent.split(/\s+/).filter(Boolean);
	let i = 0;
	while (i < tw.length && i < sw.length && norm(tw[i]) === norm(sw[i])) i++;
	return i && i === Math.min(tw.length, sw.length) ? tw.slice(i).join(" ") : text;
}

export class ComposerMic extends Dictate {
	/* PARAGRAPHS ON PAUSES. Whisper closes a segment after 0.7 s of quiet, so
	   segments are already the natural units; what is missing is HOW LONG the
	   quiet before each one was. `on_level` measures it (silence between the last
	   loud frame and the first loud frame of the next segment); a gap of
	   `para_gap_ms` or more starts a new paragraph, written as a blank line. */
	on_level(level){
		const before = this.has_speech, now = performance.now();
		super.on_level(level);
		if (this.level > this.silence_at){
			if (!before) this.gap_before = this.last_speech ? now - this.last_speech : 0;
			this.last_speech = now;
		}
	}

	/* A PARAGRAPH BREAK needs BOTH: a real pause (`para_gap_ms`) AND a sentence that
	   has ended before it. A pause in the middle of a sentence is only a breath. */
	can_break(prev, gap){ return !!prev && gap >= SETTINGS.break_pause_ms && /[.!?…]["')\]]*$/.test(prev.trim()); }

	// One gap per segment that will really be sent, in order — commit() takes the next.
	/* ⚠ THE GUESS STAYS ON SCREEN UNTIL ITS FINAL ARRIVES. Dictate's own close_segment
	   blanks the still-moving guess at once, then waits for Whisper's final (a few
	   hundred ms): the box lost its words, shrank a line, and grew them back — that
	   was the jump. The guess is kept in `pending` and drawn until commit() takes it. */
	async close_segment(){
		let mine;
		try {
			const gap = this.gap_before ?? 0;
			if (this.mic && this.worth_sending(this.mic.snapshot())){
				(this.gaps ??= []).push(gap); this.gap_before = 0;
				let guess = unfill(this.partial_text ?? "");
				const sent = this.dropped && this.dropped.epoch === this.segment_epoch ? this.dropped.text : "";
				if (sent){ this.dropped = null; guess = strip_words(guess, sent); }   // the guess was already sent: its final must not re-add it
				if (guess || sent) (this.pending ??= []).push(mine = { text: guess, gap, sent });
			}
		} catch {}
		try { return await super.close_segment(); }
		finally { if (mine && this.pending?.includes(mine)){ this.pending = this.pending.filter(p => p !== mine); this.draw_caption(); } }
	}

	commit(text){
		const gap = (this.gaps ??= []).shift() ?? 0;
		this.next_break = this.can_break(this.held?.at(-1)?.text, gap);
		const item = this.pending?.shift();
		text = unfill(text).replace(/\s+/g, " ").trim();   // a segment's own newlines never become paragraphs
		if (item?.sent){   // a segment whose guess (or earlier text) was already sent by Send
			text = strip_words(text, item.sent);
			if (!text){ this.partial_text = ""; this.draw_caption(); return; }
		} else if (this.dropped){   // a segment whose words were already sent (or edited in): only the rest is new
			text = strip_words(text, this.dropped.text);
			this.dropped = null;
			if (!text){ this.partial_text = ""; this.draw_caption(); return; }
		}
		super.commit(text);
	}

	active(){
		return !!(this.starting || this.reviving || this.posting || this.held?.length || this.state === "listening" || this.state === "transcribing" || this.state === "connecting");
	}

	/* THE BOX IS WHERE THE WORDS APPEAR. Each Whisper update — the still-moving
	   guess and every finished sentence not yet sent — is written after whatever
	   the owner has typed. Only the dictated tail is ever replaced: if the box no
	   longer ends with it, the owner edited it, and their text becomes the new
	   start. The cursor goes to the end. `this.field` is the composer's own input. */
	/* ⚠ THE BOX IS ALWAYS `base + dictated words`, REPLACED, NEVER APPENDED
	   (the owner, 2026-09-24: one prompt reached 121,604 characters). `base` is
	   the owner's own text, remembered explicitly and updated only by a real
	   input event (our own dispatch is flagged and ignored). The old code found
	   the owner's text by asking whether the box still `endsWith` the dictated
	   tail; when that failed the whole box, dictation included, counted as the
	   owner's text and every update wrote the transcript on top of itself. */
	/* CLEAN MODE (ai/2026-09-29/audio/next-clean-transcription/a-clean-mode): each
	 * `held` item is a finished Whisper utterance, `{text, raw, chunk_id, ready}`.
	 * `text` starts out equal to `raw` and is swapped in place, by `on_revised()`
	 * below, for the fast assistant's cleaned-up wording once it answers — so the
	 * box shows raw words for a moment, then the same words tidied, never both at
	 * once and never a flash of empty. `build_tail(use_raw)` reads either column,
	 * so the "raw" dig-back toggle (`toggle_raw()`) and the real box share one
	 * piece of paragraph-break logic instead of two that could disagree. */
	build_tail(use_raw){
		const parts = (this.held ?? []).filter(h => !h.gone).map((h, i) => (i ? (h.br ? "\n\n" : " ") : "") + (use_raw ? (h.raw ?? h.text) : h.text));
		for (const p of (this.pending ?? []).filter(p => p.text)) parts.push((parts.length ? (this.can_break(parts.join(""), p.gap) ? "\n\n" : " ") : "") + p.text);
		let guess = unfill(this.partial_text ?? "");
		if (guess && this.dropped && this.dropped.epoch === this.segment_epoch) guess = strip_words(guess, this.dropped.text);
		if (guess) parts.push((parts.length ? ((this.has_speech && this.can_break(parts.join(""), this.gap_before ?? 0)) ? "\n\n" : " ") : "") + guess);
		return parts.join("");
	}

	/* INTO THE CHAT, NOT THE BOX (dictation-stream, 2026-09-30). With `SETTINGS.into === "chat"` and a
	   host that can draw a growing bubble (`on_live`, given by `ChatPanel` through `composer()`), every
	   piece of logic below still writes into a text box — but into a GHOST one that is never on the page,
	   and each change is handed to `on_live({text, settled, guess, sent})` for the chat log to draw. The
	   real box is left to typing. Sending, clean-up, paragraphs and the auto-send all work unchanged,
	   because they only ever read `this.box()`. */
	live_active(){ return !!this.on_live && SETTINGS.into === "chat"; }
	box(){ return this.live_active() ? (this.ghost ??= document.createElement("textarea")) : this.field?.el; }

	/* The box this mic draws into changed (first draw, or the gear's "into" setting flipped): take the
	   dictated words out of the old one, remember what the new one already holds as the owner's own. */
	adopt(box){
		if (this.drawn_box === box) return;
		const old = this.drawn_box;
		if (old && this.tail && old.value.endsWith(this.tail)) old.value = old.value.slice(0, old.value.length - this.tail.length);
		if (old && old === this.ghost) this.on_live?.({ text: "", settled: "", guess: "", sent: false });
		this.drawn_box = box;
		this.tail = "";
		if (!this.watched?.has(box)){ (this.watched ??= new Set()).add(box); this.watch_box(box); }
		this.base = box === this.ghost ? "" : box.value;
		if (this.field?.el && !this.dressed){ this.dressed = true; this.dress(this.field.el); }
	}

	draw_caption(){
		const box = this.box();
		if (!box) return;
		this.adopt(box);
		const t0 = performance.now();
		const said = this.build_tail(this.show_raw);
		const t1 = performance.now();   // build_tail done (filler filter + paragraphing folded into one call, see above)
		this.tail = said ? (this.base && !/\s$/.test(this.base) ? " " : "") + said : "";
		const next = this.base + this.tail;
		const t2 = performance.now();
		if (next === box.value){ this.t_result = undefined; return; }
		const stuck = box.scrollTop + box.clientHeight >= box.scrollHeight - 4;   // was the owner reading the newest words?
		this.own = true;
		box.value = next;
		box.setSelectionRange?.(next.length, next.length);
		if (stuck) box.scrollTop = box.scrollHeight;   // keep the newest words in view unless the owner scrolled up
		/* NEVER SHRINK WHILE DICTATING: Whisper rewrites its guess and it can come back a line
		   shorter for a moment. The box keeps the tallest height it reached until it is emptied. */
		this.floor_h = Math.max(this.floor_h ?? 0, box.offsetHeight);
		box.style.minHeight = this.floor_h + "px";
		const t3 = performance.now();   // box set (and laid out)
		box.dispatchEvent(new Event("input", { bubbles: true }));
		this.own = false;
		if (box === this.ghost) this.show_live(said);
		this.mark(t0, t1, t2, t3, performance.now());
	}

	/* The growing bubble's words: `settled` is what Whisper has finished (and the clean-up has
	   swapped in place), `guess` the still-moving end, drawn grey. `sent` is true on the one call
	   that empties it because the words just went out, so the host can keep the bubble showing
	   until the real line arrives instead of flashing empty. */
	show_live(said){
		const guess = this.live_guess(), settled = guess && said.endsWith(guess) ? said.slice(0, said.length - guess.length).trimEnd() : said;
		const sent = !!this.just_sent && !said;
		this.just_sent = false;
		this.on_live?.({ text: said, settled, guess: settled === said ? "" : guess, sent });
	}

	live_guess(){
		let guess = unfill(this.partial_text ?? "");
		if (guess && this.dropped && this.dropped.epoch === this.segment_epoch) guess = strip_words(guess, this.dropped.text);
		return guess;
	}

	/* THE DELAY, in ms, per box update: `wait` = Whisper's answer arrived → this draw began (queueing);
	   `unfill`, `para`, `box` = the three stages here; `input` = every listener of the box's input event.
	   Only updates that follow a Whisper answer are logged (`t_result` is stamped by Dictate.transcribe). */
	mark(t0, t1, t2, t3, t4){
		if (this.t_result === undefined) return;
		const row = { wait: t0 - this.t_result, unfill: t1 - t0, para: t2 - t1, box: t3 - t2, input: t4 - t3, whisper: this.whisper_ms ?? 0 };
		this.t_result = undefined;
		(ComposerMic.timings ??= []).push(row);
	}

	// The box was emptied (sent): it may be one line again.
	release_height(){
		this.floor_h = 0;
		if (this.field?.el) this.field.el.style.minHeight = "";
	}

	// The first time the box is drawn: remember the owner's text and listen for their edits.
	// (Called once per box by `adopt()`, which also sets `base` and dresses the real box.)
	watch_box(box){
		box.addEventListener("input", () => { if (!this.own && this.drawn_box === box) this.owner_edit(box); });
	}

	/* THE BOX AND ITS TWO BUTTONS (the owner, 2026-09-25). The box grows line by line up to
	   `SETTINGS.box_lines`, pushing the chat up, and only then scrolls (newest words kept in view by
	   draw_caption). The mic and Send are the SAME fixed size and sit at the BOTTOM of the box. */
	dress(box){
		box.style.maxHeight = SETTINGS.box_lines + "lh"; box.style.overflowY = "auto";
		const row = box.closest(".chatbox-compose");
		if (!row) return;
		row.style.alignItems = "end";
		const size = { width: "3.5em", height: "2.5em", padding: "0", alignSelf: "end" };
		Object.assign(this.el.style, { alignSelf: "end" });
		const btn = this.el.querySelector(".ux-dictate-btn"), send = row.querySelector(".chatbox-compose-send");
		if (btn) Object.assign(btn.style, size, { minHeight: "0" });
		if (send) Object.assign(send.style, size);
	}

	/* THE GEAR PANEL: one small input per setting in SETTINGS. A change writes the object at once, is
	   saved in localStorage, and is read live by everything above (the guess interval waits for the
	   next mic start). Plain DOM, hidden until the composer's gear is pressed. */
	settings_panel(){
		const panel = document.createElement("div");
		Object.assign(panel.style, { position: "absolute", right: "0", bottom: "calc(100% + 0.3em)", zIndex: "20", display: "none", gap: "0.3em", padding: "0.6em", font: "inherit", fontSize: "0.85em", background: "Canvas", color: "CanvasText", border: "1px solid currentColor", borderRadius: "0.4em", gridTemplateColumns: "auto auto" });
		const rows = [
			["clean", "clean transcription (fast assistant clean-up)", "boolean"],
			["into", "dictation goes into", ["chat", "box"]],
			["send_mode", "send mode", ["pause", "sentences", "manual"]], ["sentences_per_send", "sentences per send (0 = off)", "number"], ["paragraph_pause_ms", "natural pause (ms)", "number"],
			["pause_send_ms", "silence before send (ms)", "number"], ["break_pause_ms", "paragraph pause (ms)", "number"],
			["guess_ms", "guess every (ms)", "number"], ["box_lines", "box lines before scroll", "number"], ["chunk_chars", "safety chunk (chars)", "number"], ["chunk_ms", "safety chunk (ms)", "number"], ["fillers", "filler words", "text"],
		];
		for (const [key, label, kind] of rows){
			const name = document.createElement("label"); name.textContent = label;
			const input = Array.isArray(kind) ? document.createElement("select") : document.createElement("input");
			if (Array.isArray(kind)) for (const o of kind) input.add(new Option(o, o));
			else if (kind === "boolean") input.type = "checkbox";
			else input.type = kind;
			if (kind === "boolean") input.checked = !!SETTINGS[key]; else input.value = SETTINGS[key];
			input.style.width = kind === "boolean" ? "auto" : "10em";
			input.addEventListener("change", () => {
				SETTINGS[key] = kind === "number" ? Math.max(0, Number(input.value) || 0) : kind === "boolean" ? input.checked : input.value;
				if (key === "send_mode") this.send_mode = undefined;   // the panel wins over a per-mic override
				if (key === "box_lines" && this.field?.el) this.field.el.style.maxHeight = SETTINGS.box_lines + "lh";
				// SETTINGS is shared and read live everywhere, but a DOM node outside this
				// mic (Composer.js's own "raw" chip — review finding 7: it must hide when
				// the kill switch is off, since toggling it then would do nothing visible)
				// has no other way to hear this ONE change happen right now.
				if (key === "into") this.draw_caption();   // move the words still being spoken to the new place at once
				if (key === "clean") document.dispatchEvent(new CustomEvent(CLEAN_CHANGED_EVENT, { detail: SETTINGS.clean }));
				save_settings();
			});
			panel.append(name, input);
		}
		this.gear = () => { panel.style.display = panel.style.display === "none" ? "grid" : "none"; };
		return panel;
	}

	/* The owner typed or pasted. If the box still ends with the dictated words,
	   only what is before them is theirs; if they edited INSIDE the dictation,
	   the whole box is theirs now and the words shown so far stop being redrawn. */
	owner_edit(box){
		const v = box.value, t = this.tail ?? "";
		if (t && v.endsWith(t)){ this.base = v.slice(0, v.length - t.length); return; }
		this.base = v;
		if (!t) return;
		for (const h of this.held ?? []) h.gone = true;
		this.drop_partial();
		this.tail = "";
	}

	// The moving guess belongs to the segment still being spoken and is cumulative: once its words
	// are in the box for good (edited in, or sent), only what comes AFTER them may appear again.
	drop_partial(){
		const g = unfill(this.partial_text ?? "");
		this.dropped = g ? { text: g, epoch: this.segment_epoch } : null;
	}

	/* SEND happened. Everything the caption uses is reset, so a Whisper update
	   that lands after Send starts a fresh box and can never restore what was
	   sent; the still-moving guess is trimmed of the words already sent. */
	consume_sent(){
		clearTimeout(this.held_timer);
		this.just_sent = true;   // the growing chat bubble (show_live) stays up until the real line lands
		this.held = [];   // EVERYTHING on screen was sent, the moving guess included
		this.base = "";
		this.tail = ""; this.chunk_start = undefined;
		if (this.state !== "listening" && this.state !== "transcribing"){ this.pending = []; this.partial_text = ""; this.dropped = null; }
		else {   // the mic keeps recording: remember what went out, so the late finals do not repeat it
			for (const p of this.pending ?? []) if (p.text){ p.sent = p.sent ? p.sent + " " + p.text : p.text; p.text = ""; }
			this.drop_partial();
		}
		this.release_height();
		queueMicrotask(() => this.draw_caption());   // after the composer has emptied the box
	}

	/* ONE MICROPHONE AT A TIME. A card's page stays mounted while a sub-card
	   opens beside it, so its mic never hears `deactivated()` — pressing the
	   sub-card's mic ran two at once, and every sentence was posted twice (the
	   owner, 2026-09-23). Starting any mic stops whichever one was on. */
	async start(){
		const other = ComposerMic.on;
		ComposerMic.on = this;
		all_mics.add(this);
		this.starting = true;
		try {
			if (other && other !== this) try { await other.stop(); } catch {}
			this.resend_ms = SETTINGS.guess_ms;
			await super.start();
		} finally { this.starting = false; }
	}

	/* THE START SOUND — moved here from the end of `start()`. `Dictate` now calls this
	 * the INSTANT the mic is genuinely open (whisper's own `capture.start()` resolved, or
	 * the browser engine's `rec.onstart` fired), never merely because `start()` was asked
	 * to run. Before this, `start()` returning was treated as "it's on" — but for the
	 * browser engine `start()` returns before Chrome has done anything at all, and on an
	 * insecure LAN page Chrome can go on "trying" for a long time with no error, so the
	 * chime played while nothing was actually listening (the owner's own phone report,
	 * `ai/2026-09-29/mobile-nav/`, `doc/https-lan.md`). `Dictate.set_state()` also never
	 * fires this twice for one press — Chrome's own silent mid-session restarts (still
	 * "listening" throughout) do not replay the chime. */
	on_listening(){
		beep("start"); this.watch_capture();
		clearInterval(this.auto_timer);
		this.auto_timer = setInterval(() => this.auto_check(), CHECK_MS);
	}

	/* WHY THE MIC "TURNED ITSELF OFF": a Windows sleep, a Bluetooth switch or an
	   unplugged device ends the microphone's audio track — Dictate never listened
	   for that, so the button kept saying "listening" while nothing was recorded.
	   Now a dead track stops the mic (with the stop sound) and reopens it once. A
	   suspended audio engine is woken the same way. */
	watch_capture(){
		const cap = this.mic, track = cap?.stream?.getAudioTracks()[0];
		if (cap?.ctx) cap.ctx.onstatechange = () => {
			if (cap.ctx.state === "suspended" && this.state === "listening") cap.ctx.resume().catch(() => {});
		};
		track?.addEventListener("ended", async () => {
			if (this.mic !== cap || this.state !== "listening") return;
			await this.stop();
			const now = performance.now();
			if (now - (this.last_revive ?? -1e9) < 5000) return this.set_error("The microphone was disconnected.");
			this.last_revive = now;
			this.reviving = true;
			setTimeout(() => { this.reviving = false; this.start(); }, 400);
		});
	}

	// Every automatic error stop is a stop too — say so out loud.
	set_error(msg){
		const was = this.state === "listening" || this.state === "transcribing";
		super.set_error(msg);
		if (was) beep("stop");
	}

	// No `at` sent to Servex — see Dictate.js's own `log_prompt` for why a
	// client clock must never override Servex's local-offset stamp.
	/* WHEN WORDS GO OUT is `SETTINGS.send_mode`, one switch (a mic can override it with its own `send_mode`):
	   "manual"    only the Send button (or Enter) sends. Nothing is ever sent early.
	   "sentences" every `sentences_per_send` finished sentences go out at once, as their segment arrives.
	   "pause"     "sentences", plus whatever is left on screen after `pause_send_ms` of silence.
	   Each message is one or more whole sentences; the words still being spoken stay in the box. */
	mode_now(){ return this.send_mode ?? SETTINGS.send_mode; }

	// Clean mode is ON for this mic only when BOTH the caller asked for a `revise:`
	// level (deliverable 1: `ai2/compose.js` turns this on by default) AND the
	// owner's own kill switch (deliverable 4, `SETTINGS.clean`) has not turned it
	// back off. A composer that never asked for `revise:` is untouched either way.
	clean_active(){ return !!(this.revise && SETTINGS.clean); }

	// Only run the fast assistant's clean-up while it is actually wanted — the
	// kill switch can turn this OFF without the caller's own `revise:` choice
	// ever changing (`Dictate.js`'s `revise_chunk` is the one place that calls
	// `Revise.run` and logs a revision; this is the one gate in front of it).
	revise_chunk(raw, chunk_id, chunk_at){
		if (!this.clean_active()) return;
		return super.revise_chunk(raw, chunk_id, chunk_at);
	}

	/* EACH FINISHED UTTERANCE IS ITS OWN `held` ITEM (deliverable 1): `text` is what
	 * the box shows and what a send actually reads; `raw` is what Whisper really
	 * said, kept alongside forever, never overwritten (deliverable 3, the dig-back
	 * toggle). `ready` resolves once this item can no longer change — instantly if
	 * clean mode is off (nothing is ever coming), or when `on_revised()` below hears
	 * back from the fast assistant, ok or not. A send that is about to go out awaits
	 * every held item's `ready`, capped at ~5s (`await_clean()`), so it never sends
	 * half of a clean-up and the raw rest (deliverable 2). */
	log_prompt(text, chunk_id){
		let resolve_ready;
		const ready = new Promise(res => { resolve_ready = res; });
		if (this.clean_active() && chunk_id != null) (this.clean_waiters ??= new Map()).set(chunk_id, resolve_ready);
		else resolve_ready();   // nothing will ever revise this item — it is "ready" the instant it exists
		this.held ??= [];
		this.held.push({ text, raw: text, br: false, chunk_id, ready });
		this.draw_caption();
		this.arm();
	}

	/* THE FAST ASSISTANT ANSWERED for one utterance — `Dictate.js`'s own `revise_chunk()`
	 * calls this once `/api/tidy` says OK, never with a falsy `text` (a failure goes to
	 * `on_revise_failed` below instead — two hooks, never one overloaded with `null`,
	 * review finding 1: an existing caller like `ext/drawer/rail.js` that only ever
	 * handled success must never be handed something to draw a blank card for). Find
	 * the item that is STILL waiting (a send may already have cut it out of `held`,
	 * raw and gone — nothing left to update, but the waiter still needs releasing so
	 * `await_clean()` doesn't wait the full 5s for an answer nobody can use any more)
	 * and swap its `text` for the clean version. */
	/* ⚠ A CALLER'S OWN HOOK IS `on_clean`, NEVER `on_revised` (dictation-stream, 2026-09-30): View's
	   constructor Object.assign()s every option onto the instance, so an `on_revised` option (even an
	   `undefined` one, which Composer.js always passed) SHADOWED this method, the swap never ran, the
	   bubbles stayed raw Whisper with clean mode on, and every send waited the full 5 s. */
	on_revised(text, meta = {}){
		const { chunk_id } = meta;
		const item = (this.held ?? []).find(h => h.chunk_id === chunk_id);
		if (item){ item.text = text; this.draw_caption(); }
		this.release_waiter(chunk_id);
		this.on_clean?.(text, meta);
	}

	/* THE FAST ASSISTANT GAVE UP for one utterance (Servex down, or any other
	 * failure) — `raw` stays showing in the box (`item.text` is never touched, it
	 * was already the raw words); only `item.failed`/`item.fail_why` are stamped, so
	 * a send about to go out can say so ONCE (`notify_if_failed()`, called by the
	 * send paths right after `await_clean()`) instead of `Composer.js`'s hint firing
	 * once per failed chunk — a string of failures used to repeat "sent raw" over
	 * and over before anything had actually been sent (review finding 5). */
	on_revise_failed({ chunk_id, why }){
		const item = (this.held ?? []).find(h => h.chunk_id === chunk_id);
		if (item){ item.failed = true; item.fail_why = why; }
		this.last_fail_why = why;
		this.release_waiter(chunk_id);
	}

	release_waiter(chunk_id){
		const resolve = this.clean_waiters?.get(chunk_id);
		if (resolve){ resolve(); this.clean_waiters.delete(chunk_id); }
	}

	/* Called by every send path right after `await_clean()` — once per send, never
	 * once per chunk. `items` is whatever this send is about to read; if any of them
	 * gave up, the hint says so ONCE, worded as what is ABOUT to happen ("will send
	 * raw") since this runs before the message actually leaves. */
	notify_if_failed(items){
		const failed = items.find(h => h.failed);
		if (failed) this.on_clean_failed?.(failed.fail_why ?? this.last_fail_why);
	}

	/* Deliverable 3 — "dig back": one toggle shows exactly what Whisper produced for
	 * everything currently in the box, in place of the clean-up. Returns the new
	 * state so a caller (`Composer.js`'s own button) can reflect it visually. */
	toggle_raw(){
		this.show_raw = !this.show_raw;
		this.draw_caption();
		return this.show_raw;
	}

	/* Deliverable 2 — "wait for it (at most ~5s), then fall back to raw for anything
	 * unanswered": every held item not yet cleaned (`ready` unresolved) blocks a send
	 * for up to `ms`; items answered already resolve instantly (`Promise.all` needs
	 * no real wait for those), and items that time out simply keep the raw text
	 * `log_prompt()` gave them — never a missing word, never a second wait later. */
	async await_clean(ms = 5000){
		const waiters = (this.held ?? []).filter(h => !h.gone && h.ready).map(h => h.ready);
		if (!waiters.length) return;
		await Promise.race([Promise.all(waiters), new Promise(res => setTimeout(res, ms))]);
	}

	arm(){
		if (this.mode_now() === "manual") return;
		this.chunk_start ??= performance.now();
		if (SETTINGS.sentences_per_send | 0) this.send_sentences(SETTINGS.sentences_per_send | 0); else this.check_chunk();
	}

	/* THE SAFETY CHUNK: words that have waited chunk_ms, or passed chunk_chars, go out at the next sentence end
	   (all the finished sentences in one message; the unfinished tail stays). */
	check_chunk(){
		const text = this.held_text();
		if (text && (text.length >= SETTINGS.chunk_chars || performance.now() - (this.chunk_start ?? performance.now()) >= SETTINGS.chunk_ms)) this.send_sentences(Infinity);
	}

	/* The finished sentences among the held words go out now, `sentences_per_send` to a message; the
	   unfinished tail stays held and on screen. The words are cut out of `held` in the same tick they
	   are queued, so a later check can never send them again.
	   ⚠ Sentences are re-sliced from the JOINED text of every held item, so one outgoing message can
	   span several utterances — there is no clean way to keep a single `raw` string lined up
	   character-for-character with a re-cut `text` string. This path (only reached with
	   `sentences_per_send` set, or the `chunk_chars`/`chunk_ms` safety cut) sends the RAW joined text
	   as `raw` — a whole-message best-effort record of what was actually said, not a
	   word-for-word pairing with `text` the way `send_screen()`'s single-utterance case gets. */
	async send_sentences(n = Math.max(1, SETTINGS.sentences_per_send | 0)){
		if (this.sending_sentences) return;   // `await_clean()` below can take up to 5s — never two of these reading/cutting `held` at once
		this.sending_sentences = true;
		try {
			await this.await_clean();
			const held = (this.held ?? []).filter(h => !h.gone);
			this.notify_if_failed(held);
			const joined = held.map(h => h.text).join(" ");
			const joined_raw = held.map(h => h.raw ?? h.text).join(" ");
			const sents = joined.match(/[^.!?…]*[.!?…]+["')\]]*(?=\s|$)/g) ?? [];
			if (!sents.length || sents.length < n) return;
			const per = Math.min(n, sents.length), cut = sents.length - sents.length % per, texts = [];
			// `raw` goes on the FIRST outgoing message only (review finding 6) — the whole
			// joined paragraph, once, not the same best-effort string repeated on every
			// message this batch happens to split into.
			for (let i = 0; i < cut; i += per) texts.push({ text: sents.slice(i, i + per).join("").trim(), raw: i === 0 ? joined_raw : null });
			const rest = joined.slice(sents.slice(0, cut).join("").length).trim();
			if (this.base.trim()){ texts[0].text = this.base.trim() + " " + texts[0].text; this.base = ""; }
			this.held = rest ? [{ text: rest, raw: rest, br: false, ready: Promise.resolve() }] : [];
			this.draw_caption();
			this.enqueue(texts);
		} catch (e){ console.error("chat: sending finished sentences failed", e); }
		finally { this.sending_sentences = false; }
	}

	// Messages leave in order, one at a time; `posting` keeps a live reload waiting until the last is delivered.
	// Each item is `{text, raw}` (or a plain string, for a caller with no raw to give).
	enqueue(items){
		this.posting = (this.posting ?? 0) + 1;
		this.last_send_at = performance.now(); this.chunk_start = undefined;
		this.post_tail = (this.post_tail ?? Promise.resolve())
			.then(async () => { for (const it of items) await this.post_held(it); })
			.catch(e => console.error("chat: sending failed", e))
			.finally(() => { this.posting--; });
	}

	/* "pause" mode, checked every CHECK_MS while listening: `pause_send_ms` of silence sends EVERYTHING
	   still on screen, the guess included (the same words Send would send). A failure is logged, never silent. */
	auto_check(){
		try {
			if (this.mode_now() === "manual" || this.state !== "listening" && this.state !== "transcribing") return;
			const text = this.box()?.value.trim();
			if (!text || !this.tail) return;   // nothing dictated is waiting (typed words are never auto-sent)
			const quiet = performance.now() - (this.last_speech ?? performance.now());
			if (SETTINGS.paragraph_pause_ms > 0 && quiet >= SETTINGS.paragraph_pause_ms && this.ends_sentence(text)) return this.send_screen();   // a natural pause
			if (this.mode_now() === "pause" && quiet >= SETTINGS.pause_send_ms) this.send_screen();   // the tail
			else this.check_chunk();
		} catch (e){ console.error("chat: automatic send failed", e); }
	}

	/* Everything visible goes out as one message, the mic keeps recording, the box starts fresh.
	 * This is the common case (the default "pause" send mode's own tail send, and every
	 * natural-pause send) so it is the one place deliverable 2's wait really matters: if a
	 * clean-up for something on screen is still in flight, WAIT for it (`await_clean`, capped
	 * at ~5s) before reading the box, so the message sent is the clean text whenever it
	 * arrived in time — raw otherwise, never a half-cleaned mix and never a lost word.
	 * `this.sending_screen` stops a second call (another `auto_check` tick, `stop()`) from
	 * reading and clearing the SAME box while the first is still waiting. */
	async send_screen(){
		if (this.sending_screen) return;
		if (!this.box()?.value.trim()) return;
		this.sending_screen = true;
		try {
			await this.await_clean();
			const text = this.box()?.value.trim();
			if (!text) return;   // the owner cleared the box, or a stop already sent it, while this was waiting
			this.notify_if_failed((this.held ?? []).filter(h => !h.gone));
			const raw = (this.base + (this.base && !/\s$/.test(this.base) ? " " : "") + this.build_tail(true)).trim() || text;
			this.consume_sent();
			this.draw_caption();   // empty the box now, in this same tick, so no second check can send it again
			this.enqueue([{ text, raw }]);
		} finally { this.sending_screen = false; }
	}

	held_text(){ return (this.held ?? []).filter(h => !h.gone).map(h => h.text).join(" ").trim(); }
	ends_sentence(t){ return /[.!?…]["')\]]*$/.test(t.trim()); }

	// Stopping the mic never loses words: in the two auto modes whatever is on screen goes out now;
	// in "manual" it stays in the box for Send.
	async stop(){
		const was = this.state === "listening";
		clearInterval(this.auto_timer);
		try { return await super.stop(); }
		finally {
			const mode = this.mode_now();
			if (mode !== "manual") this.send_sentences();
			if (mode === "pause") this.send_screen(); else if (mode === "sentences") this.flush_held();
			if (was) beep("stop");
		}
	}

	async flush_held(){
		clearTimeout(this.held_timer);
		await this.await_clean();   // deliverable 2: wait ~5s for anything still cleaning, then send what's there
		const held = (this.held ?? []);
		this.notify_if_failed(held);
		const text = held.map(h => h.text).join(" ").trim();
		const raw = held.map(h => h.raw ?? h.text).join(" ").trim();
		this.held = [];
		if (!text) return;
		// SENT: the box empties (the mic keeps listening) and the words become
		// their own chat bubble when Servex logs them.
		this.draw_caption();
		if (!this.pending?.length && !this.partial_text) this.release_height();
		return this.post_held({ text, raw });
	}

	/* Hand the finished words to the caller's `deliver(entry)` (how a send is posted is
	   the app's business; it answers true or false). `re` still pins the sentence to the
	   open target (unchanged); `selected` says the same thing explicitly, so a router
	   can read it as the DEFAULT and still file a sentence elsewhere. If delivery fails
	   the words are appended to the dev-server log through Dictate's own fallback file.
	   `item` is `{text, raw}` or a plain string (a caller with nothing but the clean
	   text to give — `raw` is only ever added to the entry when it differs from `text`,
	   deliverable 2: "the message that is sent is the clean text, with the raw kept on
	   the entry"). */
	async post_held(item){
		const { text, raw } = typeof item === "string" ? { text: item, raw: null } : item;
		const entry = { type: "prompt", by: "owner", text, via: "whisper" };
		if (raw && raw.trim() && raw.trim() !== text.trim()){ entry.raw = raw; entry.level = "clean"; }
		const re = this.re?.();
		if (re){ entry.re = re; entry.selected = re; }
		this.posting = (this.posting ?? 0) + 1;
		let ok;
		try { ok = await this.deliver?.(entry); } finally { this.posting--; }
		if (ok) return;
		try { await Socket.singleton().async_rpc("append", this.log_fallback_file, { at: new Date().toISOString(), ...entry }); }
		catch (e){ console.warn("chat: could not log this utterance", e); }
	}
}
ComposerMic.prototype.mode = "open";   // the mic stays on; Dictate writes nothing itself — draw_caption() types into the box
