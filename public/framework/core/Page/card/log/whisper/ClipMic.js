import MicStream from "../../../../../audio/MicStream/MicStream.js";

/**
 * ClipMic extends MicStream — plays a saved WAV file through the exact same
 * pipeline a real microphone uses (the worklet, the chunk buffer, the level
 * events), so `Transcriber.Whisper` — and this page's own reads of
 * `snapshot() / cut() / cut_at() / loudness() / wav() / rate()` — cannot
 * tell it apart from `new MicStream()`. No mic needed to prove the debug
 * view works.
 *
 *   const mic = new ClipMic({ url: "/framework/ai/recordings/jfk.wav" });
 *   await mic.start();   // plays the clip, in real time, into the buffer
 *
 * HOW: `MicStream.start()` is never copied — `audio/**` is read-only for
 * this task, and duplicating its worklet-wiring would drift the moment that
 * file changes. Instead this decodes the clip into an `AudioBuffer`, plays
 * it into a `MediaStreamDestinationNode` (a real `MediaStream`, just made
 * from a file instead of a microphone), and hands THAT to the real
 * `MicStream.start()` by standing in for `navigator.mediaDevices.
 * getUserMedia` for the one call it makes — every other line of
 * `MicStream.start()` runs completely unmodified, including the part that
 * matters most: the worklet never learns its input wasn't a real mic.
 */
export default class ClipMic extends MicStream {

	url = "/framework/ai/recordings/jfk.wav";

	async start(){
		const decode_ctx = new AudioContext();
		const raw = await fetch(this.url).then(r => {
			if (!r.ok) throw new Error(`ClipMic: ${this.url} — ${r.status}`);
			return r.arrayBuffer();
		});
		const buffer = await decode_ctx.decodeAudioData(raw);
		const dest = decode_ctx.createMediaStreamDestination();

		this.clip_ctx = decode_ctx;
		this.clip_source = decode_ctx.createBufferSource();
		this.clip_source.buffer = buffer;
		this.clip_source.connect(dest);
		this.clip_source.connect(decode_ctx.destination);   // audible too, not required
		this.clip_source.onended = () => this.on_ended?.();

		// The worklet pipeline has to exist BEFORE the clip starts playing, or
		// its first fraction of a second plays into a graph that isn't wired
		// up yet and is lost — so `super.start()` (which builds that pipeline)
		// runs first, and only once it returns does the clip actually start.
		const real_gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
		navigator.mediaDevices.getUserMedia = async () => dest.stream;
		try {
			await super.start();   // MicStream's own, real code — unmodified
		} finally {
			navigator.mediaDevices.getUserMedia = real_gum;
		}
		this.clip_source.start();
	}

	stop(){
		this.clip_source?.stop();
		this.clip_ctx?.close();
		super.stop();
	}

	label(){ return this.url.split("/").pop(); }
}

export { ClipMic };
