// A small mixin — `on` / `off` / `emit`, nothing else — so ANY class can announce
// its own changes without inheriting a bigger base class. `Events(Object)` is a
// plain emitter; `List` (core/List/List.js) extends `Events(Object)` directly, so
// every List announces its own changes. Listeners live in `this._on`, made lazily,
// so an object that never listens never allocates one.
export const Events = (Base = Object) => class extends Base {

	on(event, fn){
		(this._on ??= {})[event] ??= [];
		this._on[event].push(fn);
		return this;
	}

	off(event, fn){
		if (this._on?.[event]) this._on[event] = this._on[event].filter(listener => listener !== fn);
		return this;
	}

	// Every listener bound HERE hears it first, then it bubbles to `.parent` —
	// unchanged, same event name, same arguments — for as long as `bubbles(event)`
	// says yes. `bubbles()` defaults true; a class overrides it to become a
	// boundary (Page will, for its own tree: a page's events stop at the page).
	emit(event, ...args){
		this._on?.[event]?.slice().forEach(fn => fn.call(this, ...args));
		if (this.bubbles(event)) this.parent?.emit(event, ...args);
		return this;
	}

	bubbles(){ return true; }
};

export default Events;
