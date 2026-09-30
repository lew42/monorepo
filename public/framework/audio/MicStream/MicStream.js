import track from "../../core/track/track.js";
import Part, { PartView } from "../Part.js";
import { View, div, span, select, option, button } from "../../core/View/View.js";
import { DEVICE_KEY, remembered_device, remember_device } from "/framework/ux/Dictate/Dictate.js";

View.stylesheet(import.meta, "MicStream.css");

export { DEVICE_KEY };

/**
 * class MicStream extends Part — opens ONE microphone and hands out
 * everything every other audio/ part wants: the live `MediaStream` (for a
 * `MediaRecorder` or an `<audio>` element), the raw samples (16kHz mono
 * Float32, read off `pcm-worklet.js`), and a live 0..1 level. It also OWNS
 * the three things that used to be separate classes (2026-09-30, the owner:
 * "which of these could be merged?") — device choice, the level, and
 * hold/toggle-to-talk — because all three are really just "a setting on, or
 * a way of starting/stopping, one microphone", not things worth their own
 * class. `Recorder` and `Transcriber.Whisper` still subscribe to the level
 * and the stream, same as always.
 *
 *   const mic = new MicStream();
 *   const off = mic.on_level(level => …);   // 0..1, smoothed — call it as often as you like
 *   await mic.start();                       // opens the mic; mic.stream is now a MediaStream
 *   mic.stop();
 *
 * **Which microphone:** `device_id`, else the browser's default.
 * `mic.devices()` lists every `audioinput`; `mic.pick(id, label)` chooses one
 * and remembers it to the SAME place `ux/Dictate` reads and writes
 * (`DEVICE_KEY`, `remembered_device()`/`remember_device()` — imported from
 * `Dictate.js`, not redeclared here), so choosing a mic once moves every
 * `MicStream` on the site, dictation included.
 *
 * **Hold or toggle:** set `mode: "hold"` and call `press()`/`release()` (a
 * button or key held down), or `mode: "toggle"` and call `toggle()` (a
 * button that starts it, then stops it on the next click). Leave `mode`
 * unset and just call `start()`/`stop()` yourself for anything else (a plain
 * "Start" button, an assembly that opens the mic on its own timer). `mic.active`
 * is true exactly while the mic is open, whichever way it got there.
 *
 * **The buffer** (`chunks`/`snapshot()`/`cut()`) is extracted straight from
 * `ux/Dictate/capture.js`, which this file does not import (it is read-only
 * for this task) but copies, because the shape is exactly what `worth_sending()`
 * / whisper needs: every sample since `start()` or the last `cut()`, and the
 * "how many ms of this are actually loud" measure that tells a segment from
 * silence (`loudness()`).
 */
export default class MicStream extends Part {

	sample_rate = 16000;
	device_id = null;
	device_label = "";

	/** Whether samples are being KEPT in the buffer `snapshot()`/`cut()` read.
	 *  A level-only caller can set this false to skip the copying. */
	keep = true;

	/** `null` | `"hold"` | `"toggle"` — see the class doc above. Only changes
	 *  what `press()`/`release()`/`toggle()` do; `start()`/`stop()` always
	 *  work regardless of mode. */
	mode = null;

	constructor(...args){
		super(...args);
		this.level = 0;
		this.active = false;
		this.chunks = [];
		this.chunk_levels = [];   // one rms per entry in `chunks`, same indices — quietest_split()'s raw material
		this.level_listeners = new Set();
		// ⚠ Re-apply the constructor options HERE, not just via `super()`: a
		// subclass field declaration (`device_id = null`, `mode = null`, …)
		// initializes AFTER `super()` returns (real JS class-field order, not
		// a framework quirk), so `Part`'s own `this.assign(...args)` — called
		// from inside `super()` — runs too EARLY and gets silently overwritten
		// by MicStream's own field defaults the moment `super()` returns.
		// `new MicStream({ mode: "toggle" })` was landing with `mode: null`
		// until this line was added (found while proving this task's own
		// demo, 2026-09-30). Every `Part` subclass with a field of the same
		// name as an option it accepts has this same trap — flagged for the
		// `code` skill, not fixed there (out of this task's fence).
		this.assign(...args);
		MicStream.track?.(this);
	}

