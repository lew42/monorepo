// The shim: a Map-shaped view over `page.pages`; `instanceof Map` stays true. (doc/decisions.md)
// DEPRECATED (2026-10-28): use `page.pages` (a List; `pages.find(name)` returns the stub object where `children.get` returned null). Guide: /framework/core/Page/doc/migration-children-to-pages.md. Remove when: the census (node Server/Deprecated.mjs) shows 0 live `page.children` callers and the docs teach `page.pages`.
export default class PageChildren extends Map {

	constructor(page){ super(); this.page = page; }

	get pages(){ return this.page.pages; }

	// The page, `null` for a stub (declared but not yet loaded), `undefined` if the
	// name is absent altogether.
	get(name){
		const found = this.pages.find(name);
		return found === undefined ? undefined : found.stub ? null : found;
	}

	has(name){ return this.pages.find(name) !== undefined; }

	// `null` adds a stub (quietly — declaring a child is not a live edit); a real
	// page quietly inserts, or quietly REPLACES the stub that already held this name
	// (`List.replace`, which never announces: loading is not a change).
	set(name, value){
		const had = this.pages.find(name);

		if (value === null){
			if (!had) this.put({ id: name, name, stub: true });
			return this;
		}

		had ? this.pages.replace(had, value) : this.put(value);
		return this;
	}

	// put() skips List.insert()'s owner-property guard (a child may share a config key's name). (doc/decisions.md)
	put(x){
		const pages = this.pages, made = pages.make(x);
		pages.insert_before(made, null);
		pages.adopted(made);
		return made;
	}

	// Quiet — a Map never announced either. `release()` is List's quiet remove
	// (core/List/List.js), the counterpart to `remove()`'s announcing one.
	delete(name){
		const had = this.pages.find(name);
		if (!had) return false;
		this.pages.release(had);
		return true;
	}

	get size(){ return this.pages.length; }

	// Returns undefined, like Map.forEach: a View capture `() => x.children.forEach(…)` renders its return value.
	forEach(fn, thisArg){ this.pages.forEach(page => fn.call(thisArg, page.stub ? null : page, page.id, this)); }
	keys(){ return this.pages.map(page => page.id)[Symbol.iterator](); }
	values(){ return this.pages.map(page => page.stub ? null : page)[Symbol.iterator](); }
	entries(){ return this.pages.map(page => [page.id, page.stub ? null : page])[Symbol.iterator](); }
	[Symbol.iterator](){ return this.entries(); }

	clear(){ [...this.pages].forEach(page => this.pages.release(page)); }
}
