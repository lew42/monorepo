import { JSONL } from "/framework/ext/JSONL/JSONL.js";

// results/YYYY-MM-DD.jsonl: one line per test run, one file a day (the page sets several instances to share one `rows` map). The latest line per file wins; a merge-base line (it has a sha) is a cache of the base commit, not the file's latest run.
export default class TestResults extends JSONL {
	rows = new Map();
	apply(entry){ if (entry?.file && !entry.sha && !(this.rows.get(entry.file)?.at > entry.at)) this.rows.set(entry.file, entry); }
	reset(){ this.rows = new Map(); return super.reset(); }
	// Failures first, then by file name.
	get sorted(){ return [...this.rows.values()].sort((a, b) => (a.ok - b.ok) || a.file.localeCompare(b.file)); }
}
