import { View, div, span } from "../../core/View/View.js";
import track from "../../core/track/track.js";
import Part, { PartView } from "../Part.js";

/**
 * class Transcriber extends Part — an audio stream in, a text stream out. The
 * base class is the shape every engine shares: `start(mic)` / `stop()`, and
 * two events —
 *
 *   `on_partial(text)` — a still-improving guess, fired again and again while
 *   the speaker keeps talking. `text === ""` the instant a segment closes.
 *   `on_final(text)`   — one settled segment. Never an annotation like
 *   `[BLANK_AUDIO]` or `*shriek*`, and never a segment under
 *   `min_speech_ms` of actual speech — `Transcriber.Whisper`'s own silence
 *   rule, copied from `ux/Dictate/Dictate.js`.
 *
 * Two engines, same shape, picked by the caller:
 *
 *   new Transcriber.Whisper()   // local whisper-server, via the page-origin proxy
 *   new Transcriber.Browser()   // Chrome's own SpeechRecognition
 *
 *   const t = new Transcriber.Whisper();
 *   t.on_partial = text => …;
 *   t.on_final = text => …;
 *   await t.start(mic);   // mic: a MicStream, already open (Whisper reads its buffer)
 *   t.stop();
 */
export default class Transcriber extends Part {
	async start(mic){ throw new Error("Transcriber: pick an engine — Transcriber.Whisper or Transcriber.Browser"); }
	stop(){}

	/** What state()-watchers (`Transcriber.View`, the state view below) read:
	 *  is a partial guess showing right now, and how many finished segments
	 *  this engine has produced. Kept on the base class so both engines get it
	 *  for free — each just calls `this.note_partial()`/`this.note_final()`
	 *  from its own `on_partial`/`on_final`, or a caller wires them the same
	 *  way this file's own `Transcript` view does. */
	note_partial(text){ this.listening = !!text; this.on_partial?.(text); }
	note_final(text){ this.listening = false; this.finals = (this.finals ?? 0) + 1; this.on_final?.(text); }

	/** Whisper is honest about noise: a loud sound that is not speech comes
	 *  back as an ANNOTATION — `*shriek*`, `(door closes)`, `[BLANK_AUDIO]`,
	 *  `♪` — never something to type or log as words said. Copied verbatim
	 *  from `ux/Dictate/Dictate.js`'s `annotation()` — same rule, same regex,
	 *  because a list of phrases to ban would have to grow forever and this
	 *  does not. */
	annotation(text){ return /^[\s*([♪_-]*[^\w]*$|^([*([♪])[\s\S]*[*)\]♪]$/.test(text); }
}

track(Transcriber);

/** The actual output — the growing grey guess, then the settled lines. Not
 *  `Transcriber.View`: the owner's "every class ships a view of its live
 *  state" rule (2026-09-29) wants `Klass.View` to be the icon/row/panel
 *  STATE view (below); this keeps its own name so a caller wires both. */
Transcriber.Transcript = class extends View {
	render(){
		this.ac("audio-transcriber flex v gap");
		this.$finals = div.c("flex v gap-50");
		this.$partial = span.c("audio-transcriber-partial muted");
		const prior_partial = this.subject.on_partial;
		const prior_final = this.subject.on_final;
		this.subject.on_partial = text => { prior_partial?.(text); this.$partial.text(text); };
		this.subject.on_final = text => {
			prior_final?.(text);
			this.$finals.append(() => { div.c("audio-transcriber-line", text); });
			this.$partial.text("");
		};
	}
};

/** The state view: which engine, whether it is hearing speech right now, how
 *  many segments have settled — and (panel) every other property, including
 *  `Transcriber.Whisper`'s own timing constants, from `PartView`'s generic
 *  fallback. */
Transcriber.View = class extends PartView {
	glyph(){ return "subtitles"; }
	label(){ return this.subject.constructor.name === "Transcriber" ? "Transcriber" : "Transcriber." + this.subject.constructor.name; }
	stat(){ return (this.subject.finals ?? 0) + " segment" + (this.subject.finals === 1 ? "" : "s"); }
	flags(){ return [["listening", !!this.subject.listening]]; }

	render(){
		super.render();
		const prior_partial = this.subject.on_partial;
		const prior_final = this.subject.on_final;
		this.subject.on_partial = text => { prior_partial?.(text); this.refresh(); };
		this.subject.on_final = text => { prior_final?.(text); this.refresh(); };
	}
};

export { Transcriber };
