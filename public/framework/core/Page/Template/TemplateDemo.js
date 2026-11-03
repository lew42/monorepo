import { div, h2, p, span, button, code } from "../../View/View.js";
import { Property } from "../../Property/Property.js";
import { inspect } from "../../../ux/Content/Object/Inspect.js";
import { BigCard } from "./BigCard/BigCard.js";

// The demo behind /framework/core/Page/Template/: one BigCard, three clones, live numbers.
export class TemplateDemo {

	amount = 0;
	timer = null;

	constructor(){
		this.cost = new Property("$0.00");
		this.card = new BigCard();
		this.A = this.card.clone({});
		this.B = this.card.clone({
			heading: "SPEND", lead: "Cost is one live value; both views and the clone below it follow it.",
			columns: [
				{ ground: "bg-prime", label: "SPENT TODAY", title: this.cost, text: "A Property: only this text updates." },
				{ ground: "bg-white", label: "TASKS", title: "12", text: "A plain value: no listeners at all." },
				{ ground: "bg-dark", label: "MODEL", title: "Sonnet", text: "Static too." },
			],
		});
		this.C = this.B.clone({});
		this.shown = [
			{ name: "A", note: "Palette data, static.", t: this.A, views: 1 },
			{ name: "B", note: "Live cost, rendered twice.", t: this.B, views: 2 },
			{ name: "C", note: "A clone of B that overrides nothing.", t: this.C, views: 1 },
		];
	}

	run(){
		div.c("flex gap v-center wrap", () => {
			button("+ $0.25").on("click", () => this.add(0.25));
			this.tick_button = button("Start tick").on("click", () => this.tick());
			button("override heading on C").on("click", () => { this.C.set("heading", "Only on C"); this.update(); });
			button("unset C heading").on("click", () => { this.C.unset("heading"); this.update(); });
			button("drop one view of B").on("click", () => { this.B.drop(this.B.views.at(-1)); this.update(); });
		});
		this.line = p.c("muted");

		this.shown.forEach(row => {
			h2(`${row.name} — ${row.note}`);
			div.c("wide grid gap auto", () => {
				div.c("flow", () => { for (let i = 0; i < row.views; i++) div.c("card bleed", () => row.t.render()); });
				row.box = div.c("card flow");
			}).style("--column", "28em");
		});
		this.update();
	}

	add(n){
		this.amount += n;
		this.cost.set("$" + this.amount.toFixed(2));
		this.measure();
	}

	tick(){
		this.timer ? (clearInterval(this.timer), this.timer = null) : (this.timer = setInterval(() => this.add(0.01), 1000));
		this.tick_button.text(this.timer ? "Stop tick" : "Start tick");
	}

	measure(){
		const views = this.shown.map(r => `${r.name}: ${r.t.views.length} view${r.t.views.length === 1 ? "" : "s"}`).join(" · ");
		this.line.text(`${views} · listeners on cost: ${this.cost.listeners()}`);
	}

	// Rebuild each inspector from the live instance.
	update(){
		this.measure();
		this.shown.forEach(row => row.box.empty(() => inspect(row.t)));
	}
}

export default TemplateDemo;
