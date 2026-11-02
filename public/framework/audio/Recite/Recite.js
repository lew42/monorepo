import { View } from "../../core/View/View.js";
import track from "../../core/track/track.js";
import Part from "../Part.js";
import Voice from "../Voice/Voice.js";
import BargeIn from "./BargeIn.js";
import ReciteBar from "./ReciteBar.js";
import ReciteHighlight from "./ReciteHighlight.js";
import ReciteTap from "./ReciteTap.js";

View.stylesheet(import.meta, "Recite.css");

/**
 * class Recite extends Part — reads text aloud, the reverse of transcription.
 * It splits the text into sentences, has its `Voice` render each one on
 * recite-server (Kokoro, Servex/ext/recite/), and plays them on one timeline,
 * so pause, back 10 s and restart work across sentences. When the server is
 * down it falls back to the browser's own voice and keeps checking for the
 * server. Its parts: `Recite.BargeIn` (pauses when you talk), `Recite.Bar`
 * (the one-line control) and `Recite.Highlight` (the karaoke playhead: the
 * sentence and word being read light up in the chat). How it fits: readme.md.
 *
 *   const recite = new Recite();
 *   recite.read("Hello there. This is read aloud.");
 *   recite.pause(); recite.back(10); recite.restart();
 *   recite.bar;   // the control line
 */
export default class Recite extends Part {

	state = "idle";        // idle | loading | playing | paused | heard (paused by barge-in)
	server = "unknown";    // unknown | online | offline (then the browser's voice reads)
	error = "";            // the last failure, one plain line, shown on the bar
	url = Recite.default_url();
	voice = null;          // a Voice (one persona); Voice.PERSONAS lists them
	chunks = [];           // one per sentence: {text, start, seconds, src, pending, reply}
	reply_id = -1;         // bumped by every queue() that is not a take() continuation: chunks.reply groups a reply's own sentences, so drop_heard() can cut just one reply out of the queue
	at = 0;                // the chunk playing, or paused in
	auto = Recite.remember("auto") != null ? Recite.remember("auto") === "true" : true;   // read new replies by themselves: on by default, phone and PC alike (the owner, 2026-11-01); the 🗣 button turns it off and that is remembered
	live = null;           // the reply being streamed: {text, queued, fresh}
	pending_ids = [];      // [{id, last}]: a reply's message id, and the index of its last chunk — marked played once that chunk finishes
	wait_at = null;         // turn-taking: index of the chunk held back because the owner is talking (null: nothing held)
	quiet_since_wait = null;   // turn-taking: performance.now() of the moment the owner fell quiet while `wait_at` was set
	wait_timer = null;      // turn-taking: the check_wait() poll timer
	turn_wait_ms = 2500;    // no-flood: how much quiet before a held reply starts (2-3 s, the owner's own range, 2026-11-02; was 1.5 s) — BargeIn.quiet_ms (the auto-resume-after-a-barge-in window) is a separate field with the same new default, not merged into this one: several existing tests set it directly for speed, and the two timers gate different moments (starting a fresh reply vs. resuming a cut one)
	echo_guard_ms = 1500;   // echo: how long after playback stops BargeIn still treats the mic as likely hearing its own voice (a raised threshold, a fuzzy text match against what was just read)
	echo_guard_until = null;   // echo: performance.now() the guard above expires at; set by set() whenever "playing" ends
	thinking_cue = true;    // a short, subtle tone once the owner stops speaking and a reply is pending, again cue_repeat_ms later if it still has not started; false turns it off
	cue_repeat_ms = 2000;   // thinking cue: how long to wait for the reply before the second, and last, cue
	cue_timer = null;       // thinking cue: expect_reply()'s own pending timeout for the second cue
	cue_pending = false;    // thinking cue: true from the owner's line landing on the wire until the reply starts or a fresh line replaces it
	pending_updates = [];   // no-flood: agent updates (a reply from any assistant id but "smart") held here while cue_pending is true, so the direct answer to the owner's own line plays before them — flush_updates() queues them once it lands (or the safety timer below fires)
	update_hold_timer = null;   // no-flood: flush_updates()'s own safety timeout, in case no direct reply ever arrives
	update_hold_ms = 4000;   // no-flood: how long an agent update waits for the direct answer before it is queued anyway

