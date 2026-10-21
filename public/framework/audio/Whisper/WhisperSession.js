import { View, div, span, h4 } from "../../core/View/View.js";
import WhisperLog from "./WhisperLog.js";

View.stylesheet(import.meta, "Whisper.css");

const words = t => String(t ?? "").trim().split(/\s+/).filter(Boolean);
const norm = w => w.toLowerCase().replace(/[.,!?;:]+$/, "");

/**
 * class WhisperSession — ONE dictation surface's conversation with the Whisper server: every request
 * it sent (when, audio size, seconds of audio, how long Whisper took, what came back) and every time
 * Whisper REVISED words it had already shown (an "amendment").
 *
 *   const s = Whisper.shared.session("Refine demo");
 *   new Dictate({ on_whisper: line => s.record(line) });   // the one wire
 *   new WhisperSession.View({ subject: s });                // its view, on any page
 *
 * `record({kind, ms, text, raw, bytes, seconds})` is called by `ux/Dictate`'s `on_whisper` for each
 * answer (`kind` is "interim" for a guess that may still change, "final" for a settled chunk). Each
 * becomes a plain `request` row, is written by `Dictate.log_whisper` to the WhisperLog bucket, not here (tagged with the
 * session name), and fires `on_change`, so a view repaints in the same tick. Only plain data lives on
 * the instance, so `ux/Content/Object/DefaultView` can show it. Doc: `audio/Whisper/readme.md`.
 */
export default class WhisperSession {

	static icon = "graphic_eq";
	static dir = WhisperLog.dir;
	static path(){ return WhisperLog.path(); }

	name = "";
	started_at = "";
	requests = [];     // { at, t, kind, ms, bytes, seconds, gap_ms, text, raw, amended }
	amendments = [];   // { at, request, from, to }: earlier words that changed
	last_guess = "";   // the previous interim text, to spot revisions

	constructor(...args){
		Object.assign(this, ...args);
		this.started_at ||= new Date().toISOString();
	}

	record({ kind, ms, text, raw, bytes = 0, seconds = 0, req, segment, body }){
		if (!text) return;
		const now = Date.now();
		const prev = this.requests.at(-1);
		const row = { at: new Date(now).toISOString(), t: now, kind, ms, bytes, seconds: +(+seconds).toFixed(2), gap_ms: prev ? now - prev.t : 0, text, raw, amended: false };
		const change = this.revision(text);
		if (change){ row.amended = true; this.amendments.push({ at: row.at, request: this.requests.length, ...change }); }
		this.last_guess = kind === "interim" ? text : "";
		this.requests.push(row);
		this.on_change?.(this);
	}

	/** Did this answer change words the PREVIOUS guess already showed? The last word of a guess is still
	 *  forming, so it may change; any earlier word changing is a revision. */
	revision(text){
		const before = words(this.last_guess), now = words(text);
		if (before.length < 2) return null;
		let i = 0;
		while (i < before.length && i < now.length && norm(before[i]) === norm(now[i])) i++;
		if (i >= before.length - 1) return null;
		return { from: before.slice(i).join(" "), to: now.slice(i).join(" ") };
	}

	get avg_ms(){ return this.requests.length ? Math.round(this.requests.reduce((a, r) => a + (r.ms || 0), 0) / this.requests.length) : 0; }
	get total_bytes(){ return this.requests.reduce((a, r) => a + (r.bytes || 0), 0); }
}

/** WhisperSession.View — the request log of one session, newest last: time, kind, latency, audio size,
 *  what came back; a revised row is highlighted and the revisions are listed under the log. */
WhisperSession.View = class extends View {

	render(){
		const s = this.subject;
		this.ac("whisper-session");
		h4.c("whisper-h", () => {
			span(`Whisper session: ${s.name}`);
			span.c("whisper-stat", `${s.requests.length} requests · avg ${s.avg_ms} ms · ${(s.total_bytes / 1024).toFixed(0)} KB sent · ${s.amendments.length} revisions`);
		});
		const rows = div.c("whisper-rows");
		const lines = s.requests.slice(-40);
		if (!lines.length) div.c("whisper-empty muted", "Nothing yet. Press the mic and speak.");
		lines.forEach(r => div.c(`whisper-row is-${r.kind}${r.amended ? " is-amended" : ""}`, () => {
			span.c("whisper-at", r.at.slice(11, 23));
			span.c("whisper-kind", r.kind);
			span.c("whisper-ms", `${r.ms} ms`);
			span.c("whisper-kb", `${(r.bytes / 1024).toFixed(0)} KB · ${r.seconds} s`);
			span.c("whisper-gap", r.gap_ms ? `+${(r.gap_ms / 1000).toFixed(1)} s` : "");
			span.c("whisper-text", r.text);
		}));
		s.amendments.slice(-5).forEach(m => div.c("whisper-amend", () => span(`Revised: “${m.from}” → “${m.to}”`)));
		rows.el.scrollTop = rows.el.scrollHeight;
	}
};
