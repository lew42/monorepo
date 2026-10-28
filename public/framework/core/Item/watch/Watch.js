import View, { div, h3, p, ol, li, code, button } from "../../View/View.js";
import { view } from "../../../ux/Content/Object/DefaultView.js";
import Logger from "../../Page/card/log/Logger.js";
import LogView from "../../Page/card/log/LogView.js";
import Box from "./Box.js";
import ScratchStore from "./ScratchStore.js";

View.stylesheet(import.meta, "watch.css");

/**
 * class Watch extends View — the "watch a tree being built" demo. Three columns: the steps (one line of code
 * each), the default view of every object, live (ux/Content/Object/DefaultView.js), and every line the store
 * wrote, one group per step (core/Page/card/log). Nothing touches a file: a ScratchStore keeps its lines.
 *
 *   new Watch()
 *
 * Next runs one more step on the live objects, so you see only what that step changed. Back and Start over
 * rebuild from step 1, because a step cannot be undone.
 */
export default class Watch extends View {

	// One line per step: the code it runs, and what to notice once it has.
	static steps = [
		{ code: `const root = new Box({ id: "root", title: "Shopping" })`, note: "Making an object writes no line. Only changes are lines.",
			run: w => { w.root = new Box({ id: "root", title: "Shopping" }); w.store.attach(w.root); w.$root.empty(() => view(w.root, { open: 9 })); } },
		{ code: `root.items.add({ id: "fruit", title: "Fruit" })`, note: "A List verb is one line, under the list's name. The root's count goes to 1.",
			run: w => { w.fruit = w.root.items.add({ id: "fruit", title: "Fruit" }); } },
		{ code: `fruit.items.add({ id: "apple", title: "Apple", count: 1 })`, note: "Two levels down: the line nests one hop per level, fruit then items.",
			run: w => { w.apple = w.fruit.items.add({ id: "apple", title: "Apple", count: 1 }); } },
		{ code: `view(apple)   // in a second place`, note: "One object, two views: apple.views.length is now 2. Drawing writes no line.",
			run: w => w.$second.empty(() => { p.c("muted", "apple, drawn a second time:"); view(w.apple, { open: 1 }); }) },
		{ code: `apple.set({ count: 3 })`, note: "Both views of apple change, and only the count row redraws.",
			run: w => { w.apple.set({ count: 3 }); } },
		{ code: `root.set({ title: "Weekly shop" })`, note: "A field on the root itself is a flat line, with no nesting.",
			run: w => { w.root.set({ title: "Weekly shop" }); } },
		{ code: `root.items.add({ id: "bread", title: "Bread" })`, note: "A second member: it lands after fruit.",
			run: w => { w.root.items.add({ id: "bread", title: "Bread" }); } },
		{ code: `root.items.move("bread", { after: null })`, note: "A move is a line too: bread goes first, and only its row moves.",
			run: w => { w.root.items.move("bread", { after: null }); } },
		{ code: `const copy = new Box({ id: "root" }); lines.forEach(line => copy.set(line))`, note: "A fresh object, built only from the lines, one at a time.",
			run: w => w.replay() },
	];

	render(){
		this.ac("core-item-watch");
		div.c("core-item-watch-steps flex v gap", () => {
			div.c("flex wrap gap", () => {
				this.$next = button("Next step").on("click", () => this.next());
				button("Back").on("click", () => this.go(Math.max(0, this.at - 1)));
				button("Run all").on("click", () => this.go(Watch.steps.length));
				button("Start over").on("click", () => this.go(0));
			});
			this.$note = p.c("core-item-watch-note");
			this.$list = ol.c("core-item-watch-list");
		});
		div.c("core-item-watch-objects flex v gap", () => {
			h3("The objects, live");
			this.$root = div();
			this.$second = div();
			this.$copy = div();
		});
		div.c("core-item-watch-lines flex v gap", () => {
			h3("Lines written");
			this.$log = div();
		});
		this.go(0);
	}

	// A fresh start, then steps 1 to n. A newer go() stops an older one between steps.
	async go(n){
		const run = this.run = (this.run ?? 0) + 1;
		this.reset();
		for (let i = 0; i < n && this.run === run; i++) await this.step(i);
	}

	async next(){
		if (this.busy || this.at >= Watch.steps.length) return;
		await this.step(this.at);
	}

	reset(){
		this.at = 0;
		this.root = this.fruit = this.apple = this.copy = null;
		this.logger = new Logger();
		this.store = new ScratchStore({ url: "scratch.jsonl" });
		this.pending = [];
		this.store.on_lines = lines => this.pending.push(...lines);
		this.$root.empty(); this.$second.empty(); this.$copy.empty();
		this.$log.empty(() => new LogView({ logger: this.logger }));
		this.$note.text("Press Next step. Each step runs one line of code.");
		this.draw_list();
	}

	// Run one step, wait the one microtask the store takes to flush, and log what it wrote as one group.
	async step(i){
		const one = Watch.steps[i];
		this.busy = true;
		try { await one.run(this); await null; } finally { this.busy = false; }
		this.logger.group(`${i + 1}. ${one.code.split("//")[0].trim()}`);
		if (this.pending.length) this.pending.splice(0).forEach(line => this.logger.log(line));
		else this.logger.note("muted", "no line written");
		this.logger.end();
		this.at = i + 1;
		this.$note.text(one.note);
		this.draw_list();
	}

	// The copy replays the root's lines one by one, slowly enough to watch, then is compared with the root.
	async replay(){
		const copy = this.copy = new Box({ id: "root" });
		const lines = [...this.store.lines];
		let $same;
		this.$copy.empty(() => {
			p.c("muted", "The copy, replayed from the lines:");
			view(copy, { open: 9 });
			$same = p.c("core-item-watch-same", "…");
		});
		for (const line of lines){ copy.set(line); await new Promise(r => setTimeout(r, 250)); }
		const same = JSON.stringify(copy) === JSON.stringify(this.root);
		$same.text(same ? `✓ The same tree: ${lines.length} lines rebuilt it.` : "✗ Not the same tree: the lines lost something.");
	}

	draw_list(){
		this.$list.empty(() => Watch.steps.forEach((one, i) => {
			const focus = i === Math.min(this.at, Watch.steps.length - 1) ? " is-focus" : "";   // the one a phone shows
			li.c((i < this.at ? "is-done" : i === this.at ? "is-next" : "") + focus, () => code(one.code)).attr("value", i + 1);
		}));
		this.$next.el.disabled = this.at >= Watch.steps.length;
	}
}
