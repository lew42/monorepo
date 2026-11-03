import { Events } from "../Events/Events.js";

// One live value. Design and decisions: ../Page/doc/templates.md
export class Property extends Events(Object) {

	constructor(value){
		super();
		this._value = value;
	}

	get value(){ return this._value; }
	set value(v){ this.set(v); }

	get(){ return this._value; }

	set(v){
		const old = this._value;
		if (Object.is(old, v)) return this;
		this._value = v;
		this.emit("change", v, old);
		return this;
	}

	// Calls fn(current) now and on every change; returns the unbind.
	bind(fn){
		const listener = value => fn(value);
		this.on("change", listener);
		fn(this._value);
		return () => this.off("change", listener);
	}

	listeners(){ return this._on?.change?.length ?? 0; }

	bubbles(){ return false; }

	static is(x){ return x instanceof Property; }
}

const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* Two fallthrough maps, `data` (plain values) and `props` (live Property objects),
   each Object.create of the layer below. DOM-free. A value lives in exactly one of
   the two on a layer. Rules: ../Page/doc/templates.md */
Property.Map = class PropertyMap {

	constructor(parent){
		this.parent = parent ?? null;
		this.data = Object.create(parent ? parent.data : null);
		this.props = Object.create(parent ? parent.props : null);
	}

	// Fill this layer from an object; a Property value is kept as the live one.
	assign(obj = {}){
		for (const [name, value] of Object.entries(obj)){
			if (Property.is(value)) this.props[name] = value;
			else { delete this.props[name]; this.data[name] = value; }
		}
		return this;
	}

	// The layer that owns `name` (has it as a plain value or a Property), or null.
	owner(name){
		for (let m = this; m; m = m.parent) if (own(m.props, name) || own(m.data, name)) return m;
		return null;
	}

	has(name){ return !!this.owner(name); }
	has_own(name){ return own(this.props, name) || own(this.data, name); }

	get(name){
		const m = this.owner(name);
		return !m ? undefined : own(m.props, name) ? m.props[name].get() : m.data[name];
	}

	// Creates the Property on first ask, on the layer that owns the value.
	prop(name){
		const m = this.owner(name);
		if (!m) return undefined;
		if (!own(m.props, name)){
			m.props[name] = new Property(m.data[name]);
			delete m.data[name];
		}
		return m.props[name];
	}

	// Returns "prop" (a bound value changed itself), "rebind" (an inherited Property was
	// overridden here: the owner must redraw), or "plain" (an unbound write: redraw too).
	set(name, value){
		if (own(this.props, name)){ this.props[name].set(value); return "prop"; }
		if (own(this.data, name)){ this.data[name] = value; return "plain"; }
		const m = this.owner(name);
		if (m && own(m.props, name)){ this.props[name] = new Property(value); return "rebind"; }
		this.data[name] = value;
		return "plain";
	}

	// Delete this layer's own value; reads now fall back to the layer below.
	unset(name){
		const had = this.has_own(name);
		delete this.props[name];
		delete this.data[name];
		return had;
	}

	clone(data){ return new this.constructor(this).assign(data); }

	// A hard copy: every value it can see, as plain values on one unlinked layer.
	copy(data){ return new this.constructor().assign({ ...this.values(), ...data }); }

	// Every name visible here, own or inherited.
	keys(){
		const names = new Set();
		for (let m = this; m; m = m.parent) for (const k of [...Object.keys(m.data), ...Object.keys(m.props)]) names.add(k);
		return [...names];
	}

	values(){ return Object.fromEntries(this.keys().map(k => [k, this.get(k)])); }

	// The names this layer overrides; a prefix narrows it to one section ("columns.0.").
	overrides(prefix = ""){
		return [...Object.keys(this.data), ...Object.keys(this.props)].filter(k => k.startsWith(prefix));
	}

	// Count every listener on every Property this layer can see.
	listeners(name){
		let n = 0;
		for (let m = this; m; m = m.parent)
			for (const k of Object.keys(m.props)) if (!name || k === name) n += m.props[k].listeners();
		return n;
	}
};

/* One key of an Item, live: reads follow the Item, `set` writes through `item.set` (so the Item still saves its delta).
   It listens to the Item only while it has listeners of its own: the first `on` subscribes, the last `off` unsubscribes.
   Any object with get / set / on / off / emit("change", key, value, old) works. Design: ../Page/doc/binding.md (section 4).
   Watch out: an Item's change bubbles from its children, so a child's change of the same key is heard too. */
Property.Of = class ItemProperty extends Property {

	constructor(item, name){
		super();
		this.item = item;
		this.name = name;
	}

	get _value(){ return this.item.get(this.name); }   // the base class reads _value: bind() and value
	set _value(v){}   // the base constructor assigns it; the Item owns the value
	get(){ return this._value; }
	get value(){ return this.get(); }
	set value(v){ this.set(v); }

	set(v){ this.item.set(this.name, v); return this; }

	on(event, fn){
		super.on(event, fn);
		if (event === "change" && !this._hear) this.item.on("change", this._hear = (key, value, old) => { if (key === this.name) this.emit("change", value, old); });
		return this;
	}

	off(event, fn){
		super.off(event, fn);
		if (this._hear && !this.listeners()){ this.item.off("change", this._hear); this._hear = null; }
		return this;
	}
};

Property.of = (item, name) => new Property.Of(item, name);

export default Property;
