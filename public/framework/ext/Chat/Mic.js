import Socket from "/framework/dev/Socket/Socket.js";
import Dictate from "/framework/ux/Dictate/Dictate.js";
import Capture from "/framework/ux/Dictate/capture.js";
import FsFile from "/framework/ext/filesystem/FsFile.js";
import RefineSystem from "/framework/ext/Refine/RefineSystem.js";
import DictateHealth from "/framework/ux/Dictate/DictateHealth.js";

/** The microphone of a composer: `ux/Dictate` with a few methods redirected; speech goes into the composer's box and goes out as one message. see doc/mic-notes.md#overrides */
// Every knob of the whisper-to-box flow, read live everywhere. see doc/mic-notes.md#settings
export const SETTINGS = {
	send_mode: "pause",         // "pause" (sentences + the silence remainder) | "sentences" (no silence send)
	sentences_per_send: 0,      // 0 = off; N = one message per N finished sentences (the old way)
	paragraph_pause_ms: 700,   // quiet after a finished sentence that sends everything so far; see doc/mic-notes.md#settings
	chunk_chars: 1200,          // safety: a message this long is cut at the next sentence end
	chunk_ms: 60000,            // safety: words waiting this long are cut at the next sentence end
	pause_send_ms: 1500,   // quiet before everything left on screen is sent; see doc/mic-notes.md#settings
	break_pause_ms: 1500,       // quiet before a segment may start a new paragraph in the box
	guess_ms: 900,              // how often the growing sentence is re-sent to Whisper
	box_lines: 3,   // box grows to this many lines, then scrolls; see doc/mic-notes.md#settings
	fillers: "ah uh um er erm hmm mm",   // words that never reach the box
	clean: true,   // on: a composer with `revise:` runs the clean-up; off: all raw; see doc/mic-notes.md#settings
	into: "chat",   // "chat" = growing bubble in the chat log, "box" = the text box; see doc/mic-notes.md#settings
};
const STORE = "chat.mic.settings.3";   // .3: the shorter 2026-09-30 defaults must not be shadowed by an old saved value
// Carry the owner's saved values over from the old key; drop stale defaults. see doc/mic-notes.md#settings-migration
try {
	const saved = JSON.parse(localStorage.getItem(STORE) ?? localStorage.getItem("chat.mic.settings.2") ?? "{}");
	if (saved.pause_send_ms === 4000 || saved.pause_send_ms === 2500) delete saved.pause_send_ms;
	if (saved.paragraph_pause_ms === 2500 || saved.paragraph_pause_ms === 1500) delete saved.paragraph_pause_ms;
	// A saved "manual" send mode can no longer be chosen: reset it. see doc/mic-notes.md#settings-migration
	if (saved.send_mode === "manual") saved.send_mode = "pause";
	Object.assign(SETTINGS, saved);
} catch {}
export const save_settings = () => { try { localStorage.setItem(STORE, JSON.stringify(SETTINGS)); } catch {} };
export const CHECK_MS = 250;
// Fired on `document` when the gear's "clean" checkbox changes (`detail` is the new value), for nodes outside this mic.
export const CLEAN_CHANGED_EVENT = "chat-mic-clean-changed";

