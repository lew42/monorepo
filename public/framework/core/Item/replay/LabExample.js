import LabColumn from "./LabColumn.js";
import LabWorld from "./LabWorld.js";

/* One example of the lab: a real class, its buttons, and two columns (LabColumn) that every press goes to. No DOM: the page
   draws it (LabExampleView). A subclass names the class, the buttons and the keys to compare, and says what the result means.

   static Class      the lab class (LabTask ...)         static first()   the file's first line, the starting values
   static buttons    [{ label, verb, args?, both?, meant? }]: `both` presses in a second tab too; `meant(m)` updates what people meant
   static keys       [{ key, label, read(item), show?(v), same?(a, b) }]: what Reload compares, and what `meant` is checked against
   static options    [{ key, label, start_over? }]: checkboxes.
   static counts     which outside effects the page counts: "agents", "ai".   static check_meant   true: the page also checks the live object against what the presses meant. */
export default class LabExample {

	static id = "";
	static tab = "";
	static title = "";
	static look = "";
	static hint = "";
	static Class = null;
	static buttons = [];
	static keys = [];
	static options = [];
	static counts = [];
	static check_meant = false;
	static first(){ return {}; }

	columns = {};
	options = {};
	meant = {};

	// Time shown as hh:mm:ss, and a span of time as m:ss.
	static clock(ms){ return ms == null ? "none" : new Date(ms).toTimeString().slice(0, 8); }
	static dur(ms){ const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
	static near(a, b){ return a === b || (a != null && b != null && Math.abs(a - b) < 1500); }   // clocks agree to within a second and a half

	constructor(){
		for (const { key } of this.constructor.options) this.options[key] = false;
		if ("stamp" in this.options) this.options.stamp = true;   // the real writer stamps every line it saves
	}

	get world(){ return this.constructor.Class.world ?? LabWorld.shared; }

	async start(){
		const { Class, first } = this.constructor;
		this.meant = this.constructor.check_meant ? { ...first() } : {};
		this.columns = {};
		for (const kind of ["changes", "calls"]) this.columns[kind] = await new LabColumn({ kind, Class, first: first(), stamp: this.options.stamp ?? true, world: this.world }).start();
		return this;
	}

	// A button. Every column gets the press, now; resolves once the tapes are written.
	press(button){
		button.meant?.(this.meant);
		const both = button.both ? c => c.press_both(button.verb, button.args) : c => c.press(button.verb, button.args);
		return Promise.all(Object.values(this.columns).map(both));
	}

	// Reload: one column at a time, so each one's side effects are counted on their own.
	async reload(){
		this.apply_options();
		for (const column of Object.values(this.columns)) await column.reload();
	}
	apply_options(){}

	async set_option(key, value){
		this.options[key] = value;
		if (this.constructor.options.find(o => o.key === key)?.start_over) await this.start();
		else if (Object.values(this.columns).some(c => c.after)) await this.reload();
	}

	// What differs between the live object (before the reload) and the rebuilt one: ["time is 0:00, it should be 0:07", ...]
	diffs(kind){
		const { live, after } = this.pair(kind);
		if (!after) return [];
		return this.constructor.keys.filter(k => !(k.same ?? Object.is)(k.read(live), k.read(after))).map(k => `${k.label} is ${this.show(k, after)}, it should be ${this.show(k, live)}`);
	}
	// What a person did not get even before any reload: the live object against what the presses meant.
	off(kind){
		const live = this.columns[kind].you;
		return this.constructor.keys.filter(k => k.key in this.meant && !(k.same ?? Object.is)(k.read(live), this.meant[k.key]))
			.map(k => `${k.label} shows ${this.show(k, live)}, the presses meant ${(k.show ?? String)(this.meant[k.key])}`);
	}
	pair(kind){ const c = this.columns[kind]; return { live: c.you, after: c.after?.item }; }
	show(k, item){ return (k.show ?? String)(k.read(item)); }

	// Did Reload do anything twice, or change anything? The side effects are counted, the differences listed. `off`: the live object
	// was already not what the presses meant, so "same as before" is the wrong answer kept, not a good one.
	verdict(kind){
		const fx = this.columns[kind].after?.fx ?? { agents: 0, ai: 0, cost: 0 }, diffs = this.diffs(kind), off = this.off(kind);
		return { fx, diffs, off, again: fx.agents > 0 || fx.ai > 0, ok: !diffs.length && !off.length && !fx.agents && !fx.ai };
	}

	// One sentence on what this column's Reload shows (a subclass writes the real one).
	why(kind){ return ""; }
}