	constructor(...args){
		super(...args);
		this.assign(...args);   // a field named like an option overwrites it: audio/Voice/Voice.js has the note
		this.voice ??= Voice.persona(Recite.remember("voice") ?? Voice.PERSONAS[0].name);
		this.listeners = new Set();
		this.token = 0;
		this.done = new Set();   // replies already read, so the settled line after a stream is not read twice
		this.audio = typeof Audio === "function" ? new Audio() : null;   // node (the core test) has none
		this.audio?.addEventListener("ended", () => this.ended());
		this.audio?.addEventListener("timeupdate", () => this.changed());
		this.barge = new this.constructor.BargeIn({ recite: this });
		this.highlight = new this.constructor.Highlight({ recite: this });
		this.tap = new this.constructor.Tap({ recite: this });
		this.unlock_on_tap();
		this.trace("loaded", { host: globalThis.location?.host, ua: globalThis.navigator?.userAgent, coarse: !!globalThis.matchMedia?.("(pointer: coarse)").matches, saved_auto: Recite.remember("auto") });   // does Recite even start on this page?
		// 4 s later: is the ✦ Sheet on this page, and which version of its read-aloud ran (a phone that logs no "sheet: boot" shows why here)
		if (typeof document !== "undefined") setTimeout(() => this.trace("page check", { sheet_v: globalThis.lew42_sheet_v ?? null, sheet: !!document.querySelector(".drawer-rail"), app: !!document.querySelector("body > *"), page: location.pathname,
			loads: performance.getEntriesByType?.("resource").filter(e => /drawer\/(Sheet|menu)\.js|\/app\.js|Recite\/Recite\.js/.test(e.name)).map(e => ({ url: e.name.replace(location.origin, ""), status: e.responseStatus, bytes: e.transferSize, body: e.decodedBodySize, ms: Math.round(e.duration) })) }), 4000);   // where each module came from: bytes 0 = the browser cache, body = the file size it ran
		Recite.track?.(this);
	}

	/** A phone plays sound only from a tap. A reply arrives from the network, with no tap, so the browser refused it
	 *  (NotAllowedError, "tap play") and nothing was heard. The first tap anywhere on the page (the mic, a button) plays
	 *  a silent tenth of a second on this one <audio>, which unlocks it for the rest of the visit; a reply held by that
	 *  refusal then starts. (dictation-v3, 2026-11-01) */
	unlock_on_tap(){
		if (!this.audio || typeof document === "undefined") return;
		const kinds = ["pointerdown", "touchend", "keydown"];
		const unlock = () => {
			if (this.unlocked || this.unlocking) return;   // one tap fires pointerdown AND touchend: unlock once
			const refused = this.state === "paused" && /tap/.test(this.error);
			if (this.state !== "idle" && !refused) return;   // a sentence is loaded or playing: never swap its source (pause keeps its place)
			this.unlocking = true;
			const a = this.audio;
			a.muted = true; a.src = Recite.SILENCE;
			a.play().then(() => {
				a.pause(); a.muted = false; this.unlocked = true; this.trace("unlocked by a tap");
				kinds.forEach(k => document.removeEventListener(k, unlock, true));
				if (this.state === "paused" && /tap/.test(this.error)) this.resume();   // the reply the browser refused
			}, e => { a.muted = false; this.trace("unlock refused", { error: e?.name }); }).finally(() => { this.unlocking = false; });
		};
		kinds.forEach(k => document.addEventListener(k, unlock, true));
	}

	/** One line per step in the Whisper log (the phone already writes there, /framework/audio/Whisper/log/), so a read-aloud that stays
	 *  silent on a real phone says why: reply heard, skipped and why, speak asked, play() refused. (dictation-v3, 2026-11-01) */
	trace(kind, fields = {}){
		if (typeof document === "undefined") return;
		const line = { state: this.state, auto: this.auto, server: this.server, unlocked: !!this.unlocked, ...fields };
		import("../Whisper/WhisperLog.js").then(m => m.default.event("recite", kind, line)).catch(e => console.error("Recite trace: the Whisper log failed", e));
		try { Recite.on_trace?.(kind, line); } catch (e){ console.error("Recite trace: on_trace failed", e); }   // a second channel the page wires (ux/Dictate/chat.js: the session file)
	}

