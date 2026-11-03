import Task from "../../Task/Task.js";
import Item from "../Item.js";
import LabTape from "./LabTape.js";
import LabWorld from "./LabWorld.js";

/* The real Task, plus the one thing a real task does that Task.js does not: starting it spawns an agent. The spawn is the
   lab's fake outside world (LabWorld). Everything else (the state rules, the clock, replay) is the real core/Task/Task.js. */
export default class LabTask extends Task {

	static Store = LabTape.Store;
	static world = LabWorld.shared;
	static skip_when_replaying = false;   // true: do not spawn while Store.read is replaying a line (the only replaying flag a page load sets)

	start(){
		const before = this.state;
		super.start();   // the real rules: refused (a warning, no change) unless idle, stopped or complete
		if (before === this.state || (LabTask.skip_when_replaying && this.store?.replaying)) return this;
		return this.set({ agent_id: LabTask.world.spawn_agent() });
	}
}
Item.register(LabTask, "LabTask");
