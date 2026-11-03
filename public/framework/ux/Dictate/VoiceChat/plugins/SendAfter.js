import { VoiceChat } from "../VoiceChat.js";

// When a dictated sentence leaves for the assistants. Written onto the mic instance (ext/Chat/Mic.js reads these before the browser-wide SETTINGS).
const PRESETS = {
	sentence: { per: 1, period: true, question: true, comma: false },
	two: { per: 2, period: true, question: true, comma: false },
	pause: { per: 0, period: true, question: true, comma: false, mode: "pause" },
	clause: { per: 1, period: true, question: true, comma: true },
};
const KEYS = ["send_mode", "sentences_per_send", "send_on_period", "send_on_question", "send_on_comma"];

export default class SendAfter {
	static label = "Send after";
	static group = "dictate";   // Dictate: session.settings.dictate
	static description = "How much you say before it goes to the assistants.";
	static defaults = { on: true, after: "sentence" };
	static fields = [{ key: "after", type: "select", label: "Send", options: [
		{ value: "sentence", label: "each sentence", help: "One message per finished sentence (it ends with . ! … or ?)." },
		{ value: "two", label: "every two sentences", help: "One message for every two finished sentences." },
		{ value: "pause", label: "when you pause", help: "Nothing goes until you stop talking for the send delay, then everything goes as one message." },
		{ value: "clause", label: "each clause (also at commas)", help: "Like each sentence, but a comma ends a piece too, so long sentences go in fragments." },
	] }];

	static attach(vc){
		const mic = vc.mic;
		if (!mic) return;
		mic.$send_after_was ??= Object.fromEntries(KEYS.map(k => [k, mic[k]]));   // what the mic had before, to put back
		this.apply(vc);
	}

	static reconfigure(vc){ if (vc.mic) this.apply(vc); }

	static apply(vc){
		const mic = vc.mic, p = PRESETS[VoiceChat.config(vc, this).after] ?? PRESETS.sentence;
		mic.sentences_per_send = p.per;
		mic.send_on_period = p.period; mic.send_on_question = p.question; mic.send_on_comma = p.comma;
		mic.send_mode = p.mode ?? mic.$send_after_was.send_mode;
	}

	static detach(vc){
		const mic = vc.mic, was = mic?.$send_after_was;
		if (!was) return;
		for (const k of KEYS) mic[k] = was[k];
		delete mic.$send_after_was;
	}
}
