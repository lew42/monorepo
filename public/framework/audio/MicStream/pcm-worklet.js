/**
 * Runs OFF the main thread, inside the browser's own audio engine — the only
 * place raw microphone samples can be read. Every ~8ms (128 samples at 16kHz)
 * it hands the main thread one small chunk of the mic's actual sound.
 *
 * A copy of `ux/Dictate/pcm-worklet.js` under a different processor name
 * (`lew42-pcm` vs `dictate-pcm`) — each `MicStream` opens its OWN `AudioContext`,
 * so the two never actually compete for one registry, but a second file means
 * this module never has to import across the `ux/Dictate/` fence to work, and
 * `audio/` can change independently later (`readme.md`).
 */
class Lew42PCM extends AudioWorkletProcessor {
	process(inputs){
		const channel = inputs[0]?.[0];
		if (channel) this.port.postMessage(channel.slice());
		return true;
	}
}

registerProcessor("lew42-pcm", Lew42PCM);
