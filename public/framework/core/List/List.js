// The plain ordered array wrapper — data only, no events. `LiveList` (same
// directory) is this PLUS announcing every change; reach for a bare List only for
// an ordered collection nothing needs to watch.
export class List {

	constructor(...args){
		this.assign(...args);
		this.items ??= [];
	}

	assign(...args){ return Object.assign(this, ...args); }

	get length(){ return this.items.length; }

	[Symbol.iterator](){ return this.items[Symbol.iterator](); }

	forEach(fn){ this.items.forEach(fn); return this; }
	map(fn){ return this.items.map(fn); }
	at(i){ return this.items.at(i); }

	// Back-compat aliases for the pre-rename names (`each`, `.children`) — several
	// callers outside this task's fence (ext/Panel/workspace.js, focus.js, random.js,
	// insert.js) still use them; renaming them too is out of fence here.
	each(fn){ return this.forEach(fn); }
	get children(){ return this.items; }

	// The owner is the Item that holds this list, so a child's parent is that Item
	// and never the list itself — the backref stays one hop, and walking up for a
	// saver or a root never has to step over a collection. A list with no owner (one
	// built standalone, not as a named property of an Item) parents to itself.
	adopt(child){
		child.parent = this.owner ?? this;
		return child;
	}

	append(child){
		this.adopt(child);
		this.items.push(child);
		return this;
	}

	// `ref` null, or absent from this list, appends — a position, never an index.
	insert_before(child, ref = null){
		this.adopt(child);
		const i = ref ? this.items.indexOf(ref) : -1;
		i === -1 ? this.items.push(child) : this.items.splice(i, 0, child);
		return this;
	}

	// First occurrence only: duplicates in one list are normal and each is its own node.
	remove(child){
		const i = this.items.indexOf(child);
		if (i === -1) return this;

		this.items.splice(i, 1);
		if (child.parent === (this.owner ?? this)) delete child.parent;
		return this;
	}

	find(fn){ return this.items.find(fn); }
	index_of(child){ return this.items.indexOf(child); }

	toJSON(){ return [...this.items]; }
}

export default List;
