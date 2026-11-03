import { div, span } from "../../../core/View/View.js";
import VoiceStage from "./VoiceStage.js";
import Outline from "../Outline.js";

/** Stage 3 · Structure: the sentences grouped under headings; every `S#` points back at a clean sentence. */
export default class StructureStage extends VoiceStage {
	static key = "structure";
	static label = "3 · Structure";
	static fields = ["structure"];
}

StructureStage.View = class StructureStageView extends VoiceStage.View {
	body(){
		const { subject, sections } = Outline.parse(this.stage.data.structure);
		if (subject) div.c("voice-subject", subject);
		const cards = (list, depth) => list.forEach(c => div.c("voice-leaf", () => { span(c.text); cite(c.cites); if (c.cards?.length) div.c("voice-sub", () => cards(c.cards, depth + 1)); }));
		const cite = n => n.length && span.c("voice-cites muted", n.map(x => "S" + x).join(" "));
		sections.forEach(sec => div.c("voice-section", () => { div.c("voice-section-t", () => { span(sec.title); cite(sec.cites); }); cards(sec.cards, 0); }));
	}
};
