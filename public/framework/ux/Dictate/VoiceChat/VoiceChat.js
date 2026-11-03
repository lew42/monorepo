// One Voice Chat per open chat: the class lists the plugins once, each chat switches and configures them for itself.
// Hosts are handed in by chat.js: `new VoiceChat({ recite, mic })`. Readme: ./readme.md
import { Plugin } from "../../../core/Plugin/Plugin.js";

export class VoiceChat extends Plugin {

	// A plugin that is off for this chat must still leave its host in the off state: Recite's own default may be on.
	// (detach() is safe before attach(); core/Plugin only detaches what was attached.)
	initialize(){
		for (const row of this.plugins) {
			const rec = row.record;
			if (rec.attached.has(this)) continue;
			try { rec.plugin.detach?.(this); } catch (e) { console.error(`[VoiceChat] ${rec.name} detach() failed`, e); }
		}
		for (const row of this.plugins) row.record.plugin.bind?.(this);   // a plugin may route its host's own controls through its row
	}

	// What a plugin reads: this chat's own settings for it (its overrides on top of the class values).
	static config(vc, P){ return vc.plugins.find(P.name).get("config"); }
}

export default VoiceChat;
