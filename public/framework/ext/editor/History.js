/* Undo, app-level — not the tree's business (council ruling 11). Snapshots are
   whole documents, and `read()` / `restore()` belong to the editor because a restore
   REPLACES every node: `Item.hydrate` returns a new tree, so only the editor can
   move the saver, the listeners, the canvas and the selection onto it.

   History never saves, and `save()` never touches history. */
export default class History {

	constructor(...args){
		this.assign(...args);
		this.past = [];
		this.future = [];
	}

	assign(...args){ return Object.assign(this, ...args); }

	// ⚠ Push BEFORE `fn` runs — the snapshot is the state undo goes back TO. A new
	// act clears redo: you cannot redo a future that no longer follows from here.
	act(fn){
		this.past.push(this.read());
		this.future.length = 0;
		fn();
		return this;
	}

	undo(){ return this.step(this.past, this.future); }
	redo(){ return this.step(this.future, this.past); }

	// One direction, twice: pop the stack we came from, push the present onto the
	// other. `false` means there was nothing there.
	step(from, to){
		if (!from.length) return false;
		to.push(this.read());
		this.restore(from.pop());
		return true;
	}

	can_undo(){ return this.past.length > 0; }
	can_redo(){ return this.future.length > 0; }

	// Defaults, so a History with no editor behind it is inert rather than broken.
	read(){ return null; }
	restore(snapshot){}
}

export { History };
