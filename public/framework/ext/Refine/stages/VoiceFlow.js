import { View, div } from "../../../core/View/View.js";
import VoicePrompt from "./VoicePrompt.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { servex_url } from "/framework/dev/servex_url.js";

/**
 * class VoiceFlow — every spoken prompt on one session page, drawn live, newest first.
 * It reads the session's page.jsonl lines (the page tool's deltas) and keeps one VoicePrompt per
 * `voice-prompt` item: `{"content":{"add":{"id":"voice-x","type":"voice-prompt",...}}}` creates it,
 * `{"voice-x":{"clean":[...]}}` updates it. A line it does not know is ignored.
 *
 *   const flow = new VoiceFlow();
 *   mount(flow.view); log.read = entries => flow.read(entries);
 */
export default class VoiceFlow {

	prompts = new Map();
	view = new VoiceFlow.View({ flow: this });

	/** Off localhost the dev socket is off (it carries rpc:write), so the page file is only loaded once; a phone follows Servex's read-only voice stream instead (`GET /api/voice/stream`). */
	follow(session){
		if (!Socket.singleton().disabled || this.source || typeof EventSource === "undefined") return this;
		this.source = new EventSource(servex_url(`/api/voice/stream?session=${encodeURIComponent(session)}`));
		this.source.onmessage = e => { try { this.read(JSON.parse(e.data)); } catch {} };
		return this;
	}

	read(entries){
		const touched = new Map();
		const note = (p, keys) => touched.set(p, new Set([...(touched.get(p) ?? []), ...keys]));
		for (const line of [entries].flat()){
			if (!line || typeof line !== "object") continue;
			const add = line.content?.add;
			if (add?.type === "voice-prompt" && add.id){
				const fresh = !this.prompts.has(add.id);
				if (fresh) this.prompts.set(add.id, new VoicePrompt(add.id));
				const p = this.prompts.get(add.id);
				note(p, p.apply(add));
				if (fresh) touched.get(p).add("*");
				continue;
			}
			for (const key of Object.keys(line)) if (this.prompts.has(key) && line[key] && typeof line[key] === "object") note(this.prompts.get(key), this.prompts.get(key).apply(line[key]));
		}
		if (touched.size) this.view.update(touched);
		return this;
	}
}

VoiceFlow.View = class VoiceFlowView extends View {

	render(){ this.ac("voice-flow"); this.el.hidden = true; this.pv = new Map(); }

	update(touched){
		this.el.hidden = false;
		for (const [prompt, keys] of touched){
			let v = this.pv.get(prompt);
			if (!v){
				this.append(() => { v = new VoicePrompt.View({ prompt }); });   // built inside this view, so the page it is read from can never capture it (View.captor)
				this.pv.set(prompt, v); this.el.prepend(v.el);
			}
			else v.draw(keys.has("*") ? undefined : keys);
		}
	}
};