	/** Every `audioinput` device the browser can see — the list a picker UI
	 *  shows. Labels read as empty strings until mic permission has been
	 *  granted somewhere on this page (a browser rule, not a bug here); a
	 *  caller showing the list before then should fall back to "Microphone 1",
	 *  "Microphone 2", … (see `MicStream.Controls` below). */
	async devices(){
		const list = await navigator.mediaDevices.enumerateDevices();
		return list.filter(d => d.kind === "audioinput");
	}

	/** Choose which microphone THIS (and every other `MicStream`, and
	 *  `ux/Dictate`) opens next, and remember it across a reload. Takes effect
	 *  on the next `start()` — call `stop()` then `start()` again to switch
	 *  mid-stream. */
	pick(id, label){
		this.device_id = id;
		this.device_label = label;
		remember_device(id, label);
		this.on_pick?.(id, label);
	}

	/** `mode: "hold"` only — open the mic; safe to call again while already
	 *  open (no-op). A key or pointer held down calls this on press. */
	async press(){
		if (this.mode !== "hold" || this.active) return;
		try { await this.start(); }
		catch (e){ this.on_error?.(e); }
	}

	/** `mode: "hold"` only — close the mic. Pair of `press()`. */
	release(){
		if (this.mode !== "hold" || !this.active) return;
		this.stop();
	}

	/** `mode: "toggle"` only — one click starts it, the next click stops it. */
	async toggle(){
		if (this.mode !== "toggle") return;
		if (this.active) this.stop();
		else { try { await this.start(); } catch (e){ this.on_error?.(e); } }
	}

	/** Subscribe to the live level (0..1, already smoothed). Returns an
	 *  unsubscribe function — the same shape `Filter.changed()`'s callers get,
	 *  just for a stream of values instead of one. */
	on_level(fn){ this.level_listeners.add(fn); return () => this.level_listeners.delete(fn); }

	/** The microphone this instance should open: the one it was given, else
	 *  the owner's remembered pick, else the system default — identical rule
	 *  to `Dictate.device()`. */
	device(){
		if (this.device_id) return { id: this.device_id, label: this.device_label };
		return remembered_device() ?? { id: null, label: "" };
	}

	/** ⚠ `exact:`, not a bare `deviceId` — see `capture.js`: a plain `deviceId`
	 *  is a preference the browser may silently ignore. */
	constraint(){ return this.device_id ? { deviceId: { exact: this.device_id } } : true; }

	async start(){
		const { id, label } = this.device();
		this.device_id = id; this.device_label = label;

		this.stream = await navigator.mediaDevices.getUserMedia({ audio: this.constraint() });
		this.ctx = new AudioContext({ sampleRate: this.sample_rate });
		await this.ctx.audioWorklet.addModule(new URL("./pcm-worklet.js", import.meta.url));

		this.node = new AudioWorkletNode(this.ctx, "lew42-pcm");
		this.chunks = [];
		this.chunk_levels = [];
		this.node.port.onmessage = e => {
			const chunk_rms = rms(e.data);
			if (this.keep){ this.chunks.push(e.data); this.chunk_levels.push(chunk_rms); }
			this.level = this.level * 0.6 + chunk_rms * 0.4;
			const shown = Math.min(1, this.level * 6);
			this.level_listeners.forEach(fn => fn(shown, e.data));
		};

		this.ctx.createMediaStreamSource(this.stream).connect(this.node);
		this.active = true;
		this.on_change?.();
		this.on_start?.(this.stream);
		return this.stream;
	}

	stop(){
		this.ctx?.close();
		this.stream?.getTracks().forEach(t => t.stop());
		this.active = false;
		this.on_change?.();
		this.on_stop?.();
	}

	/** Every sample captured since `start()` or the last `cut()` — a COPY, so
	 *  a partial resend never removes audio the final send still needs. */
	snapshot(){
		const len = this.chunks.reduce((n, c) => n + c.length, 0);
		const out = new Float32Array(len);
		let at = 0;
		for (const c of this.chunks){ out.set(c, at); at += c.length; }
		return out;
	}

