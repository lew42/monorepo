import View, { div, span, label, input, option } from "../../core/View/View.js";
import { Property } from "../../core/Property/Property.js";

View.stylesheet(import.meta, "Form.css");

/**
 * Answer: one native control that holds one typed value. The 20 answer types extend it.
 *
 *   const a = new Scale7({ value: -1 });
 *   a.value                                  // -1
 *   a.value = 2;                             // the control follows
 *   a.on("change", (value, answer) => …);    // by the user or by code
 *   a.empty()                                // true when nothing is answered yet
 *
 * A subclass sets `static type / title / shape / native / use / example`, builds its control in
 * render(), and paints this.value into it in sync(). A touch ends in `this.value = …`, so a click,
 * a load() and code all take the same road.
 * ⚠ Options arrive through assign() (`new ChooseOne({ options })`), never class fields: a field
 * would initialise AFTER render() already ran. Defaults live in statics and getters. doc: readme.md
 */
export default class Answer extends View {

	static type = "T00";
	static title = "Answer";
	static shape = "any";
	static native = "";
	static use = "";
	static initial = null;                  // the value before anyone answers
	static example = { label: "A question" };   // what the demo page asks, plus any options
	static seq = 0;

	get prop(){
		if (!this._prop){
			const start = this.constructor.initial;
			this._prop = new Property(Array.isArray(start) ? [...start] : start);
		}
		return this._prop;
	}

	get value(){ return this.prop.get(); }
	set value(v){ this.prop.set(this.coerce(v)); }

	coerce(v){ return v === undefined || v === "" ? null : v; }

	empty(){
		const v = this.value;
		return v === null || (Array.isArray(v) && !v.some(x => x !== null && x !== undefined));
	}

	classify(){
		super.classify();
		this.ac("fm-answer");
	}

	initialize(){
		this.group ??= "fm" + ++Answer.seq;
		super.initialize();
		this.prop.on("change", () => this.sync());
		this.sync();
	}

	on(event, cb){
		if (event !== "change") return super.on(event, cb);
		this.prop.on("change", v => cb.call(this, v, this));
		return this;
	}

	// Paint this.value into the control: a radio or checkbox group, or one native field.
	sync(){
		const v = this.value;
		if (this.inputs){
			this.inputs.forEach((inp, i) => {
				const val = this.pairs[i][0];
				inp.el.checked = this.many ? Array.isArray(v) && v.some(x => this.same(x, val)) : this.same(v, val);
			});
		}
		if (this.field){
			const text = v === null || v === undefined ? "" : String(v);
			if (this.field.el.value !== text) this.field.el.value = text;
		}
	}

	same(a, b){ return a !== null && a !== undefined && String(a) === String(b); }

	// [[value, label], …] from this.options, else the class's static options. Values keep their type.
	get choices(){
		const list = this.options ?? this.constructor.options ?? [];
		return list.map(o => Array.isArray(o) ? o : o && typeof o === "object" ? [o.value, o.label ?? o.value] : [o, o]);
	}

	// A radio group: one label per choice. `cls` is its look (fm-list, fm-seg, fm-chips …).
	one_of(pairs, cls = "fm-list"){
		this.many = false;
		return this.group_of("radio", pairs, cls);
	}

	// A checkbox group: the value is the ticked values, in option order.
	many_of(pairs, cls = "fm-list"){
		this.many = true;
		return this.group_of("checkbox", pairs, cls);
	}

	group_of(kind, pairs, cls){
		this.pairs = pairs;
		this.inputs = [];
		return div.c("fm-group " + cls, () => {
			pairs.forEach(([val, text], i) => {
				label.c("fm-opt", () => {
					const inp = input().attr("type", kind).attr("name", this.group).attr("value", String(val));
					inp.on("change", () => this.touched(i));
					this.inputs.push(inp);
					this.face(val, text, i);
				});
			});
		}).attr("role", kind === "radio" ? "radiogroup" : "group");
	}

	// What one choice looks like inside its label; a subclass overrides it (stars, faces, bars).
	face(val, text){ return span.c("fm-text", text); }

	touched(i){
		if (!this.many){
			if (this.inputs[i].el.checked) this.value = this.pairs[i][0];
			return;
		}
		this.value = this.pairs.filter((_, k) => this.inputs[k].el.checked).map(p => p[0]);
	}

	// One native field (input or textarea) whose text is the value; coerce() types it.
	field_of(view){
		view.ac("fm-field");
		const commit = () => { this.value = view.el.value; };
		view.on("input", commit);
		view.on("change", commit);
		this.field = view;
		return view;
	}

	// A native range with its readout. sync_range() paints it; null means "not touched yet".
	range_of({ min, max, step = 1, ticks = false, fmt = v => String(v) }){
		const id = this.group + "-range";
		this.fmt = fmt;
		this.readout = new View({ tag: "output" }).ac("fm-readout").attr("for", id).text("–");
		this.range = input().ac("fm-range fm-untouched").attr("type", "range").attr("id", id)
			.attr("min", min).attr("max", max).attr("step", step);
		this.range.el.value = (min + max) / 2;   // the browser clamps its own default to a late-set max (3, not 0)
		if (ticks){
			this.range.attr("list", id + "-ticks");
			new View({ tag: "datalist" }).attr("id", id + "-ticks").append(() => {
				for (let v = min; v <= max; v += 1) option().attr("value", v);
			});
		}
		const commit = () => { this.value = Number(this.range.el.value); };
		["input", "change", "pointerup"].forEach(e => this.range.on(e, commit));
		return this.range;
	}

	sync_range(){
		if (!this.range) return;
		const v = this.value, number = typeof v === "number";
		if (number && Number(this.range.el.value) !== v) this.range.el.value = v;
		if (number) this.range.rc("fm-untouched"); else this.range.ac("fm-untouched");
		this.readout.text(number ? this.fmt(v) : v === "skip" ? "skipped" : "–");
	}
}
