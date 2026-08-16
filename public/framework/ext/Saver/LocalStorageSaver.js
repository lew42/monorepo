import Saver from "./Saver.js";

// ⚠ Node and a sandboxed iframe have no localStorage, and importing this file
// must never throw — every hook no-ops and reports false instead.
const store = () => typeof localStorage === "undefined" ? null : localStorage;

export default class LocalStorageSaver extends Saver {

	load(){
		const raw = store()?.getItem(this.key);
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
		const local = store();
		if (local) local.removeItem(this.key);
		return Promise.resolve(!!local);
	}
}
