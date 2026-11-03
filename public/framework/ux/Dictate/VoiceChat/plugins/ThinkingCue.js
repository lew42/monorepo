import { VoiceChat } from "../VoiceChat.js";

// A soft tone while a reply is on its way (the flag and the repeat delay live on audio/Recite).
export default class ThinkingCue {
	static label = "Thinking cue";
	static description = "Play a soft tone while a reply is on its way.";
	static defaults = { on: true, repeat_ms: 2000 };
	static fields = [{ key: "repeat_ms", kind: "number", min: 500, max: 10000, step: 100, label: "Tone repeats after (ms)" }];

	static attach(vc){
		vc.recite.thinking_cue = true;
		vc.recite.cue_repeat_ms = VoiceChat.config(vc, this).repeat_ms;
	}

	static reconfigure(vc){ vc.recite.cue_repeat_ms = VoiceChat.config(vc, this).repeat_ms; }

	// Only the pending repeat is dropped: cancel_cue() would also clear cue_pending, which no-flood's hold reads.
	static detach(vc){
		const r = vc.recite;
		r.thinking_cue = false;
		clearTimeout(r.cue_timer); r.cue_timer = null;
	}
}
