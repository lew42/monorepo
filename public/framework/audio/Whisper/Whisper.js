import { View, div, span } from "../../core/View/View.js";
import WhisperSession from "./WhisperSession.js";

View.stylesheet(import.meta, "Whisper.css");

/**
 * class Whisper — the local whisper-server (speech to text) as one object: is it up, where, how fast it
 * answers a ping, how many times it has gone down and come back, and the `WhisperSession`s (one per
 * dictation surface) talking to it.
 *
 *   const whisper = Whisper.shared;                    // one per page
 *   const mine = whisper.session("Refine demo");       // a WhisperSession, kept on whisper.sessions
 *   await whisper.check();                             // then whisper.status is "up" or "down"
 *   new Whisper.View({ subject: whisper });            // server + sessions, live
 *
 * Not the same as `audio/Transcriber/Whisper.js` (`Transcriber.Whisper`), the streaming ENGINE that
 * sends audio; this class is the server's state and its logs. Doc: `audio/Whisper/readme.md`.
 */
export default class Whisper {

	static icon = "mic";
	static get shared(){ return (Whisper._shared ??= new Whisper()); }

	url = Whisper.default_url();
	status = "unknown";   // unknown | up | down
	ping_ms = 0;
	restarts = 0;         // times this page saw it down and then up again
	checked_at = "";
	sessions = [];

	constructor(...args){ Object.assign(this, ...args); }

	/** Same rule as `ux/Dictate`: direct on this machine, the page's `/whisper` proxy from a phone. */
	static default_url(){
		const h = globalThis.location?.hostname;
		const local = h === "localhost" || h === "127.0.0.1" || h?.endsWith(".localhost");
		return local || !globalThis.location ? "http://127.0.0.1:8178" : globalThis.location.origin + "/whisper";
	}

	session(name, fields){
		let s = this.sessions.find(x => x.name === name);
		if (!s){
			s = new WhisperSession({ name, ...fields });
			s.on_change = () => this.on_change?.(this);
			this.sessions.push(s);
			this.on_change?.(this);
		}
		return s;
	}

	/** Ask the server if it is there (any HTTP answer at all means up). Never throws. */
	async check(){
		const was = this.status;
		const t0 = performance.now(), ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 2500);
		try { await fetch(this.url + "/", { signal: ctrl.signal }); this.status = "up"; this.ping_ms = Math.round(performance.now() - t0); }
		catch { this.status = "down"; this.ping_ms = 0; }
		finally { clearTimeout(timer); }
		if (was === "down" && this.status === "up") this.restarts++;
		this.checked_at = new Date().toISOString();
		this.on_change?.(this);
		return this.status;
	}
}

/** Whisper.View — the server's row plus one WhisperSession.View per session. */
Whisper.View = class extends View {
	render(){
		const w = this.subject;
		this.ac("whisper");
		div.c("whisper-server", () => {
			span.c(`whisper-dot is-${w.status}`, "●");
			span.c("whisper-name", "Whisper server");
			span.c("whisper-stat", `${w.status} · ${w.url} · ping ${w.ping_ms} ms · restarts seen ${w.restarts} · ${w.sessions.length} sessions`);
		});
		w.sessions.forEach(s => new WhisperSession.View({ subject: s }));
	}
};
