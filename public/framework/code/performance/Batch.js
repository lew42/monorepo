// Coalesce many changes into one paint: queue by key (last value wins), flush once per frame. Doc: doc/batching.md
export default class Batch {
	queue = new Map();   // key -> function that applies the latest value
	pending = false;

	// Batch.set(cell, () => cell.textContent = text): calling again for the same cell replaces the earlier write.
	set(key, apply){
		this.queue.set(key, apply);
		if (!this.pending){
			this.pending = true;
			requestAnimationFrame(() => this.flush());
		}
	}

	// Writes only, no layout reads in between: the browser lays out once, after the loop.
	flush(){
		const q = this.queue;
		this.queue = new Map();
		this.pending = false;
		q.forEach(apply => apply());
	}

	static shared = new Batch();
	static set(key, apply){ Batch.shared.set(key, apply); }
}
