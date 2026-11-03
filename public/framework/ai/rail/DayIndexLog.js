import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import Day from "/framework/core/Session/Day.js";

/** DayIndexLog — today's day stream, ai/sessions/YYYY/MM/DD/index.jsonl, written by Server/AIIndexStream.mjs.
 *  One line per task or session that was created or changed that day; `latest` keeps the newest line per id, so a reader patches one row instead of refetching ai/index.json. */
export default class DayIndexLog extends JSONL {
	latest = new Map();   // id -> the newest { id, path, url, title, state, … at } of a task or session
	constructor(day = Day.of()){ super(); this.day = day; this.url = `/framework/ai/sessions/${Day.path(day)}/index.jsonl`; }
	apply(entry){
		for (const kind of ["task", "session"]) if (entry?.[kind]?.id) this.latest.set(entry[kind].id, { ...entry[kind], kind });
	}
}
