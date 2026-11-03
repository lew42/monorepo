import Transcriber from "./Transcriber.js";

const Recognition = globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition;

/**
 * class Transcriber.Browser extends Transcriber — Chrome's own
 * `SpeechRecognition`. Free, needs no install, but the audio leaves the
 * machine (Chrome sends it to Google); Firefox and iOS Safari have neither
 * the API nor a polyfill, so `Recognition` is `undefined` there and `start()`
 * throws rather than silently doing nothing.
 *
 * Unlike `Transcriber.Whisper`, this engine reads its own microphone through
 * the browser's API — the `mic` argument to `start()` is accepted for a
 * consistent call shape but not required to be already open.
 */
export default class Browser extends Transcriber {

	lang = "en-US";

	async start(mic){
		if (!Recognition) throw new Error("This browser has no SpeechRecognition — try Chrome, or use Transcriber.Whisper instead.");

		const rec = this.rec = new Recognition();
		rec.lang = this.lang;
		rec.continuous = true;
		rec.interimResults = true;
		rec.onresult = e => this.heard(e);
		rec.onerror = e => this.on_error?.(new Error("SpeechRecognition: " + e.error));
		// Chrome stops on its own after a few seconds of silence even with
		// `continuous` — restart unless a real `stop()` asked it to end.
		rec.onend = () => { if (!this.stopping) rec.start(); };
		rec.start();
	}

	heard(e){
		let interim = "";
		for (let i = e.resultIndex; i < e.results.length; i++){
			const said = e.results[i][0].transcript;
			if (e.results[i].isFinal){
				const text = said.trim();
				if (text && !this.annotation(text)) this.note_final(text);
			} else interim += said;
		}
		this.note_partial(interim.trim());
	}

	stop(){
		this.stopping = true;
		try { this.rec?.stop(); } catch { /* already stopped */ }
	}
}

Transcriber.Browser = Browser;

export { Browser };
