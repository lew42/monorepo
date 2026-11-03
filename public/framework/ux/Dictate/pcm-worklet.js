/**
 * Runs OFF the main thread, inside the browser's own audio engine — the only
 * place raw microphone samples can be read. Every ~8ms (128 samples at 16kHz)
 * it hands the main thread one small chunk of the mic's actual sound. No file
 * ever gets written here; `capture.js` glues the chunks into a segment and
 * turns THAT into the WAV whisper-server reads. See `ux/Dictate/doc/decisions.md`.
 */
class DictatePCM extends AudioWorkletProcessor {
	process(inputs){
		const channel = inputs[0]?.[0];
		if (channel) this.port.postMessage(channel.slice());
		return true;
	}
}

registerProcessor("dictate-pcm", DictatePCM);
