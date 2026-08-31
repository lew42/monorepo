import Saver from "./Saver.js";

// ⚠ Node and a sandboxed iframe have no localStorage, and importing this file
// must never throw — every hook no-ops and reports false instead.
// ⚠ `typeof` is not enough. A private-mode browser HAS a localStorage whose every
//    access throws SecurityError, so the name check passes and the next line rejects —
//    which is how DevBar's restore() left an unhandled rejection on every page. The
//    ACCESS is guarded, not the name, and a read that throws reports "nothing saved".
const store = () => { try { return localStorage ?? null; } catch { return null; } };
const item = key => { try { return store()?.getItem(key) ?? null; } catch { return null; } };

export default class LocalStorageSaver extends Saver {

	load(){
		const raw = item(this.key);
		if (!raw) return Promise.resolve(null);

		try {
			return Promise.resolve(JSON.parse(raw));
		} catch (error){
			console.warn(`LocalStorageSaver: "${this.key}" is not JSON — starting fresh.`, error);
			return Promise.resolve(null);
		}
	}

	write(item){
		const local = store();
		if (!local) return Promise.resolve(false);

		try {
			local.setItem(this.key, JSON.stringify(item));
			return Promise.resolve(true);
		} catch (error){
			console.warn(`LocalStorageSaver: "${this.key}" did not save (${error.message}).`, error);
			return Promise.resolve(false);
		}
	}

	delete(){
		try { store()?.removeItem(this.key); }
		catch { return Promise.resolve(false); }
		return Promise.resolve(!!store());
	}
}