	/** One segment is done — the mic keeps running, the NEXT segment starts
	 *  counting from zero. */
	cut(){ this.chunks = []; this.chunk_levels = []; }

	/** Where a FORCED cut (a segment hitting its length cap mid-word, never a
	 *  real pause) should actually split, so the cut lands in the quietest
	 *  instant nearby instead of mid-syllable — `Transcriber.Whisper`'s own
	 *  ask (`doc/decisions.md`'s "Seams" note). Searches only the last
	 *  `window_ms` of buffered chunks (never the whole segment — a quiet
	 *  moment from ten seconds ago is not "nearby") and returns the SAMPLE
	 *  INDEX of the quietest chunk boundary, or `null` when there is not
	 *  enough buffered to search (a segment shorter than the window). */
	quietest_split(window_ms = 1000){
		const chunk_ms = this.chunks[0] ? (this.chunks[0].length / this.rate()) * 1000 : 8;
		const window_chunks = Math.max(1, Math.round(window_ms / chunk_ms));
		if (this.chunk_levels.length <= window_chunks) return null;

		const from = this.chunk_levels.length - window_chunks;
		let best_i = from, best_level = this.chunk_levels[from];
		for (let i = from + 1; i < this.chunk_levels.length; i++){
			if (this.chunk_levels[i] < best_level){ best_level = this.chunk_levels[i]; best_i = i; }
		}
		let sample_at = 0;
		for (let i = 0; i <= best_i; i++) sample_at += this.chunks[i].length;
		return { sample_at, level: best_level };
	}

	/** Splits the buffer at `sample_count`: everything before it is returned
	 *  (what a caller sends as the closing segment), everything from it on
	 *  stays buffered as the START of the next one — unlike `cut()`, no audio
	 *  is thrown away, which is the whole point of cutting at a quiet instant
	 *  instead of a forced deadline. */
	cut_at(sample_count){
		const all = this.snapshot();
		const head = all.slice(0, sample_count);
		const tail = all.slice(sample_count);
		this.chunks = tail.length ? [tail] : [];
		this.chunk_levels = tail.length ? [rms(tail)] : [];
		return head;
	}

	/** The rate the browser actually gave us — see `capture.js`'s own note: a
	 *  browser is allowed to refuse the requested rate. */
	rate(){ return this.ctx?.sampleRate ?? this.sample_rate; }

	/** How loud a stretch of samples is, and — the number a silence rule
	 *  actually needs — how many MILLISECONDS of it are loud, in 20ms frames
	 *  above `floor`. Whole-segment RMS cannot separate "one loud click in a
	 *  silent room" from real speech; this can (`ux/Dictate/capture.js`,
	 *  measured 2026-09-22). */
	loudness(samples, floor = 0.02){
		const frame = Math.round(this.rate() * 0.02);
		let peak = 0, sum = 0, loud_ms = 0;
		for (let i = 0; i < samples.length; i += frame){
			let frame_sum = 0, n = 0;
			for (let j = i; j < i + frame && j < samples.length; j++){
				const s = samples[j];
				if (Math.abs(s) > peak) peak = Math.abs(s);
				frame_sum += s * s; n++;
			}
			sum += frame_sum;
			if (n === frame && Math.sqrt(frame_sum / n) > floor) loud_ms += 20;
		}
		return {
			peak, loud_ms,
			rms: Math.sqrt(sum / Math.max(1, samples.length)),
			seconds: samples.length / this.rate(),
		};
	}

