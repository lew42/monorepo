/**
 * The microphone, turned into 16kHz mono WAV bytes — the one format
 * whisper-server can read without ffmpeg (which this machine does not have).
 *
 *     const cap = new Capture();
 *     await cap.start(level => …);   // level: 0..1, the real loudness right now
 *     cap.snapshot();                 // every sample since start() or the last cut()
 *     cap.cut();                      // segment done — keep listening, start counting fresh
 *     cap.wav(cap.snapshot());        // a Blob, ready to POST
 *     cap.stop();                     // release the microphone
 *
 * ⚠ The `AudioContext` is opened AT 16000Hz on purpose. A real microphone runs at
 * 44.1kHz or 48kHz, but the Web Audio spec resamples every source to match the
 * context it is connected into — so asking for 16000Hz up front means the
 * browser does the resampling, and this file never writes its own. That is the
 * whole reason this can be "about forty lines, no library" (requirements.md).
 */
export default class Capture {

	sample_rate = 16000;

	/** Which microphone to open — a `deviceId` from
	 *  `navigator.mediaDevices.enumerateDevices()`. Left null, the browser opens
	 *  whatever the system calls the default. */
	device_id = null;

	/** That microphone's NAME, when the caller knows it. A `deviceId` is salted
	 *  per origin and does not survive clearing site data, so the name is how the
	 *  owner's pick is found again after the id stops meaning anything. */
	device_label = "";

	/** Whether samples are being KEPT. Set it false to run the level meter on a
	 *  live microphone while recording nothing — which is how the test bench lets
	 *  the owner see which device moves the bars before committing to a take. */
	keep = true;

	chunks = [];   // empty from the start: the mic's heartbeat may ask for a snapshot while the audio module still loads

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	async start(on_level){
		this.fell_back = this.recovered = false;
		try {
			this.stream = await navigator.mediaDevices.getUserMedia({ audio: this.constraint() });
		} catch (e){
			if (!this.device_id || e?.name !== "OverconstrainedError") throw e;
			// That id means nothing any more. Look for the SAME microphone by name
			// before giving up on the owner's pick — and if even the name is gone
			// (truly unplugged), open the default rather than failing the whole
			// dictation. Two flags, each saying one thing, so a picker can tell the
			// owner which of the two happened instead of guessing.
			this.device_id = await this.by_label();
			this.recovered = !!this.device_id;
			this.fell_back = !this.device_id;
			this.stream = await navigator.mediaDevices.getUserMedia({ audio: this.constraint() });
		}

		this.ctx = new AudioContext({ sampleRate: this.sample_rate });
		try { await this.load_worklet(); }
		catch (e){   // never hold the mic after a failed start
			this.stop();
			throw Object.assign(new Error(`the mic’s audio module (pcm-worklet.js) did not load after 3 tries: ${e?.message ?? e}`), { name: "WorkletError" });
		}

		this.node = new AudioWorkletNode(this.ctx, "dictate-pcm");
		this.chunks = [];
		this.node.port.onmessage = e => {
			if (this.keep) this.chunks.push(e.data);
			on_level(rms(e.data), peak(e.data));
		};

		this.ctx.createMediaStreamSource(this.stream).connect(this.node);
	}

	/** The audio module, three tries: on a fresh page it sometimes fails once ("Unable to load a worklet’s module",
	 *  ux/Dictate/test/refresh.mjs) and loads on the next try. */
	async load_worklet(){
		const url = new URL("./pcm-worklet.js", import.meta.url);
		for (let i = 0; ; i++){
			try { return await this.ctx.audioWorklet.addModule(url); }
			catch (e){ if (i >= 2) throw e; await new Promise(res => setTimeout(res, 300 * (i + 1))); }
		}
	}

	/** ⚠ `exact:`, not a bare `deviceId`. A plain `deviceId` is a *preference* the
	 *  browser may silently ignore, and a picker that quietly opens a different
	 *  microphone than the one named in it is worse than no picker at all. */
	constraint(){ return this.device_id ? { deviceId: { exact: this.device_id } } : true; }

	/** Today's id for the microphone named `device_label`, or null when nothing
	 *  on this machine answers to that name any more. */
	async by_label(){
		if (!this.device_label) return null;
		const list = await navigator.mediaDevices.enumerateDevices();
		return list.find(d => d.kind === "audioinput" && d.label === this.device_label)?.deviceId ?? null;
	}

	/** What the browser says about the microphone it actually opened — its own
	 *  rate, channel count, echo cancellation. `{}` until `start()` has run. */
	settings(){ return this.stream?.getAudioTracks()[0]?.getSettings() ?? {}; }

	/** The opened microphone's human name, once permission has been granted. */
	label(){ return this.stream?.getAudioTracks()[0]?.label ?? ""; }

	/** Every sample captured since `start()` or the last `cut()` — a COPY, so a
	 *  partial re-send never removes audio the final send of the segment still
	 *  needs. */
	snapshot(){
		const len = this.chunks.reduce((n, c) => n + c.length, 0);
		const out = new Float32Array(len);
		let at = 0;
		for (const c of this.chunks){ out.set(c, at); at += c.length; }
		return out;
	}