	/** Calls fn() on every change of state or position; returns an unsubscribe. */
	on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }
	// A listener torn down mid-call (core/Test runs several test() files' View instances concurrently, so a
	// shared captor can go stale between `on()` and `changed()`) is skipped quietly instead of logged: calling it
	// was always going to do nothing useful, and the console.error was failing smoke on a race this class does
	// not cause (review finding, read-aloud-next 2026-11-02; doc/architecture.md has the detail).
	changed(){ for (const fn of this.listeners) if (typeof fn === "function") try { fn(this); } catch (e){ console.error("Recite: a listener failed", e); } }
	set(state, error){
		if (this.state === "playing" && state !== "playing") this.echo_guard_until = performance.now() + this.echo_guard_ms;
		this.state = state; if (error !== undefined) this.error = error; this.changed(); this.barge?.sync();
	}

	/** True while BargeIn should treat the mic as likely hearing Recite's own voice: playing right now, or within
	 *  `echo_guard_ms` of having stopped (the leaked sound and a cough both linger a moment after). */
	echo_active(){ return this.state === "playing" || (this.echo_guard_until != null && performance.now() < this.echo_guard_until); }

	/* ── reading ─────────────────────────────────────────────────────── */

	/** Read `text` from the start, dropping whatever was being read. Public API (the readme's `recite.read(...)`); a reply
	 *  arriving from a chat session never calls this any more — it queues (below), so a new reply never cuts off the one
	 *  being read (dictation-v3, 2026-11-01, "a new reply cut off the one being read"). */
	read(text){ this.stop(); return this.queue(text); }

	/** Add `text` after what is already queued; starts reading if idle, UNLESS the owner is talking right now — then it
	 *  waits for about `turn_wait_ms` of quiet (turn-taking: never start a reply over the owner's own words).
	 *  `continuing` (set only by take(), below): these chunks are more of the SAME live reply, not a new one — keep
	 *  the current `reply_id` so drop_heard() still treats the whole streamed-so-far reply as one unit. */
	queue(text, continuing = false){
		const first = this.chunks.length;
		if (!continuing) this.reply_id++;
		const id = this.reply_id;
		for (const piece of Recite.split(text)) this.chunks.push({ text: piece, start: null, seconds: null, src: null, pending: null, reply: id });
		if (this.chunks.length === first) return this;
		this.retime();
		// `wait_at != null` means a reply is already held for quiet: a second queue() while still idle must NOT
		// call start_or_hold again — it would move `wait_at` to this later chunk and skip everything held before it.
		if (this.state === "idle" && this.wait_at == null) this.start_or_hold(first);
		else this.prefetch(this.at);
		return this;
	}

	/** Chunk `i` is freshly queued and nothing is playing: start now, or hold until the owner falls quiet. */
	start_or_hold(i){
		clearTimeout(this.wait_timer);
		if (!this.barge?.on || !this.barge.speaking()){ this.wait_at = null; this.play(i, 0); return; }
		this.wait_at = i;
		this.quiet_since_wait = null;
		this.trace("holding: the owner is talking", { sentence: i });
		this.changed();
		this.wait_timer = setTimeout(() => this.check_wait(), 80);
	}

	/** Polls every ~80 ms while `wait_at` is set: starts once the owner has been quiet for `turn_wait_ms`. */
	check_wait(){
		if (this.wait_at == null) return;
		if (this.barge.speaking()){ this.quiet_since_wait = null; this.wait_timer = setTimeout(() => this.check_wait(), 80); return; }
		this.quiet_since_wait ??= performance.now();
		if (performance.now() - this.quiet_since_wait < (this.turn_wait_ms ?? 1500)){ this.wait_timer = setTimeout(() => this.check_wait(), 80); return; }
		const i = this.wait_at;
		this.wait_at = this.quiet_since_wait = null;
		this.play(i, 0);
	}

	/** Play chunk `i` from `offset` seconds into it. */
	async play(i, offset = 0){
		const c = this.chunks[i];
		if (!c) return this.finish();
		const token = ++this.token;
		this.at = i;
		if (this.server === "offline" && !c.src) return this.speak_browser(i, token);
		if (!c.src) this.set("loading");
		try { await this.render(i); }
		catch (e){ if (token === this.token) this.speak_browser(i, token); return; }
		if (token !== this.token || !this.audio) return;   // paused, seeked or stopped while it rendered
		this.engine = "kokoro";
		this.audio.src = c.src;
		this.audio.currentTime = offset;
		try { await this.audio.play(); }
		catch (e){ this.trace("play refused", { error: e.name, msg: String(e.message).slice(0, 120), sentence: i }); if (token === this.token) this.set("paused", e.name === "NotAllowedError" ? "tap play: the browser wants a tap before it plays sound" : e.message); return; }
		this.trace("playing", { sentence: i });
		if (token !== this.token) return;
		this.set("playing", "");
		this.unlocked = true;   // it played: no tap-unlock needed any more
		this.media_session();
		this.prefetch(i);
	}

	/** The audio of chunk `i`, once; the same promise for every caller. */
	render(i){
		const c = this.chunks[i];
		const t0 = performance.now();
		if (!c.pending) this.trace("speak asked", { sentence: i, url: this.url });
		c.pending ??= this.voice.render(c.text, this.url).then(({ blob, seconds }) => {
			this.trace("spoke", { sentence: i, ms: Math.round(performance.now() - t0), seconds, url: this.url });
			c.src = URL.createObjectURL(blob);
			c.seconds = seconds;
			if (this.server !== "online"){ this.server = "online"; this.error = ""; }
			this.retime();
		}, e => {
			c.pending = null;
			this.trace("speak failed", { url: this.url, error: String(e?.message ?? e).slice(0, 160) });
			this.offline(e);
			throw e;
		});
		return c.pending;
	}

	/** Render the next two sentences while this one plays, so there is no gap. */
	prefetch(i){ for (const j of [i + 1, i + 2]) if (this.chunks[j] && this.server !== "offline") this.render(j).catch(() => {}); }

	/** Each chunk's start on the timeline, as far as the durations are known. */
	retime(){
		let t = 0;
		for (const c of this.chunks){
			c.start = t;
			if (c.seconds == null){ for (const later of this.chunks.slice(this.chunks.indexOf(c) + 1)) later.start = null; break; }
			t += c.seconds;
		}
	}

	ended(){ this.settle_pending(this.at); if (this.state === "playing") this.play(this.at + 1, 0); }
	finish(){ this.token++; this.at = Math.max(0, this.chunks.length - 1); this.set("idle"); }

	/* ── replies from a chat session ────────────────────────────────── */

	/** One event from a session's live wire (ext/Session `Session.stream`): the smart seat's reply is read, the owner's line pauses it.
	 *  Wire shapes: dictation-notes.md in the voice-recite task. */
	from_wire(ev){
		if (ev?.kind === "stream" && ev.role === "smart"){
			if (!this.live && ev.text) this.trace("reply streaming", { text: ev.text.slice(0, 40) });
			const out = this.partial(ev.text);
			if (!ev.text) this.flush_updates();   // only once the stream itself ends (`""`, partial()'s own signal) — flushing on every partial queued a held update mid-stream, between two sentences of the very answer it was meant to wait behind (review finding, read-aloud-b 2026-11-02)
			return out;
		}
		if (ev?.kind !== "line") return;
		const line = ev.line ?? {}, chat = line.chat;
		if (chat?.at && Date.now() - Date.parse(chat.at) > 120000) return;   // a replayed old line, not a reply just now
		// The id read aloud is marked played (Recite.mark_played), so a reload a moment later never reads it twice: the
		// `{chat}` shape has no id of its own, so its `at` timestamp (one per line) stands in for one (dictation-v3, 2026-11-01, item 20).
		if (chat?.from?.kind === "assistant"){
			this.trace("reply line", { from: chat.from.id, text: String(chat.text ?? "").slice(0, 40) });
			if (chat.from.id === "smart"){ const out = this.final(chat.text, chat.at); this.flush_updates(); return out; }
			if (!Recite.AGENT_ID.test(chat.from.id ?? "")) return;   // "fast", "revise" (every voice revision), "card": not an agent update, ignored exactly as before this task (review finding, read-aloud-b 2026-11-02 — revise posts on every dictated sentence, the very flood this task was meant to stop)
			return this.agent_update(chat.text, chat.at, chat.from.id);
		}
		const add = Object.values(line).find(v => v?.replies?.add)?.replies.add;
		if (add){
			if (add.by === "smart"){ const out = this.final(add.text, add.id); this.flush_updates(); return out; }
			if (!Recite.AGENT_ID.test(add.by ?? "")) return;
			return this.agent_update(add.text, add.id, add.by);
		}
		if (chat?.text){
			if (this.auto && this.barge.on){ if (this.state === "playing" || this.state === "loading") this.trace("paused by your line", { text: chat.text.slice(0, 40) }); this.barge.owner_spoke(chat.text, chat.via); }   // ear off = manual playback
			if (this.auto) this.expect_reply();
		}
	}

	/** The owner's line just landed on the wire: a direct answer is now expected (`cue_pending` — no-flood's
	 *  `agent_update()` reads this to decide whether to hold an update, whether or not the thinking cue is even
	 *  on). When `thinking_cue` is also on, a short, subtle tone plays now, and once more about `cue_repeat_ms`
	 *  later if the reply still has not arrived — then it stays quiet. A fresh line (another message before the
	 *  first reply showed up) restarts the sequence from here; `partial()`/`final()` cancel it the moment real
	 *  reply text arrives (dictation-v3, 2026-11-02; decoupled from `thinking_cue`, read-aloud-b 2026-11-02 —
	 *  no-flood held nothing with the cue off, since `cue_pending` was only ever set while scheduling the tone). */
	expect_reply(){
		clearTimeout(this.cue_timer);
		this.cue_pending = true;
		if (!this.thinking_cue) return;
		this.play_cue();
		this.cue_timer = setTimeout(() => { if (this.cue_pending) this.play_cue(); }, this.cue_repeat_ms);
	}

	/** The reply arrived, or a fresh line replaced the one being waited on: stop waiting. */
	cancel_cue(){
		clearTimeout(this.cue_timer); this.cue_timer = null;
		this.cue_pending = false;
	}

	/** A short generated tone, never Kokoro speech — cheap, and never competes with recite-server for the reply
	 *  itself. Skipped while a reply is already playing, so it never talks over it. Always traced, so a test (and
	 *  the Whisper log) sees it fire even where AudioContext does not exist (node, or a locked-down browser). */
	play_cue(){
		if (this.state === "playing") return;
		this.trace("thinking cue");
		const Ctx = globalThis.AudioContext ?? globalThis.webkitAudioContext;
		if (typeof Ctx !== "function") return;
		try {
			const ctx = this.cue_ctx ??= new Ctx();
			const osc = ctx.createOscillator(), gain = ctx.createGain();
			osc.frequency.value = 660;
			gain.gain.setValueAtTime(0.0001, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
			osc.connect(gain); gain.connect(ctx.destination);
			osc.start(); osc.stop(ctx.currentTime + 0.2);
		} catch (e){ this.trace("thinking cue failed", { error: String(e?.message ?? e).slice(0, 120) }); }
	}

	/** A reply still being written, the whole text so far: each sentence is read as soon as it ends. "" = the reply ended. */
	partial(text){
		if (!this.auto){ if (text && !this.live) this.trace("not read: auto is off (the 🗣 button)"); return; }
		if (text) this.cancel_cue();   // the reply started: stop waiting for it (dictation-v3 thinking cue, 2026-11-02)
		if (!text){ if (this.live){ this.take(this.live.text, true); this.done.add(Recite.norm(this.live.text)); this.live = null; } return; }
		if (!this.live || !text.startsWith(this.live.text.slice(0, 30))){ this.drop_heard(); this.live = { text, queued: 0, fresh: true }; }
		this.live.text = text;
		this.take(text, false);
	}

	/** A settled reply. Read whole, unless its stream was already read. It QUEUES behind whatever is already being
	 *  read — never replaces it (dictation-v3, 2026-11-01): only a real barge-in with a new question drops the rest.
	 *  `id` (a message id, or a `{chat}` line's own `at`) is marked played only once its last chunk actually
	 *  finishes (`mark_when_done`), so a reload within the 2-minute window above never reads a played reply twice
	 *  AND never skips one that was dropped (by a barge-in question, a session switch, or a reload) before it
	 *  finished (item 20); no `id` means it is only guarded by `this.done` (in-memory, this page load). */
	final(text, id){
		if (!text) return;
		if (!this.auto){ this.trace("not read: auto is off (the 🗣 button)", { text: text.slice(0, 40) }); return; }
		this.cancel_cue();   // the reply started: stop waiting for it (dictation-v3 thinking cue, 2026-11-02)
		if (id && Recite.was_played(id)){ this.trace("not read: already played before a reload", { id }); return; }
		const key = Recite.norm(text);
		if (this.done.has(key)) return;
		this.done.add(key);
		const before = this.chunks.length;
		if (this.live && key.startsWith(Recite.norm(this.live.text.slice(0, this.live.queued)).slice(0, 30))){
			this.live.text = text; this.take(text, true); this.live = null;
			this.mark_when_done(id, before);
			return;
		}
		this.drop_heard();   // a fresh reply, not a continuation of `this.live`: if the old one sits paused by barge-in, a question just got its answer
		this.live = null;
		this.queue(text);
		this.mark_when_done(id, before);
	}

	/** `id`'s text added no chunks that still need to be said (nothing was queued, or everything was already
	 *  covered by `this.live`): mark it played right away. Otherwise remember its last chunk, so `ended()` marks it
	 *  the moment that chunk finishes playing — never sooner, so a reply dropped mid-way is never marked played. */
	mark_when_done(id, before){
		if (!id) return;
		if (this.chunks.length > before) this.pending_ids.push({ id, last: this.chunks.length - 1 });
		else Recite.mark_played(id);
	}

	/** Chunk `i` just finished playing: mark played any reply whose last chunk that was. */
	settle_pending(i){
		this.pending_ids = this.pending_ids.filter(p => { if (p.last !== i) return true; Recite.mark_played(p.id); return false; });
	}

	/** No-flood (dictation-v3, 2026-11-02): a reply from any assistant id OTHER than "smart" — a mastermind or
	 *  another agent reporting into the chat — is never read in full; it collapses into one short spoken line, so
	 *  a long status update never floods the queue ahead of (or instead of) the direct answer the owner is waiting
	 *  for. If the owner's own line is still awaiting that direct answer (`cue_pending`), the update is held in
	 *  `pending_updates` rather than queued — `flush_updates()` releases it (behind the direct answer) once that
	 *  reply lands, or after `update_hold_ms` regardless, so it is never lost if no direct reply ever comes. */
	agent_update(text, id, from_id){
		if (!this.auto){ this.trace("not read: auto is off (the 🗣 button)", { text: String(text ?? "").slice(0, 40) }); return; }
		if (id && Recite.was_played(id)) return;
		const key = Recite.norm(text);
		if (this.done.has(key)) return;
		this.done.add(key);
		const line = `I have an update on ${Recite.agent_label(from_id)}, tap to hear it.`;
		if (this.cue_pending){
			this.pending_updates.push({ text: line, id });
			clearTimeout(this.update_hold_timer);
			this.update_hold_timer = setTimeout(() => this.flush_updates(), this.update_hold_ms);
			this.trace("update held: a direct answer is still pending", { from: from_id });
		} else this.queue_update(line, id);
	}

	/** Queues one collapsed update line, behind whatever is already queued — never replacing it, same as `final()`. */
	queue_update(line, id){
		const before = this.chunks.length;
		this.queue(line);
		this.mark_when_done(id, before);
	}

	/** Releases every held update, in the order they arrived, behind whatever is already queued (the direct answer,
	 *  if one just landed). A no-op when nothing is held. */
	flush_updates(){
		clearTimeout(this.update_hold_timer); this.update_hold_timer = null;
		if (!this.pending_updates.length) return;
		const held = this.pending_updates; this.pending_updates = [];
		for (const u of held) this.queue_update(u.text, u.id);
	}

	/** A new reply starts arriving while an old one sits paused by barge-in (`state === "heard"`): a reply is coming,
	 *  the same signal as the owner's line ending in "?" (BargeIn.heard_speech) — finishing the cut-off reply first
	 *  would talk over the new one, so it is dropped outright, not resumed (dictation-v3, 2026-11-01). Only the heard
	 *  reply's own chunks go: a later reply already queued behind it (never heard yet) keeps its place and still
	 *  plays — calling `stop()` here used to empty the whole queue, losing whatever came after (dictation-v3,
	 *  2026-11-01). `chunks[i].reply` groups every sentence pushed by one `queue()` call (take()'s own calls share
	 *  their live reply's id, so a streamed-so-far reply still drops as one unit). */
	drop_heard(){
		if (this.state !== "heard") return;
		this.barge.cancel_resume();
		this.live = null;   // the dropped reply might still be streaming in; left set, its next partial() would read as a
		                    // continuation and queue only its unsent tail — a half reply the drop was meant to prevent
		this.token++;
		clearTimeout(this.wait_timer);
		this.wait_at = this.quiet_since_wait = null;
		this.audio?.pause();
		globalThis.speechSynthesis?.cancel();
		const id = this.chunks[this.at]?.reply;
		let start = this.at, end = this.at;
		while (this.chunks[start - 1]?.reply === id) start--;
		while (this.chunks[end + 1]?.reply === id) end++;
		const cut = this.chunks.splice(start, end - start + 1);
		for (const c of cut) if (c.src) URL.revokeObjectURL(c.src);
		this.pending_ids = this.pending_ids.filter(p => p.last > end).map(p => ({ id: p.id, last: p.last - cut.length }));
		this.at = start;
		if (this.chunks.length > start) this.start_or_hold(start);
		else this.set("idle");
	}

	/** Queue the finished sentences of the live reply that are not queued yet (all of it when `all`); always behind
	 *  whatever is already playing, never replacing it (dictation-v3, 2026-11-01). */
	take(text, all){
		const live = this.live, rest = text.slice(live.queued);
		const cut = all ? rest.length : Recite.complete(rest);
		if (cut <= 0 || !/\w/.test(rest.slice(0, cut))) return;
		live.queued += cut;
		live.fresh = false;
		this.queue(rest.slice(0, cut), true);   // continuing the same live reply, not a new one
	}

	set_auto(on){ this.auto = !!on; Recite.remember("auto", this.auto); this.changed(); }

	/* ── the playhead ────────────────────────────────────────────────── */

	/** Seconds from the start of everything queued. */
	position(){
		const c = this.chunks[this.at];
		if (!c || c.start == null) return 0;
		return c.start + (this.engine === "browser" ? 0 : this.audio?.currentTime ?? 0);
	}

	/** Seconds known so far (sentences not rendered yet are not counted). */
	duration(){ return this.chunks.reduce((t, c) => t + (c.seconds ?? 0), 0); }

	/** Which chunk holds second `t`, and how far into it. */
	find(t){
		let i = 0;
		while (i < this.chunks.length - 1 && this.chunks[i + 1].start != null && this.chunks[i + 1].start <= t) i++;
		return { i, offset: Math.max(0, t - (this.chunks[i]?.start ?? 0)) };
	}

	pause(why = "paused"){
		if (!["playing", "loading"].includes(this.state)) return;
		this.token++;
		this.audio?.pause();
		if (this.engine === "browser") globalThis.speechSynthesis?.cancel();
		this.set(why === "heard" ? "heard" : "paused");
	}

	/** `from_start`: true for an automatic barge-in resume — the owner talked over part of the sentence, so it is said
	 *  again from its start, not from where the mic cut it off; false (manual: the Play button, a tap) continues where it paused. */
	resume(from_start = false){
		if (!["paused", "heard"].includes(this.state)) return;
		if (from_start) return this.play(this.at, 0);
		const same = this.audio?.src && this.audio.src === this.chunks[this.at]?.src;
		if (this.engine === "browser" || !same) return this.play(this.at, 0);
		const token = ++this.token;
		this.audio.play().then(() => { if (token === this.token) this.set("playing", ""); },
			e => this.set("paused", e.message));
	}

	toggle(){
		if (this.state === "playing" || this.state === "loading") return this.pause();
		if (this.state === "idle") return this.restart();
		this.resume();
	}

	seek(t){
		if (!this.chunks.length) return;
		const { i, offset } = this.find(Math.max(0, t));
		this.play(i, offset);
	}

	back(seconds = 10){ this.seek(this.position() - seconds); }
	restart(){ this.seek(0); }

	stop(){
		this.token++;
		this.cancel_cue();
		clearTimeout(this.wait_timer);
		this.wait_at = this.quiet_since_wait = null;
		clearTimeout(this.update_hold_timer); this.update_hold_timer = null; this.pending_updates = [];
		this.audio?.pause();
		globalThis.speechSynthesis?.cancel();
		for (const c of this.chunks) if (c.src) URL.revokeObjectURL(c.src);
		this.chunks = [];
		this.pending_ids = [];   // dropped before their last chunk played: never marked played (item 20)
		this.at = 0;
		this.set("idle");
	}

	/** Change the persona; sentences not yet played are rendered again in the new voice. */
	pick(name){
		this.voice = Voice.persona(name);
		Recite.remember("voice", this.voice.name);
		for (const c of this.chunks.slice(this.at + 1)){ if (c.src) URL.revokeObjectURL(c.src); Object.assign(c, { src: null, pending: null, seconds: null }); }
		this.retime();
		this.changed();
	}

	/* ── the server, and the fallback when it is down ────────────────── */

	/** One fetch of /health: online or offline. */
	async check(){
		try {
			const r = await fetch(this.url + "/health", { signal: AbortSignal.timeout(2500) });
			const body = await r.json();
			this.server = body.ok ? "online" : "offline";
			if (body.ok){ this.error = ""; this.engine = "kokoro"; }
		} catch (e){ this.server = "offline"; this.error = `recite-server is not answering at ${this.url}: ${e.message}`; }
		this.changed();
		return this.server;
	}

	/** Mark the server offline and try again later: 3 s, then 10 s, then every 30 s. */
	offline(e){
		this.server = "offline";
		this.error = `recite-server: ${e.message} — reading with the browser's voice for now`;
		this.changed();
		if (this.retry) return;
		const wait = [3000, 10000, 30000][Math.min(2, this.retries = (this.retries ?? 0) + 1) - 1];
		this.retry = setTimeout(async () => { this.retry = null; if (await this.check() === "online") this.retries = 0; else this.offline(new Error("still down")); }, wait);
	}

	/** The browser's own voice reads chunk i, then the next. No seeking inside a sentence. */
	speak_browser(i, token){
		const c = this.chunks[i];
		this.engine = "browser";
		c.began = globalThis.performance?.now?.();   // the highlight's clock: the browser's voice has no currentTime
		c.seconds ??= c.text.length / 15;   // an estimate, so back 10 s still steps back a sentence or two
		this.retime();
		this.set("playing");
		this.voice.speak(c.text, () => {
			if (token !== this.token || this.state !== "playing") return;
			this.settle_pending(i);
			this.engine = this.server === "online" ? "kokoro" : "browser";
			this.play(i + 1, 0);
		});
	}

	/** Lock-screen and headphone-button controls (Android shows them while it plays). */
	media_session(){
		const ms = globalThis.navigator?.mediaSession;
		if (!ms || typeof MediaMetadata !== "function") return;
		ms.metadata = new MediaMetadata({ title: this.chunks[0]?.text.slice(0, 60) ?? "Recite", artist: "Recite — " + this.voice.name });
		const set = (action, fn) => { try { ms.setActionHandler(action, fn); } catch {} };
		set("play", () => this.resume());
		set("pause", () => this.pause());
		set("seekbackward", () => this.back(10));
		set("previoustrack", () => this.restart());
		set("stop", () => this.stop());
	}

	/** The one-line control (`Recite.Bar`). */
	get bar(){ return new this.constructor.Bar({ recite: this }); }

	/* ── statics ─────────────────────────────────────────────────────── */

	/** On this machine, recite-server itself; anywhere else (a phone, the tunnel), the page's own /recite proxy. */
	static default_url(){
		const h = globalThis.location?.hostname;
		const local = h === "localhost" || h === "127.0.0.1" || h?.endsWith(".localhost");
		return local || !globalThis.location ? "http://127.0.0.1:8177" : globalThis.location.origin + "/recite";
	}

	/** Reply text as sentences a voice can say: markdown, code and links taken out, each piece 20–300 characters. */
	static split(text){
		const plain = String(text ?? "")
			.replace(/```[\s\S]*?```/g, " (a code block) ")
			.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
			.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
			.replace(/https?:\/\/\S+/g, " a link ")
			.replace(/`([^`]*)`/g, "$1")
			.replace(/^\s*(#{1,6}|[-*+]|\d+\.)\s+/gm, "")
			.replace(/[*~]+/g, "")
			.replace(/(^|\s)_+|_+(?=\s|$)/g, "$1")   // _emphasis_, but never the _ inside snake_case
			.replace(/[|>]+/g, " ");
		const sentences = plain.split(/(?<=[.!?…:;])\s+|\n+/).map(s => s.replace(/\s+/g, " ").trim()).filter(s => /\w/.test(s));
		const out = [];
		for (const s of sentences){
			const last = out[out.length - 1];
			if (last && out.length > 1 && last.length < 20 && last.length + s.length < 300) out[out.length - 1] = last + " " + s;   // the first stays short: it starts sooner
			else if (s.length <= 300) out.push(s);
			else out.push(...(s.match(/.{1,280}(\s|$)|\S+/g) ?? [s]).map(x => x.trim()).filter(Boolean));
		}
		return out;
	}

	/** Where the last finished sentence of `s` ends (0 = none yet): a stop followed by a space, or a line break. */
	static complete(s){ let end = 0; for (const m of String(s).matchAll(/[.!?…:;](?=\s)|\n/g)) end = m.index + 1; return end; }

	/** Text compared loosely: spaces and markdown marks do not count. */
	static norm(s){ return String(s ?? "").replace(/[\s*_`#>]+/g, " ").trim().toLowerCase(); }

	/** A tracked agent role's own id shape (Servex/agents/roles/readme.md) — never "fast", "revise" or "card", the
	 *  other ids that post an assistant chat line but are not agent-update material (`from_wire()` reads this to
	 *  decide; review finding, read-aloud-b 2026-11-02). */
	static AGENT_ID = /^(mastermind|minion|reviewer|clarity)-/;

	/** An agent id as something a voice can say: the role prefix off, dashes and underscores to spaces — "mastermind-
	 *  read-aloud-b" reads as "read aloud b". A rough heuristic, not a lookup of the agent's own title; revisit if it
	 *  reads badly in practice. */
	static agent_label(id){ return String(id ?? "an agent").replace(Recite.AGENT_ID, "").replace(/[-_]+/g, " ").trim() || "an agent"; }

	/** Message ids already read in full, kept across a reload (item 20, dictation-v3 2026-11-01): a reload within the
	 *  2-minute window in `from_wire` must never read a settled reply twice. localStorage, capped to the most recent
	 *  200 so a long-lived tab does not grow this forever. */
	static played_ids(){ try { return JSON.parse(globalThis.localStorage?.getItem("lew42.recite.played") ?? "[]"); } catch { return []; } }
	static was_played(id){ return !!id && Recite.played_ids().includes(id); }
	static mark_played(id){
		if (!id) return;
		try {
			const ids = Recite.played_ids();
			if (ids.includes(id)) return;
			globalThis.localStorage?.setItem("lew42.recite.played", JSON.stringify([...ids, id].slice(-200)));
		} catch {}
	}

	/** One remembered setting (the voice, barge-in on/off, its threshold) in localStorage. */
	static remember(key, value){
		try {
			if (value === undefined) return globalThis.localStorage?.getItem("lew42.recite." + key) ?? null;
			globalThis.localStorage?.setItem("lew42.recite." + key, String(value));
		} catch { return null; }
	}

	/** The one Recite a page's chat views share, so two views never read over each other. */
	static get shared(){ return Recite._shared ??= new Recite(); }
}

Recite.BargeIn = BargeIn;
Recite.Bar = ReciteBar;
Recite.Highlight = ReciteHighlight;
Recite.Tap = ReciteTap;
Recite.SILENCE = "data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";   // 0.1 s of silence, 8 kHz: what unlock_on_tap() plays
track(Recite);

export { Recite };
