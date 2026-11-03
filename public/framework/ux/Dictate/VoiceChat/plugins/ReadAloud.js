import { VoiceChat } from "../VoiceChat.js";
import PERSONAS from "../../../../audio/Voice/personas.js";

// Read new replies aloud by themselves, and in which voice (audio/Recite does the reading; this sets it for one chat).
export default class ReadAloud {
	static label = "Read aloud";
	static group = "recite";   // read-aloud: session.settings.recite
	static description = "Read new replies aloud by themselves, in the voice you pick.";
	static defaults = { on: true, voice: PERSONAS[0].name };
	// The options are the persona names (audio/Voice/personas.js, plain data, so this file stays loadable in node).
	static fields = [{ key: "voice", type: "select", label: "Voice", options: PERSONAS.map(p => p.name) }];

	static attach(vc){
		const r = vc.recite;
		this.set_voice(vc);
		this.auto(r, true);
	}

	static reconfigure(vc){ this.set_voice(vc); }

	// The host's own switch, without the row hearing about it (the row is what asked).
	static auto(r, on){
		const was = r.$read_aloud_busy;
		r.$read_aloud_busy = true;
		try { r.set_auto(on); } finally { r.$read_aloud_busy = was; }
	}

	static set_voice(vc){
		const r = vc.recite, name = VoiceChat.config(vc, this).voice;
		if (name && r.voice?.name !== name) r.pick(name);
	}

	// The bar's 🗣 button decides for the chat too: it writes this chat's row (`$read_aloud_busy` stops the row's own attach from looping back).
	static bind(vc){
		const r = vc.recite;
		r.$read_aloud_chat = vc;
		if (r.$read_aloud_wrapped) return;
		r.$read_aloud_wrapped = true;
		const own = r.set_auto.bind(r);
		r.set_auto = v => {
			own(v);
			if (r.$read_aloud_busy) return;
			r.$read_aloud_busy = true;
			try { r.$read_aloud_chat.plugins.find(this.name)?.set({ enabled: !!v }); } finally { r.$read_aloud_busy = false; }
		};
	}

	// What the browser remembered, as overrides for the chat that starts on it (read before `new VoiceChat`).
	static snapshot(recite){
		const rec = VoiceChat.records.get(this), out = {};
		if (recite.voice?.name && recite.voice.name !== rec.config.voice) out.config = { voice: recite.voice.name };
		if (!!recite.auto !== rec.on) out.enabled = !!recite.auto;
		return Object.keys(out).length ? { [this.name]: out } : {};
	}

	static detach(vc){ this.auto(vc.recite, false); }
}