	/** One segment is done. The microphone keeps running; the NEXT segment's
	 *  count starts from zero. */
	cut(){ this.chunks = []; }

	/** The rate the browser ACTUALLY gave us. Chrome on this machine honours the
	 *  16000 asked for above — measured 2026-09-22 against a 48000Hz device — but
	 *  a browser is allowed to refuse, and a WAV whose header says 16000 over
	 *  48000Hz samples plays back three times too slow and transcribes as noise.
	 *  Reading it back costs nothing and closes that hole for good. */
	rate(){ return this.ctx?.sampleRate ?? this.sample_rate; }

	/** How loud a stretch of samples is, and — the number that matters — how many
	 *  MILLISECONDS of it are actually loud, counted in 20ms frames above `floor`.
	 *
	 *  Whole-segment RMS cannot do this job. A quiet room with one click in it
	 *  measured 0.043 RMS (2026-09-22, `ai/sessions/2026/09/22/dd3a11e7-7d24-4ef5-ae83-dea94fa63f0a/dictate-silence/`), higher
	 *  than plenty of real speech, because a single pop carries the whole file's
	 *  energy. Frame counting separated the two cases with no overlap at all:
	 *  every silent segment scored 0ms, the weakest real sentence scored 220ms. */
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

	/** Safe to call twice: the page-hidden release (Dictate.js, `release_on_hide`)
	 *  can run while a normal stop is still finishing, and a second `close()` on a
	 *  closed AudioContext rejects. */
	stop(){
		if (this.ctx && this.ctx.state !== "closed") this.ctx.close().catch(() => {});
		this.stream?.getTracks().forEach(t => t.stop());
	}

	/** `samples` (Float32, -1..1) as a mono WAV `Blob` whisper-server's `/inference` reads.
	 *  8-bit mu-law by default: half the bytes of 16-bit PCM and the same text (measured 2026-11-01,
	 *  doc/upload.md). Every guess re-sends the whole growing segment, so on a phone's slow uplink
	 *  the upload IS the delay. `Capture.prototype.encoding = "pcm16"` switches back. */
	wav(samples){
		const rate = this.rate(), mulaw = this.encoding === "mulaw", width = mulaw ? 1 : 2;
		const buf = new ArrayBuffer(44 + samples.length * width);
		const view = new DataView(buf);
		const str = (at, s) => { for (let i = 0; i < s.length; i++) view.setUint8(at + i, s.charCodeAt(i)); };

		str(0, "RIFF"); view.setUint32(4, 36 + samples.length * width, true); str(8, "WAVE");
		str(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, mulaw ? 7 : 1, true);   // 7 = mu-law, 1 = PCM
		view.setUint16(22, 1, true);                                                  // mono
		view.setUint32(24, rate, true);
		view.setUint32(28, rate * width, true);                                       // byte rate
		view.setUint16(32, width, true); view.setUint16(34, width * 8, true);         // block align, bits/sample
		str(36, "data"); view.setUint32(40, samples.length * width, true);

		let at = 44;
		for (const s of samples){
			const clamped = Math.max(-1, Math.min(1, s));
			const int = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
			if (mulaw) view.setUint8(at++, mulaw_byte(int));
			else { view.setInt16(at, int, true); at += 2; }
		}

		return new Blob([buf], { type: "audio/wav" });
	}
}

Capture.prototype.encoding = "mulaw";   // "mulaw" (8 bits a sample) or "pcm16"; 4-bit IMA ADPCM was tried and garbled quiet speech

/** One 16-bit sample as a G.711 mu-law byte (the telephone standard; whisper.cpp's WAV reader decodes it). */
function mulaw_byte(x){
	x = Math.round(x);
	const sign = x < 0 ? 0x80 : 0;
	if (sign) x = -x;
	x = Math.min(x, 32635) + 0x84;
	let exp = 7;
	for (let mask = 0x4000; (x & mask) === 0 && exp > 0; mask >>= 1) exp--;
	return ~(sign | (exp << 4) | ((x >> (exp + 3)) & 0x0f)) & 0xff;
}

/** How loud one chunk is, 0 (silence) to ~1 (clipping) — the level meter's
 *  number and the pause-cut's own silence check both read this. */
function rms(chunk){
	let sum = 0;
	for (const s of chunk) sum += s * s;
	return Math.sqrt(sum / chunk.length);
}

/** The single loudest sample in one chunk. RMS is the honest measure of "how
 *  loud", but it is slow to move and tiny for speech (~0.15); peak is what makes
 *  a level meter feel alive, and it is the one that shows a microphone is
 *  connected at all. The bench shows both, side by side. */
function peak(chunk){
	let top = 0;
	for (const s of chunk){ const a = s < 0 ? -s : s; if (a > top) top = a; }
	return top;
}
