export class List {

	constructor(...args){
		this.assign(...args);
		this.children ??= [];
	}

	assign(...args){ return Object.assign(this, ...args); }

	get length(){ return this.children.length; }

	[Symbol.iterator](){ return this.children[Symbol.iterator](); }

	// The owner is the Item that holds this list, so a child's parent is that Item
	// and never the list — the backref stays one hop, and saver lookup walks Items.
	adopt(child){
		child.parent = this.owner ?? this;
		return child;
	}

	append(child){
		this.adopt(child);
		this.children.push(child);
		return this.notify("add", child);
	}

	// `ref` null, or absent from this list, appends — a position, never an index.
	insert_before(child, ref = null){
		this.adopt(child);
		const i = ref ? this.children.indexOf(ref) : -1;
		i === -1 ? this.children.push(child) : this.children.splice(i, 0, child);
		return this.notify("add", child);
	}

	// First occurrence only: duplicates in one list are normal and each is its own node.
	remove(child){
		const i = this.children.indexOf(child);
		if (i === -1) return this;

		this.children.splice(i, 1);
		if (child.parent === (this.owner ?? this)) delete child.parent;
		return this.notify("remove", child);
	}

	notify(event, child){
		this.owner?.emit?.(event, child);
		return this;
	}

	each(fn){ this.children.forEach(fn); return this; }
	find(fn){ return this.children.find(fn); }
	index_of(child){ return this.children.indexOf(child); }

	toJSON(){ return [...this.children]; }
}

export default List;
