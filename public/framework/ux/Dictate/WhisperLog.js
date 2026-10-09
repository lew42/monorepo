import { View, div, span, h4 } from "../../core/View/View.js";
import JSONL from "../../ext/JSONL/JSONL.js";
import FsFile from "../../ext/filesystem/FsFile.js";

View.stylesheet(import.meta, "WhisperLog.css");

/**
 * class WhisperLog — every answer Whisper gives, as it gives it: each interim guess and each
 * final chunk, with a time and how long Whisper took, as a stream.
 *
 *   new Dictate({ on_whisper: line => WhisperLog.record(line) });   // the writer (opt-in)
 *   new WhisperLog();                                                // the view: tails the file
 *
 * Wire: `Dictate.transcribe()` is the one place Whisper's reply passes, and calls `on_whisper`
 * with `{kind, ms, text, raw}`. `record()` appends one line to `/framework/ai/whisper/<date>.jsonl`
 * through the one file API; the view tails that file with `JSONL.live()`, so a row shows in about
 * 100 ms. Nothing records unless a caller wires `on_whisper`, so ordinary pages write nothing.
 * `raw` is what whisper-server returned before our whitespace tidy-up: if it already ends in a
 * period, Whisper put it there. Doc: `doc/whisper-log.md`.
 */
export default class WhisperLog extends View {
	static dir = "/framework/ai/whisper/";
	static path(){ return `${WhisperLog.dir}${new Date().toISOString().slice(0, 10)}.jsonl`; }

	/** Append one Whisper answer. Never throws. Interim guesses repeat, so an identical one is skipped. */
	static record({ kind, ms, text, raw }){
		if (!text || (kind === "interim" && text === WhisperLog.last)) return;
		WhisperLog.last = kind === "interim" ? text : null;
		FsFile.append(WhisperLog.path(), { at: new Date().toISOString(), kind, ms, msg: text, raw }).catch(() => {});
	}

	render(){
		this.ac("whisper-log");
		h4.c("whisper-log-h", "Whisper log — what Whisper said, as it said it");
		this.$rows = div.c("whisper-log-rows");
		this.log = new JSONL({ url: WhisperLog.path() });
		// Make sure today's file exists so the stream has something to attach to.
		FsFile.append(WhisperLog.path(), { at: new Date().toISOString(), kind: "open", msg: "log opened" }).catch(() => {});
		this.log.live(() => this.draw());
		this.draw();
	}

	draw(){
		const lines = (this.log?.logs ?? []).slice(-60);
		this.$rows.empty(() => {
			if (!lines.length) return div.c("whisper-log-empty muted", "Nothing yet. Press the mic and speak.");
			lines.forEach(l => div.c(`whisper-log-row is-${l.kind}`, () => {
				span.c("whisper-log-at", (l.at ?? "").slice(11, 23));
				span.c("whisper-log-kind", l.kind);
				span.c("whisper-log-ms", l.ms != null ? l.ms + " ms" : "");
				span.c("whisper-log-text", l.msg ?? "");
			}));
		});
		this.$rows.el.scrollTop = this.$rows.el.scrollHeight;
	}
}
