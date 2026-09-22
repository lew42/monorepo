import Saver from "./Saver.js";
import { Page } from "../../core/Page/Page.class.js";

/* The guarded touch (never throws — not in Node, not in a sandboxed iframe,
   not in private mode) is `Page.Store`'s now (core/Page/Page.class.js,
   `read_raw`/`write_raw`/`clear_raw`) — merged 2026-09-18, doc/decisions.md.
   This class stays: `ext/Ask`'s `edit()` and every real Saver backend need
   the Saver shape (`load()`/`write()`/`delete()` on one `key`, `write()`
   reporting true success or failure) that `Page.Store`'s own always-degrade-
   silently contract does not give them. */
export default class LocalStorageSaver extends Saver {

	load(){
		const value = Page.Store.read_raw(this.key);
		return Promise.resolve(value === undefined ? null : value);
	}

	write(item){
		return Promise.resolve(Page.Store.write_raw(this.key, item));
	}

	delete(){
		return Promise.resolve(Page.Store.clear_raw(this.key));
	}
}
