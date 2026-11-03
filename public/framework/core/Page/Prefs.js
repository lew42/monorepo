export default class PagePrefs {

	// Fallback store when localStorage will not take a save (private mode, full quota): memory for the session. (doc/method/prefs.md)
	static memory = new Map();
	static warned = false;

	// ⚠ ONCE a session, not once a write: a run saves on every move, and a console
	//   filling with the same line is a console nobody reads.
	static warn(key, error){
		if (this.warned) return;
		this.warned = true;
		console.warn(`prefs(${key}) — localStorage is unavailable (${error.name}); this session is kept in memory only.`);
	}

	// The app's own namespace: one origin serves /notes/, /imagine/ and every demo,
	// so an unprefixed url is a collision waiting for the next site on this domain.
	prefix = "lew42:";

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// `id` is the seam for a caller that is not a page; `store_key` for a page that MOVED. (doc/decisions.md)
	key(){ return this.prefix + (this.id ?? this.page.store_key ?? this.page.url); }

	// The guarded pair (read_raw/write_raw/clear_raw): one JSON value under one key, never throwing. (doc/method/prefs.md)
	static read_raw(key){
		try { return JSON.parse(localStorage.getItem(key) ?? "null"); }
		catch { return undefined; }   // JSON.parse never legitimately yields undefined
	}

	static write_raw(key, value){
		try { localStorage.setItem(key, JSON.stringify(value)); return true; }
		catch (error){ this.warn(key, error); return false; }
	}

	static clear_raw(key){
		try { localStorage.removeItem(key); return true; }
		catch { return false; }
	}

	// null when nothing is saved OR the saved value is corrupt — `get()` decides
	// what that means, because only the caller knows its defaults.
	read(){
		const value = PagePrefs.read_raw(this.key());
		return value === undefined ? PagePrefs.memory.get(this.key()) ?? null : value;
	}

	get(fallback = {}){ return { ...fallback, ...(this.read() ?? {}) }; }

	// Always "succeeds" from the caller's own point of view — write_raw's own
	// return is ignored here on purpose, the same silent-degrade Page.Prefs has
	// always promised (see the comment above `memory`).
	set(data){
		PagePrefs.memory.set(this.key(), data);
		PagePrefs.write_raw(this.key(), data);
		return data;
	}

	// The call every page actually makes: change one field, keep the rest.
	patch(part, fallback){ return this.set({ ...this.get(fallback), ...part }); }

	clear(){
		PagePrefs.memory.delete(this.key());
		PagePrefs.clear_raw(this.key());
	}
}
