import track from "../../core/track/track.js";
import Part, { PartView } from "../Part.js";
import { View, div, span, select, option, button } from "../../core/View/View.js";
import { DEVICE_KEY, remembered_device, remember_device } from "/framework/ux/Dictate/Dictate.js";

View.stylesheet(import.meta, "MicStream.css");

export { DEVICE_KEY };

// Architecture and API: doc/micstream-notes.md
export default class MicStream extends Part {

	sample_rate = 16000;
	device_id = null;
	device_label = "";

	keep = true;
	mode = null;

	constructor(...args){
		super(...args);
		this.level = 0;
		this.active = false;
		this.chunks = [];
		this.chunk_levels = [];
		this.level_listeners = new Set();
		// ⚠ Re-apply options after super(); field init order trap: doc/micstream-notes.md
		this.assign(...args);
		MicStream.track?.(this);
	}

	// ⚠ Device labels empty until permission granted; fall back to "Microphone N"
	async devices(){
		const list = await navigator.mediaDevices.enumerateDevices();
		return list.filter(d => d.kind === "audioinput");
	}

	pick(id, label){
		this.device_id = id;
		this.device_label = label;
		remember_device(id, label);
		this.on_pick?.(id, label);
	}

	async press(){
		if (this.mode !== "hold" || this.active) return;
		try { await this.start(); }
		catch (e){ this.on_error?.(e); }
	}

	release(){
		if (this.mode !== "hold" || !this.active) return;
		this.stop();
	}

	async toggle(){
		if (this.mode !== "toggle") return;
		if (this.active) this.stop();
		else { try { await this.start(); } catch (e){ this.on_error?.(e); } }
	}

	on_level(fn){ this.level_listeners.add(fn); return () => this.level_listeners.delete(fn); }

	device(){
		if (this.device_id) return { id: this.device_id, label: this.device_label };
		return remembered_device() ?? { id: null, label: "" };
	}

	// ⚠ exact deviceId, not bare; browser may silently ignore preference
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

	snapshot(){
		const len = this.chunks.reduce((n, c) => n + c.length, 0);
		const out = new Float32Array(len);
		let at = 0;
		for (const c of this.chunks){ out.set(c, at); at += c.length; }
		return out;
	}

	cut(){ this.chunks = []; this.chunk_levels = []; }

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

	cut_at(sample_count){
		const all = this.snapshot();
		const head = all.slice(0, sample_count);
		const tail = all.slice(sample_count);
		this.chunks = tail.length ? [tail] : [];
		this.chunk_levels = tail.length ? [rms(tail)] : [];
		return head;
	}

	rate(){ return this.ctx?.sampleRate ?? this.sample_rate; }

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

// State view: icon/row/panel sizes with mic status and properties
MicStream.View = class extends PartView {
	glyph(){ return "mic"; }
	// ⚠ label() uses active, not track.label; fake devices give stale labels
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
