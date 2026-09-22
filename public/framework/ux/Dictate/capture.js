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

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	async start(on_level){
		this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		this.ctx = new AudioContext({ sampleRate: this.sample_rate });
		await this.ctx.audioWorklet.addModule(new URL("./pcm-worklet.js", import.meta.url));

		this.node = new AudioWorkletNode(this.ctx, "dictate-pcm");
		this.chunks = [];
		this.node.port.onmessage = e => {
			this.chunks.push(e.data);
			on_level(rms(e.data));
		};

		this.ctx.createMediaStreamSource(this.stream).connect(this.node);
	}

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

	stop(){
		this.ctx?.close();
		this.stream?.getTracks().forEach(t => t.stop());
	}

	/** `samples` (Float32, -1..1) as a 16-bit PCM mono WAV `Blob` — the exact
	 *  shape whisper-server's `/inference` accepts. */
	wav(samples){
		const buf = new ArrayBuffer(44 + samples.length * 2);
		const view = new DataView(buf);
		const str = (at, s) => { for (let i = 0; i < s.length; i++) view.setUint8(at + i, s.charCodeAt(i)); };

		str(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); str(8, "WAVE");
		str(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);   // PCM
		view.setUint16(22, 1, true);                                                  // mono
		view.setUint32(24, this.sample_rate, true);
		view.setUint32(28, this.sample_rate * 2, true);                               // byte rate
		view.setUint16(32, 2, true); view.setUint16(34, 16, true);                    // block align, bits/sample
		str(36, "data"); view.setUint32(40, samples.length * 2, true);

		let at = 44;
		for (const s of samples){
			const clamped = Math.max(-1, Math.min(1, s));
			view.setInt16(at, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
			at += 2;
		}

		return new Blob([buf], { type: "audio/wav" });
	}
}

/** How loud one chunk is, 0 (silence) to ~1 (clipping) — the level meter's
 *  number and the pause-cut's own silence check both read this. */
function rms(chunk){
	let sum = 0;
	for (const s of chunk) sum += s * s;
	return Math.sqrt(sum / chunk.length);
}
