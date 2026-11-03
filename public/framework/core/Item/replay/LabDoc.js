import Item from "../Item.js";
import LabTape from "./LabTape.js";
import LabWorld from "./LabWorld.js";

/* A plain Item that asks an AI for a summary of itself. The AI is the lab's fake outside world (LabWorld). */
export default class LabDoc extends Item {

	static Store = LabTape.Store;
	static world = LabWorld.shared;
	static fields = ["title", "summary"];
	static skip_when_replaying = false;   // true: do not ask while Store.read is replaying a line

	summarize(){
		if (this.summary) return this;   // a guard: already summarized, do nothing
		if (LabDoc.skip_when_replaying && this.store?.replaying) return this;
		return this.set({ summary: LabDoc.world.ask_ai() });
	}
}
Item.register(LabDoc, "LabDoc");
