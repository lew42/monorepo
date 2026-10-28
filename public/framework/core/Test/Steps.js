import ScratchStore from "../Item/watch/ScratchStore.js";

/**
 * class Steps — one run of a class's core test, written once as a list of steps, the same in node and the browser.
 *
 *   const run = new Steps(steps);            // steps: [{ title, code, note, run(t), check(t), show(t) }] (Item.steps.js)
 *   await run.next();                        // one step: { step, ok, error, lines }
 *   await run.all((step, t, ok, error) => {}) // every step left; the callback once per step
 *
 * `t` is the bag every step shares: `t.store` keeps every line written (a ScratchStore writes no file), `t.lines`
 * are the ones the step just wrote. Two helpers make one test cover both ways an object is made:
 *   t.click(label, fn)   the UI path: in the browser a real button labelled `label` is pressed and its listener runs
 *                        `fn` (TestView.press); in node `fn` runs directly
 *   t.same(a, b)         the two objects are equal as data, and in the browser their two drawn views read the same
 * `ui` is the browser's TestView; node passes none.
 */
export default class Steps {

	constructor(steps, { ui = null } = {}){
		this.steps = steps;
		this.at = 0;
		this.results = [];
		const t = this.t = { store: new ScratchStore({ url: "scratch.jsonl" }), lines: [], ui };
		t.store.on_lines = lines => t.lines.push(...lines);
		t.click = (label, fn) => ui ? ui.press(label, fn) : fn();
		t.same = (a, b) => JSON.stringify(a) === JSON.stringify(b) && (!ui || ui.same(a, b));
	}

	get done(){ return this.at >= this.steps.length; }

	// Run the next step, wait the one microtask the store takes to flush, then check it.
	async next(){
		if (this.done) return null;
		const step = this.steps[this.at++], t = this.t;
		t.lines = [];
		let ok, error;
		try { await step.run(t); await null; ok = !!step.check(t); }
		catch (e){ ok = false; error = e; }
		const result = { step, ok, error, lines: [...t.lines] };
		this.results.push(result);
		return result;
	}

	async all(after = () => {}){
		while (!this.done){
			const r = await this.next();
			after(r.step, this.t, r.ok, r.error);
		}
		return this.results;
	}
}
