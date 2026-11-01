import LabTape from "./LabTape.js";

/* One way of saving an example's button presses: "changes" (the method runs, the Store saves the sets it made) or "calls"
   (item.act(verb) runs it and saves the verb). It owns a tape, a live tab ("you") and what its last Reload gave. No DOM. */
export default class LabColumn {

	reloads = 0;
	after = null;   // { item, fx, n } once reloaded: the rebuilt object, what the outside world saw, which reload

	constructor(...args){ Object.assign(this, ...args); }   // { kind, Class, first, stamp, world }

	// Load the (empty) file as a live tab, the way a page load does.
	async start(){
		this.tape = new LabTape({ first: this.first, stamp: this.stamp });
		this.you = await this.tape.open(this.Class, { tab: "you", write: true });
		this.reloads = 0;
		this.after = null;
		return this;
	}

	// The button's verb on one tab, saved this column's way.
	call(item, verb, args){ return this.kind === "calls" ? item.act(verb, args) : item[verb](args); }

	// Runs now (the object changes before this returns); resolves when the Store has flushed its lines to the tape.
	press(verb, args){ this.call(this.you, verb, args); return LabTape.tick(); }

	// The same press in a second tab at the same moment: both see the same state, both press, then you hear the other tab's line
	// (a Store.read of it, which is what the live tail does) while the other tab is dropped.
	async press_both(verb, args){
		const other = await this.tape.open(this.Class, { tab: "tab B", write: true });
		const from = this.tape.entries.length;
		this.call(this.you, verb, args);
		this.call(other, verb, args);
		await LabTape.tick();
		const theirs = this.tape.entries.slice(from).filter(e => e.tab === "tab B").map(e => e.line);
		this.you.store.read(JSON.parse(JSON.stringify(theirs)));
	}

	// Rebuild from the tape through the real Class.open, and count what the outside world did while it was built.
	async reload(){
		const mark = this.world.mark();
		const item = await this.tape.open(this.Class);
		this.after = { item, fx: this.world.since(mark), n: ++this.reloads };
		return this.after;
	}
}
