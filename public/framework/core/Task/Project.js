// A project: a Task with a folder (project.jsonl), moved into its module by Server/ProjectMove.mjs. A Task that walks six STAGES and reports `completed` (0..1) from its subtasks.
import Task from "./Task.js";
import Item from "../Item/Item.js";

const STAGES = ["requirements", "investigation", "plan", "approval", "work", "landed"];

export class Project extends Task {

	// The stage is plain data, apart from the task's `state`; it only ever moves forward, one step at a time.
	get stage(){ const s = this.get_one("stage"); return STAGES.includes(s) ? s : STAGES[0]; }
	get stage_index(){ return STAGES.indexOf(this.stage); }

	// Moves to the next stage. Entering "approval" waits on the owner; "work" starts the clock; "landed" completes (refused while a subtask is open).
	advance(){
		const next = STAGES[this.stage_index + 1];
		if (!next) return this.warn(`advance(): already "${this.stage}"`);
		if (this.stage === "approval" && this.state === "waiting") this.approve({ by: "owner" });
		if (next === "landed"){
			this.complete();
			if (this.state !== "complete") return this;   // complete() warned; the stage stays
		} else if (next === "approval") this.wait({ on: "owner", what: "approval of the plan" });
		else if (next === "work" && this.state === "idle") this.start();
		else if (this.state === "idle" && next !== "requirements") this.start();
		this.set({ stage: next });
		return this;
	}

	// 0..1, computed: the mean of the subtasks' own completion (recursive); no subtasks, 0 until landed.
	get completed(){
		const kids = [...(this._tasks ?? [])];
		if (!kids.length) return super.completion;
		return kids.reduce((sum, k) => sum + (k.completed ?? k.completion), 0) / kids.length;
	}
	// The name every reader of a task already uses (index rows, TaskView); the same number as `completed`.
	get completion(){ return this.completed; }

	// Replays a project.jsonl (lines already parsed) into a Project. Reading the file is Server/ProjectMove.mjs's job.
	static from_lines(lines){ return this.replay(lines); }

	get started_at(){ return this.get_one("started_at") ?? null; }
	get completed_at(){ return this.get_one("completed_at") ?? null; }
}

Project.STAGES = STAGES;
export default Project;

Item.register(Project, "Project");
