// DEPRECATED (2026-10-28): use `item.store` (`Item.Store.for(url)`) for a delta log; the Saver is whole-document storage, not for logs. Guide: /framework/ext/Saver/readme.md. Remove when: the 24 importing files are moved to `item.store` or this class is renamed as the whole-document store.
export default class Saver {

	constructor(...args){ this.assign(...args); }

	assign(...args){ return Object.assign(this, ...args); }

	// One write in flight, one pending. Every save between them collapses into
	// the pending slot, so the last state always wins and a save issued DURING a
	// write lands in the write that follows it.
	save(item){
		this.pending = item;
		if (this.writing) return this.writing;
		return this.writing = this.drain();
	}

	// ⚠ Re-reads `pending` AFTER each await — that recheck is the whole queue.
	async drain(){
		let wrote = false;

		try {
			while (this.pending !== undefined){
				const item = this.pending;
				this.pending = undefined;
				wrote = await this.write(item);
			}
		} catch (error){
			console.warn("Saver: write() rejected — that save is lost, but the queue recovers.", error);
			wrote = false;
		} finally {
			this.writing = null;
		}

		return wrote;
	}

	saving(){ return !!this.writing; }

	load(){ return Promise.resolve(null); }

	write(item){ return Promise.resolve(false); }

	delete(item){ return Promise.resolve(false); }
}

Saver.prototype.writing = null;
Saver.prototype.pending = undefined;
