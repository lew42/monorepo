import { JSONL } from "/framework/ext/JSONL/JSONL.js";

/* The one reader for Server/health.mjs's log, shared by page.js (the full
   page) and devbar.js (the one-line readout) — two small files, one shape.
   Three verbs of its own, none of them TaskJSONL's: a health finding isn't a
   task event, so this extends the bare JSONL, not TaskJSONL. */
export class HealthLog extends JSONL {
	static verbs = [...JSONL.verbs, "error", "warning", "ok"];
	errors = [];
	warnings = [];
	oks = [];
	error(v){ this.errors.push(v); }
	warning(v){ this.warnings.push(v); }
	ok(v){ this.oks.push(v); }
	reset(){ this.errors = []; this.warnings = []; this.oks = []; return super.reset(); }
}

const pad2 = n => String(n).padStart(2, "0");

/** Today's log url, local date (the same file Server/health.mjs is writing right now). */
export function today_url(){
	const d = new Date();
	return `/framework/ai/health/${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}.jsonl`;
}

/** One row per url: whichever of error/warning/ok landed LAST for that url —
    an `ok` after an `error` means that page is clean again. */
export function latest_by_url(log){
	const all = [
		...log.errors.map(e => ({ ...e, verb: "error" })),
		...log.warnings.map(e => ({ ...e, verb: "warning" })),
		...log.oks.map(e => ({ ...e, verb: "ok" })),
	].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
	const by_url = new Map();
	for (const row of all) by_url.set(row.url, row);
	return [...by_url.values()];
}
