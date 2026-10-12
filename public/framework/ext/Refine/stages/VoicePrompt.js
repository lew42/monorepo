import { View, div, span } from "../../../core/View/View.js";
import RawStage from "./RawStage.js";
import ThingsStage from "./ThingsStage.js";
import CleanStage from "./CleanStage.js";
import StructureStage from "./StructureStage.js";
import RefinedStage from "./RefinedStage.js";
import CardsStage from "./CardsStage.js";

/**
 * class VoicePrompt — one spoken prompt on a session page: the folded state of a `voice-prompt` item
 * and its six stages. A delta merges shallowly into `data` (the same rule the page replay uses), and
 * `apply()` says which stages it touched so only those redraw.
 *
 *   const p = new VoicePrompt("voice-ab12", { raw: "so the page should" });
 *   p.apply({ raw: "so the page should show", raw_final: true });   // -> ["raw"]
 *   p.stages        // [RawStage, ThingsStage, CleanStage, StructureStage, RefinedStage, CardsStage]
 *
 * Wire format and who writes it: ../doc/voice-to-page.md (server half: Servex/ext/refine/VoicePage.js).
 */
export default class VoicePrompt {

	static STAGES = [RawStage, ThingsStage, CleanStage, StructureStage, RefinedStage, CardsStage];

	data = {};

	constructor(id, data = {}){
		this.id = id;
		this.stages = VoicePrompt.STAGES.map(S => new S(this));
		this.apply(data);
	}

	apply(delta){
		const touched = new Set(["status"]);
		for (const [key, value] of Object.entries(delta ?? {})){
			if (key === "id" || key === "type" || key === "by" || key === "ts") continue;
			this.data[key] = value;
			for (const s of this.stages) if (s.constructor.fields.includes(key) || (key === "raw_final" && s instanceof RawStage) || (key === "clean_final" && s instanceof CleanStage) || key === "ms" || key === "cost") touched.add(s.constructor.key);
		}
		return touched;
	}

	/** One plain sentence saying where this prompt is. */
	get status(){
		const d = this.data;
		return d.error ? "Stopped: " + d.error : d.status === "done" ? "Done" : d.status ?? "Hearing you";
	}
}

VoicePrompt.View = class VoicePromptView extends View {

	render(){
		const p = this.prompt;
		this.ac("voice-prompt");
		div.c("voice-prompt-h", () => { span.c("voice-mic", "🎙"); this.$status = span.c("voice-status"); span.c("muted", p.data.source ?? ""); });
		this.views = {};
		div.c("voice-stages", () => p.stages.forEach(s => this.views[s.constructor.key] = new s.constructor.View({ stage: s })));
		this.draw();
	}

	draw(touched){
		this.$status.text(this.prompt.status);
		for (const [key, view] of Object.entries(this.views)) if (!touched || touched.has(key)) view.draw();
	}
};
