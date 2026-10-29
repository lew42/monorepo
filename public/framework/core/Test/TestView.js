import View, { div, h3, p, ol, li, span, code, button } from "../View/View.js";
import Item from "../Item/Item.js";
import { DefaultView } from "../../ux/Content/Object/DefaultView.js";
import Logger from "../Page/card/log/Logger.js";
import LogView from "../Page/card/log/LogView.js";
import Steps from "./Steps.js";

View.stylesheet(import.meta, "TestView.css");

const frame = () => new Promise(r => requestAnimationFrame(() => setTimeout(r)));   // one painted frame
// A view as text, without its `.store` rows: where an object saves is not part of it (the replayed copy has none).
const text = el => {
	const copy = el.cloneNode(true);
	copy.querySelectorAll(".ux-content-defaultview-ref").forEach(row => row.querySelector(".ux-content-defaultview-key")?.textContent === ".store" && row.remove());
	return copy.textContent.replace(/\s+/g, " ").trim();
};

/**
 * class TestView extends View — watch a class's core test run in the browser: the same steps node runs
 * (core/Test/Steps.js), every object they make drawn live in the default view, every line written beside it.
 *
 *   new TestView({ tests: { Item: steps, List: steps, Task: steps }, name: "Item", stepping: false })
 *
 * Runs after the app has injected the page, one step per painted frame, so each change shows before the next.
 * `stepping` (the page's `?step`): nothing runs until Next, and after each step a `debugger` statement pauses
 * DevTools (when open) with that step's view on screen. A step's clicks are real buttons (`press`), and `same`
 * compares two objects' drawn views as text.
 */
export default class TestView extends View {

	render(){
		this.ac("core-test-view");
		div.c("core-test-view-steps flex v gap", () => {
			div.c("flex wrap gap", () => Object.keys(this.tests).forEach(name =>
				button(name).ac("core-test-view-pick").attr("data-test", name).on("click", () => this.load(name))));
			div.c("flex wrap gap", () => {
				this.$next = button("Next step").on("click", () => this.next());
				this.$all = button("Run all").on("click", () => this.all());
				button("Start over").on("click", () => this.load(this.name));
			});
			this.$tally = p.c("core-test-view-tally");
			this.$list = ol.c("core-test-view-list");
		});
		div.c("core-test-view-objects flex v gap", () => {
			h3("The objects, live");
			this.$controls = div.c("core-test-view-controls flex wrap gap");
			this.$objects = div.c("flex v gap");
		});
		div.c("core-test-view-lines flex v gap", () => {
			h3("Lines written");
			this.$log = div();
		});
		this.load(this.name);
	}

	// A fresh run of one test: the url says which (?test=), so a reload lands here again.
	load(name){
		this.name = this.tests[name] ? name : Object.keys(this.tests)[0];
		const url = new URL(location.href);
		url.searchParams.set("test", this.name);
		history.replaceState(history.state, "", url.href.replace(/([?&]step)=(?=&|$)/, "$1"));   // ?step, not ?step=
		this.el.querySelectorAll(".core-test-view-pick").forEach(b => b.classList.toggle("is-on", b.dataset.test === this.name));
		this.token = (this.token ?? 0) + 1;
		this.steps = this.tests[this.name];
		this.run = new Steps(this.steps, { ui: this });
		this.drawn = new Map();   // object -> its view
		this.buttons = new Map();   // label -> button
		this.logger = new Logger();
		this.$controls.empty(() => span.c("muted", "Buttons appear here as the steps press them."));
		this.$objects.empty(() => p.c("muted", "Nothing yet: step 1 makes the first object."));
		this.$log.empty(() => new LogView({ logger: this.logger }));
		this.draw_list();
		if (!this.stepping) this.all();
	}

	// After the app has put this page on screen (it injects after the first page's content() runs).
	async attached(){
		await window.app?.ready;
		while (!this.el.isConnected) await frame();
	}

	async next(){
		const token = this.token;
		await this.attached();
		if (this.busy || this.run.done || token !== this.token) return false;
		this.busy = true;
		try {
			const r = await this.run.next();
			this.after(r);
			await frame();
		} finally { this.busy = false; }
		if (this.stepping) debugger;   // ?step: DevTools stops here with this step's view drawn
		return token === this.token;
	}

	async all(){
		const stepping = this.stepping;
		this.stepping = false;   // Run all runs to the end without pausing
		try { while (!this.run.done && await this.next()) await new Promise(r => setTimeout(r, 150)); }
		finally { this.stepping = stepping; }
	}

	// One step has run: its verdict, the lines it wrote as one log group.
	after({ step, ok, error, lines }){
		this.show(this.run.t);
		this.logger.group(`${this.run.at}. ${step.title}`);
		lines.forEach(line => this.logger.log(line));
		this.logger.end();
		this.draw_list();
	}

	// Every object a step left on `t` that no other object holds, drawn once; its view stays live from then on.
	show(t){
		for (const [name, x] of Object.entries(t)){
			if (!(x instanceof Item) || x.parent || this.drawn.has(x)) continue;
			if (!this.drawn.size) this.$objects.empty();
			this.$objects.append(() => div.c("core-test-view-object", () => {
				code.c("core-test-view-name", name);
				this.drawn.set(x, new DefaultView({ subject: x, open: 9 }));   // the default view even when the class has its own (Task.View)
			}));
		}
	}

	// The UI path: press the button labelled `label` (made the first time), whose listener runs `fn`.
	press(label, fn){
		let b = this.buttons.get(label);
		if (!b){
			if (!this.buttons.size) this.$controls.empty();
			this.$controls.append(() => { b = button(label).ac("core-test-view-control"); });
			b.on("click", () => { try { b.result = b.fn(); b.error = null; } catch (e){ b.error = e; } });
			this.buttons.set(label, b);
		}
		b.fn = fn;
		b.el.click();
		DefaultView.flash(b.el);
		if (b.error) throw b.error;
		return b.result;
	}

	// Two objects read the same on screen: their drawn views, as text.
	same(a, b){
		this.show(this.run.t);
		const va = this.drawn.get(a), vb = this.drawn.get(b);
		return !!(va && vb) && text(va.el) === text(vb.el);
	}

	// One line per step: its title and code; the step that just ran also says what it showed, a failed one why.
	draw_list(){
		const at = this.run.at, results = this.run.results, passed = results.filter(r => r.ok).length;
		this.$tally.text(this.run.done
			? `${passed} of ${results.length} steps pass. Node runs the same steps: node ${this.file()}`
			: `${this.steps.length} steps. ${this.stepping ? "Press Next step; with DevTools open, each step stops at a breakpoint." : "Running…"}`);
		this.$list.empty(() => this.steps.forEach((step, i) => {
			const r = results[i];
			li.c([r ? (r.ok ? "is-pass" : "is-fail") : i === at ? "is-next" : "", i === Math.max(at - 1, 0) ? "is-focus" : ""].join(" ").trim(), () => {
				span.c("core-test-view-title", step.title);
				code(step.code);
				if (r && (!r.ok || i === at - 1)) span.c("core-test-view-said", r.ok ? step.note : `✗ ${r.error?.message ?? "the check failed"}`);   // the step that just ran says what it showed
			}).attr("value", i + 1);
		}));
		this.$next.el.disabled = this.$all.el.disabled = this.run.done;
	}

	file(){ return `public/framework/core/${this.name}/${this.name}.steps.test.mjs`; }
}