	/** `samples` (Float32, -1..1) as a 16-bit PCM mono WAV `Blob` — the exact
	 *  shape whisper-server's `/inference` accepts. */
	wav(samples){
		const rate = this.rate();
		const buf = new ArrayBuffer(44 + samples.length * 2);
		const v = new DataView(buf);
		const str = (at, s) => { for (let i = 0; i < s.length; i++) v.setUint8(at + i, s.charCodeAt(i)); };

		str(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true); str(8, "WAVE");
		str(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
		v.setUint16(22, 1, true);
		v.setUint32(24, rate, true);
		v.setUint32(28, rate * 2, true);
		v.setUint16(32, 2, true); v.setUint16(34, 16, true);
		str(36, "data"); v.setUint32(40, samples.length * 2, true);

		let at = 44;
		for (const s of samples){
			const clamped = Math.max(-1, Math.min(1, s));
			v.setInt16(at, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
			at += 2;
		}
		return new Blob([buf], { type: "audio/wav" });
	}

	label(){ return this.stream?.getAudioTracks()[0]?.label ?? ""; }
	settings(){ return this.stream?.getAudioTracks()[0]?.getSettings() ?? {}; }
}

function rms(chunk){
	let sum = 0;
	for (const s of chunk) sum += s * s;
	return Math.sqrt(sum / chunk.length);
}

track(MicStream);

/**
 * The three-size state view every audio/ class carries (2026-09-29, the
 * owner via task-mastermind-audio): icon (a mic glyph + connected/clipping
 * flags), row (+ the device label and the live level), panel (+ every own
 * property — sample rate, the settings the browser actually gave us, how
 * many chunks are buffered — from `PartView`'s generic fallback).
 */
MicStream.View = class extends PartView {
	glyph(){ return "mic"; }
	// ⚠ `this.subject.label()` reads the live track's OWN label
	// (`stream.getAudioTracks()[0].label`), which a fake/test device can hand
	// back empty even while genuinely open and listening — so "no microphone
	// open" was showing at `level 0.09`, mid-talk, with the mic very much
	// open (found from `demo-live-1920.png`, 2026-09-30). `active` is the
	// actual open/closed fact; fall back to the picked device's remembered
	// label, then a plain "microphone open" before ever saying "no microphone
	// open" — that phrase is reserved for when `active` is really false.
	label(){ return this.subject.label() || (this.subject.active ? (this.subject.device_label || "microphone open") : "no microphone open"); }
	stat(){ return "level " + (this.subject.level ?? 0).toFixed(2); }
	flags(){
		const level = this.subject.level ?? 0;
		return [["connected", !!this.subject.active], ["clipping", level > 0.9]];
	}

	render(){
		super.render();
		this.unsub = this.subject.on_level(() => this.refresh());
	}
};

/**
 * `MicStream.Controls` — the interactive picker + level bar + hold/toggle
 * button, all pointed at one `MicStream`. This is the one place the three
 * old classes' UI lives now: `MicPicker`'s `<select>`, `LevelMeter`'s bar,
 * `PushToTalk`'s button — each still just a few lines, but drawing straight
 * off the `MicStream` they used to watch from outside, so there is exactly
 * one implementation of "open a mic" (the owner's ask 2, 2026-09-30).
 *
 *   const mic = new MicStream({ mode: "hold" });
 *   new MicStream.Controls({ subject: mic });
 *
 * Every piece can be turned off for a page that only wants some of it:
 * `show_picker: false` hides the device `<select>`, `show_level: false`
 * hides the bar, and `mode` on the `MicStream` itself decides whether a
 * hold-button, a toggle-button, or no button at all is drawn (`mode: null`
 * draws nothing — the caller is wiring its own Start/Stop, as `MicStream`'s
 * own page and `mic-to-text` both still do).
 */
MicStream.Controls = class extends View {

	// ⚠ No `show_picker = true;` field here on purpose: `View`'s own
	// constructor (`View.js`) calls `render()` from INSIDE `super()`, before
	// a subclass's own field initializers have run (real JS order — a
	// derived class's fields initialize the instant `super()` RETURNS, and
	// `render()` runs earlier than that, as part of `super()` itself). A
	// `show_picker = true` field would read as `undefined` here every time,
	// never `true` — so "on by default" is written as "not explicitly turned
	// off" instead. An explicit `{ show_picker: false }` constructor option
	// IS visible by the time `render()` runs (`this.assign(options)` is the
	// first line of `View`'s constructor, before `render()`), so this still
	// does exactly what the doc comment above promises.
	render(){
		this.ac("audio-micstream-controls flex v gap-50");
		if (this.show_picker !== false) this.picker();
		if (this.show_level !== false) this.level();
		if (this.show_mode_switch) this.mode_switch();
		this.$button_row = div.c("audio-micstream-buttonrow");
		this.build_button_row();
		// Chain, never replace — a `MicStream.View` (the state view) drawn
		// alongside this may already be wired to the same `on_change`.
		const prior = this.subject.on_change;
		this.subject.on_change = () => { prior?.(); this.draw(); };
		this.draw();
	}

	picker(){
		this.$select = select.c("audio-micstream-select").on("change", e => {
			const opt = e.target.selectedOptions[0];
			this.subject.pick(e.target.value, opt?.dataset.label ?? "");
		});
		this.fill_devices();
	}

	async fill_devices(){
		const list = await this.subject.devices();
		const remembered = remembered_device();
		this.$select.empty(() => {
			if (!list.length){ option("no microphone found").attr("value", ""); return; }
			list.forEach((d, i) => option(d.label || `Microphone ${i + 1}`)
				.attr("value", d.deviceId).attr("data-label", d.label || ""));
		});
		if (remembered?.id) this.$select.el.value = remembered.id;
		else if (list[0]) this.subject.pick(list[0].deviceId, list[0].label || "");
	}

	level(){
		this.$bar = div.c("audio-levelmeter audio-micstream-level", () => { this.$fill = div.c("audio-levelmeter-bar"); });
		this.subject.on_level((shown) => this.$fill.style("--level", shown.toFixed(3)));
	}

	/** A small two-pill switch, "Hold" / "Toggle", that changes
	 *  `this.subject.mode` and rebuilds the button below to match — only
	 *  shown when a caller asks for it (`show_mode_switch: true`), since most
	 *  pages know which mode they want and never let the visitor change it.
	 *  Disabled while the mic is open: switching mode mid-talk has no sane
	 *  behavior (a held button that was never pressed, a toggle that was
	 *  never clicked), so `draw()` below also greys these two out then. */
	mode_switch(){
		div.c("flex gap-25 v-center audio-micstream-modeswitch", () => {
			span.c("muted", "talk:");
			this.$hold_pill = button.c("audio-micstream-modepill", "Hold").click(() => this.set_mode("hold"));
			this.$toggle_pill = button.c("audio-micstream-modepill", "Toggle").click(() => this.set_mode("toggle"));
		});
	}

	/** Switches mode and rebuilds the button row to match — a no-op while the
	 *  mic is open (see `mode_switch()`'s doc comment for why). */
	set_mode(mode){
		if (this.subject.active || this.subject.mode === mode) return;
		this.subject.mode = mode;
		this.build_button_row();
		this.draw();
	}

	/** (Re)draws the Hold-to-talk / Start-Stop button into `this.$button_row`,
	 *  so `set_mode()` above can swap it without rebuilding the picker or the
	 *  level bar beside it. */
	build_button_row(){
		this.$button_row.empty(() => {
			if (this.subject.mode === "hold"){
				this.$btn = button.c("audio-micstream-btn", "Hold to talk")
					.on("pointerdown", e => { e.preventDefault(); this.subject.press(); })
					.on("pointerup", () => this.subject.release())
					.on("pointerleave", () => this.subject.release());
			} else if (this.subject.mode === "toggle"){
				this.$btn = button.c("audio-micstream-btn", "Start").click(() => this.subject.toggle());
			} else {
				this.$btn = null;
			}
		});
	}

	draw(){
		const on = this.subject.active;
		if (this.$hold_pill){
			this.$hold_pill.rc("on").ac(this.subject.mode === "hold" ? "on" : "");
			this.$toggle_pill.rc("on").ac(this.subject.mode === "toggle" ? "on" : "");
			this.$hold_pill.el.disabled = on;
			this.$toggle_pill.el.disabled = on;
		}
		if (!this.$btn) return;
		this.$btn.rc("on").ac(on ? "on" : "");
		if (this.subject.mode === "hold") this.$btn.text(on ? "● Talking…" : "Hold to talk");
		else this.$btn.text(on ? "■ Stop" : "● Start");
	}
};

export { MicStream };
