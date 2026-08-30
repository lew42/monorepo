/* Path-based storage — the page's own url IS the id.

   LOCAL to /imagine/ on purpose: this is a prototype of a core seam, not the seam.
   The shape it proposes is `page.store()`, and every call site below reads as if it
   already existed. See /imagine/readme.md for the proposal.

   Why the url: production is static, so there is no server to hand out ids. A page
   already has one thing that is unique, stable and human-readable — its address —
   and `page.url` is derived by core (`naming()`), so it cannot drift out of step
   with the tree the way a hand-typed `id: "team-board"` would.

   ⚠ localStorage throws whole (private mode, quota, a blocked third-party frame),
   and a UI that loses its buttons because a save failed is worse than one that
   forgets. Every call is wrapped and falls back to `memory`, so the page keeps
   working for the session and only the persistence is lost. */

const memory = new Map();

export class Store {

	prefix = "lew42:";

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// The whole idea, in one line.
	key(){ return this.prefix + this.page.url; }

	// null when nothing is saved OR the saved value is corrupt — `get()` decides
	// what that means, because only the caller knows its defaults.
	read(){
		try { return JSON.parse(localStorage.getItem(this.key()) ?? "null"); }
		catch { return memory.get(this.key()) ?? null; }
	}

	get(fallback = {}){ return { ...fallback, ...(this.read() ?? {}) }; }

	set(data){
		memory.set(this.key(), data);
		try { localStorage.setItem(this.key(), JSON.stringify(data)); }
		catch (error){ console.warn(`store(${this.page.url}) — kept in memory only:`, error.name); }
		return data;
	}

	// The call every page actually makes: change one field, keep the rest.
	patch(part, fallback){ return this.set({ ...this.get(fallback), ...part }); }

	clear(){
		memory.delete(this.key());
		try { localStorage.removeItem(this.key()); } catch { /* already gone */ }
	}
}

// `store(this)` at the call site — one word, and the page never types its own url.
export const store = page => new Store({ page });

export default store;
