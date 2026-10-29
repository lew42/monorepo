import Store from "../Store.js";

// An Item.Store that writes nowhere: each tick's lines are kept in `lines` and handed to `on_lines`.
// Everything else (attach, the nesting of each line, replay through read()) is the real Store.
export default class ScratchStore extends Store {
	lines = [];
	flush(){
		const lines = this._queue.splice(0);
		this._flushing = false;
		this.lines.push(...lines);
		if (lines.length) this.on_lines?.(lines);
	}
}
