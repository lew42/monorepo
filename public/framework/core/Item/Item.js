import List from "../List/List.js";

export class Item {

	constructor(...args){
		this.assign(...args);
		this.data = is_data(this.data) ? this.data : {};
		this.id ??= crypto.randomUUID();
		this._on = {};

		const kids = Array.isArray(this.items) ? this.items : [];
		this.items = new List({ owner: this });
		kids.forEach(kid => this.items.append(kid));
	}

	assign(...args){ return Object.assign(this, ...args); }
	get(key){ return this.data[key]; }

	set(key, value){
		const old = this.data[key];
		if (old === value) return this;
		this.data[key] = value;
		return this.emit("change", key, value, old);
	}

	add(...kids){ kids.forEach(kid => this.items.append(kid)); return this; }

	// No argument removes ME from my parent — the verb reads the same from either end.
	remove(kid){ kid ? this.items.remove(kid) : this.parent?.items.remove(this); return this; }

	// The one mutation verb: reorder AND reparent, node-relative. `before` null appends.
	move(parent, before = null){
		this.parent?.items.remove(this);
		parent.items.insert_before(this, before);
		return this;
	}

	root(){ let item = this; while (item.parent) item = item.parent; return item; }
	walk(fn){ fn(this); this.items.each(kid => kid.walk(fn)); return this; }
	find(id){ let hit; this.walk(item => { hit ??= item.id === id ? item : undefined; }); return hit; }

	// Strict descendants — `contains(this)` is false, so `drop_check` still needs `target !== this`.
	contains(item){ for (let up = item?.parent; up; up = up.parent) if (up === this) return true; return false; }

	on(event, fn){ (this._on[event] ??= []).push(fn); return this; }
	off(event, fn){ this._on[event] = (this._on[event] ?? []).filter(l => l !== fn); return this; }

	emit(event, ...args){
		this._on[event]?.slice().forEach(fn => fn(...args));
		this.parent?.emit(event, ...args);
		return this;
	}

	// A child asking to save persists its DOCUMENT — delegation up, never a partial write.
	save(){ return this.saver ? this.saver.save(this) : this.parent ? this.parent.save() : Promise.resolve(false); }
	delete(){ return this.saver ? this.saver.delete(this) : this.parent ? this.parent.delete() : Promise.resolve(false); }

	// Instance properties (parent, saver, _on) are never emitted — a backref is
	// impossible by construction, and restored by adoption during hydrate.
	toJSON(){
		const json = { type: this.wire(), id: this.id, data: this.data };
		if (this.items.length) json.items = this.items.toJSON();
		return json;
	}

	wire(){ return this.type ?? Item.names.get(this.constructor) ?? this.constructor.name; }

	// Tolerant of every malformed input: warn, keep the node, never throw.
	static hydrate(json, seen = new Set()){
		const raw = json && typeof json === "object" ? json : {};
		if (raw !== json) warn(`expected an object, got ${typeof json}`);

		const Class = raw.type ? Item.types.get(raw.type) : Item;
		if (raw.type && !Class) warn(`unknown type "${raw.type}" — preserved as Item`, raw.type);
		if (raw.data !== undefined && !is_data(raw.data)) warn(`data must be an object`);
		if (raw.items !== undefined && !Array.isArray(raw.items)) warn(`items must be an array`);

		let id = raw.id;
		if (id && seen.has(id)){
			warn(`duplicate id "${id}" — assigned a fresh one`);
			id = undefined;
		}
		if (id) seen.add(id);

		const item = new (Class ?? Item)({ id, data: raw.data, type: Class ? undefined : raw.type });
		(Array.isArray(raw.items) ? raw.items : []).forEach(kid => item.items.append(Item.hydrate(kid, seen)));
		return item;
	}

	// ⚠ `names` is an inverse index rather than a static on the class: a static is
	// INHERITED, so an unregistered subclass would silently wear its parent's wire name.
	static register(Class, name = Class.name){
		Item.types.set(name, Class);
		Item.names.set(Class, name);
		return Class;
	}

	static async open(saver){
		const json = await saver.load();
		return Item.hydrate(json ?? {}).assign({ saver });
	}
}

const is_data = value => !!value && typeof value === "object" && !Array.isArray(value);

const warn = (message, key = message) => {
	if (Item.warned.has(key)) return;
	Item.warned.add(key);
	console.warn(`Item.hydrate — ${message}`);
};

Item.types = new Map();
Item.names = new Map();
Item.warned = new Set();

export default Item;

Item.register(Item);
