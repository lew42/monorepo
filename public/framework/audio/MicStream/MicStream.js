import track from "../../core/track/track.js";
import Part, { PartView } from "../Part.js";
import { View } from "../../core/View/View.js";
import { DEVICE_KEY, remembered_device } from "/framework/ux/Dictate/Dictate.js";

View.stylesheet(import.meta, "MicStream.css");

export { DEVICE_KEY };

/**
 * class MicStream extends Part — opens ONE microphone and hands out three
 * things every other audio/ part wants: the live `MediaStream` (for a
 * `MediaRecorder` or an `<audio>` element), the raw samples (16kHz mono
 * Float32, read off `pcm-worklet.js`), and a live 0..1 level. Nothing here
 * decides what to DO with any of the three — `LevelMeter`, `Recorder` and
 * `Transcriber.Whisper` each subscribe to the one they need.
 *
 *   const mic = new MicStream();
 *   const off = mic.on_level(level => …);   // 0..1, smoothed — call it as often as you like
 *   await mic.start();                       // opens the mic; mic.stream is now a MediaStream
 *   mic.stop();
 *
 * **Which microphone:** `device_id`, else the browser's default. `MicPicker`
 * writes the owner's pick to the SAME place `ux/Dictate` reads and writes
 * (`DEVICE_KEY`, `remembered_device()` — both imported from `Dictate.js`, not
 * redeclared here), so choosing a mic once moves every `MicStream` on the
 * site, dictation included.
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
	 *  A `LevelMeter`-only caller can set this false to skip the copying. */
	keep = true;

	constructor(...args){
		super(...args);
		this.level = 0;
		this.chunks = [];
		this.chunk_levels = [];   // one rms per entry in `chunks`, same indices — quietest_split()'s raw material
		this.level_listeners = new Set();
		MicStream.track?.(this);
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
		this.on_start?.(this.stream);
		return this.stream;
	}

	stop(){
		this.ctx?.close();
		this.stream?.getTracks().forEach(t => t.stop());
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
	label(){ return this.subject.label() || "no microphone open"; }
	stat(){ return "level " + (this.subject.level ?? 0).toFixed(2); }
	flags(){
		const level = this.subject.level ?? 0;
		return [["connected", !!this.subject.stream], ["clipping", level > 0.9]];
	}

	render(){
		super.render();
		this.unsub = this.subject.on_level(() => this.refresh());
	}
};

export { MicStream };