let beep_ctx;
// Await resume() so currentTime is not frozen at 0. see doc/mic-notes.md#beep-needs-a-running-context
async function beep(kind){
	try {
		beep_ctx ??= new AudioContext();
		if (beep_ctx.state !== "running") await beep_ctx.resume();
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

// A live reload waits while any mic is recording or has unsent words. see doc/mic-notes.md#reload-guard
const all_mics = new Set();
Socket.singleton().add_busy(() => [...all_mics].some(m => m.active()));
// The last net: any reload or navigation while a mic is live asks first.
addEventListener("beforeunload", e => { if ([...all_mics].some(m => m.active())){ e.preventDefault(); e.returnValue = ""; } });

// Filler words never reach the box or the log (whole words, any case, with their comma).
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

// `text` minus the words `sent` already covers at its start, fuzzy-matched. see doc/mic-notes.md#strip_words-duplicate-bubble
export function strip_words(text, sent){
	const norm = w => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
	const tw = text.split(/\s+/).filter(Boolean), sw = sent.split(/\s+/).filter(Boolean);
	const T = tw.map(norm), S = sw.map(norm);
	const lev = (a, b) => {
		let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
		for (let i = 1; i <= a.length; i++){
			const cur = [i];
			for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
			prev = cur;
		}
		return prev[b.length];
	};
	const word = (a, b) => a === b ? 0 : Math.min(1, lev(a, b) / Math.max(a.length, b.length, 1));
	const D = Array.from({ length: S.length + 1 }, (_, i) => Array(T.length + 1).fill(i));
	for (let j = 0; j <= T.length; j++) D[0][j] = j;
	for (let i = 1; i <= S.length; i++) for (let j = 1; j <= T.length; j++)
		D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + word(S[i - 1], T[j - 1]));
	// Match all of `sent` to the front of `text`, or all of `text` to the front of `sent`.
	let best = null;
	const consider = (i, j) => {
		if (!i || !j) return;
		const score = D[i][j] / Math.max(i, j);
		if (score > 0.35 || (best && (score > best.score || (score === best.score && j <= best.j)))) return;
		best = { score, i, j };
	};
	for (let j = 1; j <= T.length; j++) consider(S.length, j);
	for (let i = 1; i <= S.length; i++) consider(i, T.length);
	return best ? tw.slice(best.j).join(" ") : text;
}

export class ComposerMic extends Dictate {

	static REFINE_WAIT_MS = 1500;   // the longest a send waits for the live refine's paragraphed text
	// Paragraph gaps: `on_level` measures the silence before each segment. see doc/mic-notes.md#paragraph-gaps
	on_level(level){
		const before = this.has_speech, now = performance.now();
		super.on_level(level);
		if (this.level > this.silence_at){
			if (!before) this.gap_before = this.last_speech ? now - this.last_speech : 0;
			this.last_speech = now;
		}
	}

	// A paragraph break needs a real pause AND a finished sentence before it.
	can_break(prev, gap){ return !!prev && gap >= SETTINGS.break_pause_ms && /[.!?…]["')\]]*$/.test(prev.trim()); }

	// The guess stays on screen until its final arrives. see doc/mic-notes.md#the-guess-stays-on-screen-until-its-final-arrives
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

	// The box is `base + dictated words`, replaced, never appended. see doc/mic-notes.md#the-box-base--dictated-words-and-clean-mode
	build_tail(use_raw){
		const parts = (this.held ?? []).filter(h => !h.gone).map((h, i) => (i ? (h.br ? "\n\n" : " ") : "") + (use_raw ? (h.raw ?? h.text) : h.text));
		for (const p of (this.pending ?? []).filter(p => p.text)) parts.push((parts.length ? (this.can_break(parts.join(""), p.gap) ? "\n\n" : " ") : "") + p.text);
		let guess = unfill(this.partial_text ?? "");
		if (guess && this.dropped && this.dropped.epoch === this.segment_epoch) guess = strip_words(guess, this.dropped.text);
		if (guess) parts.push((parts.length ? ((this.has_speech && this.can_break(parts.join(""), this.gap_before ?? 0)) ? "\n\n" : " ") : "") + guess);
		return parts.join("");
	}

	// With `into === "chat"` all drawing goes into a ghost textarea and `on_live` draws the bubble. see doc/mic-notes.md#into-the-chat-not-the-box
	// `this.into`: a per-mic override of SETTINGS.into; the gear clears it.
	live_active(){ return !!this.on_live && (this.into ?? SETTINGS.into) === "chat"; }
	box(){ return this.live_active() ? (this.ghost ??= document.createElement("textarea")) : this.field?.el; }

	// The box changed: take the dictated words out of the old one, adopt the new one's text as the owner's.
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
		const t1 = performance.now();
		this.tail = said ? (this.base && !/\s$/.test(this.base) ? " " : "") + said : "";
		const next = this.base + this.tail;
		const t2 = performance.now();
		if (next === box.value){ this.t_result = undefined; return; }
		const stuck = box.scrollTop + box.clientHeight >= box.scrollHeight - 4;   // was the owner reading the newest words?
		this.own = true;
		box.value = next;
		box.setSelectionRange?.(next.length, next.length);
		if (stuck) box.scrollTop = box.scrollHeight;   // keep the newest words in view unless the owner scrolled up
		// Never shrink while dictating: Whisper's guess can briefly come back shorter.
		this.floor_h = Math.max(this.floor_h ?? 0, box.offsetHeight);
		box.style.minHeight = this.floor_h + "px";
		const t3 = performance.now();
		box.dispatchEvent(new Event("input", { bubbles: true }));
		this.own = false;
		if (box === this.ghost) this.show_live(said);
		this.mark(t0, t1, t2, t3, performance.now());
		this.refine_tick(next);
	}

	// Every mic refines live, debounced, fails quietly. see doc/mic-notes.md#live-refine
	live_prompt_id(){ return this._live_prompt_id ??= "composer-" + Math.random().toString(36).slice(2, 10); }

	refine_tick(text){
		if (!this.revise || !text?.trim()) return;
		clearTimeout(this._live_timer);
		this._live_timer = setTimeout(() => {
			RefineSystem.post_live({ prompt: this.live_prompt_id(), text, final: false, session: this.refine_session_id?.() })
				.then(out => { if (out) this.on_refine_live?.(out); });
		}, 400);
	}

	// The send closes the live-refine batch (`final: true`); null means keep the plain text. see doc/mic-notes.md#live-refine-final
	async refine_final(text){
		if (!this.revise || !text?.trim()) return null;
		clearTimeout(this._live_timer);
		const prompt = this.live_prompt_id();
		this._live_prompt_id = null;   // the next dictation is a new prompt, not more of this one
		// A send never waits on the model: past REFINE_WAIT_MS it goes with the text it has (the outline still finishes server-side).
		const late = new Promise(r => setTimeout(() => r(null), ComposerMic.REFINE_WAIT_MS));
		return Promise.race([RefineSystem.post_live({ prompt, text, final: true, session: this.refine_session_id?.() }), late]);
	}

	// One paragraph per outline section the slots cite, or every ~4 sentences.
	static paragraph_from_slots(slots, outline){
		if (!slots?.length) return "";
		const sections = outline?.sections ?? [];
		const section_of = n => sections.find(s => (s.cards ?? []).some(c => (c.cites ?? []).includes(n)))?.title ?? null;
		const paras = []; let cur = [], cur_sec, count = 0;
		for (const s of slots){
			const text = (s.clean ?? s.raw ?? "").trim();
			if (!text) continue;
			const sec = section_of(s.n);
			if (cur.length && (sec !== cur_sec || count >= 4)){ paras.push(cur.join(" ")); cur = []; count = 0; }
			cur.push(text); cur_sec = sec; count++;
		}
		if (cur.length) paras.push(cur.join(" "));
		return paras.join("\n\n");
	}

	// `settled` is what Whisper finished, `guess` the still-moving end; `sent` is true on the one call that empties the bubble after a send.
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

	// Timing per box update (`wait`, `unfill`, `para`, `box`, `input`); only updates that follow a Whisper answer are logged.
	mark(t0, t1, t2, t3, t4){
		if (this.t_result === undefined) return;
		const row = { wait: t0 - this.t_result, unfill: t1 - t0, para: t2 - t1, box: t3 - t2, input: t4 - t3, whisper: this.whisper_ms ?? 0 };
		this.t_result = undefined;
		(ComposerMic.timings ??= []).push(row);
	}

	release_height(){
		this.floor_h = 0;
		if (this.field?.el) this.field.el.style.minHeight = "";
	}

	watch_box(box){
		box.addEventListener("input", () => { if (!this.own && this.drawn_box === box) this.owner_edit(box); });
	}

	// The box grows to a ceiling, then scrolls. see doc/mic-notes.md#box-ceiling
	dress(box){
		box.style.maxHeight = SETTINGS.box_lines + "lh"; box.style.overflowY = "auto";
	}

	// One small input per SETTINGS key; the caller decides where it is shown. see doc/mic-notes.md#settings-panel
	settings_panel(){
		const panel = document.createElement("div");
		panel.className = "chatbox-mic-settings";
		const rows = [
			["clean", "clean transcription (fast assistant clean-up)", "boolean"],
			["into", "dictation goes into", ["chat", "box"]],
			["send_mode", "send mode", ["pause", "sentences"]], ["sentences_per_send", "sentences per send (0 = off)", "number"], ["paragraph_pause_ms", "natural pause (ms)", "number"],
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
				if (key === "into") this.into = undefined;   // same rule, for the mode table's own "into" override
				if (key === "box_lines" && this.field?.el) this.field.el.style.maxHeight = SETTINGS.box_lines + "lh";
				// Tell nodes outside this mic (Composer's "raw" chip) that the kill switch flipped.
				if (key === "into") this.draw_caption();   // move the words still being spoken to the new place at once
				if (key === "clean") document.dispatchEvent(new CustomEvent(CLEAN_CHANGED_EVENT, { detail: SETTINGS.clean }));
				save_settings();
			});
			panel.append(name, input);
		}
		return panel;
	}

	// The owner typed or pasted: text before the dictated tail is theirs; an edit inside the dictation makes the whole box theirs.
	owner_edit(box){
		const v = box.value, t = this.tail ?? "";
		if (t && v.endsWith(t)){ this.base = v.slice(0, v.length - t.length); return; }
		this.base = v;
		if (!t) return;
		for (const h of this.held ?? []) h.gone = true;
		this.drop_partial();
		this.tail = "";
	}

	// The moving guess is cumulative: once its words are in the box for good, only what comes after may appear again.
	drop_partial(){
		const g = unfill(this.partial_text ?? "");
		this.dropped = g ? { text: g, epoch: this.segment_epoch } : null;
	}

	// Send happened: reset everything the caption uses so a late Whisper update cannot restore what was sent.
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

	// Starting any mic stops whichever one was on. see doc/mic-notes.md#one-microphone-at-a-time
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

	// Dictate calls this the instant the mic is genuinely open. see doc/mic-notes.md#start-sound
	on_listening(){
		beep("start"); this.watch_capture();
		clearInterval(this.auto_timer);
		this.auto_timer = setInterval(() => this.auto_check(), CHECK_MS);
	}

	// A dead track is revived silently, with no stop/start beep. see doc/mic-notes.md#silent-revival-of-a-dead-track
	watch_capture(){
		const cap = this.mic, track = cap?.stream?.getAudioTracks()[0];
		if (cap?.ctx) cap.ctx.onstatechange = () => {
			if (cap.ctx.state === "suspended" && this.state === "listening") cap.ctx.resume().catch(() => {});
		};
		track?.addEventListener("ended", async () => {
			if (this.mic !== cap || this.state !== "listening" || this.reviving) return;
			const now = performance.now();
			const repeat = now - (this.last_revive ?? -1e9) < 5000;
			this.last_revive = now;
			if (repeat) return this.set_error("The microphone was disconnected.");
			this.reviving = true;
			this.log_step?.("mic", "track ended — reopening silently, still listening");
			try {
				const { id, label } = this.device();
				const fresh = new Capture({ device_id: id, device_label: label });
				await fresh.start(level => this.on_level(level));
				cap.stop();   // release the dead one, now that a live replacement is in
				this.mic = fresh;
				this.log_step?.("mic", "reopened");
				this.watch_capture();   // re-arm on the NEW track
			} catch (e){
				this.log_step?.("mic", "could not reopen: " + (e?.name ?? e?.message ?? e));
				this.set_error("The microphone was disconnected.");
			} finally { this.reviving = false; }
		});
	}

	// Every automatic error stop is a stop too — say so out loud.
	set_error(msg){
		const was = this.state === "listening" || this.state === "transcribing";
		super.set_error(msg);
		if (was) beep("stop");
	}

	// No `at` sent to Servex: see Dictate.js `log_prompt`.
	// `send_mode` is one switch ('pause' | 'sentences'; 'manual' is legacy). see doc/mic-notes.md#send-modes
	mode_now(){ return this.send_mode ?? SETTINGS.send_mode; }

	// Clean mode needs both the caller's `revise:` and the owner's kill switch (`SETTINGS.clean`).
	clean_active(){ return !!(this.revise && SETTINGS.clean); }

	// The one gate in front of Dictate's `revise_chunk`.
	revise_chunk(raw, chunk_id, chunk_at){
		if (!this.clean_active()) return;
		return super.revise_chunk(raw, chunk_id, chunk_at);
	}

	// Each finished utterance is its own `held` item `{text, raw, chunk_id, ready}`. see doc/mic-notes.md#held-items
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

	// The fast assistant answered for one utterance: swap its text in. see doc/mic-notes.md#on_revised-and-on_revise_failed
	// A caller's hook is `on_clean`, never `on_revised`: View would shadow this method. see doc/mic-notes.md#on_revised-and-on_revise_failed
	on_revised(text, meta = {}){
		const { chunk_id } = meta;
		const item = (this.held ?? []).find(h => h.chunk_id === chunk_id);
		if (item){ item.text = text; this.draw_caption(); }
		this.release_waiter(chunk_id);
		this.on_clean?.(text, meta);
	}

	// The fast assistant gave up: stamp the item so a send can say so once. see doc/mic-notes.md#on_revised-and-on_revise_failed
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

	// Called by every send path after `await_clean()`, once per send: hints once if any item failed.
	notify_if_failed(items){
		const failed = items.find(h => h.failed);
		if (failed) this.on_clean_failed?.(failed.fail_why ?? this.last_fail_why);
	}

	// Dig back: show what Whisper produced instead of the clean-up; returns the new state.
	toggle_raw(){
		this.show_raw = !this.show_raw;
		this.draw_caption();
		return this.show_raw;
	}

	// Wait up to `ms` for unanswered clean-ups, then fall back to raw. see doc/mic-notes.md#held-items
	async await_clean(ms = 5000){
		const waiters = (this.held ?? []).filter(h => !h.gone && h.ready).map(h => h.ready);
		if (!waiters.length) return;
		await Promise.race([Promise.all(waiters), new Promise(res => setTimeout(res, ms))]);
	}

	// A late answer on a stolen mic is discarded, not stranded. see doc/mic-notes.md#arm-late-answers
	arm(){
		if (this.mode_now() === "manual") return;
		if (this.state !== "listening" && this.state !== "transcribing"){
			for (const h of this.held ?? []) h.gone = true;
			this.draw_caption();
			return;
		}
		this.chunk_start ??= performance.now();
		const per = this.sentences_per_send ?? SETTINGS.sentences_per_send;   // a caller can set one mic apart from the gear panel (`composer({ per_sentence })`)
		if (per | 0) this.send_sentences(per | 0); else this.check_chunk();
	}

	// Safety chunk: words past chunk_ms or chunk_chars go out at the next sentence end.
	check_chunk(){
		const text = this.held_text();
		if (text && (text.length >= SETTINGS.chunk_chars || performance.now() - (this.chunk_start ?? performance.now()) >= SETTINGS.chunk_ms)) this.send_sentences(Infinity);
	}

	// Finished sentences go out now; the unfinished tail stays held. Sends the joined RAW text as `raw`. see doc/mic-notes.md#send_sentences
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
			// `raw` goes on the first outgoing message only.
			for (let i = 0; i < cut; i += per) texts.push({ text: sents.slice(i, i + per).join("").trim(), raw: i === 0 ? joined_raw : null });
			const rest = joined.slice(sents.slice(0, cut).join("").length).trim();
			if (this.base.trim()){ texts[0].text = this.base.trim() + " " + texts[0].text; this.base = ""; }
			this.held = rest ? [{ text: rest, raw: rest, br: false, ready: Promise.resolve() }] : [];
			this.draw_caption();
			this.enqueue(texts);
		} catch (e){ console.error("chat: sending finished sentences failed", e); }
		finally { this.sending_sentences = false; }
	}

	// Messages leave in order; `posting` keeps a live reload waiting. Items are `{text, raw}` or a string.
	enqueue(items){
		this.posting = (this.posting ?? 0) + 1;
		this.last_send_at = performance.now(); this.chunk_start = undefined;
		// returned, so a watcher (ux/Dictate/DictationBar.js WATCHED) hears the END of a send too, not only its start: the "sending" word went stale
		return this.post_tail = (this.post_tail ?? Promise.resolve())
			.then(async () => { for (const it of items) await this.post_held(it); })
			.catch(e => console.error("chat: sending failed", e))
			.finally(() => { this.posting--; });
	}

	// "pause" mode, every CHECK_MS: `pause_send_ms` of silence sends everything on screen.
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

	// Everything visible goes out as one message after waiting for clean-ups. see doc/mic-notes.md#send_screen
	async send_screen(){
		if (this.sending_screen) return;
		if (!this.box()?.value.trim()) return;
		this.sending_screen = true;
		// Instant feedback: fires before the clean-up wait. see doc/mic-notes.md#instant-feedback
		this.on_send_start?.((this.base + (this.base && !/\s$/.test(this.base) ? " " : "") + this.build_tail(true)).trim());
		try {
			await this.await_clean();
			const text = this.box()?.value.trim();
			if (!text) return;   // the owner cleared the box, or a stop already sent it, while this was waiting
			this.notify_if_failed((this.held ?? []).filter(h => !h.gone));
			const raw = (this.base + (this.base && !/\s$/.test(this.base) ? " " : "") + this.build_tail(true)).trim() || text;
			this.consume_sent();
			this.draw_caption();   // empty the box now, in this same tick, so no second check can send it again
			// One last live-refine call (`final: true`); paragraphed slots replace `text` when the route answers.
			const live = await this.refine_final(raw);
			this.enqueue([{ text: live?.slots?.length ? ComposerMic.paragraph_from_slots(live.slots, live.outline) : text, raw }]);
		} finally { this.sending_screen = false; }
	}

	held_text(){ return (this.held ?? []).filter(h => !h.gone).map(h => h.text).join(" ").trim(); }
	ends_sentence(t){ return /[.!?…]["')\]]*$/.test(t.trim()); }

	// Stopping never loses words: auto modes send what is on screen.
	async stop(){
		const was = this.state === "listening";
		clearInterval(this.auto_timer);
		try { return await super.stop(); }
		finally {
			const mode = this.mode_now();
			if (mode !== "manual") this.send_sentences();
			if (mode === "pause") this.send_screen(); else if (mode === "sentences") this.flush_held();
			// Not when `set_error()` already beeped. see doc/mic-notes.md#stop-beeps-once
			if (was && this.state !== "error") beep("stop");
		}
	}

	async flush_held(){
		clearTimeout(this.held_timer);
		// Instant feedback, same seam as `send_screen()`.
		this.on_send_start?.((this.held ?? []).map(h => h.raw ?? h.text).join(" ").trim());
		await this.await_clean();   // deliverable 2: wait ~5s for anything still cleaning, then send what's there
		const held = (this.held ?? []);
		this.notify_if_failed(held);
		const text = held.map(h => h.text).join(" ").trim();
		const raw = held.map(h => h.raw ?? h.text).join(" ").trim();
		this.held = [];
		if (!text) return;
		this.draw_caption();
		if (!this.pending?.length && !this.partial_text) this.release_height();
		// One last live-refine call, as in `send_screen()`.
		const live = await this.refine_final(raw);
		return this.post_held({ text: live?.slots?.length ? ComposerMic.paragraph_from_slots(live.slots, live.outline) : text, raw });
	}

	// Hand the words to `deliver(entry)`; on failure they go to Dictate's fallback log. see doc/mic-notes.md#post_held
	// Never send the same sentence twice in a row. see doc/mic-notes.md#duplicate-sends
	same_as_last_send(text){
		// Same words, or words differing only by Whisper mishearing (`strip_words` is the fuzzy matcher).
		const now = performance.now(), prev = this.last_sent_text, t = String(text ?? "").trim();
		const close = !!prev && !!t && now - (this.last_sent_at ?? -Infinity) < ComposerMic.DUP_WINDOW_MS;
		const dup = close && (strip_words(t, prev) === "" && strip_words(prev, t) === "")   // BOTH ways: "Okay." then "Okay, now delete it." is two messages;
		this.last_sent_text = t; this.last_sent_at = now;
		return dup;
	}

	// Whisper's doubling of a whole-text repeat of 2+ words: keep the first half.
	static collapse_repeat(text){
		const w = String(text ?? "").trim().split(/\s+/).filter(Boolean);
		if (w.length < 4 || w.length % 2) return text;
		const h1 = w.slice(0, w.length / 2).join(" "), h2 = w.slice(w.length / 2).join(" ");
		return strip_words(h2, h1) === "" ? h1 : text;
	}

	async post_held(item){
		const got = typeof item === "string" ? { text: item, raw: null } : item;
		const text = ComposerMic.collapse_repeat(got.text), raw = got.raw && ComposerMic.collapse_repeat(got.raw);
		if (this.same_as_last_send(text)){ console.warn("chat: dropped a duplicate send (same words, " + ComposerMic.DUP_WINDOW_MS + "ms window):", text); return; }
		const entry = { type: "prompt", by: "owner", text, via: "whisper" };
		if (raw && raw.trim() && raw.trim() !== text.trim()){ entry.raw = raw; entry.level = "clean"; }
		const re = this.re?.();
		if (re){ entry.re = re; entry.selected = re; }
		this.posting = (this.posting ?? 0) + 1;
		let ok;
		// A send that never settles must not hold the queue: every later sentence waits behind it (the stall, test/stall.mjs).
		const late = new Promise(r => setTimeout(() => r("late"), ComposerMic.DELIVER_MS));
		try { ok = await Promise.race([this.deliver?.(entry), late]); } catch (e){ ok = false; DictateHealth.set("sent", "bad", "not sent: " + (e?.message ?? e)); } finally { this.posting--; }
		if (ok === "late"){ ok = false; DictateHealth.set("sent", "bad", `not sent: the send was still open after ${ComposerMic.DELIVER_MS / 1000} s, so the next sentences go on without it (its words are kept in the fallback log)`); }
		if (ok) return;
		try { if (!await FsFile.append(this.log_fallback_file, { at: new Date().toISOString(), ...entry })) throw new Error("append refused"); }
		catch (e){ console.warn("chat: could not log this utterance", e); }
	}
}
ComposerMic.prototype.mode = "open";   // the mic stays on; draw_caption() types into the box
ComposerMic.DUP_WINDOW_MS = 4000;
ComposerMic.DELIVER_MS = 25000;   // the backstop: Session.js gives up after 10 s per call, so only a deliver with no timeout of its own reaches this   // same words from the same mic this close together are one send (see post_held)
