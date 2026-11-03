// The binding benchmark: a 1,000-row grid of clones, four ways. Runs in node (fake cells)
// and in a browser (real spans) — measure.mjs drives both. Doc: core/Page/doc/binding.md
import { Property } from "../../../../../../../../core/Property/Property.js";
import { Item } from "../../../../../../../../core/Item/Item.js";

export class Bench {

	static ROWS = 1000;
	static FIELDS = ["unit", "title", "cost", "count", "a", "b", "c", "d", "e", "f"];   // 10 cells a row
	static BOUND = ["unit", "cost", "count"];   // the live ones; "unit" is shared by every row

	// make(): a new cell; text(cell, v): write it; clear(): forget every cell; flush(): force layout.
	constructor({ make, text, clear = () => {}, flush = () => {} }){
		Object.assign(this, { make, text, clear, flush });
	}

	row_data(i){
		const d = {};
		for (const f of Bench.FIELDS) if (f !== "unit") d[f] = `${f}${i}`;
		return d;
	}

	// 1. No binding: rows are Object.create(base); an update redraws every row.
	plain(){
		const base = { unit: "$" }, rows = [];
		let cells = [];
		const draw = () => { this.clear(); cells = rows.map(r => Bench.FIELDS.map(f => { const c = this.make(); this.text(c, r[f]); return c; })); };
		return {
			build: () => { for (let i = 0; i < Bench.ROWS; i++) rows.push(Object.assign(Object.create(base), this.row_data(i))); draw(); },
			update: v => { base.unit = v; draw(); },
			other: v => { base.note = v; draw(); },   // no binding: it can't know nothing shown changed
			listeners: () => 0,
			drop: () => { cells = []; rows.length = 0; this.clear(); },
		};
	}

	// 2. A Property for every cell, eager, plus the shared one.
	every(){
		let base, rows = [], offs = [];
		return {
			build: () => {
				base = new Property.Map().assign({ unit: new Property("$") });
				for (let i = 0; i < Bench.ROWS; i++){
					const d = this.row_data(i);
					for (const k in d) d[k] = new Property(d[k]);
					const row = base.clone(d);
					rows.push(row);
					for (const f of Bench.FIELDS){ const c = this.make(); offs.push(row.prop(f).bind(v => this.text(c, v))); }
				}
			},
			update: v => base.prop("unit").set(v),
			other: v => base.set("note", v),
			listeners: () => base.listeners() + rows.reduce((n, r) => n + listeners_own(r), 0),
			drop: () => { offs.splice(0).forEach(off => off()); rows = []; this.clear(); },
		};
	}

	// 3. Lazy (the slice): plain values, a Property only for the 3 bound fields.
	lazy(){
		let base, rows = [], offs = [];
		return {
			build: () => {
				base = new Property.Map().assign({ unit: "$" });
				for (let i = 0; i < Bench.ROWS; i++){
					const row = base.clone(this.row_data(i));
					rows.push(row);
					for (const f of Bench.FIELDS){
						const c = this.make();
						if (Bench.BOUND.includes(f)) offs.push(row.prop(f).bind(v => this.text(c, v)));
						else this.text(c, row.get(f));
					}
				}
			},
			update: v => base.prop("unit").set(v),
			other: v => base.set("note", v),
			listeners: () => base.listeners() + rows.reduce((n, r) => n + listeners_own(r), 0),
			drop: () => { offs.splice(0).forEach(off => off()); rows = []; this.clear(); },
		};
	}

	// 4. Item's `change`: one Item per row, one listener per row that filters by key,
	//    and every row also listens to the shared base Item.
	item(){
		let base, rows = [], offs = [];
		const listen = (it, fn) => { it.on("change", fn); offs.push(() => it.off("change", fn)); };
		return {
			build: () => {
				base = new Item({ unit: "$" });
				for (let i = 0; i < Bench.ROWS; i++){
					const row = new Item(this.row_data(i));
					rows.push(row);
					const cells = {};
					for (const f of Bench.FIELDS){ const c = cells[f] = this.make(); this.text(c, f === "unit" ? base.get("unit") : row.get(f)); }
					listen(row, (k, v) => { if (Bench.BOUND.includes(k)) this.text(cells[k], v); });
					listen(base, (k, v) => { if (k === "unit") this.text(cells.unit, v); });
				}
			},
			update: v => base.set("unit", v),
			other: v => base.set("note", v),   // wakes all 1,000 row listeners, each filters it out
			listeners: () => [base, ...rows].reduce((n, it) => n + (it._on?.change?.length ?? 0), 0),
			drop: () => { offs.splice(0).forEach(off => off()); rows = []; this.clear(); },
		};
	}

	// Time to create, time to update the shared value, time to change a shared value no cell shows, listener counts, memory before / after.
	// mem(): heap bytes after a full GC.
	async run(name, mem){
		const s = this[name](), now = () => performance.now();
		const m0 = await mem();
		let t = now(); s.build(); this.flush(); const create = now() - t;
		const m1 = await mem();
		const live = s.listeners();
		t = now(); s.update("€"); this.flush(); const update1 = now() - t;
		t = now(); for (let i = 0; i < 20; i++){ s.update(i % 2 ? "$" : "€"); this.flush(); } const update = (now() - t) / 20;
		t = now(); for (let i = 0; i < 20; i++){ s.other(`n${i}`); this.flush(); } const other = (now() - t) / 20;
		s.drop();
		const after = s.listeners();
		const m2 = await mem();
		return { name, create_ms: +create.toFixed(1), update_first_ms: +update1.toFixed(2), update_ms: +update.toFixed(2), unrelated_ms: +other.toFixed(2),
			listeners: live, listeners_after_drop: after, heap_kb_built: Math.round((m1 - m0) / 1024), heap_kb_after_drop: Math.round((m2 - m0) / 1024) };
	}
}

const listeners_own = m => Object.keys(m.props).reduce((n, k) => n + m.props[k].listeners(), 0);

export default Bench;
