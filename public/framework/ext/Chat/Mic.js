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
	paragraph_pause_ms: 2500,   // quiet after a finished sentence that sends everything said so far as one message
	chunk_chars: 1200,          // safety: a message this long is cut at the next sentence end
	chunk_ms: 60000,            // safety: words waiting this long are cut at the next sentence end
	pause_send_ms: 2500,        // quiet time before everything left on screen is sent (was 4000: words without a closing full stop waited 4 s, the owner's "four or five seconds", 2026-09-29)
	break_pause_ms: 1500,       // quiet before a segment may start a new paragraph in the box
	guess_ms: 900,              // how often the growing sentence is re-sent to Whisper
	box_lines: 7,               // the box grows to this many lines, then scrolls
	fillers: "ah uh um er erm hmm mm",   // words that never reach the box
};
const STORE = "chat.mic.settings.2";   // .2: the chunked defaults must not be shadowed by an old saved per-sentence value
/* The gear saves EVERY key, so a box that ever saved a setting still holds the old 4000 default for
   `pause_send_ms` — a saved 4000 is dropped so the new default reaches it; any other saved value is the owner's own. */
try { const saved = JSON.parse(localStorage.getItem(STORE) ?? "{}"); if (saved.pause_send_ms === 4000) delete saved.pause_send_ms; Object.assign(SETTINGS, saved); } catch {}
export const save_settings = () => { try { localStorage.setItem(STORE, JSON.stringify(SETTINGS)); } catch {} };
export const CHECK_MS = 250;

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
	draw_caption(){
		const box = this.field?.el;
		if (!box) return;
		if (this.base === undefined) this.watch_box(box);
		const t0 = performance.now();
		const parts = (this.held ?? []).filter(h => !h.gone).map((h, i) => (i ? (h.br ? "\n\n" : " ") : "") + h.text);
		let guess = "";
		{
			for (const p of (this.pending ?? []).filter(p => p.text)) parts.push((parts.length ? (this.can_break(parts.join(""), p.gap) ? "\n\n" : " ") : "") + p.text);
			guess = unfill(this.partial_text ?? "");
			if (guess && this.dropped && this.dropped.epoch === this.segment_epoch) guess = strip_words(guess, this.dropped.text);
		}
		const t1 = performance.now();   // filler filter done
		if (guess) parts.push((parts.length ? ((this.has_speech && this.can_break(parts.join(""), this.gap_before ?? 0)) ? "\n\n" : " ") : "") + guess);
		const said = parts.join("");
		this.tail = said ? (this.base && !/\s$/.test(this.base) ? " " : "") + said : "";
		const next = this.base + this.tail;
		const t2 = performance.now();   // paragraphing done
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
		this.mark(t0, t1, t2, t3, performance.now());
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
	watch_box(box){
		this.base = box.value;
		box.addEventListener("input", () => { if (!this.own) this.owner_edit(box); });
		// No ceiling (the owner, 2026-09-24): the box grows with its words; nothing inside it scrolls.
		this.dress(box);
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
			["send_mode", "send mode", ["pause", "sentences", "manual"]], ["sentences_per_send", "sentences per send (0 = off)", "number"], ["paragraph_pause_ms", "natural pause (ms)", "number"],
			["pause_send_ms", "silence before send (ms)", "number"], ["break_pause_ms", "paragraph pause (ms)", "number"],
			["guess_ms", "guess every (ms)", "number"], ["box_lines", "box lines before scroll", "number"], ["chunk_chars", "safety chunk (chars)", "number"], ["chunk_ms", "safety chunk (ms)", "number"], ["fillers", "filler words", "text"],
		];
		for (const [key, label, kind] of rows){
			const name = document.createElement("label"); name.textContent = label;
			const input = Array.isArray(kind) ? document.createElement("select") : document.createElement("input");
			if (Array.isArray(kind)) for (const o of kind) input.add(new Option(o, o)); else input.type = kind;
			input.value = SETTINGS[key];
			input.style.width = "10em";
			input.addEventListener("change", () => {
				SETTINGS[key] = kind === "number" ? Math.max(0, Number(input.value) || 0) : input.value;
				if (key === "send_mode") this.send_mode = undefined;   // the panel wins over a per-mic override
				if (key === "box_lines" && this.field?.el) this.field.el.style.maxHeight = SETTINGS.box_lines + "lh";
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

	log_prompt(text){
		(this.held ??= []).push({ text, br: false });   // no paragraph grouping: every sentence is its own item
		this.draw_caption();
		this.arm();
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
	   are queued, so a later check can never send them again. */
	send_sentences(n = Math.max(1, SETTINGS.sentences_per_send | 0)){
		try {
			const held = (this.held ?? []).filter(h => !h.gone);
			const joined = held.map(h => h.text).join(" ");
			const sents = joined.match(/[^.!?…]*[.!?…]+["')\]]*(?=\s|$)/g) ?? [];
			if (!sents.length || sents.length < n) return;
			const per = Math.min(n, sents.length), cut = sents.length - sents.length % per, texts = [];
			for (let i = 0; i < cut; i += per) texts.push(sents.slice(i, i + per).join("").trim());
			const rest = joined.slice(sents.slice(0, cut).join("").length).trim();
			if (this.base.trim()){ texts[0] = this.base.trim() + " " + texts[0]; this.base = ""; }
			this.held = rest ? [{ text: rest, br: false }] : [];
			this.draw_caption();
			this.enqueue(texts);
		} catch (e){ console.error("chat: sending finished sentences failed", e); }
	}

	// Messages leave in order, one at a time; `posting` keeps a live reload waiting until the last is delivered.
	enqueue(texts){
		this.posting = (this.posting ?? 0) + 1;
		this.last_send_at = performance.now(); this.chunk_start = undefined;
		this.post_tail = (this.post_tail ?? Promise.resolve())
			.then(async () => { for (const t of texts) await this.post_held(t); })
			.catch(e => console.error("chat: sending failed", e))
			.finally(() => { this.posting--; });
	}

	/* "pause" mode, checked every CHECK_MS while listening: `pause_send_ms` of silence sends EVERYTHING
	   still on screen, the guess included (the same words Send would send). A failure is logged, never silent. */
	auto_check(){
		try {
			if (this.mode_now() === "manual" || this.state !== "listening" && this.state !== "transcribing") return;
			const text = this.field?.el.value.trim();
			if (!text || !this.tail) return;   // nothing dictated is waiting (typed words are never auto-sent)
			const quiet = performance.now() - (this.last_speech ?? performance.now());
			if (SETTINGS.paragraph_pause_ms > 0 && quiet >= SETTINGS.paragraph_pause_ms && this.ends_sentence(text)) return this.send_screen();   // a natural pause
			if (this.mode_now() === "pause" && quiet >= SETTINGS.pause_send_ms) this.send_screen();   // the tail
			else this.check_chunk();
		} catch (e){ console.error("chat: automatic send failed", e); }
	}

	// Everything visible goes out as one message, the mic keeps recording, the box starts fresh.
	send_screen(){
		const text = this.field?.el.value.trim();
		if (!text) return;
		this.consume_sent();
		this.draw_caption();   // empty the box now, in this same tick, so no second check can send it again
		this.enqueue([text]);
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

	flush_held(){
		clearTimeout(this.held_timer);
		const text = (this.held ?? []).map(h => h.text).join(" ").trim();
		this.held = [];
		if (!text) return;
		// SENT: the box empties (the mic keeps listening) and the words become
		// their own chat bubble when Servex logs them.
		this.draw_caption();
		if (!this.pending?.length && !this.partial_text) this.release_height();
		return this.post_held(text);
	}

	/* Hand the finished words to the caller's `deliver(entry)` (how a send is posted is
	   the app's business; it answers true or false). `re` still pins the sentence to the
	   open target (unchanged); `selected` says the same thing explicitly, so a router
	   can read it as the DEFAULT and still file a sentence elsewhere. If delivery fails
	   the words are appended to the dev-server log through Dictate's own fallback file. */
	async post_held(text){
		const entry = { type: "prompt", by: "owner", text, via: "whisper" };
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
