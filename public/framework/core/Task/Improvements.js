import Item from "../Item/Item.js";
import Task from "./Task.js";

/* A folder's improvements.jsonl (Servex/agents/roles/mastermind.md, "Improvements"): proposed fixes and moves, one nested Task each.
   The same title proposed again adds weight instead of a second task (the owner, 2026-10-22): this list's add reinforces the task
   already there. A replay does the same, so the item tool writes the add as the agent sent it and never rewrites it into a reinforce.
   Older files hold {"<id>":{"reinforce":{…}}} lines (the tool's old rewrite); Task.replay_line still reads those. */
export class Improvements extends Task {
	static merges_same_title = true;   // the item tool's same-title refusal steps aside: this list merges instead

	static List = class ImprovementList extends Task.List {
		add(x, opts){
			if (Array.isArray(x)) return x.map(each => this.add(each, opts)).at(-1);
			const title = typeof x === "string" ? x : x?.title;
			const same = typeof title === "string" ? [...this].find(t => Task.same_title(t.get_one("title"), title)) : null;
			if (!same) return super.add(x, opts);
			same.reinforce({ ...(x?.why ? { why: x.why } : {}), ...(x?.by ? { by: x.by } : {}) });
			return same;
		}
	};

}

export default Improvements;

Item.register(Improvements, "Improvements");
