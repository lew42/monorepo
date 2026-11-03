import { JSONL } from "/framework/ext/JSONL/JSONL.js";

/** index.jsonl, written by Server/AIIndex.mjs: each line is the whole picture, the last line is now. */
export default class TaskStateLog extends JSONL {
	url = new URL("../index.jsonl", import.meta.url).pathname;
	state = null;
	apply(entry){ if (entry?.in_flight) this.state = entry; }
}
